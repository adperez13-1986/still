## MODIFIED Requirements

### Requirement: Player carries one part across runs
At the end of every run, the player SHALL be presented with a selection of behavioral parts collected during that run (and their current carried part, if any) and choose exactly 1 to carry into the next run. Carrying forward is optional — the player may decline.

#### Scenario: End-of-run carry selection
- **WHEN** a run ends (victory or defeat)
- **THEN** the player sees a "Choose a part to carry" overlay listing all behavioral parts from the current run plus their existing carried part (if any), and may select one or none

#### Scenario: Replacing an existing carried part
- **WHEN** the player selects a new part to carry while already holding a carried part
- **THEN** the old carried part is discarded and the new one becomes the carried part

#### Scenario: Declining to carry
- **WHEN** the player dismisses the selection without choosing
- **THEN** any existing carried part is cleared

### Requirement: Carried part loads at run start
When a run begins, the carried part SHALL be active in the player's part inventory unconditionally. There is no breakage or durability — the part is always functional.

#### Scenario: Carried part active at run start
- **WHEN** a new run begins and the player has a carried part
- **THEN** the part's behavioral trigger is active from the start of the run

#### Scenario: No carried part
- **WHEN** a new run begins and the player has no carried part
- **THEN** the player starts with no carried part in their part inventory

## REMOVED Requirements

### Requirement: Carried part has durability
**Reason**: Durability/breakage adds maintenance tax without meaningful decisions. Repairing a broken part is a chore, not a strategic choice.
**Migration**: `CarriedPart` type simplified from `{ partId, durability, maxDurability, repairsLeft }` to a plain part ID string. Existing saves migrated by extracting `partId`.

### Requirement: Broken carried part is visible in the Equips overlay
**Reason**: No breakage means no broken state to display.
**Migration**: Remove broken display logic from Equips overlay.

### Requirement: Carried part can be repaired at the Workshop
**Reason**: No breakage means no repair needed.
**Migration**: Remove repair UI from Workshop and Shop screens.
