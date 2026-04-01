## ADDED Requirements

### Requirement: Growth reward pool

The game SHALL maintain a pool of growth rewards available during a run. Each growth reward can only be acquired once. The pool is drawn from in order to populate the growth option on the reward screen.

#### Scenario: Growth reward offered
- **WHEN** the reward screen needs a growth option
- **THEN** one reward is drawn from the pool of rewards not yet acquired by the player

#### Scenario: Acquired reward removed from pool
- **WHEN** the player accepts a growth reward
- **THEN** that reward is removed from the pool and cannot be offered again

### Requirement: New ability rewards

Growth rewards SHALL include abilities that expand the player's combat toolkit. These are not available at the start of the run — they must be earned.

#### Scenario: Repair ability reward
- **WHEN** the player acquires the Repair growth reward (cost: 2 strain)
- **THEN** the Repair ability (heal 4 HP, 1 strain per use) becomes available in combat

#### Scenario: Brace ability reward
- **WHEN** the player acquires the Brace growth reward (cost: 2 strain)
- **THEN** the Brace ability (reduce incoming damage by 3 per hit, 1 strain per use) becomes available in combat

#### Scenario: Ability not available until acquired
- **WHEN** combat begins and the player has not acquired a given ability
- **THEN** that ability does NOT appear in the combat UI

### Requirement: Push cost reduction rewards (Masteries)

Growth rewards SHALL include masteries that permanently reduce the push cost of a slot to 0.

#### Scenario: Strike Mastery reward
- **WHEN** the player acquires Strike Mastery (cost: 3 strain)
- **THEN** Strike's push cost becomes 0 for the rest of the run

#### Scenario: Shield Mastery reward
- **WHEN** the player acquires Shield Mastery (cost: 3 strain)
- **THEN** Shield's push cost becomes 0 for the rest of the run

#### Scenario: Barrage Mastery reward
- **WHEN** the player acquires Barrage Mastery (cost: 3 strain)
- **THEN** Barrage's push cost becomes 0 for the rest of the run

#### Scenario: Mastered slot in combat
- **WHEN** a mastered slot is pushed during planning
- **THEN** it fires at pushed values with 0 strain cost

### Requirement: Growth reward definitions

Each growth reward SHALL have: an id, a label, a description, a strain cost, and a type (ability or mastery).

#### Scenario: Full growth reward pool
- **WHEN** a run begins
- **THEN** the available growth pool contains: Repair (2 strain), Brace (2 strain), Strike Mastery (3 strain), Shield Mastery (3 strain), Barrage Mastery (3 strain)
