/**
 * Unified Action Slot Combat System
 *
 * 5 action slots: 2 linked pairs + 1 solo.
 * Push any slot for 1 strain. Push both in a pair for 3 (link tax).
 * Synergies emerge from type combinations in linked pairs.
 * Strain accumulates permanently — the core tension.
 */

import type { EnemyInstance, Intent, IntentType, SlotLayout, SynergyId, SynergyEffect } from './types'
import { ALL_ENEMIES } from '../data/enemies'
import { ALL_ACTIONS, getSynergyForPair } from '../data/actions'

// ─── Constants ────────────────────────────────────────────────────────────

export const STRAIN_DECAY_BETWEEN_COMBATS = 4
export const VENT_STRAIN_RECOVERY = 5

// ─── Combat State ─────────────────────────────────────────────────────────

export type StrainCombatPhase = 'planning' | 'executing' | 'enemyTurn' | 'reward' | 'forfeit' | 'finished'

export interface StrainCombatEvent {
  type: 'slotFire' | 'enemyAction' | 'forfeit' | 'synergy'
  slotIndex?: number
  slotLabel?: string
  damage?: number
  block?: number
  heal?: number
  strainChange?: number
  enemyId?: string
  enemyName?: string
  intentType?: IntentType
  blocked?: number
  reduced?: number
  synergyName?: string
}

export interface StrainCombatState {
  phase: StrainCombatPhase
  enemies: EnemyInstance[]
  strain: number
  maxStrain: number
  block: number
  damageReduction: number
  reflectPct: number
  // 5 action slots
  slotActions: [string | null, string | null, string | null, string | null, string | null]
  pushedSlots: [boolean, boolean, boolean, boolean, boolean]
  // Synergy info (computed at init)
  pairASynergy: SynergyEffect | null
  pairBSynergy: SynergyEffect | null
  // Vent
  ventActive: boolean
  // Targeting
  selectedTargetId: string | null
  // Turn tracking
  roundNumber: number
  combatLog: StrainCombatEvent[]
  // Buffs
  secondWindBonus: number // +N base value this turn from Second Wind
  mendHealRemaining: number // heal over turns remaining
}

// ─── Init ─────────────────────────────────────────────────────────────────

export function initStrainCombat(
  enemies: EnemyInstance[],
  currentStrain: number,
  slotLayout: SlotLayout,
): StrainCombatState {
  return {
    phase: 'planning',
    enemies,
    strain: currentStrain,
    maxStrain: 20,
    block: 0,
    damageReduction: 0,
    reflectPct: 0,
    slotActions: [...slotLayout.slots],
    pushedSlots: [false, false, false, false, false],
    pairASynergy: getSynergyForPair(slotLayout.slots[0], slotLayout.slots[1]),
    pairBSynergy: getSynergyForPair(slotLayout.slots[2], slotLayout.slots[3]),
    ventActive: false,
    selectedTargetId: enemies.find(e => !e.isDefeated)?.instanceId ?? null,
    roundNumber: 1,
    combatLog: [],
    secondWindBonus: 0,
    mendHealRemaining: 0,
  }
}

// ─── Toggle Helpers ───────────────────────────────────────────────────────

export function toggleSlotPush(state: StrainCombatState, index: number): StrainCombatState {
  const action = state.slotActions[index]
  if (!action) return state
  const def = ALL_ACTIONS[action]
  if (def?.isVent) return state // Vent can't be pushed
  const next = { ...state, pushedSlots: [...state.pushedSlots] as StrainCombatState['pushedSlots'] }
  next.pushedSlots[index] = !next.pushedSlots[index]
  return next
}

export function toggleVent(state: StrainCombatState): StrainCombatState {
  return { ...state, ventActive: !state.ventActive }
}

export function selectTarget(state: StrainCombatState, enemyInstanceId: string): StrainCombatState {
  return { ...state, selectedTargetId: enemyInstanceId }
}

// ─── Cost Calculation ─────────────────────────────────────────────────────

export function projectedStrainCost(state: StrainCombatState): number {
  if (state.ventActive) {
    return -VENT_STRAIN_RECOVERY
  }
  let cost = 0
  // Individual push costs only — link tax is charged when synergy actually activates
  for (let i = 0; i < 5; i++) {
    if (state.pushedSlots[i] && state.slotActions[i]) cost += 1
  }
  return cost
}

export function projectedStrain(state: StrainCombatState): number {
  return Math.max(0, state.strain + projectedStrainCost(state))
}

export function wouldForfeit(state: StrainCombatState): boolean {
  return projectedStrain(state) >= state.maxStrain
}

/** Count pushed slots (for enemy Retaliate) */
export function countPushedSlots(state: StrainCombatState): number {
  return state.pushedSlots.filter((p, i) => p && state.slotActions[i]).length
}

// ─── Action Resolution Helpers ────────────────────────────────────────────

function getActionValue(state: StrainCombatState, index: number): number {
  const actionId = state.slotActions[index]
  if (!actionId) return 0
  const def = ALL_ACTIONS[actionId]
  if (!def) return 0
  const base = state.pushedSlots[index] ? def.pushedValue : def.baseValue
  return base + state.secondWindBonus
}

// ─── Execute Turn ─────────────────────────────────────────────────────────

export function executeStrainTurn(
  state: StrainCombatState,
  health: number,
): { combat: StrainCombatState; health: number } {
  let combat: StrainCombatState = { ...state, combatLog: [], phase: 'executing' }
  let hp = health

  // 1. Strain cost
  const strainCost = projectedStrainCost(combat)
  combat.strain = Math.max(0, Math.min(combat.strain + strainCost, combat.maxStrain))

  // 2. Check forfeit
  if (combat.strain >= combat.maxStrain) {
    combat.strain = 14
    combat.phase = 'forfeit'
    combat.combatLog.push({ type: 'forfeit' })
    return { combat, health: hp }
  }

  // 3. Mend heal-over-time
  if (combat.mendHealRemaining > 0) {
    hp = Math.min(hp + combat.mendHealRemaining, 70)
    combat.combatLog.push({ type: 'slotFire', slotLabel: 'Mend', heal: combat.mendHealRemaining })
    combat.mendHealRemaining = 0
  }

  // 4. Fire slots (skipped if venting)
  const enemies = combat.enemies.map(e => ({ ...e, damagedThisTurn: false }))

  /** Deal damage to an enemy */
  function dealDamage(target: EnemyInstance, baseDmg: number, slotIndex: number, label: string): number {
    // PhaseShift
    let modDmg = baseDmg
    if (target.isPhased !== undefined) {
      modDmg = target.isPhased ? Math.floor(baseDmg * 0.5) : baseDmg * 2
    }
    const blocked = Math.min(target.block, modDmg)
    target.block -= blocked
    const actual = modDmg - blocked
    target.currentHealth = Math.max(0, target.currentHealth - actual)
    if (actual > 0) {
      target.damagedThisTurn = true
      if (target.enrageStacks !== undefined) target.enrageStacks += 2
    }
    if (target.currentHealth <= 0) {
      target.isDefeated = true
      // On-death triggers
      const targetDef = ALL_ENEMIES[target.definitionId]
      if (targetDef?.onDeath) {
        if (targetDef.onDeath.type === 'spawn') {
          const spawnDef = ALL_ENEMIES[targetDef.onDeath.enemyId]
          if (spawnDef) {
            for (let s = 0; s < targetDef.onDeath.count; s++) {
              enemies.push({
                instanceId: `${targetDef.onDeath.enemyId}-${Date.now()}-${s}`,
                definitionId: targetDef.onDeath.enemyId,
                currentHealth: spawnDef.maxHealth,
                maxHealth: spawnDef.maxHealth,
                block: 0, intentIndex: 0, statusEffects: [],
                isDefeated: false, isFragment: true, damagedThisTurn: false,
              })
            }
          }
        } else if (targetDef.onDeath.type === 'healAllies') {
          for (const ally of enemies) {
            if (!ally.isDefeated && ally.instanceId !== target.instanceId) {
              ally.currentHealth = ally.maxHealth
            }
          }
        }
      }
    }
    combat.combatLog.push({ type: 'slotFire', slotIndex, slotLabel: label, damage: actual, enemyId: target.instanceId })
    return actual
  }

  // Fire each slot in order — venting skips damage actions only
  for (let i = 0; i < 5; i++) {
    const actionId = combat.slotActions[i]
    if (!actionId) continue
    const def = ALL_ACTIONS[actionId]
    if (!def || def.isVent) continue

    const value = getActionValue(combat, i)
    const isDamage = def.type === 'damage_single' || def.type === 'damage_all'

    // Skip damage actions when venting
    if (combat.ventActive && isDamage) continue

    if (def.type === 'damage_single') {
      const target = enemies.find(e => e.instanceId === combat.selectedTargetId && !e.isDefeated)
        || enemies.find(e => !e.isDefeated)
      if (target) {
        const hits = def.hits ?? 1
        for (let h = 0; h < hits; h++) {
          dealDamage(target, value, i, def.name)
        }
      }
    } else if (def.type === 'damage_all') {
      const hits = def.hits ?? 1
      for (let h = 0; h < hits; h++) {
        const alive = enemies.filter(e => !e.isDefeated)
        if (def.hits && def.hits > 1) {
          if (alive.length > 0) {
            const target = alive[Math.floor(Math.random() * alive.length)]
            dealDamage(target, value, i, def.name)
          }
        } else {
          for (const enemy of alive) {
            dealDamage(enemy, value, i, def.name)
          }
        }
      }
    } else if (def.type === 'block') {
        combat.block += value
        combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name, block: value })
      } else if (def.type === 'heal') {
        if (def.healOverTurns) {
          // Mend: split heal over turns
          const now = Math.floor(value / def.healOverTurns)
          const later = value - now
          hp = Math.min(hp + now, 70)
          combat.mendHealRemaining += later
          combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name, heal: now })
        } else {
          hp = Math.min(hp + value, 70)
          combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name, heal: value })
        }
      } else if (def.type === 'reduce') {
        combat.damageReduction = value
        combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name })
      } else if (def.type === 'reflect') {
        combat.reflectPct = state.pushedSlots[i] ? (def.reflectPct ?? 40) + 20 : (def.reflectPct ?? 40)
        combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name })
      } else if (def.type === 'buff') {
        // Patience: linked action gains base value next turn — handled at end of turn
        // Overclock: linked action fires twice — handled in synergy resolution
        combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name })
      } else if (def.type === 'debuff') {
        // Weaken: reduce enemy damage (simplified — apply to all enemies for now)
        combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name })
      } else if (def.type === 'convert') {
        // Absorb: convert block to strain reduction
        const converted = Math.min(combat.block, value)
        combat.block -= converted
        const strainReduced = Math.floor(converted / 2)
        combat.strain = Math.max(0, combat.strain - strainReduced)
        combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name, strainChange: -strainReduced })
      } else if (def.type === 'utility') {
        // Taunt: force enemies to target player (block matters) — passive effect for this turn
        combat.combatLog.push({ type: 'slotFire', slotIndex: i, slotLabel: def.name })
      }

      // Resolve pair synergy after slot 1 (end of Pair A) and slot 3 (end of Pair B)
      // Synergies only fire when not venting (both must be pushed)
      if (!combat.ventActive) {
        if (i === 1 && combat.pushedSlots[0] && combat.pushedSlots[1] && combat.pairASynergy) {
          hp = resolveSynergy(combat, combat.pairASynergy, 0, 1, enemies, hp)
        }
        if (i === 3 && combat.pushedSlots[2] && combat.pushedSlots[3] && combat.pairBSynergy) {
          hp = resolveSynergy(combat, combat.pairBSynergy, 2, 3, enemies, hp)
        }
      }
    }

  // Vent recovery + Second Wind (after slots fire)
  if (combat.ventActive) {
    // Second Wind: linked action gets +3 base next turn
    for (const pairStart of [0, 2]) {
      const ventIdx = combat.slotActions[pairStart] && ALL_ACTIONS[combat.slotActions[pairStart]!]?.isVent ? pairStart
        : combat.slotActions[pairStart + 1] && ALL_ACTIONS[combat.slotActions[pairStart + 1]!]?.isVent ? pairStart + 1
        : -1
      if (ventIdx >= 0) {
        const linkedIdx = ventIdx === pairStart ? pairStart + 1 : pairStart
        if (combat.slotActions[linkedIdx]) {
          combat.secondWindBonus = 3
        }
      }
    }
    combat.combatLog.push({ type: 'slotFire', slotLabel: 'Vent', strainChange: -VENT_STRAIN_RECOVERY })
  }

  combat.enemies = enemies

  // 5. Check win
  if (enemies.every(e => e.isDefeated)) {
    combat.phase = 'reward'
    return { combat, health: hp }
  }

  // 6. Enemy turn
  combat.phase = 'enemyTurn'
  const pushCount = countPushedSlots(combat)

  function enemyDealDamage(dmg: number, enemy: EnemyInstance, def: { name: string }, intentType: IntentType) {
    // Suppress: AoE debuff reduces enemy damage
    if ((combat as any)._suppressActive) dmg = Math.max(0, dmg - 3)

    const reduced = Math.min(combat.damageReduction, dmg)
    dmg -= reduced
    const blocked = Math.min(combat.block, dmg)
    combat.block -= blocked
    const actual = dmg - blocked
    hp -= actual
    combat.combatLog.push({
      type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name,
      intentType, damage: actual, blocked,
      reduced: reduced > 0 ? reduced : undefined,
    })
    // Reflect
    if (combat.reflectPct > 0 && actual > 0) {
      const reflected = Math.floor(actual * combat.reflectPct / 100)
      if (reflected > 0) {
        enemy.currentHealth = Math.max(0, enemy.currentHealth - reflected)
        if (enemy.currentHealth <= 0) enemy.isDefeated = true
      }
    }
    // Thorns: damage reduction deals 2 back per hit
    if ((combat as any)._thornsActive && reduced > 0) {
      enemy.currentHealth = Math.max(0, enemy.currentHealth - 2)
      if (enemy.currentHealth <= 0) enemy.isDefeated = true
    }
    // Counter: fully blocked attack → damage action fires again at base
    if ((combat as any)._counterArmed && actual === 0 && blocked > 0) {
      const counterDmg = (combat as any)._counterDamage ?? 0
      if (counterDmg > 0) {
        enemy.currentHealth = Math.max(0, enemy.currentHealth - counterDmg)
        if (enemy.currentHealth <= 0) enemy.isDefeated = true
        combat.combatLog.push({ type: 'synergy', synergyName: 'Counter!', damage: counterDmg, enemyId: enemy.instanceId })
      }
    }
    // Focused Aggro: counter-attack on every hit received
    if ((combat as any)._focusedAggroActive && actual > 0) {
      const aggroDmg = (combat as any)._focusedAggroDamage ?? 0
      if (aggroDmg > 0) {
        enemy.currentHealth = Math.max(0, enemy.currentHealth - aggroDmg)
        if (enemy.currentHealth <= 0) enemy.isDefeated = true
        combat.combatLog.push({ type: 'synergy', synergyName: 'Aggro!', damage: aggroDmg, enemyId: enemy.instanceId })
      }
    }
  }

  for (const enemy of combat.enemies) {
    if (enemy.isDefeated) continue
    const def = ALL_ENEMIES[enemy.definitionId]
    if (!def) continue
    const intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]
    enemy.intentIndex++

    if (intent.type === 'Attack' || intent.type === 'AttackDebuff') {
      const hits = intent.hits || 1
      for (let h = 0; h < hits; h++) enemyDealDamage(intent.value, enemy, def, intent.type)
    } else if (intent.type === 'Retaliate') {
      const retDmg = (intent.valuePerPush ?? intent.value) * pushCount
      if (retDmg > 0) enemyDealDamage(retDmg, enemy, def, 'Retaliate')
      else combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'Retaliate', damage: 0 })
    } else if (intent.type === 'StrainScale') {
      const bonus = Math.floor(combat.strain / (intent.strainDivisor ?? 5))
      enemyDealDamage(intent.value + bonus, enemy, def, 'StrainScale')
    } else if (intent.type === 'CopyAction') {
      let bestValue = 0; let bestType: 'damage' | 'block' | 'heal' | null = null
      for (const event of combat.combatLog) {
        if (event.type === 'slotFire' && event.damage != null && event.damage > bestValue) { bestValue = event.damage; bestType = 'damage' }
        if (event.type === 'slotFire' && event.block != null && event.block > bestValue) { bestValue = event.block; bestType = 'block' }
        if (event.type === 'slotFire' && event.heal != null && event.heal > bestValue) { bestValue = event.heal; bestType = 'heal' }
      }
      if (bestType === 'damage') enemyDealDamage(bestValue, enemy, def, 'CopyAction')
      else if (bestType === 'block') { enemy.block += bestValue; combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'CopyAction', block: bestValue }) }
      else combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'CopyAction' })
    } else if (intent.type === 'Charge') {
      if (enemy.chargeCounter === undefined) enemy.chargeCounter = intent.chargeTime ?? 2
      if (enemy.chargeCounter > 0) { enemy.chargeCounter--; combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'Charge' }) }
      else { enemyDealDamage(intent.blastValue ?? intent.value, enemy, def, 'Charge'); enemy.chargeCounter = intent.chargeTime ?? 2 }
    } else if (intent.type === 'ConditionalBuff') {
      if (!enemy.damagedThisTurn) {
        const stacks = intent.statusStacks ?? intent.value
        const existing = enemy.statusEffects.find(s => s.type === (intent.status ?? 'Strength'))
        if (existing) existing.stacks += stacks
        else enemy.statusEffects.push({ type: intent.status as any ?? 'Strength', stacks })
        combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'ConditionalBuff' })
      } else { enemyDealDamage(intent.fallbackValue ?? intent.value, enemy, def, 'Attack') }
    } else if (intent.type === 'Leech') {
      const before = hp; enemyDealDamage(intent.value, enemy, def, 'Leech')
      const dealt = before - hp; if (dealt > 0) enemy.currentHealth = Math.min(enemy.maxHealth, enemy.currentHealth + dealt)
    } else if (intent.type === 'StrainTick') {
      combat.strain = Math.min(combat.strain + intent.value, combat.maxStrain)
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'StrainTick' })
    } else if (intent.type === 'Enrage') {
      enemyDealDamage(intent.value + (enemy.enrageStacks ?? 0), enemy, def, 'Enrage')
    } else if (intent.type === 'ShieldAllies') {
      for (const ally of combat.enemies) { if (!ally.isDefeated && ally.instanceId !== enemy.instanceId) ally.block += intent.value }
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'ShieldAllies', block: intent.value })
    } else if (intent.type === 'BerserkerAttack') {
      const hpPct = enemy.currentHealth / enemy.maxHealth
      const mult = hpPct > 0.5 ? 1 : hpPct > 0.25 ? 2 : 3
      enemyDealDamage(intent.value * mult, enemy, def, 'BerserkerAttack')
    } else if (intent.type === 'PhaseShift') {
      enemy.isPhased = !(enemy.isPhased ?? false); enemyDealDamage(intent.value, enemy, def, 'PhaseShift')
    } else if (intent.type === 'StealBlock') {
      const stolen = combat.block; if (stolen > 0) { combat.block = 0; enemy.block += stolen }
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'StealBlock', block: stolen })
    } else if (intent.type === 'MartyrHeal') {
      enemyDealDamage(intent.value, enemy, def, 'MartyrHeal')
    } else if (intent.type === 'Block') {
      enemy.block += intent.value; combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'Block', block: intent.value })
    } else if (intent.type === 'Buff') {
      enemy.block += intent.value; combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'Buff' })
    } else {
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: intent.type })
    }
  }

  combat.enemies = enemies

  // 7. End-of-turn synergy effects
  // Fortify: remaining block → healing
  if ((combat as any)._fortifyActive && combat.block > 0) {
    const fortifyHeal = combat.block
    hp = Math.min(hp + fortifyHeal, 70)
    combat.combatLog.push({ type: 'synergy', synergyName: 'Fortify', heal: fortifyHeal })
  }
  // Recycle: remaining block → strain reduction (2 block = 1 strain)
  if ((combat as any)._recycleActive && combat.block > 0) {
    const strainReduced = Math.floor(combat.block / 2)
    if (strainReduced > 0) {
      combat.strain = Math.max(0, combat.strain - strainReduced)
      combat.combatLog.push({ type: 'synergy', synergyName: 'Recycle', strainChange: -strainReduced })
    }
  }

  // 8. Check loss
  if (hp <= 0) {
    combat.phase = 'finished'
    return { combat, health: 0 }
  }

  // 9. Next turn reset
  combat.block = 0
  for (const enemy of combat.enemies) { if (!enemy.isDefeated) enemy.block = 0 }
  combat.damageReduction = 0
  combat.reflectPct = 0
  combat.pushedSlots = [false, false, false, false, false]
  combat.ventActive = false
  // Second Wind: consumed after one turn
  if (combat.secondWindBonus > 0 && !state.ventActive) combat.secondWindBonus = 0
  // Auto-retarget
  const currentTarget = combat.enemies.find(e => e.instanceId === combat.selectedTargetId && !e.isDefeated)
  if (!currentTarget) combat.selectedTargetId = combat.enemies.find(e => !e.isDefeated)?.instanceId ?? null
  combat.roundNumber++
  combat.phase = 'planning'

  return { combat, health: hp }
}

// ─── Synergy Resolution ───────────────────────────────────────────────────

function resolveSynergy(
  combat: StrainCombatState,
  synergy: SynergyEffect,
  idxA: number,
  idxB: number,
  enemies: EnemyInstance[],
  hp: number,
): number {
  // Link tax: +1 strain charged when synergy actually fires
  combat.strain = Math.min(combat.strain + 1, combat.maxStrain)
  combat.combatLog.push({ type: 'synergy', synergyName: synergy.name, strainChange: 1 })

  switch (synergy.id as SynergyId) {
    case 'drain': {
      // Damage slot heals 30%
      const dmgEvents = combat.combatLog.filter(e => e.type === 'slotFire' && (e.slotIndex === idxA || e.slotIndex === idxB) && e.damage)
      const totalDmg = dmgEvents.reduce((s, e) => s + (e.damage ?? 0), 0)
      const heal = Math.floor(totalDmg * 0.3)
      if (heal > 0) hp = Math.min(hp + heal, 70)
      break
    }
    case 'cleave': {
      // Single target damage also hits others at 50%
      const dmgEvents = combat.combatLog.filter(e => e.type === 'slotFire' && (e.slotIndex === idxA || e.slotIndex === idxB) && e.damage && e.enemyId)
      for (const event of dmgEvents) {
        const splash = Math.floor((event.damage ?? 0) * 0.5)
        if (splash > 0) {
          for (const enemy of enemies) {
            if (!enemy.isDefeated && enemy.instanceId !== event.enemyId) {
              enemy.currentHealth = Math.max(0, enemy.currentHealth - splash)
              if (enemy.currentHealth <= 0) enemy.isDefeated = true
            }
          }
        }
      }
      break
    }
    case 'counter': {
      // If block absorbs a full attack, damage action fires again at base
      (combat as any)._counterArmed = true
      const counterDmgIdx = [idxA, idxB].find(idx => {
        const id = combat.slotActions[idx]
        return id && ALL_ACTIONS[id]?.type === 'damage_single'
      })
      ;(combat as any)._counterDamage = counterDmgIdx !== undefined
        ? ALL_ACTIONS[combat.slotActions[counterDmgIdx]!]!.baseValue : 0
      break
    }
    case 'focus': {
      // Already fired both damage actions — the "focus" is that they both hit same target
      // Bonus: combined damage gets +3
      const target = enemies.find(e => e.instanceId === combat.selectedTargetId && !e.isDefeated)
        || enemies.find(e => !e.isDefeated)
      if (target) {
        target.currentHealth = Math.max(0, target.currentHealth - 3)
        if (target.currentHealth <= 0) target.isDefeated = true
      }
      break
    }
    case 'fortify': {
      // Excess block → healing (resolved at end of enemy turn)
      (combat as any)._fortifyActive = true
      break
    }
    case 'bastion': {
      // Block and reduction stack — already both applied, this is a confirmation
      break
    }
    case 'bolster': {
      // Block doubled
      combat.block *= 2
      break
    }
    case 'recycle': {
      // Block → strain reduction (resolved at end of enemy turn)
      (combat as any)._recycleActive = true
      break
    }
    case 'thorns': {
      // Damage reduction deals 2 back per hit to attacker
      (combat as any)._thornsActive = true
      break
    }
    case 'empower': {
      // Buff doubles on damage action — deal bonus damage equal to damage action's base
      const empDmgIdx = [idxA, idxB].find(idx => {
        const id = combat.slotActions[idx]
        return id && (ALL_ACTIONS[id]?.type === 'damage_single' || ALL_ACTIONS[id]?.type === 'damage_all')
      })
      if (empDmgIdx !== undefined) {
        const bonus = ALL_ACTIONS[combat.slotActions[empDmgIdx]!]!.baseValue
        const target = enemies.find(e => e.instanceId === combat.selectedTargetId && !e.isDefeated)
          || enemies.find(e => !e.isDefeated)
        if (target && bonus > 0) {
          target.currentHealth = Math.max(0, target.currentHealth - bonus)
          if (target.currentHealth <= 0) target.isDefeated = true
        }
      }
      break
    }
    case 'exploit': {
      // +50% bonus damage from pair's damage actions
      const expDmgEvents = combat.combatLog.filter(e =>
        e.type === 'slotFire' && (e.slotIndex === idxA || e.slotIndex === idxB) && e.damage
      )
      const totalDmg = expDmgEvents.reduce((s, e) => s + (e.damage ?? 0), 0)
      const bonus = Math.floor(totalDmg * 0.5)
      if (bonus > 0) {
        const target = enemies.find(e => e.instanceId === combat.selectedTargetId && !e.isDefeated)
          || enemies.find(e => !e.isDefeated)
        if (target) {
          target.currentHealth = Math.max(0, target.currentHealth - bonus)
          if (target.currentHealth <= 0) target.isDefeated = true
        }
      }
      break
    }
    case 'suppress': {
      // AoE applies debuff — reduce all enemy damage by 3 this turn
      (combat as any)._suppressActive = true
      break
    }
    case 'barrage': {
      // Hits doubled — fire AoE again
      for (const enemy of enemies) {
        if (enemy.isDefeated) continue
        const val = getActionValue(combat, idxA) || getActionValue(combat, idxB)
        enemy.currentHealth = Math.max(0, enemy.currentHealth - val)
        if (enemy.currentHealth <= 0) enemy.isDefeated = true
      }
      break
    }
    case 'regenerate': {
      // Heal over 2 turns — store remaining
      const healVal = getActionValue(combat, idxA) || getActionValue(combat, idxB)
      combat.mendHealRemaining += Math.floor(healVal / 2)
      break
    }
    case 'transfuse': {
      // Heal also reduces strain by 2
      combat.strain = Math.max(0, combat.strain - 2)
      break
    }
    case 'second-wind': {
      // +3 base next turn — already handled in vent section
      break
    }
    case 'mirror-strike': {
      // Reflect +50% — boost reflectPct
      combat.reflectPct = Math.floor(combat.reflectPct * 1.5)
      break
    }
    case 'focused-aggro': {
      // Counter-attack on every hit received
      (combat as any)._focusedAggroActive = true
      const aggroDmgIdx = [idxA, idxB].find(idx => {
        const id = combat.slotActions[idx]
        return id && ALL_ACTIONS[id]?.type === 'damage_single'
      })
      ;(combat as any)._focusedAggroDamage = aggroDmgIdx !== undefined
        ? ALL_ACTIONS[combat.slotActions[aggroDmgIdx]!]!.baseValue : 0
      break
    }
  }

  return hp
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function getEnemyIntent(enemy: EnemyInstance): Intent | null {
  const def = ALL_ENEMIES[enemy.definitionId]
  if (!def) return null
  return def.intentPattern[enemy.intentIndex % def.intentPattern.length]
}

/** Re-export for compatibility */
export { getSynergyForPair } from '../data/actions'
