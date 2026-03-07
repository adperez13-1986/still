## ADDED Requirements

### Requirement: Maze is a 2D tile grid
The maze SHALL be represented as a 2D grid of tiles. Each tile is either a wall (impassable) or a walkable room. Walkable tiles have a room type. The grid is generated procedurally for each run.

#### Scenario: Grid dimensions
- **WHEN** a new maze is generated for Sector 1
- **THEN** the grid SHALL be 7x7 tiles with approximately 60% walkable tiles and 40% walls

#### Scenario: Every walkable tile is reachable
- **WHEN** the maze is generated
- **THEN** every walkable tile SHALL be reachable from the start position (the maze is a perfect maze with no isolated regions)

### Requirement: Maze generation uses recursive backtracker
The maze SHALL be generated using a recursive backtracker (depth-first search) algorithm that carves corridors through a grid of walls, producing natural dead ends and winding paths.

#### Scenario: Maze has dead ends
- **WHEN** the maze is generated
- **THEN** the resulting grid SHALL contain at least 3 dead-end tiles (tiles with only one walkable neighbor)

#### Scenario: Maze has a winding critical path
- **WHEN** the maze is generated
- **THEN** the shortest path from start to boss SHALL be at least 8 tiles long

### Requirement: Room types are placed strategically on the grid
Room types SHALL be assigned to walkable tiles based on their position in the maze topology.

#### Scenario: Boss room placement
- **WHEN** room types are assigned
- **THEN** the Boss room SHALL be placed at the walkable tile farthest from the start (by shortest path distance)

#### Scenario: Start tile
- **WHEN** room types are assigned
- **THEN** the start tile SHALL be an empty corridor (no encounter) located near the top-left of the grid

#### Scenario: Combat room placement
- **WHEN** room types are assigned
- **THEN** 8-10 tiles along corridors SHALL be designated as Combat rooms

#### Scenario: Rest room placement
- **WHEN** room types are assigned
- **THEN** 1-2 tiles at branch junctions (not on dead ends) SHALL be designated as Rest rooms

#### Scenario: Shop room placement
- **WHEN** room types are assigned
- **THEN** exactly 1 tile SHALL be designated as a Shop room, placed roughly mid-maze by path distance from start

#### Scenario: Event room placement
- **WHEN** room types are assigned
- **THEN** 1-2 tiles at dead ends SHALL be designated as Event rooms (rewarding exploration)

### Requirement: Player moves freely on the grid
The player SHALL move to any adjacent walkable tile (up, down, left, right — not diagonal). Movement is not restricted to forward-only; backtracking is allowed.

#### Scenario: Move to adjacent tile
- **WHEN** the player taps a walkable tile adjacent to their current position
- **THEN** the player moves to that tile

#### Scenario: Cannot move to non-adjacent tile
- **WHEN** the player taps a tile that is not directly adjacent
- **THEN** nothing happens

#### Scenario: Cannot move to wall
- **WHEN** the player taps a wall tile or an unrevealed tile
- **THEN** nothing happens

### Requirement: Entering a room triggers its encounter
When the player moves to a tile, the room's encounter SHALL trigger based on its type and cleared status.

#### Scenario: Entering uncleared Combat room
- **WHEN** the player moves to a Combat room that has not been cleared
- **THEN** combat begins with enemies appropriate to the sector

#### Scenario: Entering cleared room
- **WHEN** the player moves to any room that has already been cleared
- **THEN** no encounter triggers; the player passes through freely

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

### Requirement: Fog of war on the grid
Tiles SHALL be in one of three visibility states: unrevealed (dark), revealed (dimmed, type visible), or visited (fully lit).

#### Scenario: Initial visibility
- **WHEN** a run begins
- **THEN** only the start tile is visited; tiles adjacent to the start (including diagonals) are revealed; all other tiles are unrevealed

#### Scenario: Moving reveals neighbors
- **WHEN** the player moves to a new tile
- **THEN** that tile becomes visited, and all tiles adjacent to it (including diagonals) become revealed if not already

#### Scenario: Unrevealed tiles are hidden
- **WHEN** the player views the map
- **THEN** unrevealed tiles SHALL appear as dark squares with no type information

#### Scenario: Revealed tiles show type
- **WHEN** the player views the map
- **THEN** revealed (but unvisited) tiles SHALL show their room type icon in a dimmed state

### Requirement: Grid map renders on mobile
The maze grid SHALL render as a compact grid of square tiles suitable for mobile screens.

#### Scenario: Grid fits on mobile
- **WHEN** the map is displayed on a 375px-wide screen
- **THEN** the 7x7 grid SHALL fit within the viewport with tiles of at least 40px

#### Scenario: Player position highlighted
- **WHEN** the map is displayed
- **THEN** the player's current tile SHALL be visually distinct (highlighted border or glow)

#### Scenario: Tappable adjacent tiles
- **WHEN** the player views the map during navigation
- **THEN** walkable tiles adjacent to the player SHALL be visually indicated as tappable
