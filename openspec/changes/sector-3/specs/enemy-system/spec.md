## ADDED Requirements

### Requirement: Drain intent type
Enemies with Drain intent SHALL steal the player's block and use it as their attack value.

#### Scenario: Drain intent execution
- **WHEN** an enemy executes a Drain intent
- **THEN** the player's block is set to 0 and the enemy deals damage equal to the stolen block amount

#### Scenario: Drain with no player block
- **WHEN** an enemy executes a Drain intent and the player has 0 block
- **THEN** the enemy deals 0 damage (the drain finds nothing to steal)

### Requirement: ExhaustCard intent type
Enemies with ExhaustCard intent SHALL force the player to exhaust a random card from their draw pile.

#### Scenario: ExhaustCard intent execution
- **WHEN** an enemy executes an ExhaustCard intent
- **THEN** a random card from the player's draw pile is moved to the exhaust pile

#### Scenario: ExhaustCard with empty draw pile
- **WHEN** an enemy executes ExhaustCard and the draw pile is empty
- **THEN** a random card from the discard pile is exhausted instead. If both are empty, nothing happens.

### Requirement: Bonded enemies mechanic
Enemies MAY be bonded to another enemy. When a bonded enemy takes damage, its bond partner heals.

#### Scenario: Bonded damage sharing
- **WHEN** damage is dealt to a bonded enemy
- **THEN** the bonded partner heals for 50% of the actual damage dealt (rounded down), not exceeding its max HP

#### Scenario: Bonded partner defeated
- **WHEN** one bonded enemy is defeated
- **THEN** the bond breaks and the surviving enemy takes damage normally with no healing on the defeated partner

### Requirement: Energy reduction mechanic
Some enemies SHALL reduce the player's max energy while alive.

#### Scenario: Energy drain while alive
- **WHEN** an enemy with energy drain is alive at the end of a turn
- **THEN** the player's max energy is reduced by 1 for the next turn

#### Scenario: Energy drain minimum
- **WHEN** the player's max energy would be reduced below 4
- **THEN** max energy stays at 4 (hard floor)

#### Scenario: Energy drain recovery
- **WHEN** the enemy causing energy drain is defeated
- **THEN** the player's max energy returns to normal on the next turn
