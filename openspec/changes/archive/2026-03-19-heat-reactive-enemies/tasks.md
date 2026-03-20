## 1. Intent Types

- [x] 1.1 Add `'Scan'` and `'HeatReactive'` to `IntentType` union in `types.ts`
- [x] 1.2 Add optional `coolIntent`, `warmIntent`, `hotIntent` fields (each `Intent`) to the `Intent` interface in `types.ts`

## 2. Enemy Execution Logic

- [x] 2.1 In `executeEnemyTurn` in `combat.ts`: handle `Scan` intent — skip (no action, log "Scanning...")
- [x] 2.2 In `executeEnemyTurn` in `combat.ts`: handle `HeatReactive` intent — read Still's current heat, pick matching sub-intent (coolIntent/warmIntent/hotIntent), execute it as a normal intent

## 3. Enemy Definition

- [x] 3.1 Add Thermal Scanner enemy definition in `enemies.ts`: 35 HP, pattern [Scan, HeatReactive(Cool:12atk/Warm:7atk/Hot:+2Str), Attack 8, Block 6], drop pool with shards + equipment
- [x] 3.2 Add Thermal Scanner to S1 encounter pool: solo encounter and paired with Fracture Mite
- [x] 3.3 Add Thermal Scanner to `SECTOR1_ENEMIES` export and `ALL_ENEMIES`

## 4. UI Display

- [x] 4.1 Update `EnemyCard.tsx`: display `Scan` intent as "Scanning..." with distinct color (no damage number)
- [x] 4.2 Update `EnemyCard.tsx`: display `HeatReactive` intent — resolve to matching sub-intent based on Still's heat, show ⚡ indicator. Also fixed damage scaling display (0.15→0.08).

## 5. Playtest

- [x] 5.1 Verify Scan turn shows "Scanning..." with no enemy action
- [x] 5.2 Verify HeatReactive resolves correctly: Cool → 12 attack, Warm → 7 attack, Hot → Str buff
- [x] 5.3 Verify intent display updates when player changes heat zone during planning
- [x] 5.4 Verify Thermal Scanner appears in S1 encounters
