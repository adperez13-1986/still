## ADDED Requirements

### Requirement: Retaliate reflects absorbed block damage during enemy turn
When Retaliate is active (Torso has Retaliate modifier assigned), damage absorbed by the player's block during enemy attacks SHALL be dealt back to the attacking enemy.

#### Scenario: Enemy attacks into block with Retaliate active
- **WHEN** an enemy attacks and the player's block absorbs some damage, and Retaliate is active
- **THEN** the absorbed amount SHALL be dealt as damage to the attacking enemy (reduced by enemy block if any)

#### Scenario: Retaliate with no block
- **WHEN** an enemy attacks and the player has 0 block, and Retaliate is active
- **THEN** no retaliation damage is dealt (nothing was absorbed)

#### Scenario: Retaliate resets each execution phase
- **WHEN** a new execution phase begins
- **THEN** `retaliateActive` SHALL be reset to false (it must be set again by Torso firing with Retaliate assigned)

#### Scenario: Multiple enemies attack with Retaliate
- **WHEN** two enemies attack in the same turn and Retaliate is active
- **THEN** each enemy receives retaliation damage based on how much block THEIR attack consumed

### Requirement: Thorns deals damage to attackers when player takes unblocked damage
When the player has a Thorns part and takes damage from an enemy attack (damage that passes through block), the attacking enemy takes flat thorns damage.

#### Scenario: Thorns triggers on damage taken
- **WHEN** an enemy attack deals damage to the player's HP (after block absorption) and a Thorns part is equipped
- **THEN** the attacking enemy takes the thorns value as damage

#### Scenario: Thorns does not trigger on fully blocked attack
- **WHEN** an enemy attack is fully absorbed by block
- **THEN** Thorns does NOT trigger (no HP damage was taken)

#### Scenario: Thorns can kill enemies
- **WHEN** thorns damage reduces an enemy to 0 HP
- **THEN** the enemy is marked as defeated
