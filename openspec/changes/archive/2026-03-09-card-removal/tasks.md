## 1. Event type plumbing

- [x] 1.1 Add `'removeCard'` to `EventChoice.outcome.type` union in `narrative.ts`

## 2. CardPicker component

- [x] 2.1 Create `CardPicker.tsx` — full-screen modal showing all deck cards via `CardDisplay`, tap to select, confirm/cancel buttons
- [x] 2.2 Style selected card with highlight border, show confirm button only when a card is selected

## 3. Shop recycler

- [x] 3.1 Add RECYCLER section to `ShopScreen.tsx` below existing services — "Recycle a card — 60 shards" button, disabled when < 60 shards
- [x] 3.2 Add `onRecycle` prop to ShopScreen, wire button to open CardPicker modal
- [x] 3.3 Handle `onRecycle` in `RunScreen.tsx` — call `run.removeCardFromDeck(instanceId)` and deduct 60 shards

## 4. Event card removal

- [x] 4.1 Write Sector 1 event "The Sorting" with `removeCard` choice option in `narrative.ts`
- [x] 4.2 Write Sector 2 event "Letting Go" with `removeCard` choice option in `narrative.ts`
- [x] 4.3 Handle `removeCard` outcome in `RunScreen.tsx` event handler — open CardPicker, remove selected card

## 5. Integration

- [x] 5.1 Pass `deck` to ShopScreen and EventScreen so CardPicker can display current cards
- [x] 5.2 Verify type-check passes and test shop recycler + event removal flows
