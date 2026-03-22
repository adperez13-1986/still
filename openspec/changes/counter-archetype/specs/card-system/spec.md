## ADDED Requirements

### Requirement: Retaliate modifier category and slot effect
The card system SHALL support a `Retaliate` modifier category with a `retaliate` slot effect type. Retaliate cards SHALL be restricted to the Torso slot only.

#### Scenario: Retaliate card defined
- **WHEN** the Retaliate card is defined
- **THEN** it SHALL have: energy cost 2 (upgraded: 1), type slot modifier, modifier Retaliate, effect retaliate, Torso-only restriction, no keywords

#### Scenario: Retaliate in S1 card pool
- **WHEN** the S1 card reward pool is defined
- **THEN** Retaliate SHALL be included as an available reward

#### Scenario: Retaliate slot restriction
- **WHEN** the player attempts to assign Retaliate to a slot
- **THEN** only Torso SHALL be a valid target

### Requirement: Fortify system card
Fortify SHALL be a system card that provides both block and AoE damage in a single play.

#### Scenario: Fortify card defined
- **WHEN** the Fortify card is defined
- **THEN** it SHALL have: energy cost 2, type system, homeSlot Torso, effects [gainBlock 6, damage 6 all_enemies], no keywords. Upgraded: gainBlock 8, damage 8.

#### Scenario: Fortify in S2 card pool
- **WHEN** the S2 card reward pool is defined
- **THEN** Fortify SHALL be included as an available reward
