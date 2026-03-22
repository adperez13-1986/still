## ADDED Requirements

### Requirement: S3 has no new card, equipment, or part pools
Sector 3 SHALL NOT introduce new modifier cards, equipment, or behavioral parts. Combat rewards in S3 SHALL draw from S2 pools.

#### Scenario: S3 combat rewards use S2 pools
- **WHEN** the player defeats an S3 combat encounter
- **THEN** card rewards are drawn from `SECTOR2_CARD_POOL`, equipment from S2 equipment, parts from `SECTOR2_PART_POOL`

#### Scenario: S3 shop uses S2 pools
- **WHEN** the player enters a shop in Sector 3
- **THEN** offerings are drawn from S2 card, equipment, and part pools

### Requirement: S3 has 6 identity-defining events
S3 events SHALL present choices that shape the player's endgame identity rather than offering simple resource trades.

#### Scenario: Equipment sacrifice event
- **WHEN** the player encounters an equipment sacrifice event
- **THEN** they may sacrifice one equipped item to permanently add its base value to another slot's equipment

#### Scenario: Radical deck thinning event
- **WHEN** the player encounters a deck thinning event
- **THEN** they may remove up to 3 cards from their deck at once

#### Scenario: Part swap event
- **WHEN** the player encounters a part swap event
- **THEN** they may trade their oldest part for a random part they haven't seen this run

#### Scenario: Power-for-health event
- **WHEN** the player encounters a power-for-health event
- **THEN** they may take 20 damage to gain +2 permanent Strength for the rest of the run

#### Scenario: Full reset event
- **WHEN** the player encounters a full reset event
- **THEN** they may lose all shards to fully restore health

#### Scenario: Card transmutation event
- **WHEN** the player encounters a card transmutation event
- **THEN** they may exhaust a card permanently from their deck in exchange for upgrading a random unupgraded card

### Requirement: Sector transition from S2 to S3
Advancing from Sector 2 to Sector 3 SHALL follow the same pattern as S1 to S2.

#### Scenario: S2 boss defeated triggers transition
- **WHEN** the player defeats the S2 boss (The Thermal Arbiter)
- **THEN** the game transitions to Sector 3, generates a new maze, and resets `combatsCleared` to 0

#### Scenario: S3 maze generation
- **WHEN** Sector 3 begins
- **THEN** a 7×7 grid maze is generated with 8-10 combat rooms, rest rooms, shop, events, and a boss room

### Requirement: S3 run completion
Defeating the S3 boss completes the run with a victory.

#### Scenario: S3 boss defeated
- **WHEN** the player defeats The Reflection (S3 boss)
- **THEN** the run is recorded as a victory with `sectorReached: 3` and the victory end screen is shown
