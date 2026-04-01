## Context

The current combat is a StS-style deckbuilder. This prototype replaces the entire player-decision layer with the simplest possible model: 3 hardcoded slots, push toggles, strain accumulates. The goal is to test whether permanent strain cost creates the right emotional tension. Not production — just a feel test.

## Goals / Non-Goals

**Goals:**
- 3 slots with fixed actions, push toggle, strain accumulates (0-10)
- Strain 10 = forfeit (no rewards, strain drops to 7, run continues)
- Strain carries between encounters, starts at 2
- Playable — fight one enemy, feel the tension
- Keep existing enemy/intent system

**Non-Goals:**
- Equipment, parts, cards, deck, hand — all bypassed
- UI polish, visual strain effects on robot/world
- Companion strain reduction, map changes
- Balance tuning — rough numbers, feel test only
- Status effects (Strength, Dexterity, Weak, Vulnerable) — skip for prototype simplicity

## Decisions

### 1. Build as a separate combat mode, don't gut existing code

**Decision:** Create a parallel prototype combat path rather than modifying the existing combat.ts. A flag or route determines which combat mode runs.

**Why:** Preserves ability to revert. The existing game is still playable. We can A/B test the feel.

### 2. Hardcoded slot definitions, no equipment lookup

**Decision:** Slots are defined inline in the prototype combat code. No equipment files consulted.

**Why:** Fastest path to playable. Equipment system adds complexity we're not testing.

### 3. Minimal UI — functional, not pretty

**Decision:** Simple layout: 3 slot cards with push toggle buttons, strain bar, enemy display, execute button. Can reuse existing enemy rendering.

**Why:** We're testing feel, not looks. Functional prototype in minimal time.

## Risks / Trade-offs

**[Risk] 3 slots might not create enough decision tension** → If every turn is obvious, add a 4th slot or vary push costs. Easy to adjust.

**[Risk] No status effects makes combat math flat** → Acceptable for prototype. We're testing strain feel, not combat depth.

**[Risk] Separate combat path means maintaining two systems briefly** → Worth it to avoid breaking the working game.
