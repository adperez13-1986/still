## Context

The modifier card system has four categories (Amplify, Redirect, Repeat, Override) that are all numerical — they make slot actions bigger, wider, or more frequent. No modifier creates a qualitatively different combat dynamic. Meanwhile, Strength and Dexterity are permanent and unbounded, making stat-stacking cards always optimal over modifier plays.

The game needs: (1) a modifier that creates new combat loops, not just bigger numbers, and (2) a stat system that costs ongoing energy rather than being a free permanent investment.

## Goals / Non-Goals

**Goals:**
- Feedback modifier creates 4 distinct builds from a single card based on slot placement
- Stat decay makes stat maintenance an energy tradeoff against modifier plays
- Pure builds (all-offense, all-defense, stat-focused) remain viable
- New win conditions: lifesteal through Arms, reflect through Torso, draw→damage through Head, persistent block through Legs

**Non-Goals:**
- Adding other new modifier types this change (Volatile, Retaliate, Momentum deferred)
- Changing existing modifier cards (Boost, Overcharge, Echo Protocol, etc. unchanged)
- Rebalancing card costs or equipment values
- UI overhaul for the planning phase (Feedback uses existing slot assignment flow)
- Changing enemy Strength/Dexterity behavior (enemy stats are separate from player stats and don't decay)

## Decisions

### Decision 1: Feedback effect is determined by slot, not by card variant
One card definition with universal slot placement. The `resolveBodyAction` function checks which slot the modifier is on and applies the appropriate effect. This is simpler than creating 4 separate cards and preserves the FFVII-inspired "same component, different context" discovery moment.

**Alternative considered**: Four separate Feedback cards (Feedback-Head, Feedback-Arms, etc.). Rejected because it removes the discovery element and bloats the card pool. The player should draw ONE card and decide where it goes.

### Decision 2: Stat decay rate of 1 per turn, applied at end of turn
Strength and Dexterity each decay by 1 at end of turn (minimum 0). This means playing Power Surge (+2 Str) gives a net +1 Str per turn at equilibrium (gain 2, lose 1). The decay happens in `endTurn` after enemy resolution, so stats are at full value during both player execution and enemy turn.

**Alternative considered**: Decay at start of turn. Rejected because it would reduce stats before the player can use them, feeling punitive. End-of-turn decay means you always get full value from stats the turn you play them.

**Alternative considered**: Hard cap (e.g., max +5). Rejected because decay is more interesting — it creates burst windows (stack hard for 2 turns, use the peak, let decay) rather than a flat ceiling.

### Decision 3: Feedback on Torso reflects 75% of block as damage
Full 100% reflection would make Amplify on Torso obsolete (why boost block when Feedback gives block AND damage?). At 75%, Amplify still wins on pure defense while Feedback wins on defense+offense hybrid. The 75% creates a real tradeoff.

### Decision 4: Feedback on Legs uses 25% decay on carried block
Persistent block without any decay snowballs to absurd levels (40+ block by turn 8). 25% decay per turn of carried block creates an equilibrium (~17-20 max with Cryo Lock). The decay is applied before new block is added: `carriedBlock = floor(carriedBlock * 0.75) + newLegsBlock`.

### Decision 5: Feedback on Head tracks bonus via CombatState field
`feedbackArmsBonus` is set during HEAD resolution (= cards drawn × 2) and consumed during ARMS resolution. Reset to 0 at start of each execution phase. This leverages the fixed firing order (Head → Torso → Arms → Legs) without requiring event systems.

### Decision 6: Feedback goes in S1 card pool
Available from the first card reward. Players need maximum time to discover the slot-dependent behavior. If gated to S2, most of the discovery happens too late.

### Decision 7: Only player stats decay, not enemy stats
Enemy Strength (from Buff intents) does not decay. Enemies already have fixed patterns — their stats are part of the encounter design, not an accumulation problem. Player stat decay is a balance lever for player scaling only.

## Risks / Trade-offs

- **[Risk] Feedback on Torso + Dex stacking may be too efficient** → 75% reflection caps the value, and Dex also decays. At +2 Dex equilibrium with Heat Shield (7+2=9 block), reflection is 6.75→6 damage. Meaningful but not dominant.
- **[Risk] Stat decay may feel punitive to new players** → Mitigated by Feedback giving them something productive to do with slots instead of stats. The "aha" moment of Feedback should offset the "my stats shrink" frustration.
- **[Risk] Persistent block on Legs may be hard to communicate in UI** → Show carried block as a separate number or subtle indicator on the Legs slot. Not designing UI this change, but flag for future.
- **[Risk] feedbackArmsBonus state may be confusing if HEAD is disabled** → If HEAD is disabled, it doesn't fire, so feedbackArmsBonus stays 0. Arms fires normally. No special case needed.

### Decision 8: Feedback stacks with other modifiers (uses secondary slot)
Playtesting revealed that Feedback competing for the modifier slot makes it strictly worse than Amplify/Repeat in every case. Feedback on Arms with Plasma Cutter: 10 damage + 3 heal vs Overcharge: 25 damage + 0 heal. The lifesteal can never compensate for losing ×2.5 damage.

Fix: Feedback always goes to `slotModifiers2` (the secondary slot), regardless of whether Dual Loader is present. This means you can assign Overcharge + Feedback to the same slot. Now Overcharge + Feedback on Arms = 25 damage + 8 heal. Feedback layers on top of other modifiers, like FFVII support materia linking TO another materia rather than replacing it.

**Alternative considered**: Increase Feedback ratios (e.g., 75% lifesteal). Rejected because it doesn't solve the fundamental problem — Feedback taking the modifier slot means you lose multiplicative damage, which no ratio can compensate for.
