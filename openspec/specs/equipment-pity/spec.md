## ADDED Requirements

### Requirement: Equipment pity counter tracks consecutive combats without equipment drops
The run state SHALL maintain an `equipPity` counter (integer, starting at 0) that increments by 1 after each combat encounter where no equipment dropped, and resets to 0 when equipment does drop.

#### Scenario: No equipment drops from combat
- **WHEN** a combat encounter ends and no equipment was in the resolved drops
- **THEN** `equipPity` increments by 1

#### Scenario: Equipment drops from combat
- **WHEN** a combat encounter ends and at least one equipment item was in the resolved drops
- **THEN** `equipPity` resets to 0

#### Scenario: New run starts
- **WHEN** a new run begins
- **THEN** `equipPity` SHALL be initialized to 0

### Requirement: Equipment drop weights are boosted by pity counter
The drop resolution system SHALL add the current `equipPity` value to the weight of every equipment entry in an enemy's drop pool before rolling.

#### Scenario: Pity boosts equipment weight
- **WHEN** an enemy has an equipment drop entry with base weight 1 and `equipPity` is 3
- **THEN** the effective weight for that entry SHALL be 4 (1 + 3) during the weighted roll

#### Scenario: No pity accumulated
- **WHEN** `equipPity` is 0
- **THEN** equipment drop weights are unchanged from their base values

### Requirement: Generic equipment entry injected for enemies without equipment drops
When `equipPity` reaches 2 or higher, enemies with no equipment in their drop pool SHALL have a generic equipment entry injected with base weight 0 (boosted by pity). The generic entry draws from the full equipment pool.

#### Scenario: Pity injection on equipment-less enemy
- **WHEN** an enemy has no equipment entry in its drop pool and `equipPity` is 3
- **THEN** a generic equipment entry with effective weight 3 is added to the bonus roll

#### Scenario: Pity below injection threshold
- **WHEN** an enemy has no equipment entry in its drop pool and `equipPity` is 1
- **THEN** no equipment entry is injected; the drop roll uses only the enemy's native entries
