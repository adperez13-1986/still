## Requirements

### Requirement: S2 card pool offers answers to S2 enemy mechanics
The S2 modifier card pool SHALL include cards that help the player handle slot disabling, heat punishment, and longer fights introduced by S2 enemies.

#### Scenario: Cards that work with disabled slots
- **WHEN** the player acquires S2 cards
- **THEN** some cards provide benefits when a slot is disabled (turning enemy disruption into opportunity)

#### Scenario: Cards that deepen heat archetypes
- **WHEN** the player builds toward a heat strategy (Cool Runner, Pyromaniac, Oscillator)
- **THEN** S2 cards offer stronger payoffs for that strategy than S1 cards

#### Scenario: S2 cards have higher power and cost
- **WHEN** comparing S2 cards to S1 equivalents
- **THEN** S2 cards have stronger effects but higher heat costs or Exhaust keywords

### Requirement: S2 equipment is stronger than S1
S2 equipment SHALL have higher base values than S1 equipment, with some pieces featuring heat-conditional bonuses or drawback tradeoffs.

#### Scenario: S2 equipment base values
- **WHEN** comparing S2 equipment to S1 equivalents in the same slot
- **THEN** S2 equipment has noticeably higher base output (e.g., Arms: 10 damage vs S1's 6)

#### Scenario: Rare S2 equipment has conditional effects
- **WHEN** the player acquires rare S2 equipment
- **THEN** some pieces have heat-conditional bonuses (e.g., "While Hot: gain 7 Block instead of 3")

### Requirement: S2 behavioral parts respond to S2 mechanics
S2 behavioral parts SHALL include triggers that interact with slot disabling and heat thresholds.

#### Scenario: Slot-disruption response parts
- **WHEN** an enemy disables one of the player's slots
- **THEN** parts with disruption-response triggers activate (e.g., draw extra cards, other slots deal bonus damage)

#### Scenario: Heat-threshold parts
- **WHEN** the player reaches specific heat thresholds
- **THEN** S2 parts provide defensive or offensive bonuses

### Requirement: Card rewards are sector-aware
Combat reward card choices SHALL pull from the current sector's card pool.

#### Scenario: S1 combat offers S1 cards
- **WHEN** the player defeats enemies in a Sector 1 combat room
- **THEN** card reward choices are drawn from `SECTOR1_CARD_POOL`

#### Scenario: S2 combat offers S2 cards
- **WHEN** the player defeats enemies in a Sector 2 combat room
- **THEN** card reward choices are drawn from `SECTOR2_CARD_POOL`

### Requirement: Shop offerings are sector-aware
The shop SHALL offer items from the current sector's pools.

#### Scenario: S2 shop
- **WHEN** the player enters a shop in Sector 2
- **THEN** card, part, and equipment offerings are drawn from S2 pools
