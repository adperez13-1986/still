## MODIFIED Requirements

### Requirement: S2 standard enemies use DisableSlot and Absorb
S2 standard enemies SHALL attack on their first turn. S2 enemies SHALL use DisableSlot and debuff intents to interact with Still's body slots, creating combat puzzles beyond simple attack/block. Absorb intents are removed from standard enemies.

#### Scenario: S2 standard enemy opens with attack
- **WHEN** a S2 standard enemy takes its first turn
- **THEN** its first intent in the pattern SHALL be Attack or AttackDebuff

#### Scenario: DisableSlot enemy attacks then disrupts
- **WHEN** a S2 enemy with DisableSlot capability enters combat
- **THEN** it SHALL attack on turn 1 and use DisableSlot on turn 2 or later, forcing the player to react to damage before dealing with slot disruption

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
Sector 2 SHALL have 3 elite enemies that combine DisableSlot, debuffs, and offensive pressure. All elites SHALL attack on turn 1.

#### Scenario: S2 elite attacks immediately
- **WHEN** a S2 elite enemy enters combat
- **THEN** its first intent SHALL be Attack or AttackDebuff, dealing meaningful damage before using utility intents

#### Scenario: S2 elite encounter
- **WHEN** the player enters an elite combat room in S2
- **THEN** a single S2 elite enemy spawns with 100-120 HP and a 4-5 step pattern starting with an attack

### Requirement: S2 has a unique named boss
Sector 2 SHALL end with a boss (The Thermal Arbiter) that tests slot disruption response, damage output, and build resilience through an escalating pressure pattern.

#### Scenario: S2 boss attacks on turn 1
- **WHEN** the S2 boss encounter begins
- **THEN** The Thermal Arbiter's first intent SHALL be an Attack, establishing immediate pressure

#### Scenario: S2 boss escalation arc
- **WHEN** The Thermal Arbiter cycles through its pattern
- **THEN** the pattern SHALL follow a pressure→disrupt→escalate→peak structure, with attack values and buff effects increasing in later steps

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
