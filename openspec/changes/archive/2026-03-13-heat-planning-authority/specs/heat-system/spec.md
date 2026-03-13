## MODIFIED Requirements

### Requirement: Body actions generate Heat
Body actions SHALL NOT generate heat during the execution phase. Heat is no longer modified by slot firing. The player's heat at the end of planning is their heat for the entire execution phase.

#### Scenario: Slot fires without heat generation
- **WHEN** a filled equipment slot's action executes during the execution phase
- **THEN** Heat does not change — the slot's action resolves but produces no heat

#### Scenario: Empty slots generate no Heat
- **WHEN** an equipment slot is empty during the execution phase
- **THEN** no Heat is generated for that slot

#### Scenario: Heat during execution equals planning-end heat
- **WHEN** the execution phase begins
- **THEN** Heat is the same value it was at the end of the planning phase, and it does not change until end-of-turn cooling

### Requirement: Projected Heat display
The combat UI SHALL display the player's current Heat as a real-time indicator during planning. Since heat no longer drifts during execution, current heat at end of planning equals execution heat.

#### Scenario: Projection updates on card play
- **WHEN** the player plays a modifier or system card during the planning phase
- **THEN** the Heat display updates immediately to reflect the card's heat cost

#### Scenario: Projection updates on modifier assignment to extra-heat slot
- **WHEN** the player assigns a modifier to a slot whose equipment has `extraHeatGenerated`
- **THEN** the Heat display increases by the extra heat amount immediately

#### Scenario: Projection shows threshold warnings
- **WHEN** the current Heat is in Hot (7-9) or Overheat (10+)
- **THEN** the display shows a warning indicator with the specific penalty (e.g., "HOT: -3 HP/turn" or "OVERHEAT: 3 dmg per point over 9")

#### Scenario: No per-slot heat projection needed
- **WHEN** the player is in the planning phase
- **THEN** the UI does not need to project per-slot heat accumulation since slots no longer generate heat

## ADDED Requirements

### Requirement: Extra-heat equipment costs heat at assignment time
Equipment with `extraHeatGenerated` SHALL apply its extra heat cost during the planning phase when a modifier card is assigned to that slot, rather than during execution when the slot fires.

#### Scenario: Assigning modifier to extra-heat slot
- **WHEN** the player assigns a modifier card to a slot whose equipment has `extraHeatGenerated: N`
- **THEN** Heat increases by N immediately during planning, in addition to the modifier card's own heat cost

#### Scenario: Removing modifier from extra-heat slot
- **WHEN** the player removes a modifier card from a slot whose equipment has `extraHeatGenerated: N`
- **THEN** Heat decreases by N immediately during planning

#### Scenario: Extra-heat cost is visible before assignment
- **WHEN** the player is considering assigning a modifier to a slot with extra-heat equipment
- **THEN** the UI shows the total heat cost (card cost + extra heat) before confirmation

## REMOVED Requirements

### Requirement: Heat cannot exceed maximum
**Reason**: Heat already has no maximum cap after the heat-rework change (overheat damage model replaced the cap). This requirement was already stale.
**Migration**: Overheat damage (3 per point over 9) handles heat above 9.
