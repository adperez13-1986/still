## 1. Verify Type Definitions (already prototyped)

- [x] 1.1 Verify `retaliate` in SlotModifierEffect, `Retaliate` in ModifierCategory, `thorns` in PartEffect, `retaliateActive` in CombatState
- [x] 1.2 Verify `retaliateActive` initialized to false in `initCombat`

## 2. Verify Card Definitions (already prototyped)

- [x] 2.1 Verify Retaliate card in `cards.ts`: 2E (upgraded 1E), slot modifier, Retaliate category, Torso-only
- [x] 2.2 Verify Fortify card in `cards.ts`: 2E, system card, Torso homeSlot, gainBlock 6 + damage 6 AoE
- [x] 2.3 Verify both cards in pool exports (Retaliate in S1, Fortify in S2) and in allCardList

## 3. Verify Part Definition (already prototyped)

- [x] 3.1 Verify Thorns Core part in `parts.ts`: onDamageTaken trigger, thorns effect value 3, uncommon rarity
- [x] 3.2 Verify Thorns Core in S1 part pool export

## 4. Verify Combat Logic (already prototyped)

- [x] 4.1 Verify `getAllowedSlots` returns `['Torso']` for Retaliate
- [x] 4.2 Verify `retaliateActive` is set when Torso fires with Retaliate modifier in `executeBodyActions`
- [x] 4.3 Verify retaliation damage dealt in `executeEnemyTurn` after enemy attack (absorbed block → damage to attacker)
- [x] 4.4 Verify thorns damage dealt in `executeEnemyTurn` when player takes HP damage (flat damage to attacker)
- [x] 4.5 Verify `retaliateActive` resets at start of each execution phase

## 5. UI

- [x] 5.1 Verify Retaliate card displays correctly in hand with Torso-only slot highlighting
- [x] 5.2 Verify Fortify card plays as a system card targeting Torso

## 6. Sim Heuristic

- [x] 6.1 Update heuristic to score Retaliate: high value in defensive mode (block already being prioritized), assign to Torso
- [x] 6.2 Run sim comparison: baseline vs Counter build, verify Counter improves Feedback Loop encounter win rates
