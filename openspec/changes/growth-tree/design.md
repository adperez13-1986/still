## Context

The basic reward system is live: growth vs comfort choice after combat, 5 flat rewards (Repair, Brace, 3 masteries), comfort is contextual. Problem: pool is too shallow for 8-10 combat runs. Players get everything by fight 5-6 and the game is solved.

The archived strain-rewards design explored this and arrived at a branching dependency tree with 17 rewards across 3 tiers. This change implements that tree.

## Goals / Non-Goals

**Goals:**
- Replace flat 5-reward pool with 17-reward branching tree
- Dependency gating: tier 2 requires tier 1, tier 3 requires tier 2
- Tier 2 forks: each tier 1 unlocks two mutually exclusive directions
- Tier 3 identity rewards that change combat behavior conditionally
- Build identity: 5-7 of 17 rewards per run = specialization, not completion
- Earned big numbers through creative build paths

**Non-Goals:**
- Balancing the tree perfectly (playtest-driven, iterative)
- Boss tuning (separate concern)
- Visual/narrative presentation of the tree to the player
- Companion integration
- Shield Mastery tier 2/3 branch (identified gap, deferred)

## Decisions

### 1. Tree structure

3 branches, 3 tiers, forks at tier 2:

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

### 2. Reward catalog

| ID | Label | Branch | Tier | Cost | Requires | Effect |
|----|-------|--------|------|------|----------|--------|
| repair | Learn Repair | Repair | 1 | 2 | — | Unlock Repair (heal 4 HP, 1 strain/use) |
| brace | Learn Brace | Brace | 1 | 2 | — | Unlock Brace (reduce dmg by 3/hit, 1 strain/use) |
| mastery-A | Strike Mastery | Offense | 1 | 3 | — | Strike push cost → 0 |
| mastery-B | Shield Mastery | Offense | 1 | 3 | — | Shield push cost → 0 |
| mastery-C | Barrage Mastery | Offense | 1 | 3 | — | Barrage push cost → 0 |
| repair-plus | Repair+ | Repair | 2 | 2 | repair | Repair heals 7 instead of 4 |
| drain-strike | Drain Strike | Repair | 2 | 2 | repair | Strike heals you for half damage dealt |
| brace-plus | Brace+ | Brace | 2 | 2 | brace | Brace reduces 5 instead of 3 |
| reactive-shield | Reactive Shield | Brace | 2 | 2 | brace | Shield fires after enemy turn |
| piercing-strike | Piercing Strike | Offense | 2 | 3 | mastery-A | Strike ignores enemy block |
| scatter-barrage | Scatter Barrage | Offense | 2 | 3 | mastery-C | Barrage hits random enemies multiple times |
| desperate-repair | Desperate Repair | Repair | 3 | 3 | repair-plus | Strain 15+: Repair heals 8 |
| lifeline | Lifeline | Repair | 3 | 3 | drain-strike | Strain 12+: Vent also heals 4 HP |
| calm-brace | Calm Brace | Brace | 3 | 3 | brace-plus | Strain ≤ 8: Brace reduces 6 |
| fortify | Fortify | Brace | 3 | 3 | reactive-shield | Unused block converts to HP healing |
| executioner | Executioner | Offense | 3 | 3 | piercing-strike | Bonus dmg to enemies below 30% HP |
| chain-reaction | Chain Reaction | Offense | 3 | 3 | scatter-barrage | Kill triggers bonus Barrage |

### 3. Design categories (balance tool, not player-facing)

| Category | Relationship to strain | Rewards |
|----------|----------------------|---------|
| High-strain | Thrives under pressure | Desperate Repair, Lifeline |
| Low-strain | Controls pressure | Calm Brace, Fortify |
| Aggressive | Eliminates pressure sources | Drain Strike, Piercing Strike, Executioner, Chain Reaction |
| Endurance | Absorbs pressure | Reactive Shield, Repair+, Brace+, Fortify |

Categories are ingredients, not archetypes. Builds mix across them.

### 4. Dependency resolution for reward offering

When the reward screen needs a growth option:
1. Build list of all rewards whose prerequisites are met AND not yet acquired
2. Filter by affordability (strain + cost < 20)
3. Pick one (deterministic based on combatsCleared to avoid re-render flicker)

This means early fights offer tier 1, mid fights offer tier 2 (once tier 1 is taken), late fights offer tier 3.

### 5. Growth state expanded

```
growth: {
  rewards: string[]  // all acquired reward IDs, in order
}
```

Replace separate `abilities` and `masteries` arrays with a single `rewards` array. Derive abilities, masteries, and modifiers from this list at combat init time.

### 6. Combat effect resolution

Each tier 2-3 reward modifies combat in a specific way. Effects are resolved by checking `growth.rewards` at relevant points:

- **Repair+**: modify heal amount in Repair resolution
- **Drain Strike**: after Strike damage, heal player for floor(damage/2)
- **Brace+**: modify damage reduction amount in Brace resolution
- **Reactive Shield**: move Shield slot execution to after enemy turn
- **Piercing Strike**: Strike bypasses enemy block
- **Scatter Barrage**: replace single AoE hit with 3 random-target hits
- **Desperate Repair**: check strain ≥ 15, override heal amount
- **Lifeline**: during Vent resolution, also heal 4 HP
- **Calm Brace**: check strain ≤ 8, override reduction amount
- **Fortify**: after enemy turn, convert remaining block to HP
- **Executioner**: add bonus damage when target HP < 30%
- **Chain Reaction**: on enemy kill during Barrage, fire bonus Barrage

## Risks / Trade-offs

**[Some tier 3 rewards may be too strong or too weak]** → Expected. This is a first pass. Playtest and tune. The structure is right even if the numbers aren't.

**[Forks may have a dominant choice]** → If Repair+ is always better than Drain Strike, the fork is fake. Mitigation: ensure each fork side is good against different enemy types or strain situations.

**[17 rewards is a lot to implement at once]** → Implement in tiers. Tier 1 is already done (existing 5 rewards). Tier 2 next, tier 3 last. Each tier is independently testable.

**[Reactive Shield timing change is complex]** → Requires reordering the execution phase. Shield must fire after enemy turn instead of before. This is a slot execution order change, not just a value change.

## Open Questions

- **Shield Mastery has no tier 2/3 branch** — needs design. Candidates: something that makes Shield interact with strain or allies.
- **Should both tier 2 forks be shown when available?** Or just one randomly? Showing both makes the fork explicit. Showing one makes it feel like discovery.
- **Scatter Barrage hit count and targeting** — how many hits? Equal distribution or random? Needs playtesting.
- **Executioner bonus damage amount** — flat +4? Percentage? Needs tuning.
