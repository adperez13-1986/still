## Context

Source of truth: the two screenshots in `design-handoff/` and `design-handoff/mock.html` (a self-contained mobile mock with three body-rig variants — we ship "Paper Doll" / variant A). The README and SPEC docs in that folder are inconsistent with the screenshots and are NOT load-bearing for this change.

The current CombatScreen is a single component with one `useIsMobile` branch deciding between a vertically-stacked compact layout and a desktop side-by-side layout. Both use the existing `<EnemyCard>`, `<StillPanel>`, `<BodySlotPanel>`, `<Hand>` components. The strain-revival change kept those wired and added a `<StrainMeter>` at the top, a push toggle in the hand header, and a forfeit early-return.

Game logic, store wiring, replay loop, damage-number system, and the reward / forfeit / defeat / equip-conflict / part-replacement sub-screens are stable and out of scope.

## Goals / Non-Goals

**Goals:**
- The portrait layout matches `design-handoff/mock.html` "Paper Doll" variant + screenshot 1.
- The landscape layout matches screenshot 2.
- Layout choice keys off aspect ratio + width, so phone-landscape and desktop both get the cinematic stage. Phone-portrait gets the paper-doll player zone.
- Existing replay loop, damage-number anchoring, target selection, push-toggle, forfeit detection, reward flow all keep working — re-routed through new component wrappers but logically unchanged.
- Mobile portrait is *redesigned*, not just compacted. The previous "stack the existing components vertically" approach is replaced.

**Non-Goals:**
- No game logic changes — `useRunStore`, `combat.executeTurn`, `projectSlotActions`, `CombatEvent` are read-only references.
- No types changes. `game/types.ts` is untouched.
- No 5th body slot. The mock shows 5; the game has 4. We render 4 in the silhouette and leave Arm L / Arm R split as a separate change.
- No new dependencies. Inline `style` + a few `<style>` keyframe blocks, matching the project's pattern.
- No reward / forfeit / equip-conflict / part-replacement / defeat redesign — these sub-views remain as-is in `CombatScreen.tsx`.
- No changes to existing `EnemyCard.tsx`, `StillPanel.tsx`, `BodySlotPanel.tsx`, `Hand.tsx`. New components replace them in the new layouts, but the originals stay until a follow-up cleanup pass.

## Decisions

### 1. Layout selection: aspect-and-width hook

`useScreenLayout()` returns `'portrait' | 'landscape'`:

```ts
function getSnapshot(): 'portrait' | 'landscape' {
  if (window.innerWidth < window.innerHeight && window.innerWidth <= 600) return 'portrait'
  return 'landscape'
}
```

This means:
- Phone in portrait (393×852) → `'portrait'`
- Phone in landscape (852×393) → `'landscape'`
- Desktop (any size, typically 1280+×720+) → `'landscape'`
- Tablet portrait (768×1024) → `'landscape'` (the wider portrait gets the cinematic stage; we don't try to make a third layout for tablet portrait)

The hook is implemented with `useSyncExternalStore` mirroring the existing `useIsMobile` pattern and listening to a media query (`(orientation: portrait) and (max-width: 600px)`).

### 2. Component structure (new files)

**Portrait** (used only when `useScreenLayout() === 'portrait'`):
```
<PortraitLayout>
  <CombatTopBar />          // sector·round / strain segments / plan pill
  <ThreatGrid>
    <ThreatCard />×N        // 2×2 max, each a card with sprite + name + intent chip + status badge
  </ThreatGrid>
  <BattleLog />             // 3 most-recent events
  <PlayerZone>
    <HandRail />            // left column: vertical card list
    <BodyRig />             // center: silhouette + slot positions
    <StatsRail />           // right column: HP/BLK/EN pills + pile counts
  </PlayerZone>
  <ActionBar />             // hint strip + execute
</PortraitLayout>
```

**Landscape** (used otherwise):
```
<LandscapeLayout>
  <CombatStage>             // cinematic stage container (left ~70%)
    <CombatTopBar variant="stage" />   // floats over the stage
    <StillStage />          // Still sprite + floating HP/BLK/EN chips
    <EnemyStack>
      <StageEnemy />×N      // depth-staggered enemy with sprite + intent chip + thin HP slice
    </EnemyStack>
  </CombatStage>
  <ControlDeck>             // right ~30%
    <BodyRow />             // horizontal slot row
    <HandRow />             // horizontal card row
    <TargetCard />          // pinned bottom-left of panel
    <ExecuteButton />       // pinned bottom-right
  </ControlDeck>
</LandscapeLayout>
```

`PortraitLayout` and `LandscapeLayout` aren't separate files — they're inline JSX inside `CombatScreen.tsx`'s `return`, branching on the hook. Keeps wiring close to the data.

### 3. Why new components instead of restyling existing ones

`EnemyCard.tsx`, `StillPanel.tsx`, `BodySlotPanel.tsx`, and `Hand.tsx` each have one `compact` branch and one full branch, and both are tightly coupled to specific markup that doesn't survive the redesign:

- `EnemyCard` desktop branch is a full-width card; portrait wants a 2×2 mini card and landscape wants a chrome-less stage figure. Two different presentations, both unlike the current.
- `StillPanel` is a self-contained card; portrait wants its content split across a stats rail (right) and a body silhouette (center); landscape wants Still as an in-stage sprite with floating chip overlays.
- `BodySlotPanel` is a 2-column or 1-column grid; portrait wants slots positioned around a paper-doll silhouette; landscape wants a 4-column horizontal row.
- `Hand` is a flex-wrap row; portrait wants a vertical column with rich card cells; landscape wants a horizontal row with smaller cells.

Restyling each existing component to support all three modes (`compact`, `portrait`, `landscape`) inflates them with conditional logic. New, single-purpose components are cleaner.

The existing components stay in the file tree until a follow-up cleanup confirms nothing else references them. After this change ships, expect one PR to delete `EnemyCard.tsx`, `StillPanel.tsx`, `BodySlotPanel.tsx`, `Hand.tsx` and any of their test fixtures.

### 4. Data flow

All new components are pure-presentational. `CombatScreen.tsx` continues to own:
- Combat state (via `useRunStore`)
- Animation replay state (`animating`, `displayHealth`, `displayBlock`, `displayEnemyHealth`, `damageNumbers`, `activeSlot`, `activePartIds`)
- Targeting state (`targetEnemyId`)
- Card-selection state (`selectedCardId`, `pushed`)
- Sub-screen toggles (`infoTab`, `pileView`, `equipConflicts`, `partReplacements`, `pendingPostReward`, `eventCardRemoval` etc.)

It threads these into the layout components as props. None of the new components own combat state.

### 5. Damage-number / replay anchoring

The existing `damageNumbers` array carries `{ id, value, color, target }` where `target` is `'still'` or an enemy `instanceId`. Each layout component renders the relevant filtered floats inside whichever container represents that entity:

- Portrait: `'still'` floats render inside the `BodyRig`'s outer `<div>`. Per-enemy floats render inside each `ThreatCard`'s outer `<div>`.
- Landscape: `'still'` floats render inside the `StillStage` wrapper. Per-enemy floats render inside each `StageEnemy` wrapper.

All wrappers must keep `position: relative` so the existing `<DamageNumber x="50%" y="40%">` percentages anchor correctly. Display HP overrides (`displayEnemyHealth`) thread into each enemy renderer in both layouts.

### 6. Strain meter rendering

Portrait: segmented strain bar lives in `<CombatTopBar>` (the top toolbar). The existing `<StrainMeter>` is replaced by an inline strain-segment renderer there.

Landscape: `<CombatTopBar variant="stage">` renders a slim full-width strain bar centered in the stage's top-row HUD. Same renderer, different scale.

The outer-page `<StrainMeter>` line in `CombatScreen.tsx` is removed entirely (both layouts render their own).

### 7. Push toggle

A pushable card renders a small `PUSH +Ns` indicator inside the card cell (portrait `HandRail` and landscape `HandRow` cards). When the player has selected a pushable card and tapped the indicator, the card's local pushed flag goes on. Tapping a slot then plays it pushed.

This replaces the current "PUSH toggle in the hand header" affordance (which was added during the strain revival) with a card-local toggle. The behaviour is identical; only the visual location moves.

### 8. Body silhouette: 4 slots, paper-doll layout

The mock shows 5 positions (Head / Arm L / Torso / Arm R / Legs). The game has 4 (`Head`, `Torso`, `Arms`, `Legs`). For this change:
- Render the silhouette with **4** slot positions: HEAD top, ARMS left side (mid-height), TORSO center, LEGS bottom.
- The faint Still sprite sits behind, centered, at low opacity (~0.10).
- Slots are absolutely positioned over the sprite at fixed coordinates; tap target on each slot is a 56×40 cell.

If we ever expand to 5 slots, that's a separate game-mechanical change; this UI is layout-ready by virtue of how `BodyRig` lays out its children.

### 9. Battle log content

The battle log shows the **3 most-recent events** from `combat.combatLog`, formatted as one line each with an `R<round>` meta tag, the actor (`Still` or enemy name), the verb, and the value. The log is read-only and does not gate any flow.

Implementation: pure function `formatLogLine(event, round): JSX` consumed inside `<BattleLog>`. The function maps `CombatEvent` types to terse text — `slotFire` → "Still hit Drone for 6", `enemyAction` → "Drone struck Still for 6", etc.

### 10. Target card (landscape only)

Pinned to the bottom-left of the right-panel control deck. Shows:
- `TARGET` label, in dim text
- Targeted enemy name (bold)
- `HP <current>/<max>`
- Effective modifier readout if relevant (e.g., `VULN ×1.5` derived from the targeted enemy's status effects)

Tapping the card has no behaviour for v1 (it's read-only). Future: tap to cycle through alive enemies as a target.

If no target is set or the targeted enemy is defeated, the card shows "TARGET — pick an enemy".

### 11. Reward / forfeit / defeat sub-screens

These render *before* the main combat layout in `CombatScreen.tsx` and take over the entire viewport when their phase is active. The redesign does not change these screens. No layout-aware branching needed for them.

The strain reward screen (the one with comfort + drops + strain cost previews from the previous change) keeps its current full-screen presentation. Same for forfeit's "You stopped." view and defeat's "DEFEATED" view.

### 12. Optional polish

- Enemy idle bob (translate Y ±2 px over 3 s with random delay per enemy) — landscape only.
- Hit-shake on enemy when receiving a damage event with `target === instanceId` — both layouts.
- Yellow target-glow pulse — landscape only (portrait uses a static yellow border).

These ship after the main layout works; gated behind tasks marked optional.

## Risks / Trade-offs

**[Layout-detection edge cases]** → Phone-landscape (852×393) sits exactly at the boundary; depending on browser chrome, `window.innerWidth` could be 852 or 800. Both still satisfy `width > height` so they fall into landscape regardless. Tablet portrait (768×1024) gets landscape because `width > 600`; that's fine for the cinematic stage but means the right-side control deck has slightly less room. Verify on a tablet emulator before ship.

**[Body silhouette as a paper doll: 4 slots into 5 positions]** → The mock has 5 visual slots, the game has 4. Rendering 4 is mechanically correct but the silhouette will look slightly less "complete" than the mock. Acceptable trade-off; the alternative is a bigger game-mechanical change.

**[Replay anchoring under depth scaling]** → Landscape's depth-stagger applies `scale(0.84)` etc. to enemy wrappers. The damage-number `x="50%" y="40%"` percentages remain relative to the (scaled) bounding box; in practice this means back-row enemies show smaller damage numbers, which is desirable. Verify visually that the float doesn't drift off-screen for index-3+ enemies.

**[Existing components left as dead code temporarily]** → `EnemyCard.tsx`, `StillPanel.tsx`, `BodySlotPanel.tsx`, `Hand.tsx` are no longer referenced by `CombatScreen.tsx` after this change. They stay in the tree until a follow-up cleanup confirms no other component / story / test imports them. Bundle includes them only if something imports them; tree-shaking should prune. After ship, an explicit removal PR cleans up.

**[Push toggle relocates from header to per-card]** → Players who got used to the header-level push toggle from the previous playtest will see the affordance move into the card cell. Acceptable — the new placement is closer to the card itself and matches the mock's information density.

**[Battle log formatting]** → Log content is purely display; if `formatLogLine` doesn't handle a particular `CombatEvent` type cleanly it just shows "—" rather than crashing. The set of event types is finite (`slotFire`, `enemyAction`, `partTrigger`); each maps to a known string template.

## Migration Plan

UI-only change, no data, no save format. Dev-server reload after merge. Saved runs continue from where they left off, just rendered differently. Roll-back is `git revert`.

## Open Questions

- **Target card behaviour on tap.** v1 is read-only. Future: tap to cycle target. Defer.
- **Battle log line count.** Mock shows 3 lines. Defer expansion (e.g. scrollable longer log) to a separate change if playtest signal asks for it.
- **5-slot body split.** Out of scope here. If the user decides this is desired, it's a separate game-mechanical change touching `BODY_SLOTS`, `EquipmentDefinition.slot`, equipment data, and the body-rig coordinate map.
- **What replaces the `<StillPanel>` energy display?** Right now energy lives inside `StillPanel`; it moves into the stats rail (portrait) or the floating chips above the stage Still (landscape). The energy resource semantics don't change, only its visual location.
