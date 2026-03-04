## ADDED Requirements

### Requirement: Run structure
The game SHALL be organized into discrete runs. Each run begins with Still in an initial state and ends when Still reaches the final room of the current act or is defeated. A run consists of navigating the maze room by room, engaging in encounters, and collecting rewards.

#### Scenario: Starting a new run
- **WHEN** the player starts a new run
- **THEN** Still initializes with base health, a starting deck of cards, and no equipped parts beyond the starting chassis

#### Scenario: Run ends in defeat
- **WHEN** Still's health reaches zero during combat
- **THEN** the run ends, the defeat screen is shown, persistent resources earned during the run are saved, and the player is returned to the home base

#### Scenario: Run ends in victory
- **WHEN** Still clears the final room of the act
- **THEN** the run ends, the victory screen is shown with a personal encouragement message, and all persistent rewards are saved

### Requirement: Turn-based combat loop
Combat SHALL follow a strict alternating turn structure. The player acts first on each round, then all enemies act simultaneously.

#### Scenario: Player turn begins
- **WHEN** a combat encounter starts or a new round begins
- **THEN** Still draws cards up to hand size, energy is restored to maximum, and the player may play cards or end turn

#### Scenario: Player ends their turn
- **WHEN** the player clicks "End Turn"
- **THEN** all remaining cards in hand are discarded, and all living enemies execute their telegraphed intent

#### Scenario: Enemy intent is shown
- **WHEN** a round begins
- **THEN** each enemy displays an icon and value indicating their intended action for that round (e.g., Attack 8, Block 5, Debuff)

### Requirement: Win and loss conditions per combat
A combat encounter SHALL be won when all enemies reach zero health, and lost when Still reaches zero health.

#### Scenario: All enemies defeated
- **WHEN** the last enemy in an encounter reaches zero health
- **THEN** combat ends, the reward screen is shown, and Still retains all block and status effects carry-over is cleared per standard rules

#### Scenario: Still is defeated
- **WHEN** Still's health reaches zero during an enemy attack
- **THEN** combat ends immediately, no rewards are granted for that encounter, and run-end logic triggers

### Requirement: Post-run persistence
The game SHALL always save something at the end of a run, regardless of outcome. The player SHALL never leave a run with nothing.

#### Scenario: Run ends with earned resources
- **WHEN** any run ends (victory or defeat)
- **THEN** persistent currency earned during the run is added to the permanent account, and any unlocked persistent items are saved

#### Scenario: Player returns after defeat
- **WHEN** the player starts the game after a previous defeat
- **THEN** the home base shows accumulated resources and any upgrades purchased, confirming that progress was kept
