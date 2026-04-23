## Why

The current findable action pool (13 actions) is too thin for build identity to emerge. Most runs the player finds 1-2 actions, and they're mostly damage-focused because the pool doesn't have enough variety to shift strategy. The run-sim confirms it: 78% of runs take Phase Blade, 74% take Focus Fire, defensive actions are rarely picked. The strain system has the right emotional shape but the tactical surface isn't deep enough for meaningful choice.

Before adding new mechanics (like momentum), fill out the action pool so build variety comes from content density.

## What Changes

**Add 12 new findable actions** to roughly double the pool (13 → 25 findable). Each has a distinct tactical personality — not just a value variant of an existing action. The goal is creating situations where "the right tool for this enemy" is different than "the right tool for the last enemy."

- Uses existing action engine mechanics (hits, perHit, persistent, healOverTurns, reflectPct) — no new engine work in this change
- Actions span all damage/defense/sustain/utility types to ensure variety across run rewards
- Balance tuned so each action has a build it's the best choice for (not strictly worse than existing actions)

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `action-pool`: The set of findable actions expands from 13 to 25. New actions use existing action type system.

## Impact

- `src/data/actions.ts` — add 12 new action definitions to `FINDABLE_ACTIONS`
- `src/data/actions.ts` — `ALL_ACTIONS` automatically includes new actions
- No engine changes — new actions use existing mechanics (damage_single/damage_all/block/reduce/heal/reflect/buff/debuff/convert/utility with existing flags)
- Sim heuristic may need re-weighting once new actions are available (separate concern)
- No UI changes — growth reward screen and slot placement UI already handle any findable action
