## Why

Heat zone during execution is autopilot — each slot generates +1 heat regardless of player decisions, causing a fixed drift from Cool toward Warm that the player cannot control. Combined with passive cooling parts (Residual Charge, Feedback Loop) that keep you Cool for free, heat zone never feels like a deliberate build choice. Cool Runner requires no effort, Pyromaniac fights its own parts, and execution overrides planning-phase heat management. All heat decisions should live in the planning phase so that execution reflects the player's choices.

## What Changes

- **BREAKING** — Remove +1 heat generation per slot firing during execution. Slots fire their actions but do not change heat. Heat at end of planning = heat during all of execution.
- **BREAKING** — Remove Residual Charge and Feedback Loop behavioral parts. Passive heat-offset parts make Cool effortless and fight non-Cool archetypes. Heat management should be active (cooling cards, LEGS end-of-turn cooling), not passive triggers.
- **Equipment `extraHeatGenerated`** moves to assignment time — assigning a modifier to a slot with extra-heat equipment (Overclocked Pistons, Reactive Plating) costs +1 additional heat during planning, rather than generating heat during execution.
- **Oscillator threshold-crossing triggers** fire during planning phase (as cards push heat up and cooling pulls it down). Effects accumulated during planning carry into execution.
- **LEGS cooling** becomes purely end-of-turn — it no longer fires "during" execution to change zone mid-sequence. LEGS cooling sets up your heat for the next turn's planning phase.
- **Heat projection UI** simplifies — no need to project per-slot heat drift. Show current heat = execution heat.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `heat-system`: Heat no longer increases during execution from slot firing. Zone is determined entirely by planning-phase card play. Passive cooling (end of turn) and LEGS cooling (end of turn) are the only between-turn heat reductions. The per-slot +1 heat generation requirement is removed.
- `body-actions`: Slots no longer generate +1 heat when they fire. Equipment `extraHeatGenerated` moves to modifier-assignment time in planning. Heat threshold for equipment bonuses is checked once using planning-end heat, not per-slot with accumulating heat.

## Impact

- `src/game/combat.ts` — `resolveBodyAction` stops generating +1 heat. `executeBodyActions` stops applying heat per slot. `extraHeatGenerated` moves to card-assignment logic. Heat projection simplifies.
- `src/game/types.ts` — May simplify heat-related constants/helpers.
- `src/data/parts.ts` — Remove Residual Charge and Feedback Loop definitions. Audit remaining parts for planning-vs-execution heat assumptions.
- `src/components/CombatScreen.tsx` — Heat projection no longer accounts for per-slot drift. Simplify projected heat display.
- `src/components/BodySlotPanel.tsx` — Extra-heat equipment shows cost at assignment time, not during execution.
- `src/store/runStore.ts` — Card assignment to extra-heat slots applies heat immediately during planning.
