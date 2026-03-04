// ─── Card System ────────────────────────────────────────────────────────────

export type CardType = 'Attack' | 'Skill' | 'Power'
export type Keyword = 'Exhaust' | 'Innate' | 'Retain'

export interface CardEffect {
  type: 'damage' | 'block' | 'draw' | 'energy' | 'applyStatus' | 'heal' | 'removeDebuff'
  value: number
  target?: 'enemy' | 'self' | 'all_enemies'
  status?: StatusEffectType
}

export interface CardDefinition {
  id: string
  name: string
  type: CardType
  cost: number
  description: string
  effects: CardEffect[]
  keywords: Keyword[]
  upgraded?: CardDefinition // upgraded version of this card
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

// ─── Parts & Equipables ──────────────────────────────────────────────────────

export type PartEffectType =
  | 'maxHealth'
  | 'energyCap'
  | 'drawCount'
  | 'blockOnTurnStart'
  | 'shardBonus'
  | 'strengthBonus'

export interface PartDefinition {
  id: string
  name: string
  description: string
  effects: Array<{ type: PartEffectType; value: number }>
  rarity: 'common' | 'uncommon' | 'rare'
}

export type EquipSlot = 'Head' | 'Torso' | 'Arms' | 'Legs'

export interface EquipableDefinition {
  id: string
  name: string
  description: string
  slot: EquipSlot
  statEffects: Array<{ type: PartEffectType; value: number }>
  skill?: {
    name: string
    description: string
    cooldown: number // turns
    effect: CardEffect
  }
  rarity: 'common' | 'uncommon' | 'rare'
}

// ─── Enemies ─────────────────────────────────────────────────────────────────

export type IntentType = 'Attack' | 'Block' | 'Buff' | 'Debuff' | 'AttackDebuff'

export interface Intent {
  type: IntentType
  value: number
  status?: StatusEffectType
  statusStacks?: number
}

export interface IntentPattern {
  pattern: Intent[]
  currentIndex: number
}

export type DropType = 'card' | 'part' | 'shards'

export interface DropPool {
  type: DropType
  ids?: string[] // card or part ids
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

export type CombatPhase = 'playerTurn' | 'enemyTurn' | 'reward' | 'finished'

export interface CombatState {
  phase: CombatPhase
  enemies: EnemyInstance[]
  hand: CardInstance[]
  drawPile: CardInstance[]
  discardPile: CardInstance[]
  exhaustPile: CardInstance[]
  energy: number
  block: number
  statusEffects: StatusEffect[]
  roundNumber: number
}

export interface RunState {
  active: boolean
  act: 1 | 2 | 3
  map: MapGraph | null
  health: number
  maxHealth: number
  energyCap: number
  drawCount: number
  bonusStrength: number
  deck: CardInstance[]
  parts: PartDefinition[]
  equipables: Record<EquipSlot, EquipableDefinition | null>
  shards: number
  combat: CombatState | null
  nameDiscovered: boolean
}

// ─── Carried Part ─────────────────────────────────────────────────────────────

export interface CarriedPart {
  partId: string
  durability: number
  maxDurability: number
  repairsLeft: number
}

// ─── Fragment Bonuses ─────────────────────────────────────────────────────────

export type FragmentBonusType = 'health' | 'shards' | 'energyCap' | 'drawCount'

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
  | 'reinforced-chassis'
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
