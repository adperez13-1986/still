## Why

Once all workshop upgrades are purchased, permanent shards have no use. Meanwhile, repairing a broken carried part requires finding a map shop during a run — which may appear too early (before earning enough run shards) or not at all. Adding repair capability to the Workshop gives permanent shards a meaningful sink and lets the player start a run with an active carried part instead of hoping for a shop.

## What Changes

- Add a carried part repair option to the Workshop screen, using permanent shards
- Repair cost: 50 permanent shards (same as shop repair cost, but from the persistent wallet)
- Shown only when the carried part is broken (durability 0) with repairs remaining
- Uses the same repair logic as shop repair (restore full durability, decrement repairsLeft)

## Capabilities

### New Capabilities

_None_ — this extends the existing Workshop and carried part systems.

### Modified Capabilities

- `carried-part`: Add a new scenario for repairing at the Workshop using permanent shards
- `progression`: Workshop gains a repair action as a permanent shard sink

## Impact

- `src/components/WorkshopScreen.tsx` — add repair UI section showing broken carried part with repair button
- `src/store/permanentStore.ts` — repair action already exists (`updateCarriedPart`), just need to call it with shard spending
