## Why

The sole playtester is the developer. Balance tuning (enemy HP, card costs, part effects) requires dozens of manual games per change to build confidence. An automated combat simulator calling the existing pure-function game logic can run thousands of combats in seconds, shifting manual effort from "grinding games for numbers" to "playing a few games for feel."

## What Changes

- Add a **headless combat simulator** that runs combats by calling `combat.ts` functions directly — no React, no UI
- Add a **heuristic player** that makes competent card-play decisions using simple priority rules
- Add a **CLI runner** (Node script) to configure loadouts, enemies, and run count, then output statistical summaries
- Add **RNG seeding** to `combat.ts` shuffle and random-target helpers so simulations are reproducible

## Capabilities

### New Capabilities
- `combat-simulator`: Headless combat simulation engine with heuristic player and CLI interface

### Modified Capabilities
- `combat-system`: RNG functions (`shuffle`, random targeting) must accept an optional seed for deterministic replay

## Impact

- **New files**: `src/sim/` directory — simulator engine, heuristic player, CLI entry point
- **Modified files**: `src/game/combat.ts` — extract RNG into seedable helper (non-breaking; existing callers unchanged)
- **Dependencies**: None new (Node scripts use existing TS tooling via Vite/tsx)
- **No UI changes**: Simulator is CLI-only
