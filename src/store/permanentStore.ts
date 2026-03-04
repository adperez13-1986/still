import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { PermanentState, WorkshopUpgradeId, RunHistoryEntry } from '../game/types'
import { savePermanent, loadPermanent } from '../game/persistence'

const PERMANENT_KEY = 'permanent-state'

const FRAGMENT_RATE_PER_HOUR = 10
const MAX_FRAGMENT_HOURS = 8

const defaultPermanent: PermanentState = {
  totalShards: 0,
  fragmentsAccumulated: 0,
  lastSeenTimestamp: Date.now(),
  workshopUpgrades: {
    'reinforced-chassis': false,
    'practiced-routine': false,
    'sharp-eye': false,
    'fragment-cap': false,
    'starting-slot': false,
  },
  runHistory: [],
  companionsUnlocked: [],
  nameEverDiscovered: false,
}

interface PermanentActions {
  load: () => Promise<void>
  save: () => Promise<void>
  addShards: (amount: number) => void
  spendShards: (amount: number) => boolean
  purchaseUpgrade: (id: WorkshopUpgradeId) => boolean
  addRunHistory: (entry: RunHistoryEntry) => void
  unlockCompanion: (id: string) => void
  setNameDiscovered: () => void
  collectFragments: () => void
  spendFragments: (amount: number) => boolean
}

export const usePermanentStore = create<PermanentState & PermanentActions>()(
  immer((set, get) => ({
    ...defaultPermanent,

    load: async () => {
      const saved = await loadPermanent<PermanentState>(PERMANENT_KEY)
      if (!saved) return

      set((state) => {
        Object.assign(state, saved)
        // Calculate offline fragment generation.
        // Use the localStorage timestamp if it's newer than what IndexedDB has —
        // the async IndexedDB write on beforeunload may not have completed, but
        // the synchronous localStorage write always does.
        const now = Date.now()
        const lsTimestamp = Number(localStorage.getItem('still-last-seen') ?? 0)
        const lastSeen = Math.max(saved.lastSeenTimestamp, lsTimestamp)
        const elapsedMs = now - lastSeen
        const elapsedHours = elapsedMs / (1000 * 60 * 60)
        const capHours = saved.workshopUpgrades['fragment-cap'] ? MAX_FRAGMENT_HOURS * 1.5 : MAX_FRAGMENT_HOURS
        const earned = Math.floor(Math.min(elapsedHours, capHours) * FRAGMENT_RATE_PER_HOUR)
        state.fragmentsAccumulated = Math.min(
          saved.fragmentsAccumulated + earned,
          Math.floor(capHours * FRAGMENT_RATE_PER_HOUR)
        )
        state.lastSeenTimestamp = now
      })
    },

    save: async () => {
      const state = get()
      const toSave: PermanentState = {
        totalShards: state.totalShards,
        fragmentsAccumulated: state.fragmentsAccumulated,
        lastSeenTimestamp: Date.now(),
        workshopUpgrades: { ...state.workshopUpgrades },
        runHistory: state.runHistory.slice(-20),
        companionsUnlocked: [...state.companionsUnlocked],
        nameEverDiscovered: state.nameEverDiscovered,
      }
      await savePermanent(PERMANENT_KEY, toSave)
    },

    addShards: (amount) =>
      set((state) => {
        state.totalShards += amount
      }),

    spendShards: (amount) => {
      if (get().totalShards < amount) return false
      set((state) => {
        state.totalShards -= amount
      })
      return true
    },

    purchaseUpgrade: (id) => {
      const state = get()
      const upgradeCosts: Record<WorkshopUpgradeId, number> = {
        'reinforced-chassis': 50,
        'practiced-routine': 75,
        'sharp-eye': 40,
        'fragment-cap': 60,
        'starting-slot': 100,
      }
      const cost = upgradeCosts[id]
      if (state.workshopUpgrades[id] || state.totalShards < cost) return false
      set((s) => {
        s.totalShards -= cost
        s.workshopUpgrades[id] = true
      })
      return true
    },

    addRunHistory: (entry) =>
      set((state) => {
        state.runHistory.unshift(entry)
        if (state.runHistory.length > 20) state.runHistory.pop()
      }),

    unlockCompanion: (id) =>
      set((state) => {
        if (!state.companionsUnlocked.includes(id)) {
          state.companionsUnlocked.push(id)
        }
      }),

    setNameDiscovered: () =>
      set((state) => {
        state.nameEverDiscovered = true
      }),

    collectFragments: () => {
      // No-op: fragments are calculated on load from elapsed time
    },

    spendFragments: (amount) => {
      if (get().fragmentsAccumulated < amount) return false
      set((state) => {
        state.fragmentsAccumulated -= amount
      })
      return true
    },
  }))
)
