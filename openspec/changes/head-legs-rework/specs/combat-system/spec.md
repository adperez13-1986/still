## MODIFIED Requirements

### Requirement: Draw count

Base draw is 5 cards per turn with no equipment bonus.

#### Scenario: Drawing cards at turn start
- **WHEN** a new turn starts
- **THEN** the player draws 5 cards (plus Inspired bonus). There is no HEAD equipment draw bonus.

### Requirement: Damage reduction during enemy attacks

Damage reduction from LEGS equipment reduces each incoming hit before block absorption.

#### Scenario: Enemy attack with damage reduction active
- **WHEN** an enemy attacks for N damage and damage reduction R is active
- **THEN** the effective hit is max(0, N - R). Block then absorbs from the reduced value. HP takes the remainder.

#### Scenario: Multi-hit attack with damage reduction
- **WHEN** an enemy attacks with multiple hits (e.g., 4x5) and reduction R = 3
- **THEN** each hit is reduced individually: 4 hits of max(0, 5-3) = 4 hits of 2 = 8 total damage (vs 20 without reduction)

#### Scenario: Damage reduction resets each turn
- **WHEN** a new execution phase begins
- **THEN** damage reduction from the previous turn is reset to 0. LEGS must fire again to set reduction.

### Requirement: HEAD debuff during slot execution

HEAD slot fires a debuff action during the execution phase like any other slot.

#### Scenario: HEAD debuff execution
- **WHEN** HEAD fires with debuff equipment during execution
- **THEN** the specified debuff is applied to enemies. This happens in slot order (Head fires first, so debuffs apply before Arms deals damage).

#### Scenario: HEAD debuff benefits Arms damage
- **WHEN** HEAD applies Vulnerable to an enemy and Arms fires after
- **THEN** Arms damage to that enemy is multiplied by 1.5x (Vulnerable effect). HEAD firing first in slot order makes this a natural synergy.
