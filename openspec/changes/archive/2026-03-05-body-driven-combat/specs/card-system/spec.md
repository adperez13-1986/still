## REMOVED Requirements

### Requirement: Cards are Still's combat actions
**Reason**: Cards are no longer standalone combat actions. They are modifier/subroutine cards that alter body actions. The new card system is defined in the `modifier-cards` capability.
**Migration**: All card definitions in `data/cards.ts` are replaced with modifier card definitions. Card types (Attack/Skill/Power) and energy costs are removed. See `modifier-cards` spec for the new card system.

### Requirement: Starting deck
**Reason**: The starting deck of Strike/Brace/Surge is replaced by a starting modifier deck. The new starting deck is defined in the `modifier-cards` capability.
**Migration**: Starting deck is now 8 modifier cards (3x Boost, 2x Emergency Strike, 2x Coolant Flush, 1x Diagnostics). See `modifier-cards` spec.

## MODIFIED Requirements

### Requirement: Deck, draw pile, hand, and discard pile
The card system SHALL maintain four distinct card zones for modifier cards. Cards cycle through them during combat.

#### Scenario: Drawing cards at turn start
- **WHEN** the player's turn begins
- **THEN** they draw modifier cards from the draw pile up to their hand size limit (default: 4)

#### Scenario: Draw pile exhausted
- **WHEN** the draw pile is empty and cards must be drawn
- **THEN** the discard pile is shuffled and becomes the new draw pile

#### Scenario: Hand limit
- **WHEN** the player has 10 cards in hand
- **THEN** additional drawn cards are discarded immediately (burned)

### Requirement: Card acquisition from enemies
After defeating enemies, the player SHALL be offered a modifier card reward from a pool relevant to the current act.

#### Scenario: Post-combat card reward
- **WHEN** a combat room is cleared
- **THEN** the player is shown 3 modifier cards and may choose one to add to their deck, or skip

#### Scenario: Skipping a card reward
- **WHEN** the player skips a card reward
- **THEN** no card is added, and a small amount of shards is awarded instead

### Requirement: Card upgrades
Modifier cards in the player's deck SHALL be upgradeable at rest rooms, improving their effects.

#### Scenario: Upgrading a card at rest
- **WHEN** the player chooses to upgrade at a rest room
- **THEN** they select one modifier card from their deck; the card is permanently enhanced for the rest of the run (lower Heat cost, increased effect, or added secondary effect)

### Requirement: Exhaust keyword
Some modifier cards SHALL have the Exhaust keyword, meaning they are removed from the cycle after being played once.

#### Scenario: Exhausted card removed
- **WHEN** a modifier card with the Exhaust keyword is played
- **THEN** it is placed in a separate exhaust zone and does not return to the draw pile or discard pile for the rest of combat (exhausted cards return to the deck for the next combat encounter)
