/**
 * Full Sector 1 Run Simulator
 *
 * Simulates an entire S1 run: ~8 combats + boss, with reward selection
 * (growth actions or comfort) between fights. Tracks HP, strain, and
 * action loadout across the full run.
 */

import type { EnemyDefinition, EnemyInstance, SlotLayout, ActionDefinition } from '../game/types'
import { makeEnemyInstance } from '../game/combat'
import {
  initStrainCombat,
  toggleSlotPush,
  toggleVent,
  selectTarget,
  executeStrainTurn,
  STRAIN_DECAY_BETWEEN_COMBATS,
} from '../game/strainCombat'
import { STARTING_SLOT_LAYOUT, ALL_ACTIONS, FINDABLE_ACTIONS, getSynergyForPair } from '../data/actions'
import { planStrainTurn } from './strainHeuristic'

// ─── Types ───────────────────────────────────────────────────────────────

export interface RunSimConfig {
  encounters: EnemyDefinition[][] // combat encounters in order
  boss: EnemyDefinition[]
  startingHealth: number
  startingStrain: number
}

export interface RunSimResult {
  outcome: 'victory' | 'death' | 'forfeit_death'
  combatsWon: number
  totalCombats: number
  finalHealth: number
  finalStrain: number
  finalSlots: (string | null)[]
  acquiredActions: string[]
  deathEncounter?: string
  turnLog: CombatSummary[]
}

export interface CombatSummary {
  encounter: string
  outcome: 'win' | 'loss' | 'forfeit'
  turns: number
  hpBefore: number
  hpAfter: number
  strainBefore: number
  strainAfter: number
  reward?: string // 'comfort:heal' | 'comfort:relief' | 'growth:action-name@slot'
}

// ─── Reward Heuristic ────────────────────────────────────────────────────

function pickReward(
  health: number,
  maxHealth: number,
  strain: number,
  slotLayout: SlotLayout,
  acquiredActions: string[],
  rng: () => number,
): { type: 'comfort'; id: string } | { type: 'growth'; action: ActionDefinition; slotIndex: number } {
  const hasEmptySlot = slotLayout.slots.some(s => s === null)

  // After decay, our effective strain for next combat is strain - 2
  const effectiveStrain = strain - STRAIN_DECAY_BETWEEN_COMBATS

  // Fill empty solo slot eagerly — it's pure upside (more base damage for free)
  if (hasEmptySlot) {
    const available = FINDABLE_ACTIONS.filter(a => !acquiredActions.includes(a.id))
    if (available.length > 0) {
      const action = pickBestAction(available, slotLayout, rng)
      const emptyIdx = slotLayout.slots.indexOf(null)
      const cost = action.takeCost ?? 3
      // Take it if we can afford it and still be under 12 effective strain
      if (effectiveStrain + cost < 12) {
        return { type: 'growth', action, slotIndex: emptyIdx }
      }
    }
  }

  // Critical HP → heal
  if (health < maxHealth * 0.4) {
    return { type: 'comfort', id: 'heal' }
  }

  // High strain → relief (want to enter next combat at strain < 8)
  if (effectiveStrain >= 8) {
    return { type: 'comfort', id: 'relief' }
  }

  // Low strain → good time for growth
  if (effectiveStrain < 6) {
    const available = FINDABLE_ACTIONS.filter(a => !acquiredActions.includes(a.id))
    if (available.length > 0) {
      const action = pickBestAction(available, slotLayout, rng)
      const cost = action.takeCost ?? 3
      if (effectiveStrain + cost < 10) {
        const bestSlot = pickBestSlot(action, slotLayout)
        return { type: 'growth', action, slotIndex: bestSlot }
      }
    }
  }

  // Default comfort
  if (health < maxHealth * 0.6) return { type: 'comfort', id: 'heal' }
  if (strain >= 6) return { type: 'comfort', id: 'relief' }
  return { type: 'comfort', id: 'companion' }
}

/** Pick the best action from available pool */
function pickBestAction(
  available: ActionDefinition[],
  slotLayout: SlotLayout,
  rng: () => number,
): ActionDefinition {
  const scored = available.map(action => {
    let score = 0
    // Synergy potential with existing pair partners
    for (const [a, b] of [[0, 1], [2, 3]] as const) {
      const existingA = slotLayout.slots[a]
      const existingB = slotLayout.slots[b]
      if (existingA) {
        const syn = getSynergyForPair(action.id, existingA)
        if (syn) score += 3
      }
      if (existingB) {
        const syn = getSynergyForPair(action.id, existingB)
        if (syn) score += 3
      }
    }
    // Value sustain actions highly for run sustainability
    if (action.type === 'heal') score += 4
    if (action.type === 'block') score += 3
    if (action.type === 'reduce') score += 3
    // Damage is good but not as critical (base actions already cover it)
    if (action.type === 'damage_single') score += 2
    if (action.type === 'damage_all') score += 1
    // Prefer cheaper actions
    if ((action.takeCost ?? 3) <= 3) score += 1
    // Some randomness
    score += rng() * 2
    return { action, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0].action
}

/** Pick best slot to place action (maximize synergy) */
function pickBestSlot(action: ActionDefinition, slotLayout: SlotLayout): number {
  // Prefer empty slot
  const emptyIdx = slotLayout.slots.indexOf(null)
  if (emptyIdx >= 0) return emptyIdx

  // Score each slot by what synergy placing here creates
  let bestIdx = 4 // default to solo
  let bestScore = -1

  for (let i = 0; i < 5; i++) {
    const existing = slotLayout.slots[i]
    if (!existing) { return i } // empty slot

    // Don't replace Vent
    const existingDef = ALL_ACTIONS[existing]
    if (existingDef?.isVent) continue

    // Check synergy with partner
    let score = 0
    const partnerIdx: number = i < 2 ? (i === 0 ? 1 : 0) : i < 4 ? (i === 2 ? 3 : 2) : -1
    if (partnerIdx >= 0) {
      const partner = slotLayout.slots[partnerIdx as 0 | 1 | 2 | 3 | 4]
      if (partner) {
        const syn = getSynergyForPair(action.id, partner)
        if (syn) score += 5
      }
    }

    // Penalize replacing strong actions
    if (existingDef) {
      const losing = existingDef.pushedValue
      const gaining = action.pushedValue
      score += (gaining - losing) * 0.5
    }

    if (score > bestScore) {
      bestScore = score
      bestIdx = i
    }
  }

  return bestIdx
}

// ─── Single Combat Simulation ────────────────────────────────────────────

function simulateCombat(
  enemyDefs: EnemyDefinition[],
  health: number,
  maxHealth: number,
  strain: number,
  slotLayout: SlotLayout,
  combatsCleared: number,
  rng: () => number,
): { outcome: 'win' | 'loss' | 'forfeit'; turns: number; health: number; strain: number } {
  const enemies: EnemyInstance[] = enemyDefs.map(d => makeEnemyInstance(d, combatsCleared, rng))
  let combat = initStrainCombat(enemies, strain, slotLayout)
  let hp = health
  let turn = 0
  const maxTurns = 30

  while (turn < maxTurns) {
    turn++
    const decision = planStrainTurn(combat, hp, maxHealth)

    let state = combat
    for (let i = 0; i < 5; i++) {
      if (decision.pushedSlots[i] !== state.pushedSlots[i]) {
        state = toggleSlotPush(state, i)
      }
    }
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
      return { outcome: 'win', turns: turn, health: hp, strain: combat.strain }
    }
    if (combat.phase === 'forfeit') {
      return { outcome: 'forfeit', turns: turn, health: hp, strain: combat.strain }
    }
    if (combat.phase === 'finished' || hp <= 0) {
      return { outcome: 'loss', turns: turn, health: 0, strain: combat.strain }
    }
  }

  return { outcome: 'loss', turns: maxTurns, health: hp, strain: combat.strain }
}

// ─── Full Run Simulation ─────────────────────────────────────────────────

function encounterLabel(defs: EnemyDefinition[]): string {
  const counts = new Map<string, number>()
  for (const d of defs) counts.set(d.name, (counts.get(d.name) ?? 0) + 1)
  return [...counts.entries()]
    .map(([name, n]) => n > 1 ? `${name} x${n}` : name)
    .join(' + ')
}

export function simulateRun(config: RunSimConfig, rng: () => number): RunSimResult {
  let health = config.startingHealth
  const maxHealth = config.startingHealth
  let strain = config.startingStrain
  const slotLayout: SlotLayout = { slots: [...STARTING_SLOT_LAYOUT] }
  const acquiredActions: string[] = []
  const turnLog: CombatSummary[] = []
  let combatsWon = 0

  const allEncounters = [...config.encounters, config.boss]

  for (let i = 0; i < allEncounters.length; i++) {
    const enemyDefs = allEncounters[i]
    const label = encounterLabel(enemyDefs)
    const isBoss = i === allEncounters.length - 1
    const hpBefore = health
    const strainBefore = strain

    const result = simulateCombat(enemyDefs, health, maxHealth, strain, slotLayout, combatsWon, rng)

    health = result.health
    strain = result.strain

    const summary: CombatSummary = {
      encounter: isBoss ? `[BOSS] ${label}` : label,
      outcome: result.outcome,
      turns: result.turns,
      hpBefore,
      hpAfter: health,
      strainBefore,
      strainAfter: strain,
    }

    if (result.outcome !== 'win') {
      turnLog.push(summary)
      return {
        outcome: result.outcome === 'forfeit' ? 'forfeit_death' : 'death',
        combatsWon,
        totalCombats: allEncounters.length,
        finalHealth: health,
        finalStrain: strain,
        finalSlots: [...slotLayout.slots],
        acquiredActions,
        deathEncounter: label,
        turnLog,
      }
    }

    combatsWon++

    // Reward selection (not after boss)
    if (!isBoss) {
      const reward = pickReward(health, maxHealth, strain, slotLayout, acquiredActions, rng)
      if (reward.type === 'comfort') {
        if (reward.id === 'heal') health = Math.min(health + 8, maxHealth)
        else if (reward.id === 'relief') strain = Math.max(0, strain - 4)
        else if (reward.id === 'companion') strain = Math.max(0, strain - 2)
        summary.reward = `comfort:${reward.id}`
      } else {
        const cost = reward.action.takeCost ?? 3
        strain = Math.min(strain + cost, 20)
        slotLayout.slots[reward.slotIndex] = reward.action.id
        if (!acquiredActions.includes(reward.action.id)) {
          acquiredActions.push(reward.action.id)
        }
        summary.reward = `growth:${reward.action.name}@slot${reward.slotIndex + 1}`
      }

      // Strain decay between combats
      strain = Math.max(0, strain - STRAIN_DECAY_BETWEEN_COMBATS)
    }

    turnLog.push(summary)
  }

  return {
    outcome: 'victory',
    combatsWon,
    totalCombats: allEncounters.length,
    finalHealth: health,
    finalStrain: strain,
    finalSlots: [...slotLayout.slots],
    acquiredActions,
    turnLog,
  }
}
