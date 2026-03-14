## Why

The carried part durability/repair system adds a maintenance tax without creating interesting decisions. Breaking and repairing is a chore — you just spend shards when it breaks. It doesn't produce meaningful tension or strategy. Removing it simplifies the system and lets carried parts serve their actual purpose: giving identity across runs.

## What Changes

- **BREAKING**: Remove durability, repair, and breakage from carried parts
- Carried part is simply a `partId` — always active, never breaks
- Remove repair UI from Workshop
- Remove repair option from Shop
- Remove broken-part notice at run start
- Simplify `CarriedPart` type to just a part ID reference

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `carried-part`: Remove durability, repair, and breakage requirements. Carried part is permanent until replaced.

## Impact

- `src/game/types.ts` — simplify `CarriedPart` interface
- `src/store/permanentStore.ts` — simplify carried part actions (remove `updateCarriedPart`)
- `src/components/WorkshopScreen.tsx` — remove repair section
- `src/components/RunScreen.tsx` — remove broken carry notice, simplify part loading
- `src/components/ShopScreen.tsx` — remove repair option
- `src/components/CarrySelectOverlay.tsx` — remove durability display
- `src/data/cards.ts` or combat code — remove durability decrement after combat
