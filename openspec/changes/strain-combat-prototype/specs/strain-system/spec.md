## ADDED Requirements

### Requirement: Strain meter

The game SHALL track a strain value (integer, 0-10) that represents the player's accumulated pressure. Strain accumulates during combat from pushing slots. Strain does NOT reset between turns or between encounters within a run.

#### Scenario: Strain initialized at run start
- **WHEN** a new run begins
- **THEN** strain is set to 2

#### Scenario: Strain persists between turns
- **WHEN** a combat turn ends and the next turn begins
- **THEN** strain retains its current value (no reset)

#### Scenario: Strain persists between encounters
- **WHEN** a combat encounter ends (victory or forfeit) and the player enters a new encounter
- **THEN** strain retains its value from the end of the previous encounter

#### Scenario: Strain increases from pushing
- **WHEN** the player pushes a slot during the planning phase
- **THEN** strain increases by the slot's equipment `pushCost` value

#### Scenario: Strain cannot exceed max
- **WHEN** strain would increase beyond `maxStrain` (10)
- **THEN** strain is capped at 10 and the strain-10 forfeit triggers

### Requirement: Strain 10 forfeit

When strain reaches 10 during combat, the player gives up on the current fight. This is NOT a game over — the run continues.

#### Scenario: Strain reaches 10
- **WHEN** strain reaches 10 at any point during combat (after push selection or during any effect)
- **THEN** combat ends immediately with a forfeit outcome

#### Scenario: Forfeit outcome
- **WHEN** combat ends via strain 10 forfeit
- **THEN** the player receives no combat rewards (no cards, shards, parts). HP is unchanged. The run continues. Strain drops to 7 after forfeiting.

#### Scenario: Forfeit does not end the run
- **WHEN** combat ends via strain 10 forfeit
- **THEN** the player returns to the map and can continue navigating

### Requirement: Strain cannot be pushed past 10 voluntarily

The player SHALL NOT be able to confirm push selections that would bring strain to exactly 10 or above, UNLESS they have no other choice (all remaining enemies would kill them without pushing). The forfeit happens when strain reaches 10, not when the player tries to go past it.

#### Scenario: Push would reach 10
- **WHEN** the player's push selections would bring strain to 10 or above
- **THEN** display a warning. The player can confirm (triggering forfeit) or adjust their selections.
