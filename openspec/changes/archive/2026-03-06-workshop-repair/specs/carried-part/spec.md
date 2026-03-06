## ADDED Requirements

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
