# Growth Rewards

## Purpose

After combat victory, the player can take growth rewards (cards, parts, or equipment from the deckbuilder drop pools) at a strain cost, or comfort rewards (heal, strain relief, or companion moment) for free.

## Requirements

### Requirement: Growth rewards are cards, parts, or equipment

Growth rewards SHALL offer card/part/equipment drops from the existing weighted reward pools. Taking a growth reward accrues strain proportional to the item's rarity tier.

#### Scenario: Growth reward offered
- **WHEN** the reward screen displays growth options
- **THEN** up to 3 growth options are shown: each is a card, part, or equipment drop (weighted by the run's sector and existing drop tables)

#### Scenario: Strain cost by tier
- **WHEN** the player accepts a growth reward
- **THEN** strain increases by: 2 for common, 3 for uncommon, 4 for rare

#### Scenario: Growth unavailable at high strain
- **WHEN** the player's current strain + any growth option's tier cost would reach 20
- **THEN** that specific growth option is greyed out (cannot select). If all growth options are greyed out, the screen shows only comfort options.

### Requirement: Comfort rewards unchanged

Comfort options remain the same as the current implementation: Heal (+8 HP), Relief (-4 strain), Companion moment (-2 strain + narrative).

#### Scenario: Comfort selection
- **WHEN** the player picks a comfort reward
- **THEN** the selected effect applies and the run continues
