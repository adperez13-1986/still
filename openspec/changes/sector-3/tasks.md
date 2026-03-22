## 1. Type System Extensions

- [ ] 1.1 Add new IntentTypes to `types.ts`: `Drain`, `ExhaustCard`
- [ ] 1.2 Add optional `bondedWith?: string` field to `EnemyInstance`
- [ ] 1.3 Add optional `energyDrain?: boolean` field to `EnemyDefinition`
- [ ] 1.4 Add optional `phaseImmunity?: boolean` and `adaptSlotImmunity?: boolean` fields to `EnemyDefinition` for S3-specific behaviors

## 2. Combat Logic Extensions

- [ ] 2.1 Handle Drain intent in `executeEnemyTurn`: steal player block, deal as damage
- [ ] 2.2 Handle ExhaustCard intent in `executeEnemyTurn`: exhaust random card from draw/discard pile
- [ ] 2.3 Implement bonded enemy damage sharing in `executeBodyActions`: when dealing damage to a bonded enemy, heal partner 50%
- [ ] 2.4 Implement energy drain: reduce max energy by 1 per alive energy-drain enemy at end of turn, restore on death (min 4)
- [ ] 2.5 Implement Phase Shade logic: double/zero damage on odd/even turns (check via `roundNumber`)
- [ ] 2.6 Implement Null Circuit slot immunity: track cumulative damage per slot, immune to top slot, reset every 3 turns
- [ ] 2.7 Implement Echo Shell reactive block: gain block equal to damage received last turn
- [ ] 2.8 Implement Hollow Twin: read player Torso equipment base block as attack value

## 3. The Reflection Boss

- [ ] 3.1 Create `makeReflectionBoss` function that reads player equipment and returns a customized EnemyDefinition with scaled HP and equipment-mirrored attack/block values
- [ ] 3.2 Implement adaptive intent pattern: counter player's last turn (blocked → attack, attacked → block, 3+ cards → debuff)
- [ ] 3.3 Implement every-4th-turn disable of player's highest-output slot

## 4. Enemy Definitions

- [ ] 4.1 Define S3 regular enemies in `enemies.ts`: Echo Shell, Hollow Twin, Flux Warden, Null Circuit, Decay Tick, Memory Leak, Phase Shade, Siphon Frame, Bonded Pair (2 enemy defs)
- [ ] 4.2 Define S3 elite enemies: The Recursion, Void Sentinel, The Weight
- [ ] 4.3 Define S3 boss: The Reflection (placeholder values, actual stats injected at runtime)
- [ ] 4.4 Define S3 encounter compositions (10 predefined groups)
- [ ] 4.5 Add S3 enemy exports: `SECTOR3_ENCOUNTERS`, `SECTOR3_ELITE_ENCOUNTERS`, `SECTOR3_ENEMIES`, `SECTOR3_ELITES`, `SECTOR3_BOSS`
- [ ] 4.6 Add S3 enemies to `ALL_ENEMIES` record

## 5. Events

- [ ] 5.1 Define 6 S3 events in `narrative.ts`: equipment sacrifice, radical deck thinning, part swap, power-for-health, full reset (shards→heal), card transmutation
- [ ] 5.2 Implement event outcome types that don't exist yet: `sacrificeEquipment`, `removeMultipleCards`, `swapPart`, `transmuteCard`

## 6. Map & Sector Transition

- [ ] 6.1 Ensure `generateGridMaze` accepts sector 3 and produces valid maze
- [ ] 6.2 Add sector transition from S2 boss to S3 in `runStore.ts` (same pattern as S1→S2)
- [ ] 6.3 S3 boss defeat triggers run victory with `sectorReached: 3`

## 7. Rewards & Pools

- [ ] 7.1 S3 combat rewards draw from S2 card/equipment/part pools
- [ ] 7.2 S3 shop uses S2 pools

## 8. Simulator Support

- [ ] 8.1 Add `s3`, `s3-elite`, `s3-boss` presets to sim CLI
- [ ] 8.2 Update sim heuristic to handle S3-specific enemy behaviors (phase immunity, bonded pairs)
