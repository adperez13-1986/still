## ADDED Requirements

### Requirement: Enemy damage scales with combats cleared
Regular enemy attack damage SHALL increase by 15% per combat cleared from combat 1 (no grace period). Boss enemies SHALL receive a flat 15% damage increase instead.

#### Scenario: First combat
- **WHEN** combatsCleared is 1
- **THEN** regular enemy attack damage is multiplied by 1.15 (15% increase)

#### Scenario: 5th combat
- **WHEN** combatsCleared is 5
- **THEN** regular enemy attack damage is multiplied by 1.75 (75% increase)

#### Scenario: Boss damage scaling
- **WHEN** the enemy is a boss (isBoss = true)
- **THEN** attack damage is multiplied by 1.15 regardless of combatsCleared

#### Scenario: Scaling applies to base damage before other modifiers
- **WHEN** an enemy attacks with scaling active
- **THEN** the scaling multiplier is applied to the base intent value before Strength, Weak, or Vulnerable modifiers

### Requirement: Enemy HP scales with combats cleared
Regular enemy HP SHALL increase by 10% per combat cleared. Boss HP is not scaled.

#### Scenario: Regular enemy HP at combat 5
- **WHEN** combatsCleared is 5 and enemy is not a boss
- **THEN** enemy maxHealth is multiplied by 1.50 (50% increase), floored

#### Scenario: Boss HP unchanged
- **WHEN** the enemy is a boss
- **THEN** maxHealth is unchanged (1.0x multiplier)

### Requirement: Multi-hit attacks
Enemy intents MAY specify a `hits` count. Each hit resolves independently against block, ablative shell, and ablative heat.

#### Scenario: Multi-hit attack against block
- **WHEN** an enemy attacks with hits: 3 and value: 3, and player has 5 block
- **THEN** hit 1 deals 0 (3 blocked), hit 2 deals 1 (2 blocked), hit 3 deals 3 (no block left)

#### Scenario: Strength applies per hit
- **WHEN** an enemy has 2 Strength and attacks with hits: 3 and value: 3
- **THEN** each hit deals 5 (3 base + 2 Strength), total 15 damage before block
