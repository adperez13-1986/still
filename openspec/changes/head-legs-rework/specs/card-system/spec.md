## MODIFIED Requirements

### Requirement: Starting modifier deck

Every run begins with 12 modifier cards including weak filler.

#### Scenario: Starting deck composition
- **WHEN** a new run begins
- **THEN** the deck contains exactly:
  - 1x **Boost** (Amplify, 2E, +50%)
  - 1x **Emergency Strike** (Override, 2E, 8 damage AoE)
  - 1x **Emergency Shield** (Override, 2E, 12 Block)
  - 1x **Diagnostics** (System, 2E, draw 2, homeSlot Head)
  - 2x **Vent** (System, 2E, draw 2, homeSlot Legs)
  - 3x **Spark** (Override, 2E, deal 4 damage single) — weak filler
  - 3x **Patch Job** (Override, 2E, gain 6 Block) — weak filler

### Requirement: Draw count

Base draw is 5 cards per turn.

#### Scenario: Drawing at turn start
- **WHEN** a new turn begins
- **THEN** the player draws 5 cards plus any Inspired bonus
