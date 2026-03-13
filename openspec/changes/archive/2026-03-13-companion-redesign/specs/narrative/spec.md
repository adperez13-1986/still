## MODIFIED Requirements

### Requirement: Yanah and Yuri as run companions (optional)
Yanah and Yuri SHALL be unlockable companion modifier cards acquired through special in-run events, not auto-added to the starting deck. Workshop unlock makes their event available during runs.

#### Scenario: Yanah companion modifier card
- **WHEN** the player plays the Yanah modifier card during the planning phase
- **THEN** Still gains 4 Block (8 Block while Cool). Heat cost: 0. Category: System (Cooling).

#### Scenario: Yuri companion modifier card
- **WHEN** the player plays the Yuri modifier card during the planning phase
- **THEN** Still deals 8 damage to one enemy (14 while Hot). Heat cost: +1. Category: System (Conditional).

#### Scenario: Unlocking companion modifier cards
- **WHEN** the player purchases a companion unlock in the Workshop
- **THEN** that companion's special event becomes available in the event pool for all future runs. The companion card is NOT auto-added to the starting deck.

## REMOVED Requirements

### Requirement: Companion auto-inclusion in starting deck
**Reason**: Companions are no longer auto-added to the starting deck on unlock. They are acquired mid-run through events, making them a meaningful choice rather than a passive upgrade.
**Migration**: Remove companion deck injection from run initialization (`RunScreen.tsx`). Workshop unlock now gates event availability instead of deck inclusion.
