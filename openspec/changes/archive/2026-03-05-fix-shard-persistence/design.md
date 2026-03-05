## Context

Shards are earned during combat via enemy drop pools and accumulated in `run.shards` (transient run state). The permanent store has `permanent.totalShards` and `permanent.addShards()`, but no code path ever calls it. When `run.endRun()` fires, shards reset to zero and are lost.

The defeat path exists in `CombatScreen.tsx` (the "Return" button) but doesn't transfer shards. The victory path is incomplete — after beating a boss, the reward callback nulls out `combat` and the player returns to the map, but the run never formally ends.

## Goals / Non-Goals

**Goals:**
- Transfer `run.shards` to `permanent.totalShards` before every `run.endRun()` call
- Add a victory run-end flow after boss combat reward collection
- Show shards earned in the run-end navigation state so the overlay can display them

**Non-Goals:**
- Changing how shards are earned during combat (drop pools, shop spending, events)
- Adding new shard sources or shard display UI beyond the run-end summary
- Multi-act progression — the current single-act flow is sufficient

## Decisions

### Decision 1: Transfer shards inline before endRun()

Add `permanent.addShards(run.shards)` directly before each `run.endRun()` call. No new helper function — just two lines at each call site.

Alternative considered: A `transferAndEndRun()` helper in `runStore`. Rejected because `runStore` doesn't have access to `permanentStore`, and coupling the two stores adds unnecessary complexity for two call sites.

### Decision 2: Detect boss victory via enemy definitions

After reward collection in `CombatScreen`, check if any defeated enemy has `isBoss: true`. If so, the reward `onChoose` callback should transfer shards, record victory run history, end the run, and navigate home — same as the defeat path but with `outcome: 'victory'`.

Alternative considered: A flag on the room type propagated into combat state. Rejected because `EnemyDefinition.isBoss` already exists and is simpler to check.

### Decision 3: Pass shards in navigation state

Add `shards: run.shards` to the `navigate('/')` state object for both victory and defeat paths. The `WorkshopScreen`/`RunEndOverlay` can display it. This keeps the display concern in the UI layer.

## Risks / Trade-offs

- [Risk] Boss detection relies on `isBoss` being set correctly on enemy definitions → Mitigation: only one boss exists (`first-warden`) and it already has `isBoss: true`
- [Risk] If future code adds more `endRun()` call sites, they could forget the shard transfer → Mitigation: small codebase, only two call sites, both in one file

## File Changes

| File | Change |
|------|--------|
| `src/components/CombatScreen.tsx` | Add shard transfer + save before `run.endRun()` in defeat handler. Add boss victory detection + run-end flow in reward `onChoose`. |
