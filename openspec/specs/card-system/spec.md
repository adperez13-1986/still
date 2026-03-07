## REMOVED Requirements

### Requirement: Cards are Still's combat actions
**Reason**: Cards are no longer standalone combat actions. They are modifier/subroutine cards that alter body actions. The new card system is defined in the `modifier-cards` capability.
**Migration**: All card definitions in `data/cards.ts` are replaced with modifier card definitions. Card types (Attack/Skill/Power) and energy costs are removed. See `modifier-cards` spec for the new card system.

### Requirement: Starting deck
**Reason**: The starting deck of Strike/Brace/Surge is replaced by a starting modifier deck. The new starting deck is defined in the `modifier-cards` capability.
**Migration**: Starting deck is now 8 modifier cards (3x Boost, 2x Emergency Strike, 2x Coolant Flush, 1x Diagnostics). See `modifier-cards` spec.

## ADDED Requirements

### Requirement: Modifier cards can have heat-conditional bonus effects
Some modifier cards SHALL have bonus effects that activate when Still is at a specific heat threshold. Unlike `heatCondition` (which gates playability), heat bonuses enhance the card's effect while remaining playable at any heat level.

#### Scenario: Card played at matching threshold
- **WHEN** a modifier card with a heat bonus is played while Still is at or above the bonus threshold
- **THEN** the enhanced version of the effect activates (e.g., higher damage, extra draw)

#### Scenario: Card played outside matching threshold
- **WHEN** a modifier card with a heat bonus is played while Still is below the bonus threshold
- **THEN** the base version of the effect activates (card is still playable)

### Requirement: Act 1 card pool includes archetype-seeding cards
The Act 1 modifier card pool SHALL include cards that reward specific heat zones, seeding the Cool Runner, Pyromaniac, and Oscillator archetypes.

#### Scenario: Cool Runner cards in Act 1 pool
- **WHEN** the Act 1 card pool is assembled
- **THEN** it SHALL include Precision Strike (0 heat, deal 8 damage, 12 while Cool) and Cold Efficiency (0 heat, draw 2, draw 3 while Cool)

#### Scenario: Pyromaniac cards in Act 1 pool
- **WHEN** the Act 1 card pool is assembled
- **THEN** it SHALL include Fuel the Fire (+1 heat, deal 6 damage, gain 4 Block while Hot) and Reckless Charge (+3 heat, deal 18 damage, Exhaust)

#### Scenario: Oscillator cards in Act 1 pool
- **WHEN** the Act 1 card pool is assembled
- **THEN** it SHALL include Thermal Flux (-2 heat, deal damage equal to total heat change this turn) and Overclock (+2 heat, gain 1 Strength, gain 2 instead if a threshold was crossed this turn)

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
