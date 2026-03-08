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
  HEAT_MAX,
  HOT_DAMAGE,
  OVERHEAT_RESET,
  getHeatThreshold,
  getThresholdBonus,
  applyPassiveCooling,
  isHot,
} from '../game/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function makeEnemyInstance(def: EnemyDefinition): EnemyInstance {
  return {
    instanceId: `${def.id}-${Math.random().toString(36).slice(2)}`,
    definitionId: def.id,
    currentHealth: def.maxHealth,
    maxHealth: def.maxHealth,
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

// ─── Combat Context & Result ─────────────────────────────────────────────────

export interface CombatContext {
  combat: CombatState
  stillHealth: number
  maxHealth: number
  drawCount: number
  passiveCoolingBonus: number
  equipment: Record<BodySlot, EquipmentDefinition | null>
  parts: BehavioralPartDefinition[]
  cardDefs: Record<string, ModifierCardDefinition>
  enemyDefs: Record<string, EnemyDefinition>
  targetEnemyId?: string
}

export interface ActionResult {
  damage: Array<{ enemyId: string; amount: number }>
  blockGained: number
  healAmount: number
  cardsDrawn: number
  heatReduced: number
  heatGenerated: number
}

export interface CombatResult {
  combat: CombatState
  stillHealth: number
  log: string[]
}

// ─── Combat Initialisation (Task 2.11) ───────────────────────────────────────

export function initCombat(
  deck: CardInstance[],
  drawCount: number,
  enemies: EnemyInstance[],
  startingStatuses: StatusEffect[] = []
): CombatState {
  const drawPile = shuffle(deck)
  const hand: CardInstance[] = []

  const initialDraw = Math.min(drawCount, drawPile.length, 10)
  for (let i = 0; i < initialDraw; i++) {
    hand.push(drawPile.pop()!)
  }

  return {
    phase: 'planning',
    enemies,
    hand,
    drawPile,
    discardPile: [],
    exhaustPile: [],
    heat: 0,
    shutdown: false,
    block: 0,
    statusEffects: [...startingStatuses],
    roundNumber: 1,
    slotModifiers: { Head: null, Torso: null, Arms: null, Legs: null },
    disabledSlots: [],
    heatChangeThisTurn: 0,
    thresholdCrossedThisTurn: false,
    combatLog: [],
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
  parts: BehavioralPartDefinition[]
): ActionResult {
  const result: ActionResult = {
    damage: [],
    blockGained: 0,
    healAmount: 0,
    cardsDrawn: 0,
    heatReduced: 0,
    heatGenerated: 1, // each body action generates +1 Heat
  }

  // Determine the action and whether it's an override
  let action: BodyAction | null = null
  let isOverride = false
  let modifierDef: ModifierCardDefinition | null = null

  if (modifierInstanceId) {
    // Find the card instance in hand/assigned to get definition
    const cardInst = [...combat.hand].find(c => c.instanceId === modifierInstanceId)
      ?? findAssignedCard(combat, modifierInstanceId)
    if (cardInst) {
      const def = cardDefs[cardInst.definitionId]
      if (def?.category.type === 'slot') {
        modifierDef = def
      }
    }
  }

  if (modifierDef?.category.type === 'slot' && modifierDef.category.effect.type === 'override') {
    // Override replaces the action entirely
    action = modifierDef.category.effect.action
    isOverride = true
  } else if (equipment) {
    action = equipment.action
  } else {
    // No equipment and no override — nothing fires
    result.heatGenerated = 0
    return result
  }

  // Apply Heat threshold bonus
  const thresholdBonus = getThresholdBonus(heat)
  const { value, targetMode } = applyStatusToAction(action, slot, combat.statusEffects, isOverride)
  let finalValue = value + thresholdBonus

  // Apply equipment-specific heat bonus (Task 5.5)
  if (equipment?.heatBonusThreshold && equipment?.heatBonusValue) {
    if (getHeatThreshold(heat) === equipment.heatBonusThreshold) {
      finalValue += equipment.heatBonusValue
    }
  }

  // Apply extra heat generation from equipment (Task 5.5)
  if (equipment?.extraHeatGenerated) {
    result.heatGenerated += equipment.extraHeatGenerated
  }

  // Apply modifier effects (non-override)
  let repeatCount = 1
  let finalTargetMode = targetMode

  if (modifierDef && !isOverride && modifierDef.category.type === 'slot') {
    const effect = modifierDef.category.effect
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
              result.heatGenerated += 1
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
        // Foresight is UI-only (reveal extra intents); tracked but not resolved here
        break
    }
  }

  // Store target mode for damage resolution
  if (result.damage.length > 0) {
    for (const d of result.damage) {
      d.enemyId = finalTargetMode === 'all_enemies' ? '__all__' : '__single__'
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

function applyHeatChange(combat: CombatState, delta: number): boolean {
  const oldHeat = combat.heat
  const oldThreshold = getHeatThreshold(oldHeat)
  combat.heat = Math.min(HEAT_MAX, Math.max(0, oldHeat + delta))
  const newThreshold = getHeatThreshold(combat.heat)
  combat.heatChangeThisTurn += Math.abs(combat.heat - oldHeat)
  const crossed = oldThreshold !== newThreshold
  if (crossed) {
    combat.thresholdCrossedThisTurn = true
  }
  return crossed
}

function fireThresholdCrossTriggers(
  parts: BehavioralPartDefinition[],
  result: CombatResult,
  ctx: CombatContext
): void {
  for (const part of parts) {
    if (part.trigger.type === 'onThresholdCross') {
      applyPartEffect(part, result, ctx)
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

  // If shutdown, skip all body actions
  if (result.combat.shutdown) {
    result.log.push('SHUTDOWN — body actions skipped')
    return result
  }

  for (const slot of BODY_SLOTS) {
    // Disabled slots skip execution (Task 2.15)
    if (result.combat.disabledSlots.includes(slot)) {
      result.log.push(`${slot} is disabled — skipped`)
      continue
    }

    const equip = ctx.equipment[slot]
    const modInstanceId = result.combat.slotModifiers[slot]

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
      ctx.parts
    )

    // Apply Heat generation (with threshold tracking)
    const crossedOnGen = applyHeatChange(result.combat, actionResult.heatGenerated)
    if (crossedOnGen) fireThresholdCrossTriggers(ctx.parts, result, ctx)

    // Apply Heat reduction from coolHeat actions
    const heatBeforeReduce = result.combat.heat
    const crossedOnReduce = applyHeatChange(result.combat, -actionResult.heatReduced)
    if (crossedOnReduce) fireThresholdCrossTriggers(ctx.parts, result, ctx)

    // Bonus block per heat lost (e.g., Adaptive Treads)
    if (equip?.bonusBlockPerHeatLost && actionResult.heatReduced > 0) {
      const actualReduced = heatBeforeReduce - result.combat.heat
      if (actualReduced > 0) {
        const bonusBlock = actualReduced * equip.bonusBlockPerHeatLost
        result.combat.block += bonusBlock
        result.log.push(`${slot}: gained ${bonusBlock} Block from heat lost`)
      }
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
        : ctx.targetEnemyId
          ? result.combat.enemies.filter(e => !e.isDefeated && e.instanceId === ctx.targetEnemyId)
          : result.combat.enemies.filter(e => !e.isDefeated).slice(0, 1)

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

    // Apply card draw from body actions
    if (actionResult.cardsDrawn > 0) {
      drawCards(result.combat, actionResult.cardsDrawn)
    }

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

    // Check Overheat after each action (Task 2.9)
    if (result.combat.heat >= HEAT_MAX) {
      result.combat.shutdown = true
      result.combat.combatLog.push({ type: 'overheatShutdown' })
      result.log.push('OVERHEAT — shutdown next turn')
    }

    // Fire onSlotFire part triggers for modifier play tracking
    for (const part of ctx.parts) {
      if (part.trigger.type === 'onSlotFire' && part.trigger.slot === slot) {
        // Part effects already applied in resolveBodyAction
      }
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

  // Cannot play cards during shutdown
  if (result.combat.shutdown) {
    result.log.push(`Cannot play ${card.name}: shutdown active`)
    return result
  }

  // Check Heat condition if present
  if (card.heatCondition) {
    const currentThreshold = getHeatThreshold(result.combat.heat)
    if (!isThresholdMet(currentThreshold, card.heatCondition)) {
      result.log.push(`Cannot play ${card.name}: requires ${card.heatCondition}`)
      return result
    }
  }

  // Apply Heat cost (with threshold tracking)
  const crossedOnPlay = applyHeatChange(result.combat, card.heatCost)
  if (crossedOnPlay) fireThresholdCrossTriggers(ctx.parts, result, ctx)

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

    // Check slot not already modified
    if (result.combat.slotModifiers[targetSlot] !== null) {
      result.log.push(`${targetSlot} already has a modifier assigned`)
      return result
    }

    // Non-override modifiers need a filled equipment slot
    if (card.category.effect.type !== 'override' && !ctx.equipment[targetSlot]) {
      result.log.push(`Cannot assign ${card.category.modifier} to empty ${targetSlot} slot`)
      return result
    }

    // Assign modifier to slot — card stays in hand array so findAssignedCard
    // can locate it later (endTurn, unassign, resolveBodyAction). The UI
    // filters assigned cards out of the visible hand.
    result.combat.slotModifiers[targetSlot] = instanceId

    result.log.push(`Assigned ${card.name} to ${targetSlot}`)
  } else {
    // System card — apply effects immediately
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
            : ctx.targetEnemyId
              ? result.combat.enemies.filter(e => !e.isDefeated && e.instanceId === ctx.targetEnemyId)
              : result.combat.enemies.filter(e => !e.isDefeated).slice(0, 1)
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
        const targets = ctx.targetEnemyId
          ? result.combat.enemies.filter(e => !e.isDefeated && e.instanceId === ctx.targetEnemyId)
          : result.combat.enemies.filter(e => !e.isDefeated).slice(0, 1)
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
    if (cardInst) {
      if (card.keywords.includes('Exhaust')) {
        result.combat.exhaustPile.push(cardInst)
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

  // Check Overheat
  if (result.combat.heat >= HEAT_MAX) {
    result.combat.shutdown = true
    result.log.push('OVERHEAT — shutdown next turn')
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

  const instanceId = result.combat.slotModifiers[slot]
  if (!instanceId) {
    result.log.push(`No modifier assigned to ${slot}`)
    return result
  }

  // Refund Heat cost
  result.combat.heat = Math.max(0, result.combat.heat - card.heatCost)

  // Card stays in hand (was never removed), just clear the slot assignment
  result.combat.slotModifiers[slot] = null

  result.log.push(`Unassigned ${card.name} from ${slot}`)
  return result
}

// ─── Execute Enemy Turn (Task 2.8) ──────────────────────────────────────────

export function executeEnemyTurn(ctx: CombatContext): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Reset enemy block
  for (const enemy of result.combat.enemies) {
    enemy.block = 0
  }

  for (const enemy of result.combat.enemies) {
    if (enemy.isDefeated) continue
    const def = ctx.enemyDefs[enemy.definitionId]
    if (!def) continue
    const intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]

    let eventDamage: number | undefined
    let eventBlocked: number | undefined
    let eventBlock: number | undefined
    let eventStatus: StatusEffectType | undefined

    switch (intent.type) {
      case 'Attack':
      case 'AttackDebuff': {
        let dealt = intent.value
        // Enemy Strength
        dealt += getStatus(enemy.statusEffects, 'Strength')
        // Weak reduces enemy damage
        if (getStatus(enemy.statusEffects, 'Weak') > 0) dealt = Math.floor(dealt * 0.75)
        // Vulnerable on Still
        if (getStatus(result.combat.statusEffects, 'Vulnerable') > 0) dealt = Math.floor(dealt * 1.5)
        dealt = Math.max(0, dealt)
        const absorbed = Math.min(result.combat.block, dealt)
        result.combat.block -= absorbed
        const actual = dealt - absorbed
        result.stillHealth = Math.max(0, result.stillHealth - actual)
        eventDamage = actual
        eventBlocked = absorbed
        result.log.push(`${def.name} attacks for ${actual} (${absorbed} blocked)`)
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

  // Step 8b: Decrement Still's status durations
  const inspiredBonus = getStatus(result.combat.statusEffects, 'Inspired')
  result.combat.statusEffects = decrementStatuses(result.combat.statusEffects)

  // Step 9: Move assigned slot modifiers to discard/exhaust, then discard remaining hand
  const assignedIds = new Set<string>()
  for (const slot of BODY_SLOTS) {
    const modId = result.combat.slotModifiers[slot]
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
    result.combat.slotModifiers[slot] = null
  }

  // Discard remaining hand, excluding cards already handled as assigned modifiers
  for (const card of result.combat.hand) {
    if (!assignedIds.has(card.instanceId)) {
      result.combat.discardPile.push(card)
    }
  }
  result.combat.hand = []

  // Clear shutdown flag at end of shutdown turn
  if (result.combat.shutdown) {
    result.combat.shutdown = false
    result.log.push('Shutdown cleared')
  }

  // Check Overheat triggers shutdown for NEXT turn
  if (result.combat.heat >= HEAT_MAX) {
    result.combat.shutdown = true
  }

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

  // Step 1: Overheat shutdown setup
  if (result.combat.shutdown) {
    result.combat.heat = OVERHEAT_RESET
    result.log.push(`Shutdown: Heat reset to ${OVERHEAT_RESET}`)
  }

  // Step 1: Passive cooling
  result.combat.heat = applyPassiveCooling(result.combat.heat, ctx.passiveCoolingBonus)
  result.log.push(`Passive cooling: Heat → ${result.combat.heat}`)

  // Reset per-turn heat tracking (Tasks 5.2-5.3)
  result.combat.heatChangeThisTurn = 0
  result.combat.thresholdCrossedThisTurn = false

  // Step 2: Block resets to 0
  result.combat.block = 0

  // Step 2b: Disabled slots recover
  result.combat.disabledSlots = []

  // Step 3: Draw modifier cards
  const drawCount = ctx.drawCount + inspiredBonus
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
  equipment: Record<BodySlot, EquipmentDefinition | null>,
  slotModifiers: Record<BodySlot, string | null>,
  cardDefs: Record<string, ModifierCardDefinition>,
  combat: CombatState,
  _passiveCoolingBonus: number
): number {
  // Start from current heat (already reflects any cards played this planning phase)
  let projected = currentHeat

  // Count body actions that will fire
  for (const slot of BODY_SLOTS) {
    if (combat.disabledSlots.includes(slot)) continue

    const hasEquip = equipment[slot] !== null
    const modId = slotModifiers[slot]
    let hasOverride = false

    if (modId) {
      const cardInst = findAssignedCard(combat, modId)
      if (cardInst) {
        const def = cardDefs[cardInst.definitionId]
        if (def?.category.type === 'slot' && def.category.effect.type === 'override') {
          hasOverride = true
        }
        // Also account for Repeat extra firings
        if (def?.category.type === 'slot' && def.category.effect.type === 'repeat') {
          projected += def.category.effect.extraFirings // extra firings generate +1 Heat each
        }
      }
    }

    if (hasEquip || hasOverride) {
      projected += 1 // base body action Heat
    }
  }

  return Math.min(HEAT_MAX, projected)
}

// ─── Slot Projection (UI preview of body actions) ────────────────────────────

export interface SlotProjection {
  slot: BodySlot
  willFire: boolean
  damage: number
  block: number
  heal: number
  draw: number
  heatCost: number
  targetMode: 'single' | 'all'
  isOverride: boolean
  isDisabled: boolean
  heatAtExecution: number
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
  let simulatedHeat = combat.heat

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
        heatCost: 0,
        targetMode: 'single',
        isOverride: false,
        isDisabled,
        heatAtExecution: simulatedHeat,
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
      simulatedHeat,
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

    const heatAtExecution = simulatedHeat

    // Advance simulated heat so subsequent slots see correct threshold
    simulatedHeat = Math.min(HEAT_MAX, simulatedHeat + result.heatGenerated)
    simulatedHeat = Math.max(0, simulatedHeat - result.heatReduced)

    const totalDamage = result.damage.reduce((sum, d) => sum + d.amount, 0)
    const coolDamage = coolResult.damage.reduce((sum, d) => sum + d.amount, 0)
    const isAoe = result.damage.length > 0 && result.damage[0].enemyId === '__all__'

    projections.push({
      slot,
      willFire: true,
      damage: totalDamage,
      block: result.blockGained,
      heal: result.healAmount,
      draw: result.cardsDrawn,
      heatCost: result.heatGenerated - result.heatReduced,
      targetMode: isAoe ? 'all' : 'single',
      isOverride: hasOverride,
      isDisabled: false,
      heatAtExecution,
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

  switch (part.effect.type) {
    case 'bonusBlock':
      result.combat.block += part.effect.value
      result.log.push(`${part.name}: +${part.effect.value} Block`)
      break
    case 'bonusDamage':
      // Applied during resolveBodyAction, not here
      break
    case 'reduceHeat': {
      const crossed = applyHeatChange(result.combat, -part.effect.value)
      result.log.push(`${part.name}: -${part.effect.value} Heat`)
      if (crossed) fireThresholdCrossTriggers(ctx.parts, result, ctx)
      break
    }
    case 'drawCards': {
      const actualDrawn = drawCards(result.combat, part.effect.count)
      result.log.push(`${part.name}: drew ${actualDrawn}/${part.effect.count} card(s)`)
    }
      break
    case 'reduceModifierHeat':
      // Applied at card play time in store logic
      break
    case 'bonusHealing':
      // Applied during resolveBodyAction
      break
    case 'extraFiring':
      // Applied during resolveBodyAction
      break
  }
}

// ─── Win/Loss Checks ────────────────────────────────────────────────────────

export function allEnemiesDefeated(combat: CombatState): boolean {
  return combat.enemies.every((e) => e.isDefeated)
}

export function isStillDefeated(health: number): boolean {
  return health <= 0
}
