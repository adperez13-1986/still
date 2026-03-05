## Why

Shards earned during combat are accumulated in the run-scoped store (`run.shards`) but never transferred to the permanent store (`permanent.totalShards`) before the run ends. When `run.endRun()` fires, the run state resets to zero and all earned shards are lost. The `permanent.addShards()` method exists but is never called anywhere.

## What Changes

- Add shard transfer (`permanent.addShards(run.shards)`) at every run-end code path: defeat handler and post-boss victory
- Add a formal run-end flow for victory (boss defeated → reward collected → shards transferred → run ends → navigate home)
- Display shards earned on the defeat/victory summary so the player sees what they gained

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `progression`: Shards must persist to the permanent store when a run ends (defeat or victory)
- `game-core`: Victory run-end path must exist — currently the run never formally ends after beating a boss

## Impact

- `src/components/CombatScreen.tsx` — Defeat handler: add `permanent.addShards(run.shards)` before `run.endRun()`. Reward `onChoose` callback: detect boss kill → trigger victory end-run flow.
- `src/store/permanentStore.ts` — No changes needed, `addShards()` already exists
- `src/store/runStore.ts` — May need a helper to check if run is complete (all acts cleared)
