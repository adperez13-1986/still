## Why

The current map is a layered node graph (similar to Slay the Spire) that doesn't feel like a maze — it's a series of forced-forward choices with no exploration or backtracking. On mobile the node-and-line rendering is hard to read. The game's core fantasy is a robot lost in a maze, and the map should reflect that. Replacing it with a tile-based grid maze adds real exploration, dead ends, backtracking, and a visual that immediately reads as "maze" on any screen size.

## What Changes

- **BREAKING**: Replace the layered directed graph (`MapGraph` with `Room` nodes and `connections` edges) with a 2D tile grid where each cell is a room or wall
- **BREAKING**: Replace `generateMap()` with a maze generation algorithm that produces a grid with corridors, dead ends, and a guaranteed path to the boss
- **BREAKING**: Replace the current map UI component with a grid-based map that supports fog of war and tap-to-move navigation
- Allow backtracking through already-visited rooms (cleared combat rooms become empty on revisit)
- Fog of war: only reveal rooms adjacent to visited rooms
- Dead ends serve as risk/reward — may contain valuable rooms (equipment, rest) but cost HP to reach and return from
- Boss room placed at a strategic position requiring meaningful navigation to reach
- Room types (Combat, Rest, Shop, Event, Boss) unchanged — only how they're laid out and navigated changes

## Capabilities

### New Capabilities
- `grid-maze`: Grid-based maze generation, tile data structure, fog of war, movement/backtracking rules, room placement strategy

### Modified Capabilities
- `maze-world`: Replace branching room graph with grid-based maze; replace "choice is final" forward-only movement with free movement and backtracking; update fog of war to work on grid adjacency

## Impact

- `src/game/types.ts` — Replace `MapGraph`, `Room` interfaces (room gains grid coordinates, remove `connections`)
- `src/game/mapGen.ts` — Full rewrite: maze generation algorithm instead of layered graph
- `src/components/RunScreen.tsx` — Replace map rendering and room navigation logic
- `src/store/runStore.ts` — Update map-related state shape
- `src/components/EventScreen.tsx` — Minor: `room.sector` access unchanged but room structure changes
- `src/components/CombatScreen.tsx` — Minor: room completion logic unchanged
- No impact on combat, cards, heat, equipment, parts, or enemy systems
