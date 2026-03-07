## ADDED Requirements

### Requirement: Behavioral mods can trigger on heat threshold crossings
The mod trigger system SHALL support an `onThresholdCross` trigger that fires whenever Still's heat crosses a threshold boundary (Cool/Warm at heat 5, Warm/Hot at heat 8) in either direction during card play or execution.

#### Scenario: Threshold crossed upward
- **WHEN** Still's heat changes from 4 to 5 (Cool to Warm boundary)
- **THEN** any mod with `onThresholdCross` trigger fires

#### Scenario: Threshold crossed downward
- **WHEN** Still's heat changes from 5 to 4 (Warm to Cool boundary)
- **THEN** any mod with `onThresholdCross` trigger fires

#### Scenario: No threshold crossed
- **WHEN** Still's heat changes from 5 to 7 (stays within Warm)
- **THEN** `onThresholdCross` does not fire

#### Scenario: Multiple crossings in one turn
- **WHEN** Still's heat crosses a threshold multiple times in one turn (e.g., up past Warm, cooled back, up again)
- **THEN** the trigger fires each time a boundary is crossed

### Requirement: Sector 1 mod pool includes archetype-seeding mods
The Sector 1 behavioral mod pool SHALL include mods that reward specific heat playstyles.

#### Scenario: Cool Runner mod in Sector 1
- **WHEN** mods are available in Sector 1
- **THEN** the pool includes Frost Core (onTurnStart: while Cool, gain +2 Block)

#### Scenario: Pyromaniac mod in Sector 1
- **WHEN** mods are available in Sector 1
- **THEN** the pool includes Overheater (onSlotFire Arms: while Hot, +3 bonus damage)

#### Scenario: Oscillator mod in Sector 1
- **WHEN** mods are available in Sector 1
- **THEN** the pool includes Flux Capacitor (onThresholdCross: draw 1 card) as a rare drop

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
- **THEN** any existing carried part is preserved unchanged; no new part is carried

### Requirement: Carried part has durability
Every carried part SHALL have a durability counter (default: 3) that decrements after each combat won. When durability reaches 0, the part becomes inactive but remains in the player's possession.

#### Scenario: Durability decrements after combat
- **WHEN** the player wins a combat while holding an intact carried part
- **THEN** the carried part's durability decreases by 1

#### Scenario: Part breaks at zero durability
- **WHEN** the carried part's durability reaches 0
- **THEN** the part becomes inactive — its behavioral trigger no longer activates during combat, and it is displayed as broken (grayed out) in the Equips overlay

#### Scenario: Broken part is not discarded
- **WHEN** a carried part is broken (durability 0)
- **THEN** it remains visible and selectable in the Equips overlay; the player still possesses it

### Requirement: Carried part loads at run start
When a run begins, the carried part SHALL be active in the player's part inventory if its durability is above 0. If it is broken, it loads as inactive but visible.

#### Scenario: Intact carried part active at run start
- **WHEN** a new run begins and the player has an intact carried part
- **THEN** the part's behavioral trigger is active from the start of the run

#### Scenario: Broken carried part visible at run start
- **WHEN** a new run begins and the player has a broken carried part
- **THEN** the part appears in the Equips overlay as broken (grayed), with its behavioral trigger inactive, and a notice informs the player that their carried part needs repair

### Requirement: Broken carried part is visible in the Equips overlay
The Equips overlay SHALL display the carried part in a distinct broken state when its durability is 0 — grayed out, inert, but present.

#### Scenario: Broken visual state
- **WHEN** the player opens the Equips overlay and the carried part is broken
- **THEN** the part is shown grayed out with a "BROKEN" label and its remaining repair count

### Requirement: Carried part can be repaired at the Workshop
The player SHALL be able to repair a broken carried part from the Workshop screen using permanent shards, restoring it to full durability before starting a run.

#### Scenario: Workshop repair available
- **WHEN** the player is at the Workshop and has a broken carried part (durability 0) with repairs remaining
- **THEN** the Workshop displays the broken part with a "Repair" button showing the cost (50 permanent shards)

#### Scenario: Successful workshop repair
- **WHEN** the player clicks "Repair" and has enough permanent shards
- **THEN** 50 permanent shards are deducted, the carried part's durability is restored to maximum, repairsLeft is decremented by 1, and the state is saved

#### Scenario: Cannot afford workshop repair
- **WHEN** the player has a broken carried part but fewer than 50 permanent shards
- **THEN** the repair button is shown but disabled, indicating insufficient shards

#### Scenario: Workshop repair not shown when part is intact or fully spent
- **WHEN** the carried part has durability > 0, or has no repairs remaining, or is null
- **THEN** the Workshop does not show a repair option
