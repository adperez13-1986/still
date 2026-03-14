## 1. Remove Fragment System

- [x] 1.1 Delete `FragmentScreen.tsx` component
- [x] 1.2 Remove `/fragment` route from router
- [x] 1.3 Remove `FragmentBonus` type from `types.ts`
- [x] 1.4 Remove fragment state from `permanentStore.ts`: `fragmentsAccumulated`, `lastSeenTimestamp`, `FRAGMENT_RATE_PER_HOUR`, `MAX_FRAGMENT_HOURS`, offline calculation in `load`, `collectFragments`, `spendFragments`, fragment accumulation in `tick`
- [x] 1.5 Remove Fragment Reservoir upgrade (`fragment-cap`) from `WorkshopScreen.tsx` and `permanentStore.ts`
- [x] 1.6 Remove fragment display from `WorkshopScreen.tsx` (fragment count, "Begin Run" → Fragment route navigation)
- [x] 1.7 Remove fragment bonus consumption from `RunScreen.tsx` — remove `location.state` bonuses handling, `sessionStorage` flag pattern (`still-run-bonuses-consumed`), and bonus application to starting HP/shards/draw
- [x] 1.8 Clean up `endRun` in `runStore.ts` — remove `sessionStorage.removeItem('still-run-bonuses-consumed')`

## 2. Part Archive State

- [x] 2.1 Add `PartArchiveEntry` interface to `types.ts`: `{ partId: string, sector: 1 | 2, cooldownLeft: number }`
- [x] 2.2 Add `partArchive: Record<string, PartArchiveEntry>` and `selectedArchivePart: string | null` to `PermanentState`
- [x] 2.3 Add `quick-recovery` to `WorkshopUpgradeId` type and default state
- [x] 2.4 Add permanentStore actions: `addToArchive(partId, sector)`, `selectArchivePart(partId | null)`, `triggerCooldown(partId)`, `decrementAllCooldowns()`
- [x] 2.5 Add migration in `permanentStore.load`: convert existing `carriedPart` string to first archive entry (sector 2, cooldown 0), remove `fragmentsAccumulated`/`lastSeenTimestamp`, remove `fragment-cap` upgrade

## 3. Sector-Gated Activation

- [x] 3.1 Add `carriedPartSector` field to run state for sector-gated activation tracking
- [x] 3.2 Update `RunScreen.tsx` run initialization: load selected archive part with sector gate — S1 parts active immediately, S2 parts inert until sector advance
- [x] 3.3 Update `runStore.ts` combat context: filter inert parts via `getActiveParts()` so S2 parts don't fire in S1
- [x] 3.4 Sector advance automatically activates inert parts — `getActiveParts()` checks current sector dynamically

## 4. Cooldown System

- [x] 4.1 On run victory in `CombatScreen.tsx` (boss defeat): call `triggerCooldown` for the carried part if it was active during the run
- [x] 4.2 On every run end (victory or defeat): call `decrementAllCooldowns` to tick down all archive cooldowns
- [x] 4.3 Add archive part additions at run end: scan run's collected parts, call `addToArchive` for each new one with sector tracking
- [x] 4.4 Track sector of part acquisition in run state — uses `run.sector` at end-of-run to determine origin sector

## 5. Workshop UI

- [x] 5.1 Add Quick Recovery upgrade to `WorkshopScreen.tsx` (id: `quick-recovery`, cost: 120, description: "Archive cooldowns reduced by 1")
- [x] 5.2 Add Part Archive section to `WorkshopScreen.tsx`: display all archived parts, ready parts selectable, cooldown parts grayed with "N runs left", selected part highlighted
- [x] 5.3 Change Workshop "Begin Run" to navigate directly to `/run` (no fragment screen)
- [x] 5.4 Archive additions notification replaces CarrySelectOverlay at run end in WorkshopScreen

## 6. Run End Integration

- [x] 6.1 Update run end flow: after victory/defeat, add collected parts to archive, apply cooldown on win (if carried part was active), decrement all cooldowns
- [x] 6.2 Update `WorkshopScreen.tsx` run-end entry: remove old carry select trigger, show archive additions notification instead

## 7. Cleanup & Polish

- [x] 7.1 Update `RunInfoOverlay.tsx`: show carried part with sector gate status (active vs "S2")
- [x] 7.2 Update save/load in `permanentStore.ts`: include `partArchive` and `selectedArchivePart` in serialization
- [x] 7.3 Update export/import in `WorkshopScreen.tsx`: include archive state in save codes
- [x] 7.4 Playtest: verify fragment removal, archive selection, sector gating, cooldown rotation
