## ADDED Requirements

### Requirement: Persistent home base (the Workshop)
Between runs, the player SHALL return to a home base called the Workshop — a place that grows and changes over time. The Workshop represents accumulated progress and serves as the idle/incremental layer.

#### Scenario: Player returns to Workshop after a run
- **WHEN** a run ends
- **THEN** the player is brought to the Workshop screen, which shows earned resources, unlocked upgrades, and offline progress accumulated since last visit

#### Scenario: Workshop reflects total journey
- **WHEN** the player has completed multiple runs
- **THEN** the Workshop shows visible signs of growth — new areas unlocked, more options available, atmosphere warmer than when empty

### Requirement: Shards as persistent currency
Shards SHALL be the permanent currency earned during runs. Shards persist after defeat and are spent in the Workshop on permanent upgrades.

#### Scenario: Earning shards during a run
- **WHEN** Still defeats an enemy or skips a card reward
- **THEN** shards are added to the run's shard total

#### Scenario: Shards saved at run end
- **WHEN** a run ends (victory or defeat)
- **THEN** all shards earned during the run are permanently added to the player's total, visible in the Workshop

#### Scenario: Spending shards in the Workshop
- **WHEN** the player spends shards on a Workshop upgrade
- **THEN** the upgrade is permanently unlocked and applies from the next run forward

### Requirement: Workshop upgrades improve starting conditions
Workshop upgrades SHALL affect Still's starting state in future runs, making each run slightly better than the last.

#### Scenario: Starting health upgrade
- **WHEN** the player purchases a "Reinforced Chassis" upgrade
- **THEN** all future runs begin with increased max health

#### Scenario: Starting deck upgrade
- **WHEN** the player purchases a "Practiced Routine" upgrade
- **THEN** all future runs begin with one additional non-basic card already in the deck

#### Scenario: Shard bonus upgrade
- **WHEN** the player purchases a "Sharp Eye" upgrade
- **THEN** all future runs earn a percentage bonus on shard drops

### Requirement: Idle resource generation
The Workshop SHALL passively generate a secondary resource (Fragments) over real time, even when the game is closed.

#### Scenario: Fragments accumulate while offline
- **WHEN** the player returns to the game after being away
- **THEN** the Workshop displays how many Fragments were generated during the absence, capped at a maximum accumulation amount

#### Scenario: Fragments spent on run bonuses
- **WHEN** the player spends Fragments before starting a run
- **THEN** the run begins with a bonus (e.g., an extra card choice, a starting part, or bonus shards)

### Requirement: Run history is preserved
The game SHALL keep a log of the player's past runs — how far they reached, what build they had, and the encouragement message they received.

#### Scenario: Viewing run history
- **WHEN** the player opens the Run History in the Workshop
- **THEN** they see a list of past runs with act reached, key parts/cards acquired, and the closing message from that run
