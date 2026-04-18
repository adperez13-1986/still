/**
 * Strain Combat Simulator CLI
 *
 * Usage:
 *   npx tsx src/sim/strainCli.ts [options]
 *
 * Modes:
 *   (default)        Single-combat simulation against encounter pool
 *   --mode run       Full sector 1 run: ~8 combats + boss with rewards
 *
 * Options:
 *   --runs N          Number of simulations (default: 1000)
 *   --seed N          RNG seed (default: random)
 *   --enemies PRESET  Enemy preset: reactive, s1, or comma-separated IDs
 *   --health N        Starting HP (default: 70)
 *   --strain N        Starting strain (default: 2)
 *   --combats N       Combats before boss in run mode (default: 8)
 *   --profile NAME    Heuristic profile: balanced | defensive | aggressive (default: balanced)
 *   --verbose         Print each combat/run result
 */

import { createRng } from './rng'
import { simulateStrainCombat, type StrainSimLoadout, type StrainSimResult } from './strainRunner'
import { simulateRun, type RunSimConfig, type RunSimResult } from './strainRunSim'
import {
  ALL_ENEMIES,
  SECTOR1_REACTIVE_ENCOUNTERS,
  SECTOR1_ENCOUNTERS,
  SECTOR1_ELITE_ENCOUNTERS,
  SECTOR1_BOSS,
} from '../data/enemies'
import { STARTING_SLOT_LAYOUT } from '../data/actions'
import { getProfile } from './strainProfiles'
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

// ─── Single-Combat Mode ──────────────────────────────────────────────────

function runSingleCombatMode(opts: Record<string, string>) {
  const runs = parseInt(opts['runs'] ?? '1000', 10)
  const seed = opts['seed'] ? parseInt(opts['seed'], 10) : Math.floor(Math.random() * 1_000_000)
  const health = parseInt(opts['health'] ?? '70', 10)
  const strain = parseInt(opts['strain'] ?? '2', 10)
  const verbose = 'verbose' in opts
  const enemyPreset = opts['enemies'] ?? 'reactive'
  const combatsCleared = parseInt(opts['combats-cleared'] ?? '0', 10)
  const profile = getProfile(opts['profile'] ?? 'balanced')

  const encounterGroups = resolveEncounters(enemyPreset)
  const slotLayout: SlotLayout = { slots: [...STARTING_SLOT_LAYOUT] }

  const loadout: StrainSimLoadout = {
    health,
    maxHealth: health,
    strain,
    slotLayout,
    combatsCleared,
    profile,
  }

  console.log(`\nStrain Combat Simulator (single-combat)`)
  console.log(`${'='.repeat(50)}`)
  console.log(`  Runs: ${runs}  Seed: ${seed}`)
  console.log(`  Profile: ${profile.name}`)
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
  printSingleCombatStats(results, runs, elapsed)
}

function printSingleCombatStats(results: StrainSimResult[], runs: number, elapsed: number) {
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

// ─── Full Run Mode ───────────────────────────────────────────────────────

function runFullRunMode(opts: Record<string, string>) {
  const runs = parseInt(opts['runs'] ?? '500', 10)
  const seed = opts['seed'] ? parseInt(opts['seed'], 10) : Math.floor(Math.random() * 1_000_000)
  const health = parseInt(opts['health'] ?? '70', 10)
  const strain = parseInt(opts['strain'] ?? '2', 10)
  const combatsBeforeBoss = parseInt(opts['combats'] ?? '8', 10)
  const verbose = 'verbose' in opts
  const profile = getProfile(opts['profile'] ?? 'balanced')

  // Build encounter pools
  const standardPool = resolveEncounters('reactive')
  const elitePool = SECTOR1_ELITE_ENCOUNTERS.map(enc =>
    enc.enemies.map(id => {
      const def = ALL_ENEMIES[id]
      if (!def) throw new Error(`Unknown enemy: ${id}`)
      return def
    })
  )
  const boss = [SECTOR1_BOSS]

  console.log(`\nStrain Run Simulator (full sector 1)`)
  console.log(`${'='.repeat(55)}`)
  console.log(`  Runs: ${runs}  Seed: ${seed}`)
  console.log(`  Profile: ${profile.name}`)
  console.log(`  HP: ${health}  Strain: ${strain}/20`)
  console.log(`  Combats before boss: ${combatsBeforeBoss}`)
  console.log(`  Starting slots: ${STARTING_SLOT_LAYOUT.filter(Boolean).join(', ')}`)
  console.log()

  const results: RunSimResult[] = []
  const t0 = Date.now()

  for (let i = 0; i < runs; i++) {
    const rng = createRng(seed + i)

    // Generate encounter sequence: ~combatsBeforeBoss standard + 1 elite + boss
    const encounters: EnemyDefinition[][] = []
    for (let c = 0; c < combatsBeforeBoss; c++) {
      // 20% elite chance after combat 3
      if (c >= 3 && rng() < 0.2 && elitePool.length > 0) {
        encounters.push(elitePool[Math.floor(rng() * elitePool.length)])
      } else {
        encounters.push(standardPool[Math.floor(rng() * standardPool.length)])
      }
    }

    const config: RunSimConfig = {
      encounters,
      boss,
      startingHealth: health,
      startingStrain: strain,
      profile,
    }

    const result = simulateRun(config, rng)
    results.push(result)

    if (verbose) {
      const slots = result.finalSlots.map(s => s ? (s.length > 8 ? s.slice(0, 7) + '.' : s) : '-').join(', ')
      console.log(`  #${i + 1}: ${result.outcome.toUpperCase().padEnd(13)} ${result.combatsWon}/${result.totalCombats} fights  HP:${result.finalHealth}  Strain:${result.finalStrain}  [${slots}]${result.deathEncounter ? `  died: ${result.deathEncounter}` : ''}`)
    }
  }

  const elapsed = Date.now() - t0
  printRunStats(results, runs, elapsed, combatsBeforeBoss)
}

function printRunStats(results: RunSimResult[], runs: number, elapsed: number, combatsBeforeBoss: number) {
  const victories = results.filter(r => r.outcome === 'victory')
  const deaths = results.filter(r => r.outcome === 'death')
  const forfeitDeaths = results.filter(r => r.outcome === 'forfeit_death')

  const victoryRate = victories.length / results.length
  const avgCombatsWon = results.reduce((s, r) => s + r.combatsWon, 0) / results.length
  const avgFinalHp = victories.length > 0 ? victories.reduce((s, r) => s + r.finalHealth, 0) / victories.length : 0
  const avgFinalStrain = results.reduce((s, r) => s + r.finalStrain, 0) / results.length
  const avgActionsAcquired = results.reduce((s, r) => s + r.acquiredActions.length, 0) / results.length

  console.log(`${'='.repeat(55)}`)
  console.log(`  Victory Rate:   ${(victoryRate * 100).toFixed(1)}%  (${victories.length}V / ${deaths.length}D / ${forfeitDeaths.length}FD)`)
  console.log(`  Avg Combats Won: ${avgCombatsWon.toFixed(1)} / ${combatsBeforeBoss + 1}`)
  console.log(`  Avg HP (wins):  ${avgFinalHp.toFixed(1)}`)
  console.log(`  Avg Strain:     ${avgFinalStrain.toFixed(1)}`)
  console.log(`  Avg Actions:    ${avgActionsAcquired.toFixed(1)} found`)
  console.log()

  // Death encounter breakdown
  const deathBy = new Map<string, number>()
  for (const r of [...deaths, ...forfeitDeaths]) {
    if (r.deathEncounter) {
      deathBy.set(r.deathEncounter, (deathBy.get(r.deathEncounter) ?? 0) + 1)
    }
  }
  if (deathBy.size > 0) {
    const totalDeaths = deaths.length + forfeitDeaths.length
    console.log('  Deaths by Encounter:')
    const sorted = [...deathBy.entries()].sort((a, b) => b[1] - a[1])
    const maxLen = Math.min(35, Math.max(...sorted.map(e => e[0].length)))
    for (const [enc, count] of sorted.slice(0, 10)) {
      const name = enc.length > maxLen ? enc.slice(0, maxLen - 1) + '\u2026' : enc.padEnd(maxLen)
      const pct = `${(count / totalDeaths * 100).toFixed(1)}%`.padStart(6)
      console.log(`    ${name}  ${bar(count / totalDeaths, 10)} ${pct}  (${count})`)
    }
    console.log()
  }

  // Death timing: which combat # do runs die at?
  const deathAt = new Map<number, number>()
  for (const r of [...deaths, ...forfeitDeaths]) {
    deathAt.set(r.combatsWon, (deathAt.get(r.combatsWon) ?? 0) + 1)
  }
  if (deathAt.size > 0) {
    console.log('  Death Timing:')
    const sorted = [...deathAt.entries()].sort((a, b) => a[0] - b[0])
    for (const [combat, count] of sorted) {
      const label = combat === combatsBeforeBoss ? 'Boss' : `Combat ${combat + 1}`
      console.log(`    ${label.padEnd(12)}  ${count} deaths`)
    }
    console.log()
  }

  // Most popular acquired actions
  const actionCounts = new Map<string, number>()
  for (const r of results) {
    for (const a of r.acquiredActions) {
      actionCounts.set(a, (actionCounts.get(a) ?? 0) + 1)
    }
  }
  if (actionCounts.size > 0) {
    console.log('  Most Acquired Actions:')
    const sorted = [...actionCounts.entries()].sort((a, b) => b[1] - a[1])
    for (const [action, count] of sorted.slice(0, 8)) {
      console.log(`    ${action.padEnd(16)}  ${count} runs (${(count / results.length * 100).toFixed(0)}%)`)
    }
    console.log()
  }

  console.log(`  ${runs.toLocaleString()} runs in ${elapsed}ms (${(runs / (elapsed / 1000)).toFixed(0)}/sec)`)
  console.log()
}

// ─── Main ────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs((globalThis as any).process.argv)
  const mode = opts['mode'] ?? 'single'

  if (mode === 'run') {
    runFullRunMode(opts)
  } else {
    runSingleCombatMode(opts)
  }
}

main()
