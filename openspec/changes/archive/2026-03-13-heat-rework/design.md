## Context

The heat system has four zones (Cool/Warm/Hot/Overheat) that govern combat bonuses and penalties. Currently: Cool 0-4, Warm 5-7, Hot 8-9, Overheat at 10 (instant shutdown). A universal threshold bonus (+1 Warm, +2 Hot) applies to all body action output values. Overheat triggers a full shutdown — lose next turn.

The Pyromaniac archetype (run Hot for big rewards) is unplayable because Hot is a 2-point window and body action execution (+1 heat per slot) causes Overheat on the second slot. The universal threshold bonus makes "drift hot" the default strategy rather than a build commitment.

## Goals / Non-Goals

**Goals:**
- Make Hot a viable sustained state for dedicated builds (3-point window instead of 2)
- Replace binary shutdown with a damage gradient that punishes proportionally to how far over you are
- Remove universal threshold bonus so heat zones are meaningful build commitments, not passive stat boosts
- Keep Hot self-damage (3/turn) as the base cost of being in the Hot zone

**Non-Goals:**
- Redesigning equipment (separate change — equipment-tradeoffs)
- Rebalancing specific card/part/equipment numbers for new thresholds (will need a tuning pass but not in scope for this structural change)
- Changing passive cooling rate (stays at 2/turn)
- Changing body action heat generation (stays at +1/slot)

## Decisions

### Decision: New threshold boundaries — Cool 0-3, Warm 4-6, Hot 7-9
**Rationale:** Hot needs a 3-point window to be viable. Shifting all boundaries down by 1 keeps the zones balanced (4/3/3 point distribution vs old 5/3/2). Cool shrinks from 5 to 4 points, making it slightly harder to maintain — this is acceptable since Cool Runner was the easiest archetype.
**Alternative:** Only widen Hot (7-9) without shifting Warm/Cool. Rejected because it would make Warm only 1 point wide (just heat 5), which isn't functional.

### Decision: Overheat damage on any heat increase while over 9
**Rationale:** Checking damage on every heat increase (not just slot execution) means players pay for pushing past 9 during planning too. Playing a 2-heat card from heat 8 → 10 costs 3 damage immediately. This makes the decision to "run hot" visible during planning, not just during execution.
**Implementation:** Any function that increases heat must check if the new value exceeds 9 and apply damage = 3 × (newHeat - 9). This applies in `applyHeatChange` or equivalent — a single choke point for all heat modifications.

### Decision: No shutdown, only damage
**Rationale:** Shutdown (lose your turn) is unfun and binary. The damage gradient creates a natural death spiral — high heat means HP drain every slot tick, which is self-correcting. Players who overshoot take proportional punishment but keep playing, which is more engaging than staring at a shutdown screen.
**Alternative:** Keep shutdown at extreme heat (13+). Rejected for simplicity — damage alone is sufficient deterrent.

### Decision: Remove universal threshold bonus entirely
**Rationale:** With Hot easier to reach (7+), the +2 bonus makes Hot the dominant strategy for everyone. Removing it means heat zones are signals, not stat buffs. All archetype power comes from equipment/parts that say "while Cool" or "while Hot." Warm becomes the safe neutral default.
**Implementation:** Remove the `getThresholdBonus()` call from `resolveBodyAction`. Equipment-specific heat bonuses (e.g., Heat Shield's +4 Block while Hot) remain — those are per-item, not universal.

### Decision: Single choke point for heat changes
**Rationale:** The overheat damage rule must trigger consistently regardless of source. All heat modifications should flow through one function that handles: clamping to minimum 0, checking overheat threshold, applying damage if over 9. This prevents bugs where some heat sources bypass the damage check.
**Implementation:** Modify the existing heat change function (or create a wrapper) that checks `if (newHeat > 9) { dealDamage(2 * (newHeat - 9)) }` before applying the change.

### Decision: Overheat damage at 2 per point (not 3)
**Rationale:** At 3/point, overshooting is never worth it. At 2/point, deliberately pushing to heat 10-12 becomes a calculated risk — spend HP now to build ablative buffer against an incoming attack. This creates an interesting "do I overclock?" decision based on reading enemy intent.
**Alternative:** 3/point was the original design. If 2/point makes overheat too casual, can tune back up.

### Decision: Remove free passive cooling — LEGS equipment only
**Rationale:** Free passive cooling of 2/turn is an invisible subsidy for Cool (keeps you at 0 effortlessly) and a constant tax on Hot (drags you out of 7+ every turn). Removing it forces both archetypes to actively manage heat state through LEGS equipment. Cool Runner needs Cryo Lock or Coolant Injector. Hot player with Worn Actuators drifts gently. Warm Surfer benefits most — staying 4-6 becomes natural.
**Implementation:** Remove `PASSIVE_COOLING` constant, `applyPassiveCooling()` function, and all `passiveCoolingBonus` references. LEGS equipment already provides cooling; that becomes the only source.
**Alternative:** Reduce passive cooling to 1/turn instead of removing. Rejected — even 1/turn still subsidizes Cool and taxes Hot, just less. Clean removal is simpler and makes LEGS equipment universally meaningful.

### Decision: Ablative heat is systemic, not part-gated
**Rationale:** While Hot (7+), incoming damage reduces Heat instead of HP at 1:2 ratio (1 heat absorbed per 2 damage). Heat drains down to Warm floor (heat 4), then remaining damage hits HP. This is built into the heat system itself, not gated behind a part. Hot becomes a complete archetype out of the box — offense (equipment/parts) AND defense (ablative heat) — matching Cool which gets free defense through multiple Cool-conditional equipment.
**Implementation:** In damage resolution, when Still is Hot (7+) and takes damage: calculate heat absorbed = min(heat - 4, floor(damage / 2)), reduce heat by that amount, reduce damage by absorbed × 2. Apply remaining damage to HP.
**Alternative A:** Part-gated (Thermal Barrier rare part). Rejected — requires finding two rare parts (Reactive Frame + Thermal Barrier) to have a complete Hot archetype. Cool doesn't have this gating problem.
**Alternative B:** Retaliation ("enemies that hit you take damage"). Rejected — passive, no decisions.
**Alternative C:** Overcharge block (block persists while Hot). Rejected — converges with Cool's block-stacking invincibility.

### Decision: Hot draw card for card pool
**Rationale:** Cold Efficiency draws 3 while Cool — a card anyone can pick up. Hot has no card-based draw bonus (only Pyroclast Scanner equipment). With fewer cards in hand, Hot can't generate enough heatCost to maintain the zone. Adding a Hot draw card closes the draw gap.
**Implementation:** Add a card to sector pool(s): draw 2 base, draw 3 while Hot. Mirror of Cold Efficiency's structure.

## Risks / Trade-offs

- **Cool Runner triple-nerf** — Cool zone shrinks (0-3), universal bonus removed, AND free passive cooling removed. Cool Runner now must actively invest in LEGS cooling to stay Cool. → Mitigated by Cool-specific equipment/parts providing the actual power. LEGS equipment (Cryo Lock, Coolant Injector) is plentiful. Monitor during playtesting.
- **Overheat damage tuning** — 2 per point might be too lenient. → Playtest first. Easy to adjust the constant back to 3.
- **Ablative heat math** — 1:2 ratio with drain to Warm floor (heat 4) means a Hot player at heat 9 absorbs 10 damage (5 heat × 2). At heat 12 (cost 6 HP overheat), absorbs 16 damage (8 heat × 2). If too strong, reduce ratio to 1:3 or limit drain to Hot floor (7).
- **Ablative + block stacking** — If a Hot player stacks block AND has ablative heat, they could be very tanky. → Ablative only triggers on damage that reaches Still (after block). This means block is checked first, then ablative absorbs the remainder. Double-layered defense, but the cost is maintaining Hot + overheat risk.
- **Passive cooling removal ripple** — Many systems reference `passiveCoolingBonus` and `applyPassiveCooling`. Fragment bonuses include passive cooling. Need to decide: remove the passive cooling fragment bonus, or repurpose it? → Remove it or replace with a different bonus type.
- **Heat-conditional audit scope** — Every card, part, and equipment piece that references heat thresholds needs checking. Some use `getHeatThreshold()` (auto-fixed), some might have hard-coded values. → Do a grep for magic numbers 4, 5, 7, 8 in heat-related contexts.
- **Pressure Valve becomes less critical** — With no shutdown, Pressure Valve's "prevent overheat" effect needs rethinking. It could instead reduce overheat damage, or set heat to a specific value. → Address during the audit, design a new effect that fits the damage model.
- **Heat projection UI complexity** — Projecting overheat damage and ablative heat during planning is harder than projecting "you will shutdown." Need to show estimated HP cost and ablative buffer. → Show projected damage number in red when projected heat exceeds 9. Show ablative buffer indicator when Hot.
