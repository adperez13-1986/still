## MODIFIED Requirements

### Requirement: Player carries one part across runs
At the end of every run, any new behavioral parts collected during the run SHALL be automatically added to the persistent Part Archive. The player selects which archived part to carry before starting the next run from the Workshop, not at run end.

#### Scenario: End-of-run archive update
- **WHEN** a run ends (victory or defeat)
- **THEN** all behavioral parts collected during the run that are not already in the archive are added with their sector of origin and cooldown 0

#### Scenario: No end-of-run carry choice
- **WHEN** a run ends and the carry select overlay would have appeared
- **THEN** the overlay shows which parts were added to the archive (notification only, not a selection)

#### Scenario: Carry selection happens at Workshop
- **WHEN** the player is at the Workshop before starting a run
- **THEN** the Part Archive is displayed and the player may select one part to carry

### Requirement: Carried part loads at run start
When a run begins, the selected archive part SHALL be loaded into the player's part inventory. If the part's origin sector is ahead of the starting sector, the part is loaded but inert until that sector is reached.

#### Scenario: Matching sector part active at run start
- **WHEN** a new run begins and the selected archive part is from Sector 1
- **THEN** the part's behavioral trigger is active from the first combat

#### Scenario: Higher sector part inert at run start
- **WHEN** a new run begins and the selected archive part is from Sector 2
- **THEN** the part appears in the parts display as inert with an "Activates in Sector 2" indicator, and its trigger does not fire

#### Scenario: Part activates on reaching its sector
- **WHEN** the player advances to the sector matching the carried part's origin
- **THEN** the part becomes active and its trigger fires normally from that point forward

## REMOVED Requirements

### Requirement: Carried part has durability
**Reason**: Durability was removed in a prior change (drop-part-durability) because it was annoying rather than challenging. Parts are now permanent.
**Migration**: Already completed — `CarriedPart` type changed from interface with durability fields to plain string. Legacy saves migrated by extracting `.partId`.

### Requirement: Broken carried part is visible in the Equips overlay
**Reason**: No durability means no broken state.
**Migration**: Already completed — broken display logic removed from RunInfoOverlay.

### Requirement: Carried part can be repaired at the Workshop
**Reason**: No durability means no repair mechanic.
**Migration**: Already completed — repair UI and cost removed from WorkshopScreen and ShopScreen.
