## 1. Save run state at safe points

- [x] 1.1 Add a `saveRun` action to the run store that serializes current state (with `combat: null`) to localStorage via `saveRunState`
- [x] 1.2 Call `saveRun` inside `finishRoom` in `RunScreen.tsx` after `clearCurrentRoom`
- [x] 1.3 Call `saveRun` after `startRun` in `RunScreen.tsx` (save initial state so even the first room can be recovered)

## 2. Clear on run end

- [x] 2.1 Call `clearRunState` inside `endRun` action in `runStore.ts`

## 3. Restore on app load

- [x] 3.1 Add a `restoreRun` action to the run store that loads from localStorage, validates, and hydrates state (wrapped in try/catch — clear on failure)
- [x] 3.2 In `WorkshopScreen.tsx` on mount, check for saved run and offer "Continue Run" button (or auto-resume — user preference)
- [x] 3.3 "Continue Run" calls `restoreRun` and navigates to `/run`

## 4. Verification

- [x] 4.1 Test: start run, complete a room, reload page — run resumes on map
- [x] 4.2 Test: reload mid-combat — run resumes on map with room uncleared
- [x] 4.3 Test: finish run (victory/defeat) — no stale save on next load
