## 1. Type System

- [x] 1.1 Add `damagePerExhausted` to the `PartEffect` union type in `src/game/types.ts`

## 2. Part Definition

- [x] 2.1 Define the Slag Compressor part in `src/data/parts.ts` (id: `slag-compressor`, trigger: `onSlotFire` for Arms, effect: `damagePerExhausted`, rarity: uncommon)
- [x] 2.2 Add Slag Compressor to `SECTOR1_PART_POOL`

## 3. Combat Logic

- [x] 3.1 Handle `damagePerExhausted` effect in `resolveBodyAction` or `executeBodyActions` in `src/game/combat.ts` — add `exhaustPile.length` bonus damage to Arms when the part triggers, skipping Override actions

## 4. Simulation

- [x] 4.1 Run sim with Slag Compressor to verify damage scaling works and numbers feel right
