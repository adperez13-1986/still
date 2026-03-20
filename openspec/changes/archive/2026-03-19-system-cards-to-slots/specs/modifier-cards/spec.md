## MODIFIED Requirements

### Requirement: System cards provide global effects
System cards SHALL be assigned to their home body slot during the planning phase. Their effects resolve instantly on assignment. Each system card has a designated home slot based on its thematic domain (HEAD for utility, LEGS for cooling, ARMS for damage, TORSO for defense). System cards still exhaust after use.

#### Scenario: Playing a system card
- **WHEN** the player plays a system card
- **THEN** the player assigns it to its home slot, the effect resolves immediately, the card exhausts, and the slot is occupied for the turn

#### Scenario: System card in hand
- **WHEN** the player selects a system card from hand
- **THEN** only the card's home slot is highlighted as a valid assignment target

### Requirement: Slot modifier cards target one body slot
Slot modifier cards SHALL target a specific body slot, altering that slot's action for the current turn. A slot can hold either one system card OR one slot modifier, not both. Slot restrictions by category still apply (Amplify ARMS/TORSO, Redirect ARMS, etc.).

#### Scenario: Assigning a slot modifier to a system-card-occupied slot
- **WHEN** a slot already has a system card assigned this turn
- **THEN** the player cannot assign a slot modifier to that slot

#### Scenario: Assigning a system card to a modifier-occupied slot
- **WHEN** a slot already has a slot modifier assigned this turn
- **THEN** the player cannot assign a system card to that slot

## REMOVED Requirements

### Requirement: Cool passive block
**Reason**: With all 4 slots now demanding cards (system cards on HEAD/LEGS, modifiers on ARMS/TORSO), the defensive floor comes from engaging with the slot system. The Cool passive block (+1 per unplayed card while Cool) is no longer needed and is removed.
**Migration**: Remove Cool passive block calculation from `executeBodyActions` in combat.ts. Remove `coolPassiveBlock` from CombatScreen and StillPanel.
