## 1. Constants & Store

- [x] 1.1 Add `MAX_PARTS = 4` constant to `types.ts`
- [x] 1.2 Update `addPart` in `runStore.ts` to reject when `parts.length >= MAX_PARTS`
- [x] 1.3 Add `replacePart(oldPartId: string, newPart: BehavioralPartDefinition)` action to `runStore.ts`

## 2. Reward Flow

- [x] 2.1 In CombatScreen reward flow, detect when part drop would exceed limit
- [x] 2.2 Create Part Replacement Overlay component: shows new part vs 4 existing parts, swap or skip
- [x] 2.3 Wire overlay into reward flow: show overlay instead of auto-adding when at capacity

## 3. Verify

- [x] 3.1 Verify carried part counts toward the 4-part limit at run start
- [x] 3.2 Type-check and build
