## MODIFIED Requirements

### Requirement: Enemy types scale with sectors
Enemy types and difficulty SHALL scale across sectors, reflecting both the narrative arc and interaction with Still's body and Heat systems. Sector 1 enemies are mostly basic, with limited heat interaction via the Scan/HeatReactive mechanic. Sector 2 enemies interact with Heat and slots more aggressively. Sector 3 enemies challenge the full body-heat-modifier system.

#### Scenario: Sector 1 enemy simplicity with heat awareness
- **WHEN** Still encounters a Sector 1 enemy
- **THEN** the enemy has simple 1-2 step patterns, moderate health, clear intent. Some enemies (e.g., Thermal Scanner) may have one heat-reactive turn per cycle, telegraphed by a Scan turn.

#### Scenario: Sector 2 enemy Heat interaction
- **WHEN** Still encounters a Sector 2 enemy
- **THEN** the enemy may have slot-disabling abilities, conditional behaviors based on Still's Heat state, or Absorb intents

#### Scenario: Sector 3 enemy complexity
- **WHEN** Still encounters a Sector 3 enemy
- **THEN** the enemy has multi-step patterns, high health or defense, potentially multiple intents per round, and sophisticated interactions with Still's body configuration and Heat state

### Requirement: Thermal Scanner is a Sector 1 standard enemy
The Thermal Scanner SHALL be a standard S1 enemy that teaches heat-reactive behavior through a simple Scan → HeatReactive cycle.

#### Scenario: Thermal Scanner encounter
- **WHEN** Still encounters a Thermal Scanner in Sector 1
- **THEN** the enemy has 35 HP and cycles: Scan (telegraph), HeatReactive (Cool: 12 Attack / Warm: 7 Attack / Hot: +2 Strength buff), Attack 8, Block 6

#### Scenario: Thermal Scanner in encounter pool
- **WHEN** S1 encounters are generated
- **THEN** the Thermal Scanner appears as a solo encounter and paired with Fracture Mite
