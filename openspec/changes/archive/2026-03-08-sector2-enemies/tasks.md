## 1. Enemy Definitions

- [x] 1.1 Add S2 standard enemies to `src/data/enemies.ts`: Thermal Leech, Wire Jammer, Slag Heap, Feedback Loop, Phase Drone, Furnace Tick, Static Frame, Conduit Spider
- [x] 1.2 Add S2 elite enemies: Overcharge Sentinel, Lockdown Warden, Meltdown Core
- [x] 1.3 Add S2 boss: The Thermal Arbiter (200 HP, 8-step pattern, flavor text)
- [x] 1.4 Export `SECTOR2_ENEMIES`, `SECTOR2_ELITES`, `SECTOR2_BOSS`
- [x] 1.5 Update `ALL_ENEMIES` to include all S2 enemies

## 2. Encounter Compositions

- [x] 2.1 Define `Encounter` interface and `SECTOR2_ENCOUNTERS` array with 8+ predefined enemy groups
- [x] 2.2 Define `SECTOR2_ELITE_ENCOUNTERS` array
- [x] 2.3 Add `SECTOR1_ENCOUNTERS` to backfill S1 with the same pattern (1-2 random enemies from S1 pool)

## 3. Encounter Selection

- [x] 3.1 Update combat room enemy spawning in RunScreen to be sector-aware — S1 uses `SECTOR1_ENCOUNTERS`, S2 uses `SECTOR2_ENCOUNTERS`
- [x] 3.2 Shuffle encounters at maze generation or combat entry so rooms don't repeat the same composition

## 4. Sprites

- [x] 4.1 Add pixel sprite data for all S2 standard enemies in `src/data/sprites.ts`
- [x] 4.2 Add pixel sprite data for S2 elites and boss

## 5. Drop Pools

- [x] 5.1 Set S2 enemy drop pools with increased shard amounts (15-25 standard, 40-60 elite, 80+ boss)
- [x] 5.2 Reference S2 card/part/equipment IDs in drop pools (use S1 items as placeholders until sector2-player-content is implemented)
