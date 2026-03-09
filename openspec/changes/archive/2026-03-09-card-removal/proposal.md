## Why

Player decks only grow — there's no way to remove cards. This causes inevitable dilution where good cards get buried under mediocre ones, and prevents players from specializing their builds after committing to a direction. Card removal is a core deckbuilder lever that's currently missing.

## What Changes

- Add a "Recycler" service to the shop that lets players pay 60 shards to remove any card from their deck
- Add a `removeCard` outcome type to the event system
- Write 2-3 events that offer card removal as a choice (bundled with tradeoffs — not free removal)
- Create a shared CardPicker UI for selecting which card to remove (used by both shop and events)
- No minimum deck size restriction — the body slot system and heat naturally discourage over-thinning

## Capabilities

### New Capabilities

- `card-removal`: Card removal via shop recycler and event choices, including card picker UI

### Modified Capabilities

- `narrative`: New `removeCard` outcome type for event choices

## Impact

- `src/components/ShopScreen.tsx` — add Recycler service with card picker
- `src/components/EventScreen.tsx` — handle `removeCard` outcome
- `src/components/RunScreen.tsx` — wire up removal handler
- `src/data/narrative.ts` — add events offering card removal
- `src/game/types.ts` — add `removeCard` event outcome type
- `src/store/runStore.ts` — add `removeCardFromDeck` action
- New: `src/components/CardPicker.tsx` — shared card selection UI
