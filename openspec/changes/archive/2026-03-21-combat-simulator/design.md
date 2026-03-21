## Context

`combat.ts` exposes pure functions: `initCombat`, `playModifierCard`, `executeBodyActions`, `executeEnemyTurn`, `endTurn`, `startTurn`. These accept and return `CombatContext`/`CombatResult` with no UI coupling. All game data (cards, equipment, parts, enemies) lives in typed definition objects in `src/data/`.

The simulator needs to: (1) call these functions in a loop, (2) have something make card-play decisions each turn, and (3) aggregate results across many combats.

## Goals / Non-Goals

**Goals:**
- Run thousands of combats in seconds from the command line
- Heuristic player that wins at a rate roughly comparable to a competent human
- Output actionable balance stats: win rate, turn count distribution, HP delta, per-loadout breakdowns
- Reproducible runs via RNG seeding
- Zero impact on existing game code behavior

**Non-Goals:**
- LLM-driven or ML-trained player (future possibility, not this change)
- Full run simulation (maze traversal, shops, events) — combat only
- UI for the simulator
- Performance optimization beyond "fast enough" (target: 10k combats < 5s)

## Decisions

### 1. Seedable RNG via injection, not global replacement

`combat.ts` uses `Math.random()` in three places: `shuffle()`, `makeEnemyInstance()` (instance IDs), and `makeCardInstance()` (instance IDs). Rather than replacing `Math.random` globally or adding a seed parameter to every function, we'll:

- Create a `createRng(seed?: number)` utility that returns a `() => number` function (simple mulberry32 or similar)
- Add an optional `rng` parameter to `initCombat` and internal helpers that use randomness
- Default to `Math.random` when no rng is provided — existing callers unchanged

**Why not a global seed?** Global state is fragile; concurrent sims would collide. Passing rng explicitly keeps things pure.

### 2. Heuristic player as a priority-rule engine

The player is a function: `(state: CombatContext) => CardPlay[]` where `CardPlay = { cardId, slotId, targetEnemyId? }`.

Priority rules (evaluated per card in hand, best play selected):
1. **System cards**: Play Draw cards if hand is small, play damage/block system cards based on incoming threat
2. **Override cards**: Assign to matching slot if slot's base action is weak for the situation
3. **Amplify**: Assign to Arms (damage) or Torso (block) based on threat assessment
4. **Redirect**: Assign to Arms when multiple enemies alive
5. **Repeat**: Assign to highest-value slot (Arms for damage, Torso for block)
6. **Feedback**: Assign to slot with best feedback payoff (HEAD→damage, TORSO→reflect, ARMS→lifesteal, LEGS→persistent block)
7. **Targeting**: Focus fire the lowest-HP enemy (kill fast to reduce incoming damage)

Threat assessment = sum of visible enemy intent damage. If threat > current block + projected block → prioritize defense.

**Why heuristic over random?** Random play loses almost every combat, producing useless data. Heuristic play at ~70-80% human skill surfaces real balance issues.

### 3. CLI via tsx (no new dependencies)

Run with `npx tsx src/sim/cli.ts`. Vite project already has TypeScript resolution. No new packages needed.

CLI arguments:
- `--enemies <ids>` — comma-separated enemy definition IDs (or presets: `s1`, `s2`, `s1-boss`)
- `--equipment <slot:id,...>` — equipment loadout (or `default` for starting gear)
- `--parts <ids>` — comma-separated part IDs
- `--cards <ids>` — additional cards beyond starter deck (or `s1-pool`, `s2-pool`)
- `--runs <n>` — number of combats (default 1000)
- `--seed <n>` — base RNG seed (each run uses seed+i)
- `--health <n>` — starting HP (default 40)
- `--combats-cleared <n>` — for enemy scaling (default 0)
- `--verbose` — print per-combat results

### 4. Statistical output format

```
═══ Combat Simulator Results ═══
Runs:       1,000
Seed:       42

Win Rate:   73.2%
Avg Turns:  5.4  (σ 1.8)
Avg HP Δ:   -18.3  (remaining when won: 21.7)

Turn Distribution:
  2-3 turns: ███░░░░░░░  12%
  4-5 turns: ██████████  48%
  6-7 turns: ██████░░░░  28%
  8+ turns:  ███░░░░░░░  12%

Deaths by Turn:
  Turn 2:    ░░░░░░░░░░   2%
  Turn 3:    ██░░░░░░░░   8%
  Turn 4:    ████░░░░░░  15%
```

### 5. File structure

```
src/sim/
  rng.ts          — seedable RNG factory
  runner.ts       — combat loop (init → play → execute → enemy → repeat)
  heuristic.ts    — heuristic player decision logic
  stats.ts        — result aggregation and formatting
  cli.ts          — CLI entry point, argument parsing
```

## Risks / Trade-offs

**[Heuristic drift]** → The heuristic player may not adapt as game mechanics change, giving stale results.
Mitigation: Keep rules simple and data-driven. When mechanics change, update the heuristic or it becomes obvious from implausible win rates.

**[Incomplete coverage]** → Heuristic may never discover combos a human would find (e.g., specific part + card synergies).
Mitigation: This is acceptable for v1. The sim answers "is this balanced for competent play?" not "what's the optimal strategy?" Combo discovery is a future enhancement (Monte Carlo search).

**[RNG injection touch points]** → Modifying `combat.ts` function signatures could cause type errors downstream.
Mitigation: `rng` parameter is optional with default `Math.random`. All existing call sites unchanged.
