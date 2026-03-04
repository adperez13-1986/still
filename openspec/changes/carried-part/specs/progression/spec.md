## ADDED Requirements

### Requirement: Workshop offers part repair
The Workshop node during a run SHALL offer a Repair action when the player's carried part is broken and has repairs remaining.

#### Scenario: Repair available at workshop node
- **WHEN** the player enters a Workshop node mid-run with a broken carried part (repairsLeft > 0)
- **THEN** a Repair option is displayed alongside existing workshop actions (card upgrades, stat upgrades)

#### Scenario: Repair costs shards
- **WHEN** the player selects Repair
- **THEN** shards are deducted and the carried part's durability is restored to maximum
