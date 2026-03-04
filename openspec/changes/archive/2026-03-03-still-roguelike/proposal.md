## Why

A deeply personal roguelike game called **Still** — built from the developer's own story of doubt, perseverance, and quiet hope. This is the game that originally inspired the desire to become a developer, finally made real. It exists to remind the player (and its creator) that showing up is enough, and that growth persists even through failure.

## What Changes

- New standalone game project: a turn-based roguelike with deckbuilding and incremental/idle progression elements
- A robot protagonist named **Still** navigating a procedurally generated maze
- Combat driven by cards (actions) and equipped parts (passive identity) salvaged from enemies
- Persistent progression between runs — something always carries forward, nothing is ever fully lost
- A narrative arc: survive → notice → search for purpose
- An emotional design philosophy: every run ends with encouragement, not judgment

## Capabilities

### New Capabilities

- `game-core`: The main game loop — run structure, turn-based combat, win/loss conditions, and run-end persistence
- `protagonist`: The robot Still — chassis system, parts (passive stat modifiers), and equipables (active skills + stats)
- `maze-world`: Procedurally generated maze — rooms, paths, encounters, and world tone
- `card-system`: Card-based combat actions — deck composition, hand management, card acquisition from defeated enemies
- `enemy-system`: Enemies with behavior rules and loot — every enemy drops something valuable (parts, cards, or resources)
- `progression`: Persistent idle/incremental layer — base upgrades, resources, and unlocks that survive between runs
- `narrative`: Story arc and emotional framing — the three acts (survive, notice, search), run-end messages, and optional character presences (Grace, Yanah, Yuri)

### Modified Capabilities

## Impact

- New project directory (e.g., `still/` or top-level game folder)
- Technology stack TBD in design phase (likely web-based: TypeScript + canvas/Phaser, or Godot)
- No external dependencies on existing personal projects
- Self-contained: art, logic, data, and narrative all live within the game project
