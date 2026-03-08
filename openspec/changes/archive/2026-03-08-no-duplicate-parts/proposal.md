## Why

Players can receive duplicate behavioral parts from combat drops. Stacking identical parts makes the player overpowered (e.g. multiple Bypass Circuits for +4 damage each on Arms fire).

## What Changes

- Filter out already-owned parts from the drop pool when resolving part drops
- If all parts in the pool are owned, fall back to a shard drop instead

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- `src/game/drops.ts` — add ownedPartIds param, filter part pool
- `src/components/CombatScreen.tsx` — pass owned part IDs to resolveDrops
