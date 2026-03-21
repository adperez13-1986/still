## ADDED Requirements

### Requirement: Headless combat runner
The simulator SHALL execute complete combats by calling `initCombat`, `playModifierCard`, `executeBodyActions`, `executeEnemyTurn`, `endTurn`, and `startTurn` in sequence without any UI or React dependencies.

#### Scenario: Complete combat to victory
- **WHEN** a simulation combat is run with a loadout that can win
- **THEN** the runner loops turn phases until all enemies are defeated, returning a result with `outcome: 'win'`, turn count, and remaining HP

#### Scenario: Complete combat to defeat
- **WHEN** a simulation combat is run and the player's HP reaches 0
- **THEN** the runner stops and returns a result with `outcome: 'loss'` and the turn on which defeat occurred

#### Scenario: Infinite loop safety
- **WHEN** a combat exceeds 50 turns without resolution
- **THEN** the runner SHALL terminate the combat and record it as a loss

### Requirement: Heuristic player makes valid card plays
The heuristic player SHALL only produce card plays that are legal: correct slot restrictions, sufficient energy, and valid targets.

#### Scenario: Slot restriction enforcement
- **WHEN** the heuristic considers playing an Amplify card
- **THEN** it SHALL only assign it to Arms or Torso (per `getAllowedSlots`)

#### Scenario: Energy budget respected
- **WHEN** the heuristic has played cards totaling the available energy
- **THEN** it SHALL stop playing cards for the turn even if cards remain in hand

#### Scenario: Enemy targeting
- **WHEN** the heuristic assigns a single-target damage action
- **THEN** it SHALL target a living enemy (preferring lowest HP to maximize kills)

### Requirement: Heuristic player uses threat assessment
The heuristic SHALL assess incoming enemy damage to decide between offensive and defensive play.

#### Scenario: High threat triggers defensive priority
- **WHEN** total visible enemy intent damage exceeds current block + 10
- **THEN** the heuristic SHALL prioritize block-generating cards (Amplify on Torso, block system cards) before damage cards

#### Scenario: Low threat triggers offensive priority
- **WHEN** total visible enemy intent damage is less than or equal to current block + 10
- **THEN** the heuristic SHALL prioritize damage-generating cards (Amplify on Arms, Redirect, damage system cards)

### Requirement: Statistical output
The CLI SHALL aggregate results across all runs and display summary statistics.

#### Scenario: Basic statistics
- **WHEN** a simulation batch completes
- **THEN** the output SHALL include: win rate percentage, average turn count with standard deviation, average HP remaining on wins

#### Scenario: Turn distribution
- **WHEN** a simulation batch completes
- **THEN** the output SHALL include a turn-count distribution showing what percentage of combats ended in each turn bracket

### Requirement: CLI configuration
The CLI SHALL accept command-line arguments to configure simulation parameters.

#### Scenario: Enemy selection
- **WHEN** `--enemies s1` is passed
- **THEN** the simulator SHALL run against sector 1 encounter groups

#### Scenario: Loadout configuration
- **WHEN** `--equipment`, `--parts`, and `--cards` flags are provided
- **THEN** the simulator SHALL use the specified loadout instead of defaults

#### Scenario: Run count
- **WHEN** `--runs 5000` is passed
- **THEN** the simulator SHALL execute exactly 5000 combats

#### Scenario: Reproducibility
- **WHEN** the same `--seed` value is used across two runs with identical parameters
- **THEN** both runs SHALL produce identical results

### Requirement: Seedable RNG
All random operations in the combat simulation SHALL accept an optional RNG function for deterministic replay.

#### Scenario: Seeded shuffle produces consistent order
- **WHEN** `initCombat` is called with a seeded RNG
- **THEN** the draw pile order SHALL be identical across calls with the same seed

#### Scenario: Unseeded calls use Math.random
- **WHEN** `initCombat` is called without an RNG parameter
- **THEN** it SHALL use `Math.random` (existing behavior unchanged)
