## ADDED Requirements

### Requirement: Uncommon equipment with slot tension
Uncommon equipment SHALL offer power above commons but with a cost that pressures another slot's domain. The cost is visible in the equipment description.

#### Scenario: Shrapnel Launcher fires and costs Block
- **WHEN** the Shrapnel Launcher (ARMS uncommon) fires during execution
- **THEN** it SHALL deal 5 damage to all enemies AND Still loses 2 Block

#### Scenario: Tactical Visor provides combined information
- **WHEN** the Tactical Visor (HEAD uncommon) fires during execution
- **THEN** Still SHALL draw 1 card AND gain 1 foresight (reveal 1 extra enemy intent)

### Requirement: Rare equipment with heat-zone conditions
Rare equipment SHALL include items that gate their effect on a specific heat zone, committing the player to an archetype.

#### Scenario: Cryo Cannon fires only while Cool
- **WHEN** the Cryo Cannon (ARMS rare) slot fires and Still is in the Cool zone (0-3)
- **THEN** it SHALL deal 12 damage to one enemy

#### Scenario: Cryo Cannon does nothing outside Cool
- **WHEN** the Cryo Cannon slot fires and Still is NOT in the Cool zone
- **THEN** the slot SHALL produce no action — no damage, no heat generation from firing

#### Scenario: Meltdown Cannon fires twice while Hot
- **WHEN** the Meltdown Cannon (ARMS rare) slot fires and Still is in the Hot zone (7-9)
- **THEN** it SHALL deal 4 damage to all enemies, then fire again dealing 4 damage to all enemies (2 total firings)

#### Scenario: Meltdown Cannon fires once outside Hot
- **WHEN** the Meltdown Cannon slot fires and Still is NOT in the Hot zone
- **THEN** it SHALL deal 4 damage to all enemies (1 firing only)

#### Scenario: Cryo Shell heals while Cool
- **WHEN** the Cryo Shell (TORSO rare) fires and Still is in the Cool zone
- **THEN** Still SHALL gain 4 Block AND heal 2 HP

#### Scenario: Cryo Shell without Cool bonus
- **WHEN** the Cryo Shell fires and Still is NOT in the Cool zone
- **THEN** Still SHALL gain 4 Block only (no healing)

#### Scenario: Cryo Lock grants Block while Cool
- **WHEN** the Cryo Lock (LEGS rare) fires and Still is in the Cool zone
- **THEN** Still SHALL lose 1 Heat AND gain 5 Block

#### Scenario: Cryo Lock without Cool bonus
- **WHEN** the Cryo Lock fires and Still is NOT in the Cool zone
- **THEN** Still SHALL lose 1 Heat only (no Block bonus)

#### Scenario: Thermal Exhaust cools aggressively while Hot
- **WHEN** the Thermal Exhaust (LEGS rare) fires and Still is in the Hot zone
- **THEN** Still SHALL lose 3 Heat

#### Scenario: Thermal Exhaust cools normally outside Hot
- **WHEN** the Thermal Exhaust fires and Still is NOT in the Hot zone
- **THEN** Still SHALL lose 1 Heat

#### Scenario: Pyroclast Scanner draws extra while Hot
- **WHEN** the Pyroclast Scanner (HEAD rare) fires and Still is in the Hot zone
- **THEN** Still SHALL draw 3 cards

#### Scenario: Pyroclast Scanner draws normally outside Hot
- **WHEN** the Pyroclast Scanner fires and Still is NOT in the Hot zone
- **THEN** Still SHALL draw 1 card

### Requirement: Neural Sync rare HEAD equipment
The Neural Sync SHALL be a rare HEAD equipment providing draw and foresight.

#### Scenario: Neural Sync fires
- **WHEN** the Neural Sync (HEAD rare) fires during execution
- **THEN** Still SHALL draw 2 cards AND gain 1 foresight

### Requirement: Ablative Plates rare TORSO equipment
The Ablative Plates SHALL be a rare TORSO equipment providing high Block with no conditions.

#### Scenario: Ablative Plates fires
- **WHEN** the Ablative Plates (TORSO rare) fires during execution
- **THEN** Still SHALL gain 6 Block
