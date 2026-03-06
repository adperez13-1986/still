## MODIFIED Requirements

### Requirement: Turn-based combat loop
Combat SHALL follow a three-phase turn structure: planning phase (player assigns modifiers to body slots), execution phase (body actions fire top-to-bottom), and enemy phase (enemies execute intents).

#### Scenario: Canonical turn step order
- **WHEN** a turn begins (or combat starts for the first turn)
- **THEN** steps execute in this exact order: (1) passive cooling −2 Heat, (2) Block resets to 0, (3) draw modifier cards up to hand size, (4) planning phase — player assigns modifiers and plays system cards, (5) player clicks "Execute", (6) execution phase — body actions fire HEAD → TORSO → ARMS → LEGS, (7) enemy phase — all living enemies execute intents, (8) end-of-turn — Hot damage penalty if Heat 8-9, status durations decrement, (9) discard remaining hand, (10) check win/loss, (11) next turn begins at step 1

#### Scenario: Planning phase
- **WHEN** steps 1-3 complete (cooling, block reset, draw)
- **THEN** the player may assign modifier cards to body slots and play system cards freely until clicking "Execute"

#### Scenario: Execution phase resolves body actions
- **WHEN** the player clicks "Execute"
- **THEN** body actions fire in fixed order (HEAD → TORSO → ARMS → LEGS), each modified by any assigned modifier card, each generating +1 Heat, with output affected by the current Heat threshold at the moment of firing

#### Scenario: Enemy phase follows execution
- **WHEN** the execution phase completes
- **THEN** all living enemies execute their telegraphed intents simultaneously

#### Scenario: End-of-turn effects
- **WHEN** the enemy phase completes
- **THEN** Hot damage penalty applies (3 damage if Heat 8-9), status effect durations decrement, remaining hand is discarded, and win/loss is checked before the next turn

### Requirement: Run structure
The game SHALL be organized into discrete runs. Each run begins with Still in an initial state and ends when Still reaches the final room of the current act or is defeated. A run consists of navigating the maze room by room, engaging in encounters, and collecting rewards.

#### Scenario: Starting a new run
- **WHEN** the player starts a new run
- **THEN** Still initializes with base health of 70, Heat at 0, TORSO equipped with Scrap Plating, HEAD/ARMS/LEGS empty, no parts, and a starting modifier deck of 8 cards

#### Scenario: Run ends in defeat
- **WHEN** Still's health reaches zero during combat
- **THEN** the run ends, the defeat screen is shown, persistent resources earned during the run are saved, and the player is returned to the home base

#### Scenario: Run ends in victory
- **WHEN** Still clears the final room of the act
- **THEN** the run ends, the victory screen is shown with a personal encouragement message, and all persistent rewards are saved

### Requirement: Win and loss conditions per combat
A combat encounter SHALL be won when all enemies reach zero health, and lost when Still reaches zero health.

#### Scenario: All enemies defeated
- **WHEN** the last enemy in an encounter reaches zero health
- **THEN** combat ends, the reward screen is shown, Block and Heat are reset

#### Scenario: Still is defeated
- **WHEN** Still's health reaches zero during enemy attack or Hot damage penalty
- **THEN** combat ends immediately, no rewards are granted for that encounter, and run-end logic triggers

### Requirement: Post-run persistence
The game SHALL always save something at the end of a run, regardless of outcome. The player SHALL never leave a run with nothing.

#### Scenario: Run ends with earned resources
- **WHEN** any run ends (victory or defeat)
- **THEN** persistent currency earned during the run is added to the permanent account, and any unlocked persistent items are saved

#### Scenario: Player returns after defeat
- **WHEN** the player starts the game after a previous defeat
- **THEN** the home base shows accumulated resources and any upgrades purchased, confirming that progress was kept

### Requirement: Run info accessible during combat
The player SHALL be able to view their full deck, equipment slots, and parts during combat via the existing RunInfoOverlay.

#### Scenario: Player opens info overlay during combat
- **WHEN** the player taps the "Info" button during combat
- **THEN** the RunInfoOverlay opens showing the equips tab (equipment, carried part, parts)

#### Scenario: Player views deck during combat
- **WHEN** the RunInfoOverlay is open during combat and the player switches to the deck tab
- **THEN** the full deck is displayed (all cards in deck, not just current hand)

#### Scenario: Closing the overlay returns to combat
- **WHEN** the player closes the RunInfoOverlay during combat
- **THEN** they return to the combat screen in the same state they left it
