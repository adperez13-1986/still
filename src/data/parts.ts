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

// ─── Exports ────────────────────────────────────────────────────────────────

export const EQUIPMENT: EquipmentDefinition[] = [
  basicScanner, crackedLens,
  scrapPlating, patchedHull,
  pistonArm, weldingTorch,
  wornActuators, salvagedTreads,
]

export const BEHAVIORAL_PARTS: BehavioralPartDefinition[] = [
  salvagedPlating, tensionSpring, reactiveFrame, opticalExpander,
  coolingFins, reinforcedJoints, scavengerLens, heatSink,
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
