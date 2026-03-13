## 1. Data Model

- [x] 1.1 Add `collapsed` boolean to `GridRoom` interface in `types.ts`
- [x] 1.2 Add `combatsCleared` counter to `RunState` in `types.ts`
- [x] 1.3 Initialize `combatsCleared: 0` in run start logic (`RunScreen.tsx`)

## 2. Collapse Logic

- [x] 2.1 Create `collapseRandomRoom(maze, playerPos)` function in `mapGen.ts` — selects a random unvisited, non-collapsed meaningful room (Combat/Shop/Event/Rest, not Boss) and marks it collapsed
- [x] 2.2 Increment `combatsCleared` after each combat victory in `RunScreen.tsx`
- [x] 2.3 Trigger `collapseRandomRoom` when `combatsCleared` reaches 3, 6, or 9 (i.e., `combatsCleared % 3 === 0`) in post-combat flow

## 3. Room Entry

- [x] 3.1 Handle entering a collapsed room in `RunScreen.tsx` — treat as empty corridor (no encounter, pass through)

## 4. Map UI

- [x] 4.1 Render collapsed rooms as visually distinct rubble tiles in `MapScreen.tsx`
- [x] 4.2 Add stability counter to map UI showing combats since last collapse out of 3
- [x] 4.3 Show collapse notification when a room collapses (brief toast/message — different text for revealed vs unrevealed rooms)

## 6. Remove Fog of War

- [x] 6.1 Remove `getTileVisibility` function and three-state visibility from `MapScreen.tsx` — all walkable tiles render as visible
- [x] 6.2 Style unvisited rooms slightly dimmer than visited rooms (simple visited/unvisited distinction)
- [x] 6.3 Remove unrevealed tile rendering — no more dark/hidden squares for walkable tiles
- [x] 6.4 Update collapse notification — no longer needs revealed vs unrevealed distinction (all rooms are visible)

## 7. Auto-Pathing

- [x] 7.1 Add `findPath(maze, fromX, fromY, toX, toY)` BFS function in `mapGen.ts` that returns an array of `[x, y]` coordinates for the shortest path
- [x] 7.2 Add `autoPath` state in RunScreen component — path is `[x, y][]` or null
- [x] 7.3 Replace `handleTileSelect` in RunScreen — compute path to destination, walk along it, stop at first uncleared encounter
- [x] 7.4 Make any meaningful room tappable (not just adjacent tiles) in MapScreen — removed adjacency restriction
- [x] 7.5 Highlight the planned path and destination on the map in MapScreen
- [x] 7.6 After encounter resolves, clear the auto-path so the player must pick a new destination

## 8. Verification

- [x] 8.1 Playtest: verify full map is visible from sector start
- [x] 8.2 Playtest: verify tapping a distant room auto-walks and stops at first encounter
- [x] 8.3 Playtest: verify collapse creates routing tension now that the full map is visible
- [x] 8.4 Playtest: verify no regressions (combat, events, shop, rest, boss all work correctly)
