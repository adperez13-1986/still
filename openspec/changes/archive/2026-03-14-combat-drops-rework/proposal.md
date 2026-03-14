## Why

Shard-only combat rewards feel like a waste — the player took HP damage (a real cost) and got currency that may not help if the shop doesn't appear or doesn't stock what's needed. Every deckbuilder roguelite (StS, Monster Train, etc.) guarantees a meaningful choice after combat. We should too.

## What Changes

- Every combat guarantees a card choice (3 options from sector pool) alongside shards — no more shard-only outcomes
- Remove the weighted roll between shards and bonus drops — shards are always awarded, and a card choice is always awarded
- Part and equipment drops remain as bonus rolls on top (from enemy-specific drop pools), keeping them special
- Shard amounts on enemies can be tuned down slightly since they're no longer competing with bonus drops

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `combat-system`: Drop resolution always includes a card choice alongside shards

## Impact

- `src/game/drops.ts` — restructure `resolveDrops` to always include shards + card choice, with part/equipment as bonus
- `src/data/enemies.ts` — simplify drop pools (remove card entries since cards are guaranteed; keep part/equipment entries as bonus chances)
- `src/components/RewardScreen.tsx` — may need minor adjustments if reward display assumptions change
