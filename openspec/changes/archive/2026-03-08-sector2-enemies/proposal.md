## Why

Sector 1 enemies use simple patterns (Attack, Block, Debuff). The enemy-system spec calls for Sector 2 enemies that interact with Still's Heat state and body slots. DisableSlot and Absorb intent types already exist in the codebase but no enemies use them. S2 needs a full roster that introduces these mechanics.

## What Changes

- Add ~8 standard S2 enemies using DisableSlot, Absorb, and heat-punishing patterns
- Add 3 S2 elite enemies that combine these mechanics aggressively
- Add 1 S2 boss (The Thermal Arbiter) that tests all S2 skills
- Define S2 encounter compositions (which enemies appear together)
- Add encounter selection logic so combat rooms in S2 pull from S2 pools
- Export `SECTOR2_ENEMIES`, `SECTOR2_ELITES`, `SECTOR2_BOSS` alongside existing S1 exports
- Update `ALL_ENEMIES` to include S2 enemies

## Capabilities

### New Capabilities
- `sector2-enemies`: The S2 enemy roster, stat blocks, intent patterns, drop pools, and encounter compositions

### Modified Capabilities
- `enemy-system`: Add encounter composition system — which enemies appear together in a combat room, selected per-sector

## Impact

- `src/data/enemies.ts` — new enemy definitions, S2 exports
- `src/game/combat.ts` or `src/store/runStore.ts` — encounter selection when entering S2 combat rooms
- `src/data/sprites.ts` — sprite data for new enemies
