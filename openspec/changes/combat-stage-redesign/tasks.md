## 1. Layout Hook & Top Toolbar

- [x] 1.1 Added `src/hooks/useScreenLayout.ts` — `useSyncExternalStore` over `(orientation: portrait) and (max-width: 600px)` matchMedia
- [x] 1.2 Added `src/components/CombatTopBar.tsx` with `variant: 'bar' | 'stage'`. Bar = full-width row with segmented strain (4 cells). Stage = absolute overlays (top-left meta, top-center 240×4 slim strain, top-right PLAN pill).

## 2. Portrait Layout — Threats

- [x] 2.1 Added `src/components/ThreatCard.tsx` — sprite + name + thin HP + intent chip + status badges; yellow border + target pip when selected; dimmed + grayscale when defeated
- [x] 2.2 Added `src/components/ThreatGrid.tsx` — `// INCOMING ×N` header + `tap to retarget` hint, 2-col grid, threads damageNumbers + onTarget

## 3. Portrait Layout — Player Zone

- [x] 3.1 Added `src/components/HandRail.tsx` — vertical card cells with name/cost/description/tag and inline `PUSH +Ns` toggle for pushable cards
- [x] 3.2 Added `src/components/BodyRig.tsx` — faint Still silhouette + 4 absolutely-positioned slot cells (HEAD top, ARMS left, TORSO center, LEGS bottom) with valid-target highlight, active-slot glow, modifier pip, projection chips
- [x] 3.3 Added `src/components/StatsRail.tsx` — HP / BLK / EN pills + D / X pile mini-readout; renders `target === 'still'` floats inside the rail
- [x] 3.4 Added `src/components/PlayerZone.tsx` — 3-col grid `1.1fr 1.3fr 0.9fr` wrapping HandRail / BodyRig / StatsRail

## 4. Portrait Layout — Action Bar & Battle Log

- [x] 4.1 Added `src/components/BattleLog.tsx` — pure `formatLogLine` helper maps `slotFire` / `enemyAction` / `partTrigger` to coloured spans; renders last 3 events with `R<round>` meta tag, most-recent highlighted
- [x] 4.2 Added `src/components/ActionBar.tsx` — info icon + contextual hint on the left, EXECUTE / END PLANNING button on the right; disabled during replay

## 5. Landscape Layout — Cinematic Stage

- [ ] 5.1 Add `src/components/StageEnemy.tsx` — chrome-less stage figure. Props: `instance`, `definition`, `selected`, `depth`, `shift`, `onClick`, `onLongPress`. Renders intent chip above sprite, sprite at `pixelSize=4` with `transform: translateX(shift) scale(1 - depth × 0.27)` and `filter: brightness(1 - depth × 0.15)`, thin HP slice below sprite (hidden at 100% HP). Selected: yellow drop-shadow + caret. Defeated: `opacity 0.25 grayscale(1)` no chip.
- [ ] 5.2 Add `src/components/EnemyStack.tsx` — depth-staggered column. `flex-direction: column-reverse`, anchored bottom. Maps `combat.enemies` to `<StageEnemy>` with per-index `depth` and `shift` from `[0, -36, 24, -48, 32, -28, 16]`. Renders per-enemy damage floats inside each wrapper.
- [ ] 5.3 Add `src/components/StillStage.tsx` — Still sprite + floating chips. Sprite at `pixelSize=6` on the stage left. Above the sprite: 3 chip pills (HP `current/max`, BLK `value` if > 0, EN `current/max`). Below: "STILL" label. Renders `target === 'still'` damage floats inside the wrapper.
- [ ] 5.4 Add `src/components/CombatStage.tsx` — stage container. `height: clamp(420px, 60vh, 640px)` (or comparable for the landscape panel sizing — verify against screenshot 2). Background: radial + linear gradient. Floor band: `linear-gradient(to top, rgba(13,13,26,0.85), transparent)` 80 px tall. Renders `<CombatTopBar variant="stage">` overlays, `<StillStage>`, `<EnemyStack>` in left/right halves.

## 6. Landscape Layout — Control Deck

- [ ] 6.1 Add `src/components/BodyRow.tsx` — horizontal 4-cell row. Header: `// BODY · 4 SLOTS`. Each cell: label, equip name, action summary, modifier pip. Tap → assign selected card. Active-slot highlight during replay.
- [ ] 6.2 Add `src/components/HandRow.tsx` — horizontal card row. Header: `// HAND · N · D# · X#`. Each card: same content as the rail card (name, cost, description, tag, push indicator) but in a more compact horizontal cell. Horizontal scroll if overflow.
- [ ] 6.3 Add `src/components/TargetCard.tsx` — pinned bottom-left of panel. Shows targeted enemy name, `HP current/max`, optional modifier line (`VULN ×N.M` derived from status effects). Empty state: "TARGET — pick an enemy".
- [ ] 6.4 Add `src/components/ControlDeck.tsx` — wraps the right panel. Vertical flex: BodyRow + HandRow stacked top, TargetCard + EXECUTE pinned bottom (TargetCard left, EXECUTE right).

## 7. CombatScreen Wiring

- [ ] 7.1 In `src/components/CombatScreen.tsx`, add `import useScreenLayout from '../hooks/useScreenLayout'` and call it; replace `useIsMobile()` for the *combat layout decision only* (existing `isMobile` references for the early-return sub-screens stay, but the main `return` branches on `useScreenLayout()`)
- [ ] 7.2 Remove the outer `<StrainMeter>` line entirely — both layouts render their own strain via `<CombatTopBar>`
- [ ] 7.3 Remove the existing inline desktop side-by-side block (`<StillPanel>` + enemy flex-wrap) and the existing inline mobile stack
- [ ] 7.4 Replace the main combat-view `return (...)` with a branch:
  ```tsx
  return layout === 'portrait' ? (
    <PortraitLayout {...allProps} />
  ) : (
    <LandscapeLayout {...allProps} />
  )
  ```
  where the two layouts are inline JSX trees inside CombatScreen, composed of the new components from sections 2–6
- [ ] 7.5 Thread combat state (`combat`, `run.health`, `run.maxHealth`, `run.parts`, `run.equipment`), animation overrides (`displayHealth`, `displayBlock`, `displayEnemyHealth`, `damageNumbers`, `activeSlot`, `activePartIds`), and interaction state (`selectedCardId`, `pushed`, `targetEnemyId`, `effectiveTarget`, `infoTab`, `pileView`) into the appropriate sub-components
- [ ] 7.6 Wire interaction callbacks: `setSelectedCardId`, `setPushed`, `setTargetEnemyId`, `setInfoTab`, `setPileView`, `handleAssignSlot`, `handleUnassignSlot`, `handleExecute`
- [ ] 7.7 Confirm the existing reward / forfeit / defeat / equip-conflict / part-replacement early-returns still render full-screen and bypass the new layouts

## 8. Push Toggle Migration

- [ ] 8.1 Remove the existing PUSH toggle from the hand header (the "PUSH +Ns" button I added during the strain revival sits in the hand-section header; that header is gone in the new layout). The toggle moves into the card cells themselves (HandRail / HandRow), implemented in 3.1 / 6.2.
- [ ] 8.2 Verify the `pushed` state in `CombatScreen` is set correctly when the player taps a card's push indicator; assignment via `handleAssignSlot(slot, pushed)` continues to work

## 9. Damage-Number / Replay Integrity

- [ ] 9.1 Confirm `damageNumbers` filtered by `target === 'still'` render anchored to BodyRig (portrait) and StillStage (landscape)
- [ ] 9.2 Confirm `damageNumbers` filtered by `target === enemy.instanceId` render anchored to ThreatCard (portrait) and StageEnemy (landscape) wrappers
- [ ] 9.3 Confirm `displayEnemyHealth` overrides flow to ThreatCard / StageEnemy and animate the per-enemy HP slice
- [ ] 9.4 Confirm `displayHealth` and `displayBlock` overrides flow to BodyRig (portrait) and StillStage (landscape) and animate the relevant readouts
- [ ] 9.5 Confirm `activeSlot` highlight fires for the firing slot in BodyRig (portrait) and BodyRow (landscape) during replay
- [ ] 9.6 Confirm defeated enemies stay in their wrapper at `opacity 0.25 grayscale(1)` until the reward phase replaces the view

## 10. Battle Log Implementation

- [ ] 10.1 Add `formatLogLine(event: CombatEvent, round: number): { meta: string, parts: Array<{ text: string, color?: string }> }` pure function. Maps `slotFire` → "Still hit Drone for 6", `enemyAction` → "Drone struck Still for 6", `partTrigger` → "<Part> triggered". Coloured spans for damage (red), block (blue), heal (green).
- [ ] 10.2 `<BattleLog>` reads the last 3 events from `combat.combatLog`, renders them via `formatLogLine`. Most-recent event slightly brighter.
- [ ] 10.3 Decide landscape battle-log placement: stage-bottom strip vs omit. Default: omit for v1; revisit if playtest signal asks for it.

## 11. Type Check + Build + Dev Server

- [ ] 11.1 `npx tsc -p tsconfig.app.json --noEmit` passes
- [ ] 11.2 `npx vite build` succeeds
- [ ] 11.3 `npx vite` runs the dev server; combat opens with the appropriate layout for the viewport

## 12. Manual Verification

- [ ] 12.1 **Portrait (375×667 or 393×852):** layout renders top toolbar, threat grid (2×2), battle log, player zone (hand-left / body-rig / stats-right), action bar. Tap a card → it highlights. Tap a body slot → card assigns. Tap an enemy → card border/glow updates. Push pushable card → indicator toggles. Execute → replay animates correctly with HP bars + damage floats anchored.
- [ ] 12.2 **Landscape (852×393 phone OR desktop ≥ 600 wide):** stage on left with Still sprite + floating chips + enemy stagger; right panel with body row + hand row + target card + EXECUTE. Same interactions as portrait.
- [ ] 12.3 **Rotation:** rotate phone (or resize browser across the breakpoint) — layout swaps without losing combat state, selection, or replay progress.
- [ ] 12.4 **Reward / forfeit / defeat:** all three sub-screens still render full-screen as before.
- [ ] 12.5 **Equipment-conflict modal:** still appears when picking up gear during a victory.
- [ ] 12.6 **Multi-enemy combat:** portrait shows up to 4 enemies in the 2×2 grid; landscape stagger reads correctly with depth.
- [ ] 12.7 **Single-enemy combat:** portrait shows one card centered (or top-left of the grid); landscape shows the enemy at depth 0 (no jitter).

## 13. Cleanup (deferred to follow-up)

- [ ] 13.1 Once the new layout ships and is validated, file a follow-up change to delete `src/components/EnemyCard.tsx`, `src/components/StillPanel.tsx`, `src/components/BodySlotPanel.tsx`, `src/components/Hand.tsx` (no longer referenced by CombatScreen) — verify no other component imports them first.
- [ ] 13.2 Delete `design-handoff/` after archive (or keep as design history per user preference).
- [ ] 13.3 **Author missing enemy sprites.** `src/data/sprites.ts` has no entries for these enemy ids — they all fall back to `UNKNOWN_SPRITE` (the gray figure), making them indistinguishable on the new stage: `thermal-scanner`, `signal-jammer`, `thorn-sentinel`, `feedback-drone`, `strain-siphon`, `overload-core`, `fracture-host`, `echo-shell`. Pre-existing data gap surfaced by the stage redesign. Pixel-sprite design + palette per enemy needed.

## 14. Optional Polish (defer if tight on time)

- [ ] 14.1 Enemy idle bob (landscape only): `@keyframes` 3 s ease-in-out, ±2 px Y, random per-enemy delay (0–1.5 s)
- [ ] 14.2 Hit shake (both layouts): when a damage event with `target === instanceId` is added, set a transient `shake` flag; translate ±4 px X over 100 ms
- [ ] 14.3 Target reticle pulse (landscape): yellow drop-shadow oscillates 4–8 px blur over 1.5 s

## 15. Memory & Docs

- [ ] 15.1 After ship, add a one-line entry to MEMORY.md noting that combat now uses the paper-doll (portrait) / cinematic-stage (landscape) layouts; obsolete `unified-action-slots` UI memory remains archived.
