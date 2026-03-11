## ADDED Requirements

### Requirement: Overheat damage applies on any heat increase while over 9
When Still's heat exceeds 9, any further heat increase SHALL deal instant damage equal to 3 times the number of heat points over 9 (at the new heat value). This applies regardless of the source of the heat increase — card plays, body action generation, equipment effects, or any other source.

#### Scenario: Heat increases from 9 to 10
- **WHEN** Still's heat is 9 and an effect increases heat by 1
- **THEN** heat becomes 10 and Still takes 3 damage instantly (1 point over 9 × 3)

#### Scenario: Heat increases from 8 to 10
- **WHEN** Still's heat is 8 and an effect increases heat by 2
- **THEN** heat becomes 10 and Still takes 3 damage instantly (1 point over 9 × 3)

#### Scenario: Heat increases from 10 to 11
- **WHEN** Still's heat is already 10 and an effect increases heat by 1
- **THEN** heat becomes 11 and Still takes 6 damage instantly (2 points over 9 × 3)

#### Scenario: Heat increases from 10 to 12
- **WHEN** Still's heat is already 10 and an effect increases heat by 2
- **THEN** heat becomes 12 and Still takes 9 damage instantly (3 points over 9 × 3)

#### Scenario: Overheat damage during planning phase
- **WHEN** Still plays a modifier card with heat cost 2 while at heat 9
- **THEN** heat becomes 11 and Still takes 6 damage instantly, before any other planning actions

#### Scenario: Overheat damage during execution phase
- **WHEN** a body action fires and generates +1 heat while Still is at heat 10
- **THEN** heat becomes 11 and Still takes 6 damage instantly, before the next slot fires

#### Scenario: LEGS cooling reduces future overheat ticks
- **WHEN** LEGS fires and cools heat from 12 to 9
- **THEN** no overheat damage is taken from the cooling itself, and subsequent heat increases start from 9

### Requirement: Heat has no maximum cap
Heat SHALL have no upper limit. Heat can exceed 10 during a turn. The minimum remains 0.

#### Scenario: Heat exceeds 10
- **WHEN** multiple heat sources push heat to 13 during execution
- **THEN** heat is 13 (not capped at 10), and overheat damage was applied on each increase above 9

#### Scenario: Heat has no cap during planning
- **WHEN** a player plays cards that would push heat to 15
- **THEN** heat becomes 15, with overheat damage applied on each increase while over 9

### Requirement: No shutdown from overheat
Reaching heat 10 or above SHALL NOT trigger a shutdown. The player always takes their full turn — all body actions fire, all cards can be played. Overheat damage is the sole penalty for exceeding heat 9.

#### Scenario: All slots fire at high heat
- **WHEN** execution begins and heat is 11
- **THEN** all four body slots fire in order (HEAD, TORSO, ARMS, LEGS), each generating +1 heat and triggering overheat damage

#### Scenario: Cards can still be played at high heat
- **WHEN** planning phase begins and heat is 10
- **THEN** the player may play any cards they could normally play, taking overheat damage for each heat increase
