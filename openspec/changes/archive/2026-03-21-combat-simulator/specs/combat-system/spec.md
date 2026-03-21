## ADDED Requirements

### Requirement: RNG injection for deterministic replay
Combat functions that use randomness (`initCombat`, `makeEnemyInstance`, `makeCardInstance`) SHALL accept an optional `rng: () => number` parameter. When provided, all random operations within that function call SHALL use the injected RNG instead of `Math.random`.

#### Scenario: initCombat with seeded RNG
- **WHEN** `initCombat` is called with an `rng` parameter
- **THEN** the deck shuffle SHALL use the provided RNG, producing a deterministic draw pile order

#### Scenario: initCombat without RNG (backwards compatible)
- **WHEN** `initCombat` is called without an `rng` parameter
- **THEN** the function SHALL use `Math.random` as before, with no change in behavior

#### Scenario: Instance ID generation with RNG
- **WHEN** `makeEnemyInstance` or `makeCardInstance` is called with an `rng` parameter
- **THEN** the generated instance IDs SHALL use the provided RNG for the random suffix
