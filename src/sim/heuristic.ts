import type {
  BodySlot,
  ModifierCardDefinition,
  CardInstance,
  EnemyInstance,
} from '../game/types'
import { BODY_SLOTS } from '../game/types'
import { getAllowedSlots, getStatus, type CombatContext } from '../game/combat'

export interface CardPlay {
  instanceId: string
  targetSlot?: BodySlot
  targetEnemyId?: string
}

/** Assess total incoming enemy damage this turn. */
function assessThreat(enemies: EnemyInstance[], enemyDefs: CombatContext['enemyDefs']): number {
  let threat = 0
  for (const enemy of enemies) {
    if (enemy.isDefeated) continue
    const def = enemyDefs[enemy.definitionId]
    if (!def) continue
    const intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]
    if (intent.type === 'Attack' || intent.type === 'AttackDebuff') {
      const hits = intent.hits ?? 1
      let dmg = intent.value * hits
      if (getStatus(enemy.statusEffects, 'Strength') > 0) {
        dmg += getStatus(enemy.statusEffects, 'Strength') * hits
      }
      if (getStatus(enemy.statusEffects, 'Weak') > 0) {
        dmg = Math.floor(dmg * 0.75)
      }
      threat += dmg
    }
  }
  return threat
}

/** Pick the best target: prioritize debuffers, then highest damage, then lowest HP. */
function pickTarget(enemies: EnemyInstance[], enemyDefs: CombatContext['enemyDefs']): string | undefined {
  let best: EnemyInstance | undefined
  let bestScore = -Infinity
  for (const enemy of enemies) {
    if (enemy.isDefeated) continue
    const def = enemyDefs[enemy.definitionId]
    if (!def) continue

    // Score based on danger across the full intent pattern, not just current intent
    let score = 0
    for (const intent of def.intentPattern) {
      if (intent.type === 'AttackDebuff') score += 30  // debuffers are priority kills
      if (intent.type === 'Debuff') score += 20
      if (intent.type === 'DisableSlot') score += 15
      if (intent.type === 'Attack') score += intent.value * (intent.hits ?? 1)
    }
    // Favor enemies closer to death (easier kills reduce incoming damage faster)
    score += (1 - enemy.currentHealth / enemy.maxHealth) * 20

    if (!best || score > bestScore) { best = enemy; bestScore = score }
  }
  return best?.instanceId
}

/** Scan hand for the best block value available from a single card. */
function bestBlockInHand(ctx: CombatContext): number {
  let best = 0
  for (const inst of ctx.combat.hand) {
    const def = resolveCardDef(inst, ctx.cardDefs)
    if (!def) continue
    if (def.energyCost > ctx.combat.currentEnergy) continue

    if (def.category.type === 'slot') {
      const effect = def.category.effect
      // Override block on Torso
      if (effect.type === 'override' && effect.action.type === 'block') {
        best = Math.max(best, effect.action.baseValue)
      }
      // Amplify on Torso
      if (effect.type === 'amplify' && ctx.equipment.Torso?.action.type === 'block') {
        best = Math.max(best, Math.floor(ctx.equipment.Torso.action.baseValue * effect.multiplier))
      }
      // Repeat on Torso
      if (effect.type === 'repeat' && ctx.equipment.Torso?.action.type === 'block') {
        best = Math.max(best, ctx.equipment.Torso.action.baseValue * (1 + effect.extraFirings))
      }
    } else if (def.category.type === 'system') {
      for (const effect of def.category.effects) {
        if (effect.type === 'gainBlock') best = Math.max(best, effect.value)
      }
    }
  }
  // Add base Torso block if not disabled
  if (ctx.equipment.Torso?.action.type === 'block' && !ctx.combat.disabledSlots.includes('Torso')) {
    // Best is already the modified value; if no block card, just base Torso
    if (best === 0) best = ctx.equipment.Torso.action.baseValue
  }
  return best
}

/** Get the resolved card definition (handling upgrades). */
function resolveCardDef(
  inst: CardInstance,
  cardDefs: Record<string, ModifierCardDefinition>,
): ModifierCardDefinition | undefined {
  const def = cardDefs[inst.definitionId]
  if (!def) return undefined
  return inst.isUpgraded && def.upgraded ? def.upgraded : def
}

/** Score a slot modifier card for a given slot, given the current context. */
function scoreSlotCard(
  def: ModifierCardDefinition,
  slot: BodySlot,
  ctx: CombatContext,
  _threat: number,
  isDefensive: boolean,
  killOrDie: boolean,
): number {
  if (def.category.type !== 'slot') return -1
  const equip = ctx.equipment[slot]
  const effect = def.category.effect
  // In kill-or-die, treat everything like aggressive offense
  const offensiveMult = killOrDie ? 3 : 2
  const defensiveMult = killOrDie ? 0.1 : 0.5

  switch (effect.type) {
    case 'amplify': {
      if (slot === 'Arms' && equip?.action.type === 'damage') {
        const base = equip.action.baseValue
        const bonus = Math.floor(base * effect.multiplier) - base
        return isDefensive ? bonus * defensiveMult : bonus * offensiveMult
      }
      if (slot === 'Torso' && equip?.action.type === 'block') {
        const base = equip.action.baseValue
        const bonus = Math.floor(base * effect.multiplier) - base
        return isDefensive ? bonus * 2 : bonus * defensiveMult
      }
      return 1
    }
    case 'redirect': {
      // Only useful with multiple enemies for AoE
      const alive = ctx.combat.enemies.filter(e => !e.isDefeated).length
      if (slot === 'Arms' && equip?.action.type === 'damage' && alive > 1) {
        return isDefensive ? equip.action.baseValue * defensiveMult : equip.action.baseValue * alive
      }
      return 0
    }
    case 'repeat': {
      if (!equip) return 0
      if (slot === 'Arms' && equip.action.type === 'damage') {
        return isDefensive ? equip.action.baseValue * defensiveMult : equip.action.baseValue * (1 + effect.extraFirings) * (killOrDie ? 1.5 : 1)
      }
      if (slot === 'Torso' && equip.action.type === 'block') {
        return isDefensive ? equip.action.baseValue * (1 + effect.extraFirings) : equip.action.baseValue * defensiveMult
      }
      return equip.action.baseValue
    }
    case 'override': {
      if (effect.action.type === 'damage') {
        const alive = effect.action.targetMode === 'all_enemies'
          ? ctx.combat.enemies.filter(e => !e.isDefeated).length
          : 1
        return (killOrDie || !isDefensive) ? effect.action.baseValue * alive * (killOrDie ? 1.5 : 1) : effect.action.baseValue * defensiveMult
      }
      if (effect.action.type === 'block') {
        return isDefensive ? effect.action.baseValue * 2 : effect.action.baseValue * 0.3
      }
      return effect.action.baseValue
    }
    case 'feedback': {
      // Score based on slot feedback type
      if (slot === 'Head') return isDefensive ? 3 : 6        // bonus damage for Arms
      if (slot === 'Torso') return isDefensive ? 5 : 3       // reflect damage
      if (slot === 'Arms') return 4                            // lifesteal
      if (slot === 'Legs') return isDefensive ? 6 : 2         // persistent block
      return 2
    }
  }
}

/** Score a system card. */
function scoreSystemCard(
  def: ModifierCardDefinition,
  ctx: CombatContext,
  _threat: number,
  isDefensive: boolean,
  shouldDig: boolean,
  killOrDie: boolean,
): number {
  if (def.category.type !== 'system') return -1
  let score = 0
  for (const effect of def.category.effects) {
    switch (effect.type) {
      case 'draw':
        // Dig mode: draw is very valuable to find answers
        score += shouldDig ? effect.count * 12 : effect.count * 3
        break
      case 'heal':
        score += ctx.stillHealth < ctx.maxHealth * 0.5 ? effect.value * 2 : effect.value * 0.5
        break
      case 'gainBlock':
        score += isDefensive ? effect.value * 2 : effect.value * 0.3
        break
      case 'damage': {
        const alive = effect.targetMode === 'all_enemies'
          ? ctx.combat.enemies.filter(e => !e.isDefeated).length
          : 1
        score += (killOrDie || !isDefensive) ? effect.value * alive * (killOrDie ? 2 : 1) : effect.value * 0.5
        break
      }
      case 'applyStatus':
        score += effect.stacks * 3
        break
      case 'removeDebuff':
        // Worth more if we actually have debuffs
        score += (getStatus(ctx.combat.statusEffects, 'Weak') > 0 ||
          getStatus(ctx.combat.statusEffects, 'Vulnerable') > 0)
          ? effect.count * 5
          : 0
        break
      case 'applyFeedback':
        // High value on turn 1 (permanent effect), lower later
        score += ctx.combat.roundNumber <= 2 ? 20 : 8
        break
    }
  }
  return score
}

interface ScoredPlay {
  instanceId: string
  def: ModifierCardDefinition
  targetSlot?: BodySlot
  score: number
}

export interface TurnTrace {
  turn: number
  hp: number
  energy: number
  threat: number
  block: number
  blockCeiling: number
  mode: 'offensive' | 'defensive' | 'kill-or-die'
  shouldDig: boolean
  targetEnemyId?: string
  enemies: { name: string; hp: number; maxHp: number; intent: string }[]
  hand: string[]
  picks: { card: string; slot?: string; score: number; efficiency: number }[]
  skipped: { card: string; slot?: string; score: number; efficiency: number }[]
}

/**
 * Plan a full turn of card plays given the current combat context.
 * Returns an ordered list of card plays to execute.
 */
export function planTurn(ctx: CombatContext, trace?: TurnTrace[]): CardPlay[] {
  const threat = assessThreat(ctx.combat.enemies, ctx.enemyDefs)
  const blockCeiling = bestBlockInHand(ctx)
  const unblockable = threat - blockCeiling - ctx.combat.block

  // Kill-or-die: if best possible block still leaves >60% of threat unblocked, go all-in offense
  const killOrDie = threat > 0 && unblockable > threat * 0.6
  const isDefensive = !killOrDie && threat > ctx.combat.block + 10
  // Dig mode: defensive but no strong block card (best block covers less than half the threat)
  const shouldDig = isDefensive && blockCeiling < threat * 0.5

  const targetEnemyId = pickTarget(ctx.combat.enemies, ctx.enemyDefs)

  const turnTrace: TurnTrace | null = trace ? {
    turn: ctx.combat.roundNumber,
    hp: ctx.stillHealth,
    energy: ctx.combat.currentEnergy,
    threat,
    block: ctx.combat.block,
    blockCeiling,
    mode: killOrDie ? 'kill-or-die' : isDefensive ? 'defensive' : 'offensive',
    shouldDig,
    targetEnemyId,
    enemies: ctx.combat.enemies.filter(e => !e.isDefeated).map(e => {
      const def = ctx.enemyDefs[e.definitionId]
      const intent = def?.intentPattern[e.intentIndex % (def?.intentPattern.length ?? 1)]
      return {
        name: def?.name ?? e.definitionId,
        hp: e.currentHealth,
        maxHp: e.maxHealth,
        intent: intent ? `${intent.type}${intent.value ? ' ' + intent.value : ''}${intent.hits ? ' ×' + intent.hits : ''}${intent.status ? ' +' + intent.status : ''}` : '?',
      }
    }),
    hand: ctx.combat.hand.map(c => {
      const d = resolveCardDef(c, ctx.cardDefs)
      return d ? d.name : c.definitionId
    }),
    picks: [],
    skipped: [],
  } : null

  // Track slot availability (mutable copies)
  const slotOccupied: Record<BodySlot, boolean> = { Head: false, Torso: false, Arms: false, Legs: false }
  const slotSecondaryOccupied: Record<BodySlot, boolean> = { Head: false, Torso: false, Arms: false, Legs: false }
  for (const slot of BODY_SLOTS) {
    if (ctx.combat.slotModifiers[slot] !== null) slotOccupied[slot] = true
    if (ctx.combat.slotModifiers2[slot] !== null) slotSecondaryOccupied[slot] = true
  }

  const hasDualLoader = ctx.parts.some(p => p.effect.type === 'dualLoader')
  let energy = ctx.combat.currentEnergy
  const plays: CardPlay[] = []
  const playedIds = new Set<string>()

  // Score every possible play
  function scorePossiblePlays(): ScoredPlay[] {
    const candidates: ScoredPlay[] = []
    for (const inst of ctx.combat.hand) {
      if (playedIds.has(inst.instanceId)) continue
      const def = resolveCardDef(inst, ctx.cardDefs)
      if (!def) continue
      if (def.energyCost > energy) continue

      if (def.category.type === 'system') {
        const isFeedbackCard = def.freePlay && def.category.effects.some(e => e.type === 'applyFeedback')

        if (isFeedbackCard) {
          // Feedback targets any slot with equipment that doesn't already have persistent Feedback
          const score = scoreSystemCard(def, ctx, threat, isDefensive, shouldDig, killOrDie)
          if (score > 0) {
            // Pick best slot: Arms (lifesteal) > Legs (persistent block) > Head (bonus damage) > Torso (reflect)
            const slotPriority: BodySlot[] = isDefensive
              ? ['Legs', 'Arms', 'Torso', 'Head']
              : ['Arms', 'Head', 'Legs', 'Torso']
            const bestSlot = slotPriority.find(s => ctx.equipment[s] && !ctx.combat.persistentFeedback[s])
            if (bestSlot) {
              candidates.push({ instanceId: inst.instanceId, def, targetSlot: bestSlot, score })
            }
          }
        } else {
          const homeSlot = def.category.homeSlot
          // System cards need their home slot free (unless freePlay)
          if (!def.freePlay && slotOccupied[homeSlot]) continue
          if (!def.freePlay && ctx.combat.disabledSlots.includes(homeSlot)) continue

          const score = scoreSystemCard(def, ctx, threat, isDefensive, shouldDig, killOrDie)
          if (score > 0) {
            candidates.push({
              instanceId: inst.instanceId,
              def,
              targetSlot: def.freePlay ? undefined : homeSlot,
              score,
            })
          }
        }
      } else {
        // Slot modifier — find best slot
        const allowed = getAllowedSlots(def)
        const possibleSlots = allowed ?? BODY_SLOTS.filter(s => !ctx.combat.disabledSlots.includes(s))
        const isFeedback = def.category.effect.type === 'feedback'

        for (const slot of possibleSlots) {
          if (ctx.combat.disabledSlots.includes(slot)) continue

          // Check slot availability
          if (isFeedback) {
            if (slotSecondaryOccupied[slot]) continue
          } else if (slotOccupied[slot]) {
            if (!hasDualLoader || slotSecondaryOccupied[slot]) continue
          }

          // Non-override modifiers need equipment in the slot
          if (def.category.effect.type !== 'override' && !ctx.equipment[slot]) continue

          const score = scoreSlotCard(def, slot, ctx, threat, isDefensive, killOrDie)
          if (score > 0) {
            candidates.push({ instanceId: inst.instanceId, def, targetSlot: slot, score })
          }
        }
      }
    }
    return candidates.sort((a, b) => (b.score / b.def.energyCost) - (a.score / a.def.energyCost))
  }

  // Greedy: pick best value/energy plays until energy runs out
  let maxIter = 20 // safety limit
  while (energy > 0 && maxIter-- > 0) {
    const candidates = scorePossiblePlays()
    if (candidates.length === 0) break

    const best = candidates[0]
    energy -= best.def.energyCost
    playedIds.add(best.instanceId)

    if (turnTrace) {
      turnTrace.picks.push({
        card: best.def.name,
        slot: best.targetSlot,
        score: best.score,
        efficiency: best.score / best.def.energyCost,
      })
      // Log runners-up from this round
      for (const c of candidates.slice(1, 4)) {
        turnTrace.skipped.push({
          card: c.def.name,
          slot: c.targetSlot,
          score: c.score,
          efficiency: c.score / c.def.energyCost,
        })
      }
    }

    if (best.targetSlot && best.def.category.type === 'slot') {
      const isFeedback = best.def.category.effect.type === 'feedback'
      if (isFeedback) {
        slotSecondaryOccupied[best.targetSlot] = true
      } else if (slotOccupied[best.targetSlot]) {
        slotSecondaryOccupied[best.targetSlot] = true
      } else {
        slotOccupied[best.targetSlot] = true
      }
    } else if (best.targetSlot && best.def.category.type === 'system') {
      slotOccupied[best.targetSlot] = true
    }

    plays.push({
      instanceId: best.instanceId,
      targetSlot: best.targetSlot,
      targetEnemyId,
    })
  }

  if (turnTrace && trace) trace.push(turnTrace)
  return plays
}
