## Why

Current heat costs (1 heat for most cards) make card spam the default — play 5 cards, reach heat 5 (Warm), no real consequence. Every slot system change we've made (system cards to slots, slot restrictions) doesn't matter if playing cards costs nothing meaningful. Meanwhile, S1 enemies have too many non-attack turns (Glitch Node: 1/3 attacks, Sentinel Shard: 1/3, Hollow Repeater: 1/3), making TORSO block optional.

The heat system needs to be a real limiter. 2 heat base cost means: 2 plays = Warm (safe), 3 plays = Warm ceiling, 4 plays = Hot (committed). Every card is a real decision. Combined with more aggressive enemies, all 4 slots become essential.

## What Changes

### Heat Cost Rebalance
- **BREAKING**: Starter/basic cards cost **2 heat** (up from 1)
- Better cards cost **1 heat** (efficient — reward for upgrades and finds) or **3+ heat** (powerful, requires commitment)
- Upgraded cards generally cost **1 less heat** than base (making upgrades more impactful)
- Cooling cards adjusted: Coolant Flush -4 (up from -3), Deep Freeze -6 (up from -5), etc.
- System cards with 0 heat cost (Meltdown, Target Lock, Flux Spike) gain 1-2 heat cost — no free plays

### Enemy Aggression
- S1 enemies reworked to attack more frequently: minimum 2/3 turns should be attacks
- Reduce/remove buff-only and block-only turns from standard enemies (elites keep their patterns)
- Reduce damage scaling from 8% to 5% per combat to compensate for higher base aggression
- Base damage values may be adjusted to keep total damage per 3-turn cycle similar

### Archetype Implications
- **Cool Runner** (heat 0-3): Play 2 cards (heat 4) + LEGS cooling (-2 → heat 2). Active with 2 slot decisions.
- **Warm Surfer** (heat 4-6): Play 3 cards (heat 6). Comfortable at Warm ceiling.
- **Pyromaniac** (heat 7-9): Play 4 cards (heat 8). Hot, taking damage, needs cooling to sustain.
- **Oscillator**: Heat swings are larger per card — fewer cards needed to cross thresholds.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `modifier-cards`: All card heat costs rebalanced around 2-heat baseline
- `enemy-system`: S1 enemy intent patterns reworked for higher aggression, damage scaling reduced

## Impact

- **Modify**: `src/data/cards.ts` — every card's heat cost (base and upgraded)
- **Modify**: `src/data/enemies.ts` — S1 enemy intent patterns, damage scaling constant
- **Modify**: `src/game/combat.ts` — damage scaling multiplier (8% → 5%)
- **Verify**: Heat thresholds (Cool 0-3, Warm 4-6, Hot 7-9) still work at 2-heat-per-card pacing
