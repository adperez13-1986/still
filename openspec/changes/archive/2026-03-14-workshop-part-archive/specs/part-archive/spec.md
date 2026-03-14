## ADDED Requirements

### Requirement: Part Archive persists parts across runs
The game SHALL maintain a persistent Part Archive — a collection of behavioral parts the player has found across all runs. Each entry records the part ID, the sector it was found in, and a cooldown counter.

#### Scenario: Part added to archive after run
- **WHEN** a run ends (victory or defeat) and the player collected parts not already in the archive
- **THEN** each new part is added to the archive with its sector of origin and cooldown of 0

#### Scenario: Duplicate part found
- **WHEN** the player finds a part that is already in the archive
- **THEN** the archive entry is unchanged (no duplicate, no cooldown reset)

#### Scenario: Archive persists across sessions
- **WHEN** the player closes and reopens the game
- **THEN** the Part Archive is fully preserved in permanent storage

### Requirement: Player selects one archived part before each run
The Workshop SHALL display the Part Archive and allow the player to select exactly one part to carry into the next run. Only parts with cooldown of 0 are selectable.

#### Scenario: Selecting a ready part
- **WHEN** the player taps an archived part with cooldown 0
- **THEN** that part is marked as the selected carry for the next run

#### Scenario: Part on cooldown is not selectable
- **WHEN** the player views an archived part with cooldown > 0
- **THEN** the part is displayed with its remaining cooldown and cannot be selected

#### Scenario: Deselecting a part
- **WHEN** the player taps an already-selected part
- **THEN** the selection is cleared (no part will be carried)

#### Scenario: Starting a run with no selection
- **WHEN** the player starts a run without selecting an archived part
- **THEN** the run begins with no carried part

### Requirement: Carried parts activate only in their origin sector
A carried part from the archive SHALL only become active when the player reaches the sector where the part was originally found.

#### Scenario: S1 part active from start
- **WHEN** a run begins with an archived Sector 1 part selected
- **THEN** the part's behavioral trigger is active from the first combat

#### Scenario: S2 part inactive in Sector 1
- **WHEN** a run begins with an archived Sector 2 part selected
- **THEN** the part is visible in the parts display but inert (trigger does not fire), with a label indicating it activates in Sector 2

#### Scenario: S2 part activates on sector advance
- **WHEN** the player advances from Sector 1 to Sector 2 while carrying an archived Sector 2 part
- **THEN** the part becomes active and its behavioral trigger fires normally

### Requirement: Win-triggered cooldown rotation
After a winning run, the carried part SHALL go on cooldown if it was active during the run. Cooldown decrements after every completed run.

#### Scenario: Win triggers cooldown
- **WHEN** a run ends in victory and the carried part was active (player reached its sector)
- **THEN** the part's cooldown is set to 3

#### Scenario: Loss does not trigger cooldown
- **WHEN** a run ends in defeat
- **THEN** the carried part's cooldown is unchanged

#### Scenario: Win but part never activated
- **WHEN** a run ends in victory but the carried S2 part never activated (player didn't reach Sector 2)
- **THEN** the part's cooldown is unchanged

#### Scenario: Cooldown decrements after each run
- **WHEN** any run ends (victory or defeat)
- **THEN** all parts in the archive with cooldown > 0 have their cooldown decremented by 1

#### Scenario: Cooldown reaches zero
- **WHEN** a part's cooldown decrements to 0
- **THEN** the part becomes selectable again in the archive
