# Visual Spec — Combat Scene

## Color palette (existing, do not change)

```
--bg          #0d0d1a   page background
--panel       #16213e   panels
--border      #2c3e50   panel borders
--ink         #e8e8e8   primary text
--ink-dim     #aaa      secondary text
--ink-faint   #666      tertiary text
--target      #f1c40f   target highlight (yellow)
--accent      #a29bfe   modifier / "Still" purple
--hp          #e74c3c   damage red
--block       #74b9ff   shield blue
--heal        #2ecc71   heal green
--energy      #e67e22   energy orange
--strain-low  #636e72
--strain-mid  #e67e22
--strain-hi   #e74c3c
```

Add these stage-only tokens:

```
--stage-floor    #0a0a14   floor (slightly darker than bg)
--stage-fog      rgba(13, 13, 26, 0.85)   bottom vignette
--stage-rim      rgba(162, 155, 254, 0.08)   subtle accent rim along the floor
```

## Stage geometry

Two-column flex inside a fixed-height stage container.

| Element | Size |
|---|---|
| Stage container | `height: clamp(420px, 60vh, 640px)`; full width minus 16px page padding |
| Still column | `width: 200px`, vertically centered |
| Enemy column | `flex: 1`, vertical staggered list, anchored to bottom |
| Floor band | bottom 64px of stage, `linear-gradient(to top, var(--stage-fog), transparent)` |

Stage container styles:

```css
position: relative;
background:
  radial-gradient(ellipse at 30% 60%, rgba(162, 155, 254, 0.06) 0%, transparent 50%),
  linear-gradient(to bottom, #0d0d1a 0%, #0a0a14 70%, #050508 100%);
border: 1px solid var(--border);
border-radius: 10px;
overflow: hidden;
```

## Enemy column (the FFVI staggered formation)

Enemies stack **vertically**, anchored to the bottom of the stage, each one offset horizontally by a small amount so they don't overlap perfectly. The bottom enemy is the closest (largest sprite scale), the top is furthest (smaller scale).

```
display: flex;
flex-direction: column-reverse;   /* index 0 nearest the bottom */
align-items: flex-end;
gap: 28px;
padding: 24px 32px;
```

Per-enemy CSS variables, indexed by position in the column (0 = nearest):

| index | --depth | translateX | scale |
|---|---|---|---|
| 0 | 0    | 0    | 1.00 |
| 1 | 0.30 | -36px | 0.92 |
| 2 | 0.60 | 24px  | 0.84 |
| 3 | 0.90 | -48px | 0.76 |
| 4+ | clamp at 0.9 | random ±48px | 0.76 |

Apply via:

```css
.enemy {
  --depth: 0;
  --depth-scale: calc(1 - var(--depth) * 0.27);
  transform: translateX(var(--enemy-shift, 0)) scale(var(--depth-scale));
  filter: brightness(calc(1 - var(--depth) * 0.15));
}
```

## Enemy chrome (FFVI-minimal)

Each enemy renders THREE elements only:

```
┌─────────────┐
│  glyph row  │  ← intent icon, power chip, status dots — 16px tall
│   sprite    │  ← Sprite component, pixelSize=4 (was 3)
│ ▰▰▰▰▱▱▱▱   │  ← thin HP bar, 36×3px, no number
└─────────────┘
```

**No name, no border, no card background.** The whole enemy is just a vertical stack with no chrome.

### Glyph row (above sprite)

- Intent icon: 14px square, color from existing `INTENT_COLORS` map
- Power chip: small bold number with bg `rgba(0,0,0,0.5)` and 1px solid intent-color border, padding 1px 4px, font-size 10px
  - For Attack/AttackDebuff: shows effective damage
  - For Block: shows block value
  - For DisableSlot: shows targetSlot (e.g. "Hd")
  - For Scan: shows "SCN"
- Status dots: tiny 5px circles, one per status effect, colored:
  - Weak: `#e67e22`, Vulnerable: `#e74c3c`, Strength: `#27ae60`, Dexterity: `#3498db`, Inspired: `#f1c40f`

Layout: `display: flex; align-items: center; gap: 4px; margin-bottom: 4px; min-height: 16px`.

### HP bar (below sprite)

- Width 36px, height 3px, no border, no number
- Track: `#2c3e50`, fill: `#e74c3c`
- `margin-top: 4px`

When at 100% HP: hide entirely (no bar). At <100%: show. This keeps the stage clean for fresh enemies.

### Selected (target) treatment

- Yellow drop-shadow on the sprite: `filter: drop-shadow(0 0 6px #f1c40f)`
- A small "▾" caret 8px above the glyph row, color `#f1c40f`, font-size 10px

### Defeated treatment

- `opacity: 0.25`
- `filter: grayscale(1)`
- Glyphs hidden

## Still column

Reuse `StillPanel` (non-compact) but lift it onto the stage:

- Wrap in a column with `width: 200px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px`
- Background: none (let the stage show through)
- Hide the StillPanel's own border/background — pass a new `onStage` prop OR wrap the existing component and override styles. Easier: extract the inner content of `StillPanel` and render directly in CombatScene with sprite at `pixelSize={6}` (was 4).

The Still sprite faces RIGHT in the source data, so this works naturally — Still on the left, enemies on the right.

## Floating HUD overlays

Three small text-only readouts, absolutely positioned inside the stage container:

- **Top-left**: `Sector 1 · Round 3` — `top: 12px; left: 16px; font-size: 11px; color: #555; letter-spacing: 1px`
- **Top-center**: thin strain meter — `top: 12px; left: 50%; transform: translateX(-50%); width: 220px` — same component as before but slimmer (height 4px)
- **Top-right**: `Info` button — `top: 12px; right: 16px`, same look as existing

These don't compete with the action; they sit at the edges.

## Bottom HUD

Below the stage, in order:

1. **BodySlotPanel** — horizontal 4-column strip, each cell ~120px wide. See `BodySlotPanel.patch.md`.
2. **Hand** — unchanged.
3. **Execute** button row — unchanged.

## Long-press inspector (EnemyInspector)

Trigger: `pointerdown` on an enemy → `setTimeout(380ms)` → if not cancelled, open inspector. Cancel on `pointerup`, `pointercancel`, `pointermove` (with movement > 8px).

Anchored to the enemy: `position: fixed` at the pointer location with offset, OR `position: absolute` to the stage container at the enemy's bounding-box top-right with a 12px offset.

Closes on: outside click, pressing Escape, the next tap on the same enemy.

Content (port from current `EnemyCard` non-compact):

- Name (14px bold, with ELITE/BOSS chip)
- HP `current / max` line + full HP bar
- Block (if > 0)
- "Next:" + full intent text (existing IntentDisplay)
- Status effects list (full names, not just abbreviations)

Style:

```css
background: #1e1e2e;
border: 1px solid #4a4a6a;
border-radius: 8px;
padding: 12px 14px;
min-width: 200px;
max-width: 260px;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
z-index: 50;
font-size: 12px;
```

## Tap behaviors (single click on enemy)

- Set as target (existing behavior). Don't open inspector on quick tap.
- A short tap is < 380ms; long press opens inspector and does NOT change target.

## Damage numbers

Already wired in CombatScreen. They float above the enemy's bounding box. The new EnemyCard root `<div>` keeps `position: relative` so DamageNumber's `x="50%" y="40%"` continues to anchor correctly.

## Sizes summary

| Element | Size |
|---|---|
| Still sprite | pixelSize=6 (was 4) |
| Enemy sprite (depth 0) | pixelSize=4 (was 3) |
| Enemy sprite (depth 1+) | pixelSize=4 with CSS scale (auto from --depth-scale) |
| Glyph row | min-height 16px |
| HP bar | 36×3px |
| Inspector | 200–260px wide |
| Stage height | clamp(420px, 60vh, 640px) |

## Animation polish (optional, do last)

- Enemy idle bob: `@keyframes bob { 0%, 100% { translate: 0 0 } 50% { translate: 0 -2px } }` — 3s ease-in-out infinite, with random animation-delay per enemy (0–1.5s).
- Hit shake: when an enemy receives damage, briefly `translate: 4px 0` and back over 100ms. Hook into the existing `damageNumbers` array — when a number with `target === enemy.instanceId` is added, set a transient `shake` flag.
- Target reticle pulse: the yellow drop-shadow glow oscillates between 4px and 8px blur over 1.5s.
