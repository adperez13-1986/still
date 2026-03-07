## ADDED Requirements

### Requirement: Modifier cards can have heat-conditional bonus effects
Some modifier cards SHALL have bonus effects that activate when Still is at a specific heat threshold. Unlike `heatCondition` (which gates playability), heat bonuses enhance the card's effect while remaining playable at any heat level.

#### Scenario: Card played at matching threshold
- **WHEN** a modifier card with a heat bonus is played while Still is at or above the bonus threshold
- **THEN** the enhanced version of the effect activates (e.g., higher damage, extra draw)

#### Scenario: Card played outside matching threshold
- **WHEN** a modifier card with a heat bonus is played while Still is below the bonus threshold
- **THEN** the base version of the effect activates (card is still playable)

### Requirement: Act 1 card pool includes archetype-seeding cards
The Act 1 modifier card pool SHALL include cards that reward specific heat zones, seeding the Cool Runner, Pyromaniac, and Oscillator archetypes.

#### Scenario: Cool Runner cards in Act 1 pool
- **WHEN** the Act 1 card pool is assembled
- **THEN** it SHALL include Precision Strike (0 heat, deal 8 damage, 12 while Cool) and Cold Efficiency (0 heat, draw 2, draw 3 while Cool)

#### Scenario: Pyromaniac cards in Act 1 pool
- **WHEN** the Act 1 card pool is assembled
- **THEN** it SHALL include Fuel the Fire (+1 heat, deal 6 damage, gain 4 Block while Hot) and Reckless Charge (+3 heat, deal 18 damage, Exhaust)

#### Scenario: Oscillator cards in Act 1 pool
- **WHEN** the Act 1 card pool is assembled
- **THEN** it SHALL include Thermal Flux (-2 heat, deal damage equal to total heat change this turn) and Overclock (+2 heat, gain 1 Strength, gain 2 instead if a threshold was crossed this turn)
