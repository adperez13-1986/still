## Requirements

### Requirement: Yanah and Yuri are event-gated companions
Yanah and Yuri SHALL be unlockable companion modifier cards acquired through in-run events, not automatically included in the starting deck.

#### Scenario: Companion Workshop unlock
- **WHEN** the player purchases a companion unlock in the Workshop (80 shards each)
- **THEN** that companion becomes eligible for event encounters in future runs

#### Scenario: Companion event trigger
- **WHEN** the player enters an Event room and has unlocked but not yet acquired a companion this run
- **THEN** there is a chance the companion event triggers, offering recruitment

#### Scenario: Accepting a companion
- **WHEN** the player chooses to recruit a companion during their event
- **THEN** the companion's modifier card is added to the deck and the companion is marked as acquired for this run

#### Scenario: Declining a companion
- **WHEN** the player declines to recruit a companion
- **THEN** the player receives health instead and the companion event can still appear later in the run

### Requirement: Yanah companion card
Yanah SHALL be a system modifier card with a Cool-aligned bonus.

#### Scenario: Yanah base effect
- **WHEN** the player plays the Yanah card
- **THEN** Still gains 4 Block. Heat cost: 0.

#### Scenario: Yanah Cool bonus
- **WHEN** the player plays the Yanah card while Cool (heat 0-3)
- **THEN** Still gains 8 Block instead of 4

### Requirement: Yuri companion card
Yuri SHALL be a system modifier card with a Hot-aligned bonus.

#### Scenario: Yuri base effect
- **WHEN** the player plays the Yuri card
- **THEN** Still deals 8 damage to one enemy. Heat cost: 1.

#### Scenario: Yuri Hot bonus
- **WHEN** the player plays the Yuri card while Hot (heat 7-9)
- **THEN** Still deals 14 damage instead of 8
