import type { EquipmentDefinition, BehavioralPartDefinition } from '../game/types'

// ─── Equipment Definitions ──────────────────────────────────────────────────

// HEAD slot: information domain
const basicScanner: EquipmentDefinition = {
  id: 'basic-scanner',
  name: 'Scrap Scanner',
  description: 'Draw 1 modifier card.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 1, targetMode: 'self' },
  rarity: 'common',
}

const crackedLens: EquipmentDefinition = {
  id: 'cracked-lens',
  name: 'Cracked Lens',
  description: 'Reveal 1 extra enemy intent.',
  slot: 'Head',
  action: { type: 'foresight', baseValue: 1, targetMode: 'self' },
  rarity: 'common',
}

// TORSO slot: durability domain
const scrapPlating: EquipmentDefinition = {
  id: 'scrap-plating',
  name: 'Scrap Plating',
  description: 'Gain 3 Block.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 3, targetMode: 'self' },
  rarity: 'common',
}

const patchedHull: EquipmentDefinition = {
  id: 'patched-hull',
  name: 'Patched Hull',
  description: 'Gain 2 Block and heal 3 HP.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 2, targetMode: 'self' },
  rarity: 'uncommon',
  bonusHeal: 3,
}

// ARMS slot: output domain
const pistonArm: EquipmentDefinition = {
  id: 'piston-arm',
  name: 'Piston Arm',
  description: 'Deal 6 damage to one enemy.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 6, targetMode: 'single_enemy' },
  rarity: 'common',
}

const weldingTorch: EquipmentDefinition = {
  id: 'welding-torch',
  name: 'Welding Torch',
  description: 'Deal 3 damage to ALL enemies.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 3, targetMode: 'all_enemies' },
  rarity: 'common',
}

// LEGS slot: flow domain (draw, cycling, block)
const scrapActuators: EquipmentDefinition = {
  id: 'worn-actuators',
  name: 'Scrap Actuators',
  description: 'Gain 2 Block.',
  slot: 'Legs',
  action: { type: 'block', baseValue: 2, targetMode: 'self' },
  rarity: 'common',
}

const salvagedTreads: EquipmentDefinition = {
  id: 'salvaged-treads',
  name: 'Salvaged Treads',
  description: 'Gain 2 Block and draw 1 card.',
  slot: 'Legs',
  action: { type: 'block', baseValue: 2, targetMode: 'self' },
  rarity: 'uncommon',
}

// ─── Archetype Equipment (reworked to unconditional) ─────────────────────────

const calibratedOptics: EquipmentDefinition = {
  id: 'calibrated-optics',
  name: 'Calibrated Optics',
  description: 'Draw 2 cards.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 2, targetMode: 'self' },
  rarity: 'uncommon',
}

const thermalPlating: EquipmentDefinition = {
  id: 'thermal-plating',
  name: 'Thermal Plating',
  description: 'Gain 5 Block.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 5, targetMode: 'self' },
  rarity: 'uncommon',
}

const overclockedPistons: EquipmentDefinition = {
  id: 'overclocked-pistons',
  name: 'Overclocked Pistons',
  description: 'Deal 8 damage to one enemy.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 8, targetMode: 'single_enemy' },
  rarity: 'uncommon',
}

const adaptiveTreads: EquipmentDefinition = {
  id: 'adaptive-treads',
  name: 'Adaptive Treads',
  description: 'Draw 2 cards.',
  slot: 'Legs',
  action: { type: 'draw', baseValue: 2, targetMode: 'self' },
  rarity: 'uncommon',
}

// ─── Tradeoff Equipment ────────────────────────────────────────────────────

// ARMS uncommon: 5 dmg all, lose 2 Block on fire
const shrapnelLauncher: EquipmentDefinition = {
  id: 'shrapnel-launcher',
  name: 'Shrapnel Launcher',
  description: 'Deal 5 damage to ALL enemies. Lose 2 Block.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 5, targetMode: 'all_enemies' },
  rarity: 'uncommon',
  blockCost: 2,
}

// ARMS rare: 12 dmg single (formerly Cool-only, now unconditional)
const cryoCannon: EquipmentDefinition = {
  id: 'cryo-cannon',
  name: 'Cryo Cannon',
  description: 'Deal 12 damage to one enemy.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 12, targetMode: 'single_enemy' },
  rarity: 'rare',
}

// ARMS rare: 6 dmg all (formerly multi-fire while Hot, now flat AoE)
const meltdownCannon: EquipmentDefinition = {
  id: 'meltdown-cannon',
  name: 'Meltdown Cannon',
  description: 'Deal 6 damage to ALL enemies.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 6, targetMode: 'all_enemies' },
  rarity: 'rare',
}

// HEAD uncommon: draw 1 + foresight 1
const tacticalVisor: EquipmentDefinition = {
  id: 'tactical-visor',
  name: 'Tactical Visor',
  description: 'Draw 1 card. Reveal 1 extra enemy intent.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 1, targetMode: 'self' },
  rarity: 'uncommon',
  bonusForesight: 1,
}

// HEAD rare: draw 2 + foresight 1
const neuralSync: EquipmentDefinition = {
  id: 'neural-sync',
  name: 'Neural Sync',
  description: 'Draw 2 cards. Reveal 1 extra enemy intent.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 2, targetMode: 'self' },
  rarity: 'rare',
  bonusForesight: 1,
}

// HEAD rare: draw 2 (formerly draw 1/3 conditional on Hot)
const pyroclastScanner: EquipmentDefinition = {
  id: 'pyroclast-scanner',
  name: 'Pyroclast Scanner',
  description: 'Draw 2 cards.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 2, targetMode: 'self' },
  rarity: 'rare',
}

// TORSO rare: 6 Block, no conditions
const ablativePlates: EquipmentDefinition = {
  id: 'ablative-plates',
  name: 'Ablative Plates',
  description: 'Gain 6 Block.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 6, targetMode: 'self' },
  rarity: 'rare',
}

// TORSO rare: 4 Block + heal 2 (formerly Cool-conditional heal, now unconditional)
const cryoShell: EquipmentDefinition = {
  id: 'cryo-shell',
  name: 'Cryo Shell',
  description: 'Gain 4 Block. Heal 2 HP.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 4, targetMode: 'self' },
  rarity: 'rare',
  bonusHeal: 2,
}

// LEGS rare: gain 5 Block + draw 1 (formerly cooling + Cool block)
const cryoLock: EquipmentDefinition = {
  id: 'cryo-lock',
  name: 'Cryo Lock',
  description: 'Gain 5 Block. Draw 1 card.',
  slot: 'Legs',
  action: { type: 'block', baseValue: 5, targetMode: 'self' },
  rarity: 'rare',
}

// LEGS rare: draw 2 + gain 2 Block (formerly cooling + Hot cooling)
const thermalExhaust: EquipmentDefinition = {
  id: 'thermal-exhaust',
  name: 'Thermal Exhaust',
  description: 'Draw 2 cards. Gain 2 Block.',
  slot: 'Legs',
  action: { type: 'draw', baseValue: 2, targetMode: 'self' },
  rarity: 'rare',
}

// ─── Sector 2 Equipment ────────────────────────────────────────────────────

// HEAD slot
const thermalImager: EquipmentDefinition = {
  id: 'thermal-imager',
  name: 'Thermal Imager',
  description: 'Draw 2 cards.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 2, targetMode: 'self' },
  rarity: 'uncommon',
}

// HEAD rare: draw 2 (formerly draw 1/2 conditional on Cool)
const predictiveArray: EquipmentDefinition = {
  id: 'predictive-array',
  name: 'Predictive Array',
  description: 'Draw 2 cards.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 2, targetMode: 'self' },
  rarity: 'rare',
}

// TORSO slot
const reactivePlating: EquipmentDefinition = {
  id: 'reactive-plating',
  name: 'Reactive Plating',
  description: 'Gain 5 Block.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 5, targetMode: 'self' },
  rarity: 'uncommon',
}

// TORSO rare: 7 Block (formerly 3/7 conditional on Hot)
const heatShield: EquipmentDefinition = {
  id: 'heat-shield',
  name: 'Heat Shield',
  description: 'Gain 7 Block.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 7, targetMode: 'self' },
  rarity: 'rare',
}

// ARMS slot
const plasmaCutter: EquipmentDefinition = {
  id: 'plasma-cutter',
  name: 'Plasma Cutter',
  description: 'Deal 10 damage to one enemy.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 10, targetMode: 'single_enemy' },
  rarity: 'uncommon',
}

const arcWelder: EquipmentDefinition = {
  id: 'arc-welder',
  name: 'Arc Welder',
  description: 'Deal 5 damage to ALL enemies. Apply 1 Weak.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 5, targetMode: 'all_enemies' },
  rarity: 'rare',
}

// LEGS slot: flow domain (formerly cooling)
const hydraulicPump: EquipmentDefinition = {
  id: 'coolant-injector',
  name: 'Hydraulic Pump',
  description: 'Draw 1 card. Gain 3 Block.',
  slot: 'Legs',
  action: { type: 'draw', baseValue: 1, targetMode: 'self' },
  rarity: 'uncommon',
}

// LEGS rare: draw 2 + 3 Block (formerly cooling + block per heat)
const stabilizerTreads: EquipmentDefinition = {
  id: 'stabilizer-treads',
  name: 'Stabilizer Treads',
  description: 'Draw 2 cards. Gain 3 Block.',
  slot: 'Legs',
  action: { type: 'draw', baseValue: 2, targetMode: 'self' },
  rarity: 'rare',
}

// ─── Sector 1 Behavioral Parts ──────────────────────────────────────────────

const frostCore: BehavioralPartDefinition = {
  id: 'frost-core',
  name: 'Frost Core',
  description: 'Gain 2 Block at turn start.',
  trigger: { type: 'onTurnStart' },
  effect: { type: 'bonusBlock', value: 2 },
  rarity: 'uncommon',
}

const scrapRecycler: BehavioralPartDefinition = {
  id: 'scrap-recycler',
  name: 'Scrap Recycler',
  description: 'When a card is Exhausted, gain 2 Block.',
  trigger: { type: 'onCardExhaust' },
  effect: { type: 'bonusBlock', value: 2 },
  rarity: 'uncommon',
}

const ablativeShell: BehavioralPartDefinition = {
  id: 'ablative-shell',
  name: 'Ablative Shell',
  description: 'The first hit each combat dealing 8+ damage is halved.',
  trigger: { type: 'onDamageTaken' },
  effect: { type: 'halveLargeDamage', threshold: 8 },
  rarity: 'uncommon',
}

// Pressure Valve removed — onWouldOverheat trigger no longer exists
// Flux Capacitor removed — onThresholdCross trigger no longer exists

const thornsCore: BehavioralPartDefinition = {
  id: 'thorns-core',
  name: 'Thorns Core',
  description: 'When you take damage, deal 3 damage to the attacker.',
  trigger: { type: 'onDamageTaken' },
  effect: { type: 'thorns', value: 3 },
  rarity: 'uncommon',
}

const slagCompressor: BehavioralPartDefinition = {
  id: 'slag-compressor',
  name: 'Slag Compressor',
  description: 'When ARMS fires, deal bonus damage equal to cards in your Exhaust pile.',
  trigger: { type: 'onSlotFire', slot: 'Arms' },
  effect: { type: 'damagePerExhausted' },
  rarity: 'uncommon',
}

// ─── Sector 2 Behavioral Parts ──────────────────────────────────────────────

const reactiveFrame: BehavioralPartDefinition = {
  id: 'reactive-frame',
  name: 'Reactive Frame',
  description: 'When ARMS fires, deal 2 bonus damage.',
  trigger: { type: 'onSlotFire', slot: 'Arms' },
  effect: { type: 'bonusDamage', value: 2 },
  rarity: 'rare',
}

const voltageCore: BehavioralPartDefinition = {
  id: 'voltage-core',
  name: 'Voltage Core',
  description: 'When you take damage, deal damage equal to block consumed back to the attacker.',
  trigger: { type: 'onDamageTaken' },
  effect: { type: 'voltageCounter' },
  rarity: 'rare',
}

const salvageProtocol: BehavioralPartDefinition = {
  id: 'salvage-protocol',
  name: 'Salvage Protocol',
  description: 'Disabled slots generate 5 Block instead of doing nothing.',
  trigger: { type: 'onSlotFire', slot: 'Head' }, // checked during execution
  effect: { type: 'blockForDisabledSlots', value: 5 },
  rarity: 'uncommon',
}

const emptyChamber: BehavioralPartDefinition = {
  id: 'empty-chamber',
  name: 'Empty Chamber',
  description: 'When you Execute, gain 2 Block per unplayed card in hand.',
  trigger: { type: 'onPlanningEnd' },
  effect: { type: 'blockPerUnplayedCard', value: 2 },
  rarity: 'uncommon',
}

const failsafeArmor: BehavioralPartDefinition = {
  id: 'failsafe-armor',
  name: 'Failsafe Armor',
  description: 'At the start of each turn, gain Block equal to cards in your Exhaust pile.',
  trigger: { type: 'onTurnStart' },
  effect: { type: 'blockPerExhausted' },
  rarity: 'uncommon',
}

const cryoEngine: BehavioralPartDefinition = {
  id: 'cryo-engine',
  name: 'Cryo Engine',
  description: 'When you play a card, gain 1 Block.',
  trigger: { type: 'onCardPlay' },
  effect: { type: 'blockPerCard', value: 1 },
  rarity: 'rare',
}

const gyroStabilizer: BehavioralPartDefinition = {
  id: 'gyro-stabilizer',
  name: 'Gyro Stabilizer',
  description: 'When you play a card, deal 2 damage to a random enemy.',
  trigger: { type: 'onCardPlay' },
  effect: { type: 'damageRandomEnemy', value: 2 },
  rarity: 'rare',
}

const meltdownCorePart: BehavioralPartDefinition = {
  id: 'meltdown-core',
  name: 'Meltdown Core',
  description: 'Slot modifiers get +50% bonus to effect values.',
  trigger: { type: 'onSlotFire', slot: 'Head' }, // checked during execution
  effect: { type: 'amplifyModifiers', multiplier: 1.5 },
  rarity: 'rare',
}

// Zero Point Field removed — reduceCardHeatCosts effect no longer exists
// Thermal Oscillator removed — onThresholdCross trigger no longer exists
// Volatile Reactor removed — onThresholdCross trigger no longer exists

// ─── Run-Warping Rare Parts ─────────────────────────────────────────────────

// Dual Loader deferred to Sector 3
// Thermal Damper removed — heatLock effect no longer exists
// Overheat Reactor removed — overheatReactor effect no longer exists

// ─── Exports ────────────────────────────────────────────────────────────────

export const EQUIPMENT: EquipmentDefinition[] = [
  // Sector 1 (common)
  basicScanner, crackedLens,
  scrapPlating, patchedHull,
  pistonArm, weldingTorch,
  scrapActuators, salvagedTreads,
  // Archetype (uncommon)
  calibratedOptics, thermalPlating,
  overclockedPistons, adaptiveTreads,
  // Tradeoff (uncommon + rare)
  shrapnelLauncher, tacticalVisor,
  cryoCannon, meltdownCannon,
  neuralSync, pyroclastScanner,
  ablativePlates, cryoShell,
  cryoLock, thermalExhaust,
  // Sector 2
  thermalImager, predictiveArray,
  reactivePlating, heatShield,
  plasmaCutter, arcWelder,
  hydraulicPump, stabilizerTreads,
]

export const SECTOR1_PART_POOL: BehavioralPartDefinition[] = [
  frostCore, scrapRecycler, ablativeShell, thornsCore, slagCompressor,
]

export const SECTOR2_PART_POOL: BehavioralPartDefinition[] = [
  reactiveFrame,
  salvageProtocol, emptyChamber,
  failsafeArmor, cryoEngine, gyroStabilizer, meltdownCorePart,
  voltageCore,
]

export const RUN_WARPING_PARTS: BehavioralPartDefinition[] = [
  // All run-warping parts removed (heat-dependent)
]

export const BEHAVIORAL_PARTS: BehavioralPartDefinition[] = [
  ...SECTOR1_PART_POOL,
  ...SECTOR2_PART_POOL,
  ...RUN_WARPING_PARTS,
]

const S1_PART_IDS = new Set(SECTOR1_PART_POOL.map(p => p.id))

/** Get the sector a part belongs to based on pool membership (not where it dropped). */
export function getPartSector(partId: string): 1 | 2 {
  return S1_PART_IDS.has(partId) ? 1 : 2
}

export const ALL_EQUIPMENT: Record<string, EquipmentDefinition> = Object.fromEntries(
  EQUIPMENT.map((e) => [e.id, e])
)

export const ALL_PARTS: Record<string, BehavioralPartDefinition> = Object.fromEntries(
  BEHAVIORAL_PARTS.map((p) => [p.id, p])
)

// Starting equipment
export const STARTING_HEAD = basicScanner
export const STARTING_TORSO = scrapPlating
export const STARTING_ARMS = pistonArm
export const STARTING_LEGS = scrapActuators

// Legacy aliases for old components that haven't been updated yet
export const PARTS = BEHAVIORAL_PARTS
export const EQUIPABLES = EQUIPMENT
