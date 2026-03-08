import type { EquipmentDefinition, BehavioralPartDefinition } from '../game/types'

// ─── Equipment Definitions (Tasks 3.1-3.4) ──────────────────────────────────

// HEAD slot: information domain
const basicScanner: EquipmentDefinition = {
  id: 'basic-scanner',
  name: 'Basic Scanner',
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
  name: 'Worn Actuators',
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

// ─── Behavioral Parts (Task 3.7) ────────────────────────────────────────────

const salvagedPlating: BehavioralPartDefinition = {
  id: 'salvaged-plating',
  name: 'Salvaged Plating',
  description: 'When TORSO fires, gain +2 Block.',
  trigger: { type: 'onSlotFire', slot: 'Torso' },
  effect: { type: 'bonusBlock', value: 2 },
  rarity: 'common',
}

const tensionSpring: BehavioralPartDefinition = {
  id: 'tension-spring',
  name: 'Tension Spring',
  description: 'When you play an Amplify modifier, reduce Heat by 1.',
  trigger: { type: 'onModifierPlay', modifier: 'Amplify' },
  effect: { type: 'reduceHeat', value: 1 },
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

const opticalExpander: BehavioralPartDefinition = {
  id: 'optical-expander',
  name: 'Optical Expander',
  description: 'When HEAD fires, draw 1 extra card.',
  trigger: { type: 'onSlotFire', slot: 'Head' },
  effect: { type: 'drawCards', count: 1 },
  rarity: 'uncommon',
}

const coolingFins: BehavioralPartDefinition = {
  id: 'cooling-fins',
  name: 'Cooling Fins',
  description: 'At the start of each turn, reduce Heat by 1.',
  trigger: { type: 'onTurnStart' },
  effect: { type: 'reduceHeat', value: 1 },
  rarity: 'uncommon',
}

const reinforcedJoints: BehavioralPartDefinition = {
  id: 'reinforced-joints',
  name: 'Reinforced Joints',
  description: 'When ARMS fires, deal +2 bonus damage.',
  trigger: { type: 'onSlotFire', slot: 'Arms' },
  effect: { type: 'bonusDamage', value: 2 },
  rarity: 'common',
}

const scavengerLens: BehavioralPartDefinition = {
  id: 'scavenger-lens',
  name: 'Scavenger Lens',
  description: 'At combat start, draw 1 extra card.',
  trigger: { type: 'onCombatStart' },
  effect: { type: 'drawCards', count: 1 },
  rarity: 'common',
}

const heatSink: BehavioralPartDefinition = {
  id: 'heat-sink',
  name: 'Heat Sink',
  description: 'When LEGS fires, reduce Heat by 1.',
  trigger: { type: 'onSlotFire', slot: 'Legs' },
  effect: { type: 'reduceHeat', value: 1 },
  rarity: 'uncommon',
}

// ─── Sector 2 Behavioral Parts ──────────────────────────────────────────────

const bypassCircuit: BehavioralPartDefinition = {
  id: 'bypass-circuit',
  name: 'Bypass Circuit',
  description: 'When ARMS fires, deal +4 bonus damage.',
  trigger: { type: 'onSlotFire', slot: 'Arms' },
  effect: { type: 'bonusDamage', value: 4 },
  rarity: 'uncommon',
}

const thermalBuffer: BehavioralPartDefinition = {
  id: 'thermal-buffer',
  name: 'Thermal Buffer',
  description: 'At turn start, while Hot: gain +4 Block.',
  trigger: { type: 'onTurnStart' },
  effect: { type: 'bonusBlock', value: 4 },
  rarity: 'uncommon',
  heatCondition: 'Hot',
}

const emergencyDraw: BehavioralPartDefinition = {
  id: 'emergency-draw',
  name: 'Emergency Draw',
  description: 'At turn start, draw 1 extra card.',
  trigger: { type: 'onTurnStart' },
  effect: { type: 'drawCards', count: 1 },
  rarity: 'rare',
}

const siphonCore: BehavioralPartDefinition = {
  id: 'siphon-core',
  name: 'Siphon Core',
  description: 'When LEGS fires, heal 2 HP.',
  trigger: { type: 'onSlotFire', slot: 'Legs' },
  effect: { type: 'bonusHealing', value: 2 },
  rarity: 'uncommon',
}

const hardenedFrame: BehavioralPartDefinition = {
  id: 'hardened-frame',
  name: 'Hardened Frame',
  description: 'When TORSO fires, gain +3 Block.',
  trigger: { type: 'onSlotFire', slot: 'Torso' },
  effect: { type: 'bonusBlock', value: 3 },
  rarity: 'uncommon',
}

const volatileReactor: BehavioralPartDefinition = {
  id: 'volatile-reactor',
  name: 'Volatile Reactor',
  description: 'When heat crosses a threshold, draw 1 card and deal +3 bonus damage on next ARMS fire.',
  trigger: { type: 'onThresholdCross' },
  effect: { type: 'drawCards', count: 1 },
  rarity: 'rare',
}

// ─── Archetype Mods ─────────────────────────────────────────────────────────

const frostCore: BehavioralPartDefinition = {
  id: 'frost-core',
  name: 'Frost Core',
  description: 'At turn start, while Cool: gain +2 Block.',
  trigger: { type: 'onTurnStart' },
  effect: { type: 'bonusBlock', value: 2 },
  rarity: 'uncommon',
  heatCondition: 'Cool',
}

const overheater: BehavioralPartDefinition = {
  id: 'overheater',
  name: 'Overheater',
  description: 'When ARMS fires, while Hot: +3 bonus damage.',
  trigger: { type: 'onSlotFire', slot: 'Arms' },
  effect: { type: 'bonusDamage', value: 3 },
  rarity: 'uncommon',
  heatCondition: 'Hot',
}

const fluxCapacitor: BehavioralPartDefinition = {
  id: 'flux-capacitor',
  name: 'Flux Capacitor',
  description: 'When heat crosses a threshold, draw 1 card.',
  trigger: { type: 'onThresholdCross' },
  effect: { type: 'drawCards', count: 1 },
  rarity: 'rare',
}

// ─── Exports ────────────────────────────────────────────────────────────────

export const EQUIPMENT: EquipmentDefinition[] = [
  basicScanner, crackedLens, calibratedOptics,
  scrapPlating, patchedHull, thermalPlating,
  pistonArm, weldingTorch, overclockedPistons,
  wornActuators, salvagedTreads, adaptiveTreads,
  thermalImager, predictiveArray,
  reactivePlating, heatShield,
  plasmaCutter, arcWelder,
  coolantInjector, stabilizerTreads,
]

export const BEHAVIORAL_PARTS: BehavioralPartDefinition[] = [
  salvagedPlating, tensionSpring, reactiveFrame, opticalExpander,
  coolingFins, reinforcedJoints, scavengerLens, heatSink,
  frostCore, overheater, fluxCapacitor,
  bypassCircuit, thermalBuffer, emergencyDraw,
  siphonCore, hardenedFrame, volatileReactor,
]

export const ALL_EQUIPMENT: Record<string, EquipmentDefinition> = Object.fromEntries(
  EQUIPMENT.map((e) => [e.id, e])
)

export const ALL_PARTS: Record<string, BehavioralPartDefinition> = Object.fromEntries(
  BEHAVIORAL_PARTS.map((p) => [p.id, p])
)

// Starting equipment
export const STARTING_TORSO = scrapPlating
export const STARTING_ARMS = pistonArm // for "Extra Slot" Workshop upgrade

// Legacy aliases for old components that haven't been updated yet
export const PARTS = BEHAVIORAL_PARTS
export const EQUIPABLES = EQUIPMENT
