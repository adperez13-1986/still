import type { MapGraph, Room, RoomType } from '../game/types'

function uuid() {
  return Math.random().toString(36).slice(2, 10)
}

type ExtendedRoomType = RoomType | 'Elite'

// Guaranteed room type distribution per sector
const SECTOR_ROOM_DISTRIBUTION: ExtendedRoomType[][] = [
  // Layer 0: always Start (combat)
  ['Combat'],
  // Layers 1-2
  ['Combat', 'Combat', 'Event'],
  ['Combat', 'Rest', 'Shop'],
  // Layer 3
  ['Combat', 'Combat', 'Event'],
  // Layer 4
  ['Combat', 'Combat', 'Rest'],
  // Layer 5: pre-boss
  ['Shop', 'Event', 'Combat'],
  // Layer 6: Boss
  ['Boss'],
]

// Each layer has 1-3 rooms; we pick how many paths branch
const LAYER_WIDTHS = [1, 2, 3, 2, 2, 2, 1]

function pickRoomType(layer: number, slot: number): RoomType {
  const dist = SECTOR_ROOM_DISTRIBUTION[layer] ?? ['Combat']
  const t = dist[slot % dist.length]
  // Treat 'Elite' as Combat room (elite flag set on enemy, not room)
  return t === 'Elite' ? 'Combat' : t
}

export function generateMap(sector: 1 | 2 | 3): MapGraph {
  const rooms: Record<string, Room> = {}
  const layers: string[][] = []

  // Build layers
  for (let layer = 0; layer < LAYER_WIDTHS.length; layer++) {
    const width = LAYER_WIDTHS[layer]
    const layerIds: string[] = []
    for (let slot = 0; slot < width; slot++) {
      const id = uuid()
      const type = pickRoomType(layer, slot)
      rooms[id] = {
        id,
        type,
        sector,
        connections: [],
        visited: false,
      }
      layerIds.push(id)
    }
    layers.push(layerIds)
  }

  // Wire connections: each room connects to 1-2 rooms in the next layer
  for (let layer = 0; layer < layers.length - 1; layer++) {
    const current = layers[layer]
    const next = layers[layer + 1]
    for (let i = 0; i < current.length; i++) {
      const roomId = current[i]
      // Always connect to aligned next room
      const primaryIdx = Math.floor((i / current.length) * next.length)
      rooms[roomId].connections.push(next[primaryIdx])
      // Sometimes connect to an adjacent next room
      if (next.length > 1 && Math.random() < 0.4) {
        const altIdx = (primaryIdx + 1) % next.length
        if (!rooms[roomId].connections.includes(next[altIdx])) {
          rooms[roomId].connections.push(next[altIdx])
        }
      }
    }
    // Ensure every next-layer room is reachable
    for (const nextId of next) {
      const reachable = current.some((id) => rooms[id].connections.includes(nextId))
      if (!reachable) {
        const sourceId = current[Math.floor(Math.random() * current.length)]
        rooms[sourceId].connections.push(nextId)
      }
    }
  }

  const startRoomId = layers[0][0]
  const bossRoomId = layers[layers.length - 1][0]
  rooms[startRoomId].visited = true

  return { rooms, startRoomId, currentRoomId: startRoomId, bossRoomId }
}
