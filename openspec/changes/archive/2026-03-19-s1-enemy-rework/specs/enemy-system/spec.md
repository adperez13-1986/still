## NEW Requirements

### Requirement: S1 includes a slot-disruption enemy
Sector 1 SHALL include at least one standard enemy that uses DisableSlot to teach players about slot disruption before S2.

#### Scenario: Signal Jammer encounter
- **WHEN** the player encounters a Signal Jammer
- **THEN** it disables ARMS on turn 1, then attacks on subsequent turns
- **AND** the player must survive one turn without ARMS damage output

### Requirement: S1 encounters include synergy compositions
Sector 1 encounter compositions SHALL include pairings where enemy pattern timing creates combinatorial pressure (e.g., debuffer + multi-hitter, disabler + scaler).

#### Scenario: Signal Jammer paired with Glitch Node
- **WHEN** the player faces Signal Jammer + Glitch Node
- **THEN** ARMS is disabled turn 1 while Glitch Node begins scaling Strength
- **AND** the player must decide between surviving the disable turn and managing the scaling threat

#### Scenario: Iron Crawler paired with Fracture Mites
- **WHEN** the player faces Iron Crawler + 2 Fracture Mites
- **THEN** Vulnerable from Iron Crawler amplifies multi-hit damage from Mites
- **AND** the player must choose target priority: remove Vulnerable source or reduce hit count

## MODIFIED Requirements

### Requirement: S1 enemies attack from turn 1
S1 standard enemies SHALL have an attack intent on their first turn. Buff-only or block-only openers are moved to turn 2+ so every encounter feels threatening immediately.

#### Scenario: Sentinel Shard attacks first
- **WHEN** the player encounters Sentinel Shard
- **THEN** it attacks on turn 1 (not blocks), blocks on turn 2, then escalates

#### Scenario: Glitch Node attacks first
- **WHEN** the player encounters Glitch Node
- **THEN** it attacks on turn 1, buffs Strength on turn 2, then attacks with scaling
