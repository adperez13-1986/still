## 1. Card Data

- [x] 1.1 Add unified `CARD_POOL` export in `src/data/cards.ts` that combines both sector pools
- [x] 1.2 Keep `SECTOR1_CARD_POOL` and `SECTOR2_CARD_POOL` as exports (used as weight groups)

## 2. Drop System

- [x] 2.1 Implement `rollWeightedCards(s1Pool, s2Pool, count, sector, encounterType, rng)` in `src/game/drops.ts` — sector-weighted selection with no duplicates
- [x] 2.2 Update `resolveDrops` to accept encounter type (normal/elite/boss) and use weighted card selection
- [x] 2.3 Remove `getCardPoolForSector()` usage from drops

## 3. UI Integration

- [x] 3.1 Update `CombatScreen.tsx` — pass encounter type (elite/boss/normal) to drop resolution, use weighted pool for card rewards
- [x] 3.2 Update `ShopScreen.tsx` — use weighted pool for shop card selection
- [x] 3.3 Update `RunScreen.tsx` — staging bonus card uses weighted pool (also updated StagingScreen.tsx and event card pick)

## 4. Cleanup

- [x] 4.1 Update `CompendiumScreen.tsx` — updated headers to reflect weighted pools (Common/Advanced), imported CARD_POOL
- [x] 4.2 Update `src/sim/cli.ts` — added CARD_POOL import and mixed-pool preset
- [x] 4.3 Verify no remaining hard-gated sector pool usage
