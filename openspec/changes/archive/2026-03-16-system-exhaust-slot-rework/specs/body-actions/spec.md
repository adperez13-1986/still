## MODIFIED Requirements

### Requirement: Body actions can be modified by modifier cards
During the planning phase, the player SHALL be able to assign slot modifier cards to body slots, altering how that slot's action behaves during execution. Slot modifiers are restricted by category to valid slots.

#### Scenario: Modifier enhances body action
- **WHEN** the player assigns a slot modifier card to a filled equipment slot within the modifier's allowed slot set
- **THEN** that slot's action is altered according to the modifier's effect (amplified, redirected, repeated, or overridden)

#### Scenario: Modifier on empty slot
- **WHEN** the player assigns an Override modifier to an empty equipment slot within the modifier's allowed slot set
- **THEN** the override action replaces the empty slot's lack of action, allowing that slot to act this turn

#### Scenario: Non-override modifier on empty slot
- **WHEN** the player attempts to assign an Amplify, Redirect, or Repeat modifier to an empty slot
- **THEN** the assignment is rejected — there is no base action to modify

#### Scenario: Modifier on disallowed slot
- **WHEN** the player attempts to assign a modifier to a slot outside its category's allowed set
- **THEN** the assignment is rejected — the UI SHALL not highlight disallowed slots as valid targets
