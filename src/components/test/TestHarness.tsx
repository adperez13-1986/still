import { useReducer } from 'react'
import type {
  BodySlot,
  CombatState,
  EquipmentDefinition,
  BehavioralPartDefinition,
  CardInstance,
  ModifierCardDefinition,
  EnemyDefinition,
  StatusEffect,
} from '../../game/types'
import {
  initCombat,
  makeEnemyInstance,
  makeCardInstance,
  executeBodyActions,
  executeEnemyTurn,
  endTurn,
  startTurn,
  playModifierCard,
  unassignModifier,
  projectHeat,
  allEnemiesDefeated,
  isStillDefeated,
} from '../../game/combat'
import type { CombatContext } from '../../game/combat'
import { ALL_CARDS, STARTING_CARDS } from '../../data/cards'
import { ALL_ENEMIES } from '../../data/enemies'
import { ALL_EQUIPMENT } from '../../data/parts'
import HeatGauge from './HeatGauge'
import StateInspector from './StateInspector'
import ScenarioBuilder from './ScenarioBuilder'
import HandPanel from './HandPanel'
import BodySlotPanel from './BodySlotPanel'
import TurnControls from './TurnControls'
import EnemyPanel from './EnemyPanel'
import ActionLog from './ActionLog'
import DebugControls from './DebugControls'

// ─── Scenario Config ─────────────────────────────────────────────────────────

export interface ScenarioConfig {
  equipment: Record<BodySlot, EquipmentDefinition | null>
  enemies: EnemyDefinition[]
  cardQuantities: Record<string, number> // definitionId -> count
  parts: BehavioralPartDefinition[]
  health: number
  maxHealth: number
  drawCount: number
  passiveCoolingBonus: number
}

const DEFAULT_SCENARIO: ScenarioConfig = {
  equipment: {
    Head: null,
    Torso: ALL_EQUIPMENT['scrap-plating'] ?? null,
    Arms: ALL_EQUIPMENT['piston-arm'] ?? null,
    Legs: null,
  },
  enemies: [ALL_ENEMIES['wandering-drone']],
  cardQuantities: Object.fromEntries(
    STARTING_CARDS.map((c) => [c.id, STARTING_CARDS.filter((s) => s.id === c.id).length])
  ),
  parts: [],
  health: 60,
  maxHealth: 60,
  drawCount: 5,
  passiveCoolingBonus: 0,
}

// ─── State ───────────────────────────────────────────────────────────────────

type TurnStep = 'planning' | 'body_done' | 'enemy_done' | 'end_done'

interface HarnessState {
  mode: 'setup' | 'combat'
  scenario: ScenarioConfig
  combat: CombatState | null
  stillHealth: number
  log: string[]
  turnStep: TurnStep
  inspiredBonus: number
  // UI state for card play
  selectedCardId: string | null // instanceId of card in hand being played
  outcome: 'playing' | 'victory' | 'defeat'
}

type HarnessAction =
  | { type: 'SET_SCENARIO'; scenario: ScenarioConfig }
  | { type: 'START_COMBAT' }
  | { type: 'SET_HEAT'; heat: number }
  | { type: 'SELECT_CARD'; instanceId: string | null }
  | { type: 'ASSIGN_MODIFIER'; slot: BodySlot }
  | { type: 'UNASSIGN_MODIFIER'; slot: BodySlot }
  | { type: 'PLAY_SYSTEM_CARD'; instanceId: string; targetEnemyId?: string }
  | { type: 'EXECUTE_BODY'; targetEnemyId?: string }
  | { type: 'EXECUTE_ENEMY' }
  | { type: 'END_TURN' }
  | { type: 'START_NEXT_TURN' }
  | { type: 'AUTO_COMPLETE'; targetEnemyId?: string }
  | { type: 'RESET_COMBAT' }
  | { type: 'BACK_TO_SETUP' }
  // Debug overrides
  | { type: 'DEBUG_SET_HEAT'; heat: number }
  | { type: 'DEBUG_SET_HEALTH'; health: number }
  | { type: 'DEBUG_SET_ENEMY_HEALTH'; enemyId: string; health: number }
  | { type: 'DEBUG_ADD_STATUS'; status: StatusEffect }
  | { type: 'DEBUG_REMOVE_STATUS'; statusType: string }
  | { type: 'DEBUG_TOGGLE_SHUTDOWN' }
  | { type: 'DEBUG_TOGGLE_DISABLED_SLOT'; slot: BodySlot }
  | { type: 'DEBUG_ADD_CARD_TO_HAND'; definitionId: string }
  | { type: 'DEBUG_SET_ENEMY_INTENT'; enemyId: string; index: number }
  | { type: 'DEBUG_ADD_ENEMY_STATUS'; enemyId: string; status: StatusEffect }
  | { type: 'DEBUG_REMOVE_ENEMY_STATUS'; enemyId: string; statusType: string }

function buildCardDefs(): Record<string, ModifierCardDefinition> {
  return { ...ALL_CARDS }
}

function buildEnemyDefs(): Record<string, EnemyDefinition> {
  return { ...ALL_ENEMIES }
}

function buildContext(state: HarnessState): CombatContext {
  return {
    combat: state.combat!,
    stillHealth: state.stillHealth,
    maxHealth: state.scenario.maxHealth,
    drawCount: state.scenario.drawCount,
    passiveCoolingBonus: state.scenario.passiveCoolingBonus,
    equipment: state.scenario.equipment,
    parts: state.scenario.parts,
    cardDefs: buildCardDefs(),
    enemyDefs: buildEnemyDefs(),
  }
}

function checkOutcome(combat: CombatState, health: number): 'playing' | 'victory' | 'defeat' {
  if (isStillDefeated(health)) return 'defeat'
  if (allEnemiesDefeated(combat)) return 'victory'
  return 'playing'
}

function buildDeck(quantities: Record<string, number>): CardInstance[] {
  const cards: CardInstance[] = []
  for (const [defId, count] of Object.entries(quantities)) {
    for (let i = 0; i < count; i++) {
      cards.push(makeCardInstance(defId))
    }
  }
  return cards
}

function reducer(state: HarnessState, action: HarnessAction): HarnessState {
  switch (action.type) {
    case 'SET_SCENARIO':
      return { ...state, scenario: action.scenario }

    case 'START_COMBAT': {
      const deck = buildDeck(state.scenario.cardQuantities)
      const enemies = state.scenario.enemies.map(makeEnemyInstance)
      const combat = initCombat(deck, state.scenario.drawCount, enemies)
      return {
        ...state,
        mode: 'combat',
        combat,
        stillHealth: state.scenario.health,
        log: ['Combat started. Round 1.'],
        turnStep: 'planning',
        inspiredBonus: 0,
        selectedCardId: null,
        outcome: 'playing',
      }
    }

    case 'SET_HEAT': {
      if (!state.combat) return state
      return {
        ...state,
        combat: { ...state.combat, heat: Math.max(0, action.heat) },
      }
    }

    case 'SELECT_CARD': {
      return { ...state, selectedCardId: action.instanceId }
    }

    case 'ASSIGN_MODIFIER': {
      if (!state.combat || !state.selectedCardId) return state
      const cardInst = state.combat.hand.find(c => c.instanceId === state.selectedCardId)
      if (!cardInst) return state
      const cardDef = ALL_CARDS[cardInst.definitionId]
      if (!cardDef || cardDef.category.type !== 'slot') return state

      const ctx = buildContext(state)
      const result = playModifierCard(ctx, cardDef, cardInst.instanceId, action.slot)
      return {
        ...state,
        combat: result.combat,
        stillHealth: result.stillHealth,
        log: [...state.log, ...result.log],
        selectedCardId: null,
        outcome: checkOutcome(result.combat, result.stillHealth),
      }
    }

    case 'UNASSIGN_MODIFIER': {
      if (!state.combat) return state
      const modInstanceId = state.combat.slotModifiers[action.slot]
      if (!modInstanceId) return state
      // Find the card definition for the assigned modifier
      const allCards = [
        ...state.combat.hand, ...state.combat.drawPile,
        ...state.combat.discardPile, ...state.combat.exhaustPile,
      ]
      const cardInst = allCards.find(c => c.instanceId === modInstanceId)
      if (!cardInst) return state
      const cardDef = ALL_CARDS[cardInst.definitionId]
      if (!cardDef) return state

      const ctx = buildContext(state)
      const result = unassignModifier(ctx, action.slot, cardDef)
      return {
        ...state,
        combat: result.combat,
        stillHealth: result.stillHealth,
        log: [...state.log, ...result.log],
      }
    }

    case 'PLAY_SYSTEM_CARD': {
      if (!state.combat) return state
      const cardInst = state.combat.hand.find(c => c.instanceId === action.instanceId)
      if (!cardInst) return state
      const cardDef = ALL_CARDS[cardInst.definitionId]
      if (!cardDef || cardDef.category.type !== 'system') return state

      const ctx = { ...buildContext(state), targetEnemyId: action.targetEnemyId }
      const result = playModifierCard(ctx, cardDef, cardInst.instanceId)
      return {
        ...state,
        combat: result.combat,
        stillHealth: result.stillHealth,
        log: [...state.log, ...result.log],
        selectedCardId: null,
        outcome: checkOutcome(result.combat, result.stillHealth),
      }
    }

    case 'EXECUTE_BODY': {
      if (!state.combat || state.turnStep !== 'planning') return state
      const ctx = { ...buildContext(state), targetEnemyId: action.targetEnemyId }
      const result = executeBodyActions(ctx)
      return {
        ...state,
        combat: result.combat,
        stillHealth: result.stillHealth,
        log: [...state.log, '--- Execute Body Actions ---', ...result.log],
        turnStep: 'body_done',
        selectedCardId: null,
        outcome: checkOutcome(result.combat, result.stillHealth),
      }
    }

    case 'EXECUTE_ENEMY': {
      if (!state.combat || state.turnStep !== 'body_done') return state
      const ctx = buildContext(state)
      const result = executeEnemyTurn(ctx)
      return {
        ...state,
        combat: result.combat,
        stillHealth: result.stillHealth,
        log: [...state.log, '--- Enemy Turn ---', ...result.log],
        turnStep: 'enemy_done',
        outcome: checkOutcome(result.combat, result.stillHealth),
      }
    }

    case 'END_TURN': {
      if (!state.combat || state.turnStep !== 'enemy_done') return state
      const ctx = buildContext(state)
      const result = endTurn(ctx) as ReturnType<typeof endTurn> & { _inspiredBonus?: number }
      return {
        ...state,
        combat: result.combat,
        stillHealth: result.stillHealth,
        log: [...state.log, '--- End Turn ---', ...result.log],
        turnStep: 'end_done',
        inspiredBonus: result._inspiredBonus ?? 0,
        outcome: checkOutcome(result.combat, result.stillHealth),
      }
    }

    case 'START_NEXT_TURN': {
      if (!state.combat || state.turnStep !== 'end_done') return state
      const ctx = buildContext(state)
      const result = startTurn(ctx, state.inspiredBonus)
      return {
        ...state,
        combat: result.combat,
        stillHealth: result.stillHealth,
        log: [...state.log, `--- Start Round ${result.combat.roundNumber} ---`, ...result.log],
        turnStep: 'planning',
        inspiredBonus: 0,
        outcome: checkOutcome(result.combat, result.stillHealth),
      }
    }

    case 'AUTO_COMPLETE': {
      if (!state.combat || state.turnStep !== 'planning') return state
      let s = state

      // Execute body
      const ctx1 = { ...buildContext(s), targetEnemyId: action.targetEnemyId }
      const r1 = executeBodyActions(ctx1)
      s = { ...s, combat: r1.combat, stillHealth: r1.stillHealth, log: [...s.log, '--- Execute Body Actions ---', ...r1.log] }

      // Execute enemy
      const ctx2 = buildContext(s)
      const r2 = executeEnemyTurn(ctx2)
      s = { ...s, combat: r2.combat, stillHealth: r2.stillHealth, log: [...s.log, '--- Enemy Turn ---', ...r2.log] }

      // End turn
      const ctx3 = buildContext(s)
      const r3 = endTurn(ctx3) as ReturnType<typeof endTurn> & { _inspiredBonus?: number }
      s = { ...s, combat: r3.combat, stillHealth: r3.stillHealth, log: [...s.log, '--- End Turn ---', ...r3.log] }

      // Start next turn
      const ctx4 = buildContext(s)
      const r4 = startTurn(ctx4, r3._inspiredBonus ?? 0)
      s = {
        ...s,
        combat: r4.combat,
        stillHealth: r4.stillHealth,
        log: [...s.log, `--- Start Round ${r4.combat.roundNumber} ---`, ...r4.log],
        turnStep: 'planning',
        inspiredBonus: 0,
        selectedCardId: null,
        outcome: checkOutcome(r4.combat, r4.stillHealth),
      }

      return s
    }

    case 'RESET_COMBAT': {
      const deck = buildDeck(state.scenario.cardQuantities)
      const enemies = state.scenario.enemies.map(makeEnemyInstance)
      const combat = initCombat(deck, state.scenario.drawCount, enemies)
      return {
        ...state,
        combat,
        stillHealth: state.scenario.health,
        log: ['Combat reset. Round 1.'],
        turnStep: 'planning',
        inspiredBonus: 0,
        selectedCardId: null,
        outcome: 'playing',
      }
    }

    case 'BACK_TO_SETUP':
      return {
        ...state,
        mode: 'setup',
        combat: null,
        log: [],
        turnStep: 'planning',
        selectedCardId: null,
        outcome: 'playing',
      }

    // ─── Debug overrides ───────────────────────────────────────────────────

    case 'DEBUG_SET_HEAT': {
      if (!state.combat) return state
      const heat = Math.max(0, action.heat)
      return {
        ...state,
        combat: { ...state.combat, heat },
        log: [...state.log, `[DEBUG] Heat set to ${heat}`],
      }
    }

    case 'DEBUG_SET_HEALTH': {
      const health = Math.max(0, Math.min(state.scenario.maxHealth, action.health))
      return {
        ...state,
        stillHealth: health,
        log: [...state.log, `[DEBUG] Health set to ${health}`],
        outcome: checkOutcome(state.combat!, health),
      }
    }

    case 'DEBUG_SET_ENEMY_HEALTH': {
      if (!state.combat) return state
      const enemies = state.combat.enemies.map(e => {
        if (e.instanceId !== action.enemyId) return e
        const hp = Math.max(0, Math.min(e.maxHealth, action.health))
        return { ...e, currentHealth: hp, isDefeated: hp <= 0 }
      })
      const newCombat = { ...state.combat, enemies }
      return {
        ...state,
        combat: newCombat,
        log: [...state.log, `[DEBUG] Enemy health set to ${action.health}`],
        outcome: checkOutcome(newCombat, state.stillHealth),
      }
    }

    case 'DEBUG_ADD_STATUS': {
      if (!state.combat) return state
      const existing = state.combat.statusEffects.find(s => s.type === action.status.type)
      const statusEffects = existing
        ? state.combat.statusEffects.map(s =>
            s.type === action.status.type ? { ...s, stacks: s.stacks + action.status.stacks } : s
          )
        : [...state.combat.statusEffects, action.status]
      return {
        ...state,
        combat: { ...state.combat, statusEffects },
        log: [...state.log, `[DEBUG] Added ${action.status.stacks} ${action.status.type}`],
      }
    }

    case 'DEBUG_REMOVE_STATUS': {
      if (!state.combat) return state
      return {
        ...state,
        combat: {
          ...state.combat,
          statusEffects: state.combat.statusEffects.filter(s => s.type !== action.statusType),
        },
        log: [...state.log, `[DEBUG] Removed ${action.statusType}`],
      }
    }

    case 'DEBUG_TOGGLE_DISABLED_SLOT': {
      if (!state.combat) return state
      const isDisabled = state.combat.disabledSlots.includes(action.slot)
      const disabledSlots = isDisabled
        ? state.combat.disabledSlots.filter(s => s !== action.slot)
        : [...state.combat.disabledSlots, action.slot]
      return {
        ...state,
        combat: { ...state.combat, disabledSlots },
        log: [...state.log, `[DEBUG] ${action.slot} ${isDisabled ? 'enabled' : 'disabled'}`],
      }
    }

    case 'DEBUG_ADD_CARD_TO_HAND': {
      if (!state.combat) return state
      if (state.combat.hand.length >= 10) return state
      const newCard = makeCardInstance(action.definitionId)
      return {
        ...state,
        combat: { ...state.combat, hand: [...state.combat.hand, newCard] },
        log: [...state.log, `[DEBUG] Added ${ALL_CARDS[action.definitionId]?.name ?? action.definitionId} to hand`],
      }
    }

    case 'DEBUG_SET_ENEMY_INTENT': {
      if (!state.combat) return state
      const enemies = state.combat.enemies.map(e =>
        e.instanceId === action.enemyId ? { ...e, intentIndex: action.index } : e
      )
      return {
        ...state,
        combat: { ...state.combat, enemies },
        log: [...state.log, `[DEBUG] Enemy intent index set to ${action.index}`],
      }
    }

    case 'DEBUG_ADD_ENEMY_STATUS': {
      if (!state.combat) return state
      const enemies = state.combat.enemies.map(e => {
        if (e.instanceId !== action.enemyId) return e
        const existing = e.statusEffects.find(s => s.type === action.status.type)
        const statusEffects = existing
          ? e.statusEffects.map(s =>
              s.type === action.status.type ? { ...s, stacks: s.stacks + action.status.stacks } : s
            )
          : [...e.statusEffects, action.status]
        return { ...e, statusEffects }
      })
      return {
        ...state,
        combat: { ...state.combat, enemies },
        log: [...state.log, `[DEBUG] Added ${action.status.stacks} ${action.status.type} to enemy`],
      }
    }

    case 'DEBUG_REMOVE_ENEMY_STATUS': {
      if (!state.combat) return state
      const enemies = state.combat.enemies.map(e => {
        if (e.instanceId !== action.enemyId) return e
        return { ...e, statusEffects: e.statusEffects.filter(s => s.type !== action.statusType) }
      })
      return {
        ...state,
        combat: { ...state.combat, enemies },
        log: [...state.log, `[DEBUG] Removed ${action.statusType} from enemy`],
      }
    }

    default:
      return state
  }
}

const initialState: HarnessState = {
  mode: 'setup',
  scenario: DEFAULT_SCENARIO,
  combat: null,
  stillHealth: DEFAULT_SCENARIO.health,
  log: [],
  turnStep: 'planning',
  inspiredBonus: 0,
  selectedCardId: null,
  outcome: 'playing',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TestHarness() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const projectedHeat = state.combat
    ? projectHeat(
        state.combat.heat,
        state.scenario.equipment,
        state.combat.slotModifiers,
        buildCardDefs(),
        state.combat,
        state.scenario.passiveCoolingBonus
      )
    : 0

  const targetEnemyId = state.combat?.enemies.find(e => !e.isDefeated)?.instanceId

  if (state.mode === 'setup') {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 22, marginBottom: 16 }}>Combat Test Harness</h1>
        <ScenarioBuilder
          scenario={state.scenario}
          onChange={(s) => dispatch({ type: 'SET_SCENARIO', scenario: s })}
          onStart={() => dispatch({ type: 'START_COMBAT' })}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Combat Test Harness</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => dispatch({ type: 'BACK_TO_SETUP' })}
            style={{
              padding: '6px 14px',
              background: 'var(--bg-surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Back to Setup
          </button>
        </div>
      </div>

      {/* Outcome banner */}
      {state.outcome !== 'playing' && (
        <div style={{
          padding: 16,
          marginBottom: 16,
          borderRadius: 8,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 18,
          background: state.outcome === 'victory'
            ? 'rgba(39, 174, 96, 0.2)'
            : 'rgba(231, 76, 60, 0.2)',
          border: `2px solid ${state.outcome === 'victory' ? 'var(--health)' : 'var(--danger)'}`,
          color: state.outcome === 'victory' ? 'var(--health)' : 'var(--danger)',
        }}>
          {state.outcome === 'victory' ? 'VICTORY' : 'DEFEAT'}
          <div style={{ fontSize: 13, marginTop: 4, fontWeight: 'normal', color: 'var(--muted)' }}>
            Combat ended. Use Debug Controls to continue testing or Reset.
          </div>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <HeatGauge
            heat={state.combat?.heat ?? 0}
            passiveCoolingBonus={state.scenario.passiveCoolingBonus}
            onSetHeat={(heat) => dispatch({ type: 'SET_HEAT', heat })}
          />

          {state.combat && (
            <div style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 12,
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--muted)' }}>Projected Heat after body actions: </span>
              <span style={{ fontWeight: 'bold', color: projectedHeat >= 8 ? 'var(--danger)' : 'var(--text)' }}>
                {projectedHeat}
              </span>
            </div>
          )}

          <EnemyPanel
            combat={state.combat}
            enemyDefs={ALL_ENEMIES}
          />

          <TurnControls
            turnStep={state.turnStep}
            combat={state.combat}
            onExecuteBody={() => dispatch({ type: 'EXECUTE_BODY', targetEnemyId })}
            onExecuteEnemy={() => dispatch({ type: 'EXECUTE_ENEMY' })}
            onEndTurn={() => dispatch({ type: 'END_TURN' })}
            onStartNextTurn={() => dispatch({ type: 'START_NEXT_TURN' })}
          />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StateInspector
            combat={state.combat}
            stillHealth={state.stillHealth}
            maxHealth={state.scenario.maxHealth}
            equipment={state.scenario.equipment}
            parts={state.scenario.parts}
          />

          <BodySlotPanel
            combat={state.combat}
            equipment={state.scenario.equipment}
            selectedCardId={state.selectedCardId}
            onAssign={(slot) => dispatch({ type: 'ASSIGN_MODIFIER', slot })}
            onUnassign={(slot) => dispatch({ type: 'UNASSIGN_MODIFIER', slot })}
          />
        </div>
      </div>

      {/* Hand (full width) */}
      <HandPanel
        combat={state.combat}
        selectedCardId={state.selectedCardId}
        onSelectCard={(id) => dispatch({ type: 'SELECT_CARD', instanceId: id })}
        onPlaySystemCard={(id) => dispatch({ type: 'PLAY_SYSTEM_CARD', instanceId: id, targetEnemyId })}
      />

      {/* Bottom row: Action Log + Debug */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <ActionLog log={state.log} />
        <DebugControls
          combat={state.combat}
          stillHealth={state.stillHealth}
          maxHealth={state.scenario.maxHealth}
          dispatch={dispatch}
          onAutoComplete={() => dispatch({ type: 'AUTO_COMPLETE', targetEnemyId })}
          onReset={() => dispatch({ type: 'RESET_COMBAT' })}
          turnStep={state.turnStep}
        />
      </div>
    </div>
  )
}
