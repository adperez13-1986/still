## Why

Players have no visual indication of which sector they're currently in. With Sector 2 now live, it's important to show progression context on both the map and combat screens.

## What Changes

- Display a sector indicator on the map/run screen (e.g. "Sector 1" or "Sector 2")
- Display the same sector indicator on the combat screen
- Consistent placement and styling across both screens

## Capabilities

### New Capabilities

(none — this is a small UI addition, not a new capability)

### Modified Capabilities

(none — no spec-level behavior changes, purely visual)

## Impact

- `src/components/RunScreen.tsx` — add sector label to map view
- `src/components/CombatScreen.tsx` — add sector label to combat view
