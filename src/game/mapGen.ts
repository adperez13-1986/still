import type { GridMaze, GridRoom, GridRoomType } from '../game/types'

const GRID_SIZE = 7

// Recursive backtracker maze generation
// Works on a grid where odd coordinates are cells and even coordinates are walls/passages
// We use a (GRID_SIZE) x (GRID_SIZE) output grid where cells are carved out of solid walls

type Dir = [number, number]
const DIRS: Dir[] = [[0, -1], [1, 0], [0, 1], [-1, 0]] // up, right, down, left

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function carve(grid: boolean[][], cx: number, cy: number) {
  grid[cy][cx] = true
  for (const [dx, dy] of shuffle(DIRS)) {
    const nx = cx + dx * 2
    const ny = cy + dy * 2
    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !grid[ny][nx]) {
      // Carve the wall between current and neighbor
      grid[cy + dy][cx + dx] = true
      carve(grid, nx, ny)
    }
  }
}

function bfsDistances(grid: boolean[][], startX: number, startY: number): number[][] {
  const dist: number[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(-1)
  )
  dist[startY][startX] = 0
  const queue: [number, number][] = [[startX, startY]]
  let head = 0
  while (head < queue.length) {
    const [x, y] = queue[head++]
    for (const [dx, dy] of DIRS) {
      const nx = x + dx
      const ny = y + dy
      if (
        nx >= 0 && nx < GRID_SIZE &&
        ny >= 0 && ny < GRID_SIZE &&
        grid[ny][nx] &&
        dist[ny][nx] === -1
      ) {
        dist[ny][nx] = dist[y][x] + 1
        queue.push([nx, ny])
      }
    }
  }
  return dist
}

function countWalkableNeighbors(grid: boolean[][], x: number, y: number): number {
  let count = 0
  for (const [dx, dy] of DIRS) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && grid[ny][nx]) {
      count++
    }
  }
  return count
}

export function generateGridMaze(sector: 1 | 2 | 3): GridMaze {
  // Step 1: Generate maze using recursive backtracker
  // Start carving from (0, 0) — top-left, using only even coordinates as cells
  // But for a 7x7 grid, we treat all cells directly and carve passages between them
  const walkable: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  )

  // Start from (0, 0) for top-left bias
  carve(walkable, 0, 0)

  // Step 2: BFS from start to get distances
  const startX = 0
  const startY = 0
  const dist = bfsDistances(walkable, startX, startY)

  // Step 3: Find farthest tile for Boss
  let bossX = 0
  let bossY = 0
  let maxDist = 0
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (dist[y][x] > maxDist) {
        maxDist = dist[y][x]
        bossX = x
        bossY = y
      }
    }
  }

  // Step 4: Classify tiles
  const deadEnds: [number, number][] = []
  const junctions: [number, number][] = []
  const corridors: [number, number][] = []

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!walkable[y][x]) continue
      if (x === startX && y === startY) continue
      if (x === bossX && y === bossY) continue
      const neighbors = countWalkableNeighbors(walkable, x, y)
      if (neighbors === 1) {
        deadEnds.push([x, y])
      } else if (neighbors >= 3) {
        junctions.push([x, y])
      } else {
        corridors.push([x, y])
      }
    }
  }

  // Step 5: Assign room types
  const typeMap: Map<string, GridRoomType> = new Map()
  const key = (x: number, y: number) => `${x},${y}`

  // Boss
  typeMap.set(key(bossX, bossY), 'Boss')
  // Start is empty corridor
  typeMap.set(key(startX, startY), 'Empty')

  // Event rooms: 1-2 at dead ends
  const shuffledDeadEnds = shuffle(deadEnds)
  const eventCount = Math.min(shuffledDeadEnds.length, 1 + (Math.random() < 0.5 ? 1 : 0))
  for (let i = 0; i < eventCount; i++) {
    const [x, y] = shuffledDeadEnds[i]
    typeMap.set(key(x, y), 'Event')
  }

  // Rest rooms: 1-2 at junctions (not dead ends)
  const shuffledJunctions = shuffle(junctions)
  const restCount = Math.min(shuffledJunctions.length, 1 + (Math.random() < 0.5 ? 1 : 0))
  let jIdx = 0
  for (let i = 0; i < restCount && jIdx < shuffledJunctions.length; jIdx++) {
    const [x, y] = shuffledJunctions[jIdx]
    if (!typeMap.has(key(x, y))) {
      typeMap.set(key(x, y), 'Rest')
      i++
    }
  }

  // Shop: 1 at mid-distance from start
  const midDist = Math.floor(maxDist / 2)
  const midCandidates = shuffle([...corridors, ...junctions].filter(([x, y]) => {
    if (typeMap.has(key(x, y))) return false
    const d = dist[y][x]
    return d >= midDist - 2 && d <= midDist + 2
  }))
  if (midCandidates.length > 0) {
    const [x, y] = midCandidates[0]
    typeMap.set(key(x, y), 'Shop')
  }

  // Combat rooms: 8-10 on remaining unassigned walkable tiles
  const unassigned = shuffle([
    ...deadEnds.filter(([x, y]) => !typeMap.has(key(x, y))),
    ...junctions.filter(([x, y]) => !typeMap.has(key(x, y))),
    ...corridors.filter(([x, y]) => !typeMap.has(key(x, y))),
  ])
  const combatTarget = 8 + Math.floor(Math.random() * 3) // 8-10
  const combatCount = Math.min(unassigned.length, combatTarget)
  for (let i = 0; i < combatCount; i++) {
    const [x, y] = unassigned[i]
    typeMap.set(key(x, y), 'Combat')
  }

  // Everything else is Empty corridor
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (walkable[y][x] && !typeMap.has(key(x, y))) {
        typeMap.set(key(x, y), 'Empty')
      }
    }
  }

  // Step 6: Build GridMaze
  const grid: (GridRoom | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null)
  )
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!walkable[y][x]) continue
      const roomType = typeMap.get(key(x, y)) ?? 'Empty'
      grid[y][x] = {
        type: roomType,
        sector,
        visited: x === startX && y === startY,
        cleared: roomType === 'Empty',
        collapsed: false,
        x,
        y,
      }
    }
  }

  return {
    grid,
    startX,
    startY,
    playerX: startX,
    playerY: startY,
    bossX,
    bossY,
    sector,
  }
}

/** BFS shortest path between two walkable tiles. Returns array of [x, y] coordinates (excluding start, including end). */
export function findPath(maze: GridMaze, fromX: number, fromY: number, toX: number, toY: number): [number, number][] {
  const grid = maze.grid
  const size = grid.length
  const visited: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))
  const parent: Map<string, [number, number]> = new Map()
  const key = (x: number, y: number) => `${x},${y}`

  visited[fromY][fromX] = true
  const queue: [number, number][] = [[fromX, fromY]]
  let head = 0

  while (head < queue.length) {
    const [cx, cy] = queue[head++]
    if (cx === toX && cy === toY) {
      // Reconstruct path
      const path: [number, number][] = []
      let cur: [number, number] = [toX, toY]
      while (cur[0] !== fromX || cur[1] !== fromY) {
        path.push(cur)
        cur = parent.get(key(cur[0], cur[1]))!
      }
      return path.reverse()
    }
    for (const [dx, dy] of DIRS) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx] && !visited[ny][nx]) {
        visited[ny][nx] = true
        parent.set(key(nx, ny), [cx, cy])
        queue.push([nx, ny])
      }
    }
  }
  return [] // no path found
}

/** Collapse a random unvisited meaningful room. Returns the collapsed room or null if none eligible. */
export function collapseRandomRoom(maze: GridMaze): GridRoom | null {
  const MEANINGFUL: Set<GridRoomType> = new Set(['Combat', 'Shop', 'Event', 'Rest'])
  const candidates: GridRoom[] = []
  for (const row of maze.grid) {
    for (const tile of row) {
      if (tile && !tile.visited && !tile.collapsed && MEANINGFUL.has(tile.type)) {
        candidates.push(tile)
      }
    }
  }
  if (candidates.length === 0) return null
  const target = candidates[Math.floor(Math.random() * candidates.length)]
  target.collapsed = true
  return target
}
