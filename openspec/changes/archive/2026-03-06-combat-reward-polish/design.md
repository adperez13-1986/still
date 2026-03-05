## Context

`resolveDrops()` does a single weighted random roll across the entire drop pool. Shards entries typically have weight 3-4 vs weight 1 for cards/parts/equipment, so ~75% of fights yield only shards. RewardScreen only renders card drops — parts, equipment, and shard amounts are invisible.

Starting deck is 3x Boost, 2x Emergency Strike, 2x Coolant Flush, 1x Diagnostics — pure offense with no block option.

## Goals / Non-Goals

**Goals:**
- Every fight drops shards guaranteed, plus a roll for a bonus reward
- Player sees all rewards on the reward screen before continuing
- Starting deck has one defensive override option

**Non-Goals:**
- Changing enemy drop pool definitions (the weights within pools stay, logic changes)
- Adding new reward types or reward choice mechanics
- Balancing shard amounts or part/equipment stats

## Decisions

### Decision 1: Generous drop model in resolveDrops()

Split the drop pool into shard entries and non-shard entries. Always resolve shard drops (pick highest-weight shard entry, apply variance). Then, if non-shard entries exist, do a weighted roll among them for a bonus drop. Returns an array with 1-4 items (shards + optional bonus).

This keeps enemy drop pool data unchanged — the generosity comes from the resolution logic.

### Decision 2: RewardScreen shows all drop types

Before the card picker (or Continue button), display a summary section showing:
- Shards: `+15 shards` with shard color
- Part: `Found: Reactive Frame` with part color
- Equipment: `Found: Welding Torch` with equipment color

These are informational — no choice needed. Card drops still get the existing picker UI.

### Decision 3: Starting deck swap is a data-only change

Replace one `emergencyStrike` with `emergencyShield` in the `STARTING_CARDS` array in `data/cards.ts`.

## File Changes

| File | Change |
|------|--------|
| `src/game/drops.ts` | Rework `resolveDrops()` — always include shards, roll bonus from non-shard pool |
| `src/components/RewardScreen.tsx` | Add drop summary section showing shards, parts, equipment |
| `src/data/cards.ts` | Swap one `emergencyStrike` for `emergencyShield` in `STARTING_CARDS` |
