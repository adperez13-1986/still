## Why

Mid-sector combats feel risk-free — the player's block easily covers incoming damage and HP is never threatened until the boss. Without escalating pressure, there's no urgency to route efficiently or make defensive tradeoffs. The "unwinnable race" roguelike principle says the world should get harder the longer you stay.

## What Changes

- **Enemy damage scales with combats cleared**: After a 3-combat grace period, regular enemy damage increases by 10% per additional combat cleared. By combat 9, enemies deal +60% more damage.
- **Boss gets a flat +10% bump**: The boss is already tuned to be hard, so it gets a modest fixed increase rather than the full scaling curve.
- **Formula**: `regular: damage × (1 + max(0, combatsCleared - 3) × 0.10)`, `boss: damage × 1.10`

## Capabilities

### New Capabilities
- `enemy-scaling`: Enemy damage scaling formula based on combats cleared within a sector

### Modified Capabilities
- `enemy-system`: Enemy intent damage resolution now applies a scaling multiplier

## Impact

- `src/game/combat.ts` — Enemy intent resolution applies damage multiplier
- `src/game/types.ts` — May need scaling context passed to combat
- `combatsCleared` already tracked in RunState (from maze collapse change)
