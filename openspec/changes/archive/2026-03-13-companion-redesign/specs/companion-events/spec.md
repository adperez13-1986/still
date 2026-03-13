## ADDED Requirements

### Requirement: Companion event definitions
The event system SHALL include special companion events for Yanah and Yuri. Each companion event has a unique narrative vignette with two choices: accept (companion joins) or decline (lesser reward).

#### Scenario: Yanah companion event
- **WHEN** a Yanah companion event triggers
- **THEN** the event SHALL display a vignette of finding Yanah in a quiet place, tending a garden. She says "I knew you'd come." The accept choice adds the Yanah card to the player's deck. The decline choice heals 10 HP with a warm farewell.

#### Scenario: Yuri companion event
- **WHEN** a Yuri companion event triggers
- **THEN** the event SHALL display a vignette of finding Yuri fighting something recklessly. He grins: "Took you long enough." The accept choice adds the Yuri card to the player's deck. The decline choice heals 10 HP with a warm farewell.

### Requirement: Companion event triggering
Companion events SHALL only appear when the corresponding companion is unlocked in the Workshop and has not yet been acquired during the current run.

#### Scenario: Unlocked companion available
- **WHEN** the player enters an event room AND at least one companion is Workshop-unlocked but not yet in the player's deck this run
- **THEN** there SHALL be a 30% chance of triggering a companion event instead of a regular sector event

#### Scenario: Companion already acquired this run
- **WHEN** the player has already acquired a companion's card during this run
- **THEN** that companion's event SHALL NOT appear again

#### Scenario: No companions unlocked
- **WHEN** the player has not unlocked any companions in the Workshop
- **THEN** companion events SHALL NOT appear and regular sector events trigger normally

### Requirement: Companion outcome type
The event system SHALL support a `companion` outcome type that adds a companion modifier card to the player's deck mid-run.

#### Scenario: Companion outcome resolved
- **WHEN** a player selects the accept choice on a companion event
- **THEN** the system SHALL create a card instance of the companion card and add it to the player's run deck, and the companion SHALL be marked as acquired for this run

#### Scenario: Companion decline outcome
- **WHEN** a player selects the decline choice on a companion event
- **THEN** the player SHALL receive a health reward and no card is added

### Requirement: Redesigned Yanah card
The Yanah companion modifier card SHALL be redesigned as a Cool Runner archetype card.

#### Scenario: Yanah card base effect
- **WHEN** the Yanah card is played during planning phase
- **THEN** Still SHALL gain 4 Block. Heat cost: 0.

#### Scenario: Yanah card Cool bonus
- **WHEN** the Yanah card is played while Still is in the Cool heat zone (0-3)
- **THEN** Still SHALL gain 8 Block instead of 4. Heat cost: 0.

### Requirement: Redesigned Yuri card
The Yuri companion modifier card SHALL be redesigned as a Pyromaniac archetype card.

#### Scenario: Yuri card base effect
- **WHEN** the Yuri card is played during planning phase
- **THEN** Still SHALL deal 8 damage to one enemy. Heat cost: +1.

#### Scenario: Yuri card Hot bonus
- **WHEN** the Yuri card is played while Still is in the Hot heat zone (7-9)
- **THEN** Still SHALL deal 14 damage to one enemy instead of 8. Heat cost: +1.
