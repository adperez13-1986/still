## Why

Card rewards feel identical every run because pools are hard-gated by sector. S1 always shows the same 15 cards, S2 always shows the same 10. After 2-3 runs you've seen everything. Opening up the pool so any card can appear in any sector — with sector-based weighting — creates surprise and variety without adding new fields or data migration.

## What Changes

- Replace hard-gated sector pools with a single unified pool
- Card reward rolls weight by sector origin: S1 cards more likely in S1, S2 cards more likely in S2, but both can appear anywhere
- Elite and boss encounters shift weights toward S2 (stronger) cards
- Shop uses the same weighted system

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `card-system`: Reward pools become probability-weighted instead of sector-gated
- `combat-system`: Drop resolution uses sector-weighted selection; elite/boss encounters boost S2 card rates

## Impact

- `src/data/cards.ts` — export unified `CARD_POOL` alongside existing sector pools (sector pools become weight groups, not hard gates)
- `src/game/drops.ts` — weighted card selection using sector origin as weight
- `src/components/CombatScreen.tsx` — pass encounter type for weight adjustment
- `src/components/ShopScreen.tsx` — use weighted pool
- `src/components/RunScreen.tsx` — update staging bonus card logic
- `src/sim/cli.ts` — update pool presets
