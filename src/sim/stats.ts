import type { SimCombatResult } from './runner'

export interface EncounterStats {
  encounter: string
  total: number
  wins: number
  winRate: number
  avgTurns: number
}

export interface AggregateStats {
  total: number
  wins: number
  losses: number
  winRate: number
  avgTurns: number
  turnStdDev: number
  avgHpRemaining: number  // on wins only
  avgHpLost: number       // across all combats
  turnBuckets: { label: string; count: number; pct: number }[]
  deathByTurn: { turn: number; count: number; pct: number }[]
  timeouts: number
  byEncounter: EncounterStats[]
}

export function aggregateResults(results: SimCombatResult[]): AggregateStats {
  const total = results.length
  const wins = results.filter(r => r.outcome === 'win')
  const losses = results.filter(r => r.outcome === 'loss')
  const timeouts = losses.filter(r => r.turns >= 50).length

  const winRate = total > 0 ? wins.length / total : 0
  const allTurns = results.map(r => r.turns)
  const avgTurns = allTurns.reduce((s, t) => s + t, 0) / (total || 1)
  const variance = allTurns.reduce((s, t) => s + (t - avgTurns) ** 2, 0) / (total || 1)
  const turnStdDev = Math.sqrt(variance)

  const avgHpRemaining = wins.length > 0
    ? wins.reduce((s, r) => s + r.hpRemaining, 0) / wins.length
    : 0

  const avgHpLost = total > 0
    ? results.reduce((s, r) => s + r.hpLost, 0) / total
    : 0

  // Turn distribution buckets
  const bucketDefs = [
    { label: '1-2', min: 1, max: 2 },
    { label: '3-4', min: 3, max: 4 },
    { label: '5-6', min: 5, max: 6 },
    { label: '7-8', min: 7, max: 8 },
    { label: '9-10', min: 9, max: 10 },
    { label: '11+', min: 11, max: Infinity },
  ]
  const turnBuckets = bucketDefs.map(b => {
    const count = results.filter(r => r.turns >= b.min && r.turns <= b.max).length
    return { label: b.label, count, pct: total > 0 ? count / total : 0 }
  })

  // Deaths by turn
  const deathTurns = new Map<number, number>()
  for (const r of losses) {
    deathTurns.set(r.turns, (deathTurns.get(r.turns) ?? 0) + 1)
  }
  const deathByTurn = [...deathTurns.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([turn, count]) => ({ turn, count, pct: total > 0 ? count / total : 0 }))

  // Per-encounter breakdown
  const encounterMap = new Map<string, SimCombatResult[]>()
  for (const r of results) {
    if (!r.encounter) continue
    const arr = encounterMap.get(r.encounter) ?? []
    arr.push(r)
    encounterMap.set(r.encounter, arr)
  }
  const byEncounter: EncounterStats[] = [...encounterMap.entries()]
    .map(([encounter, rs]) => ({
      encounter,
      total: rs.length,
      wins: rs.filter(r => r.outcome === 'win').length,
      winRate: rs.filter(r => r.outcome === 'win').length / rs.length,
      avgTurns: rs.reduce((s, r) => s + r.turns, 0) / rs.length,
    }))
    .sort((a, b) => a.winRate - b.winRate)

  return { total, wins: wins.length, losses: losses.length, winRate, avgTurns, turnStdDev, avgHpRemaining, avgHpLost, turnBuckets, deathByTurn, timeouts, byEncounter }
}

function bar(pct: number, width = 20): string {
  const filled = Math.round(pct * width)
  return '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled)
}

function pctStr(pct: number): string {
  return `${(pct * 100).toFixed(1)}%`.padStart(6)
}

export function formatStats(stats: AggregateStats, seed?: number): string {
  const lines: string[] = []
  lines.push('\u2550'.repeat(45))
  lines.push('  Combat Simulator Results')
  lines.push('\u2550'.repeat(45))
  lines.push(`  Runs:        ${stats.total.toLocaleString()}`)
  if (seed !== undefined) lines.push(`  Seed:        ${seed}`)
  lines.push('')
  lines.push(`  Win Rate:    ${(stats.winRate * 100).toFixed(1)}%  (${stats.wins}W / ${stats.losses}L)`)
  lines.push(`  Avg Turns:   ${stats.avgTurns.toFixed(1)}  (\u03c3 ${stats.turnStdDev.toFixed(1)})`)
  lines.push(`  Avg HP Left: ${stats.avgHpRemaining.toFixed(1)}  (on wins)`)
  lines.push(`  Avg HP Lost: ${stats.avgHpLost.toFixed(1)}  (all combats)`)
  if (stats.timeouts > 0) lines.push(`  Timeouts:    ${stats.timeouts}`)
  lines.push('')
  lines.push('  Turn Distribution:')
  for (const b of stats.turnBuckets) {
    if (b.count === 0) continue
    lines.push(`    ${b.label.padEnd(5)} ${bar(b.pct)} ${pctStr(b.pct)}  (${b.count})`)
  }

  if (stats.deathByTurn.length > 0) {
    lines.push('')
    lines.push('  Deaths by Turn:')
    for (const d of stats.deathByTurn.slice(0, 10)) {
      lines.push(`    T${String(d.turn).padEnd(4)} ${bar(d.pct)} ${pctStr(d.pct)}  (${d.count})`)
    }
  }

  if (stats.byEncounter.length > 1) {
    lines.push('')
    lines.push('  Win Rate by Encounter:')
    const maxNameLen = Math.min(30, Math.max(...stats.byEncounter.map(e => e.encounter.length)))
    for (const e of stats.byEncounter) {
      const name = e.encounter.length > maxNameLen
        ? e.encounter.slice(0, maxNameLen - 1) + '\u2026'
        : e.encounter.padEnd(maxNameLen)
      lines.push(`    ${name}  ${bar(e.winRate, 10)} ${pctStr(e.winRate)}  (${e.wins}/${e.total})  ~${e.avgTurns.toFixed(1)}t`)
    }
  }

  lines.push('\u2550'.repeat(45))
  return lines.join('\n')
}
