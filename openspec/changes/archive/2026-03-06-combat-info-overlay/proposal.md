## Why

During combat, players cannot view their full deck, equipment, or parts. The RunInfoOverlay already exists and is accessible from the map screen, but not from combat. Players need this information mid-fight to make informed decisions about modifier card assignments and heat management.

## What Changes

- Add a trigger button to CombatScreen that opens the existing RunInfoOverlay during combat
- No new components needed — reuse RunInfoOverlay as-is

## Capabilities

### New Capabilities

_None_ — reusing an existing component in a new context.

### Modified Capabilities

- `game-core`: Combat UI gains access to the run info overlay (deck/equips view)

## Impact

- `src/components/CombatScreen.tsx` — add state for overlay tab, import RunInfoOverlay, add trigger button
