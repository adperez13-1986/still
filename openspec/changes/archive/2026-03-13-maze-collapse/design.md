## Context

The maze is a 7x7 procedural grid with ~25 walkable rooms (12-15 meaningful). Players can currently clear every room with no cost, violating the roguelike principle that scarcity forces meaningful choices. Fog of war hides the information needed for routing decisions, and tile-by-tile movement is tedious without creating decisions.

Playtesting confirmed: collapse mechanic works but doesn't create tension because (1) fog hides what you're losing, (2) linear maze has no branching so you can reach everything anyway, (3) tapping through empty corridors is busywork.

## Goals / Non-Goals

**Goals:**
- Create navigation decisions: player must prioritize which rooms to reach
- ~3 meaningful rooms lost per run, enough to matter but not punishing
- Archetype-neutral — collapse doesn't favor Cool or Hot playstyles
- Full map visibility so the player can plan routes around collapse
- Destination-based movement — tap where you want to go, not each individual tile
- Simple mental model the player can plan around

**Non-Goals:**
- No interaction with heat system (collapse is a maze-level mechanic, not combat-level)
- No special protection for specific room types
- No maze-structural collapse (corridors don't collapse, paths don't get cut off)
- No collapse prevention mechanics in v1
- No maze generator changes (keep 7x7 recursive backtracker for now)

## Decisions

### Decision 1: Combat-milestone trigger (every 3rd combat)
Collapse triggers after the player clears their 3rd, 6th, and 9th combat. Predictable cadence the player can plan around.

### Decision 2: Random target selection from unvisited meaningful rooms
Boss room and empty corridors excluded. Random over spatial to avoid predictable dead zones.

### Decision 3: Collapsed rooms become passable rubble
Walkable but no encounter. Prevents softlocks.

### Decision 4: Visible stability counter
"N/3 combats until next collapse." Always visible. Decisions, not gotchas.

### Decision 5: Remove fog of war
All rooms visible from the start of each sector. Player sees the full map layout, room types, and positions immediately.

**Why remove fog?** Fog hides the information that makes collapse meaningful. If you can't see what you're about to lose, collapse is just random punishment. With full visibility, the player sees the shop on the far side, the event in the corner, and must plan which to prioritize before collapse takes one. The tension comes from seeing everything but not being able to get everything.

**What we lose:** Discovery/surprise of revealing rooms. Playtesting showed this never created meaningful decisions — you walk into rooms regardless of what they are.

### Decision 6: Auto-pathing to destinations
Player taps any room on the map. BFS shortest path is computed. Still walks along the path and stops at the first uncleared encounter room (combat, event, rest, shop).

**Why stop at encounters?** Each encounter is a re-evaluation point. After combat, collapse may have changed the map. Your health may be low. You might want to reroute. Stopping preserves player agency at every meaningful moment.

**Path traversal rules:**
- Empty corridors: walked through automatically
- Collapsed rooms: walked through automatically (passable rubble)
- Cleared rooms: walked through automatically
- Uncleared Combat/Boss: stop, start combat
- Uncleared Rest/Shop/Event: stop, show room screen
- After resolving, player taps next destination

**Why not queue the full path?** The game state changes after each encounter (collapse, health, rewards). Forcing the player to re-evaluate after each stop creates better decisions than auto-completing a queued path.

### Decision 7: Tappable rooms only (not empty corridors)
Only rooms with encounters (Combat, Rest, Shop, Event, Boss) and collapsed rooms are valid tap targets. Empty corridors are traversed automatically — they're never destinations.

## Risks / Trade-offs

- **[Too few collapses matter]** If collapsed rooms are all combat rooms the player didn't need → acceptable variance for roguelite.
- **[Shop collapsing feels bad]** ~20% chance per run → player can prioritize shop if they see it (now they CAN see it with no fog).
- **[Auto-path through multiple combats]** Player might not realize they'll hit 3 combats on the way to the shop → show the path visually so the player can count encounters.
- **[No fog removes exploration feel]** The maze might feel more like a board game than an exploration → acceptable trade; the maze walls still create routing puzzles, and the "lost" feeling comes from collapse pressure, not hidden information.
