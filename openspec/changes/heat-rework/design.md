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
**Implementation:** Modify the existing heat change function (or create a wrapper) that checks `if (newHeat > 9) { dealDamage(3 * (newHeat - 9)) }` before applying the change.

## Risks / Trade-offs

- **Cool Runner double-nerf** — Cool zone shrinks (0-3) AND universal bonus removed. Cool Runner now gets zero passive benefit from being Cool and has less room. → Mitigated by Cool-specific equipment/parts providing the actual power. Monitor during playtesting.
- **Overheat damage tuning** — 3 per point might be too harsh or lenient. → Playtest first. Easy to adjust the constant.
- **Heat-conditional audit scope** — Every card, part, and equipment piece that references heat thresholds needs checking. Some use `getHeatThreshold()` (auto-fixed), some might have hard-coded values. → Do a grep for magic numbers 4, 5, 7, 8 in heat-related contexts.
- **Pressure Valve becomes less critical** — With no shutdown, Pressure Valve's "prevent overheat" effect needs rethinking. It could instead reduce overheat damage, or set heat to a specific value. → Address during the audit, design a new effect that fits the damage model.
- **Heat projection UI complexity** — Projecting overheat damage during planning is harder than projecting "you will shutdown." Need to show estimated HP cost. → Show projected damage number in red when projected heat exceeds 9.
