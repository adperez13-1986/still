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

/** All abilities that can exist in combat. Only those in growth.abilities (+ vent) are shown. */
export const STRAIN_ABILITIES: StrainAbility[] = [
  { id: 'repair', label: 'Repair', description: 'Heal 4 HP', strainCost: 1 },
  { id: 'brace', label: 'Brace', description: 'Reduce incoming damage by 3 per hit', strainCost: 1 },
  { id: 'vent', label: 'Vent', description: `Release ${4} strain. Skip all attacks this turn.`, strainCost: 0 },
]

/** Default ability always available. Repair and Brace must be earned via growth rewards. */
export const DEFAULT_ABILITIES = ['vent']

// ─── Growth Rewards — Branching Tree ─────────────────────────────────────

export interface GrowthReward {
  id: string
  label: string
  description: string
  strainCost: number
  tier: 1 | 2 | 3
  branch: 'repair' | 'brace' | 'offense'
  requires: string | null
}

export const GROWTH_TREE: GrowthReward[] = [
  // Tier 1 — new verbs
  { id: 'repair',    label: 'Learn: Repair',    description: 'Heal 4 HP (1 strain/use)',               strainCost: 2, tier: 1, branch: 'repair',  requires: null },
  { id: 'brace',     label: 'Learn: Brace',     description: 'Reduce damage by 3/hit (1 strain/use)',  strainCost: 2, tier: 1, branch: 'brace',   requires: null },
  { id: 'mastery-A', label: 'Strike Mastery',    description: 'Pushed Strike deals +3 bonus damage',     strainCost: 3, tier: 1, branch: 'offense', requires: null },
  { id: 'mastery-B', label: 'Shield Mastery',    description: 'Pushed Shield grants +3 bonus block',    strainCost: 3, tier: 1, branch: 'offense', requires: null },
  { id: 'mastery-C', label: 'Barrage Mastery',   description: 'Pushed Barrage deals +2 bonus per target', strainCost: 3, tier: 1, branch: 'offense', requires: null },
  // Tier 2 — forks
  { id: 'repair-plus',     label: 'Repair+',          description: 'Repair heals 7 instead of 4',                strainCost: 2, tier: 2, branch: 'repair',  requires: 'repair' },
  { id: 'drain-strike',    label: 'Drain Strike',     description: 'Strike heals you for half damage dealt',     strainCost: 2, tier: 2, branch: 'repair',  requires: 'repair' },
  { id: 'brace-plus',      label: 'Brace+',           description: 'Brace reduces 5 instead of 3',              strainCost: 2, tier: 2, branch: 'brace',   requires: 'brace' },
  { id: 'reactive-shield', label: 'Reactive Shield',  description: 'Block persists between turns',               strainCost: 2, tier: 2, branch: 'brace',   requires: 'brace' },
  { id: 'piercing-strike', label: 'Piercing Strike',  description: 'Strike ignores enemy block',                 strainCost: 3, tier: 2, branch: 'offense', requires: 'mastery-A' },
  { id: 'scatter-barrage', label: 'Scatter Barrage',  description: 'Barrage hits 3 random targets',              strainCost: 3, tier: 2, branch: 'offense', requires: 'mastery-C' },
  // Tier 3 — identity
  { id: 'desperate-repair', label: 'Desperate Repair', description: 'Strain 15+: Repair heals 8',               strainCost: 3, tier: 3, branch: 'repair',  requires: 'repair-plus' },
  { id: 'lifeline',         label: 'Lifeline',         description: 'Strain 12+: Vent also heals 4 HP',         strainCost: 3, tier: 3, branch: 'repair',  requires: 'drain-strike' },
  { id: 'calm-brace',       label: 'Calm Brace',       description: 'Strain ≤8: Brace reduces 6',               strainCost: 3, tier: 3, branch: 'brace',   requires: 'brace-plus' },
  { id: 'fortify',          label: 'Fortify',          description: 'Unused block converts to HP healing',       strainCost: 3, tier: 3, branch: 'brace',   requires: 'reactive-shield' },
  { id: 'executioner',      label: 'Executioner',      description: 'Bonus damage to enemies below 30% HP',      strainCost: 3, tier: 3, branch: 'offense', requires: 'piercing-strike' },
  { id: 'chain-reaction',   label: 'Chain Reaction',   description: 'Kill during Barrage triggers bonus Barrage', strainCost: 3, tier: 3, branch: 'offense', requires: 'scatter-barrage' },
]

// ─── Comfort Rewards ──────────────────────────────────────────────────────

export interface ComfortReward {
  id: string
  label: string
  description: string
}

export const COMFORT_HEAL: ComfortReward = { id: 'heal', label: 'Heal', description: 'Restore 8 HP' }
export const COMFORT_RELIEF: ComfortReward = { id: 'relief', label: 'Relief', description: 'Reduce strain by 4' }
export const COMFORT_COMPANION: ComfortReward = { id: 'companion', label: 'A quiet moment', description: 'Reduce strain by 2' }

// ─── Growth Helpers ───────────────────────────────────────────────────────

export interface GrowthState {
  rewards: string[]
}

/** Check if a reward ID has been acquired */
export function hasReward(growth: GrowthState, id: string): boolean {
  return growth.rewards.includes(id)
}

/** Get abilities available in combat based on growth state */
export function getAvailableAbilities(growth: GrowthState): StrainAbility[] {
  const unlocked = [...DEFAULT_ABILITIES, ...growth.rewards.filter(id => id === 'repair' || id === 'brace')]
  return STRAIN_ABILITIES.filter(a => unlocked.includes(a.id))
}

/** Get effective push cost for a slot — always base cost, masteries add bonus effects instead */
export function getEffectivePushCost(slot: StrainSlot, _growth: GrowthState): number {
  return slot.pushCost
}

/** Get available growth rewards: prerequisites met, not acquired, affordable */
export function getAvailableGrowthRewards(growth: GrowthState, currentStrain: number): GrowthReward[] {
  return GROWTH_TREE.filter(r => {
    if (growth.rewards.includes(r.id)) return false
    if (r.requires && !growth.rewards.includes(r.requires)) return false
    if (currentStrain + r.strainCost >= 20) return false
    return true
  })
}

/** Pick the right comfort reward based on player state */
export function pickComfortReward(health: number, maxHealth: number, strain: number): ComfortReward {
  if (health < maxHealth * 0.5) return COMFORT_HEAL
  if (strain >= 10) return COMFORT_RELIEF
  return COMFORT_COMPANION
}

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
  pushCosts: Record<'A' | 'B' | 'C', number>
  activeAbilities: string[]
  selectedTargetId: string | null
  roundNumber: number
  combatLog: StrainCombatEvent[]
  /** Growth rewards acquired — copied at combat init, used for effect resolution */
  growthRewards: string[]
}

// ─── Init ──────────────────────────────────────────────────────────────────

export function initStrainCombat(
  enemies: EnemyInstance[],
  currentStrain: number,
  growth: GrowthState = { rewards: [] },
): StrainCombatState {
  return {
    phase: 'planning',
    enemies,
    strain: currentStrain,
    maxStrain: 20,
    block: 0,
    damageReduction: 0,
    pushedSlots: { A: false, B: false, C: false },
    pushCosts: {
      A: getEffectivePushCost(STRAIN_SLOTS[0], growth),
      B: getEffectivePushCost(STRAIN_SLOTS[1], growth),
      C: getEffectivePushCost(STRAIN_SLOTS[2], growth),
    },
    activeAbilities: [],
    selectedTargetId: enemies.find(e => !e.isDefeated)?.instanceId ?? null,
    roundNumber: 1,
    combatLog: [],
    growthRewards: growth.rewards,
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

/** Overextension penalty: +2 strain when using ALL available actions */
export const OVEREXTEND_PENALTY = 2

/** Count total available actions (pushable slots + available abilities excluding vent) */
function countAvailableActions(state: StrainCombatState): number {
  // 3 pushable slots + non-vent abilities that are available in this combat
  const abilityCount = STRAIN_ABILITIES.filter(a => a.id !== 'vent' &&
    (DEFAULT_ABILITIES.includes(a.id) || state.growthRewards.includes(a.id))
  ).length
  return STRAIN_SLOTS.length + abilityCount
}

/** Count how many actions the player is using this turn */
function countActiveActions(state: StrainCombatState): number {
  const pushCount = STRAIN_SLOTS.filter(s => state.pushedSlots[s.id]).length
  const abilityCount = state.activeAbilities.filter(id => id !== 'vent').length
  return pushCount + abilityCount
}

/** Is the player overextending (using all available actions)? */
export function isOverextending(state: StrainCombatState): boolean {
  const available = countAvailableActions(state)
  if (available < 4) return false // need at least 4 available for overextension to matter
  return countActiveActions(state) >= available
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
    return sum + (state.pushedSlots[slot.id] ? state.pushCosts[slot.id] : 0)
  }, 0)
  const abilityCost = STRAIN_ABILITIES.reduce((sum, ability) => {
    return sum + (state.activeAbilities.includes(ability.id) ? ability.strainCost : 0)
  }, 0)
  const overextend = isOverextending(state) ? OVEREXTEND_PENALTY : 0
  return pushCost + abilityCost + overextend
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

  // 2.5. Resolve abilities (with growth reward modifiers)
  const gr = combat.growthRewards
  combat.damageReduction = 0
  for (const abilityId of combat.activeAbilities) {
    const ability = STRAIN_ABILITIES.find(a => a.id === abilityId)
    if (!ability) continue

    if (ability.id === 'repair') {
      let healAmt = 4
      if (gr.includes('repair-plus')) healAmt = 7
      if (gr.includes('desperate-repair') && combat.strain >= 15) healAmt = 8
      hp = Math.min(hp + healAmt, 70)
      combat.combatLog.push({ type: 'ability', abilityId: 'repair', abilityLabel: 'Repair', heal: healAmt })
    } else if (ability.id === 'brace') {
      let reduction = 3
      if (gr.includes('brace-plus')) reduction = 5
      if (gr.includes('calm-brace') && combat.strain <= 8) reduction = 6
      combat.damageReduction = reduction
      combat.combatLog.push({ type: 'ability', abilityId: 'brace', abilityLabel: 'Brace' })
    } else if (ability.id === 'vent') {
      // Lifeline: Vent also heals 4 HP at high strain (checked before strain drops)
      if (gr.includes('lifeline') && combat.strain >= 12) {
        hp = Math.min(hp + 4, 70)
        combat.combatLog.push({ type: 'ability', abilityId: 'vent', abilityLabel: 'Vent + Lifeline', heal: 4 })
      } else {
        combat.combatLog.push({ type: 'ability', abilityId: 'vent', abilityLabel: 'Vent' })
      }
    }
  }

  // 3. Fire slots in order: A → B → C (skipped when venting)
  //    Reactive Shield: block persists between turns (not reset at end)
  const enemies = combat.enemies.map(e => ({ ...e, damagedThisTurn: false }))
  const hasReactiveShield = gr.includes('reactive-shield')
  const hasPiercing = gr.includes('piercing-strike')
  const hasDrainStrike = gr.includes('drain-strike')
  const hasExecutioner = gr.includes('executioner')
  const hasScatter = gr.includes('scatter-barrage')
  const hasChainReaction = gr.includes('chain-reaction')

  /** Apply damage to a single enemy, return actual damage dealt */
  function dealDamage(target: EnemyInstance, baseDmg: number, piercing: boolean, slotId: 'A' | 'B' | 'C', slotLabel: string): number {
    // PhaseShift: armored phase halves damage, vulnerable phase doubles
    let modDmg = baseDmg
    if (target.isPhased !== undefined) {
      modDmg = target.isPhased ? Math.floor(baseDmg * 0.5) : baseDmg * 2
    }
    let actualDamage: number
    if (piercing) {
      actualDamage = modDmg
    } else {
      const blocked = Math.min(target.block, modDmg)
      target.block -= blocked
      actualDamage = modDmg - blocked
    }
    target.currentHealth = Math.max(0, target.currentHealth - actualDamage)
    if (actualDamage > 0) {
      target.damagedThisTurn = true
      // Enrage: each hit adds +2 permanent damage
      if (target.enrageStacks !== undefined) {
        target.enrageStacks += 2
      }
    }
    if (target.currentHealth <= 0) {
      target.isDefeated = true
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
                block: 0,
                intentIndex: 0,
                statusEffects: [] as import('./types').StatusEffect[],
                isDefeated: false,
                isFragment: true,
                damagedThisTurn: false,
              })
            }
          }
        } else if (targetDef.onDeath.type === 'healAllies') {
          // Martyr: heal all other enemies to full
          for (const ally of enemies) {
            if (!ally.isDefeated && ally.instanceId !== target.instanceId) {
              ally.currentHealth = ally.maxHealth
            }
          }
        }
      }
    }
    combat.combatLog.push({
      type: 'slotFire', slotId, slotLabel, damage: actualDamage, enemyId: target.instanceId,
    })
    return actualDamage
  }

  if (!venting) {
    for (const slot of STRAIN_SLOTS) {
      const pushed = combat.pushedSlots[slot.id]
      let value = pushed ? slot.pushedValue : slot.baseValue
      // Mastery bonuses — only when pushed
      if (pushed && slot.id === 'A' && gr.includes('mastery-A')) value += 3
      if (pushed && slot.id === 'B' && gr.includes('mastery-B')) value += 3
      if (pushed && slot.id === 'C' && gr.includes('mastery-C')) value += 2

      if (slot.type === 'damage_single') {
        const target = enemies.find(e => e.instanceId === combat.selectedTargetId && !e.isDefeated)
          || enemies.find(e => !e.isDefeated)
        if (target) {
          // Executioner: bonus damage to low-HP enemies
          let dmg = value
          if (hasExecutioner && target.currentHealth < target.maxHealth * 0.3) {
            dmg += 4
          }
          const actual = dealDamage(target, dmg, hasPiercing, slot.id, slot.label)
          // Drain Strike: heal for half damage dealt
          if (hasDrainStrike && actual > 0) {
            const drainHeal = Math.floor(actual / 2)
            hp = Math.min(hp + drainHeal, 70)
            combat.combatLog.push({ type: 'ability', abilityId: 'drain-strike', abilityLabel: 'Drain', heal: drainHeal })
          }
        }
      } else if (slot.type === 'block') {
        combat.block += value
        combat.combatLog.push({ type: 'slotFire', slotId: slot.id, slotLabel: slot.label, block: value })
      } else if (slot.type === 'damage_all') {
        if (hasScatter) {
          // Scatter Barrage: 3 hits on random alive enemies
          for (let hit = 0; hit < 3; hit++) {
            const alive = enemies.filter(e => !e.isDefeated)
            if (alive.length === 0) break
            const target = alive[Math.floor(Math.random() * alive.length)]
            dealDamage(target, value, false, slot.id, slot.label)
          }
        } else {
          for (const enemy of enemies) {
            if (enemy.isDefeated) continue
            dealDamage(enemy, value, false, slot.id, slot.label)
          }
        }
        // Chain Reaction: if any enemy was killed during this Barrage, fire bonus Barrage
        if (hasChainReaction) {
          const newlyDead = enemies.filter(e => e.isDefeated && e.currentHealth <= 0)
          if (newlyDead.length > 0) {
            const alive = enemies.filter(e => !e.isDefeated)
            for (const enemy of alive) {
              dealDamage(enemy, value, false, slot.id, 'Chain Reaction')
            }
          }
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
  const pushCount = STRAIN_SLOTS.filter(s => combat.pushedSlots[s.id]).length

  /** Deal enemy damage to player, applying brace reduction and block */
  function enemyDealDamage(dmg: number, enemy: EnemyInstance, def: { name: string }, intentType: IntentType) {
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
      intentType,
      damage: actual,
      blocked,
      reduced: reduced > 0 ? reduced : undefined,
    })
  }

  for (const enemy of combat.enemies) {
    if (enemy.isDefeated) continue

    const def = ALL_ENEMIES[enemy.definitionId]
    if (!def) continue

    const intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]
    enemy.intentIndex++

    if (intent.type === 'Attack' || intent.type === 'AttackDebuff') {
      const hits = intent.hits || 1
      for (let h = 0; h < hits; h++) {
        enemyDealDamage(intent.value, enemy, def, intent.type)
      }

    } else if (intent.type === 'Retaliate') {
      const retDmg = (intent.valuePerPush ?? intent.value) * pushCount
      if (retDmg > 0) {
        enemyDealDamage(retDmg, enemy, def, 'Retaliate')
      } else {
        combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'Retaliate', damage: 0 })
      }

    } else if (intent.type === 'StrainScale') {
      const bonus = Math.floor(combat.strain / (intent.strainDivisor ?? 5))
      enemyDealDamage(intent.value + bonus, enemy, def, 'StrainScale')

    } else if (intent.type === 'CopyAction') {
      // Find highest-value player action from this turn's combat log
      let bestValue = 0
      let bestType: 'damage' | 'block' | 'heal' | null = null
      for (const event of combat.combatLog) {
        if (event.type === 'slotFire' && event.damage != null && event.damage > bestValue) {
          bestValue = event.damage; bestType = 'damage'
        }
        if (event.type === 'slotFire' && event.block != null && event.block > bestValue) {
          bestValue = event.block; bestType = 'block'
        }
        if (event.type === 'ability' && event.heal != null && event.heal > bestValue) {
          bestValue = event.heal; bestType = 'heal'
        }
      }
      if (bestType === 'damage') {
        enemyDealDamage(bestValue, enemy, def, 'CopyAction')
      } else if (bestType === 'block') {
        enemy.block += bestValue
        combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'CopyAction', block: bestValue })
      } else if (bestType === 'heal') {
        enemy.currentHealth = Math.min(enemy.maxHealth, enemy.currentHealth + bestValue)
        combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'CopyAction' })
      } else {
        combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'CopyAction' })
      }

    } else if (intent.type === 'Charge') {
      if (enemy.chargeCounter === undefined) enemy.chargeCounter = intent.chargeTime ?? 2
      if (enemy.chargeCounter > 0) {
        enemy.chargeCounter--
        combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'Charge' })
      } else {
        enemyDealDamage(intent.blastValue ?? intent.value, enemy, def, 'Charge')
        enemy.chargeCounter = intent.chargeTime ?? 2
      }

    } else if (intent.type === 'ConditionalBuff') {
      if (!enemy.damagedThisTurn) {
        // Condition met — buff
        const stacks = intent.statusStacks ?? intent.value
        enemy.statusEffects = enemy.statusEffects || []
        const existing = enemy.statusEffects.find(s => s.type === (intent.status ?? 'Strength'))
        if (existing) { existing.stacks += stacks } else {
          enemy.statusEffects.push({ type: intent.status ?? 'Strength' as any, stacks })
        }
        combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'ConditionalBuff' })
      } else {
        // Condition not met — fallback attack
        enemyDealDamage(intent.fallbackValue ?? intent.value, enemy, def, 'Attack')
      }

    } else if (intent.type === 'Leech') {
      // Attack and heal for damage dealt to player
      const dmgBefore = hp
      enemyDealDamage(intent.value, enemy, def, 'Leech')
      const dealt = dmgBefore - hp
      if (dealt > 0) {
        enemy.currentHealth = Math.min(enemy.maxHealth, enemy.currentHealth + dealt)
      }

    } else if (intent.type === 'StrainTick') {
      // Add strain to player each turn
      combat.strain = Math.min(combat.strain + intent.value, combat.maxStrain)
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'StrainTick' })

    } else if (intent.type === 'Enrage') {
      // Attack with base + enrage stacks
      const enrageDmg = intent.value + (enemy.enrageStacks ?? 0)
      enemyDealDamage(enrageDmg, enemy, def, 'Enrage')

    } else if (intent.type === 'ShieldAllies') {
      // Give all OTHER alive enemies block
      for (const ally of combat.enemies) {
        if (!ally.isDefeated && ally.instanceId !== enemy.instanceId) {
          ally.block += intent.value
        }
      }
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'ShieldAllies', block: intent.value })

    } else if (intent.type === 'BerserkerAttack') {
      // Damage scales inversely with HP %
      const hpPct = enemy.currentHealth / enemy.maxHealth
      const multiplier = hpPct > 0.5 ? 1 : hpPct > 0.25 ? 2 : 3
      enemyDealDamage(intent.value * multiplier, enemy, def, 'BerserkerAttack')

    } else if (intent.type === 'PhaseShift') {
      // Toggle phase and attack
      enemy.isPhased = !(enemy.isPhased ?? false)
      enemyDealDamage(intent.value, enemy, def, 'PhaseShift')

    } else if (intent.type === 'StealBlock') {
      // Steal player's block
      const stolen = combat.block
      if (stolen > 0) {
        combat.block = 0
        enemy.block += stolen
      }
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'StealBlock', block: stolen })

    } else if (intent.type === 'MartyrHeal') {
      // Just attacks normally — the on-death heal is handled in dealDamage
      enemyDealDamage(intent.value, enemy, def, 'MartyrHeal')

    } else if (intent.type === 'Block') {
      enemy.block += intent.value
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'Block', block: intent.value })

    } else if (intent.type === 'Buff') {
      enemy.block += intent.value
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: 'Buff' })

    } else {
      combat.combatLog.push({ type: 'enemyAction', enemyId: enemy.instanceId, enemyName: def.name, intentType: intent.type })
    }
  }

  // Update enemies (including any spawned fragments)
  combat.enemies = enemies

  // 6. Fortify: convert remaining block to HP healing
  if (gr.includes('fortify') && combat.block > 0) {
    const fortifyHeal = combat.block
    hp = Math.min(hp + fortifyHeal, 70)
    combat.combatLog.push({ type: 'ability', abilityId: 'fortify', abilityLabel: 'Fortify', heal: fortifyHeal })
  }

  // 7. Check loss
  if (hp <= 0) {
    combat.phase = 'finished'
    return { combat, health: 0 }
  }

  // 8. Start next turn
  // Reactive Shield block persists — it was gained after enemy attacks
  if (!hasReactiveShield) {
    combat.block = 0 // player block resets
  }
  for (const enemy of combat.enemies) {
    if (!enemy.isDefeated) enemy.block = 0 // enemy block resets
  }
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
