## Why

The fragment system (idle generation + pre-run spending) is a mobile retention mechanic that doesn't fit a single-player roguelike. Players ignore it or always buy the same OP bonus (Sharp Draw: +1 draw/turn). The carried part system makes runs too easy when an S2 part steamrolls S1 content. And the workshop is dead after upgrades are purchased. All three problems share a root cause: the meta-progression layer lacks meaningful decisions.

## What Changes

- **BREAKING**: Remove the fragment system entirely — FragmentScreen, offline accumulation, fragment state, `collectFragments`/`spendFragments` actions, and all fragment bonuses (Patch-Up, Scrap Cache, Sharp Draw)
- **BREAKING**: Remove the Fragment Reservoir workshop upgrade
- **BREAKING**: Replace single carried part with a Part Archive — a persistent collection of parts found across runs
- Add Part Archive to Workshop: before each run, pick one archived part to carry
- Carried parts activate only in the sector they belong to (S1 parts in S1, S2 parts in S2)
- After a winning run, the carried part goes on a 3-run cooldown (losses don't trigger cooldown)
- Add "Quick Recovery" workshop upgrade (expensive) — reduces archive cooldown by 1 run
- Pre-run flow simplifies from Workshop → Fragment Screen → Run to Workshop → Run

## Capabilities

### New Capabilities
- `part-archive`: Persistent part collection, sector-gated activation, cooldown rotation, and archive UI in the workshop

### Modified Capabilities
- `progression`: Remove Fragment Reservoir upgrade, remove idle fragment generation, remove fragment spending. Add Quick Recovery upgrade. Workshop becomes hub for part archive.
- `carried-part`: Replace single carry slot with archive selection. Remove durability/repair (already removed in code). Add sector-gated activation and win-triggered cooldown.
- `game-core`: Remove fragment bonuses from run initialization. Simplify pre-run flow (no FragmentScreen).

## Impact

- **Remove**: `FragmentScreen.tsx`, fragment state in `permanentStore.ts`, `FragmentBonus` type, fragment route
- **Modify**: `WorkshopScreen.tsx` (add archive UI, remove Fragment Reservoir), `RunScreen.tsx` (remove bonus consumption, add sector-gated part activation), `CombatScreen.tsx` (track win for cooldown), `permanentStore.ts` (archive state, cooldown tracking), `types.ts` (archive types)
- **Data migration**: Existing `carriedPart: string` becomes first entry in archive. Existing `fragmentsAccumulated` is discarded. Existing `workshopUpgrades['fragment-cap']` is removed.
