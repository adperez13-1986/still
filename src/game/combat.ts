import type {
  BodySlot,
  EquipmentDefinition,
  ModifierCardDefinition,
  BehavioralPartDefinition,
  CardInstance,
  CombatState,
  EnemyDefinition,
  EnemyInstance,
  StatusEffect,
  StatusEffectType,
  TargetMode,
  BodyAction,
  CombatEvent,
} from '../game/types'

import {
  BODY_SLOTS,
  DEFAULT_MAX_ENERGY,
} from '../game/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function makeEnemyInstance(def: EnemyDefinition, combatsCleared = 0, rng: () => number = Math.random): EnemyInstance {
  // HP scaling: bosses stay at base HP, regular enemies scale +10% per combat cleared
  const hpMultiplier = def.isBoss ? 1.0 : 1 + combatsCleared * 0.10
  const scaledHealth = Math.floor(def.maxHealth * hpMultiplier)
  // Check if enemy uses reactive mechanics that need initialized state
  const hasEnrage = def.intentPattern.some(i => i.type === 'Enrage')
  const hasPhaseShift = def.intentPattern.some(i => i.type === 'PhaseShift')
  const hasCharge = def.intentPattern.some(i => i.type === 'Charge')
  return {
    instanceId: `${def.id}-${rng().toString(36).slice(2)}`,
    definitionId: def.id,
    currentHealth: scaledHealth,
    maxHealth: scaledHealth,
    block: 0,
    intentIndex: 0,
    statusEffects: [],
    isDefeated: false,
    ...(hasEnrage && { enrageStacks: 0 }),
    ...(hasPhaseShift && { isPhased: false }),
    ...(hasCharge && { chargeCounter: def.intentPattern.find(i => i.type === 'Charge')?.chargeTime ?? 2 }),
  }
}

export function makeCardInstance(defId: string, rng: () => number = Math.random): CardInstance {
  return {
    instanceId: `${defId}-${rng().toString(36).slice(2)}`,
    definitionId: defId,
    isUpgraded: false,
  }
}

function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Status Effect Helpers ────────────────────────────────────────────────────

export function getStatus(effects: StatusEffect[], type: StatusEffectType): number {
  return effects.find((s) => s.type === type)?.stacks ?? 0
}

export function addStatus(effects: StatusEffect[], type: StatusEffectType, stacks: number): StatusEffect[] {
  const copy = effects.map((s) => ({ ...s }))
  const existing = copy.find((s) => s.type === type)
  if (existing) {
    existing.stacks += stacks
  } else {
    copy.push({ type, stacks })
  }
  return copy
}

// Str/Dex skip auto-decrement here — player decay is manual in endTurn() (−1/turn),
// enemy Str/Dex are truly permanent (boss self-buffs persist across turns).
const STAT_STATUSES = new Set<StatusEffectType>(['Strength', 'Dexterity'])

export function decrementStatuses(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((s) => ({ ...s, stacks: STAT_STATUSES.has(s.type) ? s.stacks : s.stacks - 1 }))
    .filter((s) => s.stacks > 0)
}

// ─── Slot Restrictions ───────────────────────────────────────────────────────

/** Return the allowed body slots for a card, or null if universal. */
export function getAllowedSlots(card: ModifierCardDefinition): BodySlot[] | null {
  // System cards: only their home slot
  if (card.category.type === 'system') return [card.category.homeSlot]
  const effect = card.category.effect
  switch (effect.type) {
    case 'amplify':  return ['Arms', 'Torso']
    case 'redirect': return ['Arms']
    case 'repeat':   return null // universal
    case 'feedback': return null // universal — slot determines behavior
    case 'retaliate': return ['Torso'] // counter build: Torso only
    case 'override':
      return null // universal — Override replaces any slot's action
    // Berserker
    case 'amplifyWithSelfDamage': return ['Arms', 'Torso']
    case 'overclockSlot': return null // any slot
    // Exhaust
    case 'amplifyScaling': return ['Arms', 'Torso']
    case 'overrideExhaustHand': return null // any slot (Override-like)
    case 'repeatScaling': return null // any slot
    // Counter
    case 'crossSlotBonus': return ['Arms']
    case 'combinedBlockRetaliate': return ['Torso']
    case 'blockHeal': return ['Torso']
    case 'volatileBlock': return ['Torso']
    // Stat
    case 'amplifyStatMultiplier': return ['Torso']
    // Bridge
    case 'redirectPower': return null // any slot
    case 'feedbackLoop': return null // any slot
  }
}

// ─── Combat Context & Result ─────────────────────────────────────────────────

export interface CombatContext {
  combat: CombatState
  stillHealth: number
  maxHealth: number
  drawCount: number
  equipment: Record<BodySlot, EquipmentDefinition | null>
  parts: BehavioralPartDefinition[]
  cardDefs: Record<string, ModifierCardDefinition>
  enemyDefs: Record<string, EnemyDefinition>
  targetEnemyId?: string
  combatsCleared: number
  rng?: () => number
}

export interface ActionResult {
  damage: Array<{ enemyId: string; amount: number }>
  blockGained: number
  healAmount: number
  cardsDrawn: number
  foresight: number
  feedbackType?: 'head' | 'torso' | 'arms' | 'legs'
  feedbackHeadBonus?: number // HEAD feedback: bonus damage for Arms this execution
  feedbackReflectDamage?: number // TORSO feedback: damage to deal to random enemy
  feedbackLifestealRatio?: number // ARMS feedback: ratio of damage to heal
  feedbackPersistBlock?: boolean // LEGS feedback: block should persist
  // New modifier results
  selfDamage?: number // berserker: damage to deal to self after slot fires
  disableSlotNextTurn?: boolean // overclock: disable this slot next turn
  redirectPowerActive?: boolean // bridge: fire adjacent slot's action as second firing
  debuffsApplied?: Array<{ debuffType: string; stacks: number; targetMode: TargetMode }> // HEAD debuff
  damageReduction?: number // LEGS per-hit reduction
}

export interface CombatResult {
  combat: CombatState
  stillHealth: number
  log: string[]
}

/** Resolve single-enemy target with overflow: if the preferred target is dead, fall back to first alive. */
function resolveSingleTarget(enemies: EnemyInstance[], preferredId?: string): EnemyInstance[] {
  if (preferredId) {
    const preferred = enemies.find(e => !e.isDefeated && e.instanceId === preferredId)
    if (preferred) return [preferred]
  }
  const fallback = enemies.find(e => !e.isDefeated)
  return fallback ? [fallback] : []
}

// ─── Strain Constants (inlined from strainCombat.ts) ─────────────────────────

export const STRAIN_DECAY_BETWEEN_COMBATS = 4
export const VENT_STRAIN_RECOVERY = 5
export const MAX_STRAIN = 20

/** Check if the combat should forfeit based on strain. Caller is responsible for applying the transition (phase='forfeit', strain=14). */
export function hasForfeited(combat: { strain: number; maxStrain: number }): boolean {
  return combat.strain >= combat.maxStrain
}

/** Apply forfeit transition: sets phase and drops strain. Returns the strain to write back to RunState (which will decay further). */
export function applyForfeit(combat: CombatState): void {
  combat.phase = 'forfeit'
  combat.strain = 14
}

// ─── Combat Initialisation (Task 2.11) ───────────────────────────────────────

export function initCombat(
  deck: CardInstance[],
  drawCount: number,
  enemies: EnemyInstance[],
  startingStatuses: StatusEffect[] = [],
  parts: BehavioralPartDefinition[] = [],
  rng: () => number = Math.random,
  startingStrain: number = 2,
): CombatState {
  const drawPile = shuffle(deck, rng)
  const hand: CardInstance[] = []

  const initialDraw = Math.min(drawCount, drawPile.length, 10)
  for (let i = 0; i < initialDraw; i++) {
    hand.push(drawPile.pop()!)
  }

  // Calculate max energy from base + parts
  let maxEnergy = DEFAULT_MAX_ENERGY
  for (const part of parts) {
    if (part.effect.type === 'bonusEnergy') {
      maxEnergy += part.effect.value
    }
  }

  return {
    phase: 'planning',
    enemies,
    hand,
    drawPile,
    discardPile: [],
    exhaustPile: [],
    maxEnergy,
    currentEnergy: maxEnergy,
    block: 0,
    statusEffects: [...startingStatuses],
    roundNumber: 1,
    slotModifiers: { Head: null, Torso: null, Arms: null, Legs: null },
    slotModifiers2: { Head: null, Torso: null, Arms: null, Legs: null },
    disabledSlots: [],
    combatLog: [],
    ablativeShellUsed: false,
    feedbackArmsBonus: 0,
    persistentBlock: 0,
    persistentFeedback: { Head: false, Torso: false, Arms: false, Legs: false },
    retaliateActive: false,
    burnoutActive: false,
    volatileArmorActive: false,
    absorbActive: false,
    absorbBlockGained: 0,
    cardsExhaustedThisTurn: 0,
    damageReduction: 0,
    // Strain integration
    strain: startingStrain,
    maxStrain: MAX_STRAIN,
    pushedCards: {},
    ventedThisTurn: false,
    headDebuffsApplied: {},
  }
}

// ─── Resolve Body Action (Tasks 2.4, 2.6, 2.14) ─────────────────────────────

function applyStatusToAction(
  action: BodyAction,
  slot: BodySlot,
  statuses: StatusEffect[],
  isOverride: boolean
): { value: number; targetMode: TargetMode } {
  let value = action.baseValue
  const targetMode = action.targetMode

  // Override actions do NOT receive Strength/Dexterity bonuses
  if (isOverride) return { value, targetMode }

  if (slot === 'Arms' && action.type === 'damage') {
    value += getStatus(statuses, 'Strength')
    if (getStatus(statuses, 'Weak') > 0) {
      value = Math.floor(value * 0.75)
    }
  }

  if (slot === 'Torso' && action.type === 'block') {
    value += getStatus(statuses, 'Dexterity')
  }

  return { value: Math.max(0, value), targetMode }
}

export function resolveBodyAction(
  slot: BodySlot,
  equipment: EquipmentDefinition | null,
  modifierInstanceId: string | null,
  cardDefs: Record<string, ModifierCardDefinition>,
  combat: CombatState,
  parts: BehavioralPartDefinition[],
  modifierInstanceId2: string | null = null
): ActionResult {
  const result: ActionResult = {
    damage: [],
    blockGained: 0,
    healAmount: 0,
    cardsDrawn: 0,
    foresight: 0,
  }

  // Resolve both modifier definitions, respecting upgrade + push state.
  function resolveModDef(instanceId: string | null): ModifierCardDefinition | null {
    if (!instanceId) return null
    const cardInst = [...combat.hand].find(c => c.instanceId === instanceId)
      ?? findAssignedCard(combat, instanceId)
    if (!cardInst) return null
    const baseDef = cardDefs[cardInst.definitionId]
    if (!baseDef) return null
    // 1. Apply upgraded variant if applicable.
    let def: ModifierCardDefinition = cardInst.isUpgraded && baseDef.upgraded ? baseDef.upgraded : baseDef
    // 2. If the card was pushed, swap to its pushed category.
    if (combat.pushedCards[instanceId] && def.pushCost != null && def.pushedCategory != null) {
      def = { ...def, category: def.pushedCategory }
    }
    if (def.category.type === 'slot') return def
    return null
  }

  const modifierDef = resolveModDef(modifierInstanceId)
  const modifierDef2 = resolveModDef(modifierInstanceId2)

  // Determine the action: override takes priority (first override found wins)
  let action: BodyAction | null = null
  let isOverride = false

  const overrideMod = [modifierDef, modifierDef2].find(
    m => m?.category.type === 'slot' && (m.category.effect.type === 'override' || m.category.effect.type === 'overrideExhaustHand')
  )
  if (overrideMod?.category.type === 'slot' && overrideMod.category.effect.type === 'override') {
    action = overrideMod.category.effect.action
    isOverride = true
  } else if (overrideMod?.category.type === 'slot' && overrideMod.category.effect.type === 'overrideExhaustHand') {
    // Jettison: damage resolved in executeBodyActions, use dummy action
    action = { type: 'damage', baseValue: 0, targetMode: 'single_enemy' }
    isOverride = true
  } else if (equipment) {
    action = equipment.action
  } else {
    return result
  }

  const { value, targetMode } = applyStatusToAction(action, slot, combat.statusEffects, isOverride)
  let finalValue = value

  // Apply bonus heal from equipment (e.g., Patched Hull)
  if (equipment?.bonusHeal) {
    result.healAmount += equipment.bonusHeal
  }

  // bonusForesight removed — foresight no longer on equipment

  // Apply modifier effects (non-override) from both modifiers
  let repeatCount = 1
  let finalTargetMode = targetMode
  const valueBeforeModifier = finalValue
  let hasNonOverrideMod = false

  for (const mDef of [modifierDef, modifierDef2]) {
    if (!mDef || mDef.category.type !== 'slot') continue
    if (mDef === overrideMod) continue
    hasNonOverrideMod = true
    const effect = mDef.category.effect
    switch (effect.type) {
      case 'amplify':
        finalValue = Math.floor(finalValue * effect.multiplier)
        break
      case 'redirect':
        finalTargetMode = effect.targetMode
        break
      case 'repeat':
        repeatCount += effect.extraFirings
        break
      case 'feedback':
        if (!isOverride) {
          if (slot === 'Head') result.feedbackType = 'head'
          else if (slot === 'Torso') result.feedbackType = 'torso'
          else if (slot === 'Arms') result.feedbackType = 'arms'
          else if (slot === 'Legs') result.feedbackType = 'legs'
        }
        break
      case 'retaliate':
        // Flag is set on combat state during executeBodyActions
        break
      // Berserker
      case 'amplifyWithSelfDamage':
        finalValue = Math.floor(finalValue * effect.multiplier)
        result.selfDamage = (result.selfDamage ?? 0) + effect.selfDamage
        break
      case 'overclockSlot':
        repeatCount = 3 // fires exactly 3 times
        result.disableSlotNextTurn = true
        break
      // Exhaust-scaling
      case 'amplifyScaling': {
        const exhaustMult = 1 + effect.perStack * combat.exhaustPile.length
        finalValue = Math.floor(finalValue * exhaustMult)
        break
      }
      case 'overrideExhaustHand':
        // Handled during executeBodyActions (needs to mutate hand)
        break
      case 'repeatScaling': {
        const extra = Math.min(Math.floor(combat.exhaustPile.length / effect.perN), effect.maxExtra)
        repeatCount += extra
        break
      }
      // Counter
      case 'crossSlotBonus':
        // Resolved in executeBodyActions where full equipment context is available
        break
      case 'combinedBlockRetaliate':
        finalValue = Math.floor(finalValue * effect.multiplier)
        // Retaliate flag set in executeBodyActions
        break
      case 'blockHeal':
        // Flag set in executeBodyActions
        break
      case 'volatileBlock':
        // Flag set in executeBodyActions
        break
      // Stat
      case 'amplifyStatMultiplier':
        // Override the stat bonus: multiply the stat's contribution
        // The stat was already added in applyStatusToAction. We need to add extra.
        if (effect.stat === 'Dexterity' && slot === 'Torso' && !isOverride) {
          const dex = getStatus(combat.statusEffects, 'Dexterity')
          finalValue += dex * (effect.multiplier - 1) // add the extra (3x - 1x = 2x more)
        }
        if (effect.stat === 'Strength' && slot === 'Arms' && !isOverride) {
          const str = getStatus(combat.statusEffects, 'Strength')
          finalValue += str * (effect.multiplier - 1)
        }
        break
      // Bridge
      case 'redirectPower':
        // Second firing with adjacent slot's action — handled in executeBodyActions
        result.redirectPowerActive = true
        break
      case 'feedbackLoop':
        repeatCount += combat.cardsExhaustedThisTurn
        break
    }
  }

  // Persistent Feedback (from system card) — apply if not already set by a slot modifier
  // Feedback does NOT trigger on Override actions (Override replaces the equipment, Feedback is equipment-based)
  if (!result.feedbackType && !isOverride && combat.persistentFeedback[slot]) {
    if (slot === 'Head') result.feedbackType = 'head'
    else if (slot === 'Torso') result.feedbackType = 'torso'
    else if (slot === 'Arms') result.feedbackType = 'arms'
    else if (slot === 'Legs') result.feedbackType = 'legs'
  }

  // Amplify modifiers part bonus
  if (hasNonOverrideMod) {
    for (const part of parts) {
      if (part.effect.type === 'amplifyModifiers') {
        const modifierDelta = finalValue - valueBeforeModifier
        if (modifierDelta > 0) {
          const bonus = Math.floor(modifierDelta * (part.effect.multiplier - 1))
          finalValue += bonus
        }
      }
    }
  }

  // Apply part bonuses for onSlotFire
  for (const part of parts) {
    if (part.trigger.type === 'onSlotFire' && part.trigger.slot === slot) {
      switch (part.effect.type) {
        case 'bonusDamage':
          if (action.type === 'damage') finalValue += part.effect.value
          break
        case 'bonusBlock':
          if (action.type === 'block') result.blockGained += part.effect.value
          break
        case 'bonusHealing':
          if (action.type === 'heal') result.healAmount += part.effect.value
          break
        case 'drawCards':
          result.cardsDrawn += part.effect.count
          break
        case 'damagePerExhausted':
          if (action.type === 'damage' && !isOverride) {
            finalValue += combat.exhaustPile.length
          }
          break
      }
    }
  }

  // Execute the action repeatCount times
  for (let i = 0; i < repeatCount; i++) {
    switch (action.type) {
      case 'damage':
        result.damage.push({ enemyId: '__pending__', amount: finalValue })
        break
      case 'block':
        result.blockGained += finalValue
        break
      case 'heal':
        result.healAmount += finalValue
        break
      case 'draw':
        result.cardsDrawn += finalValue
        break
      case 'foresight':
        result.foresight += finalValue
        break
      case 'debuff':
        if (action.debuffType) {
          if (!result.debuffsApplied) result.debuffsApplied = []
          result.debuffsApplied.push({
            debuffType: action.debuffType,
            stacks: finalValue,
            targetMode: action.targetMode,
          })
        }
        break
      case 'reduce':
        result.damageReduction = (result.damageReduction ?? 0) + finalValue
        break
    }
  }

  // Store target mode for damage resolution
  if (result.damage.length > 0) {
    for (const d of result.damage) {
      d.enemyId = finalTargetMode === 'all_enemies' ? '__all__' : '__single__'
    }
  }

  // Feedback secondary effects (computed after main action resolves)
  // NOTE: do NOT mutate combat here — resolveBodyAction is also called by projectSlotActions (pure/read-only)
  if (result.feedbackType === 'head') {
    // HEAD: cards drawn add +2 Arms damage per card (caller applies to combat.feedbackArmsBonus)
    result.feedbackHeadBonus = result.cardsDrawn * 2
  } else if (result.feedbackType === 'torso') {
    // TORSO: 75% of block gained dealt as damage to random enemy
    result.feedbackReflectDamage = Math.floor(result.blockGained * 0.75)
  } else if (result.feedbackType === 'arms') {
    // ARMS: 33% of damage dealt heals player (applied in execution loop after damage resolves)
    result.feedbackLifestealRatio = 0.33
  } else if (result.feedbackType === 'legs') {
    // LEGS: block persists to next turn
    result.feedbackPersistBlock = true
  }

  // Apply feedbackArmsBonus to Arms damage (from HEAD feedback earlier this execution)
  // Read-only: combat.feedbackArmsBonus is set by the caller (executeBodyActions), not here
  if (slot === 'Arms' && combat.feedbackArmsBonus > 0) {
    for (const d of result.damage) {
      d.amount += combat.feedbackArmsBonus
    }
  }

  return result
}

function findAssignedCard(combat: CombatState, instanceId: string): CardInstance | undefined {
  const allCards = [
    ...combat.hand,
    ...combat.drawPile,
    ...combat.discardPile,
    ...combat.exhaustPile,
  ]
  return allCards.find(c => c.instanceId === instanceId)
}

// ─── Execute Body Actions ────────────────────────────────────────────────────

export function executeBodyActions(ctx: CombatContext): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Reset per-execution state
  result.combat.feedbackArmsBonus = 0
  result.combat._legsFeedbackBlock = 0
  result.combat.retaliateActive = false
  result.combat.volatileArmorActive = false
  result.combat.absorbActive = false
  result.combat.absorbBlockGained = 0
  result.combat.damageReduction = 0

  // Fire onPlanningEnd part triggers (Empty Chamber: block per unplayed card)
  for (const part of ctx.parts) {
    if (part.trigger.type === 'onPlanningEnd') {
      applyPartEffect(part, result, ctx)
    }
  }

  for (const slot of BODY_SLOTS) {
    // System card slots: card effect already fired during planning,
    // but equipment still fires during execution (stacks with system card)
    if (result.combat.slotModifiers[slot] === '__system__') {
      result.combat.slotModifiers[slot] = null
    }

    // Disabled slots: Salvage Protocol generates Block, otherwise skip
    if (result.combat.disabledSlots.includes(slot)) {
      let salvaged = false
      for (const part of ctx.parts) {
        if (part.effect.type === 'blockForDisabledSlots') {
          result.combat.block += part.effect.value
          result.log.push(`${part.name}: ${slot} disabled → +${part.effect.value} Block`)
          salvaged = true
        }
      }
      if (!salvaged) result.log.push(`${slot} is disabled — skipped`)
      continue
    }

    const equip = ctx.equipment[slot]
    const modInstanceId = result.combat.slotModifiers[slot]
    const modInstanceId2 = result.combat.slotModifiers2[slot]

    if (!equip && !hasOverrideModifier(modInstanceId, ctx.cardDefs, result.combat)) {
      continue
    }

    const actionResult = resolveBodyAction(
      slot,
      equip,
      modInstanceId,
      ctx.cardDefs,
      result.combat,
      ctx.parts,
      modInstanceId2
    )

    // Retaliate: mark active when Torso fires with retaliate modifier
    if (slot === 'Torso') {
      const mods = [modInstanceId, modInstanceId2].filter(Boolean)
      for (const mId of mods) {
        const card = findAssignedCard(result.combat, mId!)
        if (card) {
          const def = ctx.cardDefs[card.definitionId]
          if (def?.category.type === 'slot' && def.category.effect.type === 'retaliate') {
            result.combat.retaliateActive = true
            result.log.push('Retaliate: damage absorbed by block will be dealt back')
          }
        }
      }
    }

    // ─── New modifier effects ──────────────────────────────────────

    // Cross-slot bonus: add source slot's equipment base value as Arms damage
    const mods = [modInstanceId, modInstanceId2].filter(Boolean)
    for (const mId of mods) {
      const card = findAssignedCard(result.combat, mId!)
      if (!card) continue
      const mDef = ctx.cardDefs[card.definitionId]
      if (!mDef || mDef.category.type !== 'slot') continue
      const eff = mDef.category.effect
      if (eff.type === 'crossSlotBonus' && !result.combat.disabledSlots.includes(eff.sourceSlot)) {
        const sourceEquip = ctx.equipment[eff.sourceSlot]
        if (sourceEquip) {
          const bonus = sourceEquip.action.baseValue
          for (const d of actionResult.damage) d.amount += bonus
          result.log.push(`${mDef.name}: +${bonus} from ${eff.sourceSlot}`)
        }
      }
      // Combined block + retaliate (Iron Curtain)
      if (eff.type === 'combinedBlockRetaliate') {
        result.combat.retaliateActive = true
        result.log.push('Iron Curtain: Retaliate active')
      }
      // Block heal (Absorb)
      if (eff.type === 'blockHeal') {
        result.combat.absorbActive = true
      }
      // Volatile block
      if (eff.type === 'volatileBlock') {
        result.combat.volatileArmorActive = true
        result.log.push('Volatile Armor active')
      }
      // Override exhaust hand (Jettison) — exhaust hand cards and create damage
      if (eff.type === 'overrideExhaustHand') {
        const handCards = result.combat.hand.slice()
        let exhausted = 0
        for (let i = 0; i < Math.min(handCards.length, eff.maxCards); i++) {
          const c = result.combat.hand.shift()
          if (c) {
            result.combat.exhaustPile.push(c)
            result.combat.cardsExhaustedThisTurn++
            exhausted++
            for (const part of ctx.parts) {
              if (part.trigger.type === 'onCardExhaust') {
                applyPartEffect(part, result, ctx)
              }
            }
          }
        }
        if (exhausted > 0) {
          const totalDmg = exhausted * eff.damagePerCard
          // Add as damage entries to actionResult
          actionResult.damage.push({ enemyId: '__single__', amount: totalDmg })
          result.log.push(`Jettison: exhausted ${exhausted} cards for ${totalDmg} damage`)
        }
      }
    }

    // Self-damage (Reckless Boost)
    if (actionResult.selfDamage && actionResult.selfDamage > 0) {
      result.stillHealth = Math.max(0, result.stillHealth - actionResult.selfDamage)
      result.log.push(`${slot}: took ${actionResult.selfDamage} self-damage`)
    }

    // Disable slot next turn (Overclock Slot) — stored separately so enemy turn clear doesn't erase it
    if (actionResult.disableSlotNextTurn) {
      if (!result.combat._overclockDisables) result.combat._overclockDisables = []
      if (!result.combat._overclockDisables.includes(slot)) {
        result.combat._overclockDisables.push(slot)
      }
      result.log.push(`${slot}: overclocked — disabled next turn`)
    }

    // Track block gained for Absorb
    if (actionResult.blockGained > 0 && result.combat.absorbActive) {
      result.combat.absorbBlockGained += actionResult.blockGained
    }

    // Apply debuffs from HEAD — with stack cap per enemy per combat (HEAD VULN fix)
    if (actionResult.debuffsApplied) {
      const HEAD_DEBUFF_CAP = 3
      for (const deb of actionResult.debuffsApplied) {
        const targets = deb.targetMode === 'all_enemies'
          ? result.combat.enemies.filter(e => !e.isDefeated)
          : resolveSingleTarget(result.combat.enemies, ctx.targetEnemyId)
        for (const enemy of targets) {
          // Track HEAD-applied debuffs per enemy
          if (!result.combat.headDebuffsApplied[enemy.instanceId]) {
            result.combat.headDebuffsApplied[enemy.instanceId] = { Weak: 0, Vulnerable: 0, Strength: 0, Dexterity: 0, Inspired: 0 }
          }
          const applied = result.combat.headDebuffsApplied[enemy.instanceId][deb.debuffType as 'Weak' | 'Vulnerable'] ?? 0
          const remaining = Math.max(0, HEAD_DEBUFF_CAP - applied)
          const actualStacks = Math.min(deb.stacks, remaining)
          if (actualStacks > 0) {
            enemy.statusEffects = addStatus(enemy.statusEffects, deb.debuffType as any, actualStacks)
            result.combat.headDebuffsApplied[enemy.instanceId][deb.debuffType as 'Weak' | 'Vulnerable'] = applied + actualStacks
          }
        }
        result.log.push(`${slot}: applied ${deb.stacks} ${deb.debuffType}${deb.targetMode === 'all_enemies' ? ' to all' : ''} (capped at ${HEAD_DEBUFF_CAP})`)
      }
    }

    // Apply damage reduction from LEGS
    if (actionResult.damageReduction && actionResult.damageReduction > 0) {
      result.combat.damageReduction += actionResult.damageReduction
      result.log.push(`${slot}: damage reduction ${result.combat.damageReduction} per hit`)
    }

    // Apply bonus block from equipment (LEGS hybrid pieces)
    if (equip?.bonusBlock && equip.bonusBlock > 0) {
      result.combat.block += equip.bonusBlock
      if (result.combat.absorbActive) result.combat.absorbBlockGained += equip.bonusBlock
      result.log.push(`${slot}: +${equip.bonusBlock} bonus Block`)
    }

    // Redirect Power: fire adjacent slot's action as second hit
    if (actionResult.redirectPowerActive) {
      const adjacentMap: Record<BodySlot, BodySlot> = { Head: 'Torso', Torso: 'Head', Arms: 'Legs', Legs: 'Arms' }
      const adjSlot = adjacentMap[slot]
      const adjEquip = ctx.equipment[adjSlot]
      if (adjEquip && !result.combat.disabledSlots.includes(adjSlot)) {
        const adjAction = adjEquip.action
        const adjValue = adjAction.baseValue
        if (adjAction.type === 'damage') {
          actionResult.damage.push({ enemyId: adjAction.targetMode === 'all_enemies' ? '__all__' : '__single__', amount: adjValue })
          result.log.push(`Redirect Power: +${adjValue} damage from ${adjSlot}`)
        } else if (adjAction.type === 'block') {
          actionResult.blockGained += adjValue
          result.log.push(`Redirect Power: +${adjValue} block from ${adjSlot}`)
        } else if (adjAction.type === 'draw') {
          drawCards(result.combat, adjValue, ctx.rng)
          result.log.push(`Redirect Power: drew ${adjValue} from ${adjSlot}`)
        } else if (adjAction.type === 'heal') {
          result.stillHealth = Math.min(ctx.maxHealth, result.stillHealth + adjValue)
          result.log.push(`Redirect Power: healed ${adjValue} from ${adjSlot}`)
        }
      }
    }

    // HEAD Feedback: apply bonus to combat state for Arms to read later
    if (actionResult.feedbackHeadBonus && actionResult.feedbackHeadBonus > 0) {
      result.combat.feedbackArmsBonus += actionResult.feedbackHeadBonus
      result.log.push(`Head Feedback: +${actionResult.feedbackHeadBonus} bonus damage for Arms`)
    }

    // Apply block
    if (actionResult.blockGained > 0) {
      result.combat.block += actionResult.blockGained
      result.log.push(`${slot}: gained ${actionResult.blockGained} Block`)
    }

    // Apply healing
    if (actionResult.healAmount > 0) {
      result.stillHealth = Math.min(ctx.maxHealth, result.stillHealth + actionResult.healAmount)
      result.log.push(`${slot}: healed ${actionResult.healAmount}`)
    }

    // Vent: skip damage-type slot fires entirely
    if (result.combat.ventedThisTurn && actionResult.damage.length > 0) {
      actionResult.damage = []
      result.log.push(`${slot}: damage skipped (venting)`)
    }

    // Apply damage to enemies
    const perEnemyDamage: Array<{ enemyId: string; amount: number }> = []
    for (const dmg of actionResult.damage) {
      const targets = dmg.enemyId === '__all__'
        ? result.combat.enemies.filter(e => !e.isDefeated)
        : resolveSingleTarget(result.combat.enemies, ctx.targetEnemyId)

      for (const enemy of targets) {
        let dealt = dmg.amount
        if (getStatus(enemy.statusEffects, 'Vulnerable') > 0) {
          dealt = Math.floor(dealt * 1.5)
        }
        const absorbed = Math.min(enemy.block, dealt)
        enemy.block -= absorbed
        const actual = dealt - absorbed
        enemy.currentHealth = Math.max(0, enemy.currentHealth - actual)
        if (enemy.currentHealth === 0) enemy.isDefeated = true
        if (actual > 0) perEnemyDamage.push({ enemyId: enemy.instanceId, amount: actual })
        result.log.push(`${slot}: dealt ${actual} damage to ${enemy.definitionId}${absorbed > 0 ? ` (${absorbed} blocked)` : ''}`)
      }
    }

    // Feedback secondary effects
    if (actionResult.feedbackReflectDamage && actionResult.feedbackReflectDamage > 0) {
      // TORSO feedback: deal reflected damage to random alive enemy
      const alive = result.combat.enemies.filter(e => !e.isDefeated)
      if (alive.length > 0) {
        const target = alive[Math.floor((ctx.rng ?? Math.random)() * alive.length)]
        const reflected = actionResult.feedbackReflectDamage
        const absorbedRef = Math.min(target.block, reflected)
        target.block -= absorbedRef
        const actualRef = reflected - absorbedRef
        target.currentHealth = Math.max(0, target.currentHealth - actualRef)
        if (target.currentHealth === 0) target.isDefeated = true
        if (actualRef > 0) perEnemyDamage.push({ enemyId: target.instanceId, amount: actualRef })
        result.log.push(`${slot} Feedback: reflected ${actualRef} damage to ${target.definitionId}`)
      }
    }
    if (actionResult.feedbackLifestealRatio && actionResult.feedbackLifestealRatio > 0) {
      // ARMS feedback: heal based on total damage dealt
      const totalDealt = perEnemyDamage.reduce((sum, d) => sum + d.amount, 0)
      const healFromLifesteal = Math.floor(totalDealt * actionResult.feedbackLifestealRatio)
      if (healFromLifesteal > 0) {
        result.stillHealth = Math.min(ctx.maxHealth, result.stillHealth + healFromLifesteal)
        result.log.push(`${slot} Feedback: healed ${healFromLifesteal} from lifesteal`)
      }
    }
    if (actionResult.feedbackPersistBlock) {
      // LEGS feedback: mark block from this slot as persistent (handled at turn end)
      result.combat._legsFeedbackBlock = (result.combat._legsFeedbackBlock ?? 0) + actionResult.blockGained
    }

    // Reset feedbackArmsBonus after Arms has consumed it
    if (slot === 'Arms') {
      result.combat.feedbackArmsBonus = 0
    }

    // Apply card draw from body actions
    if (actionResult.cardsDrawn > 0) {
      drawCards(result.combat, actionResult.cardsDrawn, ctx.rng)
    }

    // Apply blockCost
    if (equip?.blockCost) {
      const cost = Math.min(result.combat.block, equip.blockCost)
      result.combat.block -= cost
      if (cost > 0) result.log.push(`${slot}: lost ${cost} Block (block cost)`)
    }

    // Emit combat event (include lifesteal heal in the heal total)
    let totalHeal = actionResult.healAmount
    if (actionResult.feedbackLifestealRatio && actionResult.feedbackLifestealRatio > 0) {
      const totalDealtForEvent = perEnemyDamage.reduce((sum, d) => sum + d.amount, 0)
      totalHeal += Math.floor(totalDealtForEvent * actionResult.feedbackLifestealRatio)
    }
    const targetMode = equip?.action.targetMode ?? 'single_enemy' as const
    const slotEvent: CombatEvent = {
      type: 'slotFire',
      slot,
      damages: perEnemyDamage.length > 0 ? perEnemyDamage : undefined,
      block: actionResult.blockGained > 0 ? actionResult.blockGained : undefined,
      heal: totalHeal > 0 ? totalHeal : undefined,
      targetMode,
    }
    result.combat.combatLog.push(slotEvent)
  }

  // Absorb: heal 50% of total block gained this execution
  if (result.combat.absorbActive && result.combat.absorbBlockGained > 0) {
    const heal = Math.floor(result.combat.absorbBlockGained * 0.5)
    if (heal > 0) {
      result.stillHealth = Math.min(ctx.maxHealth, result.stillHealth + heal)
      result.log.push(`Absorb: healed ${heal} (50% of ${result.combat.absorbBlockGained} block)`)
    }
  }

  return result
}

function hasOverrideModifier(
  instanceId: string | null,
  cardDefs: Record<string, ModifierCardDefinition>,
  combat: CombatState
): boolean {
  if (!instanceId) return false
  const cardInst = findAssignedCard(combat, instanceId)
  if (!cardInst) return false
  const def = cardDefs[cardInst.definitionId]
  if (!def || def.category.type !== 'slot') return false
  const t = def.category.effect.type
  return t === 'override' || t === 'overrideExhaustHand'
}

// ─── Play Modifier Card ─────────────────────────────────────────────────────

export function playModifierCard(
  ctx: CombatContext,
  cardDef: ModifierCardDefinition,
  instanceId: string,
  targetSlot?: BodySlot,
  pushed: boolean = false,
): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Resolve push state: pushed cards swap category for pushedCategory
  const isActuallyPushed = pushed && cardDef.pushCost != null && cardDef.pushedCategory != null
  const card: ModifierCardDefinition = isActuallyPushed
    ? { ...cardDef, category: cardDef.pushedCategory! }
    : cardDef

  // Vent: special free-play card that recovers strain and sets flag to skip damage actions
  if (cardDef.ventEffect) {
    const recovery = cardDef.ventStrainRecovery ?? VENT_STRAIN_RECOVERY
    result.combat.strain = Math.max(0, result.combat.strain - recovery)
    result.combat.ventedThisTurn = true
    // Vent goes to exhaust (consumed)
    const handIdx = result.combat.hand.findIndex(c => c.instanceId === instanceId)
    if (handIdx !== -1) {
      const [ventCard] = result.combat.hand.splice(handIdx, 1)
      result.combat.exhaustPile.push(ventCard)
    }
    result.log.push(`${card.name}: vent. Strain -${recovery}. Damage actions skipped this turn.`)
    return result
  }

  // Check energy sufficiency
  if (card.energyCost > result.combat.currentEnergy) {
    result.log.push(`Cannot play ${card.name}: costs ${card.energyCost} energy, have ${result.combat.currentEnergy}`)
    return result
  }

  // If pushed, verify strain budget
  if (isActuallyPushed) {
    const pushCost = cardDef.pushCost!
    if (result.combat.strain + pushCost >= result.combat.maxStrain) {
      result.log.push(`Cannot push ${card.name}: would reach forfeit strain`)
      return result
    }
  }

  // Deduct energy
  result.combat.currentEnergy -= card.energyCost

  // Deduct strain and record push
  if (isActuallyPushed) {
    result.combat.strain += cardDef.pushCost!
    result.combat.pushedCards[instanceId] = true
  }

  if (card.category.type === 'slot') {
    if (!targetSlot) {
      result.log.push(`${card.name} requires a target slot`)
      return result
    }

    if (result.combat.disabledSlots.includes(targetSlot)) {
      result.log.push(`Cannot target disabled slot: ${targetSlot}`)
      return result
    }

    const allowed = getAllowedSlots(card)
    if (allowed && !allowed.includes(targetSlot)) {
      result.log.push(`${card.name} cannot be assigned to ${targetSlot}`)
      return result
    }

    const isFeedback = card.category.effect.type === 'feedback'

    if (result.combat.slotModifiers[targetSlot] !== null) {
      // Feedback always goes to secondary slot (stacks with any modifier)
      const hasDualLoader = ctx.parts.some(p => p.effect.type === 'dualLoader')
      if ((!hasDualLoader && !isFeedback) || result.combat.slotModifiers2[targetSlot] !== null) {
        result.log.push(`${targetSlot} already has a modifier assigned`)
        return result
      }
    }

    if (card.category.effect.type !== 'override' && !ctx.equipment[targetSlot]) {
      result.log.push(`Cannot assign ${card.category.modifier} to empty ${targetSlot} slot`)
      return result
    }

    // Feedback always uses secondary slot so it never blocks primary modifiers
    if (isFeedback) {
      result.combat.slotModifiers2[targetSlot] = instanceId
    } else if (result.combat.slotModifiers[targetSlot] !== null) {
      result.combat.slotModifiers2[targetSlot] = instanceId
    } else {
      result.combat.slotModifiers[targetSlot] = instanceId
    }

    result.log.push(`Assigned ${card.name} to ${targetSlot}`)
  } else if (card.freePlay) {
    // Free-play system card — fires instantly without occupying a slot (e.g., companions)

    // Handle applyFeedback: set persistent Feedback on the target slot
    if (card.category.type === 'system' && card.category.effects.some(e => e.type === 'applyFeedback')) {
      if (targetSlot) {
        if (!ctx.equipment[targetSlot]) {
          result.log.push(`Cannot apply Feedback to empty ${targetSlot} slot`)
          result.combat.currentEnergy += card.energyCost // refund
          return result
        }
        result.combat.persistentFeedback[targetSlot] = true
        result.log.push(`${card.name}: ${targetSlot} gains permanent Feedback`)
      } else {
        result.log.push(`${card.name} requires a target slot`)
        result.combat.currentEnergy += card.energyCost // refund
        return result
      }
    } else {
      // Apply system card effects (heal, applyStatus, removeDebuff, etc.)
      for (const effect of card.category.effects) {
        switch (effect.type) {
          case 'draw': {
            const actualDrawn = drawCards(result.combat, effect.count, ctx.rng)
            result.log.push(`Drew ${actualDrawn}/${effect.count} card(s)`)
            break
          }
          case 'heal':
            result.stillHealth = Math.min(ctx.maxHealth, result.stillHealth + effect.value)
            result.log.push(`Healed ${effect.value}`)
            break
          case 'applyStatus':
            if (effect.target === 'self') {
              result.combat.statusEffects = addStatus(
                result.combat.statusEffects,
                effect.status,
                effect.stacks
              )
              result.log.push(`Applied ${effect.stacks} ${effect.status}`)
            } else if (effect.target === 'all_enemies') {
              for (const enemy of result.combat.enemies) {
                if (!enemy.isDefeated) {
                  enemy.statusEffects = addStatus(
                    enemy.statusEffects,
                    effect.status,
                    effect.stacks
                  )
                }
              }
              result.log.push(`Applied ${effect.stacks} ${effect.status} to all enemies`)
            }
            break
          case 'removeDebuff': {
            const debuffOrder: StatusEffectType[] = ['Weak', 'Vulnerable']
            let removed = 0
            for (const debuffType of debuffOrder) {
              if (removed >= effect.count) break
              const idx = result.combat.statusEffects.findIndex(s => s.type === debuffType)
              if (idx !== -1) {
                const s = result.combat.statusEffects[idx]
                if (s.stacks <= 1) {
                  result.combat.statusEffects.splice(idx, 1)
                } else {
                  s.stacks -= 1
                }
                removed++
                result.log.push(`Removed 1 ${debuffType}`)
              }
            }
            break
          }
          case 'gainBlock':
            result.combat.block += effect.value
            result.log.push(`Gained ${effect.value} Block`)
            break
          case 'damage': {
            const targets = effect.targetMode === 'all_enemies'
              ? result.combat.enemies.filter(e => !e.isDefeated)
              : resolveSingleTarget(result.combat.enemies, ctx.targetEnemyId)
            for (const enemy of targets) {
              let dealt = effect.value
              if (getStatus(enemy.statusEffects, 'Vulnerable') > 0) {
                dealt = Math.floor(dealt * 1.5)
              }
              const absorbed = Math.min(enemy.block, dealt)
              enemy.block -= absorbed
              const actual = dealt - absorbed
              enemy.currentHealth = Math.max(0, enemy.currentHealth - actual)
              if (enemy.currentHealth === 0) enemy.isDefeated = true
              result.log.push(`Dealt ${actual} damage to ${enemy.definitionId}`)
            }
            break
          }
          case 'applyBurnout':
            result.combat.burnoutActive = true
            result.log.push('Burnout active: -4 HP, +2 Strength each turn')
            break
          case 'disableOwnSlot':
            if (targetSlot) {
              if (!result.combat.disabledSlots.includes(targetSlot)) {
                result.combat.disabledSlots.push(targetSlot)
              }
              result.combat.currentEnergy += effect.energyGain
              result.log.push(`Shutdown: disabled ${targetSlot}, gained ${effect.energyGain} Energy`)
            }
            break
        }
      }
      result.log.push(`${card.name} played freely`)
    }

    // Remove freePlay card from hand and exhaust/discard
    const fpHandIdx = result.combat.hand.findIndex(c => c.instanceId === instanceId)
    if (fpHandIdx !== -1) {
      const fpCardInst = result.combat.hand.splice(fpHandIdx, 1)[0]
      if (card.keywords.includes('Exhaust')) {
        result.combat.exhaustPile.push(fpCardInst)
        result.combat.cardsExhaustedThisTurn++
        for (const part of ctx.parts) {
          if (part.trigger.type === 'onCardExhaust') {
            applyPartEffect(part, result, ctx)
          }
        }
      } else {
        result.combat.discardPile.push(fpCardInst)
      }
    }
  } else {
    // System card — assigned to home slot, fires instantly during planning
    if (!targetSlot) {
      result.log.push(`${card.name} requires its home slot (${card.category.homeSlot})`)
      return result
    }

    if (targetSlot !== card.category.homeSlot) {
      result.log.push(`${card.name} can only be assigned to ${card.category.homeSlot}`)
      return result
    }

    if (result.combat.disabledSlots.includes(targetSlot)) {
      result.log.push(`Cannot target disabled slot: ${targetSlot}`)
      return result
    }

    if (result.combat.slotModifiers[targetSlot] !== null) {
      result.log.push(`${targetSlot} already has a card assigned`)
      return result
    }

    result.combat.slotModifiers[targetSlot] = '__system__'

    const handIdx = result.combat.hand.findIndex(c => c.instanceId === instanceId)
    let cardInst: CardInstance | undefined
    if (handIdx !== -1) {
      cardInst = result.combat.hand.splice(handIdx, 1)[0]
    }

    // Apply system card effects
    for (const effect of card.category.effects) {
      switch (effect.type) {
        case 'draw': {
          const actualDrawn = drawCards(result.combat, effect.count, ctx.rng)
          result.log.push(`Drew ${actualDrawn}/${effect.count} card(s)`)
          break
        }
        case 'heal':
          result.stillHealth = Math.min(ctx.maxHealth, result.stillHealth + effect.value)
          result.log.push(`Healed ${effect.value}`)
          break
        case 'applyStatus':
          if (effect.target === 'self') {
            result.combat.statusEffects = addStatus(
              result.combat.statusEffects,
              effect.status,
              effect.stacks
            )
            result.log.push(`Applied ${effect.stacks} ${effect.status}`)
          } else if (effect.target === 'all_enemies') {
            for (const enemy of result.combat.enemies) {
              if (!enemy.isDefeated) {
                enemy.statusEffects = addStatus(
                  enemy.statusEffects,
                  effect.status,
                  effect.stacks
                )
              }
            }
            result.log.push(`Applied ${effect.stacks} ${effect.status} to all enemies`)
          }
          break
        case 'removeDebuff': {
          const debuffOrder: StatusEffectType[] = ['Weak', 'Vulnerable']
          let removed = 0
          for (const debuffType of debuffOrder) {
            if (removed >= effect.count) break
            const idx = result.combat.statusEffects.findIndex(s => s.type === debuffType)
            if (idx !== -1) {
              const s = result.combat.statusEffects[idx]
              if (s.stacks <= 1) {
                result.combat.statusEffects.splice(idx, 1)
              } else {
                s.stacks -= 1
              }
              removed++
              result.log.push(`Removed 1 ${debuffType}`)
            }
          }
          break
        }
        case 'gainBlock':
          result.combat.block += effect.value
          result.log.push(`Gained ${effect.value} Block`)
          break
        case 'damage': {
          const targets = effect.targetMode === 'all_enemies'
            ? result.combat.enemies.filter(e => !e.isDefeated)
            : resolveSingleTarget(result.combat.enemies, ctx.targetEnemyId)
          for (const enemy of targets) {
            let dealt = effect.value
            if (getStatus(enemy.statusEffects, 'Vulnerable') > 0) {
              dealt = Math.floor(dealt * 1.5)
            }
            const absorbed = Math.min(enemy.block, dealt)
            enemy.block -= absorbed
            const actual = dealt - absorbed
            enemy.currentHealth = Math.max(0, enemy.currentHealth - actual)
            if (enemy.currentHealth === 0) enemy.isDefeated = true
            result.log.push(`Dealt ${actual} damage to ${enemy.definitionId}`)
          }
          break
        }
        case 'applyBurnout':
          result.combat.burnoutActive = true
          result.log.push('Burnout active: -4 HP, +2 Strength each turn')
          break
        case 'disableOwnSlot':
          // Non-freePlay version (shouldn't happen, but handle anyway)
          break
      }
    }

    // Move to exhaust or discard
    if (cardInst) {
      const shouldExhaust = card.category.type === 'system' || card.keywords.includes('Exhaust')
      if (shouldExhaust) {
        result.combat.exhaustPile.push(cardInst)
        result.combat.cardsExhaustedThisTurn++
        for (const part of ctx.parts) {
          if (part.trigger.type === 'onCardExhaust') {
            applyPartEffect(part, result, ctx)
          }
        }
      } else {
        result.combat.discardPile.push(cardInst)
      }
    }
  }

  // Fire onModifierPlay part triggers
  if (card.category.type === 'slot') {
    for (const part of ctx.parts) {
      if (part.trigger.type === 'onModifierPlay' && card.category.modifier === part.trigger.modifier) {
        applyPartEffect(part, result, ctx)
      }
    }
  }

  // Fire onCardPlay part triggers
  for (const part of ctx.parts) {
    if (part.trigger.type === 'onCardPlay') {
      if (part.id === 'residual-charge' && card.category.type !== 'system') continue
      applyPartEffect(part, result, ctx)
    }
  }

  return result
}

// ─── Unassign Modifier (for planning phase) ─────────────────────────────────

export function unassignModifier(
  ctx: CombatContext,
  slot: BodySlot,
  card: ModifierCardDefinition
): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  const secondaryId = result.combat.slotModifiers2[slot]
  const primaryId = result.combat.slotModifiers[slot]

  const refundPushStrain = (instanceId: string) => {
    if (result.combat.pushedCards[instanceId] && card.pushCost != null) {
      result.combat.strain = Math.max(0, result.combat.strain - card.pushCost)
      delete result.combat.pushedCards[instanceId]
    }
  }

  if (secondaryId) {
    result.combat.currentEnergy = Math.min(result.combat.maxEnergy, result.combat.currentEnergy + card.energyCost)
    refundPushStrain(secondaryId)
    result.combat.slotModifiers2[slot] = null
    result.log.push(`Unassigned ${card.name} from ${slot} (secondary)`)
  } else if (primaryId) {
    result.combat.currentEnergy = Math.min(result.combat.maxEnergy, result.combat.currentEnergy + card.energyCost)
    refundPushStrain(primaryId)
    result.combat.slotModifiers[slot] = null
    result.log.push(`Unassigned ${card.name} from ${slot}`)
  } else {
    result.log.push(`No modifier assigned to ${slot}`)
  }

  return result
}

// ─── Execute Enemy Turn (Task 2.8) ──────────────────────────────────────────

export function executeEnemyTurn(ctx: CombatContext): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Clear slot disables from previous enemy turn (before applying new ones)
  result.combat.disabledSlots = []

  // Reset enemy block
  for (const enemy of result.combat.enemies) {
    enemy.block = 0
  }

  for (const enemy of result.combat.enemies) {
    if (enemy.isDefeated) continue
    const def = ctx.enemyDefs[enemy.definitionId]
    if (!def) continue
    const intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]

    // Scan: telegraph turn — no action
    if (intent.type === 'Scan') {
      result.log.push(`${def.name} is scanning...`)
      result.combat.combatLog.push({
        type: 'enemyAction',
        enemyId: enemy.instanceId,
        enemyName: def.name,
        intentType: 'Scan',
      })
      enemy.intentIndex++
      enemy.statusEffects = decrementStatuses(enemy.statusEffects)
      continue
    }

    let eventDamage: number | undefined
    let eventBlocked: number | undefined
    let eventReduced: number | undefined
    let eventBlock: number | undefined
    let eventStatus: StatusEffectType | undefined
    let eventCounterDamage = 0

    switch (intent.type) {
      case 'Attack':
      case 'AttackDebuff': {
        // Calculate per-hit damage (same for all hits)
        let perHit = intent.value
        // Damage scaling: bosses get flat +15%, regular enemies scale with combatsCleared
        const scalingMultiplier = def.isBoss
          ? 1.15
          : 1 + ctx.combatsCleared * 0.05
        perHit = Math.floor(perHit * scalingMultiplier)
        // Enemy Strength
        perHit += getStatus(enemy.statusEffects, 'Strength')
        // Weak reduces enemy damage
        if (getStatus(enemy.statusEffects, 'Weak') > 0) perHit = Math.floor(perHit * 0.75)
        // Vulnerable on Still
        if (getStatus(result.combat.statusEffects, 'Vulnerable') > 0) perHit = Math.floor(perHit * 1.5)
        perHit = Math.max(0, perHit)

        const hitCount = intent.hits ?? 1
        let totalDamage = 0
        let totalBlocked = 0
        let totalReduced = 0
        for (let h = 0; h < hitCount; h++) {
          let dealt = perHit
          // Ablative Shell: halve first big hit each combat
          if (!result.combat.ablativeShellUsed) {
            for (const part of ctx.parts) {
              if (part.effect.type === 'halveLargeDamage' && dealt >= part.effect.threshold) {
                result.combat.combatLog.push({ type: 'partTrigger', partId: part.id })
                dealt = Math.floor(dealt / 2)
                result.combat.ablativeShellUsed = true
                result.log.push(`${part.name}: halved incoming damage to ${dealt}`)
                break
              }
            }
          }
          // LEGS damage reduction: reduce each hit before block
          if (result.combat.damageReduction > 0) {
            const reduced = Math.min(dealt, result.combat.damageReduction)
            dealt -= reduced
            totalReduced += reduced
          }
          const absorbed = Math.min(result.combat.block, dealt)
          result.combat.block -= absorbed
          const actual = dealt - absorbed
          result.stillHealth = Math.max(0, result.stillHealth - actual)
          totalDamage += actual
          totalBlocked += absorbed
        }
        eventDamage = totalDamage
        eventBlocked = totalBlocked
        eventReduced = totalReduced > 0 ? totalReduced : undefined
        const hitsLabel = hitCount > 1 ? ` (${hitCount} hits)` : ''
        const reducedLabel = totalReduced > 0 ? `, ${totalReduced} reduced` : ''
        result.log.push(`${def.name} attacks for ${totalDamage} (${totalBlocked} blocked${reducedLabel})${hitsLabel}`)

        // Retaliate: reflect ALL incoming damage back to attacker
        const totalIncoming = totalDamage + totalBlocked
        if (result.combat.retaliateActive && totalIncoming > 0) {
          const retAbsorbed = Math.min(enemy.block, totalIncoming)
          enemy.block -= retAbsorbed
          const retActual = totalIncoming - retAbsorbed
          enemy.currentHealth = Math.max(0, enemy.currentHealth - retActual)
          if (enemy.currentHealth === 0) enemy.isDefeated = true
          eventCounterDamage += retActual
          result.log.push(`Retaliate: dealt ${retActual} damage back to ${def.name}`)
        }

        // Volatile Armor: consumed block deals damage to attacker
        if (result.combat.volatileArmorActive && totalBlocked > 0) {
          const vaAbsorbed = Math.min(enemy.block, totalBlocked)
          enemy.block -= vaAbsorbed
          const vaActual = totalBlocked - vaAbsorbed
          enemy.currentHealth = Math.max(0, enemy.currentHealth - vaActual)
          if (enemy.currentHealth === 0) enemy.isDefeated = true
          eventCounterDamage += vaActual
          result.log.push(`Volatile Armor: dealt ${vaActual} damage to ${def.name}`)
        }

        // Counter parts: trigger on damage taken
        for (const part of ctx.parts) {
          if (part.trigger.type !== 'onDamageTaken') continue

          if (part.effect.type === 'thorns' && totalDamage > 0) {
            // Thorns: deal flat damage to attacker when player takes HP damage
            const thornsDmg = part.effect.value
            const thornsAbsorbed = Math.min(enemy.block, thornsDmg)
            enemy.block -= thornsAbsorbed
            const thornsActual = thornsDmg - thornsAbsorbed
            enemy.currentHealth = Math.max(0, enemy.currentHealth - thornsActual)
            if (enemy.currentHealth === 0) enemy.isDefeated = true
            eventCounterDamage += thornsActual
            result.log.push(`${part.name}: dealt ${thornsActual} thorns to ${def.name}`)
          }

          if (part.effect.type === 'voltageCounter' && totalBlocked > 0) {
            // Voltage Core: deal block consumed as damage to attacker
            const vcAbsorbed = Math.min(enemy.block, totalBlocked)
            enemy.block -= vcAbsorbed
            const vcActual = totalBlocked - vcAbsorbed
            enemy.currentHealth = Math.max(0, enemy.currentHealth - vcActual)
            if (enemy.currentHealth === 0) enemy.isDefeated = true
            eventCounterDamage += vcActual
            result.log.push(`${part.name}: dealt ${vcActual} voltage damage to ${def.name}`)
          }
        }

        if (intent.type === 'AttackDebuff' && intent.status) {
          result.combat.statusEffects = addStatus(
            result.combat.statusEffects,
            intent.status,
            intent.statusStacks ?? 1
          )
          eventStatus = intent.status
        }
        break
      }
      case 'Block': {
        enemy.block += intent.value
        eventBlock = intent.value
        result.log.push(`${def.name} braces (gains ${intent.value} Block)`)
        break
      }
      case 'Buff': {
        if (intent.status) {
          enemy.statusEffects = addStatus(enemy.statusEffects, intent.status, intent.value)
        }
        result.log.push(`${def.name} buffs itself`)
        break
      }
      case 'Debuff': {
        if (intent.status) {
          result.combat.statusEffects = addStatus(
            result.combat.statusEffects,
            intent.status,
            intent.statusStacks ?? intent.value
          )
          eventStatus = intent.status
        }
        result.log.push(`${def.name} debuffs Still`)
        break
      }
      case 'DisableSlot': {
        if (intent.targetSlot && !result.combat.disabledSlots.includes(intent.targetSlot)) {
          result.combat.disabledSlots.push(intent.targetSlot)
          result.log.push(`${def.name} disables ${intent.targetSlot} slot`)
        }
        break
      }
    }

    result.combat.combatLog.push({
      type: 'enemyAction',
      enemyId: enemy.instanceId,
      enemyName: def.name,
      intentType: intent.type,
      damage: eventDamage,
      blocked: eventBlocked,
      reduced: eventReduced,
      block: eventBlock,
      statusApplied: eventStatus,
      counterDamage: eventCounterDamage > 0 ? eventCounterDamage : undefined,
    })

    enemy.intentIndex++
    enemy.statusEffects = decrementStatuses(enemy.statusEffects)
  }

  return result
}

// ─── End of Turn ─────────────────────────────────────────────────────────────

export function endTurn(ctx: CombatContext): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Step 8b: Decrement Still's status durations
  const inspiredBonus = getStatus(result.combat.statusEffects, 'Inspired')
  result.combat.statusEffects = decrementStatuses(result.combat.statusEffects)

  // Step 9: Move assigned slot modifiers to discard/exhaust, then discard remaining hand
  const assignedIds = new Set<string>()
  for (const slot of BODY_SLOTS) {
    // Handle both primary and secondary (Dual Loader) modifiers
    for (const modId of [result.combat.slotModifiers[slot], result.combat.slotModifiers2[slot]]) {
      if (modId) {
        assignedIds.add(modId)
        const cardInst = findAssignedCard(result.combat, modId)
        if (cardInst) {
          const def = ctx.cardDefs[cardInst.definitionId]
          if (def?.keywords.includes('Exhaust')) {
            result.combat.exhaustPile.push(cardInst)
            result.combat.cardsExhaustedThisTurn++
          } else {
            result.combat.discardPile.push(cardInst)
          }
        }
      }
    }
    result.combat.slotModifiers[slot] = null
    result.combat.slotModifiers2[slot] = null
  }

  // Discard remaining hand, excluding cards already handled as assigned modifiers
  for (const card of result.combat.hand) {
    if (!assignedIds.has(card.instanceId)) {
      result.combat.discardPile.push(card)
    }
  }
  result.combat.hand = []

  // LEGS Feedback: add legs block to persistentBlock
  if (result.combat._legsFeedbackBlock && result.combat._legsFeedbackBlock > 0) {
    result.combat.persistentBlock += result.combat._legsFeedbackBlock
    result.log.push(`Legs Feedback: ${result.combat._legsFeedbackBlock} block persists`)
  }
  result.combat._legsFeedbackBlock = 0

  // Player stat decay: Str/Dex lose 1 stack per turn (skipped in decrementStatuses, handled here)
  // Net effect: playing +2 Str gives +2 this turn, +1 next turn, +0 after. Not permanent.
  const strIdx = result.combat.statusEffects.findIndex(s => s.type === 'Strength')
  if (strIdx !== -1) {
    result.combat.statusEffects[strIdx].stacks = Math.max(0, result.combat.statusEffects[strIdx].stacks - 1)
    if (result.combat.statusEffects[strIdx].stacks === 0) {
      result.combat.statusEffects.splice(strIdx, 1)
    }
  }
  const dexIdx = result.combat.statusEffects.findIndex(s => s.type === 'Dexterity')
  if (dexIdx !== -1) {
    result.combat.statusEffects[dexIdx].stacks = Math.max(0, result.combat.statusEffects[dexIdx].stacks - 1)
    if (result.combat.statusEffects[dexIdx].stacks === 0) {
      result.combat.statusEffects.splice(dexIdx, 1)
    }
  }

  // Store inspired bonus for next turn draw
  // (will be used by startTurn)

  return { ...result, _inspiredBonus: inspiredBonus } as CombatResult & { _inspiredBonus: number }
}

// ─── Start Turn ──────────────────────────────────────────────────────────────

export function startTurn(ctx: CombatContext, inspiredBonus = 0): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Reset energy budget and per-turn counters
  result.combat.currentEnergy = result.combat.maxEnergy
  result.combat.cardsExhaustedThisTurn = 0
  // Reset vent flag for next turn
  result.combat.ventedThisTurn = false

  // Apply overclock disables (survived enemy turn clear)
  if (result.combat._overclockDisables && result.combat._overclockDisables.length > 0) {
    for (const s of result.combat._overclockDisables) {
      if (!result.combat.disabledSlots.includes(s)) {
        result.combat.disabledSlots.push(s)
      }
    }
    result.combat._overclockDisables = []
  }

  // Persistent block: decay by 50%, then add to block pool
  if (result.combat.persistentBlock > 0) {
    result.combat.persistentBlock = Math.floor(result.combat.persistentBlock * 0.50)
    result.combat.block = result.combat.persistentBlock
    if (result.combat.persistentBlock > 0) {
      result.log.push(`Persistent block: ${result.combat.persistentBlock} carried over`)
    }
  } else {
    // Block resets to 0
    result.combat.block = 0
  }

  // Step 3: Reshuffle discard into draw pile if needed, then draw
  // Draw is base only (drawCount) + Inspired. No HEAD equipment bonus.
  const drawCount = ctx.drawCount + inspiredBonus
  if (result.combat.drawPile.length < drawCount && result.combat.discardPile.length > 0) {
    result.combat.drawPile = shuffle([...result.combat.drawPile, ...result.combat.discardPile], ctx.rng)
    result.combat.discardPile = []
  }
  const actualDrawn = drawCards(result.combat, drawCount, ctx.rng)
  result.log.push(`Drew ${actualDrawn}/${drawCount} cards`)

  // Set phase
  result.combat.phase = 'planning'
  result.combat.roundNumber++

  // Burnout: lose 4 HP, gain 2 Strength each turn
  if (result.combat.burnoutActive) {
    result.stillHealth = Math.max(0, result.stillHealth - 4)
    result.combat.statusEffects = addStatus(result.combat.statusEffects, 'Strength', 2)
    result.log.push('Burnout: lost 4 HP, gained 2 Strength')
  }

  // Fire onTurnStart parts
  for (const part of ctx.parts) {
    if (part.trigger.type === 'onTurnStart') {
      applyPartEffect(part, result, ctx)
    }
  }

  return result
}

// ─── Slot Projection (UI preview of body actions) ────────────────────────────

export interface SlotProjection {
  slot: BodySlot
  willFire: boolean
  damage: number
  block: number
  heal: number
  draw: number
  foresight: number
  debuffStacks: number
  debuffType?: string
  reduction: number
  targetMode: 'single' | 'all'
  isOverride: boolean
  isDisabled: boolean
  bonusBlock: number // from onPlanningEnd parts (e.g. Empty Chamber)
}

export function projectSlotActions(
  combat: CombatState,
  equipment: Record<BodySlot, EquipmentDefinition | null>,
  cardDefs: Record<string, ModifierCardDefinition>,
  parts: BehavioralPartDefinition[]
): SlotProjection[] {
  const projections: SlotProjection[] = []

  // Calculate onPlanningEnd bonus block (Empty Chamber: block per unplayed card)
  let planningEndBlock = 0
  const assignedSlotIds = new Set(
    Object.values(combat.slotModifiers).filter((id): id is string => id !== null)
  )
  for (const part of parts) {
    if (part.trigger.type === 'onPlanningEnd' && part.effect.type === 'blockPerUnplayedCard') {
      const unplayed = combat.hand.filter(c => !assignedSlotIds.has(c.instanceId)).length
      planningEndBlock += unplayed * part.effect.value
    }
  }

  for (const slot of BODY_SLOTS) {
    const isDisabled = combat.disabledSlots.includes(slot)
    const equip = equipment[slot]
    const modInstanceId = combat.slotModifiers[slot]
    const hasOverride = hasOverrideModifier(modInstanceId, cardDefs, combat)

    if (isDisabled || (!equip && !hasOverride)) {
      projections.push({
        slot,
        willFire: false,
        damage: 0,
        block: 0,
        heal: 0,
        draw: 0,
        foresight: 0,
        debuffStacks: 0,
        reduction: 0,
        targetMode: 'single',
        isOverride: false,
        isDisabled,
        bonusBlock: 0,
      })
      continue
    }

    const result = resolveBodyAction(
      slot,
      equip,
      modInstanceId,
      cardDefs,
      combat,
      parts
    )

    const totalDamage = result.damage.reduce((sum, d) => sum + d.amount, 0)
    const isAoe = result.damage.length > 0 && result.damage[0].enemyId === '__all__'

    // Compute debuff info from action result
    const debuffStacks = result.debuffsApplied?.reduce((sum, d) => sum + d.stacks, 0) ?? 0
    const debuffType = result.debuffsApplied?.[0]?.debuffType

    projections.push({
      slot,
      willFire: true,
      damage: totalDamage,
      block: result.blockGained,
      heal: result.healAmount,
      draw: result.cardsDrawn,
      foresight: result.foresight,
      debuffStacks,
      debuffType,
      reduction: result.damageReduction ?? 0,
      targetMode: isAoe ? 'all' : 'single',
      isOverride: hasOverride,
      isDisabled: false,
      bonusBlock: slot === 'Head' ? planningEndBlock : 0, // show once on first slot
    })
  }

  return projections
}

// ─── Draw Cards Helper ──────────────────────────────────────────────────────

function drawCards(combat: CombatState, count: number, rng?: () => number): number {
  let drawn = 0
  for (let i = 0; i < count; i++) {
    if (combat.drawPile.length === 0) {
      if (combat.discardPile.length === 0) break
      combat.drawPile = shuffle(combat.discardPile, rng)
      combat.discardPile = []
    }
    if (combat.hand.length >= 10) break
    combat.hand.push(combat.drawPile.pop()!)
    drawn++
  }
  return drawn
}

// ─── Part Effect Helper ─────────────────────────────────────────────────────

function applyPartEffect(
  part: BehavioralPartDefinition,
  result: CombatResult,
  ctx: CombatContext
): void {
  // Emit animation event for part trigger
  result.combat.combatLog.push({ type: 'partTrigger', partId: part.id })

  switch (part.effect.type) {
    case 'bonusBlock':
      result.combat.block += part.effect.value
      result.log.push(`${part.name}: +${part.effect.value} Block`)
      break
    case 'bonusDamage':
      // Applied during resolveBodyAction, not here
      break
    case 'drawCards': {
      const actualDrawn = drawCards(result.combat, part.effect.count, ctx.rng)
      result.log.push(`${part.name}: drew ${actualDrawn}/${part.effect.count} card(s)`)
      break
    }
    case 'bonusHealing':
      // Applied during resolveBodyAction
      break
    case 'extraFiring':
      // Applied during resolveBodyAction
      break
    case 'blockPerCard':
      result.combat.block += part.effect.value
      result.log.push(`${part.name}: +${part.effect.value} Block`)
      break
    case 'damageRandomEnemy': {
      const alive = result.combat.enemies.filter(e => !e.isDefeated)
      if (alive.length > 0) {
        const target = alive[Math.floor((ctx.rng ?? Math.random)() * alive.length)]
        const absorbed = Math.min(target.block, part.effect.value)
        target.block -= absorbed
        const actual = part.effect.value - absorbed
        target.currentHealth = Math.max(0, target.currentHealth - actual)
        if (target.currentHealth === 0) target.isDefeated = true
        result.log.push(`${part.name}: dealt ${actual} damage to ${target.definitionId}`)
      }
      break
    }
    case 'amplifyModifiers':
      // Handled in resolveBodyAction
      break
    case 'blockForDisabledSlots':
      // Handled in executeBodyActions
      break
    case 'blockPerExhausted': {
      const exhaustCount = result.combat.exhaustPile.length
      if (exhaustCount > 0) {
        result.combat.block += exhaustCount
        result.log.push(`${part.name}: +${exhaustCount} Block (${exhaustCount} exhausted cards)`)
      }
      break
    }
    case 'damagePerExhausted':
      // Handled in resolveBodyAction (onSlotFire)
      break
    case 'halveLargeDamage':
      // Handled inline in executeEnemyTurn
      break
    case 'blockPerUnplayedCard': {
      const assignedIds = new Set(
        Object.values(result.combat.slotModifiers).filter((id): id is string => id !== null)
      )
      const unplayedCount = result.combat.hand.filter(c => !assignedIds.has(c.instanceId)).length
      if (unplayedCount > 0) {
        const block = unplayedCount * part.effect.value
        result.combat.block += block
        result.log.push(`${part.name}: +${block} Block (${unplayedCount} unplayed cards)`)
      }
      break
    }
  }
}

// ─── Win/Loss Checks ────────────────────────────────────────────────────────

export function allEnemiesDefeated(combat: CombatState): boolean {
  return combat.enemies.every((e) => e.isDefeated)
}

export function isStillDefeated(health: number): boolean {
  return health <= 0
}
