import type { EnemyDefinition } from '../game/types'

// ─── Act 1 Standard Enemies ──────────────────────────────────────────────────

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
    { type: 'shards', amount: 8, weight: 3 },
    { type: 'card', ids: ['overcharge', 'spread-shot'], weight: 1 },
  ],
}

const rustGuard: EnemyDefinition = {
  id: 'rust-guard',
  name: 'Rust Guard',
  maxHealth: 55,
  intentPattern: [
    { type: 'Block', value: 8 },
    { type: 'Attack', value: 10 },
  ],
  dropPool: [
    { type: 'shards', amount: 10, weight: 2 },
    { type: 'part', ids: ['salvaged-plating'], weight: 1 },
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
    { type: 'shards', amount: 7, weight: 3 },
    { type: 'card', ids: ['heat-vent', 'shield-bash'], weight: 1 },
  ],
}

const fractureMite: EnemyDefinition = {
  id: 'fracture-mite',
  name: 'Fracture Mite',
  maxHealth: 16,
  intentPattern: [
    { type: 'Attack', value: 4 },
    { type: 'Attack', value: 4 },
  ],
  dropPool: [
    { type: 'shards', amount: 5, weight: 4 },
    { type: 'card', ids: ['coolant-flush', 'diagnostics'], weight: 1 },
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
    { type: 'shards', amount: 12, weight: 2 },
    { type: 'card', ids: ['overcharge', 'emergency-shield'], weight: 1 },
    { type: 'equipment', ids: ['piston-arm'], weight: 1 },
  ],
}

const glitchNode: EnemyDefinition = {
  id: 'glitch-node',
  name: 'Glitch Node',
  maxHealth: 24,
  intentPattern: [
    { type: 'Buff', value: 1, status: 'Strength' },
    { type: 'Attack', value: 8 },
    { type: 'Attack', value: 8 },
  ],
  dropPool: [
    { type: 'shards', amount: 9, weight: 3 },
    { type: 'card', ids: ['thermal-surge', 'echo-protocol'], weight: 1 },
  ],
}

const sentinelShard: EnemyDefinition = {
  id: 'sentinel-shard',
  name: 'Sentinel Shard',
  maxHealth: 42,
  intentPattern: [
    { type: 'Block', value: 8 },
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
    { type: 'Attack', value: 3 },
    { type: 'Attack', value: 3 },
    { type: 'Attack', value: 3 },
    { type: 'Block', value: 4 },
  ],
  dropPool: [
    { type: 'shards', amount: 8, weight: 3 },
    { type: 'card', ids: ['spread-shot', 'heat-vent'], weight: 1 },
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
    { type: 'part', ids: ['scavenger-lens', 'cooling-fins'], weight: 1 },
    { type: 'equipment', ids: ['worn-actuators'], weight: 1 },
  ],
}

const echoConstruct: EnemyDefinition = {
  id: 'echo-construct',
  name: 'Echo Construct',
  maxHealth: 60,
  intentPattern: [
    { type: 'Block', value: 7 },
    { type: 'Attack', value: 12 },
    { type: 'Debuff', value: 2, status: 'Weak' },
    { type: 'Attack', value: 12 },
  ],
  dropPool: [
    { type: 'shards', amount: 15, weight: 2 },
    { type: 'card', ids: ['quick-scan', 'meltdown'], weight: 1 },
    { type: 'part', ids: ['optical-expander'], weight: 1 },
  ],
}

// ─── Act 1 Elite Enemies ─────────────────────────────────────────────────────

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
    { type: 'part', ids: ['reinforced-joints', 'tension-spring'], weight: 2 },
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
    { type: 'part', ids: ['heat-sink', 'optical-expander'], weight: 2 },
    { type: 'card', ids: ['deep-freeze', 'thermal-surge'], weight: 1 },
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
    { type: 'part', ids: ['reactive-frame', 'cooling-fins'], weight: 2 },
    { type: 'equipment', ids: ['cracked-lens', 'salvaged-treads'], weight: 1 },
  ],
  isElite: true,
}

// ─── Act 1 Boss ──────────────────────────────────────────────────────────────

const theFirstWarden: EnemyDefinition = {
  id: 'the-first-warden',
  name: 'The First Warden',
  maxHealth: 160,
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
    { type: 'part', ids: ['reactive-frame', 'tension-spring', 'cooling-fins'], weight: 3 },
    { type: 'equipment', ids: ['cracked-lens', 'salvaged-treads', 'welding-torch'], weight: 2 },
  ],
  isBoss: true,
  flavorText: 'It does not remember what it was built to protect. It only remembers the door.',
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const ACT1_ENEMIES: EnemyDefinition[] = [
  wanderingDrone, rustGuard, corrodedSentry, fractureMite, ironCrawler,
  glitchNode, sentinelShard, hollowRepeater, driftingFrame, echoConstruct,
]

export const ACT1_ELITES: EnemyDefinition[] = [
  vaultKeeper, corruptedOverseer, fractureTitan,
]

export const ACT1_BOSS: EnemyDefinition = theFirstWarden

export const ALL_ENEMIES: Record<string, EnemyDefinition> = Object.fromEntries(
  [...ACT1_ENEMIES, ...ACT1_ELITES, ACT1_BOSS].map((e) => [e.id, e])
)
