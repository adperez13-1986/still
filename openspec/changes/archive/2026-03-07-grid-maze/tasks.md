## 1. Types — Replace MapGraph with GridMaze

- [x] 1.1 Add `GridRoom` type (id, type, sector, visited, cleared, x, y) and `GridMaze` type (grid, startX/Y, playerX/Y, bossX/Y, sector) to types.ts — keep old MapGraph/Room temporarily for reference
- [x] 1.2 Update `RunState.map` type from `MapGraph | null` to `GridMaze | null`
- [x] 1.3 Remove old `MapGraph`, `Room` interfaces and `connections` field once all consumers are migrated

## 2. Maze Generation — Recursive backtracker

- [x] 2.1 Rewrite `mapGen.ts`: implement recursive backtracker on 7x7 grid that carves corridors through walls, producing ~60% walkable tiles
- [x] 2.2 Add BFS distance calculation from start; place Boss at farthest walkable tile
- [x] 2.3 Assign room types: Combat (8-10 tiles on corridors), Rest (1-2 at junctions), Shop (1 at mid-distance), Event (1-2 at dead ends), remaining walkable as empty corridors
- [x] 2.4 Set start position near top-left; export `generateGridMaze(sector)` replacing old `generateMap`

## 3. Store — Grid movement and fog of war

- [x] 3.1 Update `runStore.moveToRoom` to `moveToTile(x, y)` — validate adjacency (4-directional, non-null), update playerX/Y, mark tile visited
- [x] 3.2 Add fog-of-war state: when a tile becomes visited, reveal all 8-directional neighbors (set a `revealed` flag or compute dynamically)
- [x] 3.3 Add `cleared` tracking — mark rooms cleared after encounter resolves (combat won, rest/shop/event completed)

## 4. Map UI — Grid renderer

- [x] 4.1 Rewrite `MapScreen.tsx` as a CSS grid of square tiles (~48px) rendering the 7x7 maze
- [x] 4.2 Implement three visibility states: unrevealed (dark), revealed (dimmed icon), visited (fully lit)
- [x] 4.3 Highlight player's current tile with distinct border/glow
- [x] 4.4 Make adjacent walkable tiles tappable (visual indicator + onClick handler)
- [x] 4.5 Show room type icons (Combat, Rest, Shop, Event, Boss) and empty corridor styling

## 5. RunScreen Integration

- [x] 5.1 Update `RunScreen.tsx` to use `generateGridMaze` and pass grid coordinates instead of room IDs
- [x] 5.2 Update `handleRoomSelect` to work with (x, y) coordinates — trigger encounters based on tile type and cleared status
- [x] 5.3 Update current-room logic: derive current room from `map.grid[map.playerY][map.playerX]` instead of `map.rooms[map.currentRoomId]`
- [x] 5.4 Ensure cleared rooms (combat won, rest/shop/event done) allow free pass-through on revisit

## 6. Consumer Cleanup

- [x] 6.1 Update any remaining references to `Room.connections`, `map.rooms[id]`, `map.currentRoomId`, `map.startRoomId`, `map.bossRoomId` across components
- [x] 6.2 Update `EventScreen` and `CombatScreen` if they reference old Room shape (sector access, room type checks)
- [x] 6.3 Remove old `MapGraph`/`Room` types and `generateMap` function after all consumers are migrated
