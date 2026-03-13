import { useEffect } from 'react'
import type { GridMaze } from '../game/types'

interface Props {
  map: GridMaze
  combatsCleared: number
  collapseMessage: string | null
  autoPath: [number, number][] | null
  onTileSelect: (x: number, y: number) => void
  onDismissCollapse: () => void
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

export default function MapScreen({ map, combatsCleared, collapseMessage, autoPath, onTileSelect, onDismissCollapse }: Props) {
  const { grid, playerX, playerY } = map
  const gridSize = grid.length
  const stabilityCount = combatsCleared % 3

  // Build a set of path coordinates for highlighting
  const pathSet = new Set<string>()
  if (autoPath) {
    for (const [px, py] of autoPath) {
      pathSet.add(`${px},${py}`)
    }
  }
  const destination = autoPath && autoPath.length > 0 ? autoPath[autoPath.length - 1] : null

  // Auto-dismiss collapse message after 3 seconds
  useEffect(() => {
    if (!collapseMessage) return
    const timer = setTimeout(onDismissCollapse, 3000)
    return () => clearTimeout(timer)
  }, [collapseMessage, onDismissCollapse])

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
        marginBottom: '8px',
        fontSize: '16px',
        fontWeight: '300',
      }}>
        THE MAZE
      </h2>

      {/* Stability counter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '16px',
        fontSize: '11px',
        color: '#636e72',
        letterSpacing: '1px',
      }}>
        <span>STABILITY</span>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: i < stabilityCount ? '#e74c3c' : '#2d3436',
            border: '1px solid #636e72',
            transition: 'background-color 0.3s',
          }} />
        ))}
        <span style={{ color: stabilityCount >= 2 ? '#e74c3c' : '#636e72' }}>
          {stabilityCount}/3
        </span>
      </div>

      {/* Collapse notification */}
      {collapseMessage && (
        <div
          onClick={onDismissCollapse}
          style={{
            marginBottom: '12px',
            padding: '8px 16px',
            backgroundColor: '#2d1010',
            border: '1px solid #e74c3c',
            borderRadius: '6px',
            color: '#e74c3c',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {collapseMessage}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, ${TILE_SIZE}px)`,
        gridTemplateRows: `repeat(${gridSize}, ${TILE_SIZE}px)`,
        gap: `${GAP}px`,
      }}>
        {grid.map((row, y) =>
          row.map((tile, x) => {
            const isCurrent = x === playerX && y === playerY
            const isWalkable = tile !== null
            const isCollapsed = tile?.collapsed ?? false
            const isOnPath = pathSet.has(`${x},${y}`)
            const isDest = destination && destination[0] === x && destination[1] === y
            const color = isCollapsed ? '#636e72' : (tile ? (ROOM_COLORS[tile.type] ?? '#555') : '#555')

            // Tappable: any meaningful uncleared, non-collapsed room (not Empty, not current position)
            const isMeaningful = tile && !tile.collapsed && !tile.cleared && tile.type !== 'Empty' && !isCurrent
            const canTap = !!isMeaningful

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

            // Collapsed tile
            if (isCollapsed) {
              return (
                <div
                  key={`${x}-${y}`}
                  style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    backgroundColor: isOnPath ? '#1a1520' : '#0e0e18',
                    borderRadius: '4px',
                    border: isCurrent
                      ? '2px solid #a29bfe'
                      : isOnPath
                        ? '1px solid #636e7244'
                        : '1px solid #1a1a2e',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.5,
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 14, lineHeight: 1, color: '#636e72' }}>
                    {'\u2592'}
                  </span>
                  <span style={{ fontSize: 7, letterSpacing: 0.5, color: '#4a4a5a', marginTop: 2 }}>
                    RUINS
                  </span>
                </div>
              )
            }

            // Normal tile (all visible, no fog)
            const isVisited = tile!.visited
            return (
              <div
                key={`${x}-${y}`}
                onClick={() => canTap ? onTileSelect(x, y) : undefined}
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: isCurrent
                    ? '#1a1a3e'
                    : isDest
                      ? '#2a1a3e'
                      : isOnPath
                        ? '#1a1a30'
                        : isVisited
                          ? '#16213e'
                          : '#111128',
                  borderRadius: '4px',
                  border: isCurrent
                    ? '2px solid #a29bfe'
                    : isDest
                      ? `2px solid ${color}`
                      : canTap
                        ? `2px solid ${color}66`
                        : isOnPath
                          ? '1px solid #a29bfe44'
                          : '1px solid #1a1a2e',
                  boxShadow: isCurrent
                    ? '0 0 12px #a29bfe44'
                    : isDest
                      ? `0 0 8px ${color}66`
                      : canTap
                        ? `0 0 4px ${color}22`
                        : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canTap ? 'pointer' : 'default',
                  opacity: isVisited && !isCurrent ? 0.6 : 1,
                  transition: 'opacity 0.2s, border-color 0.2s, background-color 0.2s',
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
