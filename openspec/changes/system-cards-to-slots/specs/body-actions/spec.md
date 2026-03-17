## MODIFIED Requirements

### Requirement: Filled equipment slots generate automatic actions each turn
Each filled equipment slot SHALL produce one action per turn during the execution phase, UNLESS the slot has a system card assigned this turn. System cards override equipment — when a system card occupies a slot, the equipment action is skipped during execution because the system card already fired during planning.

#### Scenario: Filled slot generates action (no system card)
- **WHEN** the execution phase begins and an equipment slot has an item equipped and no system card assigned
- **THEN** that slot's action fires with its base output value

#### Scenario: Slot with system card skips execution
- **WHEN** the execution phase begins and a slot has a system card assigned
- **THEN** no equipment action is generated for that slot (the system card already resolved)

#### Scenario: Empty slot generates nothing
- **WHEN** the execution phase begins and an equipment slot is empty and has no system card
- **THEN** no action is generated for that slot

### Requirement: Body actions can be modified by modifier cards
During the planning phase, the player SHALL be able to assign slot modifier cards to body slots, altering how that slot's action behaves during execution. Slots occupied by system cards cannot receive slot modifiers.

#### Scenario: Modifier enhances body action
- **WHEN** the player assigns a slot modifier card to a filled equipment slot that has no system card
- **THEN** that slot's action is altered according to the modifier's effect

#### Scenario: Modifier blocked by system card
- **WHEN** the player attempts to assign a slot modifier to a slot with a system card
- **THEN** the assignment is rejected — the slot is already occupied
