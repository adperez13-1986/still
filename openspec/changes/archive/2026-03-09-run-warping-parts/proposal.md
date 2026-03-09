## Why

Current parts are incremental — they make builds better at what they already do but don't fundamentally change how you play. The game needs 2-3 rare parts that reshape decision-making for the rest of a run: what cards you take, how you approach combat, what risks you're willing to accept.

## What Changes

- Add 3 run-warping rare parts:
  - **Dual Loader**: Assign 2 modifiers to the same slot (breaks the 1-modifier-per-slot rule)
  - **Thermal Damper**: Heat is locked for the first 2 turns of each combat; deferred heat applies all at once when lock expires
  - **Overheat Reactor**: When you Overheat, don't shut down — all slots deal 2x, heat resets to 5, max HP permanently reduced by 5
- Run-warping parts drop exclusively from elite/boss encounters with diminishing probability:
  - 0 owned → 35% chance
  - 1 owned → 15% chance
  - 2 owned → 5% chance
  - 3 owned → 0%

## Capabilities

### New Capabilities

- `run-warping-parts`: Three rare parts with game-rule-breaking effects and elite/boss drop mechanics

### Modified Capabilities

(none)

## Impact

- `src/data/parts.ts` — add 3 new BehavioralPartDefinition entries
- `src/game/types.ts` — new effect types, combat state for heat lock (heatLocked, heatDebt, lockTurnsRemaining), max HP reduction support
- `src/game/combat.ts` — dual modifier assignment logic, heat lock accumulation/expiry, overheat reactor alternative, 2x damage modifier
- `src/game/drops.ts` — elite/boss drop logic with diminishing probability
- `src/components/CombatScreen.tsx` — allow assigning 2nd modifier to slot when Dual Loader is owned, heat lock visual indicator
- `src/store/runStore.ts` — max HP reduction action
