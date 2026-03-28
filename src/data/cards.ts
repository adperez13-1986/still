import type { ModifierCardDefinition } from '../game/types'

// ─── Starting Modifier Cards ────────────────────────────────────────────────

const boost: ModifierCardDefinition = {
  id: 'boost',
  name: 'Boost',
  description: '+50% to one slot\'s output.',
  energyCost: 2,
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
    energyCost: 1,
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
  description: 'Override: deal 8 damage to ALL enemies.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Override',
    effect: {
      type: 'override',
      action: { type: 'damage', baseValue: 8, targetMode: 'all_enemies' },
    },
  },
  keywords: [],
  upgraded: {
    id: 'emergency-strike',
    name: 'Emergency Strike+',
    description: 'Override: deal 10 damage to ALL enemies.',
    energyCost: 1,
    category: {
      type: 'slot',
      modifier: 'Override',
      effect: {
        type: 'override',
        action: { type: 'damage', baseValue: 10, targetMode: 'all_enemies' },
      },
    },
    keywords: [],
  },
}

const vent: ModifierCardDefinition = {
  id: 'vent',
  name: 'Vent',
  description: 'Draw 2 cards.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Draw',
    effects: [{ type: 'draw', count: 2 }],
    homeSlot: 'Legs',
  },
  keywords: [],
  upgraded: {
    id: 'vent',
    name: 'Vent+',
    description: 'Draw 2 cards.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Draw',
      effects: [{ type: 'draw', count: 2 }],
      homeSlot: 'Legs',
    },
    keywords: [],
  },
}

const diagnostics: ModifierCardDefinition = {
  id: 'diagnostics',
  name: 'Diagnostics',
  description: 'Draw 2 modifier cards.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Draw',
    effects: [{ type: 'draw', count: 2 }],
    homeSlot: 'Head',
  },
  keywords: [],
  upgraded: {
    id: 'diagnostics',
    name: 'Diagnostics+',
    description: 'Draw 3 modifier cards.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Draw',
      effects: [{ type: 'draw', count: 3 }],
      homeSlot: 'Head',
    },
    keywords: [],
  },
}

// ─── Sector 1 Modifier Card Pool ───────────────────────────────────────────────

const overcharge: ModifierCardDefinition = {
  id: 'overcharge',
  name: 'Overcharge',
  description: '+100% to one slot\'s output.',
  energyCost: 3,
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
    energyCost: 2,
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
  energyCost: 2,
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
    energyCost: 1,
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
  energyCost: 2,
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
    energyCost: 1,
    category: {
      type: 'slot',
      modifier: 'Repeat',
      effect: { type: 'repeat', extraFirings: 2 },
    },
    keywords: [],
  },
}

const feedback: ModifierCardDefinition = {
  id: 'feedback',
  name: 'Feedback',
  description: 'Choose a slot. It permanently gains a Feedback effect for this combat.',
  energyCost: 3,
  freePlay: true,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'applyFeedback' }],
    homeSlot: 'Head', // unused — freePlay targets any slot
  },
  keywords: ['Exhaust'],
  upgraded: {
    id: 'feedback',
    name: 'Feedback+',
    description: 'Choose a slot. It permanently gains a Feedback effect for this combat.',
    energyCost: 2,
    freePlay: true,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'applyFeedback' }],
      homeSlot: 'Head',
    },
    keywords: ['Exhaust'],
  },
}

const retaliate: ModifierCardDefinition = {
  id: 'retaliate',
  name: 'Retaliate',
  description: 'This turn, all damage you receive is dealt back to the attacker.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Retaliate',
    effect: { type: 'retaliate' },
  },
  keywords: [],
  upgraded: {
    id: 'retaliate',
    name: 'Retaliate+',
    description: 'This turn, all damage you receive is dealt back to the attacker.',
    energyCost: 1,
    category: {
      type: 'slot',
      modifier: 'Retaliate',
      effect: { type: 'retaliate' },
    },
    keywords: [],
  },
}

const fortify: ModifierCardDefinition = {
  id: 'fortify',
  name: 'Fortify',
  description: 'Gain 6 Block. Deal 6 damage to all enemies.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'gainBlock', value: 6 },
      { type: 'damage', value: 6, targetMode: 'all_enemies' },
    ],
    homeSlot: 'Torso',
  },
  keywords: [],
  upgraded: {
    id: 'fortify',
    name: 'Fortify+',
    description: 'Gain 8 Block. Deal 8 damage to all enemies.',
    energyCost: 2,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'gainBlock', value: 8 },
        { type: 'damage', value: 8, targetMode: 'all_enemies' },
      ],
      homeSlot: 'Torso',
    },
    keywords: [],
  },
}

const shieldBash: ModifierCardDefinition = {
  id: 'shield-bash',
  name: 'Shield Bash',
  description: 'Override: deal 10 damage to one enemy.',
  energyCost: 2,
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
    energyCost: 1,
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
  energyCost: 2,
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
    energyCost: 1,
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

// Former cooling cards → utility

const deepFreeze: ModifierCardDefinition = {
  id: 'deep-freeze',
  name: 'Deep Freeze',
  description: 'Gain 10 Block.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'gainBlock', value: 10 }],
    homeSlot: 'Torso',
  },
  keywords: [],
  upgraded: {
    id: 'deep-freeze',
    name: 'Deep Freeze+',
    description: 'Gain 14 Block.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'gainBlock', value: 14 }],
      homeSlot: 'Torso',
    },
    keywords: [],
  },
}

const heatVent: ModifierCardDefinition = {
  id: 'heat-vent',
  name: 'Heat Vent',
  description: 'Deal 6 damage to all enemies.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'damage', value: 6, targetMode: 'all_enemies' }],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'heat-vent',
    name: 'Heat Vent+',
    description: 'Deal 8 damage to all enemies.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'damage', value: 8, targetMode: 'all_enemies' }],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const quickScan: ModifierCardDefinition = {
  id: 'quick-scan',
  name: 'Quick Scan',
  description: 'Draw 3 cards.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Draw',
    effects: [{ type: 'draw', count: 3 }],
    homeSlot: 'Head',
  },
  keywords: [],
  upgraded: {
    id: 'quick-scan',
    name: 'Quick Scan+',
    description: 'Draw 4 cards.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Draw',
      effects: [{ type: 'draw', count: 4 }],
      homeSlot: 'Head',
    },
    keywords: [],
  },
}

// Former heat-conditional cards → unconditional utility

const thermalSurge: ModifierCardDefinition = {
  id: 'thermal-surge',
  name: 'Thermal Surge',
  description: 'Gain 1 Strength and 1 Dexterity.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'applyStatus', status: 'Strength', stacks: 1, target: 'self' },
      { type: 'applyStatus', status: 'Dexterity', stacks: 1, target: 'self' },
    ],
    homeSlot: 'Head',
  },
  keywords: [],
  upgraded: {
    id: 'thermal-surge',
    name: 'Thermal Surge+',
    description: 'Gain 2 Strength and 1 Dexterity.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' },
        { type: 'applyStatus', status: 'Dexterity', stacks: 1, target: 'self' },
      ],
      homeSlot: 'Head',
    },
    keywords: [],
  },
}

const meltdown: ModifierCardDefinition = {
  id: 'meltdown',
  name: 'Meltdown',
  description: 'Deal 15 damage to one enemy.',
  energyCost: 3,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'damage', value: 15, targetMode: 'single_enemy' }],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'meltdown',
    name: 'Meltdown+',
    description: 'Deal 20 damage to one enemy.',
    energyCost: 2,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'damage', value: 20, targetMode: 'single_enemy' }],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const fieldRepair: ModifierCardDefinition = {
  id: 'field-repair',
  name: 'Field Repair',
  description: 'Heal 6 HP.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'heal', value: 6 }],
    homeSlot: 'Torso',
  },
  keywords: [],
  upgraded: {
    id: 'field-repair',
    name: 'Field Repair+',
    description: 'Heal 9 HP.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'heal', value: 9 }],
      homeSlot: 'Torso',
    },
    keywords: [],
  },
}

const targetLock: ModifierCardDefinition = {
  id: 'target-lock',
  name: 'Target Lock',
  description: 'Apply 2 Vulnerable to all enemies.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'applyStatus', status: 'Vulnerable', stacks: 2, target: 'all_enemies' }],
    homeSlot: 'Head',
  },
  keywords: [],
  upgraded: {
    id: 'target-lock',
    name: 'Target Lock+',
    description: 'Apply 3 Vulnerable to all enemies.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'applyStatus', status: 'Vulnerable', stacks: 3, target: 'all_enemies' }],
      homeSlot: 'Head',
    },
    keywords: [],
  },
}

// ─── Former Archetype Cards (reworked to unconditional) ──────────────────────

const precisionStrike: ModifierCardDefinition = {
  id: 'precision-strike',
  name: 'Precision Strike',
  description: 'Deal 10 damage to one enemy.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'damage', value: 10, targetMode: 'single_enemy' }],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'precision-strike',
    name: 'Precision Strike+',
    description: 'Deal 14 damage to one enemy.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'damage', value: 14, targetMode: 'single_enemy' }],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const coldEfficiency: ModifierCardDefinition = {
  id: 'cold-efficiency',
  name: 'Cold Efficiency',
  description: 'Draw 2 cards. Gain 5 Block.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'draw', count: 2 }, { type: 'gainBlock', value: 5 }],
    homeSlot: 'Legs',
  },
  keywords: [],
  upgraded: {
    id: 'cold-efficiency',
    name: 'Cold Efficiency+',
    description: 'Draw 2 cards. Gain 7 Block.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'draw', count: 2 }, { type: 'gainBlock', value: 7 }],
      homeSlot: 'Legs',
    },
    keywords: [],
  },
}

const fuelTheFire: ModifierCardDefinition = {
  id: 'fuel-the-fire',
  name: 'Fuel the Fire',
  description: 'Deal 8 damage. Gain 4 Block.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'damage', value: 8, targetMode: 'single_enemy' },
      { type: 'gainBlock', value: 4 },
    ],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'fuel-the-fire',
    name: 'Fuel the Fire+',
    description: 'Deal 10 damage. Gain 6 Block.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'damage', value: 10, targetMode: 'single_enemy' },
        { type: 'gainBlock', value: 6 },
      ],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const heatSurge: ModifierCardDefinition = {
  id: 'heat-surge',
  name: 'Heat Surge',
  description: 'Draw 2 cards. Gain 3 Block.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'draw', count: 2 }, { type: 'gainBlock', value: 3 }],
    homeSlot: 'Head',
  },
  keywords: [],
  upgraded: {
    id: 'heat-surge',
    name: 'Heat Surge+',
    description: 'Draw 3 cards. Gain 4 Block.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'draw', count: 3 }, { type: 'gainBlock', value: 4 }],
      homeSlot: 'Head',
    },
    keywords: [],
  },
}

const recklessCharge: ModifierCardDefinition = {
  id: 'reckless-charge',
  name: 'Reckless Charge',
  description: 'Deal 18 damage.',
  energyCost: 4,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'damage', value: 18, targetMode: 'single_enemy' }],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'reckless-charge',
    name: 'Reckless Charge+',
    description: 'Deal 24 damage.',
    energyCost: 3,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'damage', value: 24, targetMode: 'single_enemy' }],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const thermalFlux: ModifierCardDefinition = {
  id: 'thermal-flux',
  name: 'Thermal Flux',
  description: 'Deal 4 damage to all enemies. Draw 1 card.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'damage', value: 4, targetMode: 'all_enemies' },
      { type: 'draw', count: 1 },
    ],
    homeSlot: 'Legs',
  },
  keywords: [],
  upgraded: {
    id: 'thermal-flux',
    name: 'Thermal Flux+',
    description: 'Deal 6 damage to all enemies. Draw 2 cards.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'damage', value: 6, targetMode: 'all_enemies' },
        { type: 'draw', count: 2 },
      ],
      homeSlot: 'Legs',
    },
    keywords: [],
  },
}

const overclock: ModifierCardDefinition = {
  id: 'overclock',
  name: 'Overclock',
  description: 'Gain 2 Strength. Draw 1 card.',
  energyCost: 3,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' },
      { type: 'draw', count: 1 },
    ],
    homeSlot: 'Head',
  },
  keywords: [],
  upgraded: {
    id: 'overclock',
    name: 'Overclock+',
    description: 'Gain 3 Strength. Draw 1 card.',
    energyCost: 2,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'applyStatus', status: 'Strength', stacks: 3, target: 'self' },
        { type: 'draw', count: 1 },
      ],
      homeSlot: 'Head',
    },
    keywords: [],
  },
}

// ─── Sector 2 Modifier Card Pool ───────────────────────────────────────────────

const failsafeProtocol: ModifierCardDefinition = {
  id: 'failsafe-protocol',
  name: 'Failsafe Protocol',
  description: 'Gain 10 Block. Draw 1 card.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'gainBlock', value: 10 }, { type: 'draw', count: 1 }],
    homeSlot: 'Torso',
  },
  keywords: [],
  upgraded: {
    id: 'failsafe-protocol',
    name: 'Failsafe Protocol+',
    description: 'Gain 14 Block. Draw 1 card.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'gainBlock', value: 14 }, { type: 'draw', count: 1 }],
      homeSlot: 'Torso',
    },
    keywords: [],
  },
}

const reroute: ModifierCardDefinition = {
  id: 'reroute',
  name: 'Reroute',
  description: 'Override: deal 12 damage to one enemy.',
  energyCost: 2,
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
    energyCost: 1,
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

const glacierLance: ModifierCardDefinition = {
  id: 'glacier-lance',
  name: 'Glacier Lance',
  description: 'Deal 10 damage. Apply 1 Weak to all enemies.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'damage', value: 10, targetMode: 'single_enemy' },
      { type: 'applyStatus', status: 'Weak', stacks: 1, target: 'all_enemies' },
    ],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'glacier-lance',
    name: 'Glacier Lance+',
    description: 'Deal 14 damage. Apply 2 Weak to all enemies.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'damage', value: 14, targetMode: 'single_enemy' },
        { type: 'applyStatus', status: 'Weak', stacks: 2, target: 'all_enemies' },
      ],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const controlledBurn: ModifierCardDefinition = {
  id: 'controlled-burn',
  name: 'Controlled Burn',
  description: 'Gain 2 Strength and 2 Dexterity.',
  energyCost: 3,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' },
      { type: 'applyStatus', status: 'Dexterity', stacks: 2, target: 'self' },
    ],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'controlled-burn',
    name: 'Controlled Burn+',
    description: 'Gain 3 Strength and 3 Dexterity.',
    energyCost: 2,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'applyStatus', status: 'Strength', stacks: 3, target: 'self' },
        { type: 'applyStatus', status: 'Dexterity', stacks: 3, target: 'self' },
      ],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const fluxSpike: ModifierCardDefinition = {
  id: 'flux-spike',
  name: 'Flux Spike',
  description: 'Deal 14 damage to all enemies.',
  energyCost: 3,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'damage', value: 14, targetMode: 'all_enemies' }],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'flux-spike',
    name: 'Flux Spike+',
    description: 'Deal 20 damage to all enemies.',
    energyCost: 2,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'damage', value: 20, targetMode: 'all_enemies' }],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const thermalEquilibrium: ModifierCardDefinition = {
  id: 'thermal-equilibrium',
  name: 'Thermal Equilibrium',
  description: 'Gain 8 Block. Draw 1 card.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'gainBlock', value: 8 }, { type: 'draw', count: 1 }],
    homeSlot: 'Legs',
  },
  keywords: [],
  upgraded: {
    id: 'thermal-equilibrium',
    name: 'Thermal Equilibrium+',
    description: 'Gain 10 Block. Draw 1 card.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'gainBlock', value: 10 }, { type: 'draw', count: 1 }],
      homeSlot: 'Legs',
    },
    keywords: [],
  },
}

// Scaling/utility

const armorProtocol: ModifierCardDefinition = {
  id: 'armor-protocol',
  name: 'Armor Protocol',
  description: 'Gain 2 Dexterity.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'applyStatus', status: 'Dexterity', stacks: 2, target: 'self' }],
    homeSlot: 'Torso',
  },
  keywords: [],
  upgraded: {
    id: 'armor-protocol',
    name: 'Armor Protocol+',
    description: 'Gain 3 Dexterity.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'applyStatus', status: 'Dexterity', stacks: 3, target: 'self' }],
      homeSlot: 'Torso',
    },
    keywords: [],
  },
}

const powerSurge: ModifierCardDefinition = {
  id: 'power-surge',
  name: 'Power Surge',
  description: 'Gain 2 Strength.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' }],
    homeSlot: 'Arms',
  },
  keywords: [],
  upgraded: {
    id: 'power-surge',
    name: 'Power Surge+',
    description: 'Gain 3 Strength.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [{ type: 'applyStatus', status: 'Strength', stacks: 3, target: 'self' }],
      homeSlot: 'Arms',
    },
    keywords: [],
  },
}

const salvageBurst: ModifierCardDefinition = {
  id: 'salvage-burst',
  name: 'Salvage Burst',
  description: 'Draw 3 cards.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Draw',
    effects: [{ type: 'draw', count: 3 }],
    homeSlot: 'Legs',
  },
  keywords: [],
  upgraded: {
    id: 'salvage-burst',
    name: 'Salvage Burst+',
    description: 'Draw 4 cards.',
    energyCost: 1,
    category: {
      type: 'system',
      modifier: 'Draw',
      effects: [{ type: 'draw', count: 4 }],
      homeSlot: 'Legs',
    },
    keywords: [],
  },
}

const cascade: ModifierCardDefinition = {
  id: 'cascade',
  name: 'Cascade',
  description: 'Repeat: slot fires 3 times.',
  energyCost: 5,
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
    energyCost: 4,
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
  energyCost: 4,
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
    energyCost: 3,
    category: {
      type: 'slot',
      modifier: 'Amplify',
      effect: { type: 'amplify', multiplier: 3.5 },
    },
    keywords: ['Exhaust'],
  },
}

// ─── Companion Cards ────────────────────────────────────────────────────────

export const yanah: ModifierCardDefinition = {
  id: 'yanah',
  name: 'Yanah',
  description: 'Heal 6 HP. Remove 1 debuff.',
  energyCost: 0,
  freePlay: true,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'heal', value: 6 },
      { type: 'removeDebuff', count: 1 },
    ],
    homeSlot: 'Torso',
  },
  keywords: [],
  upgraded: {
    id: 'yanah',
    name: 'Yanah+',
    description: 'Heal 9 HP. Remove 1 debuff.',
    energyCost: 0,
    freePlay: true,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'heal', value: 9 },
        { type: 'removeDebuff', count: 1 },
      ],
      homeSlot: 'Torso',
    },
    keywords: [],
  },
}

export const yuri: ModifierCardDefinition = {
  id: 'yuri',
  name: 'Yuri',
  description: 'Gain 1 Strength and 1 Inspired.',
  energyCost: 1,
  freePlay: true,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [
      { type: 'applyStatus', status: 'Strength', stacks: 1, target: 'self' },
      { type: 'applyStatus', status: 'Inspired', stacks: 1, target: 'self' },
    ],
    homeSlot: 'Head',
  },
  keywords: [],
  upgraded: {
    id: 'yuri',
    name: 'Yuri+',
    description: 'Gain 2 Strength and 1 Inspired.',
    energyCost: 0,
    freePlay: true,
    category: {
      type: 'system',
      modifier: 'Utility',
      effects: [
        { type: 'applyStatus', status: 'Strength', stacks: 2, target: 'self' },
        { type: 'applyStatus', status: 'Inspired', stacks: 1, target: 'self' },
      ],
      homeSlot: 'Head',
    },
    keywords: [],
  },
}

// ─── Exports ────────────────────────────────────────────────────────────────

// ─── Berserker Cards ──────────────────────────────────────────────────────

const recklessBoost: ModifierCardDefinition = {
  id: 'reckless-boost',
  name: 'Reckless Boost',
  description: '+150% to one slot. Take 5 damage.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'amplifyWithSelfDamage', multiplier: 2.5, selfDamage: 5 },
  },
  keywords: [],
}

const burnout: ModifierCardDefinition = {
  id: 'burnout',
  name: 'Burnout',
  description: 'Permanent: lose 3 HP and gain 2 Strength each turn.',
  energyCost: 2,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'applyBurnout' }],
    homeSlot: 'Arms',
  },
  keywords: ['Exhaust'],
}

const overclockSlot: ModifierCardDefinition = {
  id: 'overclock-slot',
  name: 'Overclock Slot',
  description: 'Slot fires 3 times. Disabled next turn.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Repeat',
    effect: { type: 'overclockSlot' },
  },
  keywords: [],
}

const shutdown: ModifierCardDefinition = {
  id: 'shutdown',
  name: 'Shutdown',
  description: 'Disable one of your slots. Gain 3 Energy.',
  energyCost: 0,
  freePlay: true,
  category: {
    type: 'system',
    modifier: 'Utility',
    effects: [{ type: 'disableOwnSlot', energyGain: 3 }],
    homeSlot: 'Head',
  },
  keywords: ['Exhaust'],
}

// ─── Exhaust-Aligned Cards ────────────────────────────────────────────────

const scrapCharge: ModifierCardDefinition = {
  id: 'scrap-charge',
  name: 'Scrap Charge',
  description: '+25% per card in Exhaust pile.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'amplifyScaling', perStack: 0.25 },
  },
  keywords: [],
}

const jettison: ModifierCardDefinition = {
  id: 'jettison',
  name: 'Jettison',
  description: 'Override: exhaust up to 3 hand cards, deal 6 damage each.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Override',
    effect: { type: 'overrideExhaustHand', damagePerCard: 6, maxCards: 3 },
  },
  keywords: [],
}

const residualCharge: ModifierCardDefinition = {
  id: 'residual-charge',
  name: 'Residual Charge',
  description: 'Slot fires extra for every 3 cards in Exhaust pile (max 4x).',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Repeat',
    effect: { type: 'repeatScaling', perN: 3, maxExtra: 3 },
  },
  keywords: [],
}

// ─── Counter-Aligned Cards ────────────────────────────────────────────────

const crossWire: ModifierCardDefinition = {
  id: 'cross-wire',
  name: 'Cross-Wire',
  description: 'Arms deals bonus damage equal to Torso base value.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'crossSlotBonus', sourceSlot: 'Torso' },
  },
  keywords: [],
}

const ironCurtain: ModifierCardDefinition = {
  id: 'iron-curtain',
  name: 'Iron Curtain',
  description: '+200% block. Gain Retaliate.',
  energyCost: 3,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'combinedBlockRetaliate', multiplier: 3.0 },
  },
  keywords: [],
}

const absorb: ModifierCardDefinition = {
  id: 'absorb',
  name: 'Absorb',
  description: 'Block gained this turn also heals 50%.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'blockHeal', healRatio: 0.5 },
  },
  keywords: [],
}

const volatileArmor: ModifierCardDefinition = {
  id: 'volatile-armor',
  name: 'Volatile Armor',
  description: 'When block is broken, deal consumed amount to attacker.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'volatileBlock' },
  },
  keywords: [],
}

// ─── Stat-Aligned Cards ──────────────────────────────────────────────────

const reinforce: ModifierCardDefinition = {
  id: 'reinforce',
  name: 'Reinforce',
  description: 'Dexterity bonus to Torso is tripled.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'amplifyStatMultiplier', stat: 'Dexterity', multiplier: 3 },
  },
  keywords: [],
}

// ─── Build-Bridge Cards ──────────────────────────────────────────────────

const linkedFire: ModifierCardDefinition = {
  id: 'linked-fire',
  name: 'Linked Fire',
  description: 'Arms deals bonus damage equal to Legs base value.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Amplify',
    effect: { type: 'crossSlotBonus', sourceSlot: 'Legs' },
  },
  keywords: [],
}

const redirectPower: ModifierCardDefinition = {
  id: 'redirect-power',
  name: 'Redirect Power',
  description: 'Slot fires twice. Second uses adjacent slot\'s action.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Repeat',
    effect: { type: 'redirectPower' },
  },
  keywords: [],
}

const feedbackLoopCard: ModifierCardDefinition = {
  id: 'feedback-loop',
  name: 'Feedback Loop',
  description: 'Slot fires extra for each card exhausted this turn.',
  energyCost: 2,
  category: {
    type: 'slot',
    modifier: 'Repeat',
    effect: { type: 'feedbackLoop' },
  },
  keywords: [],
}

// ─── Pool Exports ─────────────────────────────────────────────────────────

export const STARTING_CARDS: ModifierCardDefinition[] = [
  boost, boost, boost,
  emergencyStrike, emergencyShield,
  vent, vent,
  diagnostics,
]

export const SECTOR1_CARD_POOL: ModifierCardDefinition[] = [
  overcharge, spreadShot, echoProtocol, feedback, shieldBash, emergencyShield,
  deepFreeze, heatVent, quickScan, thermalSurge, meltdown,
  fieldRepair, targetLock, armorProtocol, powerSurge,
  precisionStrike, coldEfficiency, fuelTheFire, heatSurge, recklessCharge,
  thermalFlux, overclock, retaliate,
  // Berserker seeds
  recklessBoost, overclockSlot,
]

export const SECTOR2_CARD_POOL: ModifierCardDefinition[] = [
  failsafeProtocol, reroute,
  glacierLance, controlledBurn, fluxSpike, thermalEquilibrium,
  salvageBurst, cascade, resonance, fortify,
  // Expansion: exhaust, counter, stat, bridge, berserker system
  scrapCharge, jettison, residualCharge,
  crossWire, ironCurtain, absorb, volatileArmor,
  reinforce,
  linkedFire, redirectPower, feedbackLoopCard,
  burnout, shutdown,
]

export const CARD_POOL: ModifierCardDefinition[] = [
  ...SECTOR1_CARD_POOL,
  ...SECTOR2_CARD_POOL,
]

const allCardList: ModifierCardDefinition[] = [
  boost, emergencyStrike, vent, diagnostics,
  overcharge, spreadShot, echoProtocol, feedback, shieldBash, emergencyShield,
  deepFreeze, heatVent, quickScan, thermalSurge, meltdown,
  fieldRepair, targetLock, powerSurge,
  precisionStrike, coldEfficiency, fuelTheFire, heatSurge, recklessCharge,
  thermalFlux, overclock,
  failsafeProtocol, reroute,
  glacierLance, controlledBurn, fluxSpike, thermalEquilibrium,
  armorProtocol, salvageBurst, cascade, resonance,
  retaliate, fortify,
  yanah, yuri,
  // Expansion
  recklessBoost, burnout, overclockSlot, shutdown,
  scrapCharge, jettison, residualCharge,
  crossWire, ironCurtain, absorb, volatileArmor,
  reinforce,
  linkedFire, redirectPower, feedbackLoopCard,
]

export const ALL_CARDS: Record<string, ModifierCardDefinition> = Object.fromEntries(
  allCardList.map((c) => [c.id, c])
)
