## 1. Type plumbing

- [x] 1.1 Add `slotModifiers2: Record<BodySlot, string | null>` to `CombatState` in types.ts
- [x] 1.2 Add `heatLocked: boolean`, `heatDebt: number`, `heatLockTurnsLeft: number` to `CombatState`
- [x] 1.3 Add `overheatReactorFired: boolean` to `CombatState`
- [x] 1.4 Initialize all new fields in `initCombat` (slotModifiers2 null, heat lock fields based on Thermal Damper ownership)
- [x] 1.5 Add `reduceMaxHealth(amount: number)` action to runStore

## 2. Part definitions

- [x] 2.1 Define Dual Loader, Thermal Damper, Overheat Reactor as `BehavioralPartDefinition` in parts.ts
- [x] 2.2 Export `RUN_WARPING_PARTS` array (separate from sector pools)
- [x] 2.3 Add to `BEHAVIORAL_PARTS` and `ALL_PARTS` exports

## 3. Dual Loader — double modifier assignment

- [x] 3.1 In `playModifierCard`: when primary slot is filled, check for Dual Loader in parts, allow assignment to `slotModifiers2` if secondary is empty
- [x] 3.2 In `resolveBodyAction`: read both `slotModifiers` and `slotModifiers2`, apply both effects during execution
- [x] 3.3 In `unassignModifier`: support unassigning from secondary slot
- [x] 3.4 In `endTurn`: clear `slotModifiers2` alongside `slotModifiers`
- [x] 3.5 In CombatScreen: allow dragging/assigning a second card to an already-modified slot when Dual Loader is owned

## 4. Thermal Damper — heat lock

- [x] 4.1 In `applyHeatChange`: if `heatLocked` is true, add positive heat delta to `heatDebt` instead of actual heat (cooling still reduces actual heat)
- [x] 4.2 In `startTurn`: decrement `heatLockTurnsLeft`; when it hits 0, set `heatLocked = false` and apply `heatDebt` to heat (triggering threshold crosses and overheat checks)
- [x] 4.3 Add heat lock visual indicator in CombatScreen (e.g., "LOCKED" badge on heat bar with turns remaining)

## 5. Overheat Reactor — overheat becomes weapon

- [x] 5.1 At overheat check points in combat.ts: after Pressure Valve check, before shutdown, check for Overheat Reactor — reset heat to 5, set `overheatReactorFired = true`, reduce stillHealth and call `reduceMaxHealth(5)` on result
- [x] 5.2 In `resolveBodyAction`: if `overheatReactorFired`, double all damage output from body slots
- [x] 5.3 In `endTurn`: clear `overheatReactorFired` flag
- [x] 5.4 Pass max HP reduction through CombatResult back to RunScreen so runStore is updated

## 6. Drop mechanics

- [x] 6.1 Add `resolveWarperDrop` function in drops.ts: takes owned run-warping part IDs, rolls diminishing chance, returns a run-warping part drop or null
- [x] 6.2 Call `resolveWarperDrop` from reward handling in CombatScreen/RunScreen for elite/boss encounters, add to drops if successful
- [x] 6.3 Ensure run-warping parts are NOT in SECTOR1_PART_POOL or SECTOR2_PART_POOL

## 7. Verify

- [x] 7.1 Type-check passes
