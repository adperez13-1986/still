## 1. Generous Drop Model

- [x] 1.1 Rework `resolveDrops()` in `src/game/drops.ts`: split pool into shard and non-shard entries, always resolve shards (pick highest-weight shard entry, apply ±20% variance), then if non-shard entries exist do a weighted roll among them for a bonus drop. Return combined array.

## 2. Reward Screen Visibility

- [x] 2.1 Update `RewardScreen` to accept and display all drop types: show shard amount (`+N shards`), part name (`Found: <name>`), and equipment name (`Found: <name>`) in a summary section above the card picker or Continue button
- [x] 2.2 In `CombatScreen.tsx` — not needed, RewardScreen derives all info from existing `drops` prop reward phase, pass shard total, part names, and equipment names to `RewardScreen` as props (derive from `allDrops` before the `onChoose` callback)

## 3. Starting Deck Rebalance

- [x] 3.1 In `src/data/cards.ts`, change `STARTING_CARDS` from `[boost, boost, boost, emergencyStrike, emergencyStrike, coolantFlush, coolantFlush, diagnostics]` to `[boost, boost, boost, emergencyStrike, emergencyShield, coolantFlush, coolantFlush, diagnostics]`
