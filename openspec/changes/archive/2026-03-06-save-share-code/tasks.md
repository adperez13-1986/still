## 1. Encode/Decode Utilities

- [x] 1.1 Add `encodeSaveCode(state: PermanentState): Promise<string>` to `src/game/persistence.ts` — JSON → deflate compress → base64url, prefixed with `v1:`
- [x] 1.2 Add `decodeSaveCode(code: string): Promise<PermanentState>` to `src/game/persistence.ts` — validate version prefix, base64url → inflate → JSON parse, merge with defaults for missing fields, throw on invalid

## 2. Store Integration

- [x] 2.1 Add `importState(state: PermanentState): Promise<void>` action to `permanentStore.ts` — overwrites current state and persists to IndexedDB

## 3. Workshop UI

- [x] 3.1 Add Export/Import section to the bottom of `WorkshopScreen.tsx` — "Export Save" button that copies code to clipboard with "Copied!" feedback
- [x] 3.2 Add Import flow — text input for pasting code, confirmation warning, error display on invalid code
