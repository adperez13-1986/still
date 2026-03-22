## ADDED Requirements

### Requirement: S3 regular enemies use mirror, adapt, pressure, and inversion mechanics
S3 enemies SHALL challenge the player's specific build rather than presenting generic threats. Each enemy type falls into one of four categories: mirrors (reflect player behavior), adapters (punish repetition), pressure (remove safe turns), inversions (flip expectations).

#### Scenario: Mirror enemy reflects player damage
- **WHEN** the player deals damage to Echo Shell
- **THEN** Echo Shell gains block equal to the damage dealt on its next turn

#### Scenario: Mirror enemy punishes defense
- **WHEN** Hollow Twin takes its turn
- **THEN** its attack value equals the player's Torso equipment base block value

#### Scenario: Adapter enemy punishes same-slot usage
- **WHEN** the player uses the same slot for damage on consecutive turns against Flux Warden
- **THEN** Flux Warden gains +2 permanent block each turn the pattern continues

#### Scenario: Adapter enemy gains immunity
- **WHEN** Null Circuit has received the most cumulative damage from one specific slot
- **THEN** Null Circuit becomes immune to damage from that slot (resets every 3 turns)

#### Scenario: Pressure enemy reduces resources
- **WHEN** Decay Tick is alive at the end of a turn
- **THEN** the player's max energy is reduced by 1 for the next turn (minimum 4)

#### Scenario: Pressure enemy destroys cards
- **WHEN** Memory Leak takes its turn
- **THEN** a random card from the player's draw pile is exhausted

#### Scenario: Inversion enemy phases
- **WHEN** Phase Shade exists in combat
- **THEN** it takes double damage on odd turns and zero damage on even turns

#### Scenario: Inversion enemy steals block
- **WHEN** Siphon Frame takes its turn and the player has block
- **THEN** the player's block is set to 0 and Siphon Frame's attack value equals the stolen block amount

#### Scenario: Bonded enemies share damage
- **WHEN** damage is dealt to one enemy in a Bonded Pair
- **THEN** the other enemy heals for 50% of the damage dealt (rounded down)

### Requirement: S3 has 8-10 regular enemies
Sector 3 SHALL have 8-10 unique regular enemy definitions spanning all four mechanical categories.

#### Scenario: S3 enemy count
- **WHEN** all S3 regular enemies are defined
- **THEN** there SHALL be between 8 and 10 distinct enemy definitions

#### Scenario: S3 enemies have higher HP than S2
- **WHEN** comparing S3 standard enemies to S2 equivalents
- **THEN** S3 enemies have HP ranges from 25 (swarm) to 85 (tank)

#### Scenario: S3 enemies all attack on turn 1
- **WHEN** a S3 enemy takes its first turn
- **THEN** its first intent SHALL be Attack, AttackDebuff, or Drain

### Requirement: S3 enemies appear in predefined encounter compositions
S3 combat rooms SHALL select from 10 predefined encounter groups. Each encounter SHALL test a specific build aspect.

#### Scenario: Encounter tests AoE capability
- **WHEN** a Bonded Pair encounter spawns
- **THEN** the player must deal simultaneous damage to both enemies or face healing loops

#### Scenario: Encounter tests speed
- **WHEN** a Decay Tick or Memory Leak encounter spawns
- **THEN** the player is pressured to end the fight quickly before resources deplete

#### Scenario: Encounter tests varied play
- **WHEN** Null Circuit or Flux Warden appears
- **THEN** the player must vary their slot usage across turns

### Requirement: S3 has 3 elite enemies
Sector 3 SHALL have 3 elite enemies that represent the hardest non-boss fights in the game.

#### Scenario: The Recursion
- **WHEN** The Recursion has been alive for 3 turns
- **THEN** it spawns a copy of itself at 50% of its max HP

#### Scenario: Void Sentinel
- **WHEN** Void Sentinel takes its turn
- **THEN** it disables a RANDOM body slot (not a fixed slot like S2 enemies) AND attacks

#### Scenario: The Weight
- **WHEN** The Weight completes a turn
- **THEN** it gains +1 permanent Strength that never decays

### Requirement: S3 boss is The Reflection
The S3 boss SHALL mirror the player's build. Its stats are derived from the player's equipment.

#### Scenario: Reflection HP scales with player equipment
- **WHEN** The Reflection is created
- **THEN** its max HP SHALL equal the sum of all player equipment base action values multiplied by 8, with a minimum floor of 80

#### Scenario: Reflection attack mirrors player Arms
- **WHEN** The Reflection attacks
- **THEN** its base attack value equals the player's Arms equipment base damage value

#### Scenario: Reflection block mirrors player Torso
- **WHEN** The Reflection blocks
- **THEN** its block value equals the player's Torso equipment base block value

#### Scenario: Reflection adapts intent to player's last turn
- **WHEN** the player primarily blocked last turn (block gained > damage dealt)
- **THEN** The Reflection attacks on its next turn
- **WHEN** the player primarily attacked last turn (damage dealt > block gained)
- **THEN** The Reflection blocks on its next turn
- **WHEN** the player played 3 or more cards last turn
- **THEN** The Reflection debuffs the player (applies Weak or Vulnerable)

#### Scenario: Reflection disables strongest slot
- **WHEN** The Reflection reaches every 4th turn (turn 4, 8, 12...)
- **THEN** it disables the player's highest-output slot for one turn
