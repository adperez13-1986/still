import type { DropPool } from '../game/types'
import { ACT1_CARD_POOL } from '../data/cards'
import { PARTS, EQUIPMENT } from '../data/parts'

export type ResolvedDrop =
  | { type: 'shards'; amount: number }
  | { type: 'card'; cardId: string }
  | { type: 'part'; partId: string }
  | { type: 'equipment'; equipmentId: string }

function weightedRandom<T>(items: Array<{ value: T; weight: number }>): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item.value
  }
  return items[items.length - 1].value
}

function resolveShardDrop(entry: DropPool): ResolvedDrop {
  const base = entry.amount ?? 10
  const variance = Math.floor(base * 0.2)
  const amount = base + Math.floor(Math.random() * (variance * 2 + 1)) - variance
  return { type: 'shards', amount }
}

function resolveBonusDrop(entry: DropPool): ResolvedDrop[] {
  if (entry.type === 'card') {
    const pool = entry.ids
      ? ACT1_CARD_POOL.filter((c) => entry.ids!.includes(c.id))
      : ACT1_CARD_POOL
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map((c) => ({ type: 'card', cardId: c.id }))
  }

  if (entry.type === 'part') {
    const pool = entry.ids
      ? PARTS.filter((p) => entry.ids!.includes(p.id))
      : PARTS
    const picked = pool[Math.floor(Math.random() * pool.length)]
    return [{ type: 'part', partId: picked.id }]
  }

  if (entry.type === 'equipment') {
    const pool = entry.ids
      ? EQUIPMENT.filter((e) => entry.ids!.includes(e.id))
      : EQUIPMENT
    const picked = pool[Math.floor(Math.random() * pool.length)]
    return [{ type: 'equipment', equipmentId: picked.id }]
  }

  return []
}

export function resolveDrops(dropPool: DropPool[]): ResolvedDrop[] {
  const shardEntries = dropPool.filter((d) => d.type === 'shards')
  const bonusEntries = dropPool.filter((d) => d.type !== 'shards')

  const results: ResolvedDrop[] = []

  // Always drop shards — pick highest-weight shard entry
  if (shardEntries.length > 0) {
    const best = shardEntries.reduce((a, b) => (b.weight > a.weight ? b : a))
    results.push(resolveShardDrop(best))
  } else {
    results.push({ type: 'shards', amount: 5 })
  }

  // Roll for a bonus drop from non-shard entries
  if (bonusEntries.length > 0) {
    const weighted = bonusEntries.map((d) => ({ value: d, weight: d.weight }))
    const chosen = weightedRandom(weighted)
    results.push(...resolveBonusDrop(chosen))
  }

  return results
}
