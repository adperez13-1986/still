## Why

New players started with only Torso (block), making the opening feel passive. The core body-slot system wasn't immediately impactful since damage relied entirely on modifier cards. Additionally, the Reinforced Chassis upgrade (+15 permanent max HP) trivialized early runs once purchased.

## What Changes

- Swap default starting equipment from Torso (Scrap Plating) to Arms (Piston Arm)
- Workshop "Extra Slot" upgrade now grants Torso instead of Arms
- Remove Reinforced Chassis workshop upgrade entirely
- Fragment bonuses remain as the only per-run health boost

## Capabilities

### New Capabilities

### Modified Capabilities
- `progression`: Default starting equipment changed to Arms; Reinforced Chassis removed from workshop upgrades

## Impact

- `src/game/types.ts` — Remove `reinforced-chassis` from `WorkshopUpgradeId`
- `src/store/permanentStore.ts` — Remove from defaults and cost table
- `src/components/RunScreen.tsx` — Swap starting slot, remove bonus health
- `src/components/WorkshopScreen.tsx` — Remove upgrade entry, update Extra Slot description
- `openspec/specs/progression/spec.md` — Updated scenarios
