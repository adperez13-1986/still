## MODIFIED Requirements

### Requirement: Enemy intent types expanded for body-driven combat
The enemy intent system SHALL include new intent types that interact with the body-action and Heat systems. The drop resolution function SHALL accept an optional pity parameter to modify equipment drop weights.

#### Scenario: HeatAttack intent
- **WHEN** an enemy has a HeatAttack intent
- **THEN** it deals damage to Still AND adds Heat (e.g., "Attack 8 + Heat 2")

#### Scenario: DisableSlot intent
- **WHEN** an enemy has a DisableSlot intent
- **THEN** it targets a specific slot (HEAD, TORSO, ARMS, or LEGS) and disables it for one turn

#### Scenario: Absorb intent
- **WHEN** an enemy has an Absorb intent
- **THEN** it gains Block equal to a portion of Still's current Heat (rewarding the player for cooling before the enemy acts)

#### Scenario: Drop resolution accepts pity parameter
- **WHEN** `resolveDrops` is called with a pity value
- **THEN** the pity value SHALL be added to the weight of all equipment entries in the drop pool before rolling
