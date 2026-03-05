## MODIFIED Requirements

### Requirement: Workshop upgrades improve starting conditions
Workshop upgrades SHALL affect Still's starting state in future runs, adapted for the body-driven combat model.

#### Scenario: Starting health upgrade
- **WHEN** the player purchases a "Reinforced Chassis" upgrade
- **THEN** all future runs begin with increased max health (+15)

#### Scenario: Starting deck upgrade
- **WHEN** the player purchases a "Practiced Routine" upgrade
- **THEN** all future runs begin with one additional modifier card from the Act 1 pool already in the starting deck (randomly selected at run start)

#### Scenario: Shard bonus upgrade
- **WHEN** the player purchases a "Sharp Eye" upgrade
- **THEN** all future runs earn a percentage bonus on shard drops

#### Scenario: Fragment reservoir upgrade
- **WHEN** the player purchases a "Fragment Reservoir" upgrade
- **THEN** the offline fragment accumulation cap is extended by 50%

#### Scenario: Extra Slot upgrade replaces starting equipment
- **WHEN** the player purchases an "Extra Slot" upgrade
- **THEN** all future runs begin with a basic ARMS equipment item (Piston Arm) pre-equipped in addition to the starting Torso, giving the player a damage-dealing body action from the start

### Requirement: Idle resource generation
The Workshop SHALL passively generate a secondary resource (Fragments) over real time at a rate of 10 per hour, whether the game is open or closed. Accumulation is capped (default 8 hours, extendable via upgrade).

#### Scenario: Fragments accumulate while offline
- **WHEN** the player returns to the game after being away
- **THEN** the Workshop displays how many Fragments were generated during the absence, capped at the maximum accumulation amount

#### Scenario: Fragments accumulate while playing
- **WHEN** the player has the game open
- **THEN** the fragment counter increments in real time at the same rate as offline accumulation (1 fragment per 6 minutes), without requiring a page reload

#### Scenario: Fragments spent on run bonuses
- **WHEN** the player spends Fragments before starting a run
- **THEN** the run begins with a bonus (e.g., an extra card choice, a starting part, or bonus shards)

## REMOVED Requirements

### Requirement: Idle resource generation (energyCap Fragment bonus)
**Reason**: The "Overcharged" Fragment bonus (+1 max energy) is removed because the energy system no longer exists. Heat replaces energy as the central resource.
**Migration**: The energyCap Fragment bonus is replaced with a "Cooled Start" bonus — begin combat with +1 passive cooling for the first 3 turns (cool 3 Heat per turn instead of 2). The `FragmentBonusType` enum replaces `energyCap` with `passiveCooling`. The Fragment screen shows "Cooled Start" in place of "Overcharged."
