## Approach

Add an `ownedPartIds` parameter to `resolveDrops`. In `resolveBonusDrop`, filter the part pool to exclude owned IDs. If the filtered pool is empty, return a shard drop as fallback.

## Implementation

1. Add `ownedPartIds: string[]` param to `resolveDrops`, pass through to `resolveBonusDrop`
2. Filter part pool in `resolveBonusDrop`
3. Fallback to shards if no eligible parts remain
4. Pass `run.parts.map(p => p.id)` at the call site in CombatScreen
