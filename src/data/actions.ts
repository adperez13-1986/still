import type { ActionDefinition, ActionType, SynergyEffect } from '../game/types'

// ─── Starting Actions ────────────────────────────────────────────────────────

export const ACTION_STRIKE: ActionDefinition = {
  id: 'strike', name: 'Strike', type: 'damage_single',
  baseValue: 7, pushedValue: 11,
  description: 'Deal damage to selected enemy',
}

export const ACTION_SHIELD: ActionDefinition = {
  id: 'shield', name: 'Shield', type: 'block',
  baseValue: 6, pushedValue: 9,
  description: 'Gain block',
}

export const ACTION_BARRAGE: ActionDefinition = {
  id: 'barrage', name: 'Barrage', type: 'damage_all',
  baseValue: 5, pushedValue: 7,
  description: 'Deal damage to all enemies',
}

export const ACTION_VENT: ActionDefinition = {
  id: 'vent', name: 'Vent', type: 'recovery',
  baseValue: 4, pushedValue: 4,
  description: 'Skip attacks, recover 4 strain',
  isVent: true,
}

// ─── Findable Actions ────────────────────────────────────────────────────────

export const ACTION_PHASE_BLADE: ActionDefinition = {
  id: 'phase-blade', name: 'Phase Blade', type: 'damage_single',
  baseValue: 3, pushedValue: 5, hits: 2,
  description: 'Hit selected enemy twice',
  takeCost: 3,
}

export const ACTION_FOCUS_FIRE: ActionDefinition = {
  id: 'focus-fire', name: 'Focus Fire', type: 'damage_single',
  baseValue: 10, pushedValue: 14,
  description: 'Heavy single-target damage',
  takeCost: 3,
}

export const ACTION_PULSE: ActionDefinition = {
  id: 'pulse', name: 'Pulse', type: 'damage_all',
  baseValue: 2, pushedValue: 3, hits: 3,
  description: 'Hit 3 random enemies',
  takeCost: 4,
}

export const ACTION_BARRIER: ActionDefinition = {
  id: 'barrier', name: 'Barrier', type: 'block',
  baseValue: 3, pushedValue: 5, persistent: true,
  description: 'Block that persists 1 extra turn',
  takeCost: 3,
}

export const ACTION_BRACE: ActionDefinition = {
  id: 'brace', name: 'Brace', type: 'reduce',
  baseValue: 3, pushedValue: 5, perHit: true,
  description: 'Reduce incoming damage per hit',
  takeCost: 3,
}

export const ACTION_REDIRECT: ActionDefinition = {
  id: 'redirect', name: 'Redirect', type: 'reflect',
  baseValue: 40, pushedValue: 60, reflectPct: 40,
  description: 'Reflect 40% of damage taken (60% pushed)',
  takeCost: 4,
}

export const ACTION_REPAIR: ActionDefinition = {
  id: 'repair', name: 'Repair', type: 'heal',
  baseValue: 4, pushedValue: 6,
  description: 'Heal HP',
  takeCost: 3,
}

export const ACTION_MEND: ActionDefinition = {
  id: 'mend', name: 'Mend', type: 'heal',
  baseValue: 2, pushedValue: 3, healOverTurns: 2,
  description: 'Heal over 2 turns',
  takeCost: 3,
}

export const ACTION_ABSORB: ActionDefinition = {
  id: 'absorb', name: 'Absorb', type: 'convert',
  baseValue: 3, pushedValue: 5,
  description: 'Convert block to strain reduction',
  takeCost: 4,
}

export const ACTION_PATIENCE: ActionDefinition = {
  id: 'patience', name: 'Patience', type: 'buff',
  baseValue: 3, pushedValue: 5,
  description: 'Linked action gains base value next turn',
  takeCost: 4,
}

export const ACTION_OVERCLOCK: ActionDefinition = {
  id: 'overclock', name: 'Overclock', type: 'buff',
  baseValue: 0, pushedValue: 0,
  description: 'Linked action fires twice (push only)',
  takeCost: 5,
}

export const ACTION_WEAKEN: ActionDefinition = {
  id: 'weaken', name: 'Weaken', type: 'debuff',
  baseValue: 3, pushedValue: 4,
  description: 'Reduce enemy damage by 3 for 2 turns',
  takeCost: 3,
}

export const ACTION_TAUNT: ActionDefinition = {
  id: 'taunt', name: 'Taunt', type: 'utility',
  baseValue: 0, pushedValue: 0,
  description: 'Force all enemies to target you',
  takeCost: 3,
}

// ─── All Actions ─────────────────────────────────────────────────────────────

export const STARTING_ACTIONS: ActionDefinition[] = [
  ACTION_STRIKE, ACTION_SHIELD, ACTION_BARRAGE, ACTION_VENT,
]

export const FINDABLE_ACTIONS: ActionDefinition[] = [
  ACTION_PHASE_BLADE, ACTION_FOCUS_FIRE, ACTION_PULSE,
  ACTION_BARRIER, ACTION_BRACE, ACTION_REDIRECT,
  ACTION_REPAIR, ACTION_MEND, ACTION_ABSORB,
  ACTION_PATIENCE, ACTION_OVERCLOCK, ACTION_WEAKEN, ACTION_TAUNT,
]

export const ALL_ACTIONS: Record<string, ActionDefinition> = Object.fromEntries(
  [...STARTING_ACTIONS, ...FINDABLE_ACTIONS].map(a => [a.id, a])
)

// ─── Starting Slot Layout ────────────────────────────────────────────────────

export const STARTING_SLOT_LAYOUT: [string | null, string | null, string | null, string | null, string | null] = [
  'strike', 'shield',   // Pair A
  'barrage', 'vent',    // Pair B
  null,                  // Solo (empty)
]

// ─── Synergy Table ───────────────────────────────────────────────────────────

export const SYNERGY_TABLE: SynergyEffect[] = [
  { id: 'counter',       name: 'Counter',       description: 'Block full attack → damage fires again',   types: ['damage_single', 'block'] },
  { id: 'drain',         name: 'Drain',         description: 'Damage heals 30%',                        types: ['damage_single', 'heal'] },
  { id: 'cleave',        name: 'Cleave',        description: 'Single target + 50% to all others',       types: ['damage_single', 'damage_all'] },
  { id: 'focus',         name: 'Focus',         description: 'Combine both hits into one',              types: ['damage_single', 'damage_single'] },
  { id: 'thorns',        name: 'Thorns',        description: 'Reduction deals 2 back per hit',          types: ['damage_single', 'reduce'] },
  { id: 'empower',       name: 'Empower',       description: 'Buff doubles on damage action',           types: ['damage_single', 'buff'] },
  { id: 'exploit',       name: 'Exploit',       description: '+50% damage to debuffed enemies',         types: ['damage_single', 'debuff'] },
  { id: 'fortify',       name: 'Fortify',       description: 'Excess block → healing',                  types: ['block', 'heal'] },
  { id: 'bastion',       name: 'Bastion',       description: 'Block + reduction both apply',            types: ['block', 'reduce'] },
  { id: 'bolster',       name: 'Bolster',       description: 'Block doubled this turn',                 types: ['block', 'buff'] },
  { id: 'recycle',       name: 'Recycle',       description: 'Remaining block → strain reduction',      types: ['block', 'convert'] },
  { id: 'suppress',      name: 'Suppress',      description: 'AoE also applies debuff',                 types: ['damage_all', 'debuff'] },
  { id: 'barrage',       name: 'Barrage+',      description: 'Hits doubled',                            types: ['damage_all', 'damage_all'] },
  { id: 'regenerate',    name: 'Regenerate',    description: 'Heal over 2 turns',                       types: ['heal', 'buff'] },
  { id: 'transfuse',     name: 'Transfuse',     description: 'Heal also reduces strain by 2',           types: ['heal', 'convert'] },
  { id: 'second-wind',   name: 'Second Wind',   description: 'Linked action +3 base next turn',         types: ['recovery', 'damage_single'] },
  { id: 'mirror-strike', name: 'Mirror Strike', description: 'Reflected damage +50%',                   types: ['reflect', 'damage_single'] },
  { id: 'focused-aggro', name: 'Focused Aggro', description: 'Counter on every hit received',           types: ['utility', 'damage_single'] },
]

/** Look up synergy for a type pair (order-independent) */
export function findSynergy(typeA: ActionType, typeB: ActionType): SynergyEffect | null {
  return SYNERGY_TABLE.find(s =>
    (s.types[0] === typeA && s.types[1] === typeB) ||
    (s.types[0] === typeB && s.types[1] === typeA)
  ) ?? null
}

/** Get synergy for a pair of action IDs */
export function getSynergyForPair(actionIdA: string | null, actionIdB: string | null): SynergyEffect | null {
  if (!actionIdA || !actionIdB) return null
  const a = ALL_ACTIONS[actionIdA]
  const b = ALL_ACTIONS[actionIdB]
  if (!a || !b) return null
  return findSynergy(a.type, b.type)
}
