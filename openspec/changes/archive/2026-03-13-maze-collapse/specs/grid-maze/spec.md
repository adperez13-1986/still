## MODIFIED Requirements

### Requirement: Entering a room triggers its encounter
When the player moves to a tile, the room's encounter SHALL trigger based on its type, cleared status, and collapsed status.

#### Scenario: Entering uncleared Combat room
- **WHEN** the player moves to a Combat room that has not been cleared
- **THEN** combat begins with enemies appropriate to the sector

#### Scenario: Entering cleared room
- **WHEN** the player moves to any room that has already been cleared
- **THEN** no encounter triggers; the player passes through freely

#### Scenario: Entering collapsed room
- **WHEN** the player moves to a room that has collapsed
- **THEN** no encounter triggers; the player passes through freely as if it were an empty corridor

#### Scenario: Entering Rest room
- **WHEN** the player moves to a Rest room for the first time
- **THEN** the rest screen appears; the room is marked cleared after the player makes a choice

#### Scenario: Entering Shop room
- **WHEN** the player moves to a Shop room for the first time
- **THEN** the shop screen appears; the room is marked cleared after the player leaves

#### Scenario: Entering Event room
- **WHEN** the player moves to an Event room for the first time
- **THEN** the event screen appears; the room is marked cleared after the player makes a choice

#### Scenario: Entering Boss room
- **WHEN** the player moves to the Boss room
- **THEN** the boss combat begins

## REMOVED Requirements

### Requirement: Fog of war on the grid
**Reason**: Fog of war hides the information needed for collapse to create meaningful routing decisions. Playtesting showed fog never created decisions — the player walks into rooms regardless. Removing fog lets the player see the full map and plan routes around collapse pressure.
**Migration**: All tiles are visible from the start of each sector. The three visibility states (unrevealed/revealed/visited) are replaced with a simpler visited/unvisited distinction for visual styling only. Room types and positions are shown immediately.

### Requirement: Player moves freely on the grid
**Reason**: Tile-by-tile movement is tedious busywork. Replaced with destination-based auto-pathing.
**Migration**: Player taps a destination room. Still auto-walks the shortest path (BFS), stopping at the first uncleared encounter. After resolving, player picks the next destination. Adjacent-only tap restriction is removed — any visible room is tappable.

## ADDED Requirements

### Requirement: Auto-pathing to destinations
The player SHALL tap any meaningful room on the map to set it as a destination. Still auto-walks the shortest path (BFS), stopping at the first uncleared encounter room along the way.

#### Scenario: Tap a distant room
- **WHEN** the player taps a room that is not adjacent
- **THEN** the shortest path is computed via BFS and Still begins walking toward it

#### Scenario: Stop at first encounter
- **WHEN** Still is auto-walking and reaches an uncleared Combat, Rest, Shop, Event, or Boss room
- **THEN** Still stops and the encounter triggers

#### Scenario: Skip empty and cleared rooms
- **WHEN** Still is auto-walking and passes through an empty corridor, cleared room, or collapsed room
- **THEN** Still continues walking without stopping

#### Scenario: Path shown on map
- **WHEN** the player taps a destination
- **THEN** the planned path is highlighted on the map so the player can see which rooms they will pass through

#### Scenario: Re-evaluate after encounter
- **WHEN** an encounter is resolved and the player returns to the map
- **THEN** the auto-path is cleared and the player must tap a new destination

### Requirement: All rooms visible from start
All rooms on the maze grid SHALL be visible from the start of each sector. There is no fog of war. Room types and positions are shown immediately.

#### Scenario: Initial map visibility
- **WHEN** a sector begins
- **THEN** all walkable tiles are visible with their room type icons displayed

#### Scenario: Visited rooms are styled differently
- **WHEN** the player has visited a room
- **THEN** it is visually distinguished from unvisited rooms (e.g., dimmed or marked with a checkmark)
