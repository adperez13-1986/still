## ADDED Requirements

### Requirement: Rooms collapse after combat milestones
After every 3rd combat cleared in a run, one random unvisited meaningful room SHALL collapse. Meaningful rooms are Combat, Shop, Event, and Rest rooms. Boss rooms and empty corridors SHALL NOT be eligible for collapse.

#### Scenario: First collapse after 3rd combat
- **WHEN** the player clears their 3rd combat encounter in a run
- **THEN** one random unvisited meaningful room collapses

#### Scenario: Second collapse after 6th combat
- **WHEN** the player clears their 6th combat encounter in a run
- **THEN** one random unvisited meaningful room collapses

#### Scenario: Third collapse after 9th combat
- **WHEN** the player clears their 9th combat encounter in a run
- **THEN** one random unvisited meaningful room collapses

#### Scenario: No eligible rooms to collapse
- **WHEN** a collapse is triggered but all unvisited meaningful rooms have already been visited or collapsed
- **THEN** no collapse occurs

#### Scenario: Boss room is protected
- **WHEN** a collapse is triggered
- **THEN** the Boss room SHALL NOT be selected as a collapse target regardless of its visited state

### Requirement: Collapsed rooms are passable rubble
Collapsed rooms SHALL remain walkable but produce no encounter. The player can move through a collapsed room as if it were an empty corridor.

#### Scenario: Entering a collapsed room
- **WHEN** the player moves to a collapsed room
- **THEN** no encounter triggers and the player passes through freely

#### Scenario: Collapsed room does not softlock
- **WHEN** the only path to the Boss room passes through a collapsed room
- **THEN** the player can walk through the collapsed room to reach the Boss

### Requirement: Stability counter is visible
The map UI SHALL display a stability counter showing the player's progress toward the next collapse, formatted as combats cleared since last collapse out of 3.

#### Scenario: Counter displays current progress
- **WHEN** the player views the map after clearing 1 combat since the last collapse
- **THEN** the stability counter shows "1/3" (or equivalent visual)

#### Scenario: Counter resets after collapse
- **WHEN** a collapse occurs
- **THEN** the stability counter resets to "0/3"

#### Scenario: Counter after all collapses spent
- **WHEN** the player has triggered 3 collapses (cleared 9+ combats) and no more unvisited meaningful rooms remain
- **THEN** the stability counter is hidden or shows a stable state

### Requirement: Collapse notification
When a room collapses, the player SHALL be notified even if the collapsed room is in the fog of war.

#### Scenario: Collapse of a revealed room
- **WHEN** a visible (revealed or visited) room collapses
- **THEN** the room visually changes to rubble on the map and a brief notification is shown

#### Scenario: Collapse of an unrevealed room
- **WHEN** an unrevealed room collapses
- **THEN** a brief notification is shown ("A room has collapsed somewhere in the maze") but the specific location is not revealed
