## MODIFIED Requirements

### Requirement: Event outcome types
Event choices SHALL support the following outcome types: `health`, `shards`, `card`, `status`, and `removeCard`. The `removeCard` outcome type SHALL open the CardPicker for the player to select which card to remove from their deck.

#### Scenario: removeCard outcome handling
- **WHEN** the player selects an event choice with outcome type `removeCard`
- **THEN** the CardPicker modal opens and the player selects a card to remove

## ADDED Requirements

### Requirement: Card removal events
The event pools SHALL include events that offer card removal as a choice. These events SHALL present removal as part of a narrative tradeoff, not as a free service.

#### Scenario: Sector 1 card removal event
- **WHEN** the player encounters "The Sorting" event in Sector 1
- **THEN** they are offered a choice between removing a card or gaining shards

#### Scenario: Sector 2 card removal event
- **WHEN** the player encounters "Letting Go" event in Sector 2
- **THEN** they are offered a choice between removing a card (with a health bonus) or gaining shards
