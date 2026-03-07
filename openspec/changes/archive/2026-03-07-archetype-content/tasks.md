## 1. Type System Changes

- [x] 1.1 Add `onThresholdCross` to `PartTrigger` union in `types.ts`
- [x] 1.2 Remove `HeatAttack` from `IntentType` union in `types.ts`
- [x] 1.3 Add heat-conditional bonus fields to card/equipment types (e.g., `heatBonus` on card effects, `heatBonusThreshold` + `heatBonusValue` on equipment)

## 2. New Cards

- [x] 2.1 Add Precision Strike (0 heat, 8 dmg / 12 while Cool) with upgraded variant
- [x] 2.2 Add Cold Efficiency (0 heat, draw 2 / 3 while Cool) with upgraded variant
- [x] 2.3 Add Fuel the Fire (+1 heat, 6 dmg + 4 Block while Hot) with upgraded variant
- [x] 2.4 Add Reckless Charge (+3 heat, 18 dmg, Exhaust) with upgraded variant
- [x] 2.5 Add Thermal Flux (-2 heat, dmg = heat change this turn) with upgraded variant
- [x] 2.6 Add Overclock (+2 heat, +1 Str / +2 if threshold crossed) with upgraded variant
- [x] 2.7 Add all 6 cards to ACT1_CARD_POOL and allCardList exports

## 3. New Equipment

- [x] 3.1 Add Calibrated Optics (Head, draw 1 / 2 while Cool, uncommon)
- [x] 3.2 Add Thermal Plating (Torso, 3 Block / 5 while Hot, uncommon)
- [x] 3.3 Add Overclocked Pistons (Arms, 8 dmg + 1 Heat generated, uncommon)
- [x] 3.4 Add Adaptive Treads (Legs, lose 2 Heat + 1 Block per heat lost, uncommon)
- [x] 3.5 Update EQUIPMENT export array with new items

## 4. New Mods

- [x] 4.1 Add Frost Core (onTurnStart, while Cool: +2 Block, uncommon)
- [x] 4.2 Add Overheater (onSlotFire Arms, while Hot: +3 damage, uncommon)
- [x] 4.3 Add Flux Capacitor (onThresholdCross, draw 1 card, rare)
- [x] 4.4 Update BEHAVIORAL_PARTS export array with new mods

## 5. Combat Engine

- [x] 5.1 Implement threshold-crossing detection (compare heat before/after each change, fire `onThresholdCross` triggers)
- [x] 5.2 Track cumulative heat change per turn for Thermal Flux card
- [x] 5.3 Track whether a threshold was crossed this turn for Overclock card
- [x] 5.4 Implement heat-conditional bonus resolution for cards (check threshold, apply bonus effect)
- [x] 5.5 Implement heat-conditional bonus resolution for equipment actions

## 6. Enemy Cleanup

- [x] 6.1 Remove HeatAttack handling from combat.ts
- [x] 6.2 Remove any HeatAttack intents from enemy definitions in enemies.ts
- [x] 6.3 Remove HeatAttack-related scenario from enemy-system main spec

## 7. Compendium

- [x] 7.1 Verify new cards, equipment, and mods appear correctly in Compendium
