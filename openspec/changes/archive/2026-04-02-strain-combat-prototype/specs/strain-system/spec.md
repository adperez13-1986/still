## ADDED Requirements

### Requirement: Strain meter

The game SHALL track a strain value (integer, 0-20) that represents the player's accumulated pressure. Strain accumulates during combat from pushing slots and using abilities. Strain does NOT reset between turns or between encounters within a run (but decays passively between combats).

#### Scenario: Strain initialized at run start
- **WHEN** a new run begins
- **THEN** strain is set to 2

#### Scenario: Strain persists between turns
- **WHEN** a combat turn ends and the next turn begins
- **THEN** strain retains its current value (no reset)

#### Scenario: Strain persists between encounters
- **WHEN** a combat encounter ends (victory or forfeit) and the player enters a new encounter
- **THEN** strain retains its value from the end of the previous encounter, minus passive decay

#### Scenario: Passive strain decay between combats
- **WHEN** a combat encounter ends with victory
- **THEN** strain decays by 2 (minimum 0) before the next encounter begins

#### Scenario: Strain increases from pushing
- **WHEN** the player pushes a slot during the planning phase
- **THEN** strain increases by the slot's `pushCost` value (currently 1 per slot)

#### Scenario: Strain increases from abilities
- **WHEN** the player activates a strain-costing ability (Repair, Brace)
- **THEN** strain increases by that ability's `strainCost`

#### Scenario: Strain decreases from venting
- **WHEN** the player activates Vent
- **THEN** strain decreases by 4 (VENT_STRAIN_RECOVERY). Minimum 0.

#### Scenario: Strain cannot exceed max
- **WHEN** strain would increase beyond `maxStrain` (20)
- **THEN** strain is capped at 20 and the strain-20 forfeit triggers

### Requirement: Strain 20 forfeit

When strain reaches 20 during combat, the player gives up on the current fight. This is NOT a game over — the run continues.

#### Scenario: Strain reaches 20
- **WHEN** strain reaches 20 at any point during combat (after push/ability selection)
- **THEN** combat ends immediately with a forfeit outcome

#### Scenario: Forfeit outcome
- **WHEN** combat ends via strain 20 forfeit
- **THEN** the player receives no combat rewards. HP is unchanged. The run continues. Strain drops to 14 (70% of max) after forfeiting.

#### Scenario: Forfeit does not end the run
- **WHEN** combat ends via strain 20 forfeit
- **THEN** the player returns to the map and can continue navigating

### Requirement: Forfeit warning

The player SHALL be warned before confirming selections that would trigger forfeit.

#### Scenario: Push would reach 20
- **WHEN** the player's push/ability selections would bring strain to 20 or above
- **THEN** display a warning. The Execute button changes to "Push to Breaking Point". The player can confirm (triggering forfeit) or adjust their selections.
