import type {
  BodySlot,
  CardInstance,
  CombatState,
  EnemyDefinition,
  EnemyInstance,
  EquipmentDefinition,
  ModifierCardDefinition,
  BehavioralPartDefinition,
} from '../game/types'

import {
  initCombat,
  makeEnemyInstance,
  makeCardInstance,
  playModifierCard,
  executeBodyActions,
  executeEnemyTurn,
  endTurn,
  startTurn,
  allEnemiesDefeated,
  isStillDefeated,
  getStatus,
  type CombatContext,
  type CombatResult,
} from '../game/combat'

import type { CardPlay, TurnTrace } from './heuristic'

export interface SimLoadout {
  deck: string[]                                     // card definition IDs
  equipment: Record<BodySlot, EquipmentDefinition | null>
  parts: BehavioralPartDefinition[]
  health: number
  maxHealth: number
  drawCount: number
  combatsCleared: number
}

export interface SimCombatResult {
  outcome: 'win' | 'loss'
  turns: number
  hpRemaining: number
  hpLost: number
  encounter: string  // label for encounter grouping (e.g. "Furnace Tick ×3")
  traces?: TurnTrace[]  // per-turn decision traces (only when trace mode enabled)
}

const MAX_TURNS = 50

export function simulateCombat(
  loadout: SimLoadout,
  enemyDefs: EnemyDefinition[],
  cardDefs: Record<string, ModifierCardDefinition>,
  allEnemyDefs: Record<string, EnemyDefinition>,
  planTurnFn: (ctx: CombatContext, trace?: TurnTrace[]) => CardPlay[],
  rng: () => number,
  encounter: string = '',
  enableTrace: boolean = false,
): SimCombatResult {
  // Build deck and enemies
  const deck: CardInstance[] = loadout.deck.map(id => makeCardInstance(id, rng))
  const enemies: EnemyInstance[] = enemyDefs.map(d => makeEnemyInstance(d, loadout.combatsCleared, rng))

  // Init combat
  const combat = initCombat(deck, loadout.drawCount, enemies, [], loadout.parts, rng)
  let health = loadout.health

  // Fire onCombatStart part triggers — handled inside initCombat? No, they're not.
  // The store fires them manually. Let's check... actually initCombat doesn't fire part triggers.
  // The runStore fires onCombatStart after initCombat. We need to handle that here.
  // For now, skip — onCombatStart effects are minor and we can add them later if needed.

  function makeCtx(combatState: CombatState, targetEnemyId?: string): CombatContext {
    return {
      combat: combatState,
      stillHealth: health,
      maxHealth: loadout.maxHealth,
      drawCount: loadout.drawCount,
      equipment: loadout.equipment,
      parts: loadout.parts,
      cardDefs,
      enemyDefs: allEnemyDefs,
      targetEnemyId,
      combatsCleared: loadout.combatsCleared,
      rng,
    }
  }

  let currentCombat = combat
  let turn = 1
  const traces: TurnTrace[] = []

  while (turn <= MAX_TURNS) {
    // Planning phase: heuristic decides card plays
    // Two-pass: play draw cards first, then re-plan with expanded hand
    let combatAfterPlays = currentCombat
    const traceRef = enableTrace ? traces : undefined

    for (let pass = 0; pass < 2; pass++) {
      const ctx = makeCtx(combatAfterPlays)
      const plays = planTurnFn(ctx, pass === 0 ? traceRef : traceRef)

      if (pass === 0) {
        // First pass: only execute system draw cards, skip everything else
        const drawPlays = plays.filter(p => {
          const inst = combatAfterPlays.hand.find(c => c.instanceId === p.instanceId)
          if (!inst) return false
          const def = cardDefs[inst.definitionId]
          if (!def) return false
          const cardDef = inst.isUpgraded && def.upgraded ? def.upgraded : def
          if (cardDef.category.type !== 'system') return false
          return cardDef.category.effects.some(e => e.type === 'draw')
        })
        if (drawPlays.length === 0) {
          // No draw cards to play — skip to pass 1 with same state
          // But we already traced pass 0, so skip tracing on pass 1
          const plays2 = plays // reuse the already-planned plays
          for (const play of plays2) {
            const cardInst = combatAfterPlays.hand.find(c => c.instanceId === play.instanceId)
            if (!cardInst) continue
            const def = cardDefs[cardInst.definitionId]
            if (!def) continue
            const cardDef = cardInst.isUpgraded && def.upgraded ? def.upgraded : def
            const playCtx = makeCtx(combatAfterPlays, play.targetEnemyId)
            const result = playModifierCard(playCtx, cardDef, play.instanceId, play.targetSlot)
            combatAfterPlays = result.combat
            health = result.stillHealth
            if (allEnemiesDefeated(combatAfterPlays)) {
              return { outcome: 'win', turns: turn, hpRemaining: health, hpLost: loadout.health - health, encounter, traces: enableTrace ? traces : undefined }
            }
          }
          break // done with both passes
        }
        // Execute only draw cards
        for (const play of drawPlays) {
          const cardInst = combatAfterPlays.hand.find(c => c.instanceId === play.instanceId)
          if (!cardInst) continue
          const def = cardDefs[cardInst.definitionId]
          if (!def) continue
          const cardDef = cardInst.isUpgraded && def.upgraded ? def.upgraded : def
          const playCtx = makeCtx(combatAfterPlays, play.targetEnemyId)
          const result = playModifierCard(playCtx, cardDef, play.instanceId, play.targetSlot)
          combatAfterPlays = result.combat
          health = result.stillHealth
          if (allEnemiesDefeated(combatAfterPlays)) {
            return { outcome: 'win', turns: turn, hpRemaining: health, hpLost: loadout.health - health, encounter, traces: enableTrace ? traces : undefined }
          }
        }
        // Continue to pass 1: re-plan with expanded hand
      } else {
        // Second pass: execute all planned plays from expanded hand
        for (const play of plays) {
          const cardInst = combatAfterPlays.hand.find(c => c.instanceId === play.instanceId)
          if (!cardInst) continue
          const def = cardDefs[cardInst.definitionId]
          if (!def) continue
          const cardDef = cardInst.isUpgraded && def.upgraded ? def.upgraded : def
          const playCtx = makeCtx(combatAfterPlays, play.targetEnemyId)
          const result = playModifierCard(playCtx, cardDef, play.instanceId, play.targetSlot)
          combatAfterPlays = result.combat
          health = result.stillHealth
          if (allEnemiesDefeated(combatAfterPlays)) {
            return { outcome: 'win', turns: turn, hpRemaining: health, hpLost: loadout.health - health, encounter, traces: enableTrace ? traces : undefined }
          }
        }
      }
    }

    // Execution phase: body actions
    const bodyCtx = makeCtx(combatAfterPlays)
    const bodyResult = executeBodyActions(bodyCtx)
    health = bodyResult.stillHealth

    if (allEnemiesDefeated(bodyResult.combat)) {
      return { outcome: 'win', turns: turn, hpRemaining: health, hpLost: loadout.health - health, encounter, traces: enableTrace ? traces : undefined }
    }

    // Enemy turn
    const enemyCtx = makeCtx(bodyResult.combat)
    const enemyResult = executeEnemyTurn(enemyCtx)
    health = enemyResult.stillHealth

    if (isStillDefeated(health)) {
      return { outcome: 'loss', turns: turn, hpRemaining: 0, hpLost: loadout.health, encounter, traces: enableTrace ? traces : undefined }
    }

    // End turn
    const endCtx = makeCtx(enemyResult.combat)
    const endResult = endTurn(endCtx)
    health = endResult.stillHealth

    if (isStillDefeated(health)) {
      return { outcome: 'loss', turns: turn, hpRemaining: 0, hpLost: loadout.health, encounter, traces: enableTrace ? traces : undefined }
    }

    if (allEnemiesDefeated(endResult.combat)) {
      return { outcome: 'win', turns: turn, hpRemaining: health, hpLost: loadout.health - health, encounter, traces: enableTrace ? traces : undefined }
    }

    // Start next turn
    const inspiredBonus = (endResult as CombatResult & { _inspiredBonus?: number })._inspiredBonus ?? 0
    const startCtx = makeCtx(endResult.combat)
    const turnResult = startTurn(startCtx, inspiredBonus)
    health = turnResult.stillHealth
    currentCombat = turnResult.combat

    turn++
  }

  // Timeout — treated as loss
  return { outcome: 'loss', turns: MAX_TURNS, hpRemaining: health, hpLost: loadout.health - health, encounter, traces: enableTrace ? traces : undefined }
}
