## Context

The strain combat prototype has a working combat loop (3 slots, push mechanic, 3 abilities, strain 0-20) but zero progression. Every run is identical — same tools, same costs, same capabilities from first fight to last. The only thing that changes is strain going up. There's no pull to enter combat, only pressure.

Current starting state: Strike (6/9, push 1), Shield (5/7, push 1), Barrage (4/6, push 1), plus Repair (1 strain, heal 4), Brace (1 strain, -3 dmg/hit), Vent (0 cost, recover 4 strain, skip attacks).

The reward system needs to create a run arc where the player grows more efficient over time — not stronger, but better. "The same work costs less."

## Goals / Non-Goals

**Goals:**
- Post-combat reward choice: growth vs. comfort
- Growth rewards that reduce strain costs or expand the player's toolkit
- Comfort rewards that provide immediate relief
- A sparser starting state so there's room to grow
- Enough growth reward variety that different runs feel different (build identity)
- Natural difficulty curve: boss is a hard wall that requires growth investment

**Non-Goals:**
- Unearned bigger numbers (stat bumps handed to you). Bigger numbers that result from creative build paths ARE fine — the distinction is whether the player earned it through choices.
- Card/deck system (replaced by strain)
- Equipment system (not yet — slots are fixed for this prototype)
- Companion node integration (designed separately, relevant but not in scope)
- Sector 2+ content (boss is the wall for sector 1)
- Balancing the boss fight (that's a separate concern after rewards exist)
- Reducing combat count to match pool size — pool depth should drive combat count, not the other way around

## Decisions

### 1. Starting state: Vent only

**Decision:** The player starts with only Vent as a default ability. Repair and Brace become growth rewards.

**Rationale:** If all 3 abilities are available from the start, the first few fights have no sense of discovery. Starting with just slots + Vent means:
- Early fights are simple (push or don't, vent if you need to breathe)
- First growth reward (e.g., gaining Repair) is immediately felt — "I can heal now"
- Vent is fundamental to strain management and can't be optional

**Alternative considered:** Start with all abilities, rewards are only cost reductions and new abilities. Rejected because it frontloads all the verbs — nowhere to grow into.

### 2. Growth rewards cost strain to take

**Decision:** Each growth reward has a strain cost (2-3 strain). The player pays strain on the reward screen to accept a growth reward.

**Rationale:** This creates the core tension. Growth costs something permanent. Taking a growth reward at strain 14 is risky — you're investing but getting closer to 20. Maps directly to the design seed: "taking the harder assignment costs you even when it makes you better."

**Format:** After combat victory, the reward screen shows:
```
┌─────────────────────────────────────────────┐
│  GROWTH                      COMFORT        │
│  ┌───────────────────┐   ┌──────────────┐   │
│  │ Learn: Repair     │   │ Heal 8 HP    │   │
│  │ Heal 4 HP/turn    │   │              │   │
│  │                   │   │ (free)       │   │
│  │ Cost: +2 strain   │   │              │   │
│  └───────────────────┘   └──────────────┘   │
│                                             │
│  Strain: 8 / 20                             │
└─────────────────────────────────────────────┘
```

### 3. Growth reward types — tiered branching tree

**Decision:** Growth rewards are organized in a dependency tree with 3 tiers. Each tier unlocks the next. Branches fork at tier 2, creating build identity through player-driven specialization. Categories help us design and balance, but the player just picks what sounds good.

**Structure: 3 branches × 3 tiers, with forks at tier 2**

```
REPAIR BRANCH                BRACE BRANCH               OFFENSE BRANCH
     │                            │                     ╱      │      ╲
Tier 1: Learn Repair (2)    Tier 1: Learn Brace (2)   Strike  Shield  Barrage
     │                            │                   Mastery Mastery Mastery
   ╱   ╲                       ╱   ╲                  (3)     (3)     (3)
  ╱     ╲                     ╱     ╲                  │               │
Repair+ Drain Strike    Brace+  Reactive Shield  Piercing Strike  Scatter Barrage
 (2)      (2)            (2)       (2)               (3)              (3)
  │        │              │         │                 │                │
Desperate Lifeline    Calm Brace  Fortify        Executioner     Chain Reaction
Repair(3)  (3)          (3)        (3)              (3)              (3)
```

**Tier 1: New verbs** (cost: 2 strain) — what can I do?
- Learn Repair, Learn Brace, Slot Masteries
- These are the foundation. You need them before you can specialize.

**Tier 2: Forks** (cost: 2 strain) — how do I want to do it?
- Each tier 1 reward unlocks TWO tier 2 options. You pick one per combat.
- This is where builds start diverging. Two players who both learned Repair go different directions.

**Tier 3: Identity** (cost: 3 strain) — who am I becoming?
- Conditional rewards that change your relationship with strain.
- These define the playstyle and create the moments where two players play the same fight differently.

**Reward catalog:**

| Reward | Branch | Tier | Cost | Requires | Effect |
|--------|--------|------|------|----------|--------|
| Learn Repair | Repair | 1 | 2 | — | Unlock Repair ability (heal 4 HP, 1 strain/use) |
| Learn Brace | Brace | 1 | 2 | — | Unlock Brace ability (reduce incoming dmg by 3/hit, 1 strain/use) |
| Strike Mastery | Offense | 1 | 3 | — | Strike push cost → 0 |
| Shield Mastery | Offense | 1 | 3 | — | Shield push cost → 0 |
| Barrage Mastery | Offense | 1 | 3 | — | Barrage push cost → 0 |
| Repair+ | Repair | 2 | 2 | Repair | Repair heals 7 instead of 4 |
| Drain Strike | Repair | 2 | 2 | Repair | Strike heals you for half damage dealt |
| Brace+ | Brace | 2 | 2 | Brace | Brace reduces 5 instead of 3 |
| Reactive Shield | Brace | 2 | 2 | Brace | Shield fires after enemy turn (block not wasted) |
| Piercing Strike | Offense | 2 | 3 | Strike Mastery | Strike ignores enemy block |
| Scatter Barrage | Offense | 2 | 3 | Barrage Mastery | Barrage hits random enemies multiple times |
| Desperate Repair | Repair | 3 | 3 | Repair+ | Strain 15+: Repair heals 8 instead of 4/7 |
| Lifeline | Repair | 3 | 3 | Drain Strike | Strain 12+: Vent also heals 4 HP |
| Calm Brace | Brace | 3 | 3 | Brace+ | Strain 8 or below: Brace reduces 6 instead of 3/5 |
| Fortify | Brace | 3 | 3 | Reactive Shield | Unused block at end of turn converts to HP healing |
| Executioner | Offense | 3 | 3 | Piercing Strike | Bonus damage to enemies below 30% HP |
| Chain Reaction | Offense | 3 | 3 | Scatter Barrage | Killing an enemy triggers a bonus Barrage |

**Design categories (for balance, not player-facing):**

| Category | Relationship to strain | Rewards that point here |
|----------|----------------------|------------------------|
| High-strain | Thrives under pressure | Desperate Repair, Lifeline |
| Low-strain | Controls pressure | Calm Brace, Fortify |
| Aggressive | Eliminates pressure sources | Drain Strike, Piercing Strike, Executioner, Chain Reaction |
| Endurance | Absorbs pressure | Reactive Shield, Repair+, Brace+, Fortify |

These categories are ingredients, not archetypes. A build mixes across them. "Drain Strike + Desperate Repair + Strike Mastery" = high-strain berserker. "Calm Brace + Reactive Shield + Patience" = low-strain wall. Identity emerges from the combination.

**Total pool: 17 rewards.** With 8 combats offering one growth each, and strain costs limiting how many a player can take, a typical run acquires 5-7 growth rewards. That's enough to go deep in one branch and shallow in another, but never everything. Different runs = different builds.

### 4. Comfort reward types

**Decision:** Comfort rewards are free (0 strain cost) and provide immediate value:

- **Heal** — restore 6-8 HP
- **Relief** — reduce strain by 3-4
- **Companion moment** — reduce strain by 2 + narrative text (placeholder for now)

The player picks ONE reward (growth or comfort), not one of each.

### 5. Reward pool and progression

**Decision:** Each combat victory offers exactly 2 options: one growth, one comfort. The growth option is drawn from a pool of available rewards (abilities not yet learned, masteries not yet taken). The comfort option is contextual:
- If HP is low → Heal is offered
- If strain is high → Relief is offered
- If neither is urgent → Companion moment

This keeps the choice screen simple (two cards, pick one) and makes the comfort option responsive to the player's actual needs.

**When growth pool is empty** (player has taken everything): only comfort is offered. This is fine — it means the player invested heavily and now gets to rest. That's the intended arc.

### 6. Run state tracking

**Decision:** Add a `growth` object to run state that tracks:
```
growth: {
  abilities: string[]       // IDs of learned abilities (e.g., ['repair', 'brace'])
  masteries: string[]       // IDs of mastered slots (e.g., ['A'] = Strike push cost 0)
}
```

Strain combat reads from this to determine:
- Which abilities are available in combat
- What push costs are (base cost minus mastery)

### 7. Growth rewards unavailable when strain is too high

**Decision:** If the player's current strain + growth reward cost would reach 20, the growth option is not offered (greyed out or absent). Only comfort is available.

**Rationale:** You can't grow when you're too strained. The game doesn't punish you — it reflects what you already know: you need to rest first. This also prevents an exploit where deliberately "failing" a growth reward could trigger a forfeit drop to 14 (free strain reduction better than any comfort reward).

**Feedback loop this creates:**
- Invested early → lower strain costs → can afford growth later → virtuous cycle
- Skipped growth early → strain stays expensive → high strain locks out growth → forced into comfort when you need growth most

This is the "falling behind" feeling — not a punishment mechanic, just the natural consequence of not investing. The run only ends from strain ≥ 20 during the boss fight (suboptimal ending) or from HP = 0 (game over).

## Risks / Trade-offs

**[Always-comfort is viable through normal fights but fails at boss]** → This is intentional. The boss is tuned to require growth investment. A pure-comfort player will hit a wall. The game doesn't punish comfort early — it just doesn't prepare you.

**[Growth rewards feel mandatory, not chosen]** → Risk if the boss requires ALL growth rewards. Mitigation: boss should be beatable with ~60-70% of available growth rewards. The player needs to invest, but not perfectly.

**[Strain cost on growth makes it feel punishing]** → The cost IS the point. But if it feels bad rather than tense, we may need to tune costs down or add "growth heals a little HP" as a softener. Playtest will tell.

**[Starting with only Vent makes early fights too simple]** → First 1-2 fights will be basic (push or don't). This is acceptable if the first growth reward comes quickly. If it feels boring, we can offer a guaranteed ability after fight 1.

**[Two-option reward screen may feel limited]** → Start here. If it needs more variety, expand the growth pool first (more abilities, mutations). Don't add more options per screen — that dilutes the growth vs. comfort tension.

## Open Questions

- **Strain costs per tier** — current proposal: tier 1 = 2, tier 2 = 2-3, tier 3 = 3. Needs playtesting.
- **Should Vent be improvable?** (e.g., "Patience: Vent recovers 6 instead of 4") — fits low-strain identity. May add as a Brace-adjacent branch.
- **Boss tuning** — how much growth is "enough"? Depends on boss design, deferred.
- **Reward offering** — does the player see one growth option (drawn from available pool) or choose between two? Single option keeps it simple. Two options add more agency but dilute the growth/comfort tension.
- **Tier 2 fork presentation** — when both tier 2 options are available, does the game offer one randomly, or let the player see both? Seeing both makes the fork explicit. Random makes it feel like discovery.
- **High-strain vs low-strain balance** — we must avoid the heat problem (one side always better). Strain 20 forfeit is the natural check on high-strain builds. Low-strain builds need their own advantage that isn't just "safer." Information advantage (Clarity) and efficiency (Fortify) are candidates.
- **Shield Mastery has no tier 2/3 yet** — needs a branch. Candidates: something that makes Shield interact with strain or allies.
