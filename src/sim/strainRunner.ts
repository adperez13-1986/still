/**
 * Strain Combat Simulator Runner
 *
 * Runs strain combat against enemy encounters using a heuristic AI.
 * Parallel to the old card combat runner — doesn't replace it.
 */

import type { EnemyDefinition, EnemyInstance } from '../game/types'
import { makeEnemyInstance } from '../game/combat'
import {
  initStrainCombat,
  togglePush,
  toggleAbility,
  selectTarget,
  executeStrainTurn,
  type GrowthState,
} from '../game/strainCombat'
import { planStrainTurn } from './strainHeuristic'

export interface StrainSimLoadout {
  health: number
  maxHealth: number
  strain: number
  growth: GrowthState
  combatsCleared: number
}

export interface StrainSimResult {
  outcome: 'win' | 'loss' | 'forfeit'
  turns: number
  hpRemaining: number
  hpLost: number
  strainEnd: number
  encounter: string
}

const MAX_TURNS = 30

export function simulateStrainCombat(
  loadout: StrainSimLoadout,
  enemyDefs: EnemyDefinition[],
  encounter: string,
  _rng: () => number,
): StrainSimResult {
  const enemies: EnemyInstance[] = enemyDefs.map(d => makeEnemyInstance(d, loadout.combatsCleared, _rng))

  let combat = initStrainCombat(enemies, loadout.strain, loadout.growth)
  let hp = loadout.health
  let turn = 0

  while (turn < MAX_TURNS) {
    turn++

    // Heuristic decides what to do
    const decision = planStrainTurn(combat, hp, loadout.maxHealth, loadout.growth)

    // Apply decisions to combat state
    let state = combat
    for (const slot of ['A', 'B', 'C'] as const) {
      if (decision.pushedSlots[slot] !== state.pushedSlots[slot]) {
        state = togglePush(state, slot)
      }
    }
    for (const abilityId of decision.activeAbilities) {
      state = toggleAbility(state, abilityId)
    }
    if (decision.targetEnemyId) {
      state = selectTarget(state, decision.targetEnemyId)
    }

    // Execute turn
    const result = executeStrainTurn(state, hp)
    combat = result.combat
    hp = result.health

    // Check outcomes
    if (combat.phase === 'reward') {
      return {
        outcome: 'win',
        turns: turn,
        hpRemaining: hp,
        hpLost: loadout.health - hp,
        strainEnd: combat.strain,
        encounter,
      }
    }

    if (combat.phase === 'forfeit') {
      return {
        outcome: 'forfeit',
        turns: turn,
        hpRemaining: hp,
        hpLost: loadout.health - hp,
        strainEnd: combat.strain,
        encounter,
      }
    }

    if (combat.phase === 'finished' || hp <= 0) {
      return {
        outcome: 'loss',
        turns: turn,
        hpRemaining: 0,
        hpLost: loadout.health,
        strainEnd: combat.strain,
        encounter,
      }
    }

    // Combat continues — state should be 'planning' for next turn
  }

  // Timeout
  return {
    outcome: 'loss',
    turns: MAX_TURNS,
    hpRemaining: hp,
    hpLost: loadout.health - hp,
    strainEnd: combat.strain,
    encounter,
  }
}
