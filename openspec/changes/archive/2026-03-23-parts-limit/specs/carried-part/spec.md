## ADDED Requirements

### Requirement: Parts have a maximum capacity of 4
The player SHALL hold at most 4 behavioral parts at any time. This limit applies across all sources of part acquisition (combat drops, events, carried parts).

#### Scenario: Part acquired below capacity
- **WHEN** the player has fewer than 4 parts and acquires a new part
- **THEN** the part is added normally

#### Scenario: Part acquired at capacity
- **WHEN** the player has 4 parts and a part drop occurs
- **THEN** a replacement overlay is shown allowing the player to swap one existing part for the new one, or skip

#### Scenario: Player chooses to replace
- **WHEN** the player selects an existing part to replace in the overlay
- **THEN** the selected part is removed and the new part takes its place

#### Scenario: Player chooses to skip
- **WHEN** the player taps "Skip" in the replacement overlay
- **THEN** the new part is discarded and the existing 4 parts are unchanged

#### Scenario: Carried part counts toward limit
- **WHEN** a run begins with a carried part from a previous run
- **THEN** the carried part occupies 1 of the 4 part slots
