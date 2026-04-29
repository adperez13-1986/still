## Why

Claude Design produced a complete combat-screen visual redesign with two layouts:
- **Portrait (mobile, 393×852)** — the `mock.html` "Paper Doll" mobile mock: a 2×2 enemy card grid up top, a battle log, and a 3-column player zone (HAND on the left, a body-silhouette BODY rig in the center with slots positioned around it, a STATS rail with HP/BLK/EN pills on the right), plus an action bar at the bottom.
- **Landscape (852×393, also covers desktop)** — a cinematic stage on the left (Still sprite + floating stat chips, depth-staggered enemy column) with a right-side **control deck** panel (body slot row + hand row + target card + EXECUTE).

The first attempt at this change followed the handoff `README.md` literally. The README said "mobile branch unchanged, desktop only" and described a stage-on-top / controls-below desktop layout — neither of which matches what was actually mocked. This proposal replaces that scope with the screenshots and `mock.html` as the source of truth.

## What Changes

**Layout split by aspect, not by width alone:**
- New `useScreenLayout()` hook returning `'portrait' | 'landscape'`. Portrait = `aspect < 1` AND width ≤ 600. Everything else = landscape (phone landscape + desktop, both same layout).
- The existing `useIsMobile()` hook stays available for non-layout consumers but the combat screen routes off `useScreenLayout()`.

**Portrait layout (replaces the current mobile combat view):**
- New top toolbar: `SECTOR N · ROUND M` + segmented strain meter + `PLAN` pill.
- Threat grid: 2×2 enemy cards. Each card shows: small sprite (top-left), name + thin HP slice + HP numbers (top-right), intent chip (icon + value + condition), one status badge below. Selected enemy: yellow border + target pip.
- Battle log: 3 most-recent execution events with `R#` meta tags.
- Player zone (3 columns): HAND (vertical card list with name + cost + description + tag) | BODY (faint Still silhouette behind; slots positioned at HEAD top, ARM L left, TORSO center, ARM R right, LEGS bottom — see scope note below) | STATS RAIL (HP / BLK / EN pills + draw / exhaust counts).
- Action bar: hint strip (info icon + contextual text) + EXECUTE button with "END PLANNING" subtext.

**Landscape layout (replaces the current desktop combat view):**
- Cinematic stage on the left ~70%: Still sprite (large pixel scale) on the left of the stage with floating HP / BLK / EN chips above; enemies on the right stagger vertically with depth (smaller, dimmer, slightly horizontally jittered the further back they are). Each enemy: small intent chip floating above its sprite + thin HP slice below; selected enemy gets a yellow drop-shadow + target pip.
- Stage HUD (top of stage): `SECTOR N · ROUND M` (top-left), strain meter (top-center, full-width slim bar), `PLAN` pill (top-right).
- Right ~30% control deck:
  - `// BODY · 4 SLOTS` header + horizontal row of body slot cells (HEAD / TORSO / ARMS / LEGS). Each cell: label, equip name, action summary, optional modifier pip.
  - `// HAND · N · D# · X#` header + horizontal row of card buttons.
  - `TARGET` card pinned bottom-left of the panel: shows targeted enemy name + HP + status modifier (e.g., "VULN ×1.5").
  - `EXECUTE` button bottom-right with "END PLANNING" subtext.

**Common to both layouts (preserve from current implementation):**
- Strain meter visualization, push toggle on pushable cards (kept; integrates into the new card visuals as a small `PUSH +Ns` affordance), forfeit / reward / defeat / equip-conflict / part-replacement sub-screens (unchanged behaviour, take over the whole viewport when active).
- Per-entity floating damage / block / heal numbers (re-anchored to whichever entity wrapper the new layout uses).
- Step-through execution replay (active slot highlight, HP bar interpolation, killing-blow timing).

**Out of scope:**
- Game logic in `useRunStore`, `combat.ts`, `projectSlotActions`, `CombatEvent`, `types.ts` — unchanged.
- Reward / forfeit / equip-conflict / part-replacement / defeat sub-views in `CombatScreen.tsx` — unchanged. They render full-screen when their phase is active and bypass the in-combat layout entirely.
- Any 5th body slot (Arm L vs Arm R split). The mock shows 5; the game has 4. We render 4 in the silhouette and leave the split as a separate game-mechanical change.

## Capabilities

### New Capabilities

None — this is a visual restyle of an existing capability.

### Modified Capabilities

- `combat-ui`: existing requirements (Battlefield layout, Player card, Enemy cards with per-enemy floats, Step-through execution replay, Floating number animation, Compact action slots, Battle log) get replaced with portrait + landscape variants matching the screenshots. The existing scenarios are partly correct in spirit but their layout assumptions (single vertical mobile-only stack, side-by-side desktop card grid, slot-pair UI) no longer hold — they need full rewrites, not partial deltas.

## Impact

**Files added (new components):**
- `src/components/CombatStage.tsx` — the cinematic stage container (landscape only).
- `src/components/EnemyStack.tsx` — depth-staggered enemy column inside the stage.
- `src/components/StillStage.tsx` — the in-stage Still sprite + floating stat chips.
- `src/components/ControlDeck.tsx` — the right-side panel for landscape (body row + hand row + target card + execute).
- `src/components/PlayerZone.tsx` — the 3-column portrait zone (hand / body / stats).
- `src/components/BodyRig.tsx` — the paper-doll body silhouette with slot positions (used in portrait `PlayerZone`).
- `src/components/StatsRail.tsx` — the right-column HP/BLK/EN pills + pile counts (portrait).
- `src/components/HandRail.tsx` — the left-column vertical card list (portrait).
- `src/components/ThreatGrid.tsx` — 2×2 enemy card grid (portrait).
- `src/components/ThreatCard.tsx` — individual enemy card for the threat grid (portrait).
- `src/components/CombatTopBar.tsx` — top toolbar with sector/round + strain segments + plan pill (portrait + reused as stage HUD).
- `src/components/BattleLog.tsx` — compact 3-line battle log (portrait + landscape).
- `src/components/TargetCard.tsx` — pinned target info card (landscape).
- `src/components/ActionBar.tsx` — bottom hint + execute (portrait).
- `src/hooks/useScreenLayout.ts` — orientation/aspect hook.

**Files modified (CombatScreen wiring):**
- `src/components/CombatScreen.tsx` — replace the entire main `return ()` for the combat planning/execution view: branch on `useScreenLayout()` between `<PortraitLayout>` and `<LandscapeLayout>` compositions. The reward / forfeit / defeat / equip-conflict / part-replacement early-returns are untouched.

**Files NOT touched:**
- `src/store/runStore.ts`, `src/game/combat.ts`, `src/game/types.ts`
- `src/components/Hand.tsx` (existing), `src/components/EnemyCard.tsx` (existing), `src/components/BodySlotPanel.tsx` (existing), `src/components/StillPanel.tsx` (existing), `src/components/DamageNumber.tsx`, `src/components/PartBadges.tsx` — the new layout uses new components rather than restyling the existing ones, so the existing components remain in case anything else in the project uses them. We can prune later once nothing references them.
- `src/hooks/useIsMobile.ts` — kept as-is for non-combat consumers.

**Bundle:** about a dozen small components added; estimated +6–8 KB minified. No new dependencies.
