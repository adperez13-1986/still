import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  RunState,
  CardInstance,
  BehavioralPartDefinition,
  EquipmentDefinition,
  BodySlot,
  EnemyInstance,
  CombatPhase,
  CombatState,
  MapGraph,
} from '../game/types'

import {
  initCombat,
  playModifierCard,
  unassignModifier,
  executeBodyActions,
  executeEnemyTurn,
  endTurn,
  startTurn,
  projectHeat,
  allEnemiesDefeated,
  isStillDefeated,
  type CombatContext,
} from '../game/combat'

import { ALL_CARDS } from '../data/cards'
import { ALL_ENEMIES } from '../data/enemies'

interface RunActions {
  // Run lifecycle
  startRun: (initialState: Omit<RunState, 'active'>) => void
  endRun: () => void

  // Health
  takeDamage: (amount: number) => void
  heal: (amount: number) => void

  // Card management
  addCardToDeck: (card: CardInstance) => void
  removeCardFromDeck: (instanceId: string) => void

  // Heat
  getProjectedHeat: () => number

  // Equipment
  equipItem: (item: EquipmentDefinition) => EquipmentDefinition | null

  // Parts
  addPart: (part: BehavioralPartDefinition) => void
  removePart: (partId: string) => void

  // Shards
  addShards: (amount: number) => void

  // Combat flow
  startCombat: (enemies: EnemyInstance[]) => void
  playCard: (instanceId: string, targetSlot?: BodySlot, targetEnemyId?: string) => void
  unassignSlotModifier: (slot: BodySlot) => void
  executeTurn: (targetEnemyId?: string) => void
  setCombatPhase: (phase: CombatPhase) => void
  setEnemies: (enemies: EnemyInstance[]) => void
  applyCombatResult: (combat: CombatState, stillHealth: number) => void

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
  drawCount: 4,
  passiveCoolingBonus: 0,
  deck: [],
  parts: [],
  equipment: { Head: null, Torso: null, Arms: null, Legs: null },
  shards: 0,
  combat: null,
  nameDiscovered: false,
}

function calcBlockAbsorb(block: number, damage: number): { newBlock: number; healthDamage: number } {
  const absorbed = Math.min(block, damage)
  return { newBlock: block - absorbed, healthDamage: damage - absorbed }
}

export const useRunStore = create<RunState & RunActions>()(
  immer((set, get) => ({
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

    addCardToDeck: (card) =>
      set((state) => {
        state.deck.push(card)
      }),

    removeCardFromDeck: (instanceId) =>
      set((state) => {
        const idx = state.deck.findIndex(c => c.instanceId === instanceId)
        if (idx !== -1) state.deck.splice(idx, 1)
      }),

    getProjectedHeat: () => {
      const state = get()
      if (!state.combat) return 0
      return projectHeat(
        state.combat.heat,
        state.equipment,
        state.combat.slotModifiers,
        ALL_CARDS,
        state.combat,
        state.passiveCoolingBonus
      )
    },

    equipItem: (item) => {
      let displaced: EquipmentDefinition | null = null
      set((state) => {
        displaced = state.equipment[item.slot]
        state.equipment[item.slot] = item
      })
      return displaced
    },

    addPart: (part) =>
      set((state) => {
        state.parts.push(part)
      }),

    removePart: (partId) =>
      set((state) => {
        const idx = state.parts.findIndex((p) => p.id === partId)
        if (idx !== -1) state.parts.splice(idx, 1)
      }),

    addShards: (amount) =>
      set((state) => {
        state.shards += amount
      }),

    // Task 4.3: Combat start
    startCombat: (enemies) =>
      set((state) => {
        const combat = initCombat(
          [...state.deck],
          state.drawCount,
          enemies,
          []
        )
        state.combat = combat

        // Fire onCombatStart parts
        for (const part of state.parts) {
          if (part.trigger.type === 'onCombatStart') {
            if (part.effect.type === 'drawCards') {
              // Draw extra cards
              for (let i = 0; i < part.effect.count; i++) {
                if (combat.drawPile.length === 0) break
                if (combat.hand.length >= 10) break
                combat.hand.push(combat.drawPile.pop()!)
              }
            }
          }
        }
      }),

    // Task 4.4: Play modifier card
    playCard: (instanceId, targetSlot, targetEnemyId) =>
      set((state) => {
        if (!state.combat) return
        if (state.combat.shutdown) return
        const cardInst = state.combat.hand.find(c => c.instanceId === instanceId)
        if (!cardInst) return
        const def = ALL_CARDS[cardInst.definitionId]
        if (!def) return

        // Get the upgraded or base definition
        const cardDef = cardInst.isUpgraded && def.upgraded ? def.upgraded : def

        const ctx: CombatContext = {
          combat: JSON.parse(JSON.stringify(state.combat)),
          stillHealth: state.health,
          maxHealth: state.maxHealth,
          drawCount: state.drawCount,
          passiveCoolingBonus: state.passiveCoolingBonus,
          equipment: JSON.parse(JSON.stringify(state.equipment)),
          parts: JSON.parse(JSON.stringify(state.parts)),
          cardDefs: ALL_CARDS,
          enemyDefs: {},
          targetEnemyId,
        }

        const result = playModifierCard(ctx, cardDef, instanceId, targetSlot)
        Object.assign(state.combat, result.combat)
        state.health = result.stillHealth
      }),

    // Unassign modifier from slot (return to hand, refund heat)
    unassignSlotModifier: (slot) =>
      set((state) => {
        if (!state.combat) return
        const modId = state.combat.slotModifiers[slot]
        if (!modId) return

        // Find the card definition to know heat cost for refund
        const allCards = [
          ...state.combat.hand,
          ...state.combat.drawPile,
          ...state.combat.discardPile,
          ...state.combat.exhaustPile,
        ]
        const cardInst = allCards.find(c => c.instanceId === modId)
        if (!cardInst) return
        const def = ALL_CARDS[cardInst.definitionId]
        if (!def) return
        const cardDef = cardInst.isUpgraded && def.upgraded ? def.upgraded : def

        const ctx: CombatContext = {
          combat: JSON.parse(JSON.stringify(state.combat)),
          stillHealth: state.health,
          maxHealth: state.maxHealth,
          drawCount: state.drawCount,
          passiveCoolingBonus: state.passiveCoolingBonus,
          equipment: JSON.parse(JSON.stringify(state.equipment)),
          parts: JSON.parse(JSON.stringify(state.parts)),
          cardDefs: ALL_CARDS,
          enemyDefs: {},
        }

        const result = unassignModifier(ctx, slot, cardDef)
        Object.assign(state.combat, result.combat)
        state.health = result.stillHealth
      }),

    // Task 4.5: Execute turn (body actions → enemy turn → end of turn)
    executeTurn: (targetEnemyId) =>
      set((state) => {
        if (!state.combat) return

        const baseCtx: CombatContext = {
          combat: JSON.parse(JSON.stringify(state.combat)),
          stillHealth: state.health,
          maxHealth: state.maxHealth,
          drawCount: state.drawCount,
          passiveCoolingBonus: state.passiveCoolingBonus,
          equipment: JSON.parse(JSON.stringify(state.equipment)),
          parts: JSON.parse(JSON.stringify(state.parts)),
          cardDefs: ALL_CARDS,
          enemyDefs: ALL_ENEMIES,
          targetEnemyId,
        }

        // Phase 1: Execute body actions
        state.combat.phase = 'executing'
        const bodyResult = executeBodyActions(baseCtx)
        state.health = bodyResult.stillHealth

        // Check win after body actions
        if (allEnemiesDefeated(bodyResult.combat)) {
          Object.assign(state.combat, bodyResult.combat)
          state.combat.phase = 'reward'
          return
        }

        // Phase 2: Enemy turn
        const enemyCtx: CombatContext = {
          ...baseCtx,
          combat: bodyResult.combat,
          stillHealth: bodyResult.stillHealth,
        }
        const enemyResult = executeEnemyTurn(enemyCtx)
        state.health = enemyResult.stillHealth

        // Check loss after enemy turn
        if (isStillDefeated(enemyResult.stillHealth)) {
          Object.assign(state.combat, enemyResult.combat)
          state.combat.phase = 'finished'
          return
        }

        // Phase 3: End of turn (hot penalty, status decrement, discard)
        const endCtx: CombatContext = {
          ...baseCtx,
          combat: enemyResult.combat,
          stillHealth: enemyResult.stillHealth,
        }
        const endResult = endTurn(endCtx)
        state.health = endResult.stillHealth

        // Check loss after hot penalty
        if (isStillDefeated(endResult.stillHealth)) {
          Object.assign(state.combat, endResult.combat)
          state.combat.phase = 'finished'
          return
        }

        // Check win (in case end-of-turn effects somehow killed last enemy)
        if (allEnemiesDefeated(endResult.combat)) {
          Object.assign(state.combat, endResult.combat)
          state.combat.phase = 'reward'
          return
        }

        // Phase 4: Start next turn (passive cooling, block reset, draw)
        const inspiredBonus = (endResult as any)._inspiredBonus ?? 0
        const startCtx: CombatContext = {
          ...baseCtx,
          combat: endResult.combat,
          stillHealth: endResult.stillHealth,
        }
        const turnResult = startTurn(startCtx, inspiredBonus)
        Object.assign(state.combat, turnResult.combat)
        state.health = turnResult.stillHealth
      }),

    setCombatPhase: (phase) =>
      set((state) => {
        if (state.combat) state.combat.phase = phase
      }),

    setEnemies: (enemies) =>
      set((state) => {
        if (state.combat) state.combat.enemies = enemies
      }),

    applyCombatResult: (combat, stillHealth) =>
      set((state) => {
        state.combat = combat
        state.health = stillHealth
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
