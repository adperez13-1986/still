## ADDED Requirements

### Requirement: Post-combat reward choice

After a combat victory, the game SHALL present a reward screen with up to two options: one growth reward and one comfort reward. The player MUST pick exactly one.

#### Scenario: Victory transitions to reward screen
- **WHEN** all enemies are defeated
- **THEN** the combat phase transitions to `reward` and the reward choice screen is displayed

#### Scenario: Two options presented
- **WHEN** the reward screen is displayed and growth rewards are available and affordable
- **THEN** the screen shows one growth option (left) and one comfort option (right)

#### Scenario: Growth unavailable due to high strain
- **WHEN** the player's current strain + the growth reward's strain cost would reach 20 or above
- **THEN** the growth option is not offered (greyed out or absent). Only comfort is available.

#### Scenario: Growth pool exhausted
- **WHEN** the player has already acquired all available growth rewards
- **THEN** only comfort is offered. This is expected in late-run after heavy investment.

#### Scenario: Player selects a reward
- **WHEN** the player taps/clicks a reward option
- **THEN** the reward is applied immediately, the reward screen closes, and the player returns to the map

### Requirement: Growth reward strain cost

Growth rewards SHALL cost strain to accept. The strain cost is paid on the reward screen, not during combat.

#### Scenario: Growth reward accepted
- **WHEN** the player selects a growth reward with strain cost N
- **THEN** strain increases by N. The growth reward is added to the player's run state.

#### Scenario: Strain cost displayed
- **WHEN** the reward screen is displayed with a growth option
- **THEN** the growth option shows its strain cost and the player's projected strain after taking it

### Requirement: Comfort reward is free

Comfort rewards SHALL cost 0 strain.

#### Scenario: Comfort reward accepted
- **WHEN** the player selects a comfort reward
- **THEN** the effect is applied immediately with no strain cost

### Requirement: Comfort option is contextual

The comfort reward offered SHALL be based on the player's current needs.

#### Scenario: Low HP
- **WHEN** the player's HP is below 50% of max health
- **THEN** the comfort option is Heal

#### Scenario: High strain
- **WHEN** the player's HP is at or above 50% AND strain is at or above 10
- **THEN** the comfort option is Relief (strain reduction)

#### Scenario: Neither urgent
- **WHEN** the player's HP is at or above 50% AND strain is below 10
- **THEN** the comfort option is a Companion moment (strain reduction + narrative text)
