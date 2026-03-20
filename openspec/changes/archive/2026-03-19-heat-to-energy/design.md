## Context

Still's combat system uses Heat as an accumulative resource — playing cards generates heat that persists across turns, with four named thresholds (Cool/Warm/Hot/Overheat) that gate card effects, equipment bonuses, and damage penalties. After six reworks, heat still feels shallow because equipment and block operate independently of heat, allowing players to optimize heat away entirely. The optimal endgame play is to stop playing cards and coast on equipment + block.

Still's unique mechanic is the 4-slot body system (HEAD/TORSO/ARMS/LEGS) with equipment firing alongside modifier cards. No other card roguelite has this spatial assignment system. Heat should become a simple per-turn budget so design depth can focus on slot decisions.

## Goals / Non-Goals

**Goals:**
- Replace accumulative heat with a per-turn energy budget that resets each turn
- Remove all heat thresholds, zones, ablative damage, overheat damage, and passive decay
- Remove all heat-zone-conditional effects from cards, equipment, and enemies
- Rework cooling cards into a new role (they have no purpose when heat resets)
- Keep the "heat" naming for thematic consistency (the mech runs hot) while the mechanic is energy
- Maintain the 4-slot body action system unchanged

**Non-Goals:**
- Redesigning the slot/body-action system (that's the depth layer, not this change)
- Adding new card archetypes to replace Pyromaniac/Cool Runner/Oscillator (future work)
- Implementing "keep moving" meta-game pressure (separate change)
- Rebalancing all card costs for the new system (a follow-up tuning pass, not this change)

## Decisions

### Decision 1: Budget amount of 8 heat per turn

Players start each turn with 8 heat budget. Cards cost 2-4 heat (current baseline is 2). This allows 2-4 card plays per turn, matching the current slot count. At 4 slots and 2-heat-per-card minimum, playing all 4 slots costs exactly 8 — a full commitment.

**Alternative considered:** 10 budget — too generous, allows 5 plays at base cost which exceeds slot count, removing tension. 6 budget — too tight, only 3 plays at base cost, one slot always empty. 8 is the sweet spot where filling all 4 slots requires all-cheap cards or a deliberate budget allocation.

### Decision 2: Heat resets to 0 at turn start, not "unspent carries over"

Full reset, not partial carryover. Carryover was explored (the "FTL reactor" model) but reintroduces turn coupling which was the source of the death spiral problem. Clean reset makes each turn an independent puzzle, like StS energy.

**Alternative considered:** Partial carryover (unspent heat carries as bonus next turn) — creates interesting "save up for a big turn" decisions but also recreates the "do nothing to bank" problem.

### Decision 3: LEGS equipment reworked from cooling to utility

LEGS currently provides heat cooling (-1 to -3 heat). With per-turn reset, cooling is meaningless. LEGS equipment reworked to provide utility effects: card draw, card cycling, block, or evasion. This gives LEGS a distinct identity without cooling.

**Alternative considered:** LEGS provides bonus energy — too strong, makes LEGS mandatory. LEGS provides movement/dodge — not yet implemented. LEGS provides card manipulation (draw, discard, shuffle) — good fit for "flow" domain already established in body-actions spec.

### Decision 4: Remove heat-conditional effects entirely, don't replace with energy-conditional

The old system had cards and equipment with "while Cool" / "while Hot" bonuses. With a per-turn budget, the equivalent would be "while you have X energy remaining" — but this creates a perverse incentive to not spend energy. Clean removal, no replacement.

**Alternative considered:** "Costs less if played first/last" — interesting but adds complexity for minimal depth. "Costs less if slot X is empty/full" — this is a slot-based condition, not energy-based, and belongs in future slot depth work.

### Decision 5: Cooling cards become draw/utility cards

Cards like Coolant Flush (-3 heat), Deep Freeze (-6 heat), Heat Vent (-3 heat) lose their purpose. Rather than removing them entirely, rework them as utility system cards: draw cards, gain block, cycle the deck. This preserves deck diversity without the cooling mechanic.

**Alternative considered:** Remove all cooling cards and add new cards — wasteful, the card slots in the pool are valuable. Convert to "energy refund" cards — reintroduces the banking problem from Decision 2.

### Decision 6: Thermal Scanner enemy reworked from heat-reactive to pattern-based

The Thermal Scanner enemy currently has intents that change based on Still's heat zone. With zones removed, rework to a standard pattern-based enemy with interesting attack patterns. Heat-reactive enemies may return in a different form in future work.

## Risks / Trade-offs

**[Loss of turn coupling]** → Heat accumulation was the one thing that made turns interconnected. With per-turn reset, each turn becomes an independent puzzle. Mitigation: Status effects (Strength, Dexterity, Weak, Vulnerable) and deck state (draw pile, exhaust) still provide inter-turn coupling. The slot system adds intra-turn spatial decisions that heat never provided.

**[Loss of archetype identity]** → Pyromaniac, Cool Runner, and Oscillator archetypes die with heat zones. Mitigation: These archetypes were half-formed anyway (~1.5 viable). New archetypes should emerge from slot synergies and equipment combinations, not heat zones. This is future work.

**[Feels like "just another StS clone"]** → Per-turn energy budget is exactly what StS does. Mitigation: The slot system is the differentiator, not the resource system. StS has no spatial card assignment. The "heat" theming also distinguishes the feel even if the mechanic is equivalent.

**[Massive rework scope]** → ~15 cards, ~10 equipment pieces, 1 enemy, and core combat logic all change. Mitigation: No players yet, no backwards compatibility needed. Tag `pre-heat-simplification` preserves the old state.

**[Card pool shrinks]** → Cooling cards and zone-conditional cards lose their effects. Mitigation: Rework to utility effects rather than removing. Pool size stays similar.
