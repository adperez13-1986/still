## MODIFIED Requirements

### Requirement: Combat rewards always include a card choice
Every combat victory SHALL award shards plus a 3-card choice from the sector pool. Part and equipment drops are bonus rewards on top, not replacements.

#### Scenario: Normal combat reward
- **WHEN** a combat ends in victory
- **THEN** the player receives shards (from the enemy's shard entry or a fallback of 5) and is presented with a choice of 3 cards from the current sector's card pool

#### Scenario: Bonus part/equipment drop
- **WHEN** a combat ends and the enemy has part or equipment entries in its drop pool
- **THEN** one bonus drop is rolled from those entries (with equipment pity applied) and added alongside the guaranteed shards and card choice

#### Scenario: No bonus entries
- **WHEN** a combat ends and the enemy has no part or equipment entries in its drop pool
- **THEN** only shards and the card choice are awarded
