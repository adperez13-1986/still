## Why

Players consistently finish Act 1 with only 2 of 4 equipment slots filled (typically Torso + Arms from starting gear and workshop upgrade). Equipment drops are too sparse and RNG-dependent — some enemies don't even have equipment in their drop pool. This means players rarely experience the full body slot system, reducing build variety and strategic depth.

## What Changes

- Add an equipment pity counter to the run state that tracks consecutive combats without an equipment drop
- Boost equipment drop weights proportionally to the pity counter
- Inject a generic equipment drop option for enemies that don't normally drop equipment (when pity is high enough)
- Reset pity to 0 when equipment drops; increment by 1 after each combat without equipment

## Capabilities

### New Capabilities
- `equipment-pity`: Bad luck protection system for equipment drops — escalating probability that resets on success

### Modified Capabilities
- `enemy-system`: Drop resolution now accepts a pity parameter that modifies equipment weights
- `progression`: Run state gains an `equipPity` counter initialized at 0

## Impact

- `src/game/types.ts` — `RunState` gains `equipPity: number`
- `src/game/drops.ts` — `resolveDrops` accepts pity param, boosts equipment weights, injects fallback
- `src/store/runStore.ts` — default state includes `equipPity: 0`
- `src/components/CombatScreen.tsx` — passes pity to drop resolution, updates counter after rewards
- `src/components/RunScreen.tsx` — includes `equipPity: 0` in run initialization
