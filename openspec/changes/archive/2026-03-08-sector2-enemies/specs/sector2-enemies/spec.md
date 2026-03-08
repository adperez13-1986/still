## Requirements

### Requirement: S2 standard enemies use DisableSlot and Absorb
Sector 2 standard enemies SHALL use DisableSlot and Absorb intent types to interact with Still's body slots and Heat state, creating combat puzzles beyond simple attack/block.

#### Scenario: DisableSlot enemy disables a body slot
- **WHEN** a S2 enemy with a DisableSlot intent executes
- **THEN** the targeted slot does not fire next execution phase

#### Scenario: Absorb enemy gains block from Still's Heat
- **WHEN** a S2 enemy with an Absorb intent executes and Still's Heat is above 0
- **THEN** the enemy gains Block proportional to Still's current Heat

#### Scenario: S2 enemies have higher HP than S1
- **WHEN** the player encounters S2 standard enemies
- **THEN** HP ranges from 22 (swarm) to 75 (tank), compared to S1's 16-60

### Requirement: S2 enemies appear in predefined encounter compositions
S2 combat rooms SHALL select from predefined encounter groups rather than random individual enemies.

#### Scenario: S2 combat room spawns an encounter
- **WHEN** the player enters an uncleared S2 combat room
- **THEN** a predefined encounter group is selected (e.g., Wire Jammer + Feedback Loop)

#### Scenario: Encounters create compound puzzles
- **WHEN** a multi-enemy encounter spawns
- **THEN** the enemies complement each other (e.g., one disables slots while another deals heavy damage)

### Requirement: S2 has 3 elite enemies
Sector 2 SHALL have 3 elite enemies that combine DisableSlot, Absorb, and offensive pressure.

#### Scenario: S2 elite encounter
- **WHEN** the player enters an elite combat room in S2
- **THEN** a single S2 elite enemy spawns with 100-120 HP and a 4-5 step pattern

### Requirement: S2 has a unique named boss
Sector 2 SHALL end with a boss (The Thermal Arbiter) that tests Heat management, slot disruption response, and damage output.

#### Scenario: S2 boss encounter
- **WHEN** the player enters the S2 boss room
- **THEN** The Thermal Arbiter spawns with 200 HP and an 8-step pattern using Absorb, DisableSlot, Buff, and scaling attacks

#### Scenario: S2 boss has flavor text
- **WHEN** the S2 boss encounter begins
- **THEN** flavor text is displayed: "It measures everything. It forgives nothing."

### Requirement: S2 enemies drop S2-tier rewards
S2 enemy drop pools SHALL contain higher shard amounts and references to S2-pool items.

#### Scenario: S2 standard enemy drops
- **WHEN** a S2 standard enemy is defeated
- **THEN** shard drops range from 15-25 (vs S1's 5-15)

#### Scenario: S2 elite drops
- **WHEN** a S2 elite is defeated
- **THEN** drops include 40-60 shards and higher-weight part/equipment entries
