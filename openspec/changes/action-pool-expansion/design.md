## Context

The findable action pool has 13 actions. In full-run sims, players acquire 1-2 actions per run on average. Damage actions dominate reward selection (78% take Phase Blade, 74% take Focus Fire). Defensive and sustain actions are rarely picked because there aren't enough of them to offer real choice.

The strain combat engine already supports all the flags we need (`hits`, `perHit`, `persistent`, `healOverTurns`, `reflectPct`). This change is pure content — new rows in `src/data/actions.ts`.

## Goals / Non-Goals

**Goals:**
- Double the findable pool from 13 to 25 actions
- Each new action has a distinct tactical niche (not strictly-worse sidegrade)
- Coverage across all action types so run rewards offer real variety
- Actions that tempt specific builds (heal-focused, reflect-focused, multi-hit, etc.)

**Non-Goals:**
- Adding new mechanics (no new action types, no new flags)
- Adding new synergies (the type-combo synergy table is unchanged)
- Balancing for momentum system (that's a separate change)
- UI changes

## Decisions

### 1. Action coverage targets

Current findable pool type distribution:
- damage_single: 2 (Phase Blade, Focus Fire)
- damage_all: 1 (Pulse)
- block: 1 (Barrier)
- reduce: 1 (Brace)
- reflect: 1 (Redirect)
- heal: 2 (Repair, Mend)
- convert: 1 (Absorb)
- buff: 2 (Patience, Overclock)
- debuff: 1 (Weaken)
- utility: 1 (Taunt)

Target after expansion:
- damage_single: 4 (+2) — two more distinct damage profiles
- damage_all: 3 (+2) — more AoE variety
- block: 2 (+1) — a second persistent option
- reduce: 2 (+1) — cheaper alternative
- reflect: 2 (+1) — weaker/cheaper alternative
- heal: 3 (+1) — another sustain option
- convert: 2 (+1) — scaling alternative
- buff: 3 (+1) — stronger delayed buff
- debuff: 2 (+1) — stronger/longer debuff
- utility: 2 (+1) — alternative utility

### 2. The 12 new actions

**Damage (single):**

| ID | Name | Type | Base | Pushed | Special | Take Cost | Niche |
|----|------|------|------|--------|---------|-----------|-------|
| quick-jabs | Quick Jabs | damage_single | 2 | 3 | hits: 3 | 3 | Multi-hit — excellent against Brace, great with Thorns synergy |
| heavy-blow | Heavy Blow | damage_single | 4 | 14 | — | 4 | Low base, big pushed value — rewards commitment |

**Damage (all):**

| ID | Name | Type | Base | Pushed | Special | Take Cost | Niche |
|----|------|------|------|--------|---------|-----------|-------|
| splash | Splash | damage_all | 3 | 5 | — | 3 | Cheap AoE floor — more consistent than Pulse's random targeting |
| flurry | Flurry | damage_all | 2 | 3 | hits: 2 | 4 | Double AoE hits — breaks multi-enemy block, great for Barrage+ synergy |

**Defense:**

| ID | Name | Type | Base | Pushed | Special | Take Cost | Niche |
|----|------|------|------|--------|---------|-----------|-------|
| iron-wall | Iron Wall | block | 2 | 5 | persistent | 4 | Longer-lasting defense, lower base than Barrier (3/5) — different tradeoff |
| guard | Guard | reduce | 2 | 4 | perHit: true | 3 | Cheaper Brace — lower per-hit reduction but cheaper to take |

**Sustain:**

| ID | Name | Type | Base | Pushed | Special | Take Cost | Niche |
|----|------|------|------|--------|---------|-----------|-------|
| stitch | Stitch | heal | 3 | 5 | — | 3 | Cheap immediate heal — weaker than Repair (4/6) but cheaper take cost |
| regen | Regen | heal | 1 | 2 | healOverTurns: 3 | 3 | Slow steady healing — good in long fights, bad for burst situations |

**Utility:**

| ID | Name | Type | Base | Pushed | Special | Take Cost | Niche |
|----|------|------|------|--------|---------|-----------|-------|
| thornskin | Thornskin | reflect | 30 | 50 | reflectPct: 30 | 3 | Weaker/cheaper than Redirect (40/60) — early-run reflect option |
| rally | Rally | buff | 5 | 7 | — | 4 | Stronger Patience (+3/+5) — deeper commitment to setup plays |
| cripple | Cripple | debuff | 4 | 6 | — | 4 | Longer/stronger Weaken — enables defensive builds |
| recharge | Recharge | convert | 4 | 6 | — | 3 | Similar to Absorb but cheaper take cost |

### 3. Balance principles

- **Take cost scales with power**: 3 for moderate, 4 for strong, 5+ for very strong
- **Heavy Blow is the main "commitment" action**: low base (4) forces the player to push it for value. Pairs with momentum when we add it.
- **Multi-hit actions (Quick Jabs, Flurry)** are specifically valuable against block-stacking enemies and enable Thorns synergy scaling
- **Iron Wall vs Barrier** is a real tradeoff: Barrier (3/5 persistent 1 turn) vs Iron Wall (2/5 persistent 1 turn but with a lower base value) — tune during playtest if too similar
- **Stitch vs Repair**: Stitch (3/5 @ cost 3) is cheaper but weaker than Repair (4/6 @ cost 3). Effectively an "early option" vs a better late option

### 4. Flavor / naming

Names kept mechanical and descriptive — flavor pass is a separate concern per the project's narrative-last principle. Descriptions stick to mechanics.

## Risks / Trade-offs

**[Some new actions feel too similar to existing ones]** → Validate in sim that reward selection spreads more evenly across the pool. If Quick Jabs and Phase Blade both get picked ~same rate, one's doing its job.

**[Balance shifts once momentum is added]** → Intentional. These actions are tuned for the current no-momentum system. When momentum comes in, we'll re-tune; specifically Heavy Blow's low base will interact strongly with momentum stacks.

**[Content doesn't fix the core issue]** → Possible. If S1 clear rate, action variety in rewards, and per-turn decision feel don't improve with double the pool, then the issue is mechanical (back to momentum/charging/etc.) rather than content.

## Open Questions

- Should Heavy Blow have a higher take cost given its big pushed ceiling? Proposed 4; could go 5.
- Is Regen's 1/2 over 3 turns too weak? Total heal is 3 or 6 — similar to Repair but spread out. Could be 2/3 over 3 turns (total 6/9) for stronger appeal.
- Does Cripple's -4 damage for 2 turns break fights against single-hard-hitting enemies too easily? May need to test.
