## ADDED Requirements

### Requirement: Perpetual Core enables mid-turn reshuffle
Perpetual Core SHALL be a rare behavioral part that shuffles the discard pile into the draw pile when the draw pile is empty during a turn.

#### Scenario: Draw pile empties with Perpetual Core equipped
- **WHEN** a draw effect requests cards and the draw pile is empty and the discard pile is not empty and the player has Perpetual Core
- **THEN** the discard pile is shuffled into the draw pile and drawing continues

#### Scenario: Draw pile empties without Perpetual Core
- **WHEN** a draw effect requests cards and the draw pile is empty and the player does not have Perpetual Core
- **THEN** the remaining draws fizzle (no cards drawn for those remaining draws)

#### Scenario: Both piles empty
- **WHEN** a draw effect requests cards and both the draw pile and discard pile are empty
- **THEN** the draws fizzle regardless of whether Perpetual Core is equipped

### Requirement: Perpetual Core part definition
Perpetual Core SHALL be defined as a rare behavioral part with the following properties.

#### Scenario: Part attributes
- **WHEN** inspecting the Perpetual Core part definition
- **THEN** it has name "Perpetual Core", rarity "rare", trigger type "onDrawPileEmpty", and description "When your draw pile is empty, shuffle your discard pile back in."
