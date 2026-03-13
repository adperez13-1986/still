## Requirements

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

### Requirement: All rooms visible from start
All rooms on the maze grid SHALL be visible from the start of each sector. There is no fog of war. Room types and positions are shown immediately.

#### Scenario: Initial map visibility
- **WHEN** a sector begins
- **THEN** all walkable tiles are visible with their room type icons displayed

#### Scenario: Visited rooms are styled differently
- **WHEN** the player has visited a room
- **THEN** it is visually distinguished from unvisited rooms (e.g., dimmed or marked with a checkmark)

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

### Requirement: Grid map renders on mobile
The maze grid SHALL render as a compact grid of square tiles suitable for mobile screens.

#### Scenario: Grid fits on mobile
- **WHEN** the map is displayed on a 375px-wide screen
- **THEN** the 7x7 grid SHALL fit within the viewport with tiles of at least 40px

#### Scenario: Player position highlighted
- **WHEN** the map is displayed
- **THEN** the player's current tile SHALL be visually distinct (highlighted border or glow)
