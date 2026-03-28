## MODIFIED Requirements

### Requirement: Drop resolution uses sector-weighted card selection

The drop system SHALL use sector-weighted random selection for card rewards instead of hard-gated sector pools.

#### Scenario: Card reward roll
- **WHEN** card rewards are resolved for a combat encounter
- **THEN** each of the 3 card picks first rolls which sector pool to draw from (using sector + encounter weights), then selects a random card from that pool

#### Scenario: No duplicate cards in one offer
- **WHEN** 3 cards are being selected for a reward offer
- **THEN** the same card SHALL NOT appear twice in the same offer. If a duplicate is rolled, re-roll.

#### Scenario: Shop uses weighted pool
- **WHEN** the shop assembles its card selection
- **THEN** it uses the same sector-weighted system as combat rewards
