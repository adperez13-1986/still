import type { MapGraph } from '../game/types'

interface Props {
  map: MapGraph
  onRoomSelect: (roomId: string) => void
}

const ROOM_ICONS: Record<string, string> = {
  Combat: '⚔',
  Rest: '◎',
  Shop: '◈',
  Event: '◇',
  Boss: '☠',
}

const ROOM_COLORS: Record<string, string> = {
  Combat: '#e74c3c',
  Rest: '#27ae60',
  Shop: '#f39c12',
  Event: '#8e44ad',
  Boss: '#c0392b',
}

const NODE_RADIUS = 28
const NODE_H_GAP = 96
const LAYER_GAP = 100
const PADDING = 48

function buildLayerOrder(map: MapGraph): string[][] {
  const visited = new Set<string>()
  const layers: string[][] = []
  let current = [map.startRoomId]
  while (current.length > 0) {
    layers.push(current)
    for (const id of current) visited.add(id)
    const next: string[] = []
    for (const id of current) {
      for (const conn of map.rooms[id]?.connections ?? []) {
        if (!visited.has(conn) && !next.includes(conn)) next.push(conn)
      }
    }
    current = next
  }
  return layers
}

export default function MapScreen({ map, onRoomSelect }: Props) {
  const layers = buildLayerOrder(map)

  const maxLayerSize = Math.max(...layers.map((l) => l.length))
  const canvasWidth = Math.max(300, maxLayerSize * NODE_H_GAP + PADDING * 2)
  const canvasHeight = layers.length * LAYER_GAP + PADDING * 2

  // Calculate center position for each room
  const positions: Record<string, { x: number; y: number }> = {}
  layers.forEach((layer, layerIdx) => {
    const totalWidth = (layer.length - 1) * NODE_H_GAP
    layer.forEach((roomId, colIdx) => {
      positions[roomId] = {
        x: canvasWidth / 2 - totalWidth / 2 + colIdx * NODE_H_GAP,
        y: PADDING + layerIdx * LAYER_GAP,
      }
    })
  })

  const currentPos = positions[map.currentRoomId]
  const reachableIds = new Set(map.rooms[map.currentRoomId]?.connections ?? [])

  // Collect all edges
  const edges: Array<{ from: string; to: string }> = []
  for (const room of Object.values(map.rooms)) {
    for (const connId of room.connections) {
      edges.push({ from: room.id, to: connId })
    }
  }

  return (
    <div style={{
      backgroundColor: '#0d0d1a',
      minHeight: '100vh',
      padding: '32px 0 32px',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <h2 style={{
        textAlign: 'center',
        letterSpacing: '3px',
        color: '#a29bfe',
        marginBottom: '24px',
        fontSize: '16px',
        fontWeight: '300',
      }}>
        THE MAZE
      </h2>

      <div style={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg width={canvasWidth} height={canvasHeight} style={{ display: 'block' }}>
          {/* Connection lines */}
          {edges.map(({ from, to }) => {
            const a = positions[from]
            const b = positions[to]
            if (!a || !b) return null
            const isFromCurrent = from === map.currentRoomId
            const isPath = isFromCurrent && reachableIds.has(to)
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={isPath ? '#a29bfe' : '#2c3e50'}
                strokeWidth={isPath ? 2.5 : 1.5}
                strokeDasharray={isPath ? undefined : '4 4'}
                opacity={isPath ? 0.9 : 0.4}
              />
            )
          })}

          {/* Nodes */}
          {Object.entries(positions).map(([roomId, pos]) => {
            const room = map.rooms[roomId]
            if (!room) return null
            const isCurrent = roomId === map.currentRoomId
            const isNext = reachableIds.has(roomId)
            const layerIdx = layers.findIndex((l) => l.includes(roomId))
            const currentLayerIdx = layers.findIndex((l) => l.includes(map.currentRoomId))
            const visible = layerIdx <= currentLayerIdx + 1
            const color = ROOM_COLORS[room.type] ?? '#555'

            return (
              <g
                key={roomId}
                onClick={() => isNext ? onRoomSelect(roomId) : undefined}
                style={{ cursor: isNext ? 'pointer' : 'default' }}
              >
                {/* Glow ring for reachable nodes */}
                {isNext && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_RADIUS + 5}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.4}
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NODE_RADIUS}
                  fill={isCurrent ? '#a29bfe' : isNext ? '#16213e' : '#0d0d1a'}
                  stroke={isCurrent ? '#a29bfe' : isNext ? color : '#333'}
                  strokeWidth={isCurrent ? 3 : isNext ? 2.5 : 1.5}
                  opacity={visible ? 1 : 0.25}
                />

                {/* Icon */}
                {visible ? (
                  <>
                    <text
                      x={pos.x}
                      y={pos.y - 4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={18}
                      fill={isCurrent ? '#0d0d1a' : color}
                      opacity={visible ? 1 : 0.3}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {ROOM_ICONS[room.type] ?? '?'}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={7}
                      letterSpacing={0.5}
                      fill={isCurrent ? '#0d0d1a' : '#aaa'}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {room.type.toUpperCase().slice(0, 4)}
                    </text>
                  </>
                ) : (
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={14}
                    fill="#444"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    ?
                  </text>
                )}
              </g>
            )
          })}

          {/* Pulse ring on current node */}
          {currentPos && (
            <circle
              cx={currentPos.x}
              cy={currentPos.y}
              r={NODE_RADIUS + 10}
              fill="none"
              stroke="#a29bfe"
              strokeWidth={1}
              opacity={0.3}
            />
          )}
        </svg>
      </div>
    </div>
  )
}
