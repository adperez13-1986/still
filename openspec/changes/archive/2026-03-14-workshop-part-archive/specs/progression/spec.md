## MODIFIED Requirements

### Requirement: Workshop upgrades improve starting conditions
Workshop upgrades SHALL affect Still's starting state in future runs, adapted for the body-driven combat model. The Workshop serves as a hub for the Part Archive and upgrade purchases. The run state SHALL include an `equipPity` counter for equipment drop bad luck protection.

#### Scenario: Starting deck upgrade
- **WHEN** the player purchases a "Practiced Routine" upgrade
- **THEN** all future runs begin with one additional modifier card from the Sector 1 pool already in the starting deck (randomly selected at run start)

#### Scenario: Shard bonus upgrade
- **WHEN** the player purchases a "Sharp Eye" upgrade
- **THEN** all future runs earn a percentage bonus on shard drops

#### Scenario: Extra Slot upgrade adds starting Torso
- **WHEN** the player purchases an "Extra Slot" upgrade
- **THEN** all future runs begin with a basic TORSO equipment item (Scrap Plating) pre-equipped in addition to the starting Arms, giving the player defensive block from body actions

#### Scenario: Quick Recovery upgrade reduces archive cooldown
- **WHEN** the player purchases a "Quick Recovery" upgrade
- **THEN** all future archive cooldowns are reduced by 1 (parts go on cooldown for 2 runs instead of 3 after a win)

#### Scenario: Equipment pity initialized at run start
- **WHEN** a new run begins
- **THEN** the run state SHALL include `equipPity: 0` to track equipment drop bad luck protection

## REMOVED Requirements

### Requirement: Idle resource generation
**Reason**: The fragment system (idle accumulation + pre-run spending) is a mobile retention mechanic that doesn't fit a single-player roguelike. Players ignore it or always buy the same overpowered bonus. Removing it simplifies the pre-run flow and eliminates a balance-warping system.
**Migration**: Fragment state (`fragmentsAccumulated`, `lastSeenTimestamp`) is discarded on load. The Fragment Reservoir upgrade is removed. The FragmentScreen route and component are deleted. Pre-run flow changes from Workshop → Fragment Screen → Run to Workshop → Run.
