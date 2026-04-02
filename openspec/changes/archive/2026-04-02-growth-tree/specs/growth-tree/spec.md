## ADDED Requirements

### Requirement: Growth reward dependency tree

Growth rewards SHALL be organized in a dependency tree with 3 tiers. A reward is only available if its prerequisite has been acquired.

#### Scenario: Tier 1 rewards available from start
- **WHEN** the reward screen needs a growth option and no growth rewards have been acquired
- **THEN** only tier 1 rewards are available: Learn Repair (2), Learn Brace (2), Strike Mastery (3), Shield Mastery (3), Barrage Mastery (3)

#### Scenario: Tier 2 unlocked by tier 1
- **WHEN** the player has acquired a tier 1 reward
- **THEN** its tier 2 dependents become available in the pool (e.g., acquiring Learn Repair unlocks Repair+ and Drain Strike)

#### Scenario: Tier 3 unlocked by tier 2
- **WHEN** the player has acquired a tier 2 reward
- **THEN** its tier 3 dependent becomes available (e.g., acquiring Repair+ unlocks Desperate Repair)

#### Scenario: Prerequisites not met
- **WHEN** a reward's prerequisite has not been acquired
- **THEN** that reward SHALL NOT appear in the available pool

### Requirement: Growth reward definitions

Each growth reward SHALL have: id, label, description, branch, tier (1-3), strainCost, requires (prerequisite id or null), and an effect type.

#### Scenario: Full reward pool
- **WHEN** a run begins
- **THEN** the full tree contains 17 rewards: 5 tier 1, 6 tier 2, 6 tier 3

### Requirement: Growth state tracks all rewards

The player's growth state SHALL track all acquired rewards as an ordered list of reward IDs.

#### Scenario: Growth state structure
- **WHEN** a run begins
- **THEN** growth state is initialized with an empty rewards array

#### Scenario: Reward acquired
- **WHEN** the player accepts a growth reward
- **THEN** its ID is appended to the rewards array

#### Scenario: Deriving abilities and masteries
- **WHEN** combat initializes
- **THEN** available abilities and push costs are derived from the rewards array (e.g., if 'repair' is in rewards, Repair ability is available; if 'mastery-A' is in rewards, Strike push cost is 0)
