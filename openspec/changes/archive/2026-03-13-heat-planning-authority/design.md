## Context

The heat rework (new thresholds, overheat damage, universal bonus removal) and equipment tradeoffs (archetype-conditional equipment) shipped code but playtesting revealed a deeper problem: heat zone during execution is autopilot. Each slot generates +1 heat when it fires, creating a fixed +4 heat ramp that the player cannot control. Combined with passive cooling parts (Residual Charge, Feedback Loop) that effortlessly keep players Cool, heat zone never feels like a deliberate build choice.

The current heat flow per turn:
1. Planning: play cards (+1 heat each), passive parts offset heat
2. Execution: HEAD +1, TORSO +1, ARMS +1, LEGS +1 (fixed, uncontrollable)
3. End of turn: LEGS cools, passive cooling -2

The +4 execution ramp means the player's planning-phase heat management gets overridden. Equipment heat-conditional bonuses (`heatBonusThreshold`, `heatConditionOnly`, `multiFire`) trigger based on where in the ramp each slot happens to fall, not based on the player's intent.

## Goals / Non-Goals

**Goals:**
- Heat zone during execution reflects planning-phase decisions, not a fixed ramp
- Staying Cool requires active management (spending card plays on cooling)
- Going Hot requires active commitment (playing many cards)
- Archetype identity emerges from play patterns: Cool = restraint, Hot = excess
- All equipment heat-conditional checks use a single consistent zone (planning-end heat)

**Non-Goals:**
- Redesigning the slot execution system (HEAD → TORSO → ARMS → LEGS stays)
- Changing heat thresholds (Cool 0-3, Warm 4-6, Hot 7-9 from heat-rework)
- Changing the overheat damage model (3 per point over 9)
- Rebalancing equipment/card stats (separate follow-up after this lands)
- Adding new cards or parts to replace removed ones (can be a follow-up)

## Decisions

### 1. Remove per-slot heat generation entirely

**Decision:** Set `heatGenerated` to 0 for all body actions. Slots fire their actions without touching heat.

**Why:** The +1 per slot is what creates the autopilot drift. Removing it means planning-end heat = execution heat for all slots. This is the simplest change that gives planning full authority over heat zone.

**Alternative considered:** Reduce to +0.5 per slot or make it variable. Rejected — partial heat generation still drifts zone unpredictably. The clean model is: planning controls heat, execution uses it.

**Implementation:** In `resolveBodyAction` (combat.ts:216), change `heatGenerated: 1` to `heatGenerated: 0`. Also remove the +1 for extra firings from part triggers (combat.ts:383).

### 2. Remove Residual Charge and Feedback Loop parts

**Decision:** Delete both part definitions and remove them from the sector 1 part pool.

**Why:** These parts make Cool effortless (free passive heat reduction) and fight non-Cool archetypes. Without per-slot heat generation, they'd make heat decrease every turn with zero effort. Heat management should come from deliberate actions: cooling cards and LEGS end-of-turn cooling.

**Alternative considered:** Rework them instead of removing (e.g., make them archetype-specific). Rejected — with the new model where card count = heat, passive cooling parts undermine the core tension of "how many cards can I afford to play?"

**Implementation:** Remove `feedbackLoop` and `residualCharge` from parts.ts and from `SECTOR_1_PARTS` array. Remove the `onModifierAssign` trigger handling in combat.ts if no other parts use it.

### 3. Move extraHeatGenerated to modifier-assignment time

**Decision:** When a player assigns a modifier card to a slot with `extraHeatGenerated` equipment, the extra heat is applied immediately during planning (on top of the card's heat cost). Removing the modifier refunds the extra heat.

**Why:** Since execution no longer generates heat, equipment heat costs need to live in planning. Applying at assignment time means the player sees the cost before committing and can make informed heat management decisions.

**Implementation:**
- In the card-assignment logic (combat.ts ~line 790, where `onModifierAssign` triggers are handled), check if the target slot's equipment has `extraHeatGenerated` and apply the heat change via `applyHeatChange`.
- On modifier removal, apply the inverse heat change.
- Remove the `extraHeatGenerated` handling from `resolveBodyAction` (combat.ts:272-274).
- Update BodySlotPanel UI to show the extra cost at assignment preview.

### 4. Simplify projectHeat to return current heat

**Decision:** `projectHeat` no longer simulates per-slot heat accumulation. Projected execution heat = current heat (already reflects all planning-phase card plays and assignments).

**Why:** With no execution-phase heat changes, projection is trivial. The current heat display IS the execution heat.

**Implementation:** Gut `projectHeat` — it returns `currentHeat` directly. The per-slot simulation loop, Repeat extra firing heat, and all the override-checking logic are no longer needed.

### 5. Simplify projectSlotActions to use single heat value

**Decision:** `projectSlotActions` evaluates all slots against `combat.heat` instead of maintaining a `simulatedHeat` that accumulates per slot.

**Why:** All slots fire at the same heat. No need to simulate drift. This means `heatConditionOnly`, `multiFire`, and `heatBonusThreshold` checks all use the same value — if you're Cool, ALL your slots get Cool bonuses. If you're Hot, ALL get Hot bonuses. No more "HEAD gets Cool but LEGS gets Warm."

**Implementation:** Remove `simulatedHeat` tracking in `projectSlotActions`. Pass `combat.heat` as the heat parameter to every `resolveBodyAction` call. Remove `heatAtExecution` per-slot tracking from `SlotProjection` (or keep it but set uniformly). Remove the `heatGenerated`/`heatReduced` accumulation between slots.

### 6. Oscillator threshold-crossing triggers fire during planning

**Decision:** Threshold-crossing part triggers already fire via `applyHeatChange` → `fireThresholdCrossTriggers`, which is called during card play. Since all heat changes now happen in planning, oscillator triggers naturally fire during planning. No additional changes needed.

**Why:** `applyHeatChange` is the single choke point for all heat changes (established in heat-rework). Playing cards and cooling cards both go through it, which already fires threshold-crossing triggers. The oscillator pattern becomes: play card (+heat, cross up), play cooling card (-heat, cross down), accumulate effects. These effects (block, damage, etc.) are applied to combat state and carry into execution.

### 7. LEGS cooling becomes purely end-of-turn

**Decision:** LEGS equipment still fires during execution (its position in the slot order), but its `coolHeat` action now only affects heat for the NEXT turn's starting position. Since execution heat is locked, the LEGS cooling doesn't change any zone checks during this turn's execution.

**Why:** LEGS cooling already fires last in the slot order. Under the old model, it could cool you back from Overheat after the other 3 slots pushed you up. Under the new model, LEGS cooling still fires and reduces heat, but this only matters for: (a) reducing heat that carries into the next turn, and (b) the passive cooling calculation at turn start.

**No code change needed for LEGS itself** — `resolveBodyAction` for LEGS still produces `heatReduced`, and `executeBodyActions` still applies it. The difference is behavioral: since no heat accumulated during execution, LEGS cooling just lowers your starting heat for next turn.

## Risks / Trade-offs

**[Risk] Pyromaniac becomes too safe during execution** → With no +1/slot ramp, a Pyromaniac entering at heat 9 stays at 9 for all of execution. No overheat ticks from slot firing. Overheat damage only happens during planning (playing too many cards). This makes the Hot zone less dangerous.
→ Mitigation: Hot self-damage (3 HP/turn) still applies. Overheat risk lives in planning — playing 10+ cards to reach heat 10+ costs HP immediately. The danger shifts from "execution surprises" to "planning gambles," which is more player-controlled and arguably better design.

**[Risk] LEGS slot feels less impactful** → Currently LEGS cooling mid-execution can save you from overheat. With fixed execution heat, LEGS only sets up next turn.
→ Mitigation: LEGS still has equipment bonuses (Cryo Lock: +5 Block while Cool, Thermal Exhaust: -3 heat while Hot, Stabilizer Treads: Block per heat cooled). The slot's value is in its action effects + setting up next turn, not emergency cooling.

**[Risk] Part pool shrinks** → Removing Residual Charge and Feedback Loop removes 2 of ~12 sector 1 parts.
→ Mitigation: Acceptable for now. These slots can be filled with new parts in a follow-up if needed. The remaining parts still provide meaningful choices.

**[Risk] Extra-heat assignment refund creates exploit** → Player assigns modifier to get heat, then removes it to cool, gaming the oscillator triggers.
→ Mitigation: Heat refund on removal should NOT fire threshold-crossing triggers on the way down. Only card-play heat changes trigger oscillator effects.

## Open Questions

- Should `onModifierAssign` trigger type be removed entirely (only Feedback Loop used it) or kept for potential future parts?
- After removing Residual Charge and Feedback Loop, is the sector 1 part pool still deep enough, or should replacement parts be designed alongside this change?
