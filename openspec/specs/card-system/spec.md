## ADDED Requirements

### Requirement: Cards are Still's combat actions
Cards SHALL represent actions Still can take during combat. Each card has an energy cost, a type (Attack, Skill, Power), and one or more effects. Cards are played from the hand during the player's turn.

#### Scenario: Playing a card
- **WHEN** the player plays a card from their hand
- **THEN** the card's energy cost is deducted, its effect is applied, and it moves to the discard pile (unless it has the Exhaust keyword)

#### Scenario: Card types differ in function
- **WHEN** an Attack card is played
- **THEN** it deals damage to one or more enemies

- **WHEN** a Skill card is played
- **THEN** it applies a non-damage effect (block, buffs, debuffs, card draw)

- **WHEN** a Power card is played
- **THEN** it applies a permanent effect for the rest of combat and is removed from play

### Requirement: Deck, draw pile, hand, and discard pile
The card system SHALL maintain four distinct card zones. Cards cycle through them during combat.

#### Scenario: Drawing cards at turn start
- **WHEN** the player's turn begins
- **THEN** they draw cards from the draw pile up to their hand size limit (default: 5)

#### Scenario: Draw pile exhausted
- **WHEN** the draw pile is empty and cards must be drawn
- **THEN** the discard pile is shuffled and becomes the new draw pile

#### Scenario: Hand limit
- **WHEN** the player has 10 cards in hand
- **THEN** additional drawn cards are discarded immediately (burned)

### Requirement: Starting deck
Every run SHALL begin with the same standard starting deck: a small set of basic Attack and Skill cards sufficient to survive early encounters but leaving clear room for growth.

#### Scenario: Run begins with standard deck
- **WHEN** a new run starts
- **THEN** Still's deck contains exactly: 5x Strike (Attack, 1 energy, deal 6 damage), 4x Brace (Skill, 1 energy, gain 5 Block), 1x Surge (Skill, 0 energy, draw 2 cards)

### Requirement: Card acquisition from enemies
After defeating enemies, the player SHALL be offered a card reward from a pool relevant to the enemy type and current act.

#### Scenario: Post-combat card reward
- **WHEN** a combat room is cleared
- **THEN** the player is shown 3 cards and may choose one to add to their deck, or skip

#### Scenario: Skipping a card reward
- **WHEN** the player skips a card reward
- **THEN** no card is added, and a small amount of shards (run currency) is awarded instead

### Requirement: Card upgrades
Cards in the player's deck SHALL be upgradeable at rest rooms, improving their effects.

#### Scenario: Upgrading a card at rest
- **WHEN** the player chooses to upgrade at a rest room
- **THEN** they select one card from their deck; the card is permanently enhanced for the rest of the run (higher damage, lower cost, or additional effect)

### Requirement: Exhaust keyword
Some cards SHALL have the Exhaust keyword, meaning they are removed from the run entirely after being played once.

#### Scenario: Exhausted card removed
- **WHEN** a card with the Exhaust keyword is played
- **THEN** it is placed in a separate exhaust zone and does not return to the draw pile or discard pile for the rest of the run
