## 1. Defeat Path — Shard Transfer

- [x] 1.1 In `CombatScreen.tsx` defeat "Return" button handler, add `permanent.addShards(run.shards)` and `permanent.save()` before `run.endRun()`
- [x] 1.2 Add `shards: run.shards` to the `navigate('/')` state object in the defeat handler

## 2. Victory Path — Boss Run-End Flow

- [x] 2.1 In the reward `onChoose` callback in `CombatScreen.tsx`, after collecting drops, detect if any defeated enemy has `isBoss: true` (via `ALL_ENEMIES[e.definitionId]?.isBoss`)
- [x] 2.2 When boss is defeated: call `permanent.addShards(run.shards)`, record victory run history via `permanent.addRunHistory()`, call `permanent.save()`, call `run.endRun()`, and `navigate('/')` with `runEnd: true, outcome: 'victory'` state
- [x] 2.3 When boss is NOT defeated: keep existing behavior (null out combat, return to map)
