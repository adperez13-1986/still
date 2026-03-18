## MODIFIED Requirements

### Requirement: Sector 1 enemies attack frequently
S1 standard enemies SHALL attack on at least 2 out of every 3 turns in their intent pattern. Buff-only and block-only turns are minimized to ensure TORSO block is needed most turns.

#### Scenario: Rust Guard attacks more
- **WHEN** Rust Guard's intent pattern cycles
- **THEN** it follows Attack, Attack, Block (was Block, Attack)

#### Scenario: Glitch Node attacks sooner
- **WHEN** Glitch Node's intent pattern cycles
- **THEN** it follows Buff, Attack, Attack (was Buff, Buff, Attack)

#### Scenario: Sentinel Shard attacks more
- **WHEN** Sentinel Shard's intent pattern cycles
- **THEN** it follows Block, Attack, Attack (was Block, Block, Attack)

### Requirement: Damage scaling reduced for aggressive enemies
Enemy damage scaling SHALL be reduced to 5% per combat cleared (from 8%) to compensate for higher base attack frequency.

#### Scenario: Damage scaling at combat 5
- **WHEN** a regular enemy attacks at combatsCleared = 5
- **THEN** damage is multiplied by 1.25 (was 1.40 at 8%)
