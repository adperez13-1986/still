// ─── Energy System ──────────────────────────────────────────────────────────

export const DEFAULT_MAX_ENERGY = 8
export const MAX_PARTS = 4

// ─── Body System ────────────────────────────────────────────────────────────

export type BodySlot = 'Head' | 'Torso' | 'Arms' | 'Legs'

export const BODY_SLOTS: BodySlot[] = ['Head', 'Torso', 'Arms', 'Legs']

export type BodyActionType = 'damage' | 'block' | 'heal' | 'draw' | 'foresight' | 'debuff' | 'reduce'
export type TargetMode = 'single_enemy' | 'all_enemies' | 'self'

export interface BodyAction {
  type: BodyActionType
  baseValue: number
  targetMode: TargetMode
  debuffType?: StatusEffectType // for 'debuff' action type
}

export interface EquipmentDefinition {
  id: string
  name: string
  description: string
  slot: BodySlot
  action: BodyAction
  rarity: 'common' | 'uncommon' | 'rare'
  bonusHeal?: number // bonus healing applied alongside the main action
  bonusBlock?: number // bonus block gained alongside the main action
  blockCost?: number // lose this much Block when the slot fires
}

// ─── Modifier Cards ─────────────────────────────────────────────────────────

export type Keyword = 'Exhaust' | 'Innate' | 'Retain'

export type ModifierCategory = 'Amplify' | 'Redirect' | 'Repeat' | 'Override' | 'Feedback' | 'Retaliate'
export type SystemCategory = 'Draw' | 'Utility' | 'Conditional'

export type SlotModifierEffect =
  | { type: 'amplify'; multiplier: number }
  | { type: 'redirect'; targetMode: TargetMode }
  | { type: 'repeat'; extraFirings: number }
  | { type: 'override'; action: BodyAction }
  | { type: 'feedback' }
  | { type: 'retaliate' }
  // Berserker
  | { type: 'amplifyWithSelfDamage'; multiplier: number; selfDamage: number }
  | { type: 'overclockSlot' } // fires 3x, disables slot next turn
  // Exhaust-scaling
  | { type: 'amplifyScaling'; perStack: number } // +perStack% per exhausted card
  | { type: 'overrideExhaustHand'; damagePerCard: number; maxCards: number }
  | { type: 'repeatScaling'; perN: number; maxExtra: number } // +1 firing per perN exhausted cards
  // Counter
  | { type: 'crossSlotBonus'; sourceSlot: BodySlot } // bonus dmg = source slot's equipment base value
  | { type: 'combinedBlockRetaliate'; multiplier: number } // amplify block + retaliate
  | { type: 'blockHeal'; healRatio: number } // block gained also heals %
  | { type: 'volatileBlock' } // consumed block deals damage to attacker
  // Stat
  | { type: 'amplifyStatMultiplier'; stat: 'Strength' | 'Dexterity'; multiplier: number }
  // Bridge
  | { type: 'redirectPower' } // fires twice, 2nd uses adjacent slot's action
  | { type: 'feedbackLoop' } // extra firings = cards exhausted this turn

export type SystemEffect =
  | { type: 'draw'; count: number }
  | { type: 'heal'; value: number }
  | { type: 'applyStatus'; status: StatusEffectType; stacks: number; target: 'self' | 'all_enemies' }
  | { type: 'removeDebuff'; count: number }
  | { type: 'gainBlock'; value: number }
  | { type: 'damage'; value: number; targetMode: TargetMode }
  | { type: 'applyFeedback' }
  | { type: 'applyBurnout' }
  | { type: 'disableOwnSlot'; energyGain: number }

export type ModifierCardType =
  | { type: 'slot'; modifier: ModifierCategory; effect: SlotModifierEffect }
  | { type: 'system'; modifier: SystemCategory; effects: SystemEffect[]; homeSlot: BodySlot }

export interface ModifierCardDefinition {
  id: string
  name: string
  description: string
  energyCost: number
  category: ModifierCardType
  keywords: Keyword[]
  freePlay?: boolean // plays instantly without occupying a slot (e.g., companion cards)
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
  | { type: 'onTurnStart' }
  | { type: 'onCombatStart' }
  | { type: 'onCardPlay' }
  | { type: 'onCardExhaust' }
  | { type: 'onPlanningEnd' }
  | { type: 'onDamageTaken' }
  | { type: 'onDrawPileEmpty' }

export type PartEffect =
  | { type: 'bonusBlock'; value: number }
  | { type: 'bonusDamage'; value: number }
  | { type: 'extraFiring'; slot: BodySlot }
  | { type: 'drawCards'; count: number }
  | { type: 'bonusHealing'; value: number }
  | { type: 'blockPerCard'; value: number }
  | { type: 'damageRandomEnemy'; value: number }
  | { type: 'amplifyModifiers'; multiplier: number }
  | { type: 'blockForDisabledSlots'; value: number }
  | { type: 'blockPerExhausted' }
  | { type: 'halveLargeDamage'; threshold: number }
  | { type: 'blockPerUnplayedCard'; value: number }
  | { type: 'dualLoader' }
  | { type: 'bonusEnergy'; value: number }
  | { type: 'reshuffleDiscard' }
  | { type: 'thorns'; value: number }
  | { type: 'voltageCounter' }
  | { type: 'damagePerExhausted' }

export interface BehavioralPartDefinition {
  id: string
  name: string
  description: string
  trigger: PartTrigger
  effect: PartEffect
  rarity: 'common' | 'uncommon' | 'rare'
}

// ─── Enemies ─────────────────────────────────────────────────────────────────

export type IntentType = 'Attack' | 'Block' | 'Buff' | 'Debuff' | 'AttackDebuff' | 'DisableSlot' | 'Scan'

export interface Intent {
  type: IntentType
  value: number
  hits?: number // multi-hit attacks: each hit resolves independently against block
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
  collapsed: boolean
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
  | { type: 'enemyAction'; enemyId: string; enemyName: string; intentType: IntentType; damage?: number; blocked?: number; reduced?: number; block?: number; statusApplied?: StatusEffectType; counterDamage?: number }
  | { type: 'partTrigger'; partId: string }

export interface CombatState {
  phase: CombatPhase
  enemies: EnemyInstance[]
  hand: CardInstance[]
  drawPile: CardInstance[]
  discardPile: CardInstance[]
  exhaustPile: CardInstance[]
  maxEnergy: number
  currentEnergy: number
  block: number
  statusEffects: StatusEffect[]
  roundNumber: number
  slotModifiers: Record<BodySlot, string | null> // instanceId of assigned modifier card
  slotModifiers2: Record<BodySlot, string | null> // second modifier (Dual Loader only)
  disabledSlots: BodySlot[]
  combatLog: CombatEvent[] // events from last execution for animation replay
  ablativeShellUsed: boolean // once-per-combat flag for Ablative Shell
  feedbackArmsBonus: number // bonus damage for Arms from HEAD Feedback (resets each execution)
  persistentBlock: number // carried block from LEGS Feedback (decays 50% per turn)
  _legsFeedbackBlock?: number // temp: block from LEGS this turn to add to persistentBlock at end of turn
  persistentFeedback: Record<BodySlot, boolean> // permanent Feedback effects applied via system card
  retaliateActive: boolean // whether Retaliate modifier is active this turn
  burnoutActive: boolean // Burnout Power: -3 HP, +2 Str each turn start
  volatileArmorActive: boolean // consumed block deals damage to attacker
  absorbActive: boolean // block gained this turn also heals 50%
  absorbBlockGained: number // tracks block gained this turn for Absorb heal
  cardsExhaustedThisTurn: number // tracks exhaust events for Feedback Loop
  damageReduction: number // per-hit reduction from LEGS equipment this turn
  _overclockDisables?: BodySlot[] // slots to disable next turn (survives enemy turn clear)
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
  combatsCleared: number
  lastCollapseMessage: string | null
  carriedPartSector: 1 | 2 | null
  isDebug?: boolean
  // Strain prototype
  strain: number
  strainCombat: import('./strainCombat').StrainCombatState | null
  growth: { abilities: string[]; masteries: string[] }
}

// ─── Part Archive ────────────────────────────────────────────────────────────

export interface PartArchiveEntry {
  partId: string
  sector: 1 | 2
  cooldownLeft: number
}

// ─── Permanent State ─────────────────────────────────────────────────────────

export type WorkshopUpgradeId =
  | 'practiced-routine'
  | 'sharp-eye'

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
  deck?: string[] // card names at end of run
  equipment?: Record<string, string | null> // slot → equipment name
  parts?: string[] // part names at end of run
  combatsCleared?: number // combats won in this run
  health?: number // HP at end of run
}

export interface PermanentState {
  totalShards: number
  workshopUpgrades: Record<WorkshopUpgradeId, boolean>
  runHistory: RunHistoryEntry[]
  companionsUnlocked: string[]
  nameEverDiscovered: boolean
  partArchive: Record<string, PartArchiveEntry>
  selectedArchivePart: string | null
}
