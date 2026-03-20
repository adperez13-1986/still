## ADDED Requirements

### Requirement: Modifier cards are the player's hand-based combat actions
Cards in the player's deck SHALL be modifier cards — software subroutines that alter body actions or provide global combat effects. Each modifier card has a Heat cost (positive, zero, or negative) printed on the card.

#### Scenario: Playing a modifier card
- **WHEN** the player plays a modifier card during the planning phase
- **THEN** its Heat cost is applied to Still's Heat, and the card's effect is queued or applied

#### Scenario: Card moves to discard after play
- **WHEN** a modifier card is played (unless it has the Exhaust keyword)
- **THEN** it moves to the discard pile at end of turn

### Requirement: Slot modifier cards target one body slot
Slot modifier cards SHALL target a specific body slot, altering that slot's action for the current turn. Each slot may receive at most one slot modifier per turn.

#### Scenario: Assigning a slot modifier
- **WHEN** the player plays a slot modifier card
- **THEN** the player selects which body slot to apply it to (Override modifiers may target empty slots; Amplify, Redirect, and Repeat modifiers require a filled slot with an existing action)

#### Scenario: One modifier per slot limit
- **WHEN** a slot already has a modifier assigned this turn
- **THEN** the player cannot assign another slot modifier to that slot

#### Scenario: Replacing an assigned modifier
- **WHEN** the player wants to change a slot's modifier during the planning phase
- **THEN** they may unassign the current modifier (returning it to hand, refunding its Heat) and assign a different one

### Requirement: Slot modifier categories
Slot modifiers SHALL fall into five categories, each altering the body action differently.

#### Scenario: Amplify modifier increases output
- **WHEN** an Amplify modifier is assigned to a slot
- **THEN** the slot's action output is multiplied (e.g., +50%, double, or triple depending on the specific card)

#### Scenario: Redirect modifier changes targeting
- **WHEN** a Redirect modifier is assigned to a slot
- **THEN** the slot's action target changes (e.g., single enemy → all enemies, or gains a focus bonus against lowest-HP enemy)

#### Scenario: Repeat modifier triggers the action again
- **WHEN** a Repeat modifier is assigned to a slot
- **THEN** the slot's action fires an additional time during execution; the Repeat card's energy cost is paid when assigned during the planning phase

#### Scenario: Override modifier replaces the action
- **WHEN** an Override modifier is assigned to a slot
- **THEN** the slot's normal action is replaced entirely with the override's action for this turn

#### Scenario: Feedback modifier applies slot-dependent effect
- **WHEN** a Feedback modifier is assigned to a slot
- **THEN** the slot's action gains a secondary effect determined by which slot it occupies (HEAD: draw→Arms damage, TORSO: block→reflected damage, ARMS: damage→healing, LEGS: block persists)

### Requirement: System cards provide global effects
System cards SHALL affect combat state globally without targeting a specific body slot. They have no slot limit — any number of system cards may be played per turn.

#### Scenario: Playing a system card
- **WHEN** the player plays a system card
- **THEN** its effect applies immediately (or is queued for execution phase) without targeting a body slot

### Requirement: Cooling system cards
Cooling cards SHALL reduce Heat, providing the primary way to manage thermal buildup.

#### Scenario: Flat cooling card
- **WHEN** a cooling card with a negative Heat cost (e.g., -3) is played
- **THEN** Still's Heat is reduced by that amount (minimum 0)

#### Scenario: Conditional cooling card
- **WHEN** a cooling card requires a Heat threshold (e.g., "only playable at Hot")
- **THEN** the card can only be played if the condition is met

### Requirement: Conditional system cards
Some system cards SHALL have effects gated by the current Heat threshold, rewarding intentional Heat management.

#### Scenario: Warm-gated card
- **WHEN** a conditional card requires Warm+ and Still's Heat is in the Warm, Hot, or Overheat range
- **THEN** the card's effect activates

#### Scenario: Condition not met
- **WHEN** a conditional card's Heat threshold requirement is not met
- **THEN** the card cannot be played

### Requirement: Starting modifier deck
Every run SHALL begin with a standard set of 8 basic modifier cards.

#### Scenario: Starting deck composition
- **WHEN** a new run begins
- **THEN** Still's deck contains exactly: 3x Boost (Amplify, +1 Heat, +50% output to one slot), 1x Emergency Strike (Override, +2 Heat, any slot deals 8 damage), 1x Emergency Shield (Override, +1 Heat, any slot gains 12 Block), 2x Coolant Flush (Cooling, −3 Heat), 1x Diagnostics (System, +1 Heat, draw 2 modifier cards)

### Requirement: Companion cards are system modifier cards
Yanah and Yuri companion cards SHALL be reworked as system modifier cards compatible with the new combat model.

#### Scenario: Yanah companion card
- **WHEN** the player plays the Yanah modifier card
- **THEN** heal 6 HP and remove 1 debuff. Heat cost: +0. Category: System (Cooling).

#### Scenario: Yuri companion card
- **WHEN** the player plays the Yuri modifier card
- **THEN** gain 1 Strength and gain 1 Inspired (draw +1 extra card next turn). Heat cost: +1. Category: System (Conditional).

#### Scenario: Companion cards added to starting deck when unlocked
- **WHEN** a companion is unlocked via Workshop milestones and a new run begins
- **THEN** the companion's modifier card is added to the starting modifier deck

### Requirement: Modifier card acquisition from enemies
After defeating enemies, the player SHALL be offered modifier cards as rewards.

#### Scenario: Post-combat modifier reward
- **WHEN** a combat encounter is cleared
- **THEN** the player is shown 3 modifier cards and may choose one to add to their deck, or skip for shards

### Requirement: Modifier card upgrades
Modifier cards SHALL be upgradeable at rest rooms.

#### Scenario: Upgrading a modifier at rest
- **WHEN** the player chooses to upgrade a modifier card at a rest room
- **THEN** the selected card is permanently enhanced for the rest of the run (e.g., reduced Heat cost, increased effect magnitude, or added secondary effect)

### Requirement: Exhaust keyword on modifiers
Some modifier cards SHALL have the Exhaust keyword.

#### Scenario: Exhausted modifier removed
- **WHEN** a modifier card with Exhaust is played
- **THEN** it is placed in the exhaust zone and does not return to the draw/discard cycle for the rest of combat (exhausted cards return to the deck for the next combat encounter)

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
