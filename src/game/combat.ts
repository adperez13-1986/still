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
  HeatThreshold,
  CombatEvent,
} from '../game/types'

import {
  BODY_SLOTS,
  HOT_DAMAGE,
  OVERHEAT_THRESHOLD,
  OVERHEAT_DAMAGE_PER_POINT,
  getHeatThreshold,
  isHot,
} from '../game/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function makeEnemyInstance(def: EnemyDefinition, combatsCleared = 0): EnemyInstance {
  // HP scaling: bosses stay at base HP, regular enemies scale +10% per combat cleared
  const hpMultiplier = def.isBoss ? 1.0 : 1 + combatsCleared * 0.10
  const scaledHealth = Math.floor(def.maxHealth * hpMultiplier)
  return {
    instanceId: `${def.id}-${Math.random().toString(36).slice(2)}`,
    definitionId: def.id,
    currentHealth: scaledHealth,
    maxHealth: scaledHealth,
    block: 0,
    intentIndex: 0,
    statusEffects: [],
    isDefeated: false,
  }
}

export function makeCardInstance(defId: string): CardInstance {
  return {
    instanceId: `${defId}-${Math.random().toString(36).slice(2)}`,
    definitionId: defId,
    isUpgraded: false,
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
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
    case 'override':
      if (effect.action.type === 'damage') return ['Arms']
      if (effect.action.type === 'block')  return ['Torso']
      return null
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
}

export interface ActionResult {
  damage: Array<{ enemyId: string; amount: number }>
  blockGained: number
  healAmount: number
  cardsDrawn: number
  heatReduced: number
  heatGenerated: number
  foresight: number
}

export interface CombatResult {
  combat: CombatState
  stillHealth: number
  log: string[]
  _maxHpReduction?: number // Overheat Reactor: accumulated max HP reduction this turn
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
  parts: BehavioralPartDefinition[] = []
): CombatState {
  const drawPile = shuffle(deck)
  const hand: CardInstance[] = []

  const initialDraw = Math.min(drawCount, drawPile.length, 10)
  for (let i = 0; i < initialDraw; i++) {
    hand.push(drawPile.pop()!)
  }

  const hasThermalDamper = parts.some(p => p.id === 'thermal-damper')

  return {
    phase: 'planning',
    enemies,
    hand,
    drawPile,
    discardPile: [],
    exhaustPile: [],
    heat: 0,
    block: 0,
    statusEffects: [...startingStatuses],
    roundNumber: 1,
    slotModifiers: { Head: null, Torso: null, Arms: null, Legs: null },
    slotModifiers2: { Head: null, Torso: null, Arms: null, Legs: null },
    disabledSlots: [],
    heatChangeThisTurn: 0,
    thresholdCrossedThisTurn: false,
    combatLog: [],
    heatCostReduction: 0,
    ablativeShellUsed: false,
    heatLocked: hasThermalDamper,
    heatDebt: 0,
    heatLockTurnsLeft: hasThermalDamper ? 2 : 0,
    overheatReactorFired: false,
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
  heat: number,
  parts: BehavioralPartDefinition[],
  modifierInstanceId2: string | null = null
): ActionResult {
  const result: ActionResult = {
    damage: [],
    blockGained: 0,
    healAmount: 0,
    cardsDrawn: 0,
    heatReduced: 0,
    heatGenerated: 0, // slots no longer generate heat — all heat management lives in planning phase
    foresight: 0,
  }

  // heatConditionOnly: produce nothing if not in required zone
  if (equipment?.heatConditionOnly) {
    if (getHeatThreshold(heat) !== equipment.heatConditionOnly) {
      result.heatGenerated = 0
      return result
    }
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
    // No equipment and no override — nothing fires
    result.heatGenerated = 0
    return result
  }

  // No universal threshold bonus — archetype power comes from equipment/parts
  const { value, targetMode } = applyStatusToAction(action, slot, combat.statusEffects, isOverride)
  let finalValue = value

  // Apply equipment-specific heat bonus (Task 5.5)
  if (equipment?.heatBonusThreshold && equipment?.heatBonusValue) {
    if (getHeatThreshold(heat) === equipment.heatBonusThreshold) {
      finalValue += equipment.heatBonusValue
    }
  }

  // extraHeatGenerated now applies at modifier-assignment time, not during execution

  // multiFire: extra firings when in threshold zone
  let multiFirings = 0
  if (equipment?.multiFire && getHeatThreshold(heat) === equipment.multiFire.threshold) {
    multiFirings = equipment.multiFire.extraFirings
  }

  // Apply bonus heal from equipment (e.g., Patched Hull)
  // Cryo Shell: bonusHeal only applies when at heatBonusThreshold
  if (equipment?.bonusHeal) {
    if (equipment.heatBonusThreshold) {
      // Conditional heal: only when at the threshold
      if (getHeatThreshold(heat) === equipment.heatBonusThreshold) {
        result.healAmount += equipment.bonusHeal
      }
    } else {
      result.healAmount += equipment.bonusHeal
    }
  }

  // bonusForesight: reveal extra enemy intents alongside primary action
  if (equipment?.bonusForesight) {
    result.foresight += equipment.bonusForesight
  }

  // heatBonusBlock: conditional block when at threshold (e.g., Cryo Lock)
  if (equipment?.heatBonusBlock && equipment.heatBonusThreshold) {
    if (getHeatThreshold(heat) === equipment.heatBonusThreshold) {
      result.blockGained += equipment.heatBonusBlock
    }
  }

  // Apply modifier effects (non-override) from both modifiers
  let repeatCount = 1
  let finalTargetMode = targetMode
  const valueBeforeModifier = finalValue
  let hasNonOverrideMod = false

  for (const mDef of [modifierDef, modifierDef2]) {
    if (!mDef || mDef.category.type !== 'slot') continue
    if (mDef === overrideMod) continue // skip the override — it already set the action
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
        // Extra firings generate +1 Heat each
        result.heatGenerated += effect.extraFirings
        break
    }
  }

  // Meltdown Core: while Hot, slot modifiers get +50% bonus to effect values
  if (hasNonOverrideMod) {
    for (const part of parts) {
      if (part.effect.type === 'amplifyModifiers') {
        if (!part.heatCondition || getHeatThreshold(heat) === part.heatCondition) {
          const modifierDelta = finalValue - valueBeforeModifier
          if (modifierDelta > 0) {
            const bonus = Math.floor(modifierDelta * (part.effect.multiplier - 1))
            finalValue += bonus
          }
        }
      }
    }
  }

  // Apply part bonuses for onSlotFire
  for (const part of parts) {
    if (part.trigger.type === 'onSlotFire' && part.trigger.slot === slot) {
      // Check heat condition (e.g., Overheater: only while Hot)
      if (part.heatCondition && getHeatThreshold(heat) !== part.heatCondition) continue
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
        case 'reduceHeat':
          result.heatReduced += part.effect.value
          break
        case 'drawCards':
          result.cardsDrawn += part.effect.count
          break
      }
    }
  }

  // Apply part bonuses for onHeatThreshold
  const currentThreshold = getHeatThreshold(heat)
  for (const part of parts) {
    if (part.trigger.type === 'onHeatThreshold') {
      const thresholdMet = isThresholdMet(currentThreshold, part.trigger.threshold)
      if (thresholdMet) {
        switch (part.effect.type) {
          case 'extraFiring':
            if (part.effect.slot === slot) {
              repeatCount += 1
            }
            break
          case 'bonusDamage':
            if (action.type === 'damage') finalValue += part.effect.value
            break
          case 'bonusBlock':
            if (action.type === 'block') result.blockGained += part.effect.value
            break
        }
      }
    }
  }

  // multiFire: add extra firings (each generates +1 heat)
  if (multiFirings > 0) {
    repeatCount += multiFirings
    result.heatGenerated += multiFirings
  }

  // Overheat Reactor: double damage output when fired this turn
  if (combat.overheatReactorFired && action.type === 'damage') {
    finalValue *= 2
  }

  // Execute the action repeatCount times
  for (let i = 0; i < repeatCount; i++) {
    switch (action.type) {
      case 'damage':
        // Damage result will be applied by the caller against enemies
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
      case 'coolHeat':
        result.heatReduced += finalValue
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

  // bonusBlockPerHeatLost: estimate block from cooling
  if (equipment?.bonusBlockPerHeatLost && result.heatReduced > 0) {
    // Actual heat reduced is clamped by available heat after generation
    const estimatedActualReduced = Math.min(result.heatReduced, Math.max(0, heat + result.heatGenerated))
    if (estimatedActualReduced > 0) {
      result.blockGained += estimatedActualReduced * equipment.bonusBlockPerHeatLost
    }
  }

  return result
}

function findAssignedCard(combat: CombatState, instanceId: string): CardInstance | undefined {
  // Check draw/discard/exhaust piles and hand for the instance
  const allCards = [
    ...combat.hand,
    ...combat.drawPile,
    ...combat.discardPile,
    ...combat.exhaustPile,
  ]
  return allCards.find(c => c.instanceId === instanceId)
}

function isThresholdMet(current: HeatThreshold, required: HeatThreshold): boolean {
  const order: HeatThreshold[] = ['Cool', 'Warm', 'Hot', 'Overheat']
  return order.indexOf(current) >= order.indexOf(required)
}

// ─── Heat Tracking (Tasks 5.1-5.3) ─────────────────────────────────────────

interface HeatChangeResult {
  crossed: boolean
  overheatDamage: number
}

function applyHeatChange(combat: CombatState, delta: number): HeatChangeResult {
  const oldHeat = combat.heat

  // Thermal Damper: positive heat goes to debt while locked (cooling still applies normally)
  if (combat.heatLocked && delta > 0) {
    combat.heatDebt += delta
    return { crossed: false, overheatDamage: 0 }
  }

  const oldThreshold = getHeatThreshold(oldHeat)
  combat.heat = Math.max(0, oldHeat + delta) // no upper cap
  const newThreshold = getHeatThreshold(combat.heat)
  combat.heatChangeThisTurn += Math.abs(combat.heat - oldHeat)
  const crossed = oldThreshold !== newThreshold
  if (crossed) {
    combat.thresholdCrossedThisTurn = true
  }

  // Overheat damage: on any heat INCREASE while over 9, deal 2 per point over 9
  let overheatDamage = 0
  if (delta > 0 && combat.heat > 9) {
    overheatDamage = (combat.heat - 9) * OVERHEAT_DAMAGE_PER_POINT
  }

  return { crossed, overheatDamage }
}

function fireThresholdCrossTriggers(
  parts: BehavioralPartDefinition[],
  result: CombatResult,
  ctx: CombatContext
): void {
  for (const part of parts) {
    if (part.trigger.type === 'onThresholdCross') {
      applyPartEffect(part, result, ctx)
      // Thermal Oscillator: also deal 3 damage to all enemies
      if (part.id === 'thermal-oscillator') {
        for (const enemy of result.combat.enemies) {
          if (!enemy.isDefeated) {
            const absorbed = Math.min(enemy.block, 3)
            enemy.block -= absorbed
            const actual = 3 - absorbed
            enemy.currentHealth = Math.max(0, enemy.currentHealth - actual)
            if (enemy.currentHealth === 0) enemy.isDefeated = true
            result.log.push(`${part.name}: dealt ${actual} damage to ${enemy.definitionId}`)
          }
        }
      }
    }
  }
}

// ─── Execute Body Actions (Task 2.5) ─────────────────────────────────────────

export function executeBodyActions(ctx: CombatContext): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Fire onPlanningEnd part triggers (Empty Chamber: block per unplayed card)
  for (const part of ctx.parts) {
    if (part.trigger.type === 'onPlanningEnd') {
      applyPartEffect(part, result, ctx)
    }
  }

  const slotsFired: BodySlot[] = []

  for (const slot of BODY_SLOTS) {
    // System card slots: card effect already fired during planning,
    // but equipment still fires during execution (stacks with system card)
    if (result.combat.slotModifiers[slot] === '__system__') {
      result.combat.slotModifiers[slot] = null // clear sentinel so equipment fires unmodified
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

    // Skip if no equipment and no override modifier
    if (!equip && !hasOverrideModifier(modInstanceId, ctx.cardDefs, result.combat)) {
      continue
    }

    const actionResult = resolveBodyAction(
      slot,
      equip,
      modInstanceId,
      ctx.cardDefs,
      result.combat,
      result.combat.heat,
      ctx.parts,
      modInstanceId2
    )

    // heatConditionOnly: slot produces nothing if outside zone
    if (equip?.heatConditionOnly && getHeatThreshold(result.combat.heat) !== equip.heatConditionOnly) {
      result.log.push(`${slot}: ${equip.name} inactive — not in ${equip.heatConditionOnly} zone`)
      continue
    }

    // Apply Heat generation (with threshold tracking + overheat damage)
    const genResult = applyHeatChange(result.combat, actionResult.heatGenerated)
    if (genResult.crossed) fireThresholdCrossTriggers(ctx.parts, result, ctx)
    if (genResult.overheatDamage > 0) {
      result.stillHealth -= genResult.overheatDamage
      result.combat.combatLog.push({ type: 'overheatDamage', damage: genResult.overheatDamage })
      result.log.push(`Overheat: took ${genResult.overheatDamage} damage (heat ${result.combat.heat})`)
    }

    // Apply Heat reduction from coolHeat actions
    const reduceResult = applyHeatChange(result.combat, -actionResult.heatReduced)
    if (reduceResult.crossed) fireThresholdCrossTriggers(ctx.parts, result, ctx)

    // Apply block (includes bonusBlockPerHeatLost computed in resolveBodyAction)
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
        // Apply Vulnerable on defender
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

    // Apply card draw from body actions (skip HEAD — HEAD draw happens at turn start)
    if (actionResult.cardsDrawn > 0 && slot !== 'Head') {
      drawCards(result.combat, actionResult.cardsDrawn)
    }

    // Apply blockCost: reduce Block after action resolves (e.g., Shrapnel Launcher)
    if (equip?.blockCost) {
      const cost = Math.min(result.combat.block, equip.blockCost)
      result.combat.block -= cost
      if (cost > 0) result.log.push(`${slot}: lost ${cost} Block (block cost)`)
    }

    // Apply foresight (reveals handled by UI via projection)
    // foresight value is already tracked in actionResult.foresight

    // Emit combat event for animation
    const targetMode = equip?.action.targetMode ?? 'single_enemy' as const
    const slotEvent: CombatEvent = {
      type: 'slotFire',
      slot,
      damages: perEnemyDamage.length > 0 ? perEnemyDamage : undefined,
      block: actionResult.blockGained > 0 ? actionResult.blockGained : undefined,
      heal: actionResult.healAmount > 0 ? actionResult.healAmount : undefined,
      targetMode,
    }
    result.combat.combatLog.push(slotEvent)

    // Fire onWouldOverheat part triggers (Pressure Valve, Overheat Reactor) if heat >= 10
    if (result.combat.heat >= OVERHEAT_THRESHOLD) {
      const pressureValve = ctx.parts.find(p => p.trigger.type === 'onWouldOverheat' && p.effect.type === 'preventOverheat')
      const reactor = ctx.parts.find(p => p.effect.type === 'overheatReactor')
      if (pressureValve && pressureValve.effect.type === 'preventOverheat') {
        result.combat.combatLog.push({ type: 'partTrigger', partId: pressureValve.id })
        result.combat.heat = pressureValve.effect.setHeat
        for (const enemy of result.combat.enemies) {
          if (!enemy.isDefeated) {
            const pvAbsorbed = Math.min(enemy.block, pressureValve.effect.damage)
            enemy.block -= pvAbsorbed
            const pvActual = pressureValve.effect.damage - pvAbsorbed
            enemy.currentHealth = Math.max(0, enemy.currentHealth - pvActual)
            if (enemy.currentHealth === 0) enemy.isDefeated = true
          }
        }
        result.log.push(`${pressureValve.name}: heat reduced! Heat → ${pressureValve.effect.setHeat}, dealt ${pressureValve.effect.damage} AOE damage`)
      } else if (reactor && reactor.effect.type === 'overheatReactor') {
        result.combat.combatLog.push({ type: 'partTrigger', partId: reactor.id })
        result.combat.heat = reactor.effect.heatReset
        result.combat.overheatReactorFired = true
        result.stillHealth = Math.max(1, result.stillHealth - reactor.effect.maxHpCost)
        result._maxHpReduction = (result._maxHpReduction ?? 0) + reactor.effect.maxHpCost
        result.log.push(`${reactor.name}: Overheat harnessed! Heat → ${reactor.effect.heatReset}, 2x damage, max HP -${reactor.effect.maxHpCost}`)
      }
    }

    slotsFired.push(slot)
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

// ─── Play Modifier Card (Task 2.7) ──────────────────────────────────────────

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

  // Check Heat condition if present
  if (card.heatCondition) {
    const currentThreshold = getHeatThreshold(result.combat.heat)
    if (!isThresholdMet(currentThreshold, card.heatCondition)) {
      result.log.push(`Cannot play ${card.name}: requires ${card.heatCondition}`)
      return result
    }
  }

  // Apply Heat cost (with Zero Point Field reduction for positive costs only)
  const effectiveHeatCost = card.heatCost < 0
    ? card.heatCost
    : Math.max(0, card.heatCost - result.combat.heatCostReduction)
  const heatResult = applyHeatChange(result.combat, effectiveHeatCost)
  if (heatResult.crossed) fireThresholdCrossTriggers(ctx.parts, result, ctx)
  if (heatResult.overheatDamage > 0) {
    result.stillHealth -= heatResult.overheatDamage
    result.combat.combatLog.push({ type: 'overheatDamage', damage: heatResult.overheatDamage })
    result.log.push(`Overheat: took ${heatResult.overheatDamage} damage (heat ${result.combat.heat})`)
  }

  if (card.category.type === 'slot') {
    // Slot modifier — assign to target slot
    if (!targetSlot) {
      result.log.push(`${card.name} requires a target slot`)
      return result
    }

    // Check slot not disabled
    if (result.combat.disabledSlots.includes(targetSlot)) {
      result.log.push(`Cannot target disabled slot: ${targetSlot}`)
      return result
    }

    // Check slot restriction
    const allowed = getAllowedSlots(card)
    if (allowed && !allowed.includes(targetSlot)) {
      result.log.push(`${card.name} cannot be assigned to ${targetSlot}`)
      return result
    }

    // Check slot not already modified (Dual Loader allows a second)
    if (result.combat.slotModifiers[targetSlot] !== null) {
      const hasDualLoader = ctx.parts.some(p => p.effect.type === 'dualLoader')
      if (!hasDualLoader || result.combat.slotModifiers2[targetSlot] !== null) {
        result.log.push(`${targetSlot} already has a modifier assigned`)
        return result
      }
    }

    // Non-override modifiers need a filled equipment slot
    if (card.category.effect.type !== 'override' && !ctx.equipment[targetSlot]) {
      result.log.push(`Cannot assign ${card.category.modifier} to empty ${targetSlot} slot`)
      return result
    }

    // Assign modifier to slot — card stays in hand array so findAssignedCard
    // can locate it later (endTurn, unassign, resolveBodyAction). The UI
    // filters assigned cards out of the visible hand.
    if (result.combat.slotModifiers[targetSlot] !== null) {
      // Primary filled — assign to secondary (Dual Loader)
      result.combat.slotModifiers2[targetSlot] = instanceId
    } else {
      result.combat.slotModifiers[targetSlot] = instanceId
    }

    // Apply extra heat from equipment (e.g., Overclocked Pistons: +1 heat on assignment)
    const slotEquip = ctx.equipment[targetSlot]
    if (slotEquip?.extraHeatGenerated) {
      const extraResult = applyHeatChange(result.combat, slotEquip.extraHeatGenerated)
      if (extraResult.crossed) fireThresholdCrossTriggers(ctx.parts, result, ctx)
      if (extraResult.overheatDamage > 0) {
        result.stillHealth -= extraResult.overheatDamage
        result.combat.combatLog.push({ type: 'overheatDamage', damage: extraResult.overheatDamage })
        result.log.push(`Overheat: took ${extraResult.overheatDamage} damage (heat ${result.combat.heat})`)
      }
      result.log.push(`${slotEquip.name}: +${slotEquip.extraHeatGenerated} Heat on assignment`)
    }

    result.log.push(`Assigned ${card.name} to ${targetSlot}`)
  } else {
    // System card — assigned to home slot, fires instantly during planning
    if (!targetSlot) {
      result.log.push(`${card.name} requires its home slot (${card.category.homeSlot})`)
      return result
    }

    // Validate home slot
    if (targetSlot !== card.category.homeSlot) {
      result.log.push(`${card.name} can only be assigned to ${card.category.homeSlot}`)
      return result
    }

    // Check slot not disabled
    if (result.combat.disabledSlots.includes(targetSlot)) {
      result.log.push(`Cannot target disabled slot: ${targetSlot}`)
      return result
    }

    // Check slot not already occupied (by modifier or another system card)
    if (result.combat.slotModifiers[targetSlot] !== null) {
      result.log.push(`${targetSlot} already has a card assigned`)
      return result
    }

    // Mark slot as occupied by system card
    result.combat.slotModifiers[targetSlot] = '__system__'

    // Remove from hand and apply effects immediately
    const handIdx = result.combat.hand.findIndex(c => c.instanceId === instanceId)
    let cardInst: CardInstance | undefined
    if (handIdx !== -1) {
      cardInst = result.combat.hand.splice(handIdx, 1)[0]
    }

    // Use heatBonus effects if threshold met (Task 5.4)
    const effectsToApply = (card.heatBonus && getHeatThreshold(result.combat.heat) === card.heatBonus.threshold)
      ? card.heatBonus.effects
      : card.category.effects

    for (const effect of effectsToApply) {
      switch (effect.type) {
        case 'draw': {
          const actualDrawn = drawCards(result.combat, effect.count)
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

    // Thermal Flux: deal damage = heatChangeThisTurn (Task 5.4)
    if (card.id === 'thermal-flux') {
      const fluxDmg = result.combat.heatChangeThisTurn
      if (fluxDmg > 0) {
        const targets = resolveSingleTarget(result.combat.enemies, ctx.targetEnemyId)
        for (const enemy of targets) {
          let dealt = fluxDmg
          if (getStatus(enemy.statusEffects, 'Vulnerable') > 0) {
            dealt = Math.floor(dealt * 1.5)
          }
          const absorbed = Math.min(enemy.block, dealt)
          enemy.block -= absorbed
          const actual = dealt - absorbed
          enemy.currentHealth = Math.max(0, enemy.currentHealth - actual)
          if (enemy.currentHealth === 0) enemy.isDefeated = true
          result.log.push(`Thermal Flux dealt ${actual} damage to ${enemy.definitionId}`)
        }
        // Upgraded: also gain Block = half of damage
        if (cardInst?.isUpgraded) {
          const bonusBlock = Math.floor(fluxDmg / 2)
          result.combat.block += bonusBlock
          result.log.push(`Thermal Flux: gained ${bonusBlock} Block`)
        }
      }
    }

    // Overclock: +1 extra Strength if threshold was crossed this turn (Task 5.4)
    if (card.id === 'overclock' && result.combat.thresholdCrossedThisTurn) {
      result.combat.statusEffects = addStatus(result.combat.statusEffects, 'Strength', 1)
      result.log.push('Overclock: threshold crossed — +1 extra Strength')
    }

    // Move to exhaust or discard
    // All system cards exhaust automatically; slot modifiers use keyword-based exhaust
    if (cardInst) {
      const shouldExhaust = card.category.type === 'system' || card.keywords.includes('Exhaust')
      if (shouldExhaust) {
        result.combat.exhaustPile.push(cardInst)
        // Fire onCardExhaust part triggers (Scrap Recycler)
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

  // Fire onModifierPlay part triggers (only slot modifiers match)
  if (card.category.type === 'slot') {
    for (const part of ctx.parts) {
      if (part.trigger.type === 'onModifierPlay' && card.category.modifier === part.trigger.modifier) {
        applyPartEffect(part, result, ctx)
      }
    }
  }

  // Fire onCardPlay part triggers (Cryo Engine, Gyro Stabilizer, Residual Charge)
  for (const part of ctx.parts) {
    if (part.trigger.type === 'onCardPlay') {
      // Residual Charge only fires for system cards
      if (part.id === 'residual-charge' && card.category.type !== 'system') continue
      applyPartEffect(part, result, ctx)
    }
  }

  // Fire onWouldOverheat part triggers if heat >= 10
  if (result.combat.heat >= OVERHEAT_THRESHOLD) {
    const pressureValve = ctx.parts.find(p => p.trigger.type === 'onWouldOverheat' && p.effect.type === 'preventOverheat')
    const reactor = ctx.parts.find(p => p.effect.type === 'overheatReactor')
    if (pressureValve && pressureValve.effect.type === 'preventOverheat') {
      result.combat.combatLog.push({ type: 'partTrigger', partId: pressureValve.id })
      result.combat.heat = pressureValve.effect.setHeat
      for (const enemy of result.combat.enemies) {
        if (!enemy.isDefeated) {
          const pvAbsorbed = Math.min(enemy.block, pressureValve.effect.damage)
          enemy.block -= pvAbsorbed
          const pvActual = pressureValve.effect.damage - pvAbsorbed
          enemy.currentHealth = Math.max(0, enemy.currentHealth - pvActual)
          if (enemy.currentHealth === 0) enemy.isDefeated = true
        }
      }
      result.log.push(`${pressureValve.name}: heat reduced! Heat → ${pressureValve.effect.setHeat}, dealt ${pressureValve.effect.damage} AOE damage`)
    } else if (reactor && reactor.effect.type === 'overheatReactor') {
      result.combat.combatLog.push({ type: 'partTrigger', partId: reactor.id })
      result.combat.heat = reactor.effect.heatReset
      result.combat.overheatReactorFired = true
      result.stillHealth = Math.max(1, result.stillHealth - reactor.effect.maxHpCost)
      result._maxHpReduction = (result._maxHpReduction ?? 0) + reactor.effect.maxHpCost
      result.log.push(`${reactor.name}: Overheat harnessed! Heat → ${reactor.effect.heatReset}, 2x damage, max HP -${reactor.effect.maxHpCost}`)
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

  // Check secondary slot first (Dual Loader), then primary
  const secondaryId = result.combat.slotModifiers2[slot]
  const primaryId = result.combat.slotModifiers[slot]

  // Refund extra-heat equipment cost on unassignment (no threshold triggers — prevents oscillator exploit)
  const slotEquip = ctx.equipment[slot]
  const extraHeatRefund = slotEquip?.extraHeatGenerated ?? 0

  if (secondaryId) {
    // Unassign from secondary slot (most recent assignment)
    result.combat.heat = Math.max(0, result.combat.heat - card.heatCost - extraHeatRefund)
    result.combat.slotModifiers2[slot] = null
    result.log.push(`Unassigned ${card.name} from ${slot} (secondary)`)
  } else if (primaryId) {
    // Unassign from primary slot
    result.combat.heat = Math.max(0, result.combat.heat - card.heatCost - extraHeatRefund)
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
    let intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]

    // Resolve HeatReactive: pick sub-intent based on Still's current heat zone
    if (intent.type === 'HeatReactive') {
      const zone = getHeatThreshold(result.combat.heat)
      const resolved = zone === 'Cool' ? intent.coolIntent
        : (zone === 'Warm' ? intent.warmIntent : intent.hotIntent)
      if (resolved) intent = resolved
      else { enemy.intentIndex++; continue }
    }

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
          let actual = dealt - absorbed
          // Ablative heat: while Hot (7+), damage reduces Heat at 1:2 ratio, drain to Warm floor (4)
          if (actual > 0 && result.combat.heat >= 7) {
            const maxDrain = result.combat.heat - 4
            const heatAbsorbed = Math.min(maxDrain, Math.floor(actual / 2))
            const damageAbsorbed = heatAbsorbed * 2
            result.combat.heat -= heatAbsorbed
            actual -= damageAbsorbed
            if (heatAbsorbed > 0) {
              result.log.push(`Ablative heat absorbed ${damageAbsorbed} damage (heat ${result.combat.heat + heatAbsorbed} → ${result.combat.heat})`)
            }
          }
          result.stillHealth = Math.max(0, result.stillHealth - actual)
          totalDamage += actual
          totalBlocked += absorbed
        }
        eventDamage = totalDamage
        eventBlocked = totalBlocked
        const hitsLabel = hitCount > 1 ? ` (${hitCount} hits)` : ''
        result.log.push(`${def.name} attacks for ${totalDamage} (${totalBlocked} blocked)${hitsLabel}`)

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
      case 'Absorb': {
        const blockGain = Math.floor(result.combat.heat * (intent.value / 100))
        enemy.block += blockGain
        eventBlock = blockGain
        result.log.push(`${def.name} absorbs ${blockGain} Block from Still's Heat`)
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

// ─── End of Turn (Task 2.10, 2.12) ──────────────────────────────────────────

export function endTurn(ctx: CombatContext): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Step 8a: Hot penalty (3 damage if Heat 8-9)
  if (isHot(result.combat.heat)) {
    result.stillHealth = Math.max(0, result.stillHealth - HOT_DAMAGE)
    result.combat.combatLog.push({ type: 'hotPenalty', damage: HOT_DAMAGE })
    result.log.push(`Hot penalty: took ${HOT_DAMAGE} damage`)
  }

  // Clear Overheat Reactor flag at end of turn
  result.combat.overheatReactorFired = false

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

  // No shutdown mechanic — overheat damage is applied during execution/planning via applyHeatChange

  // Store inspired bonus for next turn draw
  // (will be used by startTurn)

  return { ...result, _inspiredBonus: inspiredBonus } as CombatResult & { _inspiredBonus: number }
}

// ─── Start Turn (canonical steps 1-3) ───────────────────────────────────────

export function startTurn(ctx: CombatContext, inspiredBonus = 0): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Thermal Damper: decrement lock, apply debt when expired
  if (result.combat.heatLockTurnsLeft > 0) {
    result.combat.heatLockTurnsLeft--
    if (result.combat.heatLockTurnsLeft === 0) {
      result.combat.heatLocked = false
      if (result.combat.heatDebt > 0) {
        result.log.push(`Thermal Damper expired: +${result.combat.heatDebt} deferred heat`)
        const debtResult = applyHeatChange(result.combat, result.combat.heatDebt)
        if (debtResult.overheatDamage > 0) {
          result.stillHealth -= debtResult.overheatDamage
          result.combat.combatLog.push({ type: 'overheatDamage', damage: debtResult.overheatDamage })
          result.log.push(`Overheat from deferred heat: took ${debtResult.overheatDamage} damage`)
        }
        result.combat.heatDebt = 0
      }
    }
  }

  // Reset per-turn heat tracking (Tasks 5.2-5.3)
  result.combat.heatChangeThisTurn = 0
  result.combat.thresholdCrossedThisTurn = false
  result.combat.heatCostReduction = 0

  // Step 2: Block resets to 0
  result.combat.block = 0

  // HEAD draw bonus: HEAD equipment's draw value is added to turn draw count
  // (HEAD fires at turn start, not during execution, so cards are available for planning)
  let headDrawBonus = 0
  const headEquip = ctx.equipment.Head
  if (headEquip && headEquip.action.type === 'draw' && !result.combat.disabledSlots.includes('Head')) {
    headDrawBonus = headEquip.action.baseValue
    // Heat-conditional bonus (e.g., Calibrated Optics: draw 2 while Cool)
    if (headEquip.heatBonusThreshold && headEquip.heatBonusValue) {
      if (getHeatThreshold(result.combat.heat) === headEquip.heatBonusThreshold) {
        headDrawBonus += headEquip.heatBonusValue
      }
    }
  }

  // Step 3: Reshuffle discard into draw pile if needed, then draw
  const drawCount = ctx.drawCount + inspiredBonus + headDrawBonus
  if (result.combat.drawPile.length < drawCount && result.combat.discardPile.length > 0) {
    result.combat.drawPile = shuffle([...result.combat.drawPile, ...result.combat.discardPile])
    result.combat.discardPile = []
  }
  const actualDrawn = drawCards(result.combat, drawCount)
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

// ─── Project Heat (Task 2.13) ───────────────────────────────────────────────

export function projectHeat(
  currentHeat: number,
  _equipment: Record<BodySlot, EquipmentDefinition | null>,
  _slotModifiers: Record<BodySlot, string | null>,
  _cardDefs: Record<string, ModifierCardDefinition>,
  _combat: CombatState
): number {
  // Slots no longer generate heat — planning-end heat IS execution heat
  return currentHeat
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
  heatCost: number
  targetMode: 'single' | 'all'
  isOverride: boolean
  isDisabled: boolean
  isInactive: boolean // heatConditionOnly equipment that can't fire at current heat
  isMultiFire: boolean // multiFire equipment currently in zone
  heatAtExecution: number // same for all slots (planning-end heat)
  heatDmgContrib: number
  heatBlkContrib: number
  heatHealContrib: number
}

export function projectSlotActions(
  combat: CombatState,
  equipment: Record<BodySlot, EquipmentDefinition | null>,
  cardDefs: Record<string, ModifierCardDefinition>,
  parts: BehavioralPartDefinition[]
): SlotProjection[] {
  const projections: SlotProjection[] = []
  // All slots use the same heat — no per-slot drift
  const executionHeat = combat.heat

  for (const slot of BODY_SLOTS) {
    const isDisabled = combat.disabledSlots.includes(slot)
    const equip = equipment[slot]
    const modInstanceId = combat.slotModifiers[slot]
    const hasOverride = hasOverrideModifier(modInstanceId, cardDefs, combat)

    // Check heatConditionOnly: equipment can't fire outside its zone
    const isInactive = !!(equip?.heatConditionOnly && getHeatThreshold(executionHeat) !== equip.heatConditionOnly)
    const isMultiFire = !!(equip?.multiFire && getHeatThreshold(executionHeat) === equip.multiFire.threshold)

    if (isDisabled || (!equip && !hasOverride)) {
      projections.push({
        slot,
        willFire: false,
        damage: 0,
        block: 0,
        heal: 0,
        draw: 0,
        foresight: 0,
        heatCost: 0,
        targetMode: 'single',
        isOverride: false,
        isDisabled,
        isInactive: false,
        isMultiFire: false,
        heatAtExecution: executionHeat,
        heatDmgContrib: 0,
        heatBlkContrib: 0,
        heatHealContrib: 0,
      })
      continue
    }

    const result = resolveBodyAction(
      slot,
      equip,
      modInstanceId,
      cardDefs,
      combat,
      executionHeat,
      parts
    )

    // Compute Cool baseline to determine heat's contribution
    const coolResult = resolveBodyAction(
      slot,
      equip,
      modInstanceId,
      cardDefs,
      combat,
      0, // Cool = no threshold bonus, no heat-triggered parts
      parts
    )

    const totalDamage = result.damage.reduce((sum, d) => sum + d.amount, 0)
    const coolDamage = coolResult.damage.reduce((sum, d) => sum + d.amount, 0)
    const isAoe = result.damage.length > 0 && result.damage[0].enemyId === '__all__'

    projections.push({
      slot,
      willFire: !isInactive,
      damage: totalDamage,
      block: result.blockGained,
      heal: result.healAmount,
      draw: result.cardsDrawn,
      foresight: result.foresight,
      heatCost: result.heatGenerated - result.heatReduced,
      targetMode: isAoe ? 'all' : 'single',
      isOverride: hasOverride,
      isDisabled: false,
      isInactive,
      isMultiFire,
      heatAtExecution: executionHeat,
      heatDmgContrib: totalDamage - coolDamage,
      heatBlkContrib: result.blockGained - coolResult.blockGained,
      heatHealContrib: result.healAmount - coolResult.healAmount,
    })
  }

  return projections
}

// ─── Draw Cards Helper ──────────────────────────────────────────────────────

function drawCards(combat: CombatState, count: number): number {
  let drawn = 0
  for (let i = 0; i < count; i++) {
    if (combat.drawPile.length === 0) {
      if (combat.discardPile.length === 0) break
      combat.drawPile = shuffle(combat.discardPile)
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
  // Check heat condition (e.g., Frost Core: only while Cool)
  if (part.heatCondition && getHeatThreshold(result.combat.heat) !== part.heatCondition) {
    return
  }

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
    case 'reduceHeat': {
      const heatRes = applyHeatChange(result.combat, -part.effect.value)
      result.log.push(`${part.name}: -${part.effect.value} Heat`)
      if (heatRes.crossed) fireThresholdCrossTriggers(ctx.parts, result, ctx)
      break
    }
    case 'drawCards': {
      const actualDrawn = drawCards(result.combat, part.effect.count)
      result.log.push(`${part.name}: drew ${actualDrawn}/${part.effect.count} card(s)`)
      break
    }
    case 'reduceModifierHeat':
      // Applied at card play time in store logic
      break
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
        const target = alive[Math.floor(Math.random() * alive.length)]
        const absorbed = Math.min(target.block, part.effect.value)
        target.block -= absorbed
        const actual = part.effect.value - absorbed
        target.currentHealth = Math.max(0, target.currentHealth - actual)
        if (target.currentHealth === 0) target.isDefeated = true
        result.log.push(`${part.name}: dealt ${actual} damage to ${target.definitionId}`)
      }
      break
    }
    case 'reduceCardHeatCosts':
      result.combat.heatCostReduction += part.effect.value
      result.log.push(`${part.name}: cards cost ${part.effect.value} less Heat this turn`)
      break
    case 'preventOverheat':
      // Handled inline at overheat check points
      break
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
