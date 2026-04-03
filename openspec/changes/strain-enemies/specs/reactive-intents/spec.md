## ADDED Requirements

### Requirement: Retaliate intent

An enemy with a Retaliate intent SHALL deal damage based on how many slots the player pushed this turn.

#### Scenario: Player pushed 2 slots against Punisher
- **WHEN** the enemy has a Retaliate intent with valuePerPush 3 AND the player pushed 2 slots this turn
- **THEN** the enemy deals 6 damage (2 × 3) to the player

#### Scenario: Player pushed 0 slots
- **WHEN** the enemy has a Retaliate intent AND the player pushed 0 slots
- **THEN** the enemy deals 0 damage

### Requirement: StrainScale intent

An enemy with a StrainScale intent SHALL deal damage that increases with the player's current strain.

#### Scenario: Strain-scaled attack
- **WHEN** the enemy has a StrainScale intent with baseValue 8 and strainDivisor 5 AND strain is 15
- **THEN** the enemy deals 11 damage (8 + floor(15/5))

### Requirement: CopyAction intent

An enemy with a CopyAction intent SHALL replicate the player's highest-value action from the current turn.

#### Scenario: Player's highest action was pushed Strike for 9
- **WHEN** the enemy has a CopyAction intent AND the highest player action this turn was 9 damage
- **THEN** the enemy attacks the player for 9

#### Scenario: Player's highest action was Shield for 7
- **WHEN** the enemy has a CopyAction intent AND the highest player action was 7 block
- **THEN** the enemy gains 7 block

#### Scenario: Player vented (no actions)
- **WHEN** the enemy has a CopyAction intent AND the player only vented
- **THEN** the enemy does nothing

### Requirement: Charge intent

An enemy with a Charge intent SHALL count down for a number of turns, then unleash a large attack.

#### Scenario: Charging turns
- **WHEN** the enemy has a Charge intent with chargeTime 2 and the counter is above 0
- **THEN** the enemy does nothing and decrements the counter. Intent displays "Charging... N".

#### Scenario: Blast turn
- **WHEN** the charge counter reaches 0
- **THEN** the enemy attacks for blastValue and resets the counter

### Requirement: ConditionalBuff intent

An enemy with a ConditionalBuff intent SHALL buff itself only if a condition is met, otherwise perform a fallback action.

#### Scenario: Scaler undamaged
- **WHEN** the enemy has a ConditionalBuff with condition 'undamaged' AND took no damage this turn
- **THEN** the enemy gains the specified buff (e.g., Strength +3)

#### Scenario: Scaler was damaged
- **WHEN** the enemy has a ConditionalBuff with condition 'undamaged' AND took damage this turn
- **THEN** the enemy performs its fallback action (e.g., Attack 8)
