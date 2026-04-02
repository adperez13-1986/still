## Why

The basic reward system (5 growth rewards) is live but too shallow for the 8-10 combat run. Players acquire everything by fight 5-6 and coast the rest — strain stops mattering, every run plays the same. The pool needs depth that creates build identity: different runs should feel different because of which rewards the player chose, not just the order they appeared.

The previous card system had depth through card synergies but it was built on StS's foundation, not the emotional core. This time, depth comes from the strain system itself — rewards that change your relationship with pressure, gated through a branching dependency tree so you earn your build through choices.

## What Changes

- Replace the flat 5-reward pool with a **17-reward branching tree** across 3 branches (Repair, Brace, Offense) and 3 tiers
- **Tier 1: New verbs** (2 strain) — Learn Repair, Learn Brace, Slot Masteries. Foundation.
- **Tier 2: Forks** (2-3 strain) — Each tier 1 unlocks two options. Player picks one direction. This is where builds diverge.
- **Tier 3: Identity** (3 strain) — Conditional rewards that change how you relate to strain. High-strain builds thrive under pressure. Low-strain builds thrive through control. Aggressive builds heal through offense. Endurance builds outlast anything.
- **Dependency gating** — can't take tier 2 without its tier 1 prerequisite. Can't take tier 3 without its tier 2 prerequisite. Tree is hidden from player — each reward screen shows what's available, not the full tree.
- With 8 combats and strain costs of 2-3 per reward, a typical run acquires 5-7 of 17 rewards. Always specializing, never completing everything.
- Update `growth` state to track all acquired rewards and resolve dependencies
- Update combat engine to apply tier 2/3 effects (conditional bonuses, modified abilities, slot behavior changes)

## Capabilities

### New Capabilities
- `growth-tree`: The branching dependency tree — reward definitions, tiers, prerequisites, effects. Replaces the flat pool from strain-rewards.
- `identity-rewards`: Tier 2-3 rewards that modify combat behavior conditionally (strain thresholds, slot mutations, ability upgrades). These are the build-defining rewards.

### Modified Capabilities
- `growth-rewards`: Existing growth reward pool expanded from 5 flat rewards to 17 tiered rewards with dependencies. Growth state tracks full tree progress.
- `reward-choices`: Reward screen now draws from dependency-aware pool — only offers rewards whose prerequisites are met.
- `combat-system`: Combat engine resolves tier 2-3 effects (Drain Strike healing, Reactive Shield timing, conditional bonuses at strain thresholds, etc.)

## Impact

- `src/game/strainCombat.ts` — reward pool replaced with tree structure, dependency resolution, new combat effects for each tier 2-3 reward
- `src/components/StrainCombatScreen.tsx` — reward screen draws from dependency-aware pool, combat UI reflects active tier 2-3 effects
- `src/store/runStore.ts` — growth state expanded to track full tree, apply reward action handles dependencies
- `src/game/types.ts` — updated growth state type
