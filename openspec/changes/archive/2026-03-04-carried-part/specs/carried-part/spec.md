## ADDED Requirements

### Requirement: Player carries one part across runs
At the end of every run, the player SHALL be presented with a selection of parts collected during that run (and their current carried part, if any) and choose exactly 1 to carry into the next run. Carrying forward is optional — the player may decline.

#### Scenario: End-of-run carry selection
- **WHEN** a run ends (victory or defeat)
- **THEN** the player sees a "Choose a part to carry" overlay listing all parts from the current run plus their existing carried part (if any), and may select one or none

#### Scenario: Replacing an existing carried part
- **WHEN** the player selects a new part to carry while already holding a carried part
- **THEN** the old carried part is discarded and the new one becomes the carried part

#### Scenario: Declining to carry
- **WHEN** the player dismisses the selection without choosing
- **THEN** any existing carried part is preserved unchanged; no new part is carried

### Requirement: Carried part has durability
Every carried part SHALL have a durability counter (default: 3) that decrements after each combat won. When durability reaches 0, the part becomes inactive but remains in the player's possession.

#### Scenario: Durability decrements after combat
- **WHEN** the player wins a combat while holding an intact carried part
- **THEN** the carried part's durability decreases by 1

#### Scenario: Part breaks at zero durability
- **WHEN** the carried part's durability reaches 0
- **THEN** the part becomes inactive — its stat effects no longer apply and it is displayed as broken (grayed out) in the Equips overlay

#### Scenario: Broken part is not discarded
- **WHEN** a carried part is broken (durability 0)
- **THEN** it remains visible and selectable in the Equips overlay; the player still possesses it

### Requirement: Broken parts can be repaired at the Workshop
The Workshop SHALL offer a Repair action when the player holds a broken carried part and has repairs remaining. Repair restores full durability and costs shards.

#### Scenario: Repair option appears when applicable
- **WHEN** the player visits a Workshop node and their carried part is broken with at least 1 repair remaining
- **THEN** a Repair option is shown with the shard cost

#### Scenario: Successful repair
- **WHEN** the player has sufficient shards and confirms the repair
- **THEN** the carried part's durability is restored to its maximum and repairsLeft decrements by 1

#### Scenario: No repair option when part is intact
- **WHEN** the player visits the Workshop and their carried part has durability > 0
- **THEN** no Repair option is shown

#### Scenario: No repair option when repairs exhausted
- **WHEN** the player visits the Workshop and their carried part has repairsLeft === 0
- **THEN** no Repair option is shown, even if the part is broken

### Requirement: Permanent destruction when repairs are exhausted
When a carried part with no repairs remaining breaks again, it SHALL be permanently destroyed and removed from the player's possession. A farewell message is displayed.

#### Scenario: Final break
- **WHEN** the carried part breaks (durability reaches 0) and repairsLeft is already 0
- **THEN** the part is permanently destroyed and a flavor message is shown (e.g., "Salvaged Plating finally gave out.")

#### Scenario: Destroyed part is gone
- **WHEN** a part has been permanently destroyed
- **THEN** it no longer appears anywhere in the game; the player starts the next carry-selection with no carried part

### Requirement: Carried part loads at run start
When a run begins, the carried part SHALL be active in the player's part inventory if its durability is above 0. If it is broken, it loads as inactive but visible.

#### Scenario: Intact carried part active at run start
- **WHEN** a new run begins and the player has an intact carried part
- **THEN** the part's stat effects are applied from the start of the run

#### Scenario: Broken carried part visible at run start
- **WHEN** a new run begins and the player has a broken carried part
- **THEN** the part appears in the Equips overlay as broken (grayed), with no stat effects applied, and a notice informs the player that their carried part needs repair

### Requirement: Broken carried part is visible in the Equips overlay
The Equips overlay SHALL display the carried part in a distinct broken state when its durability is 0 — grayed out, inert, but present.

#### Scenario: Broken visual state
- **WHEN** the player opens the Equips overlay and the carried part is broken
- **THEN** the part is shown grayed out with a "BROKEN" label and its remaining repair count
