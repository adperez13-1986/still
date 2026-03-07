## 1. Run State

- [x] 1.1 Add `equipPity: number` field to `RunState` in `src/game/types.ts`
- [x] 1.2 Initialize `equipPity: 0` in `emptyRunState` in `src/store/runStore.ts`
- [x] 1.3 Initialize `equipPity: 0` in run start logic in `src/components/RunScreen.tsx`

## 2. Drop Resolution

- [x] 2.1 Add `equipPity` parameter to `resolveDrops` in `src/game/drops.ts`
- [x] 2.2 Boost equipment entry weights by pity value before rolling
- [x] 2.3 Inject generic equipment entry (base weight 0 + pity) when pity >= 2 and enemy has no equipment in pool
- [x] 2.4 Return structured result with `droppedEquipment` boolean alongside drops

## 3. Combat Integration

- [x] 3.1 Pass `equipPity` from run state to `resolveDrops` in `src/components/CombatScreen.tsx`
- [x] 3.2 Increment `equipPity` by 1 after combat with no equipment drop
- [x] 3.3 Reset `equipPity` to 0 after combat with equipment drop
