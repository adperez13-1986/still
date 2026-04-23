# Growth Rewards

## Purpose

After combat victory, the player can take growth rewards (findable actions) at a strain cost, or comfort rewards (heal, strain relief, or companion moment) for free.

## Requirements

### Requirement: Growth rewards are new actions

Growth rewards SHALL offer findable actions from the action pool. The player takes the action and decides where to slot it.

#### Scenario: Growth reward offered
- **WHEN** the reward screen displays a growth option
- **THEN** it shows a findable action with its type, base/pushed values, and strain cost to take

#### Scenario: Growth reward accepted
- **WHEN** the player accepts a growth reward
- **THEN** strain increases by the action's take cost (3-5). The player chooses which slot to place it in (replacing an existing action if all slots full). The slot arrangement screen appears.

#### Scenario: Growth unavailable
- **WHEN** the player's strain + action cost would reach 20
- **THEN** the growth option is greyed out. Only comfort is available.

#### Scenario: Multiple growth options
- **WHEN** the reward screen is displayed
- **THEN** up to 3 findable actions are offered (from the unacquired pool), sorted by type variety. Player picks one or chooses comfort.
