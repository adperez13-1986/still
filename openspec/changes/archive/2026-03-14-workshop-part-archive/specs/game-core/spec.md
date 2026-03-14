## MODIFIED Requirements

### Requirement: Run structure
The game SHALL be organized into discrete runs. Each run begins with Still in an initial state and ends when Still reaches the final room of the current sector or is defeated. A run consists of navigating the maze room by room, engaging in encounters, and collecting rewards. The pre-run flow goes directly from Workshop to Run with no intermediate screens.

#### Scenario: Starting a new run
- **WHEN** the player starts a new run
- **THEN** Still initializes with base health of 70, Heat at 0, ARMS equipped with Piston Arm, HEAD/TORSO/LEGS empty (unless modified by workshop upgrades), the selected archive part (if any, sector-gated), and a starting modifier deck of 8 cards

#### Scenario: Run ends in defeat
- **WHEN** Still's health reaches zero during combat
- **THEN** the run ends, the defeat screen is shown, persistent resources earned during the run are saved, new parts are added to the archive, cooldowns decrement, and the player is returned to the Workshop

#### Scenario: Run ends in victory
- **WHEN** Still clears the final room of the sector
- **THEN** the run ends, the victory screen is shown, persistent rewards are saved, new parts are added to the archive, the carried part goes on cooldown (if it was active), cooldowns decrement, and the player is returned to the Workshop

## REMOVED Requirements

### Requirement: Fragment bonuses applied at run start
**Reason**: The fragment system is being removed entirely. No more pre-run bonus spending.
**Migration**: Remove FragmentScreen component and `/fragment` route. Remove `FragmentBonus` type. Remove bonus consumption from RunScreen initialization. Remove `sessionStorage` flag pattern (`still-run-bonuses-consumed`) that was used to distinguish fresh navigation from reload.
