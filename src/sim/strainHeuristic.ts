/**
 * Strain Combat Heuristic AI
 *
 * Updated for unified action slot system (5 slots, 2 pairs + 1 solo).
 * Decides which slots to push, whether to vent, and which enemy to target.
 * Link tax is now charged on synergy activation, not upfront.
 */

import type { EnemyInstance } from '../game/types'
import {
  getEnemyIntent,
  type StrainCombatState,
} from '../game/strainCombat'
import { ALL_ACTIONS } from '../data/actions'
import { ALL_ENEMIES } from '../data/enemies'

export interface StrainDecision {
  pushedSlots: [boolean, boolean, boolean, boolean, boolean]
  vent: boolean
  targetEnemyId: string | null
}

/** Estimate incoming damage this turn */
function estimateThreat(enemies: EnemyInstance[]): number {
  let total = 0
  for (const enemy of enemies) {
    if (enemy.isDefeated) continue
    const intent = getEnemyIntent(enemy)
    if (!intent) continue
    if (intent.type === 'Attack' || intent.type === 'AttackDebuff') {
      total += intent.value * (intent.hits || 1)
    } else if (intent.type === 'Retaliate') {
      total += (intent.valuePerPush ?? intent.value) * 2
    } else if (intent.type === 'StrainScale') {
      total += intent.value + 2
    } else if (intent.type === 'BerserkerAttack') {
      const hpPct = enemy.currentHealth / enemy.maxHealth
      const mult = hpPct > 0.5 ? 1 : hpPct > 0.25 ? 2 : 3
      total += intent.value * mult
    } else if (intent.type === 'Leech') {
      total += intent.value
    } else if (intent.type === 'Charge') {
      if (enemy.chargeCounter === 0) total += intent.blastValue ?? intent.value
    } else if (intent.type === 'PhaseShift') {
      total += intent.value
    } else if (intent.type === 'Enrage') {
      total += intent.value + (enemy.enrageStacks ?? 0)
    } else if (intent.type === 'MartyrHeal') {
      total += intent.value
    }
  }
  return total
}

/** Pick best target */
function pickTarget(enemies: EnemyInstance[]): string | null {
  const alive = enemies.filter(e => !e.isDefeated)
  if (alive.length === 0) return null
  const parasite = alive.find(e => {
    const def = ALL_ENEMIES[e.definitionId]
    return def?.intentPattern.some(i => i.type === 'StrainTick')
  })
  if (parasite) return parasite.instanceId
  const pylon = alive.find(e => {
    const def = ALL_ENEMIES[e.definitionId]
    return def?.intentPattern.some(i => i.type === 'ShieldAllies')
  })
  if (pylon) return pylon.instanceId
  alive.sort((a, b) => a.currentHealth - b.currentHealth)
  return alive[0].instanceId
}

/** Check if any retaliator is about to fire */
function hasRetaliator(enemies: EnemyInstance[]): boolean {
  return enemies.some(e => {
    if (e.isDefeated) return false
    const intent = getEnemyIntent(e)
    return intent?.type === 'Retaliate'
  })
}

/** Main heuristic: decide pushes, vent, target */
export function planStrainTurn(
  combat: StrainCombatState,
  health: number,
  maxHealth: number,
): StrainDecision {
  const strain = combat.strain
  const maxStrain = combat.maxStrain
  const threat = estimateThreat(combat.enemies)
  const aliveCount = combat.enemies.filter(e => !e.isDefeated).length
  const retaliate = hasRetaliator(combat.enemies)

  const decision: StrainDecision = {
    pushedSlots: [false, false, false, false, false],
    vent: false,
    targetEnemyId: pickTarget(combat.enemies),
  }

  // Vent if strain is very high
  if (strain >= 16) {
    decision.vent = true
    return decision
  }
  // Vent if strain is high and threat is manageable
  if (strain >= 12 && threat <= 8) {
    decision.vent = true
    return decision
  }

  // Budget: push cost only (link tax is conditional now, charged on activation)
  // Leave 4 buffer: 3 for safety + 1 for potential synergy activation
  const strainBudget = maxStrain - strain - 4

  if (strainBudget <= 0) {
    // No budget — don't push anything, base values only
    return decision
  }

  // Score each slot by situational value
  const slotScores: { index: number; score: number }[] = []

  for (let i = 0; i < 5; i++) {
    const actionId = combat.slotActions[i]
    if (!actionId) continue
    const action = ALL_ACTIONS[actionId]
    if (!action || action.isVent) continue

    let score = 0
    const pushGain = action.pushedValue - action.baseValue

    if (action.type === 'damage_single') {
      score = pushGain * 2 // offensive value
      if (retaliate) score *= 0.3 // penalize against retaliators
    } else if (action.type === 'damage_all') {
      score = pushGain * aliveCount // more enemies = more value
      if (retaliate) score *= 0.3
    } else if (action.type === 'block') {
      score = threat > 5 ? pushGain * 1.5 : pushGain * 0.5
    } else if (action.type === 'heal') {
      score = health < maxHealth * 0.5 ? pushGain * 2 : pushGain * 0.3
    } else if (action.type === 'reduce') {
      score = threat > 10 ? pushGain * 2 : pushGain * 0.5
    } else {
      score = pushGain > 0 ? pushGain : 1 // buff/debuff/utility: modest value
    }

    slotScores.push({ index: i, score })
  }

  // Sort by value descending, push the best ones within budget
  slotScores.sort((a, b) => b.score - a.score)

  let spent = 0
  for (const { index } of slotScores) {
    if (spent + 1 > strainBudget) break
    decision.pushedSlots[index] = true
    spent += 1
  }

  // Final safety: verify total push cost won't forfeit
  let totalCost = 0
  for (let i = 0; i < 5; i++) {
    if (decision.pushedSlots[i] && combat.slotActions[i]) totalCost += 1
  }
  if (strain + totalCost >= maxStrain) {
    decision.pushedSlots = [false, false, false, false, false]
  }

  return decision
}
