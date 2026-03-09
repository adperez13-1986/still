## Context

The game has 17 behavioral parts (8 Sector 1, 9 Sector 2), all incremental improvements. The roadmap calls for 2-3 rare parts that fundamentally change how a run plays. Parts drop from combat rewards; elites/bosses don't have special drop logic yet.

Current combat state tracks `slotModifiers: Record<BodySlot, string | null>` (one modifier per slot), heat with overheat shutdown, and standard turn flow. The overheat path already has a Pressure Valve check before falling through to shutdown.

## Goals / Non-Goals

**Goals:**
- Add 3 run-warping rare parts that break core game rules
- Drop exclusively from elite/boss encounters with diminishing probability
- Each part should fundamentally reshape run strategy

**Non-Goals:**
- Rebalancing existing parts
- New UI screens (use existing part badge system for visibility)
- Activated abilities (all parts remain passive/triggered)

## Decisions

### Dual Loader — second modifier slot per body slot

Currently `slotModifiers` maps each `BodySlot` to one `string | null`. To support a second modifier, add a parallel `slotModifiers2: Record<BodySlot, string | null>` field to `CombatState`. This avoids changing the primary field's type (which would require touching every reference).

The second modifier slot is only usable when Dual Loader is in `ctx.parts`. The check at `playModifierCard` line 654 becomes: if primary slot is filled AND Dual Loader is owned AND secondary slot is empty, assign to secondary. Otherwise reject.

During execution (`resolveBodyAction`), both modifiers apply. Order: primary modifier effect first, then secondary. Two Amplify modifiers on one slot stack multiplicatively (e.g., Boost +50% then Overcharge +100% = base × 1.5 × 2.0 = 3x). Override + Amplify: override replaces the action, amplify boosts the override.

Alternative: Change `slotModifiers` to `string[]` — cleaner but breaks every existing reference. Too risky for one part.

### Thermal Damper — heat lock for first 2 turns

New combat state fields: `heatLocked: boolean`, `heatDebt: number`, `heatLockTurnsLeft: number`.

At combat init, if Thermal Damper is owned: `heatLocked = true`, `heatDebt = 0`, `heatLockTurnsLeft = 2`.

While locked, `applyHeatChange` adds delta to `heatDebt` instead of `combat.heat`. Cooling still works normally (reduces actual heat, not debt). At the start of turn 3, lock expires: `heatLocked = false`, apply `heatDebt` to `combat.heat` all at once, triggering threshold crosses and potentially overheat.

This means turns 1-2 are a free-heat window. Turn 3 is the reckoning. The player must plan cooling for the debt dump or accept the overheat (especially powerful with Overheat Reactor).

### Overheat Reactor — overheat becomes a weapon

At overheat check points (currently 3 locations in combat.ts), after Pressure Valve check but before shutdown: if Overheat Reactor is owned, set `overheatReactorFired = true` on the combat state, reset heat to 5, reduce `stillHealth` and `maxHealth` by 5 each, and skip shutdown.

During execution, if `overheatReactorFired` is true, all body slot damage output is doubled. The flag is cleared at end of turn.

If both Pressure Valve and Overheat Reactor are owned, Pressure Valve takes priority (it prevents reaching the overheat state entirely). The player must choose between them — this is a real deckbuilding decision.

Max HP reduction persists for the run via `runStore.reduceMaxHealth(amount)`. If current health exceeds new max, current health is capped to new max.

### Drop mechanics — elite/boss exclusive with diminishing rate

Add a new drop resolution path for elite/boss encounters. After normal drop resolution, roll for a run-warping part drop:

- Count owned run-warping parts (by checking `run.parts` against a known list of IDs)
- Drop chance: `[0.35, 0.15, 0.05, 0][ownedCount]`
- If roll succeeds, pick a random un-owned run-warping part and add it as an additional drop
- Run-warping parts are NOT in the normal sector part pools

The drop appears in the reward screen alongside normal drops. Player always receives it (no choice to skip — it's a part, automatically added).

### Interaction: Pressure Valve vs Overheat Reactor

Both trigger on overheat. Pressure Valve has `onWouldOverheat` which fires first, preventing the overheat entirely. If Pressure Valve fires, Overheat Reactor never triggers. This is by design — the player should pick one overheat strategy, not stack both.

## Risks / Trade-offs

- **Dual Loader + Echo Protocol + Overcharge on ARMS** → Triple attack at 200% is ~6x normal ARMS output. Costs 4 heat (2+2) which is significant. Strong but requires building around it.
- **Thermal Damper debt dump causing instant overheat** → Intentional. The player has 2 turns to plan. If they don't, the debt dump is the consequence.
- **Overheat Reactor max HP reduction is permanent** → By design. This is the "run-warping" cost. A player at 40 max HP in Sector 3 chose to be there.
- **slotModifiers2 parallel field is not elegant** → Pragmatic choice. Avoids cascading type changes for a single rare part.
