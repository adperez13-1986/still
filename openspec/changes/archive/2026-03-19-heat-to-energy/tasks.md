## 1. Core Energy System

- [x] 1.1 Add energy budget fields to combat state in types.ts (maxEnergy, currentEnergy) and remove heat accumulation fields (heat thresholds, zones, ablative heat, overheat)
- [x] 1.2 Implement energy reset at turn start in combat.ts — set currentEnergy to maxEnergy (default 8) at beginning of each turn
- [x] 1.3 Replace heat spending logic with energy deduction — cards deduct from currentEnergy instead of adding to heat accumulator
- [x] 1.4 Add energy sufficiency check — prevent card play when currentEnergy < card cost
- [x] 1.5 Remove heat threshold logic (Cool/Warm/Hot/Overheat zone calculations and all zone-based conditionals)
- [x] 1.6 Remove ablative heat damage logic from combat.ts
- [x] 1.7 Remove overheat damage logic from combat.ts
- [x] 1.8 Remove passive heat decay from endTurn()
- [x] 1.9 Remove LEGS cooling logic from execution phase

## 2. Card Rework

- [x] 2.1 Convert all card heatCost fields to energy costs (positive values, rename internally if needed)
- [x] 2.2 Remove all heatCondition fields from cards (Warm/Hot gating)
- [x] 2.3 Remove all heatBonus fields from cards (Cool/Warm/Hot bonus effects)
- [x] 2.4 Rework cooling cards (Coolant Flush, Deep Freeze, Heat Vent, Thermal Flush) into utility system cards with positive energy costs
- [x] 2.5 Rework heat-zone archetype cards (Precision Strike, Cold Efficiency, Fuel the Fire, Reckless Charge, Thermal Flux, Overclock, Heat Surge) into non-zone-conditional effects
- [x] 2.6 Update starting deck: Coolant Flush becomes Vent (1 energy, draw 2 cards), Emergency Shield cost to 1 energy, adjust other starter costs to energy budget

## 3. Equipment Rework

- [x] 3.1 Remove all heatBonusThreshold, heatBonusValue, heatBonusBlock, heatCondition, and heatConditionOnly fields from equipment definitions
- [x] 3.2 Rework heat-conditional equipment to unconditional effects at balanced values (Calibrated Optics, Thermal Plating, Overclocked Pistons, Adaptive Treads, Cryo Cannon, Meltdown Cannon, Heat Shield, etc.)
- [x] 3.3 Rework LEGS equipment from cooling-based to utility-based (card draw, cycling, block)
- [x] 3.4 Remove heat-conditional logic from equipment execution in combat.ts

## 4. Parts Rework

- [x] 4.1 Remove or rework parts that reference heat zones (Frost Core, Ablative Shell, Overheat Reactor, and any parts with heat-zone conditions)
- [x] 4.2 Rework Scrap Recycler if it references heat/exhaust mechanics that no longer apply

## 5. Enemy Rework

- [x] 5.1 Remove HeatReactive intent type from enemy system
- [x] 5.2 Rework Thermal Scanner enemy to use standard pattern-based intents
- [x] 5.3 Remove heat-reactive UI display from EnemyCard.tsx

## 6. UI Updates

- [x] 6.1 Replace heat bar/projection in CombatScreen.tsx with energy budget display (available/max format)
- [x] 6.2 Remove heat zone indicators and threshold warnings from StillPanel.tsx
- [x] 6.3 Remove ablative heat display from compact/mobile StillPanel
- [x] 6.4 Update card cost display to show energy cost instead of heat cost
- [x] 6.5 Update energy display to refund on card unassign during planning phase

## 7. Cleanup

- [x] 7.1 Remove unused heat-related types, interfaces, and constants from types.ts
- [x] 7.2 Remove heat-related helper functions (getHeatZone, calculateAblativeDamage, calculateOverheatDamage, etc.)
- [x] 7.3 Verify all tests pass and no references to removed heat mechanics remain
