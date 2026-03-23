## Why

Parts have no slot limit. A player can accumulate all 12 parts across S1 and S2, creating passive stacking that trivializes combat — particularly block-generating parts (Frost Core + Cryo Engine + Empty Chamber + Failsafe Armor) that produce 15+ free block per turn. Parts need a cap to create meaningful choices about which passive effects to carry.

## What Changes

- **Cap parts at 4 maximum** — the player can hold at most 4 parts at any time
- **Part replacement UI** — when a part drop occurs and the player already has 4, show a replacement overlay: pick which existing part to discard, or skip the new part
- **addPart enforces limit** — the store's `addPart` function checks the cap before adding

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `carried-part`: Parts now have a maximum of 4. When at capacity, acquiring a new part requires discarding one.

## Impact

- **Modified files**: `src/store/runStore.ts` (addPart limit check), `src/components/CombatScreen.tsx` (replacement UI in reward flow), `src/game/types.ts` (MAX_PARTS constant)
- **UI change**: New overlay for part replacement when at capacity
- **No combat logic changes** — parts still function identically, there are just fewer of them
