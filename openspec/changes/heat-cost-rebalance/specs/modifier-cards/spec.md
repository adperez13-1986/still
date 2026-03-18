## MODIFIED Requirements

### Requirement: Starting modifier deck
Every run SHALL begin with a standard set of 8 basic modifier cards with heat costs balanced around a 2-heat baseline.

#### Scenario: Starting deck composition
- **WHEN** a new run begins
- **THEN** Still's deck contains exactly: 2x Boost (Amplify, +2 Heat, +50% output), 1x Echo Protocol (Repeat, +2 Heat, slot fires twice), 1x Emergency Strike (Override, +2 Heat, 5 AOE damage on ARMS), 1x Emergency Shield (Override, +2 Heat, 12 Block on TORSO), 2x Coolant Flush (Cooling, −4 Heat, LEGS), 1x Diagnostics (Draw 2, +2 Heat, HEAD)

### Requirement: Heat cost tiers
Cards SHALL follow a tiered heat cost structure where 2 heat is the standard baseline, 1 heat represents efficient/upgraded play, and 3+ heat represents powerful but committed plays.

#### Scenario: Standard card costs 2 heat
- **WHEN** a basic or starter card is played
- **THEN** it costs 2 heat (making 2 plays per turn = heat 4, Warm threshold)

#### Scenario: Efficient card costs 1 heat
- **WHEN** an upgraded card or a premium find is played
- **THEN** it costs 1 heat (rewarding upgrades and good deck building)

#### Scenario: Premium card costs 3+ heat
- **WHEN** a powerful card requiring commitment is played
- **THEN** it costs 3 or more heat (pushing toward Hot or Overheat)

### Requirement: Cooling cards scale proportionally
Cooling cards SHALL have their negative heat costs increased proportionally to match the higher baseline costs.

#### Scenario: Coolant Flush cooling increased
- **WHEN** Coolant Flush is played
- **THEN** it reduces heat by 4 (base) or 5 (upgraded), enabling one additional standard-cost card play
