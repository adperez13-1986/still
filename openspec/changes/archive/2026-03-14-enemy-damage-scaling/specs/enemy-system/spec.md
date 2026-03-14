## MODIFIED Requirements

### Requirement: Enemy intent resolution
Enemy intents SHALL be resolved during the enemy turn phase. Attack intents deal damage to the player after applying all modifiers including damage scaling.

#### Scenario: Attack intent with scaling
- **WHEN** an enemy executes an Attack intent
- **THEN** damage is calculated as: base intent value × scaling multiplier, then + Strength, then × Weak modifier, then × Vulnerable modifier

#### Scenario: Non-damage intents are not scaled
- **WHEN** an enemy executes a Block, Buff, Debuff, DisableSlot, or Absorb intent
- **THEN** no scaling multiplier is applied
