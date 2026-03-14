import type { DropPool, ModifierCardDefinition } from '../game/types'
import { SECTOR1_CARD_POOL, SECTOR2_CARD_POOL } from '../data/cards'
import { SECTOR1_PART_POOL, SECTOR2_PART_POOL, EQUIPMENT, RUN_WARPING_PARTS } from '../data/parts'

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

function resolveBonusDrop(entry: DropPool, sector: number, ownedPartIds: string[] = [], ownedEquipIds: string[] = []): ResolvedDrop[] {
  if (entry.type === 'card') {
    const cardPool = getCardPoolForSector(sector)
    // Always offer 3 choices from full sector pool (enemy ids ignored — they're too restrictive)
    const shuffled = [...cardPool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map((c) => ({ type: 'card', cardId: c.id }))
  }

  if (entry.type === 'part') {
    const sectorPool = sector >= 2 ? SECTOR2_PART_POOL : SECTOR1_PART_POOL
    const base = entry.ids
      ? sectorPool.filter((p) => entry.ids!.includes(p.id))
      : sectorPool
    const pool = base.filter((p) => !ownedPartIds.includes(p.id))
    if (pool.length === 0) return [{ type: 'shards', amount: 15 }]
    const picked = pool[Math.floor(Math.random() * pool.length)]
    return [{ type: 'part', partId: picked.id }]
  }

  if (entry.type === 'equipment') {
    const base = entry.ids
      ? EQUIPMENT.filter((e) => entry.ids!.includes(e.id))
      : EQUIPMENT
    const pool = base.filter((e) => !ownedEquipIds.includes(e.id))
    if (pool.length === 0) return [{ type: 'shards', amount: 15 }]
    const picked = pool[Math.floor(Math.random() * pool.length)]
    return [{ type: 'equipment', equipmentId: picked.id }]
  }

  return []
}

export interface DropResult {
  drops: ResolvedDrop[]
  droppedEquipment: boolean
}

export function resolveDrops(dropPool: DropPool[], equipPity = 0, sector = 1, ownedPartIds: string[] = [], ownedEquipIds: string[] = []): DropResult {
  const results: ResolvedDrop[] = []

  // 1. Always drop shards
  const shardEntries = dropPool.filter((d) => d.type === 'shards')
  if (shardEntries.length > 0) {
    const best = shardEntries.reduce((a, b) => (b.weight > a.weight ? b : a))
    results.push(resolveShardDrop(best))
  } else {
    results.push({ type: 'shards', amount: 5 })
  }

  // 2. Always offer 3 card choices from sector pool
  const cardPool = getCardPoolForSector(sector)
  const shuffled = [...cardPool].sort(() => Math.random() - 0.5)
  results.push(...shuffled.slice(0, 3).map((c) => ({ type: 'card' as const, cardId: c.id })))

  // 3. Bonus roll for part/equipment (ignore card entries in pool)
  const bonusEntries = dropPool.filter((d) => d.type === 'part' || d.type === 'equipment')

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

  if (weighted.length > 0) {
    const chosen = weightedRandom(weighted)
    results.push(...resolveBonusDrop(chosen, sector, ownedPartIds, ownedEquipIds))
  }

  const droppedEquipment = results.some((r) => r.type === 'equipment')
  return { drops: results, droppedEquipment }
}

// Diminishing chance for run-warping rare part drops from elite/boss fights
const WARPER_DROP_CHANCES = [0.35, 0.15, 0.05, 0]

export function resolveWarperDrop(ownedWarperIds: string[]): ResolvedDrop | null {
  const chance = WARPER_DROP_CHANCES[Math.min(ownedWarperIds.length, WARPER_DROP_CHANCES.length - 1)]
  if (chance <= 0 || Math.random() > chance) return null

  const available = RUN_WARPING_PARTS.filter(p => !ownedWarperIds.includes(p.id))
  if (available.length === 0) return null

  const picked = available[Math.floor(Math.random() * available.length)]
  return { type: 'part', partId: picked.id }
}
