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
  return {
    instanceId: `${def.id}-${rng().toString(36).slice(2)}`,
    definitionId: def.id,
    currentHealth: scaledHealth,
    maxHealth: scaledHealth,
    block: 0,
    intentIndex: 0,
    statusEffects: [],
    isDefeated: false,
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

const PERMANENT_STATUSES = new Set<StatusEffectType>(['Strength', 'Dexterity'])

export function decrementStatuses(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((s) => ({ ...s, stacks: PERMANENT_STATUSES.has(s.type) ? s.stacks : s.stacks - 1 }))
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

// ─── Combat Initialisation (Task 2.11) ───────────────────────────────────────

export function initCombat(
  deck: CardInstance[],
  drawCount: number,
  enemies: EnemyInstance[],
  startingStatuses: StatusEffect[] = [],
  parts: BehavioralPartDefinition[] = [],
  rng: () => number = Math.random
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

  // Resolve both modifier definitions
  function resolveModDef(instanceId: string | null): ModifierCardDefinition | null {
    if (!instanceId) return null
    const cardInst = [...combat.hand].find(c => c.instanceId === instanceId)
      ?? findAssignedCard(combat, instanceId)
    if (!cardInst) return null
    const def = cardDefs[cardInst.definitionId]
    if (def?.category.type === 'slot') return def
    return null
  }

  const modifierDef = resolveModDef(modifierInstanceId)
  const modifierDef2 = resolveModDef(modifierInstanceId2)

  // Determine the action: override takes priority (first override found wins)
  let action: BodyAction | null = null
  let isOverride = false

  const overrideMod = [modifierDef, modifierDef2].find(
    m => m?.category.type === 'slot' && m.category.effect.type === 'override'
  )
  if (overrideMod?.category.type === 'slot' && overrideMod.category.effect.type === 'override') {
    action = overrideMod.category.effect.action
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

  // bonusForesight: reveal extra enemy intents alongside primary action
  if (equipment?.bonusForesight) {
    result.foresight += equipment.bonusForesight
  }

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

  // Reset feedback and retaliate state for this execution
  result.combat.feedbackArmsBonus = 0
  result.combat._legsFeedbackBlock = 0
  result.combat.retaliateActive = false

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
    // HEAD base draw happens at turn start, but extra draw from Repeat fires during execution
    if (actionResult.cardsDrawn > 0) {
      if (slot === 'Head') {
        const baseDraw = equip?.action.baseValue ?? 0
        const extraDraw = actionResult.cardsDrawn - baseDraw
        if (extraDraw > 0) {
          drawCards(result.combat, extraDraw, ctx.rng)
        }
      } else {
        drawCards(result.combat, actionResult.cardsDrawn, ctx.rng)
      }
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
  return def?.category.type === 'slot' && def.category.effect.type === 'override'
}

// ─── Play Modifier Card ─────────────────────────────────────────────────────

export function playModifierCard(
  ctx: CombatContext,
  card: ModifierCardDefinition,
  instanceId: string,
  targetSlot?: BodySlot
): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Check energy sufficiency
  if (card.energyCost > result.combat.currentEnergy) {
    result.log.push(`Cannot play ${card.name}: costs ${card.energyCost} energy, have ${result.combat.currentEnergy}`)
    return result
  }

  // Deduct energy
  result.combat.currentEnergy -= card.energyCost

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
      }
    }

    // Move to exhaust or discard
    if (cardInst) {
      const shouldExhaust = card.category.type === 'system' || card.keywords.includes('Exhaust')
      if (shouldExhaust) {
        result.combat.exhaustPile.push(cardInst)
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

  if (secondaryId) {
    result.combat.currentEnergy = Math.min(result.combat.maxEnergy, result.combat.currentEnergy + card.energyCost)
    result.combat.slotModifiers2[slot] = null
    result.log.push(`Unassigned ${card.name} from ${slot} (secondary)`)
  } else if (primaryId) {
    result.combat.currentEnergy = Math.min(result.combat.maxEnergy, result.combat.currentEnergy + card.energyCost)
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
    let eventBlock: number | undefined
    let eventStatus: StatusEffectType | undefined

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
          const absorbed = Math.min(result.combat.block, dealt)
          result.combat.block -= absorbed
          const actual = dealt - absorbed
          result.stillHealth = Math.max(0, result.stillHealth - actual)
          totalDamage += actual
          totalBlocked += absorbed
        }
        eventDamage = totalDamage
        eventBlocked = totalBlocked
        const hitsLabel = hitCount > 1 ? ` (${hitCount} hits)` : ''
        result.log.push(`${def.name} attacks for ${totalDamage} (${totalBlocked} blocked)${hitsLabel}`)

        // Retaliate: reflect ALL incoming damage back to attacker
        const totalIncoming = totalDamage + totalBlocked
        if (result.combat.retaliateActive && totalIncoming > 0) {
          const retAbsorbed = Math.min(enemy.block, totalIncoming)
          enemy.block -= retAbsorbed
          const retActual = totalIncoming - retAbsorbed
          enemy.currentHealth = Math.max(0, enemy.currentHealth - retActual)
          if (enemy.currentHealth === 0) enemy.isDefeated = true
          result.log.push(`Retaliate: dealt ${retActual} damage back to ${def.name}`)
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
            result.log.push(`${part.name}: dealt ${thornsActual} thorns to ${def.name}`)
          }

          if (part.effect.type === 'voltageCounter' && totalBlocked > 0) {
            // Voltage Core: deal block consumed as damage to attacker
            const vcAbsorbed = Math.min(enemy.block, totalBlocked)
            enemy.block -= vcAbsorbed
            const vcActual = totalBlocked - vcAbsorbed
            enemy.currentHealth = Math.max(0, enemy.currentHealth - vcActual)
            if (enemy.currentHealth === 0) enemy.isDefeated = true
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
      block: eventBlock,
      statusApplied: eventStatus,
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

  // Stat decay: Strength and Dexterity decay by 1 at end of turn (player only)
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

  // Reset energy budget
  result.combat.currentEnergy = result.combat.maxEnergy

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

  // HEAD draw bonus
  let headDrawBonus = 0
  const headEquip = ctx.equipment.Head
  if (headEquip && headEquip.action.type === 'draw' && !result.combat.disabledSlots.includes('Head')) {
    headDrawBonus = headEquip.action.baseValue
  }

  // Step 3: Reshuffle discard into draw pile if needed, then draw
  const drawCount = ctx.drawCount + inspiredBonus + headDrawBonus
  if (result.combat.drawPile.length < drawCount && result.combat.discardPile.length > 0) {
    result.combat.drawPile = shuffle([...result.combat.drawPile, ...result.combat.discardPile], ctx.rng)
    result.combat.discardPile = []
  }
  const actualDrawn = drawCards(result.combat, drawCount, ctx.rng)
  result.log.push(`Drew ${actualDrawn}/${drawCount} cards`)

  // Set phase
  result.combat.phase = 'planning'
  result.combat.roundNumber++

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

    projections.push({
      slot,
      willFire: true,
      damage: totalDamage,
      block: result.blockGained,
      heal: result.healAmount,
      draw: result.cardsDrawn,
      foresight: result.foresight,
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
