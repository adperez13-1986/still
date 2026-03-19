## REMOVED Requirements

### Requirement: Modifier cards can have heat-conditional bonus effects
**Reason**: Heat zones removed. No Cool/Warm/Hot thresholds exist to gate bonus effects.
**Migration**: Cards with heatBonus effects are reworked to either have unconditional effects at adjusted values, or gain new non-heat-based conditions (e.g., slot-based or deck-state-based).

### Requirement: Sector 1 card pool includes archetype-seeding cards
**Reason**: Cool Runner, Pyromaniac, and Oscillator archetypes are removed with heat zones. Cards that seeded these archetypes (Precision Strike "while Cool", Fuel the Fire "while Hot", Thermal Flux, Overclock) need redesign.
**Migration**: These cards are reworked with new effects that don't reference heat zones. New archetype directions will be explored in future changes.

### Requirement: Cooling system cards
**Reason**: With per-turn energy reset, cooling (negative heat cost) has no purpose. You can't reduce energy spent below what you've already spent.
**Migration**: Cooling cards (Coolant Flush, Deep Freeze, Heat Vent, Thermal Flush) are reworked as utility system cards — card draw, block gain, or deck cycling effects. Their energy costs become positive (they cost energy to play like any other card).

### Requirement: Conditional system cards
**Reason**: Heat threshold conditions (Warm+, Hot+) removed. No threshold exists to gate card playability.
**Migration**: Cards with heatCondition are reworked to be unconditional or gain new non-heat conditions.

## MODIFIED Requirements

### Requirement: Modifier cards are the player's hand-based combat actions
Cards in the player's deck SHALL be modifier cards — software subroutines that alter body actions or provide global combat effects. Each modifier card has an energy cost (positive integer or zero) printed on the card.

#### Scenario: Playing a modifier card
- **WHEN** the player plays a modifier card during the planning phase
- **THEN** its energy cost is deducted from the turn's available energy, and the card's effect is queued or applied

#### Scenario: Card moves to discard after play
- **WHEN** a modifier card is played (unless it has the Exhaust keyword)
- **THEN** it moves to the discard pile at end of turn

### Requirement: Starting modifier deck
Every run SHALL begin with a standard set of 8 basic modifier cards.

#### Scenario: Starting deck composition
- **WHEN** a new run begins
- **THEN** Still's deck contains exactly: 3x Boost (Amplify, 1 energy, +50% output to one slot), 1x Emergency Strike (Override, 2 energy, any slot deals 8 damage), 1x Emergency Shield (Override, 1 energy, any slot gains 12 Block), 2x Vent (System, 1 energy, draw 2 cards), 1x Diagnostics (System, 1 energy, draw 2 modifier cards)

### Requirement: Companion cards are system modifier cards
Yanah and Yuri companion cards SHALL be system modifier cards with energy costs.

#### Scenario: Yanah companion card
- **WHEN** the player plays the Yanah modifier card
- **THEN** heal 6 HP and remove 1 debuff. Energy cost: 0. Category: System.

#### Scenario: Yuri companion card
- **WHEN** the player plays the Yuri modifier card
- **THEN** gain 1 Strength and gain 1 Inspired (draw +1 extra card next turn). Energy cost: 1. Category: System.

#### Scenario: Companion cards added to starting deck when unlocked
- **WHEN** a companion is unlocked via Workshop milestones and a new run begins
- **THEN** the companion's modifier card is added to the starting modifier deck
