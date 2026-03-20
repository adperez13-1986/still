## MODIFIED Requirements

### Requirement: Enemy intent types expanded for body-driven combat
The enemy intent system SHALL include intent types that interact with the body-action systems. The drop resolution function SHALL accept an optional pity parameter to modify equipment drop weights. The HeatAttack intent type is removed. The Absorb intent type is removed — enemies SHALL use Block and Buff intents instead.

#### Scenario: DisableSlot intent
- **WHEN** an enemy has a DisableSlot intent
- **THEN** it targets a specific slot (HEAD, TORSO, ARMS, or LEGS) and disables it for one turn

#### Scenario: Absorb intent type removed
- **WHEN** defining enemy intent patterns
- **THEN** the Absorb intent type SHALL NOT be used; enemies SHALL use Block or Buff intents to gain defensive value

#### Scenario: Drop resolution accepts pity parameter
- **WHEN** `resolveDrops` is called with a pity value
- **THEN** the pity value SHALL be added to the weight of all equipment entries in the drop pool before rolling
