import { createRng } from './rng'
import { simulateCombat, type SimLoadout, type SimCombatResult } from './runner'
import { planTurn } from './heuristic'
import { aggregateResults, formatStats } from './stats'

import { ALL_CARDS, STARTING_CARDS, SECTOR1_CARD_POOL, SECTOR2_CARD_POOL } from '../data/cards'
import {
  ALL_ENEMIES,
  SECTOR1_ENCOUNTERS, SECTOR1_ELITE_ENCOUNTERS,
  SECTOR2_ENCOUNTERS, SECTOR2_ELITE_ENCOUNTERS,
  SECTOR1_BOSS, SECTOR2_BOSS,
} from '../data/enemies'
import {
  ALL_EQUIPMENT, ALL_PARTS,
  STARTING_HEAD, STARTING_TORSO, STARTING_ARMS, STARTING_LEGS,
} from '../data/parts'

import type { BodySlot, EnemyDefinition } from '../game/types'

// ─── Argument Parsing ────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const args = argv.slice(2)
  const opts: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      opts[key] = args[i + 1] ?? ''
      i++
    }
  }
  return opts
}

// ─── Encounter Presets ───────────────────────────────────────────────────────

type Preset = 's1' | 's1-elite' | 's1-boss' | 's2' | 's2-elite' | 's2-boss'

function resolveEncounterPreset(preset: string, _rng: () => number): EnemyDefinition[][] {
  const encounters = (() => {
    switch (preset as Preset) {
      case 's1':       return SECTOR1_ENCOUNTERS
      case 's1-elite': return SECTOR1_ELITE_ENCOUNTERS
      case 's2':       return SECTOR2_ENCOUNTERS
      case 's2-elite': return SECTOR2_ELITE_ENCOUNTERS
      case 's1-boss':  return [{ enemies: [SECTOR1_BOSS.id] }]
      case 's2-boss':  return [{ enemies: [SECTOR2_BOSS.id] }]
      default:         return null
    }
  })()

  if (encounters) {
    return encounters.map(enc =>
      enc.enemies.map(id => {
        const def = ALL_ENEMIES[id]
        if (!def) throw new Error(`Unknown enemy: ${id}`)
        return def
      })
    )
  }

  // Treat as comma-separated enemy IDs (single encounter)
  const ids = preset.split(',')
  return [ids.map(id => {
    const def = ALL_ENEMIES[id.trim()]
    if (!def) throw new Error(`Unknown enemy: ${id.trim()}. Available: ${Object.keys(ALL_ENEMIES).join(', ')}`)
    return def
  })]
}

// ─── Loadout Resolution ──────────────────────────────────────────────────────

function resolveEquipment(spec: string | undefined): Record<BodySlot, import('../game/types').EquipmentDefinition | null> {
  if (!spec || spec === 'default') {
    return { Head: STARTING_HEAD, Torso: STARTING_TORSO, Arms: STARTING_ARMS, Legs: STARTING_LEGS }
  }
  const result: Record<BodySlot, import('../game/types').EquipmentDefinition | null> = {
    Head: null, Torso: null, Arms: null, Legs: null,
  }
  for (const part of spec.split(',')) {
    const id = part.trim()
    const equip = ALL_EQUIPMENT[id]
    if (!equip) throw new Error(`Unknown equipment: ${id}. Available: ${Object.keys(ALL_EQUIPMENT).join(', ')}`)
    result[equip.slot] = equip
  }
  return result
}

function resolveParts(spec: string | undefined): import('../game/types').BehavioralPartDefinition[] {
  if (!spec) return []
  return spec.split(',').map(id => {
    const part = ALL_PARTS[id.trim()]
    if (!part) throw new Error(`Unknown part: ${id.trim()}. Available: ${Object.keys(ALL_PARTS).join(', ')}`)
    return part
  })
}

function resolveDeck(spec: string | undefined): string[] {
  const starterIds = STARTING_CARDS.map(c => c.id)

  if (!spec || spec === 'default') return starterIds
  if (spec === 's1-pool') return [...starterIds, ...SECTOR1_CARD_POOL.slice(0, 4).map(c => c.id)]
  if (spec === 's2-pool') return [...starterIds, ...SECTOR1_CARD_POOL.slice(0, 4).map(c => c.id), ...SECTOR2_CARD_POOL.slice(0, 2).map(c => c.id)]

  // "raw:" prefix = full custom deck (no starters prepended)
  // Supports "+" suffix for upgraded cards (e.g., "overclock+")
  const isRaw = spec.startsWith('raw:')
  const cardSpec = isRaw ? spec.slice(4) : spec

  const parsed = cardSpec.split(',').map(raw => {
    const trimmed = raw.trim()
    const isUpgraded = trimmed.endsWith('+')
    const id = isUpgraded ? trimmed.slice(0, -1) : trimmed
    const card = ALL_CARDS[id]
    if (!card) throw new Error(`Unknown card: ${id}. Available: ${Object.keys(ALL_CARDS).join(', ')}`)
    // Encode upgrade in the ID so the runner can parse it
    return isUpgraded ? `${card.id}+` : card.id
  })

  return isRaw ? parsed : [...starterIds, ...parsed]
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs((globalThis as any).process.argv)

  const runs = parseInt(opts['runs'] ?? '1000', 10)
  const seed = opts['seed'] ? parseInt(opts['seed'], 10) : Math.floor(Math.random() * 1_000_000)
  const health = parseInt(opts['health'] ?? '40', 10)
  const combatsCleared = parseInt(opts['combats-cleared'] ?? '0', 10)
  const verbose = 'verbose' in opts
  const traceMode = 'trace' in opts
  const enemyPreset = opts['enemies'] ?? 's1'

  // Resolve encounter groups
  const masterRng = createRng(seed)
  const encounterGroups = resolveEncounterPreset(enemyPreset, masterRng)

  const loadout: SimLoadout = {
    deck: resolveDeck(opts['cards']),
    equipment: resolveEquipment(opts['equipment']),
    parts: resolveParts(opts['parts']),
    health,
    maxHealth: health,
    drawCount: 3,
    combatsCleared,
  }

  // Validate deck (strip "+" suffix for lookup)
  for (const rawId of loadout.deck) {
    const id = rawId.endsWith('+') ? rawId.slice(0, -1) : rawId
    if (!ALL_CARDS[id]) throw new Error(`Unknown card in deck: ${id}`)
  }

  // Build encounter labels (collapse duplicates: "Furnace Tick ×3")
  function encounterLabel(defs: EnemyDefinition[]): string {
    const counts = new Map<string, number>()
    for (const d of defs) counts.set(d.name, (counts.get(d.name) ?? 0) + 1)
    return [...counts.entries()]
      .map(([name, n]) => n > 1 ? `${name} \u00d7${n}` : name)
      .join(' + ')
  }

  const results: SimCombatResult[] = []
  const t0 = Date.now()

  for (let i = 0; i < runs; i++) {
    const runRng = createRng(seed + i)
    // Pick a random encounter from the preset group
    const groupIdx = Math.floor(runRng() * encounterGroups.length)
    const enemyDefs = encounterGroups[groupIdx]
    const label = encounterLabel(enemyDefs)

    const result = simulateCombat(loadout, enemyDefs, ALL_CARDS, ALL_ENEMIES, planTurn, runRng, label, traceMode)
    results.push(result)

    if (traceMode && result.traces) {
      console.log(`\n${'═'.repeat(60)}`)
      console.log(`  Combat #${i + 1} vs ${label}`)
      console.log(`${'═'.repeat(60)}`)
      for (const t of result.traces) {
        console.log(`\n  ── Turn ${t.turn} ──  HP: ${t.hp}  Block: ${t.block}  Energy: ${t.energy}`)
        for (const e of t.enemies) {
          console.log(`    ${e.name}: ${e.hp}/${e.maxHp} HP  → ${e.intent}`)
        }
        console.log(`    Threat: ${t.threat}  Block ceiling: ${t.blockCeiling}  Mode: ${t.mode}${t.shouldDig ? ' (dig)' : ''}`)
        console.log(`    Hand: [${t.hand.join(', ')}]`)
        if (t.picks.length > 0) {
          console.log(`    Plays:`)
          for (const p of t.picks) {
            console.log(`      ✓ ${p.card}${p.slot ? ' → ' + p.slot : ''}  (score: ${p.score.toFixed(1)}, eff: ${p.efficiency.toFixed(1)})`)
          }
        }
        if (t.skipped.length > 0) {
          console.log(`    Considered:`)
          for (const s of t.skipped) {
            console.log(`      · ${s.card}${s.slot ? ' → ' + s.slot : ''}  (score: ${s.score.toFixed(1)}, eff: ${s.efficiency.toFixed(1)})`)
          }
        }
      }
      console.log(`\n  Result: ${result.outcome.toUpperCase()} in ${result.turns}t  HP: ${result.hpRemaining}/${health}`)
    } else if (verbose) {
      console.log(`  #${i + 1}: ${result.outcome.toUpperCase()} in ${result.turns}t  HP: ${result.hpRemaining}/${health}  vs ${label}`)
    }
  }

  const elapsed = Date.now() - t0
  const stats = aggregateResults(results)

  console.log()
  console.log(formatStats(stats, seed, combatsCleared))
  console.log(`  ${runs.toLocaleString()} combats in ${elapsed}ms (${(runs / (elapsed / 1000)).toFixed(0)}/sec)`)
  console.log()
}

main()
