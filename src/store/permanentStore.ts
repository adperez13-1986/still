import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { PermanentState, WorkshopUpgradeId, RunHistoryEntry, PartArchiveEntry } from '../game/types'
import { savePermanent, loadPermanent } from '../game/persistence'

const PERMANENT_KEY = 'permanent-state'

export const defaultPermanent: PermanentState = {
  totalShards: 0,
  workshopUpgrades: {
    'practiced-routine': false,
    'sharp-eye': false,
  },
  runHistory: [],
  companionsUnlocked: [],
  nameEverDiscovered: false,
  partArchive: {},
  selectedArchivePart: null,
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
  addToArchive: (partId: string, sector: 1 | 2) => void
  selectArchivePart: (partId: string | null) => void
  triggerCooldown: (partId: string) => void
  decrementAllCooldowns: () => void
  importState: (state: PermanentState) => Promise<void>
}

export const usePermanentStore = create<PermanentState & PermanentActions>()(
  immer((set, get) => ({
    ...defaultPermanent,

    load: async () => {
      const saved = await loadPermanent<any>(PERMANENT_KEY)
      if (!saved) return

      set((state) => {
        // Migrate: remove fragment fields, add archive fields
        const { fragmentsAccumulated, lastSeenTimestamp, carriedPart, ...rest } = saved
        Object.assign(state, rest)

        // Ensure archive exists
        if (!state.partArchive) state.partArchive = {}
        if (state.selectedArchivePart === undefined) state.selectedArchivePart = null

        // Migrate legacy carriedPart → first archive entry
        if (carriedPart) {
          const partId = typeof carriedPart === 'object' ? (carriedPart as any).partId : carriedPart
          if (partId && !state.partArchive[partId]) {
            state.partArchive[partId] = { partId, sector: 2, cooldownLeft: 0 }
            state.selectedArchivePart = partId
          }
        }

        // Migrate: remove fragment-cap, add quick-recovery
        if ('fragment-cap' in state.workshopUpgrades) {
          delete (state.workshopUpgrades as any)['fragment-cap']
        }
        // Remove legacy upgrades
        if ('quick-recovery' in state.workshopUpgrades) {
          delete (state.workshopUpgrades as any)['quick-recovery']
        }
        if ('starting-slot' in state.workshopUpgrades) {
          delete (state.workshopUpgrades as any)['starting-slot']
        }
      })
    },

    save: async () => {
      const state = get()
      const toSave: PermanentState = {
        totalShards: state.totalShards,
        workshopUpgrades: { ...state.workshopUpgrades },
        runHistory: state.runHistory.slice(-20),
        companionsUnlocked: [...state.companionsUnlocked],
        nameEverDiscovered: state.nameEverDiscovered,
        partArchive: { ...state.partArchive },
        selectedArchivePart: state.selectedArchivePart,
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
        'practiced-routine': 75,
        'sharp-eye': 40,
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

    addToArchive: (partId, sector) =>
      set((state) => {
        if (!state.partArchive[partId]) {
          state.partArchive[partId] = { partId, sector, cooldownLeft: 0 }
        }
      }),

    selectArchivePart: (partId) =>
      set((state) => {
        state.selectedArchivePart = partId
      }),

    triggerCooldown: (partId) =>
      set((state) => {
        const entry = state.partArchive[partId]
        if (!entry) return
        entry.cooldownLeft = 3
      }),

    decrementAllCooldowns: () =>
      set((state) => {
        for (const entry of Object.values(state.partArchive)) {
          if (entry.cooldownLeft > 0) entry.cooldownLeft--
        }
      }),

    importState: async (imported) => {
      set((state) => {
        Object.assign(state, imported)
      })
      const s = get()
      const toSave: PermanentState = {
        totalShards: s.totalShards,
        workshopUpgrades: { ...s.workshopUpgrades },
        runHistory: s.runHistory.slice(-20),
        companionsUnlocked: [...s.companionsUnlocked],
        nameEverDiscovered: s.nameEverDiscovered,
        partArchive: { ...s.partArchive },
        selectedArchivePart: s.selectedArchivePart,
      }
      await savePermanent(PERMANENT_KEY, toSave)
    },
  }))
)
