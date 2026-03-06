## Why

All game progress lives in the browser (IndexedDB + localStorage). If a player switches devices or clears browser data, everything is lost. Players need a zero-infrastructure way to transfer their save between devices without accounts or a backend.

## What Changes

- Add a **save code** system: encode the player's `PermanentState` into a compressed, URL-safe string
- Add **Export** button in the Workshop that generates a share code and copies it to clipboard
- Add **Import** button in the Workshop that accepts a share code and restores the permanent state
- No accounts, no backend, no external dependencies — purely client-side encode/decode

## Capabilities

### New Capabilities

- `save-share`: Encoding, decoding, and UI for exporting/importing save data via share codes

### Modified Capabilities

_None_ — this adds a new feature without changing existing game behavior.

## Impact

- `src/game/persistence.ts` — new encode/decode utility functions
- `src/components/WorkshopScreen.tsx` — export/import UI buttons
- `src/store/permanentStore.ts` — new `importState` action to overwrite from decoded data
