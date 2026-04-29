# Combat Screen Redesign — Handoff

This folder contains design specs and reference implementations for the FFVI-inspired combat scene redesign. Drop into Claude Code with: "Implement the redesign in design-handoff/ — read README.md first."

## Goal

Move CombatScreen from a card-based info layout to a **diorama** layout:

- **Stage** (top ~65% of viewport): Still on the left, enemy column on the right, both as pixel sprites in a shared scene. No card chrome around enemies.
- **Bottom HUD** (~35%): horizontal body slot strip + hand of cards + Execute button.
- **Long-press inspector** for enemy details (replaces the always-visible name/HP/intent block on each enemy card).

The design pulls from FFVI: minimalist enemy chrome (just sprite + small intent glyph + thin HP slice), action happening in the visual layer, info on demand.

## Files

| File | What it is |
|---|---|
| `README.md` | This file |
| `SPEC.md` | Visual spec — sizes, colors, depths, timings, pseudo-code for tricky bits |
| `STAGE_LAYOUT.md` | The two-column stage geometry (Still vs. enemy column) and how enemies stagger |
| `reference/EnemyCard.tsx` | New EnemyCard — drops the bordered box, renders glyphs/sprite/HP-line |
| `reference/EnemyInspector.tsx` | New — the popover that long-press / right-click opens |
| `reference/EnemyStage.tsx` | New — wraps the right side of the stage, owns the enemy column |
| `reference/CombatScene.tsx` | New — the stage container that holds StillPanel + EnemyStage + floating HUD overlays |
| `reference/BodySlotPanel.patch.md` | Surgical changes to the existing BodySlotPanel |
| `reference/CombatScreen.patch.md` | Surgical changes to the existing CombatScreen (desktop branch only) |
| `mock.html` | The standalone HTML mock the design was iterated in (for visual reference) |

## Implementation order

1. **Add new files** — `EnemyInspector.tsx`, `EnemyStage.tsx`, `CombatScene.tsx` go in `src/components/`.
2. **Replace `EnemyCard.tsx`** — the new file is a drop-in replacement; it keeps the same Props interface, just renders differently. The `compact` mode (mobile) is unchanged. Only the desktop branch was redesigned.
3. **Patch `CombatScreen.tsx`** — replace the desktop `isMobile ? ... : <desktop>` branch with `<CombatScene>`. Mobile branch stays as-is for this pass.
4. **Patch `BodySlotPanel.tsx`** — non-compact branch becomes a horizontal 4-column strip with a faint Still sprite ghosted behind it.
5. **Floating HUD overlays** — small Still HP/Energy/Block readouts pinned to the corners of the stage. Spec in SPEC.md.

## Out of scope (do not change)

- Game logic: `useRunStore`, `combat.executeTurn`, `projectSlotActions`, `CombatEvent` replay loop — unchanged.
- Mobile branch (`isMobile === true`) — unchanged. The `compact` mode of `EnemyCard` and `BodySlotPanel` stays.
- `Hand.tsx`, `DamageNumber.tsx`, `PartBadges.tsx`, reward/conflict/forfeit/defeat sub-screens — unchanged.
- All store actions and types in `game/types.ts` — unchanged.

## Tweaks (deferred)

The mock had Tweaks-panel knobs for CRT, vignette, motes, sprite scale. **Drop these for v1.** Ship the bare design first; we can add CSS toggles later if we want them.
