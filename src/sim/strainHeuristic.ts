/**
 * Strain Combat Heuristic AI
 *
 * Decides which slots to push, which abilities to use, which enemy to target,
 * and when to vent. Simple but non-trivial — avoids "push everything always."
 */

import type { EnemyInstance } from '../game/types'
import {
  STRAIN_SLOTS,
  STRAIN_ABILITIES,
  DEFAULT_ABILITIES,
  OVEREXTEND_PENALTY,
  getEnemyIntent,
  type StrainCombatState,
  type GrowthState,
} from '../game/strainCombat'
import { ALL_ENEMIES } from '../data/enemies'

export interface StrainDecision {
  pushedSlots: Record<'A' | 'B' | 'C', boolean>
  activeAbilities: string[]
  targetEnemyId: string | null
}

/** Get available ability IDs based on growth */
function availableAbilityIds(growth: GrowthState): string[] {
  return [...DEFAULT_ABILITIES, ...growth.rewards.filter(id => id === 'repair' || id === 'brace')]
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
      total += (intent.valuePerPush ?? intent.value) * 2 // assume 2 pushes
    } else if (intent.type === 'StrainScale') {
      total += intent.value + 2 // rough estimate
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

/** Pick best target — lowest HP enemy that's alive, prioritizing threats */
function pickTarget(enemies: EnemyInstance[]): string | null {
  const alive = enemies.filter(e => !e.isDefeated)
  if (alive.length === 0) return null

  // Priority: Strain Parasite (strain ticking) > Shield Generator > lowest HP
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

  // Lowest HP
  alive.sort((a, b) => a.currentHealth - b.currentHealth)
  return alive[0].instanceId
}

/** Count how many retaliators are alive */
function countRetaliators(enemies: EnemyInstance[]): number {
  return enemies.filter(e => {
    if (e.isDefeated) return false
    const intent = getEnemyIntent(e)
    return intent?.type === 'Retaliate'
  }).length
}

/** Main heuristic: decide pushes, abilities, target */
export function planStrainTurn(
  combat: StrainCombatState,
  health: number,
  maxHealth: number,
  growth: GrowthState,
): StrainDecision {
  const strain = combat.strain
  const maxStrain = combat.maxStrain
  const threat = estimateThreat(combat.enemies)
  const abilities = availableAbilityIds(growth)
  const hasRepair = abilities.includes('repair')
  const hasBrace = abilities.includes('brace')
  const hasVent = abilities.includes('vent')

  const retaliators = countRetaliators(combat.enemies)

  // Start with no pushes, no abilities
  const decision: StrainDecision = {
    pushedSlots: { A: false, B: false, C: false },
    activeAbilities: [],
    targetEnemyId: pickTarget(combat.enemies),
  }

  // Vent if strain is high (>= 14) and threat is low
  if (hasVent && strain >= 14 && threat <= 8) {
    decision.activeAbilities.push('vent')
    return decision
  }

  // Vent if strain is very high (>= 17) regardless
  if (hasVent && strain >= 17) {
    decision.activeAbilities.push('vent')
    // Still use Repair if available and HP is low
    if (hasRepair && health < maxHealth * 0.4) {
      decision.activeAbilities.push('repair')
    }
    return decision
  }

  // Push decisions based on strain budget
  const strainBudget = maxStrain - strain - 3 // leave buffer of 3 before forfeit

  // Push Strike if we can afford it and no retaliator penalty outweighs it
  if (combat.pushCosts.A <= strainBudget && retaliators === 0) {
    decision.pushedSlots.A = true
  } else if (combat.pushCosts.A === 0) {
    decision.pushedSlots.A = true // free push always
  }

  // Push Shield if enemy is attacking
  if (threat > 5 && combat.pushCosts.B <= strainBudget) {
    decision.pushedSlots.B = true
  } else if (combat.pushCosts.B === 0) {
    decision.pushedSlots.B = true
  }

  // Push Barrage if multiple enemies alive
  const aliveCount = combat.enemies.filter(e => !e.isDefeated).length
  if (aliveCount > 1 && combat.pushCosts.C <= strainBudget) {
    decision.pushedSlots.C = true
  } else if (combat.pushCosts.C === 0) {
    decision.pushedSlots.C = true
  }

  // Use Brace if threat is high
  if (hasBrace && threat > 12 && strain + 1 < maxStrain - 2) {
    decision.activeAbilities.push('brace')
  }

  // Use Repair if HP is low
  if (hasRepair && health < maxHealth * 0.5 && strain + 1 < maxStrain - 2) {
    decision.activeAbilities.push('repair')
  }

  // Check overextension: if all actions are active, drop the least valuable one
  const totalActions = Object.values(decision.pushedSlots).filter(Boolean).length
    + decision.activeAbilities.filter(id => id !== 'vent').length
  const totalAvailable = STRAIN_SLOTS.length
    + STRAIN_ABILITIES.filter(a => a.id !== 'vent' && abilities.includes(a.id)).length

  if (totalAvailable >= 4 && totalActions >= totalAvailable) {
    // Drop lowest value push to avoid overextension penalty
    if (aliveCount <= 1 && decision.pushedSlots.C) {
      decision.pushedSlots.C = false // don't push AoE against single enemy
    } else if (threat <= 5 && decision.pushedSlots.B) {
      decision.pushedSlots.B = false // skip shield if low threat
    } else if (decision.pushedSlots.A && retaliators > 0) {
      decision.pushedSlots.A = false // skip strike against retaliator
    }
  }

  // Final safety: don't forfeit
  let totalCost = 0
  for (const slot of STRAIN_SLOTS) {
    if (decision.pushedSlots[slot.id]) totalCost += combat.pushCosts[slot.id]
  }
  for (const abilityId of decision.activeAbilities) {
    const ability = STRAIN_ABILITIES.find(a => a.id === abilityId)
    if (ability && ability.id !== 'vent') totalCost += ability.strainCost
  }
  // Check overextension
  const finalActions = Object.values(decision.pushedSlots).filter(Boolean).length
    + decision.activeAbilities.filter(id => id !== 'vent').length
  if (totalAvailable >= 4 && finalActions >= totalAvailable) {
    totalCost += OVEREXTEND_PENALTY
  }

  if (strain + totalCost >= maxStrain) {
    // Too expensive — scale back to just free pushes
    decision.pushedSlots = { A: combat.pushCosts.A === 0, B: combat.pushCosts.B === 0, C: combat.pushCosts.C === 0 }
    decision.activeAbilities = []
  }

  return decision
}
