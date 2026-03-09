## ADDED Requirements

### Requirement: Enemies can interact with Still's Heat
Some enemies SHALL have intents or abilities that react to Still's Heat state. Enemies SHALL NOT directly modify Still's Heat value — heat is the player's resource to manage. Enemies may read heat and adjust their behavior accordingly.

#### Scenario: Enemy penalizes high Heat
- **WHEN** an enemy has a conditional intent that activates based on Still's Heat threshold
- **THEN** the enemy deals bonus damage or applies additional effects when Still is Warm or hotter

### Requirement: Enemies can disable equipment slots
Some enemies SHALL have abilities that temporarily disable one of Still's equipment slots, preventing its body action from firing.

#### Scenario: Slot disabled by enemy
- **WHEN** an enemy executes a slot-disabling intent (e.g., "Jam Arms")
- **THEN** the targeted slot's body action does not fire during the next execution phase, and no modifier can be assigned to it

#### Scenario: Disabled slot recovers
- **WHEN** a slot has been disabled
- **THEN** it recovers automatically at the start of the following turn (one turn of downtime)

### Requirement: Enemy intent types expanded for body-driven combat
The enemy intent system SHALL include new intent types that interact with the body-action systems. The drop resolution function SHALL accept an optional pity parameter to modify equipment drop weights. The HeatAttack intent type is removed — enemies SHALL NOT add Heat to Still.

#### Scenario: DisableSlot intent
- **WHEN** an enemy has a DisableSlot intent
- **THEN** it targets a specific slot (HEAD, TORSO, ARMS, or LEGS) and disables it for one turn

#### Scenario: Absorb intent
- **WHEN** an enemy has an Absorb intent
- **THEN** it gains Block equal to a portion of Still's current Heat (rewarding the player for cooling before the enemy acts)

#### Scenario: Drop resolution accepts pity parameter
- **WHEN** `resolveDrops` is called with a pity value
- **THEN** the pity value SHALL be added to the weight of all equipment entries in the drop pool before rolling

## MODIFIED Requirements

### Requirement: Boss enemies are named and memorable
Each sector SHALL end with a unique named boss. Bosses have distinct visual identities, multi-phase patterns, and special reward drops.

#### Scenario: Boss encounter begins
- **WHEN** Still enters a boss room
- **THEN** the boss is introduced with a name and brief flavor text before combat begins

#### Scenario: Boss defeated
- **WHEN** a boss is defeated
- **THEN** the player receives a guaranteed high-quality reward (a rare behavioral part, rare modifier card, or equipment item) and the sector is marked complete

### Requirement: Enemy types scale with sectors
Enemy types and difficulty SHALL scale across sectors, reflecting both the narrative arc and interaction with Still's body and Heat systems. Sector 1 enemies are basic. Sector 2 enemies interact with Heat and slots. Sector 3 enemies challenge the full body-heat-modifier system.

#### Scenario: Sector 1 enemy simplicity
- **WHEN** Still encounters a Sector 1 enemy
- **THEN** the enemy has simple 1-2 step patterns, moderate health, clear intent, and does not interact with Heat or slots directly

#### Scenario: Sector 2 enemy Heat interaction
- **WHEN** Still encounters a Sector 2 enemy
- **THEN** the enemy may have slot-disabling abilities, conditional behaviors based on Still's Heat state, or Absorb intents

#### Scenario: Sector 3 enemy complexity
- **WHEN** Still encounters a Sector 3 enemy
- **THEN** the enemy has multi-step patterns, high health or defense, potentially multiple intents per round, and sophisticated interactions with Still's body configuration and Heat state

### Requirement: Elite encounters are gated behind early combats
Elite enemies SHALL NOT appear in the first 3 combat encounters of a run, giving the player time to establish their build before facing stronger opponents.

#### Scenario: Early combats are normal encounters
- **WHEN** fewer than 3 combat rooms have been cleared in the current run
- **THEN** all combat encounters draw from the normal encounter pool only (no elite chance)
