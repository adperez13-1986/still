## ADDED Requirements

### Requirement: On-death spawn trigger

An enemy with an onDeath spawn trigger SHALL create new enemies when it dies.

#### Scenario: Splitter dies
- **WHEN** an enemy with onDeath spawn trigger is defeated
- **THEN** the specified enemies are added to the combat (e.g., 2 Fracture Fragments with 12 HP each)

#### Scenario: Fragments are targetable
- **WHEN** fragments are spawned
- **THEN** they appear as normal enemies with their own intent patterns, HP, and targeting

#### Scenario: Fragments don't drop rewards
- **WHEN** a spawned fragment is defeated
- **THEN** no additional rewards or effects trigger from its death
