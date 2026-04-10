## Why

The combat screen is a vertical stack of UI sections with no spatial sense of a battlefield. The player has no visual presence — their HP is a text line at the top. Damage numbers float to screen edges because there's no entity to anchor them. On mobile, it's hard to track what's happening.

## What Changes

**Player card added to the battlefield:**
- Player represented as a card between enemies and action slots
- Shows HP bar, block badge, strain is at the top already
- Damage/heal/block numbers float directly on the player card

**Enemy cards show damage on-card:**
- Damage numbers appear on the specific enemy card that was hit
- Per-enemy floating numbers instead of a shared float area

**Action slots compacted:**
- Slots show name + type icon + value clearly but use less vertical space
- Pair layout preserved with synergy indicator

**Combat log removed:**
- Floating numbers on entity cards replace the text log
- All combat feedback is spatial — attached to who it affects

**Layout restructured for mobile:**
- Strain meter at top
- Enemy row
- Player card (center)
- Compact action slots
- Vent + Execute buttons

## Capabilities

### New Capabilities
- `combat-ui`: Combat screen layout, entity cards (player + enemy), floating damage numbers, action bar. Covers the visual structure and animation of the strain combat screen.

### Modified Capabilities

## Impact

- `src/components/StrainCombatScreen.tsx` — full rewrite of the combat/planning UI. Enemy display, player card, action slots, floating numbers all change.
- No engine changes — this is purely visual/UI.
