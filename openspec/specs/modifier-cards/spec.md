## Modifier Cards

### Requirement: Modifier cards alter body slot actions or provide global effects

Cards in the player's deck are modifier cards with an `energyCost`. They come in two types: slot modifiers (assigned to a body slot to alter its action) and system cards (global effects that fire immediately).

#### Scenario: Playing a slot modifier
- **WHEN** the player plays a slot modifier card during planning
- **THEN** energy is deducted, and the card is assigned to the chosen body slot. The slot's action is modified during the execution phase.

#### Scenario: Playing a system card
- **WHEN** the player plays a non-freePlay system card during planning
- **THEN** energy is deducted, the card's effects fire immediately, the card's home slot is marked `__system__` (blocking other cards from that slot), and the card is exhausted.

#### Scenario: Playing a freePlay card
- **WHEN** the player plays a freePlay card (e.g., companion cards, Feedback system card)
- **THEN** energy is deducted, the card's effects fire immediately, the card does NOT occupy a slot, and the card is discarded (or exhausted if it has the Exhaust keyword).

### Requirement: One modifier per slot (with exceptions)

Each body slot may receive at most one slot modifier per turn, unless the player has the Dual Loader part.

#### Scenario: One modifier per slot
- **WHEN** a slot already has a modifier assigned
- **THEN** a second modifier cannot be assigned unless the player has the Dual Loader part

#### Scenario: Dual Loader allows two modifiers
- **WHEN** the player has the Dual Loader part and a slot has one modifier
- **THEN** a second modifier may be assigned to that slot's secondary slot (`slotModifiers2`)

#### Scenario: Feedback always uses secondary slot
- **WHEN** a Feedback slot modifier is assigned
- **THEN** it always goes to the secondary slot (`slotModifiers2`), so it stacks with any primary modifier without requiring Dual Loader

### Requirement: Slot modifier categories

Slot modifiers fall into six categories: Amplify, Redirect, Repeat, Override, Feedback, and Retaliate.

#### Scenario: Amplify increases output
- **WHEN** an Amplify modifier is assigned to a slot
- **THEN** the slot's action value is multiplied by the card's multiplier (e.g., 1.5x for Boost, 2.0x for Overcharge)
- **Allowed slots**: Arms, Torso

#### Scenario: Redirect changes targeting
- **WHEN** a Redirect modifier is assigned to a slot
- **THEN** the slot's target mode changes (e.g., single_enemy to all_enemies)
- **Allowed slots**: Arms

#### Scenario: Repeat fires the action again
- **WHEN** a Repeat modifier is assigned to a slot
- **THEN** the slot's action fires 1 + `extraFirings` times during execution
- **Allowed slots**: any (universal)

#### Scenario: Override replaces the action
- **WHEN** an Override modifier is assigned to a slot
- **THEN** the slot's normal equipment action is replaced entirely with the override's action for this turn. Override actions do NOT receive Strength/Dexterity bonuses.
- **Allowed slots**: any (universal). Override can be played on empty slots (slots without equipment) and on any slot regardless of type.

#### Scenario: Feedback applies slot-dependent secondary effect
- **WHEN** a Feedback modifier is assigned to a slot
- **THEN** the slot gains a secondary effect based on which slot it occupies:
  - **HEAD**: cards drawn add +2 bonus damage to Arms per card drawn
  - **TORSO**: 75% of block gained is dealt as damage to a random enemy
  - **ARMS**: 33% of damage dealt heals the player (lifesteal)
  - **LEGS**: block gained from this slot persists to the next turn (decays 50%/turn)
- Feedback does NOT trigger on Override actions.

#### Scenario: Retaliate reflects damage
- **WHEN** a Retaliate modifier is assigned to Torso
- **THEN** during the enemy turn, all incoming damage (dealt + blocked) is reflected back to the attacker
- **Allowed slots**: Torso only

### Requirement: Persistent Feedback via system card

The Feedback system card (freePlay, Exhaust) applies a permanent per-slot Feedback effect for the rest of combat.

#### Scenario: Feedback system card played
- **WHEN** the Feedback freePlay card is played targeting a slot
- **THEN** `persistentFeedback[slot]` is set to true. The slot's Feedback effect triggers every turn for the rest of combat without needing a slot modifier. Requires the slot to have equipment (cannot target empty slots).

#### Scenario: Persistent Feedback does not stack with slot Feedback
- **WHEN** a slot has both persistent Feedback and a Feedback slot modifier
- **THEN** only one Feedback effect applies (the slot modifier takes priority, persistent is skipped)

### Requirement: System card effects

System cards provide global effects without occupying a modifier slot. They are assigned to their `homeSlot` and fire immediately during planning. All non-freePlay system cards exhaust after play.

System effect types:
- `draw`: draw N cards
- `heal`: heal N HP
- `applyStatus`: apply status stacks to self or all enemies
- `removeDebuff`: remove debuff stacks (Weak first, then Vulnerable)
- `gainBlock`: gain N block
- `damage`: deal N damage to single enemy or all enemies
- `applyFeedback`: set persistent Feedback on target slot (freePlay only)

#### Scenario: System card occupies home slot
- **WHEN** a non-freePlay system card is played
- **THEN** it is assigned to its `homeSlot`, blocking other cards from that slot for the turn. The equipment in that slot still fires normally during execution.

#### Scenario: System card home slot restriction
- **WHEN** the player attempts to play a system card on a slot other than its `homeSlot`
- **THEN** the play is rejected

### Requirement: FreePlay companion cards

Companion cards (Yanah, Yuri) are freePlay system cards. They fire instantly without occupying a slot and can be played alongside any other cards.

#### Scenario: Yanah companion card
- **WHEN** the player plays the Yanah card
- **THEN** heal 6 HP and remove 1 debuff. Energy cost: 0. Does not occupy a slot.

#### Scenario: Yuri companion card
- **WHEN** the player plays the Yuri card
- **THEN** gain 1 Strength and 1 Inspired. Energy cost: 1. Does not occupy a slot.

#### Scenario: Companion cards in deck
- **WHEN** a companion is acquired during a run
- **THEN** the companion's card is added to the deck and cycles through draw/hand/discard like any other card

### Requirement: Starting deck

Every run begins with a fixed set of 8 modifier cards.

#### Scenario: Starting deck composition
- **WHEN** a new run begins
- **THEN** the deck contains exactly:
  - 3x **Boost** (Amplify, 2E, +50% to one slot)
  - 1x **Emergency Strike** (Override, 2E, deal 8 damage to ALL enemies)
  - 1x **Emergency Shield** (Override, 2E, gain 12 Block)
  - 2x **Vent** (System/Draw, 2E, draw 2 cards, homeSlot: Legs)
  - 1x **Diagnostics** (System/Draw, 2E, draw 2 cards, homeSlot: Head)

### Requirement: Slot restrictions by modifier category

Different modifier categories are restricted to specific body slots.

#### Scenario: Amplify slot restriction
- **WHEN** an Amplify card is played
- **THEN** it may only target Arms or Torso

#### Scenario: Redirect slot restriction
- **WHEN** a Redirect card is played
- **THEN** it may only target Arms

#### Scenario: Repeat is universal
- **WHEN** a Repeat card is played
- **THEN** it may target any equipped slot

#### Scenario: Override is universal
- **WHEN** an Override card is played
- **THEN** it may target any slot, including empty slots without equipment

#### Scenario: Feedback is universal
- **WHEN** a Feedback slot modifier is played
- **THEN** it may target any equipped slot

#### Scenario: Retaliate slot restriction
- **WHEN** a Retaliate card is played
- **THEN** it may only target Torso

#### Scenario: Cannot target disabled slots
- **WHEN** any modifier card targets a disabled slot
- **THEN** the play is rejected

#### Scenario: Non-Override modifiers require equipment
- **WHEN** a non-Override slot modifier targets a slot without equipment
- **THEN** the play is rejected
