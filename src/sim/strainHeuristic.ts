/**
 * Strain Combat Heuristic AI
 *
 * Unified action slot system (5 slots, 2 pairs + 1 solo).
 * Optimized for multi-combat runs: conservative strain management,
 * push only when the value justifies the permanent strain cost.
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

/** Total remaining enemy HP */
function totalEnemyHp(enemies: EnemyInstance[]): number {
  return enemies.filter(e => !e.isDefeated).reduce((s, e) => s + e.currentHealth + e.block, 0)
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

/** Main heuristic */
export function planStrainTurn(
  combat: StrainCombatState,
  health: number,
  maxHealth: number,
): StrainDecision {
  const strain = combat.strain
  const maxStrain = combat.maxStrain
  const threat = estimateThreat(combat.enemies)
  const aliveCount = combat.enemies.filter(e => !e.isDefeated).length
  const enemyHp = totalEnemyHp(combat.enemies)

  const decision: StrainDecision = {
    pushedSlots: [false, false, false, false, false],
    vent: false,
    targetEnemyId: pickTarget(combat.enemies),
  }

  // Vent proactively to keep strain manageable across a full run
  // As strain rises, tolerate more threat (accept HP loss to save the run)
  const ventThreshold = health > maxHealth * 0.5 ? 7 : 11
  if (strain >= ventThreshold) {
    const threatTolerance = 8 + (strain - ventThreshold) * 4
    if (threat <= threatTolerance) {
      decision.vent = true
      return decision
    }
  }
  // Emergency vent at strain 14+ regardless of threat
  if (strain >= 14) {
    decision.vent = true
    return decision
  }

  // Strain budget: be conservative — want to end combat around strain 6-10
  // so next combat starts at 4-8 after decay
  const pushBudget = Math.min(
    3, // never push more than 3 per turn
    Math.max(0, Math.floor((maxStrain - strain - 6) / 2)) // leave room for future turns
  )

  if (pushBudget <= 0) {
    // No budget — rely on base values, maybe vent next turn
    return decision
  }

  // Score each slot
  const slotScores: { index: number; score: number }[] = []

  for (let i = 0; i < 5; i++) {
    const actionId = combat.slotActions[i]
    if (!actionId) continue
    const action = ALL_ACTIONS[actionId]
    if (!action || action.isVent) continue

    const pushGain = action.pushedValue - action.baseValue
    let score = 0

    if (action.type === 'damage_single' || action.type === 'damage_all') {
      // Push damage when enemies are close to dying (get the kill)
      const canKill = enemyHp < (action.pushedValue * (action.type === 'damage_all' ? aliveCount : 1)) * 2
      score = canKill ? pushGain * 3 : pushGain * 1
    } else if (action.type === 'block') {
      score = threat > 8 ? pushGain * 2 : 0 // only push block against real threats
    } else if (action.type === 'heal') {
      score = health < maxHealth * 0.5 ? pushGain * 2 : 0
    } else if (action.type === 'reduce') {
      score = threat > 12 ? pushGain * 2 : 0
    } else {
      score = pushGain > 0 ? pushGain : 0.5
    }

    if (score > 0) slotScores.push({ index: i, score })
  }

  // Push the best slots within budget
  slotScores.sort((a, b) => b.score - a.score)
  let spent = 0
  for (const { index } of slotScores) {
    if (spent >= pushBudget) break
    decision.pushedSlots[index] = true
    spent++
  }

  // Final safety
  let totalCost = decision.pushedSlots.filter((p, i) => p && combat.slotActions[i]).length
  if (strain + totalCost >= maxStrain) {
    decision.pushedSlots = [false, false, false, false, false]
  }

  return decision
}
