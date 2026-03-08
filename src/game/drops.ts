import type { DropPool, ModifierCardDefinition } from '../game/types'
import { SECTOR1_CARD_POOL, SECTOR2_CARD_POOL } from '../data/cards'
import { PARTS, EQUIPMENT } from '../data/parts'

function getCardPoolForSector(sector: number): ModifierCardDefinition[] {
  return sector >= 2 ? SECTOR2_CARD_POOL : SECTOR1_CARD_POOL
}

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

function resolveBonusDrop(entry: DropPool, sector: number, ownedPartIds: string[] = []): ResolvedDrop[] {
  if (entry.type === 'card') {
    const cardPool = getCardPoolForSector(sector)
    const pool = entry.ids
      ? cardPool.filter((c) => entry.ids!.includes(c.id))
      : cardPool
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map((c) => ({ type: 'card', cardId: c.id }))
  }

  if (entry.type === 'part') {
    const base = entry.ids
      ? PARTS.filter((p) => entry.ids!.includes(p.id))
      : PARTS
    const pool = base.filter((p) => !ownedPartIds.includes(p.id))
    if (pool.length === 0) return [{ type: 'shards', amount: 15 }]
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

export interface DropResult {
  drops: ResolvedDrop[]
  droppedEquipment: boolean
}

export function resolveDrops(dropPool: DropPool[], equipPity = 0, sector = 1, ownedPartIds: string[] = []): DropResult {
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

  // Build weighted bonus entries with pity boost for equipment
  let entries = [...bonusEntries]

  // If no equipment entry exists and pity >= 2, inject a generic one
  const hasEquipEntry = entries.some((d) => d.type === 'equipment')
  if (!hasEquipEntry && equipPity >= 2) {
    entries.push({ type: 'equipment', weight: 0 })
  }

  // Boost equipment weights by pity
  const weighted = entries.map((d) => ({
    value: d,
    weight: d.type === 'equipment' ? d.weight + equipPity : d.weight,
  }))

  // Roll for a bonus drop
  if (weighted.length > 0) {
    const chosen = weightedRandom(weighted)
    results.push(...resolveBonusDrop(chosen, sector, ownedPartIds))
  }

  const droppedEquipment = results.some((r) => r.type === 'equipment')
  return { drops: results, droppedEquipment }
}
