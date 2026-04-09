/**
 * Strain Combat Heuristic AI
 *
 * Updated for unified action slot system (5 slots, 2 pairs + 1 solo).
 * Decides which slots to push, whether to vent, and which enemy to target.
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

/** Main heuristic: decide pushes, vent, target */
export function planStrainTurn(
  combat: StrainCombatState,
  _health: number,
  _maxHealth: number,
): StrainDecision {
  const strain = combat.strain
  const maxStrain = combat.maxStrain
  const threat = estimateThreat(combat.enemies)

  const decision: StrainDecision = {
    pushedSlots: [false, false, false, false, false],
    vent: false,
    targetEnemyId: pickTarget(combat.enemies),
  }

  // Vent if strain is high and threat is low
  if (strain >= 14 && threat <= 8) {
    decision.vent = true
    return decision
  }
  if (strain >= 17) {
    decision.vent = true
    return decision
  }

  // Budget: leave 3 buffer before forfeit
  const strainBudget = maxStrain - strain - 3

  // Evaluate each slot
  for (let i = 0; i < 5; i++) {
    const actionId = combat.slotActions[i]
    if (!actionId) continue
    const action = ALL_ACTIONS[actionId]
    if (!action || action.isVent) continue

    const isDefensive = action.type === 'block' || action.type === 'reduce' || action.type === 'heal'
    const isOffensive = action.type === 'damage_single' || action.type === 'damage_all'

    // Push offensive slots if budget allows
    if (isOffensive && strainBudget >= 1) {
      decision.pushedSlots[i] = true
    }
    // Push defensive slots if threat is significant
    if (isDefensive && threat > 5 && strainBudget >= 1) {
      decision.pushedSlots[i] = true
    }
    // Push utility/buff/debuff if budget allows
    if (!isOffensive && !isDefensive && strainBudget >= 1) {
      decision.pushedSlots[i] = true
    }
  }

  // Check total cost won't forfeit
  let totalCost = 0
  for (let i = 0; i < 5; i++) {
    if (decision.pushedSlots[i] && combat.slotActions[i]) totalCost += 1
  }
  // Link tax
  if (decision.pushedSlots[0] && decision.pushedSlots[1] && combat.pairASynergy) totalCost += 1
  if (decision.pushedSlots[2] && decision.pushedSlots[3] && combat.pairBSynergy) totalCost += 1

  if (strain + totalCost >= maxStrain) {
    // Scale back: only push most important slots
    decision.pushedSlots = [false, false, false, false, false]
    // Push one offensive slot
    for (let i = 0; i < 5; i++) {
      const actionId = combat.slotActions[i]
      if (!actionId) continue
      const action = ALL_ACTIONS[actionId]
      if (action && (action.type === 'damage_single' || action.type === 'damage_all') && !action.isVent) {
        decision.pushedSlots[i] = true
        break
      }
    }
  }

  return decision
}
