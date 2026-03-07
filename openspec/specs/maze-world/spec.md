## ADDED Requirements

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

### Requirement: Sector structure maps to narrative arc
The maze SHALL be divided into sectors that correspond to the game's narrative arc. Sector 1 is survival-focused. Sector 2 introduces wonder and curiosity. Sector 3 is purposeful.

#### Scenario: Sector 1 tone
- **WHEN** the player is in Sector 1
- **THEN** the environment feels disorienting — sparse, grey, unknown — and enemy types are basic

#### Scenario: Sector 2 tone
- **WHEN** the player reaches Sector 2
- **THEN** the environment begins to show signs of life — dim light, occasional warmth — and still begins to observe its surroundings in brief narrative moments

#### Scenario: Sector 3 tone
- **WHEN** the player reaches Sector 3
- **THEN** the environment has changed — not safe, but meaningful — and Still moves with intention rather than just survival
