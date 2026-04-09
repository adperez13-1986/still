/**
 * Strain Combat Simulator CLI
 *
 * Usage:
 *   npx tsx src/sim/strainCli.ts [options]
 *
 * Options:
 *   --runs N          Number of simulations (default: 1000)
 *   --seed N          RNG seed (default: random)
 *   --enemies PRESET  Enemy preset: reactive, s1, or comma-separated IDs
 *   --health N        Starting HP (default: 70)
 *   --strain N        Starting strain (default: 2)
 *   --verbose         Print each combat result
 */

import { createRng } from './rng'
import { simulateStrainCombat, type StrainSimLoadout, type StrainSimResult } from './strainRunner'
import {
  ALL_ENEMIES,
  SECTOR1_REACTIVE_ENCOUNTERS,
  SECTOR1_ENCOUNTERS,
} from '../data/enemies'
import { STARTING_SLOT_LAYOUT } from '../data/actions'
import type { EnemyDefinition, SlotLayout } from '../game/types'

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

function resolveEncounters(preset: string): EnemyDefinition[][] {
  if (preset === 'reactive') {
    return SECTOR1_REACTIVE_ENCOUNTERS.map(enc =>
      enc.enemies.map(id => {
        const def = ALL_ENEMIES[id]
        if (!def) throw new Error(`Unknown enemy: ${id}`)
        return def
      })
    )
  }
  if (preset === 's1') {
    return SECTOR1_ENCOUNTERS.map(enc =>
      enc.enemies.map(id => {
        const def = ALL_ENEMIES[id]
        if (!def) throw new Error(`Unknown enemy: ${id}`)
        return def
      })
    )
  }
  if (preset === 'all') {
    return [...SECTOR1_ENCOUNTERS, ...SECTOR1_REACTIVE_ENCOUNTERS].map(enc =>
      enc.enemies.map(id => {
        const def = ALL_ENEMIES[id]
        if (!def) throw new Error(`Unknown enemy: ${id}`)
        return def
      })
    )
  }
  const ids = preset.split(',')
  return [ids.map(id => {
    const def = ALL_ENEMIES[id.trim()]
    if (!def) throw new Error(`Unknown enemy: ${id.trim()}`)
    return def
  })]
}

function encounterLabel(defs: EnemyDefinition[]): string {
  const counts = new Map<string, number>()
  for (const d of defs) counts.set(d.name, (counts.get(d.name) ?? 0) + 1)
  return [...counts.entries()]
    .map(([name, n]) => n > 1 ? `${name} \u00d7${n}` : name)
    .join(' + ')
}

function bar(pct: number, width = 20): string {
  const filled = Math.round(pct * width)
  return '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled)
}

function main() {
  const opts = parseArgs((globalThis as any).process.argv)

  const runs = parseInt(opts['runs'] ?? '1000', 10)
  const seed = opts['seed'] ? parseInt(opts['seed'], 10) : Math.floor(Math.random() * 1_000_000)
  const health = parseInt(opts['health'] ?? '70', 10)
  const strain = parseInt(opts['strain'] ?? '2', 10)
  const verbose = 'verbose' in opts
  const enemyPreset = opts['enemies'] ?? 'reactive'
  const combatsCleared = parseInt(opts['combats-cleared'] ?? '0', 10)

  const encounterGroups = resolveEncounters(enemyPreset)

  const slotLayout: SlotLayout = { slots: [...STARTING_SLOT_LAYOUT] }

  const loadout: StrainSimLoadout = {
    health,
    maxHealth: health,
    strain,
    slotLayout,
    combatsCleared,
  }

  console.log(`\nStrain Combat Simulator`)
  console.log(`${'='.repeat(50)}`)
  console.log(`  Runs: ${runs}  Seed: ${seed}`)
  console.log(`  HP: ${health}  Strain: ${strain}/20`)
  console.log(`  Slots: ${slotLayout.slots.filter(Boolean).join(', ')}`)
  console.log(`  Enemies: ${enemyPreset} (${encounterGroups.length} encounter types)`)
  console.log()

  const results: StrainSimResult[] = []
  const t0 = Date.now()

  for (let i = 0; i < runs; i++) {
    const runRng = createRng(seed + i)
    const groupIdx = Math.floor(runRng() * encounterGroups.length)
    const enemyDefs = encounterGroups[groupIdx]
    const label = encounterLabel(enemyDefs)

    const result = simulateStrainCombat(loadout, enemyDefs, label, runRng)
    results.push(result)

    if (verbose) {
      console.log(`  #${i + 1}: ${result.outcome.toUpperCase().padEnd(7)} ${result.turns}t  HP:${result.hpRemaining}  Strain:${result.strainEnd}  vs ${label}`)
    }
  }

  const elapsed = Date.now() - t0

  const wins = results.filter(r => r.outcome === 'win')
  const losses = results.filter(r => r.outcome === 'loss')
  const forfeits = results.filter(r => r.outcome === 'forfeit')

  const winRate = wins.length / results.length
  const avgTurns = results.reduce((s, r) => s + r.turns, 0) / results.length
  const avgHpLeft = wins.length > 0 ? wins.reduce((s, r) => s + r.hpRemaining, 0) / wins.length : 0
  const avgStrainEnd = results.reduce((s, r) => s + r.strainEnd, 0) / results.length

  console.log(`${'='.repeat(50)}`)
  console.log(`  Win Rate:     ${(winRate * 100).toFixed(1)}%  (${wins.length}W / ${losses.length}L / ${forfeits.length}F)`)
  console.log(`  Avg Turns:    ${avgTurns.toFixed(1)}`)
  console.log(`  Avg HP Left:  ${avgHpLeft.toFixed(1)} (on wins)`)
  console.log(`  Avg Strain:   ${avgStrainEnd.toFixed(1)} (at combat end)`)
  console.log()

  const byEncounter = new Map<string, StrainSimResult[]>()
  for (const r of results) {
    const arr = byEncounter.get(r.encounter) ?? []
    arr.push(r)
    byEncounter.set(r.encounter, arr)
  }

  const sorted = [...byEncounter.entries()]
    .map(([enc, rs]) => ({
      enc,
      total: rs.length,
      winRate: rs.filter(r => r.outcome === 'win').length / rs.length,
      avgTurns: rs.reduce((s, r) => s + r.turns, 0) / rs.length,
      forfeitRate: rs.filter(r => r.outcome === 'forfeit').length / rs.length,
    }))
    .sort((a, b) => a.winRate - b.winRate)

  if (sorted.length > 1) {
    console.log('  Win Rate by Encounter:')
    const maxLen = Math.min(35, Math.max(...sorted.map(e => e.enc.length)))
    for (const e of sorted) {
      const name = e.enc.length > maxLen ? e.enc.slice(0, maxLen - 1) + '\u2026' : e.enc.padEnd(maxLen)
      const pct = `${(e.winRate * 100).toFixed(1)}%`.padStart(6)
      console.log(`    ${name}  ${bar(e.winRate, 10)} ${pct}  (${Math.round(e.winRate * e.total)}/${e.total})  ~${e.avgTurns.toFixed(1)}t${e.forfeitRate > 0 ? `  ${(e.forfeitRate * 100).toFixed(0)}%F` : ''}`)
    }
    console.log()
  }

  console.log(`  ${runs.toLocaleString()} combats in ${elapsed}ms (${(runs / (elapsed / 1000)).toFixed(0)}/sec)`)
  console.log()
}

main()
