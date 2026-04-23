## Why

The deckbuilder era (Mar 5 – Apr 1) was the longest-running combat architecture and had **multiple viable archetypes coexisting** (Cool Runner, Pyromaniac, Oscillator, Counter builds). It got abandoned reactively, not analytically — a specific HEAD/LEGS balance bug (VULN stacking with Repeat) plus accumulated thematic frustration triggered a full pivot to the strain prototype, which stripped out cards, equipment, and parts entirely.

The strain prototype proved the emotional core (commitment meter, forfeit at 20, vent as sacrifice) works. But the follow-on unified-action-slots system has tactical ceiling problems that content density can't fix: type-based synergies make actions within a type interchangeable, 5 slots is too tight, "push or don't" is a flat per-turn decision. See `memory/system-iterations.md`.

This change integrates the two: revive the body-slot deckbuilder (95 cards, 20 equipment, 13 parts, 4 body slots — all intact in the codebase) and add strain as a **second, persistent resource** alongside per-turn energy. Specific cards can be "pushed" for a bigger effect at the cost of strain in addition to energy. The emotional core of strain lives inside the tactically rich frame of the deckbuilder.

## What Changes

**Retire the unified action slot system (BREAKING):**
- Remove `src/game/strainCombat.ts` engine
- Remove `src/components/StrainCombatScreen.tsx`
- Remove the `unified-action-slots`, `action-pool`, `link-synergies` capabilities
- Remove `findable actions` from growth rewards
- `SlotLayout` and `acquiredActions` fields removed from RunState

**Revive the body-slot deckbuilder:**
- Runs use the old card-based combat flow again (`src/game/combat.ts`)
- `CombatScreen.tsx` becomes the active combat UI (with UI polish ported from StrainCombatScreen)
- 4 body slots (HEAD/TORSO/ARMS/LEGS) with equipment firing each turn, modifier cards assigned to slots
- Energy as per-turn budget (resets each turn). Default max 8.
- Starting deck + equipment restored as in Era 2

**Add strain as a second resource:**
- Strain accumulates permanently during combat. 20 = forfeit the fight.
- Strain carries between combats, decays slowly between them.
- Vent remains as a "spend a turn, reduce strain" escape valve.
- Start-of-run strain is 2 (same as current).

**Introduce pushable cards (Model 1 architecture, Model 2 initial scope):**
- The engine supports a `pushCost` field on any card (strain cost in addition to the card's energy cost). Pushing a card activates its `pushedEffect` (bigger effect).
- Initial content: ~10–15 cards have push variants (curated — commitment-themed cards: Overcharge, Meltdown, Reckless Charge, key Overrides, etc.). Most cards stay pure-energy.
- Expand push coverage based on playtest feel.

**Preserve the UI polish from combat-ui-battlefield:**
- Player card (HP bar + block + strain meter nearby)
- Per-entity floating damage numbers
- Step-through execution replay with slot highlighting and HP interpolation
- Battle log
- Dying enemies stay visible until killing blow animates

**Apply the HEAD/LEGS VULN fix this time (the lesson from last time):**
- Cap Vulnerable stacks applied by HEAD equipment at 3 per enemy per combat
- Repeat modifiers applied to HEAD do NOT double-apply debuff stacks (they apply the action's other effects but debuffs are one-per-fire)

**Rewards return to Era 2 pattern:**
- Growth options: card reward, part reward, or equipment reward (weighted)
- Comfort options: heal, strain relief, or companion moment (same as current)
- Taking a growth reward accrues strain proportional to reward tier

## Capabilities

### New Capabilities
<!-- None — everything re-enables or modifies existing -->

### Modified Capabilities
- `combat-system`: return to body-slot deckbuilder; add strain-accumulation layer alongside energy
- `card-system`: add push variants (pushable card has an optional `pushedEffect` triggered by paying strain cost)
- `growth-rewards`: return to card/part/equipment rewards; growth accrues strain (existing growth-cost mechanic maps over)
- `reward-choices`: return to Era 2 three-option model with comfort option preserved

### Removed Capabilities
- `action-slots`: superseded by body-slot system
- `action-pool`: findable actions no longer exist (cards replace them)
- `link-synergies`: type-based pair synergies no longer exist (card+equipment+part combos replace them)

## Impact

- `src/game/strainCombat.ts` — **delete** (or move to `archive/` for reference)
- `src/components/StrainCombatScreen.tsx` — **delete**
- `src/components/SlotRearrangement.tsx` — **delete** (no slots to rearrange)
- `src/game/combat.ts` — unchanged engine logic; add strain fields to CombatState, add push-card resolution
- `src/game/types.ts` — add `strain`/`maxStrain` to CombatState; add `pushCost` and `pushedEffect` to ModifierCardDefinition; remove SlotLayout and action slot types
- `src/components/CombatScreen.tsx` — add strain meter at top; port player card/float/replay components from StrainCombatScreen
- `src/store/runStore.ts` — replace `startStrainCombat`/`toggleSlotPush`/`toggleVent`/etc. with card combat handlers that include strain; add `pushCard` method
- `src/data/cards.ts` — add push variants to ~10-15 selected cards (Overcharge, Meltdown, Reckless Charge, Fortify, Overrides, etc.)
- `src/data/equipment.ts` — no content changes; apply the HEAD VULN cap to equipment apply logic
- `src/data/enemies.ts` — unchanged; reactive enemy design works with both systems
- `src/sim/strainCli.ts`, `strainHeuristic.ts`, `strainRunSim.ts`, `strainRunner.ts` — rewrite sim to model deckbuilder + strain (big task; can be deferred to after first playable version)
- `src/components/RunScreen.tsx` — remove `SlotRearrangement` integration; starting run sets up card/equipment/part initial state instead of slot layout
