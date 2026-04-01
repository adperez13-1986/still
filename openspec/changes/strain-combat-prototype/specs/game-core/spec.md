## MODIFIED Requirements

### Requirement: Run structure
The game SHALL be organized into discrete runs. Each run begins with Still at strain 2 and ends when Still clears the sector or is defeated (HP 0). Strain persists across encounters within a run, with passive decay of 2 between combats.

#### Scenario: Starting a new run
- **WHEN** the player starts a new run
- **THEN** Still initializes with base health of 70, strain at 2, and starting equipment

#### Scenario: Run ends in defeat
- **WHEN** Still's health reaches zero during combat
- **THEN** the run ends with game over

#### Scenario: Strain carries between encounters with decay
- **WHEN** a combat encounter ends with victory and the player enters a new encounter
- **THEN** strain retains its value from the previous encounter, minus 2 passive decay (minimum 0)

### Requirement: Win and loss conditions per combat

#### Scenario: All enemies defeated
- **WHEN** the last enemy reaches zero health
- **THEN** combat ends with victory, reward screen shown, strain is unchanged

#### Scenario: Still is defeated
- **WHEN** Still's health reaches zero
- **THEN** combat ends, run ends with game over

#### Scenario: Strain 20 forfeit
- **WHEN** strain reaches 20 during combat
- **THEN** combat ends with forfeit. No rewards. Strain drops to 14. Run continues.
