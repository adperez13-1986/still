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
  GridMaze,
} from '../game/types'
import { MAX_PARTS } from '../game/types'

import {
  initCombat,
  playModifierCard,
  unassignModifier,
  executeBodyActions,
  executeEnemyTurn,
  endTurn,
  startTurn,
  allEnemiesDefeated,
  isStillDefeated,
  type CombatContext,
} from '../game/combat'

import { ALL_CARDS } from '../data/cards'
import { ALL_ENEMIES } from '../data/enemies'
import { generateGridMaze } from '../game/mapGen'
import { saveRunState, loadRunState, clearRunState } from '../game/persistence'
import { getPartSector } from '../data/parts'

interface RunActions {
  // Run lifecycle
  startRun: (initialState: Omit<RunState, 'active'>) => void
  endRun: () => void

  // Health
  takeDamage: (amount: number) => void
  heal: (amount: number) => void
  reduceMaxHealth: (amount: number) => void

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
  replacePart: (oldPartId: string, newPart: BehavioralPartDefinition) => void

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
  setMap: (map: GridMaze) => void
  moveToTile: (x: number, y: number) => void
  clearCurrentRoom: () => void

  // Sector transition
  advanceSector: () => void

  // Narrative
  discoverName: () => void

  // Companions
  acquireCompanion: (id: string) => void

  // Persistence
  saveRun: () => void
  restoreRun: () => boolean
}

const emptyRunState: RunState = {
  active: false,
  sector: 1,
  map: null,
  health: 70,
  maxHealth: 70,
  drawCount: 5,
  deck: [],
  parts: [],
  equipment: { Head: null, Torso: null, Arms: null, Legs: null },
  shards: 0,
  combat: null,
  nameDiscovered: false,
  equipPity: 0,
  companionsAcquired: [],
  combatsCleared: 0,
  lastCollapseMessage: null,
  carriedPartSector: null,
}

/** Filter out inert carried parts (S2 part in S1) */
function getActiveParts(state: RunState): BehavioralPartDefinition[] {
  if (!state.carriedPartSector) return state.parts
  // Derive actual sector from pool membership, not saved value
  const actualSector = state.parts.length > 0 ? getPartSector(state.parts[0].id) : state.carriedPartSector
  if (actualSector <= state.sector) return state.parts
  // The carried part is the first entry — skip it if its sector hasn't been reached
  return state.parts.length > 0 ? state.parts.slice(1) : state.parts
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
        clearRunState()
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

    reduceMaxHealth: (amount) =>
      set((state) => {
        state.maxHealth = Math.max(1, state.maxHealth - amount)
        if (state.health > state.maxHealth) state.health = state.maxHealth
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
      // Energy resets each turn — no projection needed
      return 0
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
        if (state.parts.some(p => p.id === part.id)) return
        if (state.parts.length >= MAX_PARTS) return
        state.parts.push(part)
      }),

    removePart: (partId) =>
      set((state) => {
        const idx = state.parts.findIndex((p) => p.id === partId)
        if (idx !== -1) state.parts.splice(idx, 1)
      }),

    replacePart: (oldPartId, newPart) =>
      set((state) => {
        const idx = state.parts.findIndex((p) => p.id === oldPartId)
        if (idx !== -1) {
          state.parts[idx] = newPart
        }
      }),

    addShards: (amount) =>
      set((state) => {
        state.shards += amount
      }),

    startCombat: (enemies) =>
      set((state) => {
        const activeParts = getActiveParts(state)
        const combat = initCombat(
          [...state.deck],
          state.drawCount,
          enemies,
          [],
          activeParts
        )
        state.combat = combat

        // Fire onCombatStart parts
        for (const part of activeParts) {
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

    playCard: (instanceId, targetSlot, targetEnemyId) =>
      set((state) => {
        if (!state.combat) return
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

          equipment: JSON.parse(JSON.stringify(state.equipment)),
          parts: JSON.parse(JSON.stringify(getActiveParts(state))),
          cardDefs: ALL_CARDS,
          enemyDefs: {},
          targetEnemyId,
          combatsCleared: state.combatsCleared,
        }

        const result = playModifierCard(ctx, cardDef, instanceId, targetSlot)
        Object.assign(state.combat, result.combat)
        state.health = result.stillHealth
        // System card killed last enemy — skip to reward
        if (allEnemiesDefeated(state.combat)) {
          state.combat.phase = 'reward'
        }
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

          equipment: JSON.parse(JSON.stringify(state.equipment)),
          parts: JSON.parse(JSON.stringify(getActiveParts(state))),
          cardDefs: ALL_CARDS,
          enemyDefs: {},
          combatsCleared: state.combatsCleared,
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

          equipment: JSON.parse(JSON.stringify(state.equipment)),
          parts: JSON.parse(JSON.stringify(getActiveParts(state))),
          cardDefs: ALL_CARDS,
          enemyDefs: ALL_ENEMIES,
          targetEnemyId,
          combatsCleared: state.combatsCleared,
        }

        // Accumulate combat events across all phases
        const allEvents: import('../game/types').CombatEvent[] = []

        // Phase 1: Execute body actions
        state.combat.phase = 'executing'
        const bodyResult = executeBodyActions(baseCtx)
        state.health = bodyResult.stillHealth
        allEvents.push(...bodyResult.combat.combatLog)
        bodyResult.combat.combatLog = []

        // Check win after body actions
        if (allEnemiesDefeated(bodyResult.combat)) {
          Object.assign(state.combat, bodyResult.combat)
          state.combat.combatLog = allEvents
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
        allEvents.push(...enemyResult.combat.combatLog)
        enemyResult.combat.combatLog = []

        // Check loss after enemy turn
        if (isStillDefeated(enemyResult.stillHealth)) {
          Object.assign(state.combat, enemyResult.combat)
          state.combat.combatLog = allEvents
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
        allEvents.push(...endResult.combat.combatLog)
        endResult.combat.combatLog = []

        // Check loss after end of turn
        if (isStillDefeated(endResult.stillHealth)) {
          Object.assign(state.combat, endResult.combat)
          state.combat.combatLog = allEvents
          state.combat.phase = 'finished'
          return
        }

        // Check win (in case end-of-turn effects somehow killed last enemy)
        if (allEnemiesDefeated(endResult.combat)) {
          Object.assign(state.combat, endResult.combat)
          state.combat.combatLog = allEvents
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
        state.combat.combatLog = allEvents
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

    moveToTile: (x, y) =>
      set((state) => {
        if (!state.map) return
        const { playerX, playerY, grid } = state.map
        // Validate adjacency (4-directional only)
        const dx = Math.abs(x - playerX)
        const dy = Math.abs(y - playerY)
        if (dx + dy !== 1) return
        // Validate walkable
        if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return
        const tile = grid[y][x]
        if (!tile) return
        // Move player
        state.map.playerX = x
        state.map.playerY = y
        tile.visited = true
        // Reveal 8-directional neighbors (fog of war)
        for (let ry = y - 1; ry <= y + 1; ry++) {
          for (let rx = x - 1; rx <= x + 1; rx++) {
            if (ry < 0 || ry >= grid.length || rx < 0 || rx >= grid[0].length) continue
            // Revealed state is implicit: a tile with visited=false that is adjacent
            // to any visited tile is "revealed". No extra flag needed — computed in UI.
          }
        }
      }),

    clearCurrentRoom: () =>
      set((state) => {
        if (!state.map) return
        const tile = state.map.grid[state.map.playerY][state.map.playerX]
        if (tile) tile.cleared = true
      }),

    advanceSector: () =>
      set((state) => {
        if (state.sector >= 3) return
        const newSector = (state.sector + 1) as 1 | 2 | 3
        state.sector = newSector
        state.map = generateGridMaze(newSector) as any
        state.combat = null
        state.combatsCleared = 0
        state.lastCollapseMessage = null
      }),

    discoverName: () =>
      set((state) => {
        state.nameDiscovered = true
      }),

    acquireCompanion: (id) =>
      set((state) => {
        if (!state.companionsAcquired.includes(id)) {
          state.companionsAcquired.push(id)
        }
      }),

    saveRun: () => {
      const state = get()
      if (!state.active) return
      // Save with combat nulled out — we always restore to the map
      const toSave: RunState = {
        active: state.active,
        sector: state.sector,
        map: state.map,
        health: state.health,
        maxHealth: state.maxHealth,
        drawCount: state.drawCount,
        deck: state.deck,
        parts: state.parts,
        equipment: state.equipment,
        shards: state.shards,
        combat: null,
        nameDiscovered: state.nameDiscovered,
        equipPity: state.equipPity,
        companionsAcquired: state.companionsAcquired,
        combatsCleared: state.combatsCleared,
        lastCollapseMessage: state.lastCollapseMessage,
        carriedPartSector: state.carriedPartSector,
      }
      saveRunState(toSave)
    },

    restoreRun: () => {
      try {
        const saved = loadRunState<RunState>()
        if (!saved || !saved.active || !saved.map) return false
        // Legacy saves without carriedPartSector — discard so a fresh run starts with gating
        if (saved.carriedPartSector === undefined) {
          clearRunState()
          return false
        }
        set((state) => {
          Object.assign(state, { ...saved, combat: null })
        })
        return true
      } catch {
        clearRunState()
        return false
      }
    },
  }))
)
