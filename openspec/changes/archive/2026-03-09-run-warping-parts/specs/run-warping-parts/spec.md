## ADDED Requirements

### Requirement: Dual Loader part
When the player owns Dual Loader, they SHALL be able to assign a second modifier card to any body slot that already has a modifier assigned. Both modifiers SHALL apply during execution.

#### Scenario: Assigning a second modifier
- **WHEN** the player owns Dual Loader and a slot already has a modifier assigned
- **THEN** the player can assign a second modifier to that slot instead of being rejected

#### Scenario: Both modifiers apply during execution
- **WHEN** a slot has two modifiers assigned and execution fires
- **THEN** both modifier effects apply — primary first, then secondary. Amplify modifiers stack multiplicatively.

#### Scenario: Without Dual Loader, one modifier limit applies
- **WHEN** the player does not own Dual Loader
- **THEN** the existing one-modifier-per-slot limit remains enforced

### Requirement: Thermal Damper part
When the player owns Thermal Damper, heat SHALL be locked for the first 2 turns of each combat. While locked, heat costs from cards and body actions accumulate as debt instead of raising actual heat. When the lock expires at the start of turn 3, all accumulated debt SHALL apply to heat at once.

#### Scenario: Heat locked during turns 1-2
- **WHEN** the player owns Thermal Damper and combat is on turn 1 or 2
- **THEN** heat costs from cards and body actions are added to heatDebt instead of actual heat

#### Scenario: Cooling still works while locked
- **WHEN** heat is locked and the player plays a cooling card
- **THEN** actual heat is reduced normally (cooling is not deferred)

#### Scenario: Lock expires at turn 3
- **WHEN** turn 3 begins
- **THEN** heatLocked becomes false, all accumulated heatDebt is applied to actual heat at once, potentially crossing thresholds or triggering overheat

### Requirement: Overheat Reactor part
When the player owns Overheat Reactor and heat reaches Overheat, instead of shutting down: all body slots SHALL deal 2x damage this turn, heat SHALL reset to 5, and max HP SHALL be permanently reduced by 5 for the rest of the run.

#### Scenario: Overheat with Reactor
- **WHEN** the player owns Overheat Reactor and heat reaches HEAT_MAX
- **THEN** shutdown is prevented, heat resets to 5, all body slot damage is doubled this turn, and both current health (if above new max) and max HP are reduced by 5

#### Scenario: Max HP reduction is permanent
- **WHEN** Overheat Reactor fires and max HP is reduced
- **THEN** the max HP reduction persists for the rest of the run and cannot be restored

#### Scenario: Pressure Valve takes priority over Overheat Reactor
- **WHEN** the player owns both Pressure Valve and Overheat Reactor
- **THEN** Pressure Valve fires first, preventing overheat entirely — Overheat Reactor does not trigger

### Requirement: Run-warping parts drop from elites and bosses
Run-warping parts SHALL drop exclusively from elite and boss encounters with diminishing probability based on how many the player already owns.

#### Scenario: Drop probability diminishes
- **WHEN** an elite or boss is defeated
- **THEN** the chance of a run-warping part drop is: 35% with 0 owned, 15% with 1 owned, 5% with 2 owned, 0% with 3 owned

#### Scenario: Drop is an additional reward
- **WHEN** a run-warping part drop roll succeeds
- **THEN** a random un-owned run-warping part is added as an additional drop alongside normal rewards

#### Scenario: Run-warping parts not in normal pools
- **WHEN** normal combat rewards are resolved
- **THEN** run-warping parts do not appear in the standard sector part pools
