## ADDED Requirements

### Requirement: Maze represented as a branching room graph
The maze SHALL be represented as a directed graph of rooms with branching paths. The player chooses which path to take at each fork. The structure evokes feeling lost in a maze without requiring complex pathfinding or corridor rendering.

#### Scenario: Player views the map
- **WHEN** the player opens the map view
- **THEN** they see a branching graph of rooms ahead, with their current position highlighted and fog obscuring distant rooms

#### Scenario: Player chooses a path
- **WHEN** the player is at a room with multiple forward paths
- **THEN** they may select any adjacent room as their next destination; the choice is final

### Requirement: Room types
The maze SHALL contain distinct room types that create varied pacing and decision-making.

#### Scenario: Combat room
- **WHEN** Still enters a combat room
- **THEN** one or more enemies appear and combat begins; the room is cleared when all enemies are defeated

#### Scenario: Rest room
- **WHEN** Still enters a rest room
- **THEN** the player chooses one of: restore 30% of max health, or upgrade a card in their deck

#### Scenario: Shop room
- **WHEN** Still enters a shop room
- **THEN** a selection of cards, parts, and equipables is offered for purchase using run currency (shards)

#### Scenario: Event room
- **WHEN** Still enters an event room
- **THEN** a narrative vignette is shown with 2-3 choices that have defined outcomes (stat changes, card additions, resource gain/loss)

#### Scenario: Boss room
- **WHEN** Still enters a boss room
- **THEN** a uniquely named enemy with high health, multiple phases or abilities, and a special reward pool is encountered

### Requirement: Act structure maps to narrative arc
The maze SHALL be divided into acts that correspond to the game's narrative arc. Act 1 is survival-focused. Act 2 introduces wonder and curiosity. Act 3 is purposeful.

#### Scenario: Act 1 tone
- **WHEN** the player is in Act 1
- **THEN** the environment feels disorienting — sparse, grey, unknown — and enemy types are basic

#### Scenario: Act 2 tone
- **WHEN** the player reaches Act 2
- **THEN** the environment begins to show signs of life — dim light, occasional warmth — and still begins to observe its surroundings in brief narrative moments

#### Scenario: Act 3 tone
- **WHEN** the player reaches Act 3
- **THEN** the environment has changed — not safe, but meaningful — and Still moves with intention rather than just survival

### Requirement: Fog of war on the map
Rooms beyond the player's immediate next choices SHALL be obscured. The player cannot see the full map ahead — only the next layer of choices.

#### Scenario: Fog prevents full planning
- **WHEN** the player views the map
- **THEN** only the current room and directly reachable next rooms are visible; further rooms show as unknown icons
