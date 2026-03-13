## Why

The player can currently explore and clear every room in the maze with no cost. This violates a core roguelike principle: scarcity of resources forces meaningful choices. Because there's no reason to skip any room, the maze has no strategic depth — it's just a checklist. Additionally, fog of war hides the information that would make routing decisions meaningful, and tile-by-tile movement is tedious busywork without decisions.

## What Changes

### Collapse mechanic (implemented)
- After every 3rd combat cleared, 1 random unvisited meaningful room collapses
- Collapsed rooms become passable rubble (walkable, no encounter)
- Stability counter shows progress toward next collapse
- ~3 meaningful rooms lost per run

### Remove fog of war
- **BREAKING**: All rooms are visible from the start of each sector
- Room types and positions shown immediately — no reveal mechanic
- Player sees exactly what's at stake when collapse threatens
- Removes three visibility states (unrevealed/revealed/visited), simplifies to visited/unvisited

### Auto-pathing
- **BREAKING**: Player taps a destination room, Still auto-walks the shortest path
- Still stops at the first uncleared encounter room along the path (combat, event, rest, shop)
- After resolving the encounter, player is back on the map to re-evaluate and pick next destination
- Eliminates tedious tile-by-tile tapping through empty corridors
- Collapsed rooms along the path are traversed automatically (they're passable rubble)

## Capabilities

### New Capabilities
- `maze-collapse`: Room collapse mechanic — combat-milestone triggers, random meaningful room selection, passable rubble, stability counter UI

### Modified Capabilities
- `grid-maze`: Remove fog of war (all tiles visible from start); add auto-pathing (tap destination, resolve encounters along the way); rooms gain collapsed state; collapsed rooms are walkable but produce no encounter

## Impact

- `src/game/mapGen.ts` — GridRoom type, collapseRandomRoom function
- `src/game/types.ts` — GridRoom interface, RunState (combatsCleared, lastCollapseMessage, autoPathTarget)
- `src/components/MapScreen.tsx` — remove fog rendering, show all rooms, render collapsed tiles, stability counter, highlight destination/path
- `src/components/RunScreen.tsx` — auto-path logic (BFS shortest path, stop at encounters), trigger collapse after combat, handle entering collapsed rooms
- `src/store/runStore.ts` — track combats cleared, auto-path target
