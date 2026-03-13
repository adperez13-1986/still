## MODIFIED Requirements

### Requirement: Deck zones persist from previous system
The modifier deck SHALL maintain four zones: draw pile, hand, discard pile, and exhaust pile.

#### Scenario: Drawing modifiers at turn start
- **WHEN** the player's turn begins
- **THEN** if the draw pile has fewer cards than the hand draw count, the discard pile is shuffled into the draw pile first, then cards are drawn up to hand size (default: 4)

#### Scenario: Draw pile empty mid-turn
- **WHEN** a draw effect requests cards during a turn and the draw pile is empty
- **THEN** the draws fizzle unless a part (such as Perpetual Core) triggers a reshuffle

#### Scenario: Hand limit
- **WHEN** the player has 10 modifier cards in hand
- **THEN** additional drawn cards are discarded immediately
