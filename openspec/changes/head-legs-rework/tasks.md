## 1. Type System

- [x] 1.1 Add `'debuff'` and `'reduce'` to `BodyActionType`
- [x] 1.2 Extend `BodyAction` with `debuffType?: StatusEffectType`
- [x] 1.3 Add `damageReduction: number` to `CombatState`
- [x] 1.4 Remove `bonusForesight` from `EquipmentDefinition`

## 2. Equipment Data

- [x] 2.1 Rework all HEAD equipment to debuff actions (8 pieces: Vuln/Weak, single/AoE, 1-2 stacks)
- [x] 2.2 Rework all LEGS equipment to reduce actions (7 pieces: 2-4 reduction, some with bonusBlock)
- [x] 2.3 Starting equipment: Scrap Scanner → Vuln 1 single, Scrap Actuators → reduce 2

## 3. Card Data

- [x] 3.1 Define Spark card (Override, 2E, 4 dmg single)
- [x] 3.2 Define Patch Job card (Override, 2E, 6 block)
- [x] 3.3 Updated STARTING_CARDS to 12 (1 Boost, 1 E.Strike, 1 E.Shield, 1 Diag, 2 Vent, 3 Spark, 3 Patch Job)
- [x] 3.4 Added to allCardList (not in reward pools)

## 4. Combat Resolution

- [x] 4.1 Handle `debuff` action type — accumulates in debuffsApplied, resolved in executeBodyActions
- [x] 4.2 Handle `reduce` action type — accumulates damageReduction
- [x] 4.3 Store reduction + apply debuffs in executeBodyActions
- [x] 4.4 Apply damage reduction per-hit in executeEnemyTurn before block
- [x] 4.5 Reset damageReduction at execution start
- [x] 4.6 Remove HEAD draw bonus from startTurn
- [x] 4.7 Remove bonusForesight from equipment, replace with bonusBlock in UI

## 5. Run Initialization

- [x] 5.1 Changed drawCount to 5 in RunScreen, runStore, sim CLI
- [x] 5.2 All hardcoded references updated

## 6. Heuristic / Sim

- [x] 6.1 Added debuff scoring to amplify/repeat in heuristic
- [x] 6.2 Added reduce scoring to amplify/repeat in heuristic
- [x] 6.3 Sim CLI auto-uses STARTING_CARDS (already 12 cards)

## 7. Cleanup

- [x] 7.1 Removed HEAD draw bonus from startTurn, simplified draw logic
- [x] 7.2 Removed bonusForesight from equipment, updated BodySlotPanel UI
- [x] 7.3 TypeScript build passes
- [x] 7.4 Sim runs without crashes (500 runs, HEAD debuffs + LEGS reduction working)
