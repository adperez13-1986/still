## Card System

### Requirement: Modifier card definition

Modifier cards SHALL have the following fields:
- `id`, `name`, `description`, `energyCost`, `category`, `keywords`
- Optional `freePlay` flag (plays instantly, doesn't occupy a slot)
- Optional `upgraded` variant
- Optional `pushCost` (number): additional strain cost to push the card
- Optional `pushedEffect` (SlotModifierEffect): replaces the base effect when the card is pushed

#### Scenario: Non-pushable card
- **WHEN** a card is defined without `pushCost` or `pushedEffect`
- **THEN** it plays with its base effect only; no push toggle appears in the UI

#### Scenario: Pushable card
- **WHEN** a card is defined with both `pushCost` and `pushedEffect`
- **THEN** the UI shows a push toggle; pushing replaces `category.effect` with `pushedEffect` and charges `pushCost` strain on top of `energyCost`

### Requirement: Initial pushable card set

The initial card pool SHALL contain between 10 and 15 pushable cards, spread across modifier categories (amplify, override, repeat, feedback, retaliate, redirect). Each pushable card SHALL have push costs in the 1–2 strain range.

#### Scenario: Initial pushable coverage
- **WHEN** a run begins
- **THEN** the card pool contains pushable versions of at least Overcharge, Meltdown, Reckless Charge, Fortify, Shield Bash, Feedback, Thermal Surge, Spread Shot, Emergency Shield, Deep Freeze, Retaliate, and Echo Protocol (12 minimum)

#### Scenario: Push costs are bounded
- **WHEN** a pushable card is defined
- **THEN** `pushCost` is between 1 and 2 (inclusive)

### Requirement: Vent as a starter card

A Vent card SHALL be included in the starting deck. It has `energyCost` 0, `Innate` keyword, and applies a strain-recovery effect when played.

#### Scenario: Vent in starting deck
- **WHEN** a new run begins
- **THEN** the starting deck contains exactly one Vent card

#### Scenario: Vent draws first turn
- **WHEN** the first combat turn begins
- **THEN** Vent is guaranteed to be in the opening hand (Innate keyword)

### Requirement: Cards are modifier cards with energy costs

All cards in the player's deck are modifier cards (software subroutines). Each card has an `energyCost` (a non-negative integer) that is deducted from the player's energy pool when played. There are no heat costs or heat thresholds.

#### Scenario: Playing a card deducts energy
- **WHEN** the player plays a modifier card with `energyCost: N`
- **THEN** `currentEnergy` is reduced by N

#### Scenario: Unassigning a slot modifier refunds energy
- **WHEN** the player unassigns a slot modifier during the planning phase
- **THEN** `currentEnergy` is increased by the card's `energyCost` (capped at `maxEnergy`)

### Requirement: Draw count

The base draw count is 3 cards per turn. HEAD equipment adds bonus draw on top of the base.

#### Scenario: Drawing cards at turn start
- **WHEN** a new turn starts
- **THEN** the player draws `drawCount` (base 3) + HEAD equipment draw bonus + Inspired bonus cards from the draw pile

#### Scenario: HEAD equipment bonus draw
- **WHEN** the player has a HEAD equipment with a `draw` action and the Head slot is not disabled
- **THEN** the HEAD equipment's `baseValue` is added to the turn's draw count

### Requirement: Deck zones

The card system maintains four distinct zones: draw pile, hand, discard pile, and exhaust pile.

#### Scenario: Combat initialization
- **WHEN** combat begins
- **THEN** the full deck is shuffled into the draw pile, and `drawCount` cards are drawn into the hand (capped at 10)

#### Scenario: Drawing when draw pile is insufficient
- **WHEN** cards must be drawn and the draw pile has fewer cards than needed
- **THEN** the discard pile is shuffled into the draw pile first, then drawing continues. If both piles are empty, remaining draws fizzle.

#### Scenario: Mid-turn draw with empty draw pile
- **WHEN** a draw effect fires during a turn and the draw pile is empty
- **THEN** the discard pile is shuffled into the draw pile before drawing. If the discard pile is also empty, draws fizzle.

#### Scenario: End of turn discard
- **WHEN** the turn ends
- **THEN** all assigned slot modifiers move to the discard pile (or exhaust pile if they have the Exhaust keyword). All remaining hand cards are discarded.

### Requirement: Hand limit of 10

The hand cannot exceed 10 cards.

#### Scenario: Drawing beyond hand limit
- **WHEN** a draw would bring the hand above 10 cards
- **THEN** drawing stops at 10; excess draws are lost (not discarded)

### Requirement: System cards exhaust on play

All system cards (non-freePlay) are sent to the exhaust pile after being played, regardless of whether they have the Exhaust keyword.

#### Scenario: System card played
- **WHEN** a non-freePlay system card is played and resolves
- **THEN** it is moved to the exhaust pile and does not return to the draw/discard cycle for the rest of combat

#### Scenario: Slot modifier with Exhaust keyword
- **WHEN** a slot modifier card with the Exhaust keyword is played
- **THEN** at end of turn, it moves to the exhaust pile instead of the discard pile

#### Scenario: Exhausted cards return between combats
- **WHEN** a new combat begins
- **THEN** all cards (including previously exhausted ones) start in the deck

### Requirement: Card keywords

Cards may have keywords that modify their behavior: Exhaust, Innate, Retain.

#### Scenario: Exhaust keyword
- **WHEN** a card with Exhaust is played
- **THEN** it goes to the exhaust pile instead of the discard pile after resolution

### Requirement: Card acquisition from enemies

After clearing a combat encounter, the player is offered cards to add to their deck.

#### Scenario: Post-combat card reward
- **WHEN** a combat room is cleared
- **THEN** the player is shown 3 modifier cards from the current sector's pool and may choose one to add to their deck, or skip

#### Scenario: Skipping a card reward
- **WHEN** the player skips a card reward
- **THEN** no card is added and a small amount of shards is awarded instead

### Requirement: Card upgrades

Modifier cards are upgradeable at rest rooms.

#### Scenario: Upgrading a card at rest
- **WHEN** the player chooses to upgrade at a rest room
- **THEN** they select one card from their deck. The card is permanently enhanced for the rest of the run (typically reduced energy cost, increased effect magnitude, or both)

### Requirement: Card removal

Cards can be removed from the deck to thin it.

#### Scenario: Removing a card
- **WHEN** the player chooses to remove a card (e.g., at a shop or event)
- **THEN** the card is permanently removed from the run's deck
