## Context

`PermanentState` is persisted in IndexedDB via `src/game/persistence.ts`. The state is a flat object with shards, upgrades, run history, carried part, etc. The game is a static site on GitHub Pages — no backend, no API.

We need a way to serialize this state into a short-ish string that players can copy/paste between devices.

## Goals / Non-Goals

**Goals:**
- Encode `PermanentState` into a compact, URL-safe string
- Provide UI in WorkshopScreen to export (copy) and import (paste) save codes
- Import overwrites the current permanent state entirely

**Non-Goals:**
- Continuous sync or automatic transfer
- Partial merge of save data
- Encryption or tamper-proofing (it's a single-player game — if players want to edit their save, that's fine)
- Sharing via URL (just a copyable string for now)

## Decisions

### 1. Encoding: JSON → compress → base64url

The `PermanentState` object is JSON-serialized, compressed with `CompressionStream('deflate')` (built into all modern browsers), then encoded to base64url. This produces a reasonably compact string without any new dependencies.

**Why not just base64?** Compression cuts the string significantly since JSON has repetitive structure (key names, brackets). `CompressionStream` is a Web API — zero bundle cost.

**Why not a custom binary format?** Not worth the complexity. The state is small (< 2KB JSON). Even uncompressed base64 would be manageable, but compression makes it nicer.

### 2. Version prefix for forward compatibility

The share code is prefixed with a version byte (`v1:` prefix) so future changes to the format can be detected and handled.

Format: `v1:<base64url-encoded-compressed-json>`

### 3. Import replaces state entirely, with confirmation

Import overwrites the full `PermanentState`. The UI shows a confirmation dialog before applying. No partial merge — it's a full state transfer.

### 4. UI placement: Workshop screen, bottom section

Export/Import buttons go at the bottom of WorkshopScreen — accessible but not prominent. Export copies to clipboard and shows a brief "Copied!" feedback. Import shows a text input for pasting the code.

## Risks / Trade-offs

- **[State evolution]** → If `PermanentState` shape changes in a future update, old share codes could fail to import. The `v1:` prefix lets us handle migrations. For now, we do a best-effort merge with defaults for missing fields.
- **[No validation]** → A corrupted or hand-edited code could produce bad state. We validate the decoded JSON has the expected shape before importing, rejecting malformed codes with an error message.
- **[CompressionStream availability]** → Supported in all modern browsers (Chrome 80+, Firefox 113+, Safari 16.4+). Our target audience (playing a web game) will have these. No polyfill needed.
