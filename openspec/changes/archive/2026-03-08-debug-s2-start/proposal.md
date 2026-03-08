## Why

Testing Sector 2 requires playing through all of Sector 1 first. A debug shortcut to start directly in S2 with a representative loadout saves time.

## What Changes

- Add `?debug=s2` query parameter support to RunScreen
- When present, starts a Sector 2 run with S1+S2 cards, equipment in all slots, a behavioral part, and extra health/shards

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- `src/components/RunScreen.tsx` — debug branch in run initialization
