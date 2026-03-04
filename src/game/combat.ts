import type {
  EnemyDefinition,
  EnemyInstance,
  CardDefinition,
  CardInstance,
  StatusEffect,
  StatusEffectType,
  CombatState,
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

// Statuses that persist indefinitely and never decrement
const PERMANENT_STATUSES: Set<StatusEffectType> = new Set(['Strength'])

export function decrementStatuses(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((s) => ({ ...s, stacks: PERMANENT_STATUSES.has(s.type) ? s.stacks : s.stacks - 1 }))
    .filter((s) => s.stacks > 0)
}

// ─── Damage Calculation ───────────────────────────────────────────────────────

export function calcDamageDealt(
  baseDamage: number,
  attackerStatuses: StatusEffect[],
  defenderStatuses: StatusEffect[]
): number {
  let dmg = baseDamage
  // Strength bonus
  const strength = getStatus(attackerStatuses, 'Strength')
  dmg += strength
  // Weak reduces damage by 25%
  if (getStatus(attackerStatuses, 'Weak') > 0) dmg = Math.floor(dmg * 0.75)
  // Vulnerable increases damage taken by 50%
  if (getStatus(defenderStatuses, 'Vulnerable') > 0) dmg = Math.floor(dmg * 1.5)
  return Math.max(0, dmg)
}

// ─── Combat Initialisation ────────────────────────────────────────────────────

export function initCombat(
  deck: CardInstance[],
  energyCap: number,
  drawCount: number,
  enemies: EnemyInstance[],
  startingStrength = 0
): CombatState {
  const drawPile = shuffle(deck)
  const hand: CardInstance[] = []

  // Draw initial hand
  const initialDraw = Math.min(drawCount, drawPile.length, 10)
  for (let i = 0; i < initialDraw; i++) {
    hand.push(drawPile.pop()!)
  }

  return {
    phase: 'playerTurn',
    enemies,
    hand,
    drawPile,
    discardPile: [],
    exhaustPile: [],
    energy: energyCap,
    block: 0,
    statusEffects: startingStrength > 0 ? [{ type: 'Strength', stacks: startingStrength }] : [],
    roundNumber: 1,
  }
}

// ─── Card Effect Resolution ────────────────────────────────────────────────────

export interface CombatContext {
  combat: CombatState
  stillHealth: number
  maxHealth: number
  energyCap: number
  drawCount: number
  targetEnemyId?: string
  blockOnTurnStart?: number
}

export interface CombatResult {
  combat: CombatState
  stillHealth: number
  log: string[]
}

function applyCardEffect(
  ctx: CombatContext,
  card: CardDefinition,
  result: CombatResult
): void {
  for (const effect of card.effects) {
    switch (effect.type) {
      case 'damage': {
        let dmg = effect.value
        // discharge: damage = current block
        if (card.id === 'discharge') dmg = result.combat.block
        const targets =
          effect.target === 'all_enemies'
            ? result.combat.enemies.filter((e) => !e.isDefeated)
            : result.combat.enemies.filter(
                (e) => !e.isDefeated && e.instanceId === ctx.targetEnemyId
              )
        for (const enemy of targets) {
          const dealt = calcDamageDealt(dmg, result.combat.statusEffects, enemy.statusEffects)
          const absorbed = Math.min(enemy.block, dealt)
          enemy.block -= absorbed
          const actualDamage = dealt - absorbed
          enemy.currentHealth = Math.max(0, enemy.currentHealth - actualDamage)
          if (enemy.currentHealth === 0) enemy.isDefeated = true
          result.log.push(`Dealt ${actualDamage} damage to ${enemy.instanceId}${absorbed > 0 ? ` (${absorbed} blocked)` : ''}`)
        }
        break
      }
      case 'block': {
        // adaptation: block = cards remaining in hand after playing
        const blockGain = card.id === 'adaptation' ? result.combat.hand.length : effect.value
        result.combat.block += blockGain
        result.log.push(`Gained ${blockGain} Block`)
        break
      }
      case 'draw': {
        for (let i = 0; i < effect.value; i++) {
          if (result.combat.drawPile.length === 0) {
            if (result.combat.discardPile.length === 0) break
            result.combat.drawPile = shuffle(result.combat.discardPile)
            result.combat.discardPile = []
          }
          if (result.combat.hand.length >= 10) break
          result.combat.hand.push(result.combat.drawPile.pop()!)
        }
        result.log.push(`Drew ${effect.value} card(s)`)
        break
      }
      case 'energy': {
        result.combat.energy = Math.min(
          result.combat.energy + effect.value,
          ctx.energyCap
        )
        result.log.push(`Gained ${effect.value} energy`)
        break
      }
      case 'applyStatus': {
        if (!effect.status) break
        const targetSelf = effect.target === 'self'
        if (targetSelf) {
          result.combat.statusEffects = addStatus(
            result.combat.statusEffects,
            effect.status,
            effect.value
          )
        } else {
          const enemy = result.combat.enemies.find((e) => e.instanceId === ctx.targetEnemyId)
          if (enemy) {
            enemy.statusEffects = addStatus(enemy.statusEffects, effect.status, effect.value)
          }
        }
        result.log.push(`Applied ${effect.status} ${effect.value}`)
        break
      }
      case 'heal': {
        result.stillHealth = Math.min(ctx.maxHealth, result.stillHealth + effect.value)
        result.log.push(`Healed ${effect.value}`)
        break
      }
      case 'removeDebuff': {
        const debuffOrder: StatusEffectType[] = ['Weak', 'Vulnerable']
        for (const debuffType of debuffOrder) {
          const idx = result.combat.statusEffects.findIndex((s) => s.type === debuffType)
          if (idx !== -1) {
            const s = result.combat.statusEffects[idx]
            if (s.stacks <= 1) {
              result.combat.statusEffects.splice(idx, 1)
            } else {
              s.stacks -= 1
            }
            result.log.push(`Removed 1 ${debuffType}`)
            break
          }
        }
        break
      }
    }
  }
}

// ─── Play Card ────────────────────────────────────────────────────────────────

export function playCard(
  ctx: CombatContext,
  card: CardDefinition,
  instanceId: string
): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Deduct energy
  result.combat.energy -= card.cost

  // Move card from hand to discard (or exhaust)
  const handIdx = result.combat.hand.findIndex((c) => c.instanceId === instanceId)
  if (handIdx !== -1) {
    const [cardInst] = result.combat.hand.splice(handIdx, 1)
    if (card.keywords.includes('Exhaust')) {
      result.combat.exhaustPile.push(cardInst)
    } else {
      result.combat.discardPile.push(cardInst)
    }
  }

  // Apply effects
  applyCardEffect(ctx, card, result)

  return result
}

// ─── End Player Turn / Enemy Turn ─────────────────────────────────────────────

export function executeEnemyTurn(
  ctx: CombatContext,
  enemyDefs: Record<string, EnemyDefinition>
): CombatResult {
  const result: CombatResult = {
    combat: JSON.parse(JSON.stringify(ctx.combat)) as CombatState,
    stillHealth: ctx.stillHealth,
    log: [],
  }

  // Discard hand first
  result.combat.discardPile.push(...result.combat.hand)
  result.combat.hand = []

  // Reset block from previous turn for all enemies
  for (const enemy of result.combat.enemies) {
    enemy.block = 0
  }

  for (const enemy of result.combat.enemies) {
    if (enemy.isDefeated) continue
    const def = enemyDefs[enemy.definitionId]
    if (!def) continue
    const intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]

    switch (intent.type) {
      case 'Attack':
      case 'AttackDebuff': {
        const dealt = calcDamageDealt(intent.value, enemy.statusEffects, result.combat.statusEffects)
        const absorbed = Math.min(result.combat.block, dealt)
        result.combat.block -= absorbed
        result.stillHealth = Math.max(0, result.stillHealth - (dealt - absorbed))
        result.log.push(`${def.name} attacks for ${dealt - absorbed} (${absorbed} blocked)`)
        if (intent.type === 'AttackDebuff' && intent.status) {
          result.combat.statusEffects = addStatus(
            result.combat.statusEffects,
            intent.status,
            intent.statusStacks ?? 1
          )
        }
        break
      }
      case 'Block': {
        enemy.block += intent.value
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
            intent.value
          )
        }
        result.log.push(`${def.name} debuffs Still`)
        break
      }
    }

    // Advance intent
    enemy.intentIndex++
    // Decrement enemy status durations
    enemy.statusEffects = decrementStatuses(enemy.statusEffects)
  }

  // Capture Inspired bonus before decrementing statuses
  const inspiredBonus = getStatus(result.combat.statusEffects, 'Inspired')

  // Decrement Still's status durations
  result.combat.statusEffects = decrementStatuses(result.combat.statusEffects)

  // Reset block at start of new turn (parts with blockOnTurnStart provide a base amount)
  result.combat.block = ctx.blockOnTurnStart ?? 0
  result.combat.energy = ctx.energyCap
  result.combat.roundNumber++
  result.combat.phase = 'playerTurn'

  // Draw new hand (Inspired grants extra draws this turn)
  const drawCount = ctx.drawCount + inspiredBonus
  for (let i = 0; i < drawCount; i++) {
    if (result.combat.drawPile.length === 0) {
      if (result.combat.discardPile.length === 0) break
      result.combat.drawPile = shuffle(result.combat.discardPile)
      result.combat.discardPile = []
    }
    if (result.combat.hand.length >= 10) break
    result.combat.hand.push(result.combat.drawPile.pop()!)
  }

  return result
}

// ─── Win/Loss Checks ──────────────────────────────────────────────────────────

export function allEnemiesDefeated(combat: CombatState): boolean {
  return combat.enemies.every((e) => e.isDefeated)
}

export function isStillDefeated(health: number): boolean {
  return health <= 0
}
