## Why

After the heat-to-energy rework, energy doesn't constrain decisions. Most starter cards cost 1 energy against an 8-energy budget. Players fill all 4 slots every turn without thinking about energy — the limiting factor is slots, not budget. Energy is decorative.

The design doc intended "2 energy per card minimum, filling all 4 slots costs exactly 8 — a full commitment." But implementation set starters to 1 energy. Playing 4 cards at 1 energy = 4 energy, leaving half the budget unused.

Playtesting confirms: slot prioritization (ARMS first, TORSO if attacked, HEAD/LEGS for draw) is autopilot because there's no tension. Energy needs to be the binding constraint.

## What Changes

### Energy Cost Rebalance
- **Starter cards**: Boost, Emergency Shield, Vent, Diagnostics raised from 1 to 2 energy
- **Pool cards at 1 energy**: Field Repair, Cold Efficiency raised to 2 energy
- **Upgraded costs**: Follow "base - 1" pattern (2E base → 1E upgraded)
- **Companion cards**: Yanah stays 0E (free companion reward), Yuri stays 1E

### Result
- 4 cards at 2E each = 8E = full budget, all slots filled, zero slack
- Playing a 3E card forces skipping a slot (3+2+2=7, one slot empty) OR finding a 1E card to compensate
- Upgrading cards (2E→1E) creates budget headroom — meaningful rest room reward
- Late-game upgraded decks can fill all 4 slots AND play a power card (4×1E + 1×4E = 8E)

## Capabilities

### Modified Capabilities
- `modifier-cards`: Six cards raised from 1E to 2E base cost, upgraded versions from 0E to 1E

## Impact

- **Modify**: `src/data/cards.ts` — 6 card definitions (base + upgraded costs)
