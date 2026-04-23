# Combat System

## Purpose

Strain combat: actions fire each turn at base value. Pushing boosts a slot for a strain cost. Paired slots can trigger synergies based on type combination. Runs end when HP reaches 0 (defeat) or strain reaches 20 (forfeit — current fight ends, no rewards, strain drops to 14, then decays further between fights).

## Requirements

### Requirement: Combat phases

Combat proceeds through phases: planning (push selection + link decisions), execution (actions fire in slot order with synergies), enemy turn.

#### Scenario: Planning phase
- **WHEN** the phase is `planning`
- **THEN** the player sees 5 action slots in their pair layout. Each slot can be pushed (toggle). Pair synergy indicators show what activates if both are pushed. Enemy intents visible. Strain projection shows total cost including link taxes.

#### Scenario: Execution phase
- **WHEN** the player confirms selections
- **THEN** strain is deducted (pushes + link taxes). Actions fire in slot order (1 through 5). Unpushed fire at base value. Pushed fire at pushed value. If both in a pair are pushed, synergy resolves after both actions fire. Vent skips all damage actions when active.

#### Scenario: Synergy resolution order
- **WHEN** a pair synergy activates
- **THEN** it resolves immediately after both actions in the pair have fired. Pair A synergy before Pair B synergy.

#### Scenario: Enemy turn
- **WHEN** player actions finish resolving
- **THEN** enemies execute intents as before (reactive intents read player state from this turn). All existing enemy mechanics (Retaliate, StrainScale, CopyAction, Charge, etc.) work unchanged.

#### Scenario: End of turn
- **WHEN** the enemy turn completes
- **THEN** block resets (unless persistent), damage reduction resets, push selections cleared, round increments. Second Wind buffs from Vent pairs apply for next turn.

### Requirement: Vent behavior in unified system

Vent occupies a slot like any other action but has special behavior.

#### Scenario: Vent toggled on
- **WHEN** Vent is toggled on during planning
- **THEN** all damage actions are skipped. Strain recovers by 4 (or 6 with upgrades). Heal/block/utility actions still fire. Vent costs 0 strain.

#### Scenario: Vent in a pair
- **WHEN** Vent is in a linked pair and is toggled on
- **THEN** Second Wind activates: linked action gains +3 base value next turn (even though this turn's damage is skipped)
