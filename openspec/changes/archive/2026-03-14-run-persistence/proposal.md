## Why

The run state lives only in zustand memory. Any page reload (including Vite HMR reconnect after idle) kills the active run. Players lose progress mid-run with no way to recover.

## What Changes

- Save run state to localStorage after every meaningful map event (room completion, shop exit, staging exit, combat victory)
- Restore run state on page load if a saved run exists
- Clear saved run on run end (victory or defeat)
- Resume takes the player back to the map screen (not mid-combat — combat state is too complex to reliably restore)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `game-core`: Run state persists across page reloads via localStorage

## Impact

- `src/store/runStore.ts` — add save/restore/clear calls using existing `saveRunState`/`loadRunState`/`clearRunState` from persistence.ts
- `src/game/persistence.ts` — already has the utilities, no changes needed
- `src/components/RunScreen.tsx` or `WorkshopScreen.tsx` — restore saved run on mount
