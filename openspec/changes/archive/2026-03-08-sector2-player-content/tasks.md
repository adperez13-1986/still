## 1. S2 Modifier Cards

- [x] 1.1 Add ~10-12 S2 modifier card definitions to `src/data/cards.ts` with upgraded variants
- [x] 1.2 Export `SECTOR2_CARD_POOL` array
- [x] 1.3 Update `ALL_CARDS` to include S2 cards
- [x] 1.4 Implement any new card mechanics needed (e.g., disabled-slot-conditional effects, Retain keyword)

## 2. S2 Equipment

- [x] 2.1 Add S2 equipment definitions to `src/data/parts.ts` (2 per slot, ~8 total)
- [x] 2.2 Update `EQUIPMENT` and `ALL_EQUIPMENT` exports to include S2 items

## 3. S2 Behavioral Parts

- [x] 3.1 Add S2 behavioral part definitions to `src/data/parts.ts` (~6 parts)
- [x] 3.2 Update `BEHAVIORAL_PARTS` and `ALL_PARTS` exports to include S2 parts
- [x] 3.3 Implement any new trigger/effect types needed (e.g., onSlotDisabled trigger, conditional damage bonus)

## 4. Sector-Aware Rewards

- [x] 4.1 Update card reward selection in combat to pull from sector-appropriate pool (check `run.sector` or room's sector)
- [x] 4.2 Update shop offerings to be sector-aware
- [x] 4.3 Update staging area bonus reward to pull from next sector's pools

## 5. Drop Pool Integration

- [x] 5.1 Replace S1 placeholder items in S2 enemy drop pools with real S2 card/part/equipment IDs
