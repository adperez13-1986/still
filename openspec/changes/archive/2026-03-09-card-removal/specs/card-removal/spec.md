## ADDED Requirements

### Requirement: Shop recycler service
The shop SHALL offer a "Recycler" service that allows the player to remove one card from their deck for 60 shards. The recycler SHALL be available in every shop visit. There SHALL be no restriction on which cards can be removed and no minimum deck size.

#### Scenario: Player recycles a card
- **WHEN** the player taps "Recycle a card" in the shop and selects a card from the picker
- **THEN** the selected card is removed from the deck and 60 shards are deducted

#### Scenario: Player cannot afford recycler
- **WHEN** the player has fewer than 60 shards
- **THEN** the recycler button SHALL be visible but disabled (greyed out)

#### Scenario: Player cancels card selection
- **WHEN** the player opens the card picker but taps cancel
- **THEN** no card is removed and no shards are deducted

### Requirement: Card picker UI
The system SHALL provide a CardPicker modal component that displays all cards in the player's deck. The player SHALL tap a card to select it, then confirm the selection. The picker SHALL support a cancel action. The CardPicker SHALL be reusable by both shop and event flows.

#### Scenario: Card picker displays full deck
- **WHEN** the card picker is opened
- **THEN** all cards in the player's current deck are displayed using the standard CardDisplay component

#### Scenario: Card picker selection and confirmation
- **WHEN** the player taps a card in the picker
- **THEN** the card is highlighted as selected and a confirm button becomes available

### Requirement: Event card removal outcome
The event system SHALL support a `removeCard` outcome type. When an event choice with `removeCard` outcome is selected, the CardPicker SHALL open for the player to choose which card to remove.

#### Scenario: Event triggers card removal
- **WHEN** the player selects an event choice with `removeCard` outcome
- **THEN** the CardPicker opens and the player selects a card to remove from their deck

#### Scenario: Player cancels event card removal
- **WHEN** the CardPicker opens from an event and the player cancels
- **THEN** the card removal is skipped but the event choice still resolves (other effects still apply)
