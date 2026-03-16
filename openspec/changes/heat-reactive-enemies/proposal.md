## Why

S1 enemies all ask the same question: "can you deal damage while blocking?" None of them interact with Still's heat system — the game's most distinctive mechanic. Players can ignore their heat zone entirely and still handle every S1 enemy the same way. This makes early combat feel generic rather than teaching the heat management that defines the game.

## What Changes

- Add a new intent type `HeatReactive` that resolves to different actions based on Still's current heat zone (Cool/Warm/Hot) at enemy execution time
- Add a new `Scan` intent type that telegraphs the upcoming heat-reactive turn (shows "Scanning..." so the player knows their heat matters next turn)
- Add first heat-reactive enemy: **Thermal Scanner** — an S1 standard enemy that cycles through fixed intents with one heat-reactive turn per cycle
- Add Thermal Scanner to S1 encounter pool
- Display heat-reactive intents in the UI with a distinct visual (shows the three possible outcomes based on zone)

## Capabilities

### New Capabilities
- `heat-reactive-intents`: New intent types (Scan, HeatReactive) and enemy execution logic for heat-zone-conditional behavior

### Modified Capabilities
- `enemy-system`: Add Thermal Scanner to S1 enemy pool and encounters

## Impact

- **Modify**: `src/game/types.ts` — add `Scan` and `HeatReactive` to `IntentType`, add heat-reactive fields to `Intent`
- **Modify**: `src/game/combat.ts` — resolve `HeatReactive` intents at enemy execution time based on Still's heat
- **Modify**: `src/data/enemies.ts` — add Thermal Scanner definition and encounters
- **Modify**: `src/components/EnemyCard.tsx` — display Scan and HeatReactive intents with appropriate visuals
