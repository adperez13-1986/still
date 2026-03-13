// ─── Heat System ────────────────────────────────────────────────────────────

export type HeatThreshold = 'Cool' | 'Warm' | 'Hot' | 'Overheat'

export const HOT_DAMAGE = 3
export const OVERHEAT_THRESHOLD = 10
export const OVERHEAT_DAMAGE_PER_POINT = 2

export function getHeatThreshold(heat: number): HeatThreshold {
  if (heat >= 10) return 'Overheat'
  if (heat >= 7) return 'Hot'
  if (heat >= 4) return 'Warm'
  return 'Cool'
}

export function isCool(heat: number): boolean { return heat <= 3 }
export function isWarm(heat: number): boolean { return heat >= 4 && heat <= 6 }
export function isHot(heat: number): boolean { return heat >= 7 && heat <= 9 }
export function isOverheat(heat: number): boolean { return heat >= 10 }

// ─── Body System ────────────────────────────────────────────────────────────

export type BodySlot = 'Head' | 'Torso' | 'Arms' | 'Legs'

export const BODY_SLOTS: BodySlot[] = ['Head', 'Torso', 'Arms', 'Legs']

export type BodyActionType = 'damage' | 'block' | 'heal' | 'draw' | 'coolHeat' | 'foresight'
export type TargetMode = 'single_enemy' | 'all_enemies' | 'self'

export interface BodyAction {
  type: BodyActionType
  baseValue: number
  targetMode: TargetMode
}

export interface EquipmentDefinition {
  id: string
  name: string
  description: string
  slot: BodySlot
  action: BodyAction
  rarity: 'common' | 'uncommon' | 'rare'
  heatBonusThreshold?: HeatThreshold
  heatBonusValue?: number // extra value added to action when at threshold
  extraHeatGenerated?: number // extra heat produced when this equipment fires
  bonusBlockPerHeatLost?: number // block gained per point of heat actually cooled
  bonusHeal?: number // bonus healing applied alongside the main action
  heatConditionOnly?: HeatThreshold // only fires when in this heat zone; produces nothing outside
  multiFire?: { threshold: HeatThreshold; extraFirings: number } // fires extra times while in zone
  blockCost?: number // lose this much Block when the slot fires
  bonusForesight?: number // reveal extra enemy intents alongside primary action
  heatBonusBlock?: number // bonus block gained when at heatBonusThreshold (Cryo Lock)
}

// ─── Modifier Cards ─────────────────────────────────────────────────────────

export type Keyword = 'Exhaust' | 'Innate' | 'Retain'

export type ModifierCategory = 'Amplify' | 'Redirect' | 'Repeat' | 'Override'
export type SystemCategory = 'Cooling' | 'Draw' | 'Conditional'

export type SlotModifierEffect =
  | { type: 'amplify'; multiplier: number }
  | { type: 'redirect'; targetMode: TargetMode }
  | { type: 'repeat'; extraFirings: number }
  | { type: 'override'; action: BodyAction }

export type SystemEffect =
  | { type: 'draw'; count: number }
  | { type: 'heal'; value: number }
  | { type: 'applyStatus'; status: StatusEffectType; stacks: number; target: 'self' | 'all_enemies' }
  | { type: 'removeDebuff'; count: number }
  | { type: 'gainBlock'; value: number }
  | { type: 'damage'; value: number; targetMode: TargetMode }

export type ModifierCardType =
  | { type: 'slot'; modifier: ModifierCategory; effect: SlotModifierEffect }
  | { type: 'system'; modifier: SystemCategory; effects: SystemEffect[] }

export interface HeatBonus {
  threshold: HeatThreshold
  effects: SystemEffect[]
}

export interface ModifierCardDefinition {
  id: string
  name: string
  description: string
  heatCost: number
  category: ModifierCardType
  keywords: Keyword[]
  heatCondition?: HeatThreshold // minimum threshold required to play
  heatBonus?: HeatBonus // bonus effects when at threshold
  upgraded?: ModifierCardDefinition
}

export interface CardInstance {
  instanceId: string
  definitionId: string
  isUpgraded: boolean
}

// ─── Status Effects ──────────────────────────────────────────────────────────

export type StatusEffectType = 'Weak' | 'Vulnerable' | 'Strength' | 'Dexterity' | 'Inspired'

export interface StatusEffect {
  type: StatusEffectType
  stacks: number
}

// ─── Behavioral Parts ───────────────────────────────────────────────────────

export type PartTrigger =
  | { type: 'onSlotFire'; slot: BodySlot }
  | { type: 'onModifierPlay'; modifier: ModifierCategory }
  | { type: 'onHeatThreshold'; threshold: HeatThreshold }
  | { type: 'onThresholdCross' }
  | { type: 'onTurnStart' }
  | { type: 'onCombatStart' }
  | { type: 'onCardPlay' }
  | { type: 'onCardExhaust' }

  | { type: 'onWouldOverheat' }
  | { type: 'onPlanningEnd' }
  | { type: 'onDamageTaken' }

export type PartEffect =
  | { type: 'bonusBlock'; value: number }
  | { type: 'bonusDamage'; value: number }
  | { type: 'reduceHeat'; value: number }
  | { type: 'extraFiring'; slot: BodySlot }
  | { type: 'drawCards'; count: number }
  | { type: 'reduceModifierHeat'; value: number }
  | { type: 'bonusHealing'; value: number }
  | { type: 'blockPerCard'; value: number }
  | { type: 'damageRandomEnemy'; value: number }
  | { type: 'reduceCardHeatCosts'; value: number }
  | { type: 'preventOverheat'; setHeat: number; damage: number }
  | { type: 'amplifyModifiers'; multiplier: number }
  | { type: 'blockForDisabledSlots'; value: number }
  | { type: 'blockPerExhausted' }
  | { type: 'halveLargeDamage'; threshold: number }
  | { type: 'blockPerUnplayedCard'; value: number }
  | { type: 'dualLoader' }
  | { type: 'heatLock'; turns: number }
  | { type: 'overheatReactor'; heatReset: number; maxHpCost: number }

export interface BehavioralPartDefinition {
  id: string
  name: string
  description: string
  trigger: PartTrigger
  effect: PartEffect
  rarity: 'common' | 'uncommon' | 'rare'
  heatCondition?: HeatThreshold
}

// ─── Enemies ─────────────────────────────────────────────────────────────────

export type IntentType = 'Attack' | 'Block' | 'Buff' | 'Debuff' | 'AttackDebuff' | 'DisableSlot' | 'Absorb'

export interface Intent {
  type: IntentType
  value: number
  status?: StatusEffectType
  statusStacks?: number
  targetSlot?: BodySlot // for DisableSlot: which slot to disable
}

export interface IntentPattern {
  pattern: Intent[]
  currentIndex: number
}

export type DropType = 'card' | 'part' | 'equipment' | 'shards'

export interface DropPool {
  type: DropType
  ids?: string[] // card, part, or equipment ids
  amount?: number // for shards
  weight: number
}

export interface EnemyDefinition {
  id: string
  name: string
  maxHealth: number
  intentPattern: Intent[]
  dropPool: DropPool[]
  isElite?: boolean
  isBoss?: boolean
  flavorText?: string
}

export interface EnemyInstance {
  instanceId: string
  definitionId: string
  currentHealth: number
  maxHealth: number
  block: number
  intentIndex: number
  statusEffects: StatusEffect[]
  isDefeated: boolean
}

// ─── Maze / Rooms ─────────────────────────────────────────────────────────────

export type RoomType = 'Combat' | 'Rest' | 'Shop' | 'Event' | 'Boss'

export type GridRoomType = RoomType | 'Empty'

export interface GridRoom {
  type: GridRoomType
  sector: 1 | 2 | 3
  visited: boolean
  cleared: boolean
  x: number
  y: number
}

export interface GridMaze {
  grid: (GridRoom | null)[][] // null = wall
  startX: number
  startY: number
  playerX: number
  playerY: number
  bossX: number
  bossY: number
  sector: 1 | 2 | 3
}


// ─── Run State ───────────────────────────────────────────────────────────────

export type CombatPhase = 'planning' | 'executing' | 'enemyTurn' | 'reward' | 'finished'

// ─── Combat Animation Events ────────────────────────────────────────────────

export type CombatEvent =
  | { type: 'slotFire'; slot: BodySlot; damages?: Array<{ enemyId: string; amount: number }>; block?: number; heal?: number; targetMode: TargetMode }
  | { type: 'enemyAction'; enemyId: string; enemyName: string; intentType: IntentType; damage?: number; blocked?: number; block?: number; statusApplied?: StatusEffectType }
  | { type: 'hotPenalty'; damage: number }
  | { type: 'overheatDamage'; damage: number }
  | { type: 'partTrigger'; partId: string }

export interface CombatState {
  phase: CombatPhase
  enemies: EnemyInstance[]
  hand: CardInstance[]
  drawPile: CardInstance[]
  discardPile: CardInstance[]
  exhaustPile: CardInstance[]
  heat: number
  block: number
  statusEffects: StatusEffect[]
  roundNumber: number
  slotModifiers: Record<BodySlot, string | null> // instanceId of assigned modifier card
  slotModifiers2: Record<BodySlot, string | null> // second modifier (Dual Loader only)
  disabledSlots: BodySlot[]
  heatChangeThisTurn: number // cumulative absolute heat change this turn
  thresholdCrossedThisTurn: boolean // whether a threshold boundary was crossed
  combatLog: CombatEvent[] // events from last execution for animation replay
  heatCostReduction: number // per-turn card heat cost reduction (Zero Point Field)
  ablativeShellUsed: boolean // once-per-combat flag for Ablative Shell
  heatLocked: boolean // Thermal Damper: heat costs go to debt
  heatDebt: number // accumulated heat debt during lock
  heatLockTurnsLeft: number // turns remaining on heat lock
  overheatReactorFired: boolean // Overheat Reactor: 2x damage this turn
}

export interface RunState {
  active: boolean
  sector: 1 | 2 | 3
  map: GridMaze | null
  health: number
  maxHealth: number
  drawCount: number
  deck: CardInstance[]
  parts: BehavioralPartDefinition[]
  equipment: Record<BodySlot, EquipmentDefinition | null>
  shards: number
  combat: CombatState | null
  nameDiscovered: boolean
  equipPity: number
  companionsAcquired: string[]
  isDebug?: boolean
}

// ─── Carried Part ─────────────────────────────────────────────────────────────

export interface CarriedPart {
  partId: string
  durability: number
  maxDurability: number
  repairsLeft: number
}

// ─── Fragment Bonuses ─────────────────────────────────────────────────────────

export type FragmentBonusType = 'health' | 'shards' | 'drawCount'

export interface FragmentBonus {
  id: string
  name: string
  description: string
  cost: number
  type: FragmentBonusType
  value: number
}

// ─── Permanent State ─────────────────────────────────────────────────────────

export type WorkshopUpgradeId =
  | 'practiced-routine'
  | 'sharp-eye'
  | 'fragment-cap'
  | 'starting-slot'

export interface WorkshopUpgrade {
  id: WorkshopUpgradeId
  name: string
  description: string
  cost: number
  purchased: boolean
}

export interface RunHistoryEntry {
  id: string
  date: string
  sectorReached: 1 | 2 | 3
  outcome: 'victory' | 'defeat'
  message: string
  notable: string[] // key parts/cards acquired
}

export interface PermanentState {
  totalShards: number
  fragmentsAccumulated: number
  lastSeenTimestamp: number
  workshopUpgrades: Record<WorkshopUpgradeId, boolean>
  runHistory: RunHistoryEntry[]
  companionsUnlocked: string[]
  nameEverDiscovered: boolean
  carriedPart: CarriedPart | null
}
