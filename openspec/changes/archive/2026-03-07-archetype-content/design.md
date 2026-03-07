## Context

The heat system has four emergent archetypes: Cool Runner (0-4), Warm Surfer (5-7), Pyromaniac (8-9), and Oscillator (threshold bouncing). Only Warm Surfer has meaningful content support. This change adds Act 1 seeds for the other three archetypes through new cards, equipment, and mods.

Design principle established during exploration: enemies SHALL NOT directly modify Still's Heat. Heat is the player's resource to manage. Enemies can read heat state and react to it (conditional behaviors, scaling based on heat), but never write to it.

## Goals / Non-Goals

**Goals:**
- Seed all four archetypes with enough content to be discoverable in Act 1
- Each archetype piece should be a good card/equip/mod on its own, but noticeably better within its archetype
- Introduce `onThresholdCross` trigger type for Oscillator support
- Remove HeatAttack intent type to enforce "enemies don't write heat" rule

**Non-Goals:**
- Making any archetype fully viable in Act 1 (that's Act 2's job)
- Adding new enemies (separate change)
- Changing heat thresholds or bonus values
- Adding heat lock/insulate mechanics (deferred)

## Decisions

### Heat-conditional cards use "While X" pattern, not heatCondition gating
Existing `heatCondition` prevents playing a card entirely if threshold isn't met (Meltdown requires Hot). New archetype cards use a different pattern: they're always playable but have a bonus effect "While Cool" or "While Hot." This means they're useful in any deck but optimal in their archetype. Implementation: add an optional `heatBonus` field to card effects rather than reusing `heatCondition`.

**Alternative considered:** Gate all archetype cards behind heatCondition — rejected because it makes them dead draws outside their zone, which feels bad and discourages experimentation.

### New equipment fills the third slot option per body slot
Currently 2 equipment per slot. Adding 1 per slot brings it to 3, giving meaningful choice within each slot. Each new piece leans toward an archetype but remains functional for any build.

### onThresholdCross trigger fires on actual heat changes
The new trigger fires whenever Still's heat crosses a threshold boundary (Cool↔Warm or Warm↔Hot) during the execute phase or card play. It checks previous heat vs new heat after each heat change. Both directions count (going up or down).

**Alternative considered:** Only fire on upward crossings — rejected because Oscillator wants both directions to reward bouncing.

### Remove HeatAttack, keep Absorb
HeatAttack (deal damage + add heat) violates the "enemies don't write heat" principle. Absorb (gain Block equal to Still's heat) only reads heat, so it stays. DisableSlot stays — it affects slots, not heat.

## Risks / Trade-offs

- [Power creep] New cards/equipment increase overall player power → Mitigated: Act 1 enemies are already balanced for current content, slight power increase is acceptable as archetype pieces are situational
- [Oscillator complexity] onThresholdCross is a new trigger type that needs combat loop changes → Low risk: heat tracking already exists, just need before/after comparison
- [Card pool dilution] 6 more cards in Act 1 pool means less chance of seeing specific cards → Acceptable: more variety is the goal, and archetype pieces cluster naturally
