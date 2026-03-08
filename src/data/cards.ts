import type { ModifierCardDefinition } from '../game/types'

// ─── Starting Modifier Cards ────────────────────────────────────────────────

const boost: ModifierCardDefinition = {
  id: 'boost',
  name: 'Boost',
  description: '+50% to one slot\'s output.',
  heatCost: 1,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'amplify', multiplier: 1.5 },
  },
  keywords: [],
  upgraded: {
    id: 'boost',
    name: 'Boost+',
    description: '+100% to one slot\'s output.',
    heatCost: 1,
    category: {
      type: 'slot',
      modifier: 'Amplify',
      effect: { type: 'amplify', multiplier: 2.0 },
    },
    keywords: [],
  },
}

const emergencyStrike: ModifierCardDefinition = {
  id: 'emergency-strike',
  name: 'Emergency Strike',
  description: 'Override: deal 8 damage to one enemy.',
  heatCost: 2,
  category: {
    type: 'slot',
    modifier: 'Override',
    effect: {
      type: 'override',
      action: { type: 'damage', baseValue: 8, targetMode: 'single_enemy' },
    },
  },
  keywords: [],
  upgraded: {
    id: 'emergency-strike',
    name: 'Emergency Strike+',
    description: 'Override: deal 11 damage to one enemy.',
    heatCost: 2,
    category: {
      type: 'slot',
      modifier: 'Override',
      effect: {
        type: 'override',
        action: { type: 'damage', baseValue: 11, targetMode: 'single_enemy' },
      },
    },
    keywords: [],
  },
}

const coolantFlush: ModifierCardDefinition = {
  id: 'coolant-flush',
  name: 'Coolant Flush',
  description: 'Reduce Heat by 3.',
  heatCost: -3,
  category: {
    type: 'system',
    modifier: 'Cooling',
    effects: [],
  },
  keywords: [],
  upgraded: {
    id: 'coolant-flush',
    name: 'Coolant Flush+',
    description: 'Reduce Heat by 4.',
    heatCost: -4,
    category: {
      type: 'system',
      modifier: 'Cooling',
      effects: [],
    },
    keywords: [],
  },
}

const diagnostics: ModifierCardDefinition = {
  id: 'diagnostics',
  name: 'Diagnostics',
  description: 'Draw 2 modifier cards.',
  heatCost: 1,
  category: {
    type: 'system',
    modifier: 'Draw',
    effects: [{ type: 'draw', count: 2 }],
  },
  keywords: [],
  upgraded: {
    id: 'diagnostics',
    name: 'Diagnostics+',
    description: 'Draw 3 modifier cards.',
    heatCost: 1,
    category: {
      type: 'system',
      modifier: 'Draw',
      effects: [{ type: 'draw', count: 3 }],
    },
    keywords: [],
  },
}

// ─── Sector 1 Modifier Card Pool ───────────────────────────────────────────────

const overcharge: ModifierCardDefinition = {
  id: 'overcharge',
  name: 'Overcharge',
  description: '+100% to one slot\'s output.',
  heatCost: 2,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'amplify', multiplier: 2.0 },
  },
  keywords: [],
  upgraded: {
    id: 'overcharge',
    name: 'Overcharge+',
    description: '+150% to one slot\'s output.',
    heatCost: 2,
    category: {
      type: 'slot',
      modifier: 'Amplify',
      effect: { type: 'amplify', multiplier: 2.5 },
    },
    keywords: [],
  },
}

const spreadShot: ModifierCardDefinition = {
  id: 'spread-shot',
  name: 'Spread Shot',
  description: 'Redirect: slot targets ALL enemies.',
  heatCost: 1,
  category: {
    type: 'slot',
    modifier: 'Redirect',
    effect: { type: 'redirect', targetMode: 'all_enemies' },
  },
  keywords: [],
  upgraded: {
    id: 'spread-shot',
    name: 'Spread Shot+',
    description: 'Redirect: slot targets ALL enemies.',
    heatCost: 0,
    category: {
      type: 'slot',
      modifier: 'Redirect',
      effect: { type: 'redirect', targetMode: 'all_enemies' },
    },
    keywords: [],
  },
}

const echoProtocol: ModifierCardDefinition = {
  id: 'echo-protocol',
  name: 'Echo Protocol',
  description: 'Repeat: slot action fires twice.',
  heatCost: 2,
  category: {
    type: 'slot',
    modifier: 'Repeat',
    effect: { type: 'repeat', extraFirings: 1 },
  },
  keywords: [],
  upgraded: {
    id: 'echo-protocol',
    name: 'Echo Protocol+',
    description: 'Repeat: slot action fires three times.',
    heatCost: 3,
    category: {
      type: 'slot',
      modifier: 'Repeat',
      effect: { type: 'repeat', extraFirings: 2 },
    },
    keywords: [],
  },
}

const shieldBash: ModifierCardDefinition = {
  id: 'shield-bash',
  name: 'Shield Bash',
  description: 'Override: deal 10 damage to one enemy.',
  heatCost: 1,
  category: {
    type: 'slot',
    modifier: 'Override',
    effect: {
      type: 'override',
      action: { type: 'damage', baseValue: 10, targetMode: 'single_enemy' },
    },
  },
  keywords: [],
  upgraded: {
    id: 'shield-bash',
    name: 'Shield Bash+',
    description: 'Override: deal 14 damage to one enemy.',
    heatCost: 1,
    category: {
      type: 'slot',
      modifier: 'Override',
      effect: {
        type: 'override',
        action: { type: 'damage', baseValue: 14, targetMode: 'single_enemy' },
      },
    },
    keywords: [],
  },
}

const emergencyShield: ModifierCardDefinition = {
  id: 'emergency-shield',
  name: 'Emergency Shield',
  description: 'Override: gain 12 Block.',
  heatCost: 1,
  category: {
    type: 'slot',
    modifier: 'Override',
    effect: {
      type: 'override',
      action: { type: 'block', baseValue: 12, targetMode: 'self' },
    },
  },
  keywords: [],
  upgraded: {
    id: 'emergency-shield',
    name: 'Emergency Shield+',
    description: 'Override: gain 16 Block.',
    heatCost: 1,
    category: {
      type: 'slot',
      modifier: 'Override',
      effect: {
        type: 'override',
        action: { type: 'block', baseValue: 16, targetMode: 'self' },
      },
    },
    keywords: [],
  },
}

const deepFreeze: ModifierCardDefinition = {
  id: 'deep-freeze',
  name: 'Deep Freeze',
  description: 'Reduce Heat by 5.',
  heatCost: -5,
  category: {
    type: 'system',
    modifier: 'Cooling',
    effects: [],
  },
  keywords: ['Exhaust'],
  upgraded: {
    id: 'deep-freeze',
    name: 'Deep Freeze+',
    description: 'Reduce Heat by 5. Gain 4 Block.',
    heatCost: -5,
    category: {
      type: 'system',
      modifier: 'Cooling',
      effects: [{ type: 'gainBlock', value: 4 }],
    },
    keywords: ['Exhaust'],
  },
}

const heatVent: ModifierCardDefinition = {
  id: 'heat-vent',
  name: 'Heat Vent',
  description: 'Reduce Heat by 2. Deal 4 damage to all enemies.',
  heatCost: -2,
  category: {
    type: 'system',
    modifier: 'Cooling',
    effects: [{ type: 'damage', value: 4, targetMode: 'all_enemies' }],
  },
  keywords: [],
  upgraded: {
    id: 'heat-vent',
    name: 'Heat Vent+',
    description: 'Reduce Heat by 3. Deal 6 damage to all enemies.',
    heatCost: -3,
    category: {
      type: 'system',
      modifier: 'Cooling',
      effects: [{ type: 'damage', value: 6, targetMode: 'all_enemies' }],
    },
    keywords: [],
  },
}

const quickScan: ModifierCardDefinition = {
  id: 'quick-scan',
  name: 'Quick Scan',
  description: 'Draw 3 cards. Exhaust.',
  heatCost: 1,
  category: {
    type: 'system',
    modifier: 'Draw',
    effects: [{ type: 'draw', count: 3 }],
  },
  keywords: ['Exhaust'],
  upgraded: {
    id: 'quick-scan',
    name: 'Quick Scan+',
    description: 'Draw 4 cards. Exhaust.',
    heatCost: 1,
    category: {
      type: 'system',
      modifier: 'Draw',
      effects: [{ type: 'draw', count: 4 }],
    },
    keywords: ['Exhaust'],
  },
}

const thermalSurge: ModifierCardDefinition = {
  id: 'thermal-surge',
  name: 'Thermal Surge',
  description: 'Requires Warm+. Gain 2 Strength.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' }],
  },
  keywords: [],
  heatCondition: 'Warm',
  upgraded: {
    id: 'thermal-surge',
    name: 'Thermal Surge+',
    description: 'Requires Warm+. Gain 3 Strength.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'applyStatus', status: 'Strength', stacks: 3, target: 'self' }],
    },
    keywords: [],
    heatCondition: 'Warm',
  },
}

const meltdown: ModifierCardDefinition = {
  id: 'meltdown',
  name: 'Meltdown',
  description: 'Requires Hot. Deal 15 damage to one enemy. Exhaust.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'damage', value: 15, targetMode: 'single_enemy' }],
  },
  keywords: ['Exhaust'],
  heatCondition: 'Hot',
  upgraded: {
    id: 'meltdown',
    name: 'Meltdown+',
    description: 'Requires Hot. Deal 20 damage to one enemy. Exhaust.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'damage', value: 20, targetMode: 'single_enemy' }],
    },
    keywords: ['Exhaust'],
    heatCondition: 'Hot',
  },
}

const fieldRepair: ModifierCardDefinition = {
  id: 'field-repair',
  name: 'Field Repair',
  description: 'Heal 6 HP. Reduce Heat by 1.',
  heatCost: -1,
  category: {
    type: 'system',
    modifier: 'Cooling',
    effects: [{ type: 'heal', value: 6 }],
  },
  keywords: [],
  upgraded: {
    id: 'field-repair',
    name: 'Field Repair+',
    description: 'Heal 9 HP. Reduce Heat by 2.',
    heatCost: -2,
    category: {
      type: 'system',
      modifier: 'Cooling',
      effects: [{ type: 'heal', value: 9 }],
    },
    keywords: [],
  },
}

const targetLock: ModifierCardDefinition = {
  id: 'target-lock',
  name: 'Target Lock',
  description: 'Requires Warm+. Apply 2 Vulnerable to all enemies.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'applyStatus', status: 'Vulnerable', stacks: 2, target: 'all_enemies' }],
  },
  keywords: [],
  heatCondition: 'Warm',
  upgraded: {
    id: 'target-lock',
    name: 'Target Lock+',
    description: 'Requires Warm+. Apply 3 Vulnerable to all enemies.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'applyStatus', status: 'Vulnerable', stacks: 3, target: 'all_enemies' }],
    },
    keywords: [],
    heatCondition: 'Warm',
  },
}

// ─── Archetype Cards ────────────────────────────────────────────────────────

// Cool Runner
const precisionStrike: ModifierCardDefinition = {
  id: 'precision-strike',
  name: 'Precision Strike',
  description: 'Deal 8 damage. While Cool: deal 12.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'damage', value: 8, targetMode: 'single_enemy' }],
  },
  keywords: [],
  heatBonus: {
    threshold: 'Cool',
    effects: [{ type: 'damage', value: 12, targetMode: 'single_enemy' }],
  },
  upgraded: {
    id: 'precision-strike',
    name: 'Precision Strike+',
    description: 'Deal 10 damage. While Cool: deal 15.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'damage', value: 10, targetMode: 'single_enemy' }],
    },
    keywords: [],
    heatBonus: {
      threshold: 'Cool',
      effects: [{ type: 'damage', value: 15, targetMode: 'single_enemy' }],
    },
  },
}

const coldEfficiency: ModifierCardDefinition = {
  id: 'cold-efficiency',
  name: 'Cold Efficiency',
  description: 'Draw 2 cards. While Cool: draw 3.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Draw',
    effects: [{ type: 'draw', count: 2 }],
  },
  keywords: [],
  heatBonus: {
    threshold: 'Cool',
    effects: [{ type: 'draw', count: 3 }],
  },
  upgraded: {
    id: 'cold-efficiency',
    name: 'Cold Efficiency+',
    description: 'Draw 3 cards. While Cool: draw 4.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Draw',
      effects: [{ type: 'draw', count: 3 }],
    },
    keywords: [],
    heatBonus: {
      threshold: 'Cool',
      effects: [{ type: 'draw', count: 4 }],
    },
  },
}

// Pyromaniac
const fuelTheFire: ModifierCardDefinition = {
  id: 'fuel-the-fire',
  name: 'Fuel the Fire',
  description: 'Deal 6 damage. While Hot: also gain 4 Block.',
  heatCost: 1,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'damage', value: 6, targetMode: 'single_enemy' }],
  },
  keywords: [],
  heatBonus: {
    threshold: 'Hot',
    effects: [
      { type: 'damage', value: 6, targetMode: 'single_enemy' },
      { type: 'gainBlock', value: 4 },
    ],
  },
  upgraded: {
    id: 'fuel-the-fire',
    name: 'Fuel the Fire+',
    description: 'Deal 8 damage. While Hot: also gain 6 Block.',
    heatCost: 1,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'damage', value: 8, targetMode: 'single_enemy' }],
    },
    keywords: [],
    heatBonus: {
      threshold: 'Hot',
      effects: [
        { type: 'damage', value: 8, targetMode: 'single_enemy' },
        { type: 'gainBlock', value: 6 },
      ],
    },
  },
}

const recklessCharge: ModifierCardDefinition = {
  id: 'reckless-charge',
  name: 'Reckless Charge',
  description: 'Deal 18 damage. Exhaust.',
  heatCost: 3,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'damage', value: 18, targetMode: 'single_enemy' }],
  },
  keywords: ['Exhaust'],
  upgraded: {
    id: 'reckless-charge',
    name: 'Reckless Charge+',
    description: 'Deal 24 damage. Exhaust.',
    heatCost: 3,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'damage', value: 24, targetMode: 'single_enemy' }],
    },
    keywords: ['Exhaust'],
  },
}

// Oscillator
const thermalFlux: ModifierCardDefinition = {
  id: 'thermal-flux',
  name: 'Thermal Flux',
  description: 'Reduce Heat by 2. Deal damage equal to heat change this turn.',
  heatCost: -2,
  category: {
    type: 'system',
    modifier: 'Cooling',
    effects: [], // damage resolved dynamically from heatChangeThisTurn
  },
  keywords: [],
  upgraded: {
    id: 'thermal-flux',
    name: 'Thermal Flux+',
    description: 'Reduce Heat by 2. Deal damage equal to heat change this turn. Gain Block equal to half.',
    heatCost: -2,
    category: {
      type: 'system',
      modifier: 'Cooling',
      effects: [], // damage + block resolved dynamically
    },
    keywords: [],
  },
}

const overclock: ModifierCardDefinition = {
  id: 'overclock',
  name: 'Overclock',
  description: 'Gain 1 Strength. If a threshold was crossed this turn: gain 2 instead.',
  heatCost: 2,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'applyStatus', status: 'Strength', stacks: 1, target: 'self' }],
  },
  keywords: [],
  upgraded: {
    id: 'overclock',
    name: 'Overclock+',
    description: 'Gain 2 Strength. If a threshold was crossed this turn: gain 3 instead.',
    heatCost: 2,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' }],
    },
    keywords: [],
  },
}

// ─── Sector 2 Modifier Card Pool ───────────────────────────────────────────────

// Slot-disruption answers (system/override cards that work when slots are disabled)

const failsafeProtocol: ModifierCardDefinition = {
  id: 'failsafe-protocol',
  name: 'Failsafe Protocol',
  description: 'Gain 10 Block. Draw 1 card.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'gainBlock', value: 10 }, { type: 'draw', count: 1 }],
  },
  keywords: [],
  upgraded: {
    id: 'failsafe-protocol',
    name: 'Failsafe Protocol+',
    description: 'Gain 14 Block. Draw 1 card.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'gainBlock', value: 14 }, { type: 'draw', count: 1 }],
    },
    keywords: [],
  },
}

const reroute: ModifierCardDefinition = {
  id: 'reroute',
  name: 'Reroute',
  description: 'Override: deal 12 damage to one enemy.',
  heatCost: 1,
  category: {
    type: 'slot',
    modifier: 'Override',
    effect: {
      type: 'override',
      action: { type: 'damage', baseValue: 12, targetMode: 'single_enemy' },
    },
  },
  keywords: [],
  upgraded: {
    id: 'reroute',
    name: 'Reroute+',
    description: 'Override: deal 16 damage to one enemy.',
    heatCost: 1,
    category: {
      type: 'slot',
      modifier: 'Override',
      effect: {
        type: 'override',
        action: { type: 'damage', baseValue: 16, targetMode: 'single_enemy' },
      },
    },
    keywords: [],
  },
}

// Heat exploitation (deepening archetypes)

const glacierLance: ModifierCardDefinition = {
  id: 'glacier-lance',
  name: 'Glacier Lance',
  description: 'Deal 10 damage. While Cool: deal 16 + apply 1 Weak.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'damage', value: 10, targetMode: 'single_enemy' }],
  },
  keywords: [],
  heatBonus: {
    threshold: 'Cool',
    effects: [
      { type: 'damage', value: 16, targetMode: 'single_enemy' },
      { type: 'applyStatus', status: 'Weak', stacks: 1, target: 'all_enemies' },
    ],
  },
  upgraded: {
    id: 'glacier-lance',
    name: 'Glacier Lance+',
    description: 'Deal 12 damage. While Cool: deal 20 + apply 2 Weak.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'damage', value: 12, targetMode: 'single_enemy' }],
    },
    keywords: [],
    heatBonus: {
      threshold: 'Cool',
      effects: [
        { type: 'damage', value: 20, targetMode: 'single_enemy' },
        { type: 'applyStatus', status: 'Weak', stacks: 2, target: 'all_enemies' },
      ],
    },
  },
}

const controlledBurn: ModifierCardDefinition = {
  id: 'controlled-burn',
  name: 'Controlled Burn',
  description: 'Gain 2 Strength. While Hot: also gain 2 Dexterity.',
  heatCost: 2,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' }],
  },
  keywords: [],
  heatBonus: {
    threshold: 'Hot',
    effects: [
      { type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' },
      { type: 'applyStatus', status: 'Dexterity', stacks: 2, target: 'self' },
    ],
  },
  upgraded: {
    id: 'controlled-burn',
    name: 'Controlled Burn+',
    description: 'Gain 3 Strength. While Hot: also gain 3 Dexterity.',
    heatCost: 2,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'applyStatus', status: 'Strength', stacks: 3, target: 'self' }],
    },
    keywords: [],
    heatBonus: {
      threshold: 'Hot',
      effects: [
        { type: 'applyStatus', status: 'Strength', stacks: 3, target: 'self' },
        { type: 'applyStatus', status: 'Dexterity', stacks: 3, target: 'self' },
      ],
    },
  },
}

const fluxSpike: ModifierCardDefinition = {
  id: 'flux-spike',
  name: 'Flux Spike',
  description: 'Requires Warm+. Deal 14 damage to all enemies. Exhaust.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'damage', value: 14, targetMode: 'all_enemies' }],
  },
  keywords: ['Exhaust'],
  heatCondition: 'Warm',
  upgraded: {
    id: 'flux-spike',
    name: 'Flux Spike+',
    description: 'Requires Warm+. Deal 20 damage to all enemies. Exhaust.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'damage', value: 20, targetMode: 'all_enemies' }],
    },
    keywords: ['Exhaust'],
    heatCondition: 'Warm',
  },
}

const thermalEquilibrium: ModifierCardDefinition = {
  id: 'thermal-equilibrium',
  name: 'Thermal Equilibrium',
  description: 'Reduce Heat by 3. Gain 6 Block.',
  heatCost: -3,
  category: {
    type: 'system',
    modifier: 'Cooling',
    effects: [{ type: 'gainBlock', value: 6 }],
  },
  keywords: [],
  upgraded: {
    id: 'thermal-equilibrium',
    name: 'Thermal Equilibrium+',
    description: 'Reduce Heat by 4. Gain 8 Block.',
    heatCost: -4,
    category: {
      type: 'system',
      modifier: 'Cooling',
      effects: [{ type: 'gainBlock', value: 8 }],
    },
    keywords: [],
  },
}

// Scaling/utility

const armorProtocol: ModifierCardDefinition = {
  id: 'armor-protocol',
  name: 'Armor Protocol',
  description: 'Gain 2 Dexterity.',
  heatCost: 1,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [{ type: 'applyStatus', status: 'Dexterity', stacks: 2, target: 'self' }],
  },
  keywords: [],
  upgraded: {
    id: 'armor-protocol',
    name: 'Armor Protocol+',
    description: 'Gain 3 Dexterity.',
    heatCost: 1,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [{ type: 'applyStatus', status: 'Dexterity', stacks: 3, target: 'self' }],
    },
    keywords: [],
  },
}

const salvageBurst: ModifierCardDefinition = {
  id: 'salvage-burst',
  name: 'Salvage Burst',
  description: 'Draw 3 cards. Reduce Heat by 1. Exhaust.',
  heatCost: -1,
  category: {
    type: 'system',
    modifier: 'Draw',
    effects: [{ type: 'draw', count: 3 }],
  },
  keywords: ['Exhaust'],
  upgraded: {
    id: 'salvage-burst',
    name: 'Salvage Burst+',
    description: 'Draw 4 cards. Reduce Heat by 2. Exhaust.',
    heatCost: -2,
    category: {
      type: 'system',
      modifier: 'Draw',
      effects: [{ type: 'draw', count: 4 }],
    },
    keywords: ['Exhaust'],
  },
}

const cascade: ModifierCardDefinition = {
  id: 'cascade',
  name: 'Cascade',
  description: 'Repeat: slot fires 3 times.',
  heatCost: 4,
  category: {
    type: 'slot',
    modifier: 'Repeat',
    effect: { type: 'repeat', extraFirings: 2 },
  },
  keywords: [],
  upgraded: {
    id: 'cascade',
    name: 'Cascade+',
    description: 'Repeat: slot fires 3 times.',
    heatCost: 3,
    category: {
      type: 'slot',
      modifier: 'Repeat',
      effect: { type: 'repeat', extraFirings: 2 },
    },
    keywords: [],
  },
}

const resonance: ModifierCardDefinition = {
  id: 'resonance',
  name: 'Resonance',
  description: '+200% to one slot\'s output. Exhaust.',
  heatCost: 3,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'amplify', multiplier: 3.0 },
  },
  keywords: ['Exhaust'],
  upgraded: {
    id: 'resonance',
    name: 'Resonance+',
    description: '+250% to one slot\'s output. Exhaust.',
    heatCost: 3,
    category: {
      type: 'slot',
      modifier: 'Amplify',
      effect: { type: 'amplify', multiplier: 3.5 },
    },
    keywords: ['Exhaust'],
  },
}

// ─── Companion Cards (Task 3.11) ────────────────────────────────────────────

export const yanah: ModifierCardDefinition = {
  id: 'yanah',
  name: 'Yanah',
  description: 'Heal 6 HP. Remove 1 debuff.',
  heatCost: 0,
  category: {
    type: 'system',
    modifier: 'Cooling',
    effects: [
      { type: 'heal', value: 6 },
      { type: 'removeDebuff', count: 1 },
    ],
  },
  keywords: [],
  upgraded: {
    id: 'yanah',
    name: 'Yanah+',
    description: 'Heal 10 HP. Remove 1 debuff.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Cooling',
      effects: [
        { type: 'heal', value: 10 },
        { type: 'removeDebuff', count: 1 },
      ],
    },
    keywords: [],
  },
}

export const yuri: ModifierCardDefinition = {
  id: 'yuri',
  name: 'Yuri',
  description: 'Gain 1 Strength. Gain 1 Inspired.',
  heatCost: 1,
  category: {
    type: 'system',
    modifier: 'Conditional',
    effects: [
      { type: 'applyStatus', status: 'Strength', stacks: 1, target: 'self' },
      { type: 'applyStatus', status: 'Inspired', stacks: 1, target: 'self' },
    ],
  },
  keywords: [],
  upgraded: {
    id: 'yuri',
    name: 'Yuri+',
    description: 'Gain 1 Strength. Gain 1 Inspired.',
    heatCost: 0,
    category: {
      type: 'system',
      modifier: 'Conditional',
      effects: [
        { type: 'applyStatus', status: 'Strength', stacks: 1, target: 'self' },
        { type: 'applyStatus', status: 'Inspired', stacks: 1, target: 'self' },
      ],
    },
    keywords: [],
  },
}

// ─── Exports ────────────────────────────────────────────────────────────────

export const STARTING_CARDS: ModifierCardDefinition[] = [
  boost, boost, boost,
  emergencyStrike, emergencyShield,
  coolantFlush, coolantFlush,
  diagnostics,
]

export const SECTOR1_CARD_POOL: ModifierCardDefinition[] = [
  overcharge, spreadShot, echoProtocol, shieldBash, emergencyShield,
  deepFreeze, heatVent, quickScan, thermalSurge, meltdown,
  fieldRepair, targetLock,
  precisionStrike, coldEfficiency, fuelTheFire, recklessCharge,
  thermalFlux, overclock,
]

export const SECTOR2_CARD_POOL: ModifierCardDefinition[] = [
  failsafeProtocol, reroute,
  glacierLance, controlledBurn, fluxSpike, thermalEquilibrium,
  armorProtocol, salvageBurst, cascade, resonance,
]

const allCardList: ModifierCardDefinition[] = [
  boost, emergencyStrike, coolantFlush, diagnostics,
  overcharge, spreadShot, echoProtocol, shieldBash, emergencyShield,
  deepFreeze, heatVent, quickScan, thermalSurge, meltdown,
  fieldRepair, targetLock,
  precisionStrike, coldEfficiency, fuelTheFire, recklessCharge,
  thermalFlux, overclock,
  failsafeProtocol, reroute,
  glacierLance, controlledBurn, fluxSpike, thermalEquilibrium,
  armorProtocol, salvageBurst, cascade, resonance,
  yanah, yuri,
]

export const ALL_CARDS: Record<string, ModifierCardDefinition> = Object.fromEntries(
  allCardList.map((c) => [c.id, c])
)
