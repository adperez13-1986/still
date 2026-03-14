## Context

`persistence.ts` already exports `saveRunState`, `loadRunState`, and `clearRunState` using localStorage. They're just never called. The run store is a zustand + immer store with the full `RunState` interface.

## Goals / Non-Goals

**Goals:**
- Run survives page reloads (Vite HMR, accidental refresh, browser restart)
- Save at safe points (map navigation, not mid-combat-animation)
- Restore to map screen on load

**Non-Goals:**
- Mid-combat save/restore (combat state includes animation refs, timers — too fragile)
- Cloud save / cross-device sync
- Multiple save slots

## Decisions

### Save at room transitions, not continuously
Save the run state when: a room is completed (combat won, shop left, event resolved, staging done). This means if you reload mid-combat, you restart that combat — but you don't lose the whole run.

To implement: combat state is nulled out before saving so we always restore to the map.

### Restore on app load
On app mount, check for a saved run. If found, hydrate the run store and navigate to the map. If not, show the workshop as normal.

### Clear on run end
When a run ends (victory or defeat), clear the saved state so the next load starts fresh.

## Risks / Trade-offs

- **localStorage size**: RunState JSON is small (~5-10KB). Not a concern.
- **Schema drift**: If RunState shape changes between versions, a stale save could break. Mitigate by wrapping restore in try/catch and clearing on failure.
