## 1. Seedable RNG

- [x] 1.1 Create `src/sim/rng.ts` with `createRng(seed: number)` returning `() => number` (mulberry32)
- [x] 1.2 Add optional `rng` parameter to `shuffle()`, `makeEnemyInstance()`, `makeCardInstance()` in `combat.ts` — default to `Math.random`

## 2. Combat Runner

- [x] 2.1 Create `src/sim/runner.ts` with `simulateCombat()` that loops turn phases (init → play cards → execute → enemy turn → end turn → repeat)
- [x] 2.2 Implement victory/defeat/timeout (50-turn limit) detection and return `CombatSimResult` with outcome, turn count, remaining HP

## 3. Heuristic Player

- [x] 3.1 Create `src/sim/heuristic.ts` with `planTurn(ctx: CombatContext) => CardPlay[]`
- [x] 3.2 Implement threat assessment: sum visible enemy intent damage vs current block
- [x] 3.3 Implement card scoring: rank each hand card by value given threat level and available slots
- [x] 3.4 Implement slot assignment: respect `getAllowedSlots()`, energy costs, and occupied slots
- [x] 3.5 Implement enemy targeting: focus-fire lowest HP enemy

## 4. Statistics & Output

- [x] 4.1 Create `src/sim/stats.ts` with `aggregateResults()` that computes win rate, avg turns, avg HP, std dev, turn distribution
- [x] 4.2 Create formatted console output with histogram bars

## 5. CLI Entry Point

- [x] 5.1 Create `src/sim/cli.ts` with argument parsing (--enemies, --equipment, --parts, --cards, --runs, --seed, --health, --combats-cleared, --verbose)
- [x] 5.2 Wire up data loading: resolve enemy/equipment/part/card IDs from `src/data/` exports
- [x] 5.3 Add encounter presets (s1, s2, s1-boss, s2-boss) that map to actual encounter groups
- [x] 5.4 Add `sim` script to package.json for convenience (`npx tsx src/sim/cli.ts`)
