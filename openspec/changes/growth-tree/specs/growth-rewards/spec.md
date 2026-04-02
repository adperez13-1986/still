## MODIFIED Requirements

### Requirement: Growth reward pool

The game SHALL maintain a branching dependency tree of growth rewards. Each reward can only be acquired once. A reward is only available if its prerequisite has been acquired AND it hasn't been taken yet AND the player can afford its strain cost.

#### Scenario: Growth reward offered
- **WHEN** the reward screen needs a growth option
- **THEN** one reward is drawn from the pool of rewards whose prerequisites are met and not yet acquired

#### Scenario: Acquired reward removed from pool
- **WHEN** the player accepts a growth reward
- **THEN** that reward is removed from the available pool and its dependents become available

### Requirement: Growth reward definitions

Each growth reward SHALL have: id, label, description, strainCost, tier, requires, and type.

#### Scenario: Full growth reward pool
- **WHEN** a run begins
- **THEN** the tree contains 17 rewards across 3 tiers: 5 at tier 1 (cost 2-3), 6 at tier 2 (cost 2-3), 6 at tier 3 (cost 3)

### Requirement: New ability rewards

Growth rewards SHALL include abilities that expand the player's combat toolkit.

#### Scenario: Repair ability reward
- **WHEN** the player acquires the repair growth reward (cost: 2 strain)
- **THEN** the Repair ability becomes available in combat

#### Scenario: Brace ability reward
- **WHEN** the player acquires the brace growth reward (cost: 2 strain)
- **THEN** the Brace ability becomes available in combat

### Requirement: Push cost reduction rewards (Masteries)

Growth rewards SHALL include masteries that permanently reduce the push cost of a slot to 0.

#### Scenario: Mastery acquired
- **WHEN** the player acquires a mastery reward (Strike, Shield, or Barrage)
- **THEN** that slot's push cost becomes 0 for the rest of the run
