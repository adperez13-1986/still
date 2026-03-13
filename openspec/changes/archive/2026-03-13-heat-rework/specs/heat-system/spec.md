## MODIFIED Requirements

### Requirement: Heat is the central combat resource
Combat SHALL track a Heat value (integer, minimum 0, no maximum) that represents the thermal load on Still's body. Heat replaces the energy system as the sole resource constraining combat actions.

#### Scenario: Heat starts at zero
- **WHEN** a combat encounter begins
- **THEN** Still's Heat is set to 0

#### Scenario: Heat has no upper cap
- **WHEN** an effect would increase Heat above any value
- **THEN** Heat increases to the new value with no cap (overheat damage applies per the overheat-damage spec)

#### Scenario: Heat cannot go below zero
- **WHEN** an effect would decrease Heat below 0
- **THEN** Heat is capped at 0

### Requirement: Heat thresholds govern combat bonuses and penalties
The Heat track SHALL have four named thresholds. Thresholds serve as signals for equipment and part conditions, not as passive stat modifiers.

#### Scenario: Cool state (Heat 0-3)
- **WHEN** Still's Heat is between 0 and 3 inclusive
- **THEN** Still is in the Cool zone; equipment and parts with "while Cool" conditions are active

#### Scenario: Warm state (Heat 4-6)
- **WHEN** Still's Heat is between 4 and 6 inclusive
- **THEN** Still is in the Warm zone; equipment and parts with "while Warm" conditions are active

#### Scenario: Hot state (Heat 7-9)
- **WHEN** Still's Heat is between 7 and 9 inclusive
- **THEN** Still is in the Hot zone; equipment and parts with "while Hot" conditions are active; Still takes 3 damage at end of turn

#### Scenario: Overheat state (Heat 10+)
- **WHEN** Still's Heat is 10 or above
- **THEN** Still is in Overheat; overheat damage applies per the overheat-damage spec; no shutdown is triggered

### Requirement: Projected Heat display
The combat UI SHALL display a real-time projection of Still's Heat at end of turn, updated as the player assigns modifiers during the planning phase.

#### Scenario: Projection updates on modifier assignment
- **WHEN** the player assigns or removes a modifier card during the planning phase
- **THEN** the projected end-of-turn Heat updates immediately, accounting for: current Heat, LEGS equipment cooling, and all assigned modifier costs

#### Scenario: Projection shows threshold warnings
- **WHEN** the projected end-of-turn Heat would be in Hot (7-9) or Overheat (10+)
- **THEN** the display shows a warning indicator — "HOT: -3 HP" for Hot, or estimated overheat damage total for Overheat

### Requirement: No free passive cooling
There SHALL be no automatic passive cooling per turn. All cooling comes from LEGS equipment effects and cooling cards. The `PASSIVE_COOLING` constant and `applyPassiveCooling()` function are removed.

#### Scenario: Start of turn with no LEGS cooling
- **WHEN** a new turn begins and Still has no LEGS equipment that cools
- **THEN** Heat remains unchanged from end of previous turn (no automatic reduction)

#### Scenario: Start of turn with LEGS cooling equipment
- **WHEN** a new turn begins and Still has LEGS equipment that reduces heat
- **THEN** Heat is reduced only by the amount specified by the LEGS equipment effect during execution

## REMOVED Requirements

### Requirement: Overheat state (Heat 10) — old shutdown behavior
**Reason**: Replaced by overheat-damage capability. Overheat no longer triggers shutdown; it triggers damage per point over 9 instead.
**Migration**: Remove shutdown flag, shutdown turn logic, and Heat-reset-to-5 behavior. Replace with overheat damage checks in the heat change function.
