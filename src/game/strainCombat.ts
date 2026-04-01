/**
 * Strain Combat Prototype
 *
 * Self-contained combat system for testing the strain meter feel.
 * 3 hardcoded slots, push mechanic, strain accumulates permanently.
 * No cards, no deck, no equipment lookups.
 */

import type { EnemyInstance, Intent, IntentType } from './types'
import { ALL_ENEMIES } from '../data/enemies'

// ─── Constants ────────────────────────────────────────────────────────────

/** Strain recovered passively between combats */
export const STRAIN_DECAY_BETWEEN_COMBATS = 2

/** Strain recovered when venting (skip all attacks for a turn) */
export const VENT_STRAIN_RECOVERY = 4

// ─── Slot Definitions ──────────────────────────────────────────────────────

export interface StrainSlot {
  id: 'A' | 'B' | 'C'
  label: string
  baseValue: number
  pushedValue: number
  pushCost: number
  type: 'damage_single' | 'block' | 'damage_all'
}

export const STRAIN_SLOTS: StrainSlot[] = [
  { id: 'A', label: 'Strike',  baseValue: 6, pushedValue: 9, pushCost: 1, type: 'damage_single' },
  { id: 'B', label: 'Shield',  baseValue: 5, pushedValue: 7, pushCost: 1, type: 'block' },
  { id: 'C', label: 'Barrage', baseValue: 4, pushedValue: 6, pushCost: 1, type: 'damage_all' },
]

// ─── Abilities ─────────────────────────────────────────────────────────────

export interface StrainAbility {
  id: string
  label: string
  description: string
  strainCost: number
}

export const STRAIN_ABILITIES: StrainAbility[] = [
  { id: 'repair', label: 'Repair', description: 'Heal 4 HP', strainCost: 1 },
  { id: 'brace', label: 'Brace', description: 'Reduce incoming damage by 3 per hit', strainCost: 1 },
  { id: 'vent', label: 'Vent', description: `Release ${4} strain. Skip all attacks this turn.`, strainCost: 0 },
]

// ─── Combat State ──────────────────────────────────────────────────────────

export type StrainCombatPhase = 'planning' | 'executing' | 'enemyTurn' | 'reward' | 'forfeit' | 'finished'

export interface StrainCombatEvent {
  type: 'slotFire' | 'enemyAction' | 'forfeit' | 'ability'
  slotId?: 'A' | 'B' | 'C'
  slotLabel?: string
  damage?: number
  block?: number
  heal?: number
  enemyId?: string
  enemyName?: string
  intentType?: IntentType
  blocked?: number
  reduced?: number
  abilityId?: string
  abilityLabel?: string
}

export interface StrainCombatState {
  phase: StrainCombatPhase
  enemies: EnemyInstance[]
  strain: number
  maxStrain: number
  block: number
  damageReduction: number
  pushedSlots: Record<'A' | 'B' | 'C', boolean>
  activeAbilities: string[]
  selectedTargetId: string | null
  roundNumber: number
  combatLog: StrainCombatEvent[]
}

// ─── Init ──────────────────────────────────────────────────────────────────

export function initStrainCombat(
  enemies: EnemyInstance[],
  currentStrain: number,
): StrainCombatState {
  return {
    phase: 'planning',
    enemies,
    strain: currentStrain,
    maxStrain: 20,
    block: 0,
    damageReduction: 0,
    pushedSlots: { A: false, B: false, C: false },
    activeAbilities: [],
    selectedTargetId: enemies.find(e => !e.isDefeated)?.instanceId ?? null,
    roundNumber: 1,
    combatLog: [],
  }
}

// ─── Ability Toggle ────────────────────────────────────────────────────────

export function toggleAbility(
  state: StrainCombatState,
  abilityId: string,
): StrainCombatState {
  const active = state.activeAbilities.includes(abilityId)
  return {
    ...state,
    activeAbilities: active
      ? state.activeAbilities.filter(id => id !== abilityId)
      : [...state.activeAbilities, abilityId],
  }
}

// ─── Target Selection ──────────────────────────────────────────────────

export function selectTarget(
  state: StrainCombatState,
  enemyInstanceId: string,
): StrainCombatState {
  return { ...state, selectedTargetId: enemyInstanceId }
}

// ─── Push Toggle ───────────────────────────────────────────────────────────

export function togglePush(
  state: StrainCombatState,
  slotId: 'A' | 'B' | 'C',
): StrainCombatState {
  return {
    ...state,
    pushedSlots: {
      ...state.pushedSlots,
      [slotId]: !state.pushedSlots[slotId],
    },
  }
}

/** Is vent currently toggled on? */
export function isVenting(state: StrainCombatState): boolean {
  return state.activeAbilities.includes('vent')
}

/** Calculate total strain cost of current push selections + active abilities */
export function projectedStrainCost(state: StrainCombatState): number {
  // Venting reduces strain and skips attacks — pushes are ignored
  if (isVenting(state)) {
    const abilityCost = STRAIN_ABILITIES.reduce((sum, ability) => {
      if (ability.id === 'vent') return sum
      return sum + (state.activeAbilities.includes(ability.id) ? ability.strainCost : 0)
    }, 0)
    return abilityCost - VENT_STRAIN_RECOVERY
  }
  const pushCost = STRAIN_SLOTS.reduce((sum, slot) => {
    return sum + (state.pushedSlots[slot.id] ? slot.pushCost : 0)
  }, 0)
  const abilityCost = STRAIN_ABILITIES.reduce((sum, ability) => {
    return sum + (state.activeAbilities.includes(ability.id) ? ability.strainCost : 0)
  }, 0)
  return pushCost + abilityCost
}

/** Strain value after current push selections are confirmed */
export function projectedStrain(state: StrainCombatState): number {
  return Math.max(0, state.strain + projectedStrainCost(state))
}

/** Would current selections trigger forfeit? */
export function wouldForfeit(state: StrainCombatState): boolean {
  return projectedStrain(state) >= state.maxStrain
}

// ─── Execute Turn ──────────────────────────────────────────────────────────

export function executeStrainTurn(
  state: StrainCombatState,
  health: number,
): { combat: StrainCombatState; health: number } {
  let combat = { ...state, combatLog: [] as StrainCombatEvent[], phase: 'executing' as StrainCombatPhase }
  let hp = health

  // 1. Deduct strain for pushed slots (or recover if venting)
  const venting = isVenting(combat)
  const strainCost = projectedStrainCost(combat)
  combat.strain = Math.max(0, Math.min(combat.strain + strainCost, combat.maxStrain))

  // 2. Check forfeit
  if (combat.strain >= combat.maxStrain) {
    combat.strain = 14 // drops to 70% of max after forfeit
    combat.phase = 'forfeit'
    combat.combatLog.push({ type: 'forfeit' })
    return { combat, health: hp }
  }

  // 2.5. Resolve abilities
  combat.damageReduction = 0
  for (const abilityId of combat.activeAbilities) {
    const ability = STRAIN_ABILITIES.find(a => a.id === abilityId)
    if (!ability) continue

    if (ability.id === 'repair') {
      hp = Math.min(hp + 4, 70) // cap at max health (hardcoded for prototype)
      combat.combatLog.push({ type: 'ability', abilityId: 'repair', abilityLabel: 'Repair', heal: 4 })
    } else if (ability.id === 'brace') {
      combat.damageReduction = 3
      combat.combatLog.push({ type: 'ability', abilityId: 'brace', abilityLabel: 'Brace' })
    } else if (ability.id === 'vent') {
      combat.combatLog.push({ type: 'ability', abilityId: 'vent', abilityLabel: 'Vent' })
    }
  }

  // 3. Fire slots in order: A → B → C (skipped when venting)
  const enemies = combat.enemies.map(e => ({ ...e }))

  if (!venting) {
    for (const slot of STRAIN_SLOTS) {
      const pushed = combat.pushedSlots[slot.id]
      const value = pushed ? slot.pushedValue : slot.baseValue

      if (slot.type === 'damage_single') {
        // Hit selected target, or first alive enemy as fallback
        const target = enemies.find(e => e.instanceId === combat.selectedTargetId && !e.isDefeated)
          || enemies.find(e => !e.isDefeated)
        if (target) {
          const blocked = Math.min(target.block, value)
          target.block -= blocked
          const actualDamage = value - blocked
          target.currentHealth = Math.max(0, target.currentHealth - actualDamage)
          if (target.currentHealth <= 0) target.isDefeated = true
          combat.combatLog.push({
            type: 'slotFire',
            slotId: slot.id,
            slotLabel: slot.label,
            damage: actualDamage,
            enemyId: target.instanceId,
          })
        }
      } else if (slot.type === 'block') {
        combat.block += value
        combat.combatLog.push({
          type: 'slotFire',
          slotId: slot.id,
          slotLabel: slot.label,
          block: value,
        })
      } else if (slot.type === 'damage_all') {
        for (const enemy of enemies) {
          if (enemy.isDefeated) continue
          const blocked = Math.min(enemy.block, value)
          enemy.block -= blocked
          const actualDamage = value - blocked
          enemy.currentHealth = Math.max(0, enemy.currentHealth - actualDamage)
          if (enemy.currentHealth <= 0) enemy.isDefeated = true
          combat.combatLog.push({
            type: 'slotFire',
            slotId: slot.id,
            slotLabel: slot.label,
            damage: actualDamage,
            enemyId: enemy.instanceId,
          })
        }
      }
    }
  }

  combat.enemies = enemies

  // 4. Check win
  if (enemies.every(e => e.isDefeated)) {
    combat.phase = 'reward'
    return { combat, health: hp }
  }

  // 5. Enemy turn
  combat.phase = 'enemyTurn'
  for (const enemy of combat.enemies) {
    if (enemy.isDefeated) continue

    const def = ALL_ENEMIES[enemy.definitionId]
    if (!def) continue

    const intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]
    enemy.intentIndex++

    if (intent.type === 'Attack' || intent.type === 'AttackDebuff') {
      const hits = intent.hits || 1
      for (let h = 0; h < hits; h++) {
        let dmg = intent.value
        // Apply Brace damage reduction per hit
        const reduced = Math.min(combat.damageReduction, dmg)
        dmg -= reduced
        const blocked = Math.min(combat.block, dmg)
        combat.block -= blocked
        const actual = dmg - blocked
        hp -= actual
        combat.combatLog.push({
          type: 'enemyAction',
          enemyId: enemy.instanceId,
          enemyName: def.name,
          intentType: intent.type,
          damage: actual,
          blocked,
          reduced: reduced > 0 ? reduced : undefined,
        })
      }
    } else if (intent.type === 'Block') {
      enemy.block += intent.value
      combat.combatLog.push({
        type: 'enemyAction',
        enemyId: enemy.instanceId,
        enemyName: def.name,
        intentType: 'Block',
        block: intent.value,
      })
    } else if (intent.type === 'Buff') {
      // Simplified: just add block as a stand-in for buff
      enemy.block += intent.value
      combat.combatLog.push({
        type: 'enemyAction',
        enemyId: enemy.instanceId,
        enemyName: def.name,
        intentType: 'Buff',
      })
    } else {
      // Scan, Debuff, DisableSlot — skip for prototype
      combat.combatLog.push({
        type: 'enemyAction',
        enemyId: enemy.instanceId,
        enemyName: def.name,
        intentType: intent.type,
      })
    }
  }

  // 6. Check loss
  if (hp <= 0) {
    combat.phase = 'finished'
    return { combat, health: 0 }
  }

  // 7. Start next turn
  combat.block = 0 // block resets
  combat.damageReduction = 0 // brace resets
  combat.pushedSlots = { A: false, B: false, C: false }
  combat.activeAbilities = [] // abilities reset
  // Auto-retarget if current target is dead
  const currentTarget = combat.enemies.find(e => e.instanceId === combat.selectedTargetId && !e.isDefeated)
  if (!currentTarget) {
    combat.selectedTargetId = combat.enemies.find(e => !e.isDefeated)?.instanceId ?? null
  }
  combat.roundNumber++
  combat.phase = 'planning'

  return { combat, health: hp }
}

// ─── Helper: get current enemy intent for display ──────────────────────────

export function getEnemyIntent(enemy: EnemyInstance): Intent | null {
  const def = ALL_ENEMIES[enemy.definitionId]
  if (!def) return null
  return def.intentPattern[enemy.intentIndex % def.intentPattern.length]
}
