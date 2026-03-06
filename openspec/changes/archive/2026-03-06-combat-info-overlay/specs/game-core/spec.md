## ADDED Requirements

### Requirement: Run info accessible during combat
The player SHALL be able to view their full deck, equipment slots, and parts during combat via the existing RunInfoOverlay.

#### Scenario: Player opens info overlay during combat
- **WHEN** the player taps the "Info" button during combat
- **THEN** the RunInfoOverlay opens showing the equips tab (equipment, carried part, parts)

#### Scenario: Player views deck during combat
- **WHEN** the RunInfoOverlay is open during combat and the player switches to the deck tab
- **THEN** the full deck is displayed (all cards in deck, not just current hand)

#### Scenario: Closing the overlay returns to combat
- **WHEN** the player closes the RunInfoOverlay during combat
- **THEN** they return to the combat screen in the same state they left it
