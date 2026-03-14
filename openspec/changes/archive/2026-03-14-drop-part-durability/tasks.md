## 1. Simplify type and store

- [x] 1.1 Change `CarriedPart` type in `types.ts` from `{ partId, durability, maxDurability, repairsLeft }` to `string | null` (just a part ID)
- [x] 1.2 Update `permanentStore.ts`: simplify `setCarriedPart` to accept a `string`, remove `updateCarriedPart`, migrate `carriedPart` load (if object, extract `partId`)
- [x] 1.3 Update `CarrySelectOverlay.tsx`: remove durability display, update props/types for string-based carried part

## 2. Remove repair UI

- [x] 2.1 Remove the "CARRIED MOD" repair section from `WorkshopScreen.tsx`
- [x] 2.2 Remove the repair option (`onRepair`) from `ShopScreen.tsx`
- [x] 2.3 Remove `onRepair` handler in `RunScreen.tsx` where ShopScreen is rendered

## 3. Simplify run start

- [x] 3.1 In `RunScreen.tsx`, simplify carried part loading: always include carried part in `initialParts` (no durability check, no broken notice)

## 4. Remove durability decrement

- [x] 4.1 Find and remove any code that decrements carried part durability after combat wins

## 5. Verification

- [x] 5.1 Type-check passes
- [x] 5.2 Playtest: carried part is always active across runs without breaking
