## Why

Sectors 1 and 2 are complete. S1 teaches the game (discovery), S2 tests build mastery (recognition). S3 is the final sector — the climactic test of the player's run identity. Thematically: acceptance. The robot arrives at the center and finds a mirror. Mechanically: enemies that adapt to and punish the player's specific build, forcing full-toolkit play. No new cards — you are enough as you are.

## What Changes

- Add **S3 enemy roster**: 8-10 regular enemies with mirror, adapter, pressure, and inversion mechanics
- Add **S3 elite enemies** (3): high-difficulty encounters testing specific axes (burst damage, adaptability, efficiency)
- Add **S3 boss: The Reflection** — copies the player's equipment stats, adapts intents to counter the player's last turn
- Add **S3 encounter compositions** (10): predefined pairings that create specific build tests
- Add **S3 events** (6): identity-defining choices — equipment sacrifice, radical card removal, part swaps, resource-for-power trades
- Add **S3 map generation** support: sector 3 maze with appropriate room distribution
- Add **sector transition** from S2 boss to S3
- **No new cards, equipment, or parts** in the S3 pool — player uses what they've built

## Capabilities

### New Capabilities
- `sector3-enemies`: S3 enemy definitions, intent patterns, encounter compositions, elites, and boss
- `sector3-content`: S3 events, map generation, sector transition, reward handling (no new card/equipment/part pools)

### Modified Capabilities
- `enemy-system`: New intent types needed for S3 mechanics (Mirror, Drain, Adapt)
- `grid-maze`: Map generation must support sector 3

## Impact

- **New files**: Enemy definitions added to `src/data/enemies.ts`, events added to `src/data/narrative.ts`
- **Modified files**: `src/game/combat.ts` (new intent resolution), `src/game/types.ts` (new intent types), `src/game/mapGen.ts` (sector 3 support), `src/store/runStore.ts` (sector transition), `src/data/enemies.ts` (S3 data)
- **Sim impact**: New enemies available for simulation testing via `--enemies s3` preset
