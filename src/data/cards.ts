import type { CardDefinition } from '../game/types'

// ─── Starting Cards ──────────────────────────────────────────────────────────

const strike: CardDefinition = {
  id: 'strike',
  name: 'Strike',
  type: 'Attack',
  cost: 1,
  description: 'Deal 6 damage.',
  effects: [{ type: 'damage', value: 6, target: 'enemy' }],
  keywords: [],
  upgraded: {
    id: 'strike',
    name: 'Strike+',
    type: 'Attack',
    cost: 1,
    description: 'Deal 9 damage.',
    effects: [{ type: 'damage', value: 9, target: 'enemy' }],
    keywords: [],
  },
}

const brace: CardDefinition = {
  id: 'brace',
  name: 'Brace',
  type: 'Skill',
  cost: 1,
  description: 'Gain 5 Block.',
  effects: [{ type: 'block', value: 5, target: 'self' }],
  keywords: [],
  upgraded: {
    id: 'brace',
    name: 'Brace+',
    type: 'Skill',
    cost: 1,
    description: 'Gain 8 Block.',
    effects: [{ type: 'block', value: 8, target: 'self' }],
    keywords: [],
  },
}

const surge: CardDefinition = {
  id: 'surge',
  name: 'Surge',
  type: 'Skill',
  cost: 0,
  description: 'Draw 2 cards.',
  effects: [{ type: 'draw', value: 2, target: 'self' }],
  keywords: [],
  upgraded: {
    id: 'surge',
    name: 'Surge+',
    type: 'Skill',
    cost: 0,
    description: 'Draw 3 cards.',
    effects: [{ type: 'draw', value: 3, target: 'self' }],
    keywords: [],
  },
}

// ─── Act 1 Card Pool ─────────────────────────────────────────────────────────

const overload: CardDefinition = {
  id: 'overload',
  name: 'Overload',
  type: 'Attack',
  cost: 2,
  description: 'Deal 8 damage. Apply 2 Vulnerable.',
  effects: [
    { type: 'damage', value: 8, target: 'enemy' },
    { type: 'applyStatus', value: 2, target: 'enemy', status: 'Vulnerable' },
  ],
  keywords: [],
  upgraded: {
    id: 'overload',
    name: 'Overload+',
    type: 'Attack',
    cost: 2,
    description: 'Deal 8 damage. Apply 3 Vulnerable.',
    effects: [
      { type: 'damage', value: 8, target: 'enemy' },
      { type: 'applyStatus', value: 3, target: 'enemy', status: 'Vulnerable' },
    ],
    keywords: [],
  },
}

const deflect: CardDefinition = {
  id: 'deflect',
  name: 'Deflect',
  type: 'Attack',
  cost: 1,
  description: 'Absorb the blow. Return it. Gain 5 Block. Deal 5 damage.',
  effects: [
    { type: 'block', value: 5, target: 'self' },
    { type: 'damage', value: 5, target: 'enemy' },
  ],
  keywords: [],
  upgraded: {
    id: 'deflect',
    name: 'Deflect+',
    type: 'Attack',
    cost: 1,
    description: 'Absorb the blow. Return it. Gain 7 Block. Deal 7 damage.',
    effects: [
      { type: 'block', value: 7, target: 'self' },
      { type: 'damage', value: 7, target: 'enemy' },
    ],
    keywords: [],
  },
}

const discharge: CardDefinition = {
  id: 'discharge',
  name: 'Discharge',
  type: 'Attack',
  cost: 1,
  description: 'Release stored energy as a strike. Deal damage equal to your current Block.',
  effects: [{ type: 'damage', value: 0, target: 'enemy' }], // value resolved dynamically
  keywords: [],
  upgraded: {
    id: 'discharge',
    name: 'Discharge+',
    type: 'Attack',
    cost: 0,
    description: 'Release stored energy as a strike. Deal damage equal to your current Block.',
    effects: [{ type: 'damage', value: 0, target: 'enemy' }],
    keywords: [],
  },
}

const volley: CardDefinition = {
  id: 'volley',
  name: 'Volley',
  type: 'Attack',
  cost: 1,
  description: 'Deal 4 damage twice.',
  effects: [
    { type: 'damage', value: 4, target: 'enemy' },
    { type: 'damage', value: 4, target: 'enemy' },
  ],
  keywords: [],
  upgraded: {
    id: 'volley',
    name: 'Volley+',
    type: 'Attack',
    cost: 1,
    description: 'Deal 5 damage twice.',
    effects: [
      { type: 'damage', value: 5, target: 'enemy' },
      { type: 'damage', value: 5, target: 'enemy' },
    ],
    keywords: [],
  },
}

const sweepingBlow: CardDefinition = {
  id: 'sweeping-blow',
  name: 'Sweeping Blow',
  type: 'Attack',
  cost: 1,
  description: 'Deal 4 damage to ALL enemies.',
  effects: [{ type: 'damage', value: 4, target: 'all_enemies' }],
  keywords: [],
  upgraded: {
    id: 'sweeping-blow',
    name: 'Sweeping Blow+',
    type: 'Attack',
    cost: 1,
    description: 'Deal 6 damage to ALL enemies.',
    effects: [{ type: 'damage', value: 6, target: 'all_enemies' }],
    keywords: [],
  },
}

const fortify: CardDefinition = {
  id: 'fortify',
  name: 'Fortify',
  type: 'Skill',
  cost: 1,
  description: 'Gain 12 Block.',
  effects: [{ type: 'block', value: 12, target: 'self' }],
  keywords: [],
  upgraded: {
    id: 'fortify',
    name: 'Fortify+',
    type: 'Skill',
    cost: 1,
    description: 'Gain 16 Block.',
    effects: [{ type: 'block', value: 16, target: 'self' }],
    keywords: [],
  },
}

const refocus: CardDefinition = {
  id: 'refocus',
  name: 'Refocus',
  type: 'Skill',
  cost: 1,
  description: 'Gain 1 Energy. Draw 1 card.',
  effects: [
    { type: 'energy', value: 1, target: 'self' },
    { type: 'draw', value: 1, target: 'self' },
  ],
  keywords: [],
  upgraded: {
    id: 'refocus',
    name: 'Refocus+',
    type: 'Skill',
    cost: 0,
    description: 'Gain 1 Energy. Draw 1 card.',
    effects: [
      { type: 'energy', value: 1, target: 'self' },
      { type: 'draw', value: 1, target: 'self' },
    ],
    keywords: [],
  },
}

const replenish: CardDefinition = {
  id: 'replenish',
  name: 'Replenish',
  type: 'Skill',
  cost: 2,
  description: 'Heal 8 health.',
  effects: [{ type: 'heal', value: 8, target: 'self' }],
  keywords: [],
  upgraded: {
    id: 'replenish',
    name: 'Replenish+',
    type: 'Skill',
    cost: 1,
    description: 'Heal 8 health.',
    effects: [{ type: 'heal', value: 8, target: 'self' }],
    keywords: [],
  },
}

const corrode: CardDefinition = {
  id: 'corrode',
  name: 'Corrode',
  type: 'Skill',
  cost: 1,
  description: 'Apply 3 Weak to an enemy.',
  effects: [{ type: 'applyStatus', value: 3, target: 'enemy', status: 'Weak' }],
  keywords: [],
  upgraded: {
    id: 'corrode',
    name: 'Corrode+',
    type: 'Skill',
    cost: 1,
    description: 'Apply 4 Weak to an enemy.',
    effects: [{ type: 'applyStatus', value: 4, target: 'enemy', status: 'Weak' }],
    keywords: [],
  },
}

const brace2: CardDefinition = {
  id: 'brace2',
  name: 'Steady',
  type: 'Skill',
  cost: 0,
  description: 'Gain 3 Block. Draw 1 card.',
  effects: [
    { type: 'block', value: 3, target: 'self' },
    { type: 'draw', value: 1, target: 'self' },
  ],
  keywords: [],
  upgraded: {
    id: 'brace2',
    name: 'Steady+',
    type: 'Skill',
    cost: 0,
    description: 'Gain 4 Block. Draw 1 card.',
    effects: [
      { type: 'block', value: 4, target: 'self' },
      { type: 'draw', value: 1, target: 'self' },
    ],
    keywords: [],
  },
}

const momentum: CardDefinition = {
  id: 'momentum',
  name: 'Momentum',
  type: 'Power',
  cost: 2,
  description: 'Gain 1 Strength permanently.',
  effects: [{ type: 'applyStatus', value: 1, target: 'self', status: 'Strength' }],
  keywords: [],
  upgraded: {
    id: 'momentum',
    name: 'Momentum+',
    type: 'Power',
    cost: 1,
    description: 'Gain 1 Strength permanently.',
    effects: [{ type: 'applyStatus', value: 1, target: 'self', status: 'Strength' }],
    keywords: [],
  },
}

const overclock: CardDefinition = {
  id: 'overclock',
  name: 'Overclock',
  type: 'Skill',
  cost: 0,
  description: 'Draw 2 cards. Exhaust.',
  effects: [{ type: 'draw', value: 2, target: 'self' }],
  keywords: ['Exhaust'],
  upgraded: {
    id: 'overclock',
    name: 'Overclock+',
    type: 'Skill',
    cost: 0,
    description: 'Draw 3 cards. Exhaust.',
    effects: [{ type: 'draw', value: 3, target: 'self' }],
    keywords: ['Exhaust'],
  },
}

const adaptation: CardDefinition = {
  id: 'adaptation',
  name: 'Adaptation',
  type: 'Skill',
  cost: 1,
  description: 'Gain Block equal to the number of cards in your hand.',
  effects: [{ type: 'block', value: 0, target: 'self' }], // value resolved dynamically
  keywords: [],
  upgraded: {
    id: 'adaptation',
    name: 'Adaptation+',
    type: 'Skill',
    cost: 0,
    description: 'Gain Block equal to the number of cards in your hand.',
    effects: [{ type: 'block', value: 0, target: 'self' }],
    keywords: [],
  },
}

// ─── Companion Cards ──────────────────────────────────────────────────────────

export const yanah: CardDefinition = {
  id: 'yanah',
  name: 'Yanah',
  type: 'Skill',
  cost: 1,
  description: 'Draw 2 cards. Gain 1 Inspired.',
  effects: [
    { type: 'draw', value: 2, target: 'self' },
    { type: 'applyStatus', value: 1, target: 'self', status: 'Inspired' },
  ],
  keywords: [],
  upgraded: {
    id: 'yanah',
    name: 'Yanah+',
    type: 'Skill',
    cost: 0,
    description: 'Draw 2 cards. Gain 1 Inspired.',
    effects: [
      { type: 'draw', value: 2, target: 'self' },
      { type: 'applyStatus', value: 1, target: 'self', status: 'Inspired' },
    ],
    keywords: [],
  },
}

export const yuri: CardDefinition = {
  id: 'yuri',
  name: 'Yuri',
  type: 'Skill',
  cost: 1,
  description: 'Heal 6 HP. Remove 1 debuff.',
  effects: [
    { type: 'heal', value: 6, target: 'self' },
    { type: 'removeDebuff', value: 1, target: 'self' },
  ],
  keywords: [],
  upgraded: {
    id: 'yuri',
    name: 'Yuri+',
    type: 'Skill',
    cost: 1,
    description: 'Heal 10 HP. Remove 1 debuff.',
    effects: [
      { type: 'heal', value: 10, target: 'self' },
      { type: 'removeDebuff', value: 1, target: 'self' },
    ],
    keywords: [],
  },
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const STARTING_CARDS: CardDefinition[] = [
  strike, strike, strike, strike, strike,
  brace, brace, brace, brace,
  surge,
]

export const ACT1_CARD_POOL: CardDefinition[] = [
  overload, deflect, discharge, volley, sweepingBlow,
  fortify, refocus, replenish, corrode, brace2,
  momentum, overclock, adaptation,
  // Additional basic variants for pool depth
  strike, brace, surge,
]

export const ALL_CARDS: Record<string, CardDefinition> = Object.fromEntries(
  [strike, brace, surge, overload, deflect, discharge, volley, sweepingBlow,
   fortify, refocus, replenish, corrode, brace2, momentum, overclock, adaptation,
   yanah, yuri]
    .map((c) => [c.id, c])
)
