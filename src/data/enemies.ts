import type { EnemyDefinition } from '../game/types'

// ─── Sector 1 Standard Enemies ──────────────────────────────────────────────────

const wanderingDrone: EnemyDefinition = {
  id: 'wandering-drone',
  name: 'Wandering Drone',
  maxHealth: 40,
  intentPattern: [
    { type: 'Attack', value: 6 },
    { type: 'Attack', value: 6 },
    { type: 'Block', value: 5 },
  ],
  dropPool: [
    { type: 'shards', amount: 8, weight: 1 },
  ],
}

const rustGuard: EnemyDefinition = {
  id: 'rust-guard',
  name: 'Rust Guard',
  maxHealth: 55,
  intentPattern: [
    { type: 'Attack', value: 8 },
    { type: 'Attack', value: 10 },
    { type: 'Block', value: 8 },
  ],
  dropPool: [
    { type: 'shards', amount: 10, weight: 2 },
    { type: 'part', ids: ['frost-core', 'scrap-recycler'], weight: 1 },
    { type: 'equipment', ids: ['patched-hull'], weight: 1 },
  ],
}

const corrodedSentry: EnemyDefinition = {
  id: 'corroded-sentry',
  name: 'Corroded Sentry',
  maxHealth: 35,
  intentPattern: [
    { type: 'Attack', value: 5 },
    { type: 'Debuff', value: 2, status: 'Weak' },
    { type: 'Attack', value: 8 },
  ],
  dropPool: [
    { type: 'shards', amount: 7, weight: 1 },
  ],
}

const fractureMite: EnemyDefinition = {
  id: 'fracture-mite',
  name: 'Fracture Mite',
  maxHealth: 16,
  intentPattern: [
    { type: 'Attack', value: 3, hits: 2 },
    { type: 'Attack', value: 3, hits: 2 },
  ],
  dropPool: [
    { type: 'shards', amount: 5, weight: 1 },
  ],
}

const ironCrawler: EnemyDefinition = {
  id: 'iron-crawler',
  name: 'Iron Crawler',
  maxHealth: 48,
  intentPattern: [
    { type: 'AttackDebuff', value: 7, status: 'Vulnerable', statusStacks: 1 },
    { type: 'Attack', value: 9 },
    { type: 'Block', value: 6 },
  ],
  dropPool: [
    { type: 'shards', amount: 12, weight: 1 },
    { type: 'equipment', ids: ['piston-arm'], weight: 1 },
  ],
}

const glitchNode: EnemyDefinition = {
  id: 'glitch-node',
  name: 'Glitch Node',
  maxHealth: 24,
  intentPattern: [
    { type: 'Attack', value: 6 },
    { type: 'Buff', value: 1, status: 'Strength' },
    { type: 'Attack', value: 10 },
  ],
  dropPool: [
    { type: 'shards', amount: 9, weight: 1 },
  ],
}

const sentinelShard: EnemyDefinition = {
  id: 'sentinel-shard',
  name: 'Sentinel Shard',
  maxHealth: 42,
  intentPattern: [
    { type: 'Attack', value: 8 },
    { type: 'Block', value: 8 },
    { type: 'Attack', value: 14 },
  ],
  dropPool: [
    { type: 'shards', amount: 11, weight: 2 },
    { type: 'part', ids: ['reactive-frame'], weight: 1 },
  ],
}

const hollowRepeater: EnemyDefinition = {
  id: 'hollow-repeater',
  name: 'Hollow Repeater',
  maxHealth: 38,
  intentPattern: [
    { type: 'Attack', value: 3, hits: 2 },
    { type: 'Buff', value: 1, status: 'Strength' },
    { type: 'Attack', value: 3, hits: 3 },
  ],
  dropPool: [
    { type: 'shards', amount: 8, weight: 1 },
    { type: 'equipment', ids: ['welding-torch'], weight: 1 },
  ],
}

const driftingFrame: EnemyDefinition = {
  id: 'drifting-frame',
  name: 'Drifting Frame',
  maxHealth: 52,
  intentPattern: [
    { type: 'Attack', value: 11 },
    { type: 'Debuff', value: 2, status: 'Vulnerable' },
    { type: 'Attack', value: 7 },
  ],
  dropPool: [
    { type: 'shards', amount: 13, weight: 2 },
    { type: 'part', ids: ['scrap-recycler', 'ablative-shell'], weight: 1 },
    { type: 'equipment', ids: ['worn-actuators'], weight: 1 },
  ],
}

const echoConstruct: EnemyDefinition = {
  id: 'echo-construct',
  name: 'Echo Construct',
  maxHealth: 60,
  intentPattern: [
    { type: 'Attack', value: 10 },
    { type: 'Attack', value: 12 },
    { type: 'Debuff', value: 2, status: 'Weak' },
    { type: 'Attack', value: 12 },
  ],
  dropPool: [
    { type: 'shards', amount: 15, weight: 1 },
    { type: 'part', ids: ['frost-core'], weight: 1 },
  ],
}

const thermalScanner: EnemyDefinition = {
  id: 'thermal-scanner',
  name: 'Thermal Scanner',
  maxHealth: 35,
  intentPattern: [
    { type: 'Scan', value: 0 },
    { type: 'Debuff', value: 1, status: 'Vulnerable' },
    { type: 'Attack', value: 12 },
    { type: 'Block', value: 6 },
  ],
  dropPool: [
    { type: 'shards', amount: 10, weight: 2 },
    { type: 'equipment', ids: ['worn-actuators', 'basic-scanner'], weight: 1 },
  ],
}

const signalJammer: EnemyDefinition = {
  id: 'signal-jammer',
  name: 'Signal Jammer',
  maxHealth: 30,
  intentPattern: [
    { type: 'DisableSlot', value: 0, targetSlot: 'Arms' },
    { type: 'Attack', value: 8 },
    { type: 'Attack', value: 10 },
  ],
  dropPool: [
    { type: 'shards', amount: 9, weight: 2 },
    { type: 'equipment', ids: ['worn-actuators', 'basic-scanner'], weight: 1 },
  ],
}

// ─── Sector 1 Elite Enemies ─────────────────────────────────────────────────────

const vaultKeeper: EnemyDefinition = {
  id: 'vault-keeper',
  name: 'Vault Keeper',
  maxHealth: 85,
  intentPattern: [
    { type: 'Block', value: 12 },
    { type: 'Attack', value: 14 },
    { type: 'AttackDebuff', value: 10, status: 'Vulnerable', statusStacks: 2 },
    { type: 'Attack', value: 18 },
  ],
  dropPool: [
    { type: 'shards', amount: 25, weight: 1 },
    { type: 'part', ids: ['ablative-shell', 'scrap-recycler'], weight: 2 },
    { type: 'equipment', ids: ['basic-scanner', 'patched-hull'], weight: 1 },
  ],
  isElite: true,
}

const corruptedOverseer: EnemyDefinition = {
  id: 'corrupted-overseer',
  name: 'Corrupted Overseer',
  maxHealth: 90,
  intentPattern: [
    { type: 'Buff', value: 2, status: 'Strength' },
    { type: 'Attack', value: 16 },
    { type: 'Attack', value: 16 },
    { type: 'Debuff', value: 3, status: 'Weak' },
  ],
  dropPool: [
    { type: 'shards', amount: 30, weight: 1 },
    { type: 'part', ids: ['frost-core', 'scrap-recycler'], weight: 2 },
  ],
  isElite: true,
}

const fractureTitan: EnemyDefinition = {
  id: 'fracture-titan',
  name: 'Fracture Titan',
  maxHealth: 95,
  intentPattern: [
    { type: 'Block', value: 15 },
    { type: 'Attack', value: 20 },
    { type: 'Block', value: 15 },
    { type: 'Attack', value: 20 },
    { type: 'AttackDebuff', value: 12, status: 'Vulnerable', statusStacks: 3 },
  ],
  dropPool: [
    { type: 'shards', amount: 35, weight: 1 },
    { type: 'part', ids: ['reactive-frame', 'ablative-shell'], weight: 2 },
    { type: 'equipment', ids: ['cracked-lens', 'salvaged-treads'], weight: 1 },
  ],
  isElite: true,
}

// ─── Sector 1 Boss ──────────────────────────────────────────────────────────────

const theFirstWarden: EnemyDefinition = {
  id: 'the-first-warden',
  name: 'The First Warden',
  maxHealth: 120,
  intentPattern: [
    { type: 'Block', value: 10 },
    { type: 'Attack', value: 16 },
    { type: 'AttackDebuff', value: 14, status: 'Weak', statusStacks: 2 },
    { type: 'Buff', value: 2, status: 'Strength' },
    { type: 'Attack', value: 22 },
    { type: 'Attack', value: 22 },
  ],
  dropPool: [
    { type: 'shards', amount: 60, weight: 1 },
    { type: 'part', ids: ['reactive-frame', 'frost-core', 'ablative-shell'], weight: 3 },
    { type: 'equipment', ids: ['cracked-lens', 'salvaged-treads', 'welding-torch'], weight: 2 },
  ],
  isBoss: true,
  flavorText: 'It does not remember what it was built to protect. It only remembers the door.',
}

// ─── Sector 2 Standard Enemies ──────────────────────────────────────────────────

const thermalLeech: EnemyDefinition = {
  id: 'thermal-leech',
  name: 'Thermal Leech',
  maxHealth: 55,
  intentPattern: [
    { type: 'Absorb', value: 50 },
    { type: 'Attack', value: 10 },
    { type: 'Attack', value: 10 },
  ],
  dropPool: [
    { type: 'shards', amount: 18, weight: 1 },
  ],
}

const wireJammer: EnemyDefinition = {
  id: 'wire-jammer',
  name: 'Wire Jammer',
  maxHealth: 45,
  intentPattern: [
    { type: 'DisableSlot', value: 0, targetSlot: 'Arms' },
    { type: 'Attack', value: 12 },
    { type: 'Block', value: 8 },
  ],
  dropPool: [
    { type: 'shards', amount: 16, weight: 1 },
  ],
}

const slagHeap: EnemyDefinition = {
  id: 'slag-heap',
  name: 'Slag Heap',
  maxHealth: 75,
  intentPattern: [
    { type: 'Block', value: 12 },
    { type: 'Block', value: 12 },
    { type: 'Buff', value: 2, status: 'Strength' },
    { type: 'Attack', value: 14 },
  ],
  dropPool: [
    { type: 'shards', amount: 22, weight: 2 },
    { type: 'part', ids: ['salvage-protocol', 'empty-chamber'], weight: 1 },
    { type: 'equipment', ids: ['reactive-plating', 'heat-shield'], weight: 1 },
  ],
}

const feedbackLoop: EnemyDefinition = {
  id: 'feedback-loop',
  name: 'Feedback Loop',
  maxHealth: 38,
  intentPattern: [
    { type: 'Debuff', value: 2, status: 'Vulnerable' },
    { type: 'Attack', value: 16 },
    { type: 'Attack', value: 16 },
  ],
  dropPool: [
    { type: 'shards', amount: 15, weight: 1 },
  ],
}

const phaseDrone: EnemyDefinition = {
  id: 'phase-drone',
  name: 'Phase Drone',
  maxHealth: 50,
  intentPattern: [
    { type: 'DisableSlot', value: 0, targetSlot: 'Head' },
    { type: 'Attack', value: 9 },
    { type: 'Attack', value: 9 },
  ],
  dropPool: [
    { type: 'shards', amount: 17, weight: 1 },
    { type: 'equipment', ids: ['thermal-imager', 'predictive-array'], weight: 1 },
  ],
}

const furnaceTick: EnemyDefinition = {
  id: 'furnace-tick',
  name: 'Furnace Tick',
  maxHealth: 22,
  intentPattern: [
    { type: 'Absorb', value: 30 },
    { type: 'Attack', value: 6 },
    { type: 'Attack', value: 6 },
  ],
  dropPool: [
    { type: 'shards', amount: 8, weight: 1 },
  ],
}

const staticFrame: EnemyDefinition = {
  id: 'static-frame',
  name: 'Static Frame',
  maxHealth: 65,
  intentPattern: [
    { type: 'Attack', value: 11 },
    { type: 'Block', value: 10 },
    { type: 'AttackDebuff', value: 9, status: 'Weak', statusStacks: 1 },
  ],
  dropPool: [
    { type: 'shards', amount: 20, weight: 1 },
    { type: 'part', ids: ['empty-chamber'], weight: 1 },
  ],
}

const conduitSpider: EnemyDefinition = {
  id: 'conduit-spider',
  name: 'Conduit Spider',
  maxHealth: 48,
  intentPattern: [
    { type: 'DisableSlot', value: 0, targetSlot: 'Legs' },
    { type: 'Attack', value: 10 },
    { type: 'Debuff', value: 2, status: 'Vulnerable' },
  ],
  dropPool: [
    { type: 'shards', amount: 17, weight: 1 },
    { type: 'equipment', ids: ['coolant-injector', 'stabilizer-treads'], weight: 1 },
  ],
}

// ─── Sector 2 Elite Enemies ─────────────────────────────────────────────────────

const overchargeSentinel: EnemyDefinition = {
  id: 'overcharge-sentinel',
  name: 'Overcharge Sentinel',
  maxHealth: 110,
  intentPattern: [
    { type: 'Absorb', value: 60 },
    { type: 'Block', value: 15 },
    { type: 'Attack', value: 18 },
    { type: 'Attack', value: 22 },
  ],
  dropPool: [
    { type: 'shards', amount: 45, weight: 1 },
    { type: 'part', ids: ['failsafe-armor', 'cryo-engine', 'empty-chamber'], weight: 2 },
    { type: 'equipment', ids: ['stabilizer-treads', 'predictive-array'], weight: 1 },
  ],
  isElite: true,
}

const lockdownWarden: EnemyDefinition = {
  id: 'lockdown-warden',
  name: 'Lockdown Warden',
  maxHealth: 100,
  intentPattern: [
    { type: 'DisableSlot', value: 0, targetSlot: 'Arms' },
    { type: 'DisableSlot', value: 0, targetSlot: 'Head' },
    { type: 'Attack', value: 20 },
    { type: 'Attack', value: 20 },
    { type: 'Buff', value: 2, status: 'Strength' },
  ],
  dropPool: [
    { type: 'shards', amount: 50, weight: 1 },
    { type: 'part', ids: ['salvage-protocol', 'empty-chamber'], weight: 2 },
  ],
  isElite: true,
}

const meltdownCore: EnemyDefinition = {
  id: 'meltdown-core',
  name: 'Meltdown Core',
  maxHealth: 120,
  intentPattern: [
    { type: 'Debuff', value: 2, status: 'Vulnerable' },
    { type: 'Absorb', value: 80 },
    { type: 'Attack', value: 25 },
    { type: 'Block', value: 10 },
    { type: 'Attack', value: 18 },
  ],
  dropPool: [
    { type: 'shards', amount: 55, weight: 1 },
    { type: 'part', ids: ['cryo-engine', 'gyro-stabilizer'], weight: 2 },
    { type: 'equipment', ids: ['plasma-cutter', 'heat-shield'], weight: 1 },
  ],
  isElite: true,
}

// ─── Sector 2 Boss ──────────────────────────────────────────────────────────────

const theThermalArbiter: EnemyDefinition = {
  id: 'the-thermal-arbiter',
  name: 'The Thermal Arbiter',
  maxHealth: 200,
  intentPattern: [
    { type: 'Absorb', value: 70 },
    { type: 'DisableSlot', value: 0, targetSlot: 'Legs' },
    { type: 'Attack', value: 18 },
    { type: 'Attack', value: 18 },
    { type: 'Buff', value: 2, status: 'Strength' },
    { type: 'AttackDebuff', value: 22, status: 'Vulnerable', statusStacks: 2 },
    { type: 'Absorb', value: 70 },
    { type: 'Attack', value: 26 },
  ],
  dropPool: [
    { type: 'shards', amount: 80, weight: 1 },
    { type: 'part', ids: ['meltdown-core', 'gyro-stabilizer', 'reactive-frame'], weight: 3 },
    { type: 'equipment', ids: ['arc-welder', 'stabilizer-treads', 'predictive-array'], weight: 2 },
  ],
  isBoss: true,
  flavorText: 'It measures everything. It forgives nothing.',
}

// ─── Encounter Compositions ────────────────────────────────────────────────────

export interface Encounter {
  enemies: string[] // enemy definition IDs
}

export const SECTOR1_ENCOUNTERS: Encounter[] = [
  { enemies: ['wandering-drone'] },
  { enemies: ['rust-guard'] },
  { enemies: ['corroded-sentry'] },
  { enemies: ['fracture-mite', 'fracture-mite'] },
  { enemies: ['iron-crawler'] },
  { enemies: ['glitch-node'] },
  { enemies: ['sentinel-shard'] },
  { enemies: ['hollow-repeater'] },
  { enemies: ['drifting-frame'] },
  { enemies: ['echo-construct'] },
  { enemies: ['wandering-drone', 'fracture-mite'] },
  { enemies: ['corroded-sentry', 'fracture-mite'] },
  { enemies: ['rust-guard', 'glitch-node'] },
  { enemies: ['thermal-scanner'] },
  { enemies: ['thermal-scanner', 'fracture-mite'] },
  { enemies: ['signal-jammer', 'fracture-mite'] },
  { enemies: ['signal-jammer', 'glitch-node'] },
  { enemies: ['iron-crawler', 'fracture-mite', 'fracture-mite'] },
  { enemies: ['corroded-sentry', 'glitch-node'] },
]

export const SECTOR1_ELITE_ENCOUNTERS: Encounter[] = [
  { enemies: ['vault-keeper'] },
  { enemies: ['corrupted-overseer'] },
  { enemies: ['fracture-titan'] },
]

export const SECTOR2_ENCOUNTERS: Encounter[] = [
  { enemies: ['wire-jammer', 'feedback-loop'] },
  { enemies: ['furnace-tick', 'furnace-tick', 'furnace-tick'] },
  { enemies: ['thermal-leech', 'static-frame'] },
  { enemies: ['phase-drone', 'conduit-spider'] },
  { enemies: ['slag-heap', 'furnace-tick', 'furnace-tick'] },
  { enemies: ['static-frame', 'static-frame'] },
  { enemies: ['thermal-leech', 'feedback-loop'] },
  { enemies: ['wire-jammer', 'phase-drone'] },
  { enemies: ['conduit-spider', 'static-frame'] },
  { enemies: ['slag-heap'] },
]

export const SECTOR2_ELITE_ENCOUNTERS: Encounter[] = [
  { enemies: ['overcharge-sentinel'] },
  { enemies: ['lockdown-warden'] },
  { enemies: ['meltdown-core'] },
]

// ─── Exports ─────────────────────────────────────────────────────────────────

export const SECTOR1_ENEMIES: EnemyDefinition[] = [
  wanderingDrone, rustGuard, corrodedSentry, fractureMite, ironCrawler,
  glitchNode, sentinelShard, hollowRepeater, driftingFrame, echoConstruct,
  thermalScanner, signalJammer,
]

export const SECTOR1_ELITES: EnemyDefinition[] = [
  vaultKeeper, corruptedOverseer, fractureTitan,
]

export const SECTOR1_BOSS: EnemyDefinition = theFirstWarden

export const SECTOR2_ENEMIES: EnemyDefinition[] = [
  thermalLeech, wireJammer, slagHeap, feedbackLoop,
  phaseDrone, furnaceTick, staticFrame, conduitSpider,
]

export const SECTOR2_ELITES: EnemyDefinition[] = [
  overchargeSentinel, lockdownWarden, meltdownCore,
]

export const SECTOR2_BOSS: EnemyDefinition = theThermalArbiter

export const ALL_ENEMIES: Record<string, EnemyDefinition> = Object.fromEntries(
  [
    ...SECTOR1_ENEMIES, ...SECTOR1_ELITES, SECTOR1_BOSS,
    ...SECTOR2_ENEMIES, ...SECTOR2_ELITES, SECTOR2_BOSS,
  ].map((e) => [e.id, e])
)
