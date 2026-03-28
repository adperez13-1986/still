## MODIFIED Requirements

### Requirement: Card acquisition from enemies

After clearing a combat encounter, the player is offered cards to add to their deck.

#### Scenario: Post-combat card reward
- **WHEN** a combat room is cleared
- **THEN** the player is shown 3 modifier cards selected by sector-weighted roll from the unified pool. No duplicates in the same offer.

#### Scenario: Sector weighting for normal combat
- **WHEN** card rewards are rolled in Sector 1
- **THEN** each card has a 75% chance of being drawn from the S1 pool and 25% from the S2 pool
- **WHEN** card rewards are rolled in Sector 2
- **THEN** each card has a 25% chance of being drawn from the S1 pool and 75% from the S2 pool

#### Scenario: Elite encounters boost S2 card rate
- **WHEN** card rewards are rolled after an elite encounter in S1
- **THEN** S2 probability increases to 40%
- **WHEN** card rewards are rolled after an elite encounter in S2
- **THEN** S2 probability increases to 85%

#### Scenario: Boss encounters boost S2 card rate further
- **WHEN** card rewards are rolled after a boss encounter in S1
- **THEN** S2 probability increases to 50%
- **WHEN** card rewards are rolled after a boss encounter in S2
- **THEN** S2 probability increases to 90%

#### Scenario: Skipping a card reward
- **WHEN** the player skips a card reward
- **THEN** no card is added and a small amount of shards is awarded instead
