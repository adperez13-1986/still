## Context

Player decks grow through combat rewards, shop purchases, and events but have no way to shrink. The store already has `removeCardFromDeck(instanceId)` — the infrastructure exists but has no UI or gameplay hooks. Shops sell cards (40-75 shards) and parts (45-90 shards). Events use a typed outcome system (`health | shards | card | status`).

## Goals / Non-Goals

**Goals:**
- Let players remove cards at the shop via a "Recycler" service (60 shards)
- Add `removeCard` as a new event outcome type
- Write 2-3 events that include card removal choices
- Create a reusable CardPicker component for selecting which card to remove

**Non-Goals:**
- Minimum deck size enforcement — slot system and heat provide natural limits
- Card upgrade/transform system — separate feature
- Balancing 0-heat system cards — flagged as separate rebalance change

## Decisions

### Removal cost — flat 60 shards

Flat cost regardless of card rarity. 60 shards sits between common card cost (40) and uncommon card cost (55), making it a meaningful investment that competes with buying cards/parts. Scaling by rarity adds complexity without much design benefit — the value of removing a card depends on your deck, not the card's rarity.

Alternative: 50 shards (too cheap, easy to mass-remove), scaling by rarity (adds friction, hard to price correctly).

### CardPicker UI — modal overlay with deck grid

A full-screen modal showing all cards in the player's deck. Tap a card to select it, then confirm to remove. Same CardDisplay component used elsewhere. No filtering or sorting needed — decks are small (8-15 cards typically).

The CardPicker is a shared component accepting `deck`, `onSelect`, and `onCancel` props. Both shop and event flows render it the same way.

Alternative: Inline card list in the shop — cramped, doesn't scale, harder to reuse for events.

### Shop integration — "Recycler" section below existing services

Add a RECYCLER section after cards/parts/repair in the shop. Shows a single button: "Recycle a card — 60 shards". Tapping opens the CardPicker modal. After selection, the card is removed and shards are deducted. The recycler is always visible (even if player can't afford it), greyed out when insufficient shards.

### Event outcome — new `removeCard` type

Add `'removeCard'` to the `EventChoice.outcome.type` union. When the event outcome fires, it opens the CardPicker. The `value` field encodes bonus health granted on removal (0 = no bonus, 10 = heal 10 HP). This lets Sector 2 events offer strictly better removal rewards than Sector 1.

Event handler in RunScreen: when outcome type is `removeCard`, set a state flag that renders CardPicker. On card selection, call `run.removeCardFromDeck(instanceId)` and proceed.

### New events — removal bundled with tradeoffs

Events offering removal should feel like narrative moments, not free shop visits:
- One event where removal is the "cost" to gain something (remove card → gain shards/health)
- One event where removal is the "reward" alongside other options
- Events split across Sector 1 and Sector 2 pools

## Risks / Trade-offs

- **Thin deck + 0-heat system cards is strong** → Known issue, flagged for separate heat cost rebalance. 60 shard cost means thinning to a 6-card deck requires ~360 shards of investment, which is a meaningful opportunity cost.
- **CardPicker adds UI complexity to event flow** → Events currently resolve instantly. Adding a card picker creates a two-step flow (choose event option → choose card). Manageable with a simple state flag in RunScreen.
