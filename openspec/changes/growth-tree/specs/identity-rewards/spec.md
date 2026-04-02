## ADDED Requirements

### Requirement: Tier 2 ability upgrades

Tier 2 rewards SHALL modify existing ability or slot behavior.

#### Scenario: Repair+
- **WHEN** the player has acquired repair-plus AND uses Repair in combat
- **THEN** Repair heals 7 HP instead of 4

#### Scenario: Drain Strike
- **WHEN** the player has acquired drain-strike AND Strike deals damage to an enemy
- **THEN** the player heals for floor(damage / 2) of the actual damage dealt

#### Scenario: Brace+
- **WHEN** the player has acquired brace-plus AND uses Brace in combat
- **THEN** Brace reduces incoming damage by 5 per hit instead of 3

#### Scenario: Reactive Shield
- **WHEN** the player has acquired reactive-shield
- **THEN** the Shield slot fires AFTER the enemy turn instead of during the normal slot execution phase. Block gained from Shield is not wasted on a turn where the enemy doesn't attack.

#### Scenario: Piercing Strike
- **WHEN** the player has acquired piercing-strike AND Strike fires
- **THEN** Strike damage bypasses enemy block entirely (damage goes directly to enemy HP)

#### Scenario: Scatter Barrage
- **WHEN** the player has acquired scatter-barrage AND Barrage fires
- **THEN** instead of hitting all enemies once, Barrage hits 3 times targeting random alive enemies

### Requirement: Tier 3 identity rewards

Tier 3 rewards SHALL create conditional combat effects based on strain level or combat events.

#### Scenario: Desperate Repair
- **WHEN** the player has acquired desperate-repair AND uses Repair AND strain is 15 or above
- **THEN** Repair heals 8 HP (overrides Repair+ value of 7)

#### Scenario: Lifeline
- **WHEN** the player has acquired lifeline AND uses Vent AND strain is 12 or above (before Vent reduces it)
- **THEN** Vent also heals 4 HP in addition to its strain recovery

#### Scenario: Calm Brace
- **WHEN** the player has acquired calm-brace AND uses Brace AND strain is 8 or below
- **THEN** Brace reduces incoming damage by 6 per hit (overrides Brace+ value of 5)

#### Scenario: Fortify
- **WHEN** the player has acquired fortify AND the enemy turn ends AND block remains > 0
- **THEN** remaining block is converted to HP healing (1:1) before block resets

#### Scenario: Executioner
- **WHEN** the player has acquired executioner AND Strike fires against an enemy with HP below 30% of max
- **THEN** Strike deals 4 bonus damage

#### Scenario: Chain Reaction
- **WHEN** the player has acquired chain-reaction AND an enemy is killed during Barrage
- **THEN** a bonus Barrage fires immediately (same value, targets remaining alive enemies)
