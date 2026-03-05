## Why

Combat rewards feel invisible and stingy. Parts and equipment are auto-collected with zero feedback — the player never sees them. Drop pools are heavily weighted toward shards (75-80%), making interesting rewards rare. The starting deck also lacks defensive options (2x Emergency Strike, 0x Emergency Shield).

## What Changes

- **Reward screen shows all drops**: shards amount, part names, equipment names displayed before the card picker
- **Generous drop model**: every combat always drops shards, then also rolls for an additional reward (card, part, or equipment) from the remaining pool
- **Starting deck rebalance**: swap one Emergency Strike for one Emergency Shield

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `modifier-cards`: Starting deck composition changes (1x Emergency Strike swapped for 1x Emergency Shield)

## Impact

- `src/game/drops.ts` — Rework `resolveDrops()` to always include shards + roll for a bonus drop
- `src/components/RewardScreen.tsx` — Display all drop types (shards, parts, equipment) visually
- `src/data/cards.ts` — Change `STARTING_CARDS` array
