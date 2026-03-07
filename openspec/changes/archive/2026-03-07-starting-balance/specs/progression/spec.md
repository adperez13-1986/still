## MODIFIED Requirements

### Requirement: Workshop upgrades improve starting conditions
Workshop upgrades SHALL affect Still's starting state in future runs, adapted for the body-driven combat model. In addition to permanent upgrades, the Workshop serves as a hub for spending permanent shards on maintenance actions such as repairing a broken carried part. The run state SHALL include an `equipPity` counter for equipment drop bad luck protection.

#### Scenario: Starting deck upgrade
- **WHEN** the player purchases a "Practiced Routine" upgrade
- **THEN** all future runs begin with one additional modifier card from the Act 1 pool already in the starting deck (randomly selected at run start)

#### Scenario: Shard bonus upgrade
- **WHEN** the player purchases a "Sharp Eye" upgrade
- **THEN** all future runs earn a percentage bonus on shard drops

#### Scenario: Fragment reservoir upgrade
- **WHEN** the player purchases a "Fragment Reservoir" upgrade
- **THEN** the offline fragment accumulation cap is extended by 50%

#### Scenario: Extra Slot upgrade adds starting Torso
- **WHEN** the player purchases an "Extra Slot" upgrade
- **THEN** all future runs begin with a basic TORSO equipment item (Scrap Plating) pre-equipped in addition to the starting Arms, giving the player defensive block from body actions

#### Scenario: Permanent shards used for carried part repair
- **WHEN** the player has a broken carried part and enough permanent shards
- **THEN** the Workshop allows spending permanent shards to repair the carried part, providing a shard sink beyond one-time upgrades

#### Scenario: Equipment pity initialized at run start
- **WHEN** a new run begins
- **THEN** the run state SHALL include `equipPity: 0` to track equipment drop bad luck protection

## REMOVED Requirements

### Requirement: Starting health upgrade (Reinforced Chassis)
**Reason**: Permanent +15 max HP trivializes early runs. Fragment bonuses provide sufficient per-run health adjustment.
**Migration**: Remove upgrade from workshop, type union, default state, and cost table. Existing saves with the flag are unaffected (flag is simply unused).
