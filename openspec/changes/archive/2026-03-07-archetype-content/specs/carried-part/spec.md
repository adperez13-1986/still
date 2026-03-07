## ADDED Requirements

### Requirement: Behavioral mods can trigger on heat threshold crossings
The mod trigger system SHALL support an `onThresholdCross` trigger that fires whenever Still's heat crosses a threshold boundary (Cool/Warm at heat 5, Warm/Hot at heat 8) in either direction during card play or execution.

#### Scenario: Threshold crossed upward
- **WHEN** Still's heat changes from 4 to 5 (Cool to Warm boundary)
- **THEN** any mod with `onThresholdCross` trigger fires

#### Scenario: Threshold crossed downward
- **WHEN** Still's heat changes from 5 to 4 (Warm to Cool boundary)
- **THEN** any mod with `onThresholdCross` trigger fires

#### Scenario: No threshold crossed
- **WHEN** Still's heat changes from 5 to 7 (stays within Warm)
- **THEN** `onThresholdCross` does not fire

#### Scenario: Multiple crossings in one turn
- **WHEN** Still's heat crosses a threshold multiple times in one turn (e.g., up past Warm, cooled back, up again)
- **THEN** the trigger fires each time a boundary is crossed

### Requirement: Act 1 mod pool includes archetype-seeding mods
The Act 1 behavioral mod pool SHALL include mods that reward specific heat playstyles.

#### Scenario: Cool Runner mod in Act 1
- **WHEN** mods are available in Act 1
- **THEN** the pool includes Frost Core (onTurnStart: while Cool, gain +2 Block)

#### Scenario: Pyromaniac mod in Act 1
- **WHEN** mods are available in Act 1
- **THEN** the pool includes Overheater (onSlotFire Arms: while Hot, +3 bonus damage)

#### Scenario: Oscillator mod in Act 1
- **WHEN** mods are available in Act 1
- **THEN** the pool includes Flux Capacitor (onThresholdCross: draw 1 card) as a rare drop
