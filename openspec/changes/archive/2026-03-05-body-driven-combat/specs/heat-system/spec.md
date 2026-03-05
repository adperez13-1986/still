## ADDED Requirements

### Requirement: Heat is the central combat resource
Combat SHALL track a Heat value (integer, minimum 0, maximum 10) that represents the thermal load on Still's body. Heat replaces the energy system as the sole resource constraining combat actions.

#### Scenario: Heat starts at zero
- **WHEN** a combat encounter begins
- **THEN** Still's Heat is set to 0

#### Scenario: Heat cannot exceed maximum
- **WHEN** an effect would increase Heat above 10
- **THEN** Heat is capped at 10

#### Scenario: Heat cannot go below zero
- **WHEN** an effect would decrease Heat below 0
- **THEN** Heat is capped at 0

### Requirement: Heat thresholds govern combat bonuses and penalties
The Heat track SHALL have four named thresholds that apply escalating effects to Still's body actions.

#### Scenario: Cool state (Heat 0-4)
- **WHEN** Still's Heat is between 0 and 4 inclusive
- **THEN** body actions operate at base output with no bonuses or penalties

#### Scenario: Warm state (Heat 5-7)
- **WHEN** Still's Heat is between 5 and 7 inclusive
- **THEN** all body actions gain +1 to their output value (damage, block, draw count, or Heat reduction)

#### Scenario: Hot state (Heat 8-9)
- **WHEN** Still's Heat is between 8 and 9 inclusive
- **THEN** all body actions gain +2 to their output value, AND Still takes 3 damage at the end of the turn (after enemy phase)

#### Scenario: Overheat state (Heat 10)
- **WHEN** Still's Heat reaches 10 at any point during a turn
- **THEN** the shutdown flag is set; on the NEXT turn's start, Heat is set to 5 (before passive cooling applies, so cooling brings it to 3), no body actions fire that turn, and only system cards may be played; the shutdown flag clears at the end of that shutdown turn

### Requirement: Passive cooling reduces Heat each turn
At the start of each turn, before any other effects, Still's Heat SHALL decrease by 2 (passive cooling).

#### Scenario: Passive cooling at turn start
- **WHEN** a new turn begins
- **THEN** Heat is reduced by 2 (minimum 0) before the player's planning phase

#### Scenario: Passive cooling from Overheat shutdown
- **WHEN** a shutdown turn begins (triggered by Overheat)
- **THEN** Heat is first set to 5, then passive cooling applies (5 → 3), and the player may play system cards to cool further before the turn ends

### Requirement: Body actions generate Heat
Each body action that executes during the execution phase SHALL generate +1 Heat.

#### Scenario: Body action Heat generation
- **WHEN** a filled equipment slot's action executes
- **THEN** Heat increases by 1

#### Scenario: Empty slots generate no Heat
- **WHEN** an equipment slot is empty during the execution phase
- **THEN** no Heat is generated for that slot

### Requirement: Modifier cards generate Heat
Each modifier card SHALL have a printed Heat cost that is added to Still's Heat when played.

#### Scenario: Playing a modifier adds its Heat cost
- **WHEN** the player plays a modifier card with a Heat cost of N
- **THEN** Heat increases by N immediately

#### Scenario: Cooling cards reduce Heat
- **WHEN** the player plays a system card with a negative Heat value
- **THEN** Heat decreases by that amount (minimum 0)

### Requirement: Projected Heat display
The combat UI SHALL display a real-time projection of Still's Heat at end of turn, updated as the player assigns modifiers during the planning phase.

#### Scenario: Projection updates on modifier assignment
- **WHEN** the player assigns or removes a modifier card during the planning phase
- **THEN** the projected end-of-turn Heat updates immediately, accounting for: current Heat, passive cooling, body action generation (filled slots), and all assigned modifier costs

#### Scenario: Projection shows threshold warnings
- **WHEN** the projected end-of-turn Heat would cross into Hot (8-9) or Overheat (10)
- **THEN** the display shows a warning indicator with the specific penalty (e.g., "HOT: -3 HP" or "OVERHEAT: shutdown next turn")
