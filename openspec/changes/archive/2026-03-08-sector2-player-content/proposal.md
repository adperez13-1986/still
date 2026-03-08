## Why

S2 enemies punish the player's Heat state and disable body slots. The player needs S2-tier cards, equipment, and parts that give tools to respond — better cooling, slot-independence, heat exploitation, and stronger scaling. Without S2 player content, the staging area bonus reward has nothing to pull from and S2 enemy drop pools have no items to reference.

## What Changes

- Add `SECTOR2_CARD_POOL` — ~10-12 new modifier cards that interact with S2 mechanics (slot disabling, heat-conditional effects, stronger versions of S1 archetypes)
- Add S2 equipment — stronger baseline equipment with more interesting heat interactions and potential drawbacks
- Add S2 behavioral parts — parts that respond to S2 enemy mechanics (e.g., "when a slot is disabled, draw 2 cards")
- Update card reward logic to use sector-appropriate pools
- Update shop offerings to be sector-aware
- Replace placeholder S1 item references in S2 enemy drop pools with real S2 items

## Capabilities

### New Capabilities
- `sector2-content`: The S2 card pool, equipment, and behavioral parts — player-side content that answers S2 enemy challenges

### Modified Capabilities
- `modifier-cards`: Card reward selection becomes sector-aware (S1 rooms offer S1 cards, S2 rooms offer S2 cards)

## Impact

- `src/data/cards.ts` — new S2 modifier card definitions, `SECTOR2_CARD_POOL` export
- `src/data/parts.ts` — new S2 equipment and behavioral parts
- `src/data/enemies.ts` — update S2 drop pool references from S1 placeholders to S2 items
- `src/store/runStore.ts` or reward logic — sector-aware card/shop offerings
