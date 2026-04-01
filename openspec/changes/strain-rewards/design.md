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
- Bigger damage/block numbers as rewards (explicitly rejected)
- Card/deck system (replaced by strain)
- Equipment system (not yet — slots are fixed for this prototype)
- Companion node integration (designed separately, relevant but not in scope)
- Sector 2+ content (boss is the wall for sector 1)
- Balancing the boss fight (that's a separate concern after rewards exist)

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

### 3. Growth reward types

**Decision:** Three categories of growth, implemented incrementally:

**A. New abilities** (expand what you can do)
- Repair, Brace (moved from defaults)
- Future: new abilities not yet designed (e.g., Focus, Redirect)
- Cost: 2 strain each

**B. Push cost reductions** (same actions, cheaper)
- "Strike Mastery" — Strike push cost: 1 → 0
- "Shield Mastery" — Shield push cost: 1 → 0
- "Barrage Mastery" — Barrage push cost: 1 → 0
- Cost: 3 strain each (high cost because the payoff is permanent and compounding)

**C. Slot mutations** (same slot, different behavior — deferred)
- Not in first implementation. Requires more design work.
- Example: Strike → Piercing Strike (ignores block, lower base damage)
- Deferred to a follow-up change.

For the first pass: abilities (A) and cost reductions (B) only. Mutations (C) are the next layer of depth.

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

- **Exact strain costs for each growth reward** — needs playtesting. Starting point: abilities cost 2, masteries cost 3.
- **Should Vent be improvable?** (e.g., "Vent Mastery: recover 6 instead of 4") — possible growth reward but may be too niche.
- **Boss tuning** — how much growth is "enough"? Depends on boss design, deferred.
- **Can the player see what growth rewards are available before choosing?** Or is it a surprise each time? Leaning toward: you see what's offered, but not the full pool.
