## MODIFIED Requirements

### Requirement: Enemy definitions

EnemyDefinition SHALL support reactive intent types and optional trigger behaviors in addition to fixed intent patterns.

#### Scenario: Enemy with reactive intents
- **WHEN** an enemy definition includes a reactive intent (Retaliate, StrainScale, CopyAction, Charge, ConditionalBuff)
- **THEN** the intent is resolved during enemy turn by reading current combat state

#### Scenario: Enemy with on-death trigger
- **WHEN** an enemy definition includes an onDeath field
- **THEN** the trigger executes when that enemy's HP reaches 0

#### Scenario: Charge counter state
- **WHEN** an enemy has a Charge intent
- **THEN** the enemy instance tracks a chargeCounter that persists between turns and decrements each turn
