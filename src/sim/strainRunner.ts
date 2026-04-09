/**
 * Strain Combat Simulator Runner
 *
 * Runs strain combat against enemy encounters using a heuristic AI.
 * Updated for unified action slot system (5 slots, 2 pairs + 1 solo).
 */

import type { EnemyDefinition, EnemyInstance, SlotLayout } from '../game/types'
import { makeEnemyInstance } from '../game/combat'
import {
  initStrainCombat,
  toggleSlotPush,
  toggleVent,
  selectTarget,
  executeStrainTurn,
} from '../game/strainCombat'
import { planStrainTurn } from './strainHeuristic'

export interface StrainSimLoadout {
  health: number
  maxHealth: number
  strain: number
  slotLayout: SlotLayout
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

  let combat = initStrainCombat(enemies, loadout.strain, loadout.slotLayout)
  let hp = loadout.health
  let turn = 0

  while (turn < MAX_TURNS) {
    turn++

    const decision = planStrainTurn(combat, hp, loadout.maxHealth)

    let state = combat
    // Apply slot pushes
    for (let i = 0; i < 5; i++) {
      if (decision.pushedSlots[i] !== state.pushedSlots[i]) {
        state = toggleSlotPush(state, i)
      }
    }
    // Apply vent
    if (decision.vent && !state.ventActive) {
      state = toggleVent(state)
    }
    if (decision.targetEnemyId) {
      state = selectTarget(state, decision.targetEnemyId)
    }

    const result = executeStrainTurn(state, hp)
    combat = result.combat
    hp = result.health

    if (combat.phase === 'reward') {
      return { outcome: 'win', turns: turn, hpRemaining: hp, hpLost: loadout.health - hp, strainEnd: combat.strain, encounter }
    }
    if (combat.phase === 'forfeit') {
      return { outcome: 'forfeit', turns: turn, hpRemaining: hp, hpLost: loadout.health - hp, strainEnd: combat.strain, encounter }
    }
    if (combat.phase === 'finished' || hp <= 0) {
      return { outcome: 'loss', turns: turn, hpRemaining: 0, hpLost: loadout.health, strainEnd: combat.strain, encounter }
    }
  }

  return { outcome: 'loss', turns: MAX_TURNS, hpRemaining: hp, hpLost: loadout.health - hp, strainEnd: combat.strain, encounter }
}
