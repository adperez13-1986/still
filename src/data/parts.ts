import type { EquipmentDefinition, BehavioralPartDefinition } from '../game/types'

// ─── Equipment Definitions (Tasks 3.1-3.4) ──────────────────────────────────

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

// LEGS slot: flow domain
const wornActuators: EquipmentDefinition = {
  id: 'worn-actuators',
  name: 'Scrap Actuators',
  description: 'Lose 1 Heat.',
  slot: 'Legs',
  action: { type: 'coolHeat', baseValue: 1, targetMode: 'self' },
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

// ─── Archetype Equipment ────────────────────────────────────────────────────

const calibratedOptics: EquipmentDefinition = {
  id: 'calibrated-optics',
  name: 'Calibrated Optics',
  description: 'Draw 1 card. While Cool: draw 2.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 1, targetMode: 'self' },
  rarity: 'uncommon',
  heatBonusThreshold: 'Cool',
  heatBonusValue: 1,
}

const thermalPlating: EquipmentDefinition = {
  id: 'thermal-plating',
  name: 'Thermal Plating',
  description: 'Gain 3 Block. While Hot: gain 5.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 3, targetMode: 'self' },
  rarity: 'uncommon',
  heatBonusThreshold: 'Hot',
  heatBonusValue: 2,
}

const overclockedPistons: EquipmentDefinition = {
  id: 'overclocked-pistons',
  name: 'Overclocked Pistons',
  description: 'Deal 8 damage. Generates +1 Heat.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 8, targetMode: 'single_enemy' },
  rarity: 'uncommon',
  extraHeatGenerated: 1,
}

const adaptiveTreads: EquipmentDefinition = {
  id: 'adaptive-treads',
  name: 'Adaptive Treads',
  description: 'Lose 2 Heat. Gain 1 Block per heat lost.',
  slot: 'Legs',
  action: { type: 'coolHeat', baseValue: 2, targetMode: 'self' },
  rarity: 'uncommon',
  bonusBlockPerHeatLost: 1,
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

// ARMS rare: 12 dmg single, only while Cool
const cryoCannon: EquipmentDefinition = {
  id: 'cryo-cannon',
  name: 'Cryo Cannon',
  description: 'Deal 12 damage to one enemy. Only fires while Cool.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 12, targetMode: 'single_enemy' },
  rarity: 'rare',
  heatConditionOnly: 'Cool',
}

// ARMS rare: 4 dmg all, fires twice while Hot
const meltdownCannon: EquipmentDefinition = {
  id: 'meltdown-cannon',
  name: 'Meltdown Cannon',
  description: 'Deal 4 damage to ALL enemies. Fires twice while Hot.',
  slot: 'Arms',
  action: { type: 'damage', baseValue: 4, targetMode: 'all_enemies' },
  rarity: 'rare',
  multiFire: { threshold: 'Hot', extraFirings: 1 },
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

// HEAD rare: draw 1, draw 3 while Hot
const pyroclastScanner: EquipmentDefinition = {
  id: 'pyroclast-scanner',
  name: 'Pyroclast Scanner',
  description: 'Draw 1 card. While Hot: draw 3.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 1, targetMode: 'self' },
  rarity: 'rare',
  heatBonusThreshold: 'Hot',
  heatBonusValue: 2,
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

// TORSO rare: 4 Block, heal 2 while Cool
const cryoShell: EquipmentDefinition = {
  id: 'cryo-shell',
  name: 'Cryo Shell',
  description: 'Gain 4 Block. While Cool: also heal 2.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 4, targetMode: 'self' },
  rarity: 'rare',
  heatBonusThreshold: 'Cool',
  bonusHeal: 2,
}

// LEGS rare: -1 Heat, +5 Block while Cool
const cryoLock: EquipmentDefinition = {
  id: 'cryo-lock',
  name: 'Cryo Lock',
  description: 'Lose 1 Heat. While Cool: gain 5 Block.',
  slot: 'Legs',
  action: { type: 'coolHeat', baseValue: 1, targetMode: 'self' },
  rarity: 'rare',
  heatBonusThreshold: 'Cool',
  heatBonusBlock: 5,
}

// LEGS rare: -1 Heat, -3 Heat while Hot
const thermalExhaust: EquipmentDefinition = {
  id: 'thermal-exhaust',
  name: 'Thermal Exhaust',
  description: 'Lose 1 Heat. While Hot: lose 3 Heat.',
  slot: 'Legs',
  action: { type: 'coolHeat', baseValue: 1, targetMode: 'self' },
  rarity: 'rare',
  heatBonusThreshold: 'Hot',
  heatBonusValue: 2,
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

const predictiveArray: EquipmentDefinition = {
  id: 'predictive-array',
  name: 'Predictive Array',
  description: 'Draw 1 card. While Cool: draw 2.',
  slot: 'Head',
  action: { type: 'draw', baseValue: 1, targetMode: 'self' },
  rarity: 'rare',
  heatBonusThreshold: 'Cool',
  heatBonusValue: 1,
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

const heatShield: EquipmentDefinition = {
  id: 'heat-shield',
  name: 'Heat Shield',
  description: 'Gain 3 Block. While Hot: gain 7.',
  slot: 'Torso',
  action: { type: 'block', baseValue: 3, targetMode: 'self' },
  rarity: 'rare',
  heatBonusThreshold: 'Hot',
  heatBonusValue: 4,
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

// LEGS slot
const coolantInjector: EquipmentDefinition = {
  id: 'coolant-injector',
  name: 'Coolant Injector',
  description: 'Lose 2 Heat.',
  slot: 'Legs',
  action: { type: 'coolHeat', baseValue: 2, targetMode: 'self' },
  rarity: 'uncommon',
}

const stabilizerTreads: EquipmentDefinition = {
  id: 'stabilizer-treads',
  name: 'Stabilizer Treads',
  description: 'Lose 1 Heat. Gain 3 Block per heat lost.',
  slot: 'Legs',
  action: { type: 'coolHeat', baseValue: 1, targetMode: 'self' },
  rarity: 'rare',
  bonusBlockPerHeatLost: 3,
}

// ─── Sector 1 Behavioral Parts ──────────────────────────────────────────────

// Feedback Loop and Residual Charge removed — passive cooling undermines planning-authority heat model

const frostCore: BehavioralPartDefinition = {
  id: 'frost-core',
  name: 'Frost Core',
  description: 'While Cool: gain 2 Block at turn start.',
  trigger: { type: 'onTurnStart' },
  effect: { type: 'bonusBlock', value: 2 },
  rarity: 'uncommon',
  heatCondition: 'Cool',
}

const scrapRecycler: BehavioralPartDefinition = {
  id: 'scrap-recycler',
  name: 'Scrap Recycler',
  description: 'When a card is Exhausted, gain 4 Block.',
  trigger: { type: 'onCardExhaust' },
  effect: { type: 'bonusBlock', value: 4 },
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

// Momentum Core removed — "all 4 slots fire" is unconditional now that all slots start equipped.
// Revisit with a new condition (e.g., "played 2 or fewer cards") when Cool Runner identity is clearer.
// { id: 'momentum-core', name: 'Momentum Core', description: 'If all 4 body slots fire, +3 Block + draw 1', rarity: 'uncommon' }

const pressureValve: BehavioralPartDefinition = {
  id: 'pressure-valve',
  name: 'Pressure Valve',
  description: 'When Heat reaches 10+, set Heat to 7 and deal 5 damage to all enemies.',
  trigger: { type: 'onWouldOverheat' },
  effect: { type: 'preventOverheat', setHeat: 7, damage: 5 },
  rarity: 'uncommon',
}

const reactiveFrame: BehavioralPartDefinition = {
  id: 'reactive-frame',
  name: 'Reactive Frame',
  description: 'When Warm+, ARMS fires an extra time.',
  trigger: { type: 'onHeatThreshold', threshold: 'Warm' },
  effect: { type: 'extraFiring', slot: 'Arms' },
  rarity: 'rare',
}

const fluxCapacitor: BehavioralPartDefinition = {
  id: 'flux-capacitor',
  name: 'Flux Capacitor',
  description: 'When heat crosses a threshold, draw 1 card.',
  trigger: { type: 'onThresholdCross' },
  effect: { type: 'drawCards', count: 1 },
  rarity: 'rare',
}

// ─── Sector 2 Behavioral Parts ──────────────────────────────────────────────

const zeroPointField: BehavioralPartDefinition = {
  id: 'zero-point-field',
  name: 'Zero Point Field',
  description: 'At turn start, if Cool: cards cost 1 less Heat this turn (min 0).',
  trigger: { type: 'onTurnStart' },
  effect: { type: 'reduceCardHeatCosts', value: 1 },
  rarity: 'uncommon',
  heatCondition: 'Cool',
}

const salvageProtocol: BehavioralPartDefinition = {
  id: 'salvage-protocol',
  name: 'Salvage Protocol',
  description: 'Disabled slots generate 5 Block instead of doing nothing.',
  trigger: { type: 'onSlotFire', slot: 'Head' }, // checked during execution
  effect: { type: 'blockForDisabledSlots', value: 5 },
  rarity: 'uncommon',
}

const thermalOscillator: BehavioralPartDefinition = {
  id: 'thermal-oscillator',
  name: 'Thermal Oscillator',
  description: 'When heat crosses a threshold, gain 3 Block and deal 3 damage to all enemies.',
  trigger: { type: 'onThresholdCross' },
  effect: { type: 'bonusBlock', value: 3 },
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
  description: 'While Cool: gain 1 Block for each card you play.',
  trigger: { type: 'onCardPlay' },
  effect: { type: 'blockPerCard', value: 1 },
  rarity: 'rare',
  heatCondition: 'Cool',
}

const gyroStabilizer: BehavioralPartDefinition = {
  id: 'gyro-stabilizer',
  name: 'Gyro Stabilizer',
  description: 'While Warm: whenever you play a card, deal 2 damage to a random enemy.',
  trigger: { type: 'onCardPlay' },
  effect: { type: 'damageRandomEnemy', value: 2 },
  rarity: 'rare',
  heatCondition: 'Warm',
}

const meltdownCore: BehavioralPartDefinition = {
  id: 'meltdown-core',
  name: 'Meltdown Core',
  description: 'While Hot: slot modifiers get +50% bonus to effect values.',
  trigger: { type: 'onSlotFire', slot: 'Head' }, // checked during execution
  effect: { type: 'amplifyModifiers', multiplier: 1.5 },
  rarity: 'rare',
  heatCondition: 'Hot',
}

const volatileReactor: BehavioralPartDefinition = {
  id: 'volatile-reactor',
  name: 'Volatile Reactor',
  description: 'When heat crosses a threshold, draw 1 card and deal +3 bonus damage on next ARMS fire.',
  trigger: { type: 'onThresholdCross' },
  effect: { type: 'drawCards', count: 1 },
  rarity: 'rare',
}

// ─── Run-Warping Rare Parts ─────────────────────────────────────────────────

// Dual Loader deferred to Sector 3
// { id: 'dual-loader', name: 'Dual Loader', description: 'You can assign 2 modifiers to the same slot.', rarity: 'rare' }

const thermalDamper: BehavioralPartDefinition = {
  id: 'thermal-damper',
  name: 'Thermal Damper',
  description: 'At the start of each combat, heat is locked for 2 turns. Deferred heat applies all at once when the lock expires.',
  trigger: { type: 'onCombatStart' },
  effect: { type: 'heatLock', turns: 2 },
  rarity: 'rare',
}

const overheatReactor: BehavioralPartDefinition = {
  id: 'overheat-reactor',
  name: 'Overheat Reactor',
  description: 'When Heat reaches 10+, all slots deal 2x damage this turn, heat resets to 5, max HP permanently reduced by 5.',
  trigger: { type: 'onWouldOverheat' },
  effect: { type: 'overheatReactor', heatReset: 5, maxHpCost: 5 },
  rarity: 'rare',
}

// Perpetual Core removed — mid-turn reshuffle is now default behavior

// ─── Exports ────────────────────────────────────────────────────────────────

export const EQUIPMENT: EquipmentDefinition[] = [
  // Sector 1 (common)
  basicScanner, crackedLens,
  scrapPlating, patchedHull,
  pistonArm, weldingTorch,
  wornActuators, salvagedTreads,
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
  coolantInjector, stabilizerTreads,
]

export const SECTOR1_PART_POOL: BehavioralPartDefinition[] = [
  frostCore, scrapRecycler, ablativeShell,
  pressureValve, fluxCapacitor,
]

export const SECTOR2_PART_POOL: BehavioralPartDefinition[] = [
  reactiveFrame,
  zeroPointField, salvageProtocol, thermalOscillator, emptyChamber,
  failsafeArmor, cryoEngine, gyroStabilizer, meltdownCore, volatileReactor,
]

// Dual Loader deferred to Sector 3 — too powerful with current slot modifier system
export const RUN_WARPING_PARTS: BehavioralPartDefinition[] = [
  thermalDamper, overheatReactor,
]

export const BEHAVIORAL_PARTS: BehavioralPartDefinition[] = [
  ...SECTOR1_PART_POOL,
  ...SECTOR2_PART_POOL,
  ...RUN_WARPING_PARTS,
]

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
export const STARTING_LEGS = wornActuators

// Legacy aliases for old components that haven't been updated yet
export const PARTS = BEHAVIORAL_PARTS
export const EQUIPABLES = EQUIPMENT
