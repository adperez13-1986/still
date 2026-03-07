// ─── Heat System ────────────────────────────────────────────────────────────

export type HeatThreshold = 'Cool' | 'Warm' | 'Hot' | 'Overheat'

export const HEAT_MAX = 10
export const PASSIVE_COOLING = 2
export const HOT_DAMAGE = 3
export const OVERHEAT_RESET = 5

export function getHeatThreshold(heat: number): HeatThreshold {
  if (heat >= 10) return 'Overheat'
  if (heat >= 8) return 'Hot'
  if (heat >= 5) return 'Warm'
  return 'Cool'
}

export function getThresholdBonus(heat: number): number {
  const t = getHeatThreshold(heat)
  if (t === 'Hot' || t === 'Overheat') return 2
  if (t === 'Warm') return 1
  return 0
}

export function applyPassiveCooling(heat: number, bonus = 0): number {
  return Math.max(0, heat - PASSIVE_COOLING - bonus)
}

export function isCool(heat: number): boolean { return heat <= 4 }
export function isWarm(heat: number): boolean { return heat >= 5 && heat <= 7 }
export function isHot(heat: number): boolean { return heat >= 8 && heat <= 9 }
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
  | { type: 'applyStatus'; status: StatusEffectType; stacks: number; target: 'self' }
  | { type: 'removeDebuff'; count: number }
  | { type: 'gainBlock'; value: number }
  | { type: 'damage'; value: number; targetMode: TargetMode }

export type ModifierCardType =
  | { type: 'slot'; modifier: ModifierCategory; effect: SlotModifierEffect }
  | { type: 'system'; modifier: SystemCategory; effects: SystemEffect[] }

export interface ModifierCardDefinition {
  id: string
  name: string
  description: string
  heatCost: number
  category: ModifierCardType
  keywords: Keyword[]
  heatCondition?: HeatThreshold // minimum threshold required to play
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
  | { type: 'onTurnStart' }
  | { type: 'onCombatStart' }

export type PartEffect =
  | { type: 'bonusBlock'; value: number }
  | { type: 'bonusDamage'; value: number }
  | { type: 'reduceHeat'; value: number }
  | { type: 'extraFiring'; slot: BodySlot }
  | { type: 'drawCards'; count: number }
  | { type: 'reduceModifierHeat'; value: number }
  | { type: 'bonusHealing'; value: number }

export interface BehavioralPartDefinition {
  id: string
  name: string
  description: string
  trigger: PartTrigger
  effect: PartEffect
  rarity: 'common' | 'uncommon' | 'rare'
}

// ─── Enemies ─────────────────────────────────────────────────────────────────

export type IntentType = 'Attack' | 'Block' | 'Buff' | 'Debuff' | 'AttackDebuff' | 'HeatAttack' | 'DisableSlot' | 'Absorb'

export interface Intent {
  type: IntentType
  value: number
  status?: StatusEffectType
  statusStacks?: number
  heatValue?: number // for HeatAttack: additional Heat applied to Still
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

export interface Room {
  id: string
  type: RoomType
  act: 1 | 2 | 3
  enemyIds?: string[] // for Combat/Boss rooms
  eventId?: string   // for Event rooms
  connections: string[] // ids of next rooms
  visited: boolean
}

export interface MapGraph {
  rooms: Record<string, Room>
  startRoomId: string
  currentRoomId: string
  bossRoomId: string
}

// ─── Run State ───────────────────────────────────────────────────────────────

export type CombatPhase = 'planning' | 'executing' | 'enemyTurn' | 'reward' | 'finished'

export interface CombatState {
  phase: CombatPhase
  enemies: EnemyInstance[]
  hand: CardInstance[]
  drawPile: CardInstance[]
  discardPile: CardInstance[]
  exhaustPile: CardInstance[]
  heat: number
  shutdown: boolean
  block: number
  statusEffects: StatusEffect[]
  roundNumber: number
  slotModifiers: Record<BodySlot, string | null> // instanceId of assigned modifier card
  disabledSlots: BodySlot[]
}

export interface RunState {
  active: boolean
  act: 1 | 2 | 3
  map: MapGraph | null
  health: number
  maxHealth: number
  drawCount: number
  passiveCoolingBonus: number
  deck: CardInstance[]
  parts: BehavioralPartDefinition[]
  equipment: Record<BodySlot, EquipmentDefinition | null>
  shards: number
  combat: CombatState | null
  nameDiscovered: boolean
  equipPity: number
}

// ─── Carried Part ─────────────────────────────────────────────────────────────

export interface CarriedPart {
  partId: string
  durability: number
  maxDurability: number
  repairsLeft: number
}

// ─── Fragment Bonuses ─────────────────────────────────────────────────────────

export type FragmentBonusType = 'health' | 'shards' | 'passiveCooling' | 'drawCount'

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
  actReached: 1 | 2 | 3
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
