## MODIFIED Requirements

### Requirement: Run structure

The game SHALL be organized into discrete runs. Each run begins with Still at strain 2, only Vent as a default ability, and an empty growth state. Strain persists across encounters within a run, with passive decay of 2 between combats. The player's toolkit grows through growth rewards earned after combat victories.

#### Scenario: Starting a new run
- **WHEN** the player starts a new run
- **THEN** Still initializes with base health of 70, strain at 2, Vent as the only available ability, and an empty growth state (no abilities learned, no masteries)

#### Scenario: Run ends in defeat
- **WHEN** Still's health reaches zero during combat
- **THEN** the run ends with game over

#### Scenario: Strain carries between encounters with decay
- **WHEN** a combat encounter ends with victory and the player enters a new encounter
- **THEN** strain retains its value from the previous encounter, minus 2 passive decay (minimum 0)

### Requirement: Win and loss conditions per combat

#### Scenario: All enemies defeated
- **WHEN** the last enemy reaches zero health
- **THEN** combat ends with victory, reward choice screen shown

#### Scenario: Still is defeated
- **WHEN** Still's health reaches zero
- **THEN** combat ends, run ends with game over

#### Scenario: Strain 20 forfeit in combat
- **WHEN** strain reaches 20 during combat
- **THEN** combat ends with forfeit. No rewards. Strain drops to 14. Run continues.

#### Scenario: Strain 20 at boss
- **WHEN** strain reaches 20 during the boss fight
- **THEN** the run ends with a suboptimal ending. "You stopped." Not game over — a different, lesser conclusion.

### Requirement: Growth state persists across encounters

The player's acquired growth rewards SHALL persist for the entire run.

#### Scenario: Ability persists
- **WHEN** the player acquires an ability via growth reward
- **THEN** that ability is available in all subsequent combats for the rest of the run

#### Scenario: Mastery persists
- **WHEN** the player acquires a mastery via growth reward
- **THEN** that slot's push cost remains 0 for the rest of the run

### Requirement: Three run outcomes

A run SHALL end in one of three ways.

#### Scenario: Game over
- **WHEN** HP reaches 0
- **THEN** run ends. "Shutdown." Hard failure.

#### Scenario: Suboptimal ending
- **WHEN** strain reaches 20 during the boss fight
- **THEN** run ends. "You stopped." Soft failure — you gave up, not destroyed.

#### Scenario: Victory
- **WHEN** the sector boss is defeated
- **THEN** run ends. "You made it." The player survived and grew enough.
