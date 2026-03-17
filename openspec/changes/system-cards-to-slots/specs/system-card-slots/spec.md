## ADDED Requirements

### Requirement: System cards are assigned to body slots
System cards SHALL be assigned to a specific body slot during the planning phase, not played instantly. Each system card has a home slot that determines which slot it can be assigned to.

#### Scenario: Assigning a system card to its home slot
- **WHEN** the player selects a system card from hand
- **THEN** only the card's home slot is highlighted as a valid target

#### Scenario: System card assigned to wrong slot
- **WHEN** the player attempts to assign a system card to a slot that is not its home slot
- **THEN** the assignment is rejected

#### Scenario: System card on occupied slot
- **WHEN** the player attempts to assign a system card to a slot that already has a modifier or system card
- **THEN** the assignment is rejected

### Requirement: System cards fire instantly on assignment
System cards SHALL resolve their effects immediately when assigned to their home slot during planning, not during the execution phase.

#### Scenario: Cooling system card fires instantly
- **WHEN** the player assigns Coolant Flush to LEGS
- **THEN** heat is reduced by 3 immediately during planning, and LEGS is marked as occupied

#### Scenario: Draw system card fires instantly
- **WHEN** the player assigns Diagnostics to HEAD
- **THEN** 2 cards are drawn immediately during planning, and HEAD is marked as occupied

#### Scenario: Damage system card fires instantly
- **WHEN** the player assigns Meltdown to ARMS
- **THEN** 15 damage is dealt to the target enemy immediately during planning, and ARMS is marked as occupied

#### Scenario: Defense system card fires instantly
- **WHEN** the player assigns Failsafe Protocol to TORSO
- **THEN** 10 Block is gained immediately during planning, and TORSO is marked as occupied

### Requirement: System card overrides equipment for the turn
When a system card occupies a slot, the equipment's default action SHALL NOT fire during execution for that slot.

#### Scenario: Equipment skipped when system card assigned
- **WHEN** execution phase begins and a slot has a system card assigned
- **THEN** the slot's equipment action does not fire (the system card already resolved during planning)

#### Scenario: Slot modifiers cannot be added to system-card slot
- **WHEN** a slot has a system card assigned this turn
- **THEN** no slot modifier can be assigned to that slot

### Requirement: System cards exhaust after assignment
System cards SHALL be moved to the exhaust pile immediately after their effects resolve during planning.

#### Scenario: System card exhausted after use
- **WHEN** a system card's effects resolve during planning
- **THEN** the card is placed in the exhaust pile and does not return to the draw/discard cycle for the rest of combat

### Requirement: System card home slot mapping
Each system card SHALL have exactly one home slot based on its thematic domain.

#### Scenario: HEAD system cards (processing)
- **WHEN** a draw, buff, or debuff system card is defined
- **THEN** its home slot is HEAD (e.g., Diagnostics, Quick Scan, Thermal Surge, Overclock, Target Lock, Cold Efficiency, Heat Surge)

#### Scenario: LEGS system cards (thermal)
- **WHEN** a cooling or heat management system card is defined
- **THEN** its home slot is LEGS (e.g., Coolant Flush, Deep Freeze, Heat Vent, Thermal Flux, Thermal Equilibrium, Salvage Burst)

#### Scenario: ARMS system cards (weapons)
- **WHEN** a direct damage system card is defined
- **THEN** its home slot is ARMS (e.g., Meltdown, Reckless Charge, Precision Strike, Glacier Lance, Flux Spike, Fuel the Fire, Controlled Burn)

#### Scenario: TORSO system cards (chassis)
- **WHEN** a defense or heal system card is defined
- **THEN** its home slot is TORSO (e.g., Field Repair, Failsafe Protocol, Armor Protocol)
