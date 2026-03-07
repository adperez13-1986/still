import type { GridMaze, GridRoom } from '../game/types'

interface Props {
  map: GridMaze
  onTileSelect: (x: number, y: number) => void
}

const ROOM_ICONS: Record<string, string> = {
  Combat: '\u2694',
  Rest: '\u25CE',
  Shop: '\u25C8',
  Event: '\u25C7',
  Boss: '\u2620',
  Empty: '\u00B7',
}

const ROOM_COLORS: Record<string, string> = {
  Combat: '#e74c3c',
  Rest: '#27ae60',
  Shop: '#f39c12',
  Event: '#8e44ad',
  Boss: '#c0392b',
  Empty: '#555',
}

const TILE_SIZE = 48
const GAP = 2

type TileVisibility = 'unrevealed' | 'revealed' | 'visited'

function getTileVisibility(
  tile: GridRoom | null,
  x: number,
  y: number,
  grid: (GridRoom | null)[][]
): TileVisibility {
  if (!tile) return 'unrevealed'
  if (tile.visited) return 'visited'
  // Revealed if adjacent (8-directional) to any visited tile
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const ny = y + dy
      const nx = x + dx
      if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
        const neighbor = grid[ny][nx]
        if (neighbor?.visited) return 'revealed'
      }
    }
  }
  return 'unrevealed'
}

function isAdjacent(x1: number, y1: number, x2: number, y2: number): boolean {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1
}

export default function MapScreen({ map, onTileSelect }: Props) {
  const { grid, playerX, playerY } = map
  const gridSize = grid.length

  return (
    <div style={{
      backgroundColor: '#0d0d1a',
      minHeight: '100vh',
      padding: '32px 0 100px',
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, ${TILE_SIZE}px)`,
        gridTemplateRows: `repeat(${gridSize}, ${TILE_SIZE}px)`,
        gap: `${GAP}px`,
      }}>
        {grid.map((row, y) =>
          row.map((tile, x) => {
            const vis = getTileVisibility(tile, x, y, grid)
            const isCurrent = x === playerX && y === playerY
            const isWalkable = tile !== null
            const isAdj = isWalkable && isAdjacent(x, y, playerX, playerY)
            const canMove = isAdj && vis !== 'unrevealed'
            const color = tile ? (ROOM_COLORS[tile.type] ?? '#555') : '#555'

            // Wall tile
            if (!isWalkable) {
              return (
                <div
                  key={`${x}-${y}`}
                  style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    backgroundColor: '#0a0a12',
                    borderRadius: '4px',
                  }}
                />
              )
            }

            // Unrevealed walkable tile
            if (vis === 'unrevealed') {
              return (
                <div
                  key={`${x}-${y}`}
                  style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    backgroundColor: '#111122',
                    borderRadius: '4px',
                    border: '1px solid #1a1a2e',
                  }}
                />
              )
            }

            // Revealed or visited tile
            return (
              <div
                key={`${x}-${y}`}
                onClick={() => canMove ? onTileSelect(x, y) : undefined}
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: isCurrent
                    ? '#1a1a3e'
                    : vis === 'visited'
                      ? '#16213e'
                      : '#111128',
                  borderRadius: '4px',
                  border: isCurrent
                    ? '2px solid #a29bfe'
                    : canMove
                      ? `2px solid ${color}88`
                      : '1px solid #1a1a2e',
                  boxShadow: isCurrent
                    ? '0 0 12px #a29bfe44'
                    : canMove
                      ? `0 0 6px ${color}33`
                      : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canMove ? 'pointer' : 'default',
                  opacity: vis === 'revealed' ? 0.5 : 1,
                  transition: 'opacity 0.2s, border-color 0.2s',
                  userSelect: 'none',
                }}
              >
                <span style={{
                  fontSize: tile!.type === 'Empty' ? 20 : 16,
                  lineHeight: 1,
                  color: isCurrent ? '#a29bfe' : color,
                }}>
                  {ROOM_ICONS[tile!.type] ?? '?'}
                </span>
                {tile!.type !== 'Empty' && (
                  <span style={{
                    fontSize: 7,
                    letterSpacing: 0.5,
                    color: isCurrent ? '#a29bfe' : '#aaa',
                    marginTop: 2,
                  }}>
                    {tile!.cleared ? '\u2713' : tile!.type.toUpperCase().slice(0, 4)}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
