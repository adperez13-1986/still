/**
 * Strain Combat Heuristic AI
 *
 * Unified action slot system (5 slots, 2 pairs + 1 solo).
 * Behavior is driven by a HeuristicProfile that tunes vent/push aggression
 * and slot scoring weights. See src/sim/strainProfiles.ts.
 */

import type { EnemyInstance } from '../game/types'
import {
  getEnemyIntent,
  type StrainCombatState,
} from '../game/strainCombat'
import { ALL_ACTIONS } from '../data/actions'
import { ALL_ENEMIES } from '../data/enemies'
import type { HeuristicProfile } from './strainProfiles'
import { BALANCED_PROFILE } from './strainProfiles'

export interface StrainDecision {
  pushedSlots: [boolean, boolean, boolean, boolean, boolean]
  vent: boolean
  targetEnemyId: string | null
}

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

function totalEnemyHp(enemies: EnemyInstance[]): number {
  return enemies.filter(e => !e.isDefeated).reduce((s, e) => s + e.currentHealth + e.block, 0)
}

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

export function planStrainTurn(
  combat: StrainCombatState,
  health: number,
  maxHealth: number,
  profile: HeuristicProfile = BALANCED_PROFILE,
): StrainDecision {
  const strain = combat.strain
  const maxStrain = combat.maxStrain
  const threat = estimateThreat(combat.enemies)
  const aliveCount = combat.enemies.filter(e => !e.isDefeated).length
  const enemyHp = totalEnemyHp(combat.enemies)
  const hpRatio = health / maxHealth

  const decision: StrainDecision = {
    pushedSlots: [false, false, false, false, false],
    vent: false,
    targetEnemyId: pickTarget(combat.enemies),
  }

  // Emergency vent
  if (strain >= profile.emergencyVentStrain) {
    decision.vent = true
    return decision
  }

  // Conditional vent based on HP
  const ventThreshold = hpRatio >= profile.healthyHpRatio
    ? profile.ventStrainThresholdHealthy
    : profile.ventStrainThresholdLowHp
  if (strain >= ventThreshold) {
    const threatTolerance = 8 + (strain - ventThreshold) * 4
    if (threat <= threatTolerance) {
      decision.vent = true
      return decision
    }
  }

  // Budget calculation
  const pushBudget = Math.min(
    profile.maxPushesPerTurn,
    Math.max(0, Math.floor((maxStrain - strain - profile.strainBuffer) / 2))
  )
  if (pushBudget <= 0) return decision

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
      const canKill = enemyHp < (action.pushedValue * (action.type === 'damage_all' ? aliveCount : 1)) * 2
      score = (canKill ? pushGain * 3 : pushGain * 1) * profile.damageScoreMultiplier
    } else if (action.type === 'block') {
      score = (threat > 8 ? pushGain * 2 : pushGain * 0.5) * profile.blockScoreMultiplier
    } else if (action.type === 'heal') {
      score = (health < maxHealth * 0.5 ? pushGain * 2 : pushGain * 0.3) * profile.healSlotScoreMultiplier
    } else if (action.type === 'reduce') {
      score = (threat > 12 ? pushGain * 2 : pushGain * 0.5) * profile.reduceScoreMultiplier
    } else {
      score = (pushGain > 0 ? pushGain : 0.5) * profile.utilityScoreMultiplier
    }

    if (score > 0) slotScores.push({ index: i, score })
  }

  slotScores.sort((a, b) => b.score - a.score)
  let spent = 0
  for (const { index } of slotScores) {
    if (spent >= pushBudget) break
    decision.pushedSlots[index] = true
    spent++
  }

  // Safety: don't forfeit
  const totalCost = decision.pushedSlots.filter((p, i) => p && combat.slotActions[i]).length
  if (strain + totalCost >= maxStrain) {
    decision.pushedSlots = [false, false, false, false, false]
  }

  return decision
}
