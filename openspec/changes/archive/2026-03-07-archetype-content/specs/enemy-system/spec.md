## MODIFIED Requirements

### Requirement: Enemies can interact with Still's Heat
Some enemies SHALL have intents or abilities that react to Still's Heat state. Enemies SHALL NOT directly modify Still's Heat value — heat is the player's resource to manage. Enemies may read heat and adjust their behavior accordingly.

#### Scenario: Enemy penalizes high Heat
- **WHEN** an enemy has a conditional intent that activates based on Still's Heat threshold
- **THEN** the enemy deals bonus damage or applies additional effects when Still is Warm or hotter

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

## REMOVED Requirements

### Requirement: HeatAttack intent (enemy generates Heat on Still)
**Reason**: Enemies directly modifying Still's Heat undermines player agency over the central mechanic. Heat is the player's resource to manage — enemies should react to it, not alter it.
**Migration**: Remove `HeatAttack` from `IntentType` union. Remove HeatAttack scenario from enemy intent spec. Any enemy that used HeatAttack should be converted to use standard Attack, AttackDebuff, or conditional behaviors based on heat thresholds.
