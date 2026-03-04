import type { PartDefinition, EquipableDefinition } from '../game/types'

// ─── Parts (passive identity) ────────────────────────────────────────────────

export const PARTS: PartDefinition[] = [
  {
    id: 'salvaged-plating',
    name: 'Salvaged Plating',
    description: 'Gain 10 max health.',
    effects: [{ type: 'maxHealth', value: 10 }],
    rarity: 'common',
  },
  {
    id: 'reinforced-joints',
    name: 'Reinforced Joints',
    description: 'Gain 1 extra energy per turn.',
    effects: [{ type: 'energyCap', value: 1 }],
    rarity: 'uncommon',
  },
  {
    id: 'optical-expander',
    name: 'Optical Expander',
    description: 'Draw 1 extra card each turn.',
    effects: [{ type: 'drawCount', value: 1 }],
    rarity: 'uncommon',
  },
  {
    id: 'reactive-frame',
    name: 'Reactive Frame',
    description: 'Gain 2 Block at the start of each turn.',
    effects: [{ type: 'blockOnTurnStart', value: 2 }],
    rarity: 'common',
  },
  {
    id: 'worn-chassis',
    name: 'Worn Chassis',
    description: 'Gain 20 max health.',
    effects: [{ type: 'maxHealth', value: 20 }],
    rarity: 'rare',
  },
  {
    id: 'energy-coil',
    name: 'Energy Coil',
    description: 'Gain 2 extra energy per turn.',
    effects: [{ type: 'energyCap', value: 2 }],
    rarity: 'rare',
  },
  {
    id: 'scavenger-lens',
    name: 'Scavenger Lens',
    description: 'Earn 20% more shards from enemies.',
    effects: [{ type: 'shardBonus', value: 20 }],
    rarity: 'common',
  },
  {
    id: 'tension-spring',
    name: 'Tension Spring',
    description: 'Gain 1 Strength permanently.',
    effects: [{ type: 'strengthBonus', value: 1 }],
    rarity: 'uncommon',
  },
]

// ─── Equipables (active expression) ─────────────────────────────────────────

export const EQUIPABLES: EquipableDefinition[] = [
  {
    id: 'combat-visor',
    name: 'Combat Visor',
    description: 'Gain 1 Strength. Active: Deal 5 damage to all enemies (cooldown: 3 turns).',
    slot: 'Head',
    statEffects: [{ type: 'strengthBonus', value: 1 }],
    skill: {
      name: 'Target Lock',
      description: 'Deal 5 damage to all enemies.',
      cooldown: 3,
      effect: { type: 'damage', value: 5, target: 'all_enemies' },
    },
    rarity: 'common',
  },
  {
    id: 'shield-matrix',
    name: 'Shield Matrix',
    description: 'Gain 5 max health. Active: Gain 8 Block (cooldown: 2 turns).',
    slot: 'Torso',
    statEffects: [{ type: 'maxHealth', value: 5 }],
    skill: {
      name: 'Surge Shield',
      description: 'Gain 8 Block.',
      cooldown: 2,
      effect: { type: 'block', value: 8, target: 'self' },
    },
    rarity: 'common',
  },
  {
    id: 'striking-arms',
    name: 'Striking Arms',
    description: 'Gain 1 Strength. Active: Deal 12 damage (cooldown: 2 turns).',
    slot: 'Arms',
    statEffects: [{ type: 'strengthBonus', value: 1 }],
    skill: {
      name: 'Heavy Strike',
      description: 'Deal 12 damage.',
      cooldown: 2,
      effect: { type: 'damage', value: 12, target: 'enemy' },
    },
    rarity: 'uncommon',
  },
  {
    id: 'stride-actuators',
    name: 'Stride Actuators',
    description: 'Draw 1 extra card each turn. Active: Draw 2 cards (cooldown: 3 turns).',
    slot: 'Legs',
    statEffects: [{ type: 'drawCount', value: 1 }],
    skill: {
      name: 'Quick Step',
      description: 'Draw 2 cards.',
      cooldown: 3,
      effect: { type: 'draw', value: 2, target: 'self' },
    },
    rarity: 'uncommon',
  },
]

export const ALL_PARTS = Object.fromEntries(PARTS.map((p) => [p.id, p]))
export const ALL_EQUIPABLES = Object.fromEntries(EQUIPABLES.map((e) => [e.id, e]))
