## MODIFIED Requirements

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
