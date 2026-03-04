import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  RunState,
  CardInstance,
  PartDefinition,
  EquipableDefinition,
  EquipSlot,
  StatusEffect,
  EnemyInstance,
  CombatPhase,
  MapGraph,
} from '../game/types'

interface RunActions {
  // Run lifecycle
  startRun: (initialState: Omit<RunState, 'active'>) => void
  endRun: () => void

  // Health & stats
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  gainBlock: (amount: number) => void
  resetBlock: () => void

  // Card management
  drawCards: (count: number) => void
  playCard: (instanceId: string) => void
  discardHand: () => void
  addCardToDeck: (card: CardInstance) => void
  exhaustCard: (instanceId: string) => void

  // Energy
  spendEnergy: (amount: number) => void
  restoreEnergy: () => void

  // Parts & equipables
  addPart: (part: PartDefinition) => void
  removePart: (partId: string) => void
  restorePart: (part: PartDefinition) => void
  equipItem: (item: EquipableDefinition) => EquipableDefinition | null

  // Shards
  addShards: (amount: number) => void
  addBonusStrength: (amount: number) => void

  // Combat
  setCombatPhase: (phase: CombatPhase) => void
  setEnemies: (enemies: EnemyInstance[]) => void
  damageEnemy: (instanceId: string, amount: number) => void
  applyStatusToSelf: (effect: StatusEffect) => void
  advanceEnemyIntents: () => void

  // Map
  setMap: (map: MapGraph) => void
  moveToRoom: (roomId: string) => void

  // Narrative
  discoverName: () => void
}

const emptyRunState: RunState = {
  active: false,
  act: 1,
  map: null,
  health: 70,
  maxHealth: 70,
  energyCap: 3,
  drawCount: 5,
  bonusStrength: 0,
  deck: [],
  parts: [],
  equipables: { Head: null, Torso: null, Arms: null, Legs: null },
  shards: 0,
  combat: null,
  nameDiscovered: false,
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function calcBlockAbsorb(block: number, damage: number): { newBlock: number; healthDamage: number } {
  const absorbed = Math.min(block, damage)
  return { newBlock: block - absorbed, healthDamage: damage - absorbed }
}

export const useRunStore = create<RunState & RunActions>()(
  immer((set) => ({
    ...emptyRunState,

    startRun: (initial) =>
      set((state) => {
        Object.assign(state, { ...initial, active: true })
      }),

    endRun: () =>
      set((state) => {
        Object.assign(state, emptyRunState)
      }),

    takeDamage: (amount) =>
      set((state) => {
        const { newBlock, healthDamage } = calcBlockAbsorb(state.combat?.block ?? 0, amount)
        if (state.combat) state.combat.block = newBlock
        state.health = Math.max(0, state.health - healthDamage)
      }),

    heal: (amount) =>
      set((state) => {
        state.health = Math.min(state.maxHealth, state.health + amount)
      }),

    gainBlock: (amount) =>
      set((state) => {
        if (state.combat) state.combat.block += amount
      }),

    resetBlock: () =>
      set((state) => {
        if (state.combat) state.combat.block = 0
      }),

    drawCards: (count) =>
      set((state) => {
        if (!state.combat) return
        const handSize = state.combat.hand.length
        const canDraw = Math.min(count, 10 - handSize)
        for (let i = 0; i < canDraw; i++) {
          if (state.combat.drawPile.length === 0) {
            if (state.combat.discardPile.length === 0) break
            state.combat.drawPile = shuffleArray(state.combat.discardPile)
            state.combat.discardPile = []
          }
          const card = state.combat.drawPile.pop()!
          state.combat.hand.push(card)
        }
        // Cards beyond 10 while drawing are burned (go to discard)
      }),

    playCard: (instanceId) =>
      set((state) => {
        if (!state.combat) return
        const idx = state.combat.hand.findIndex((c) => c.instanceId === instanceId)
        if (idx === -1) return
        const [card] = state.combat.hand.splice(idx, 1)
        state.combat.discardPile.push(card)
      }),

    discardHand: () =>
      set((state) => {
        if (!state.combat) return
        state.combat.discardPile.push(...state.combat.hand)
        state.combat.hand = []
      }),

    addCardToDeck: (card) =>
      set((state) => {
        state.deck.push(card)
      }),

    exhaustCard: (instanceId) =>
      set((state) => {
        if (!state.combat) return
        const fromHand = state.combat.hand.findIndex((c) => c.instanceId === instanceId)
        if (fromHand !== -1) {
          const [card] = state.combat.hand.splice(fromHand, 1)
          state.combat.exhaustPile.push(card)
        }
      }),

    spendEnergy: (amount) =>
      set((state) => {
        if (state.combat) state.combat.energy = Math.max(0, state.combat.energy - amount)
      }),

    restoreEnergy: () =>
      set((state) => {
        if (state.combat) state.combat.energy = state.energyCap
      }),

    addPart: (part) =>
      set((state) => {
        state.parts.push(part)
        for (const effect of part.effects) {
          if (effect.type === 'maxHealth') state.maxHealth += effect.value
          if (effect.type === 'energyCap') state.energyCap += effect.value
          if (effect.type === 'drawCount') state.drawCount += effect.value
          // blockOnTurnStart and strengthBonus are applied per-combat
          // shardBonus is applied at shard calculation time
        }
      }),

    removePart: (partId) =>
      set((state) => {
        const idx = state.parts.findIndex((p) => p.id === partId)
        if (idx !== -1) state.parts.splice(idx, 1)
        // Baked-in stats (maxHealth, energyCap, drawCount) are not reversed
      }),

    restorePart: (part) =>
      set((state) => {
        state.parts.push(part)
        // No stat re-application — stats were already baked in at run start
      }),

    equipItem: (item) => {
      let displaced: EquipableDefinition | null = null
      set((state) => {
        displaced = state.equipables[item.slot as EquipSlot]
        state.equipables[item.slot as EquipSlot] = item
      })
      return displaced
    },

    addShards: (amount) =>
      set((state) => {
        state.shards += amount
      }),

    addBonusStrength: (amount) =>
      set((state) => {
        state.bonusStrength += amount
      }),

    setCombatPhase: (phase) =>
      set((state) => {
        if (state.combat) state.combat.phase = phase
      }),

    setEnemies: (enemies) =>
      set((state) => {
        if (state.combat) state.combat.enemies = enemies
      }),

    damageEnemy: (instanceId, amount) =>
      set((state) => {
        if (!state.combat) return
        const enemy = state.combat.enemies.find((e) => e.instanceId === instanceId)
        if (!enemy) return
        enemy.currentHealth = Math.max(0, enemy.currentHealth - amount)
        if (enemy.currentHealth === 0) enemy.isDefeated = true
      }),

    applyStatusToSelf: (effect) =>
      set((state) => {
        if (!state.combat) return
        const existing = state.combat.statusEffects.find((s) => s.type === effect.type)
        if (existing) {
          existing.stacks += effect.stacks
        } else {
          state.combat.statusEffects.push({ ...effect })
        }
      }),

    advanceEnemyIntents: () =>
      set((state) => {
        if (!state.combat) return
        for (const enemy of state.combat.enemies) {
          if (!enemy.isDefeated) enemy.intentIndex++
        }
      }),

    setMap: (map) =>
      set((state) => {
        state.map = map
      }),

    moveToRoom: (roomId) =>
      set((state) => {
        if (!state.map) return
        state.map.currentRoomId = roomId
        const room = state.map.rooms[roomId]
        if (room) room.visited = true
      }),

    discoverName: () =>
      set((state) => {
        state.nameDiscovered = true
      }),
  }))
)
