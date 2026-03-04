import type { DropPool } from '../game/types'
import { ACT1_CARD_POOL } from '../data/cards'
import { PARTS } from '../data/parts'

export type ResolvedDrop =
  | { type: 'shards'; amount: number }
  | { type: 'card'; cardId: string }
  | { type: 'part'; partId: string }

function weightedRandom<T>(items: Array<{ value: T; weight: number }>): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item.value
  }
  return items[items.length - 1].value
}

export function resolveDrops(dropPool: DropPool[]): ResolvedDrop[] {
  const weighted = dropPool.map((d) => ({ value: d, weight: d.weight }))
  const chosen = weightedRandom(weighted)

  if (chosen.type === 'shards') {
    // Add some variance (±20%)
    const base = chosen.amount ?? 10
    const variance = Math.floor(base * 0.2)
    const amount = base + Math.floor(Math.random() * (variance * 2 + 1)) - variance
    return [{ type: 'shards', amount }]
  }

  if (chosen.type === 'card') {
    // Pick 3 card options for reward screen
    const pool = chosen.ids
      ? ACT1_CARD_POOL.filter((c) => chosen.ids!.includes(c.id))
      : ACT1_CARD_POOL
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map((c) => ({ type: 'card', cardId: c.id }))
  }

  if (chosen.type === 'part') {
    const pool = chosen.ids
      ? PARTS.filter((p) => chosen.ids!.includes(p.id))
      : PARTS
    const picked = pool[Math.floor(Math.random() * pool.length)]
    return [{ type: 'part', partId: picked.id }]
  }

  return [{ type: 'shards', amount: 5 }]
}
