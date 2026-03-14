## 1. Restructure resolveDrops

- [x] 1.1 In `drops.ts`, change `resolveDrops` to always include 3 card choices from sector pool (using existing `getCardPoolForSector` + shuffle + slice)
- [x] 1.2 Change bonus roll to only consider `part` and `equipment` entries (ignore `card` entries in drop pool)
- [x] 1.3 Keep equipment pity logic on the bonus roll
- [x] 1.4 Keep shard logic unchanged (always award shards)

## 2. Simplify enemy drop pools

- [x] 2.1 Remove all `card` entries from every enemy's `dropPool` in `enemies.ts` — cards are now guaranteed from the sector pool
- [x] 2.2 Ensure every enemy still has at least a `shards` entry (verified — all enemies retain shards entry)

## 3. Verify reward screen handles new structure

- [x] 3.1 Check `RewardScreen.tsx` — updated to support opt-in part/equipment drops (tap to take, tap again to undo)
- [x] 3.2 Updated `CombatScreen.tsx` — respects skipped parts/equipment in reward collection
- [x] 3.3 Playtest: verify every combat gives a card choice
- [x] 3.4 Playtest: verify part/equipment drops still appear as bonus on eligible enemies
- [x] 3.5 Playtest: verify skip works for cards, parts, and equipment
