## 1. Data Model

- [x] 1.1 Add `CarriedPart` interface to `types.ts`: `{ partId: string; durability: number; maxDurability: number; repairsLeft: number }`
- [x] 1.2 Create `src/store/metaStore.ts` — Zustand store with `persist` middleware (localStorage). State: `carriedPart: CarriedPart | null`. Actions: `setCarriedPart`, `updateCarriedPart`, `clearCarriedPart`

## 2. Run Start — Load Carried Part

- [x] 2.1 In `RunScreen.tsx` `startRun`, read `carriedPart` from metaStore. If intact (durability > 0), include the corresponding `PartDefinition` in the initial `parts` array passed to `startRun`
- [x] 2.2 If carried part is broken on run start, show a one-time notice ("Your carried part needs repair") and do not apply its effects

## 3. Break Mechanic — Post-Combat

- [x] 3.1 In `CombatScreen.tsx` `handleCombatWon`, after the run shard/health updates: read `carriedPart` from metaStore. Decrement `durability` by 1
- [x] 3.2 If `durability` reaches 0 and `repairsLeft > 0`: update metaStore (durability = 0), remove part from `RunState.parts` so its effects stop applying
- [x] 3.3 If `durability` reaches 0 and `repairsLeft === 0`: permanently destroy — call `clearCarriedPart`, remove from `RunState.parts`, set a `permanentBreakMessage` state string (e.g., `"Salvaged Plating finally gave out. It served you well."`)
- [x] 3.4 Render the permanent break message as a dismissible overlay in `CombatScreen.tsx` when `permanentBreakMessage` is set

## 4. Equips Overlay — Broken Visual State

- [x] 4.1 In `RunInfoOverlay.tsx`, read `carriedPart` from metaStore and the matching `PartDefinition` from `ALL_PARTS`
- [x] 4.2 Render the carried part in a dedicated "Carried Part" section within the Equips tab — grayed out with a `[BROKEN]` label when durability === 0, and showing `Repairs left: N`
- [x] 4.3 Render it normally (not grayed) when intact, still labeled as "Carried Part" to distinguish it from run-earned parts

## 5. Shop Repair Option

- [x] 5.1 Pass `carriedPart` and an `onRepair` callback to `ShopScreen.tsx`
- [x] 5.2 In `ShopScreen.tsx`, show a Repair option when `carriedPart` exists, `carriedPart.durability === 0`, and `carriedPart.repairsLeft > 0`. Display cost: 50 shards
- [x] 5.3 On repair confirm: deduct 50 shards from run shards (via `run.spendShards` or inline), call `updateCarriedPart({ durability: maxDurability, repairsLeft: repairsLeft - 1 })`, add part back to `RunState.parts` so effects resume
- [x] 5.4 In `RunScreen.tsx`, wire `onRepair` for the Shop room

## 6. End-of-Run Carry Selection

- [x] 6.1 Create `CarrySelectOverlay.tsx` — shows all parts collected during the run plus the existing carried part (if any, labeled "Current carry"). Player picks 1 or dismisses
- [x] 6.2 On selection: call `setCarriedPart({ partId, durability: maxDurability, maxDurability: 3, repairsLeft: 2 })` for a newly chosen part, or leave unchanged if re-selecting the existing carried part
- [x] 6.3 In `RunScreen.tsx` (or wherever `endRun` is triggered — both victory and defeat), show `CarrySelectOverlay` before navigating away. Only proceed after the player dismisses or selects
- [x] 6.4 If no parts were collected this run and no carried part exists, skip the overlay entirely
