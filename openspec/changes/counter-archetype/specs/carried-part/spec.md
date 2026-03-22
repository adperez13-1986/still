## ADDED Requirements

### Requirement: Thorns part effect type
The part system SHALL support a `thorns` effect type that deals flat damage to enemies when the player takes damage.

#### Scenario: Thorns Core part defined
- **WHEN** the Thorns Core part is defined
- **THEN** it SHALL have: trigger onDamageTaken, effect thorns with value 3, rarity uncommon

#### Scenario: Thorns Core in S1 part pool
- **WHEN** the S1 part reward pool is defined
- **THEN** Thorns Core SHALL be included as an available reward

#### Scenario: Thorns triggers on each attacking enemy
- **WHEN** the player takes damage from an enemy attack
- **THEN** Thorns Core SHALL deal its value as damage to the attacking enemy specifically (not a random enemy)

#### Scenario: Thorns against multi-hit attacks
- **WHEN** an enemy deals a multi-hit attack and at least one hit deals damage through block
- **THEN** Thorns SHALL trigger once for the entire attack (not per hit)
