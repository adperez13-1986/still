## MODIFIED Requirements

### Requirement: Workshop upgrades improve starting conditions
Workshop upgrades SHALL affect Still's starting state in future runs, adapted for the body-driven combat model. In addition to permanent upgrades, the Workshop serves as a hub for spending permanent shards on maintenance actions such as repairing a broken carried part. The run state SHALL include an `equipPity` counter for equipment drop bad luck protection.

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

#### Scenario: Permanent shards used for carried part repair
- **WHEN** the player has a broken carried part and enough permanent shards
- **THEN** the Workshop allows spending permanent shards to repair the carried part, providing a shard sink beyond one-time upgrades

#### Scenario: Equipment pity initialized at run start
- **WHEN** a new run begins
- **THEN** the run state SHALL include `equipPity: 0` to track equipment drop bad luck protection
