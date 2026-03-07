# Tasks

- [x] Fix TypeScript build — cast Uint8Array via unknown to BufferSource
- [x] Add `heatAtExecution`, `heatDmgContrib`, `heatBlkContrib`, `heatHealContrib` to `SlotProjection`
- [x] Compute heat contribution by dual-resolving each slot (real heat vs Cool baseline)
- [x] Add `ThresholdBadge` component — per-slot `@Cool`/`@Warm`/`@Hot` label
- [x] Add `HeatValueDisplay` component — `base+bonus` breakdown with orange heat portion
- [x] Update compact (mobile) body slot projections
- [x] Update desktop body slot projections
- [x] Fix projected heat bug — derive from `projectSlotActions` instead of `projectHeat`
- [x] Add next-round heat preview to HeatTrack (desktop)
- [x] Add heat projection chain to compact StillPanel (mobile): `H 4/10 →7 →5`
- [x] Fix target auto-switch when targeted enemy dies
- [x] Show shard count on map floating info bar
