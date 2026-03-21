## Why

Feedback is currently a slot modifier card played each turn for a one-turn secondary effect. This makes it inconsistent filler — you need to draw and play it every turn for value to compound, but draw RNG means you often don't have it. Converting Feedback to a system card that exhausts after applying a permanent combat-long effect makes it a reliable, satisfying card worth picking up without requiring it to be a build-defining archetype.

## What Changes

- **Convert Feedback from a slot modifier to a system card** that targets a body slot, applies its Feedback effect permanently for the rest of combat, and exhausts
- **Increase energy cost to 3** (upgraded: 2) to reflect the permanent value
- **Increase LEGS Feedback decay from 25% to 50%** to prevent persistent block from snowballing as a free permanent effect
- **Feedback no longer occupies the secondary slot** — it applies a persistent state flag on the slot instead, freeing the secondary for other modifiers (Dual Loader)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities
- `feedback-modifier`: Feedback changes from a per-turn slot modifier to a one-shot system card with permanent combat-long effect. Slot assignment, exhaust behavior, energy cost, and LEGS decay rate all change.

## Impact

- **Modified files**: `src/data/cards.ts` (card definition), `src/game/combat.ts` (execution logic for persistent Feedback), `src/game/types.ts` (CombatState needs persistent Feedback tracking)
- **No new dependencies**
- **Sim heuristic** (`src/sim/heuristic.ts`) will need updating to handle the new card type
