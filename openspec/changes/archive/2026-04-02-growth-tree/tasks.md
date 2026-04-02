## 1. Reward Data & Tree Structure

- [x] 1.1 Define all 17 rewards with id, label, description, branch, tier, strainCost, requires, effectType in strainCombat.ts
- [x] 1.2 Replace `getAvailableGrowthRewards` with dependency-aware version: filter by prerequisites met + not acquired + affordable
- [x] 1.3 Change growth state from `{ abilities: string[], masteries: string[] }` to `{ rewards: string[] }` in types.ts
- [x] 1.4 Update runStore: derive abilities/masteries from rewards array, update save/restore
- [x] 1.5 Update RunScreen startRun calls with new growth state shape

## 2. Tier 2 Combat Effects

- [x] 2.1 Repair+: modify heal amount to 7 when repair-plus in rewards
- [x] 2.2 Drain Strike: after Strike damage, heal player floor(damage/2)
- [x] 2.3 Brace+: modify damage reduction to 5 when brace-plus in rewards
- [x] 2.4 Reactive Shield: move Shield execution to after enemy turn
- [x] 2.5 Piercing Strike: Strike bypasses enemy block
- [x] 2.6 Scatter Barrage: replace AoE with 3 random-target hits

## 3. Tier 3 Combat Effects

- [x] 3.1 Desperate Repair: at strain 15+, Repair heals 8
- [x] 3.2 Lifeline: at strain 12+, Vent also heals 4 HP
- [x] 3.3 Calm Brace: at strain ≤ 8, Brace reduces 6
- [x] 3.4 Fortify: convert remaining block to HP after enemy turn
- [x] 3.5 Executioner: +4 bonus damage to enemies below 30% HP
- [x] 3.6 Chain Reaction: kill during Barrage triggers bonus Barrage

## 4. Reward Screen Updates

- [x] 4.1 Reward screen draws from dependency-aware pool
- [x] 4.2 Show reward tier and prerequisite context in reward card
- [x] 4.3 Update applyGrowthReward to work with new rewards array

## 5. Playtest

- [ ] 5.1 Verify tier 1 → tier 2 → tier 3 progression across fights
- [ ] 5.2 Verify each tier 2 effect works in combat
- [ ] 5.3 Verify each tier 3 conditional triggers correctly
- [ ] 5.4 Verify builds feel different (aggressive vs endurance vs high-strain vs low-strain)
- [ ] 5.5 Verify pool never runs dry before fight 8
