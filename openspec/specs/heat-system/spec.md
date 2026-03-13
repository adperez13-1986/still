## Requirements

### Requirement: Heat is the central combat resource
Combat SHALL track a Heat value (integer, minimum 0, no maximum) that represents the thermal load on Still's body. Heat replaces the energy system as the sole resource constraining combat actions.

#### Scenario: Heat starts at zero
- **WHEN** a combat encounter begins
- **THEN** Still's Heat is set to 0

#### Scenario: Heat has no upper cap
- **WHEN** an effect would increase Heat above any value
- **THEN** Heat increases to the new value with no cap (overheat damage applies per the overheat damage requirement)

#### Scenario: Heat cannot go below zero
- **WHEN** an effect would decrease Heat below 0
- **THEN** Heat is capped at 0

### Requirement: Heat thresholds govern combat bonuses and penalties
The Heat track SHALL have four named thresholds. Thresholds serve as signals for equipment and part conditions, not as passive stat modifiers. There are no universal output bonuses from heat thresholds.

#### Scenario: Cool state (Heat 0-3)
- **WHEN** Still's Heat is between 0 and 3 inclusive
- **THEN** Still is in the Cool zone; equipment and parts with "while Cool" conditions are active

#### Scenario: Warm state (Heat 4-6)
- **WHEN** Still's Heat is between 4 and 6 inclusive
- **THEN** Still is in the Warm zone; equipment and parts with "while Warm" conditions are active

#### Scenario: Hot state (Heat 7-9)
- **WHEN** Still's Heat is between 7 and 9 inclusive
- **THEN** Still is in the Hot zone; equipment and parts with "while Hot" conditions are active; Still takes 3 damage at end of turn; ablative heat protection is active

#### Scenario: Overheat state (Heat 10+)
- **WHEN** Still's Heat is 10 or above
- **THEN** Still is in Overheat; overheat damage applies on any further heat increase; ablative heat protection is active; no shutdown is triggered

### Requirement: No free passive cooling
There SHALL be no automatic passive cooling per turn. All cooling comes from LEGS equipment effects and cooling cards.

#### Scenario: Start of turn with no LEGS cooling
- **WHEN** a new turn begins and Still has no LEGS equipment that cools
- **THEN** Heat remains unchanged from end of previous turn

#### Scenario: LEGS equipment provides cooling
- **WHEN** LEGS equipment fires during execution
- **THEN** Heat is reduced by the amount specified by the LEGS equipment effect

### Requirement: Overheat damage applies on any heat increase while over 9
When Still's heat exceeds 9, any further heat increase SHALL deal instant damage equal to 2 times the number of heat points over 9 (at the new heat value). This applies regardless of the source of the heat increase.

#### Scenario: Heat increases from 9 to 10
- **WHEN** Still's heat is 9 and an effect increases heat by 1
- **THEN** heat becomes 10 and Still takes 2 damage instantly (1 point over 9 x 2)

#### Scenario: Heat increases while already over 9
- **WHEN** Still's heat is 10 and an effect increases heat by 1
- **THEN** heat becomes 11 and Still takes 4 damage instantly (2 points over 9 x 2)

#### Scenario: No shutdown from overheat
- **WHEN** Still's heat exceeds 9
- **THEN** all body actions still fire, all cards can still be played; damage is the only penalty

### Requirement: Ablative heat absorbs damage while Hot
While Still is in the Hot zone (heat 7+), incoming enemy damage SHALL be partially absorbed by reducing Heat at a 1:2 ratio (1 heat point absorbed per 2 damage). Heat can drain down to the Warm floor (heat 4) through ablation. Block is applied before ablative heat.

#### Scenario: Full absorption at high heat
- **WHEN** Still has heat 9 and takes 8 damage after block
- **THEN** 4 heat is absorbed (8 / 2 = 4), heat drops from 9 to 5, 0 HP damage taken

#### Scenario: Partial absorption draining to Warm floor
- **WHEN** Still has heat 9 and takes 18 damage after block
- **THEN** 5 heat is absorbed (9 down to 4 = 5 heat x 2 = 10 damage absorbed), 8 HP damage taken, heat is 4

#### Scenario: Not active below Hot
- **WHEN** Still has heat 5 (Warm) and takes damage
- **THEN** all damage applies to HP after block, heat unchanged

#### Scenario: Ablative heat is systemic
- **WHEN** Still enters Hot zone through any means
- **THEN** ablative heat protection is immediately active with no part or equipment required

### Requirement: Heat is generated only during the planning phase
All heat generation from cards SHALL occur during the planning phase when cards are played. Equipment slots do not generate +1 heat during execution.

#### Scenario: Playing a modifier adds its heat cost
- **WHEN** the player plays a modifier card with a heat cost of N
- **THEN** Heat increases by N immediately during planning

#### Scenario: Cooling cards reduce Heat
- **WHEN** the player plays a system card with a negative heat value
- **THEN** Heat decreases by that amount (minimum 0)

#### Scenario: Slots do not generate heat during execution
- **WHEN** the execution phase begins and body actions fire
- **THEN** no heat is generated from slot firing itself

### Requirement: Projected Heat display
The combat UI SHALL display a real-time projection of Still's Heat at end of turn, updated as the player assigns modifiers during the planning phase.

#### Scenario: Projection updates on modifier assignment
- **WHEN** the player assigns or removes a modifier card during the planning phase
- **THEN** the projected end-of-turn Heat updates immediately, accounting for: current Heat, LEGS equipment cooling, and all assigned modifier costs

#### Scenario: Projection shows threshold warnings
- **WHEN** the projected end-of-turn Heat would be in Hot (7-9) or Overheat (10+)
- **THEN** the display shows a warning indicator — "HOT: -3 HP" for Hot, or estimated overheat damage total for Overheat
