## Why

Equipment drops currently auto-equip with no confirmation, silently replacing whatever the player had in that slot. This feels bad — the player loses a body action they may have been relying on with zero agency. Empty slots should still auto-equip (free upgrade, no downside), but occupied slots need a choice.

## What Changes

- When equipment drops into an **empty slot**, it auto-equips as before (no friction for pure upgrades)
- When equipment drops into an **occupied slot**, show a comparison overlay letting the player keep their current item or equip the new one
- The comparison overlay shows both items' names and body actions side-by-side so the player can make an informed decision

## Capabilities

### New Capabilities

_None_ — this is a refinement of existing reward flow, not a new system.

### Modified Capabilities

- `protagonist`: The equipables system requirement changes — replacing an equipped item now requires player confirmation instead of happening automatically

## Impact

- `src/screens/CombatScreen.tsx` — reward resolution logic for equipment drops
- `src/store/runStore.ts` — `equipItem` may need to support a "preview" or conditional flow
- New UI component for the equipment comparison overlay
