# Reward Choices

## Purpose

After combat victory, the player is offered a choice between growth rewards (card/part/equipment drops, costs strain) and a comfort reward (heal/relief/companion, free). There is no separate slot placement step — drops integrate via the deckbuilder's normal flow (cards into the deck, parts into the parts list, equipment into the matching body slot).

## Requirements

### Requirement: Post-combat reward choice

After combat victory, the player chooses one growth reward (card/part/equipment, costs strain) OR one comfort reward (heal/relief/companion, free). No slot placement step (there are no action slots).

#### Scenario: Reward screen layout
- **WHEN** the reward screen appears
- **THEN** it shows up to 3 growth options (cards/parts/equipment) and 1 comfort option, with strain cost shown for each growth

#### Scenario: Growth taken
- **WHEN** the player selects a growth reward
- **THEN** the item is added to the run (card → deck, part → parts list, equipment → replaces matching body slot, with displaced equipment returned if any), strain increases by the tier cost, and the run continues to the next map room

#### Scenario: Comfort taken
- **WHEN** the player selects a comfort reward
- **THEN** the comfort effect applies (heal/relief/companion) and the run continues

#### Scenario: Equipment displacement
- **WHEN** growth gives an equipment piece and the matching body slot is already filled
- **THEN** the old equipment is displaced; the player can choose to keep the new item or discard it in favor of the old one
