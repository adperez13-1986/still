## 1. Extend EquipmentDefinition Type

- [x] 1.1 Add `heatConditionOnly?: HeatThreshold` to EquipmentDefinition in types.ts
- [x] 1.2 Add `multiFire?: { threshold: HeatThreshold; extraFirings: number }` to EquipmentDefinition
- [x] 1.3 Add `blockCost?: number` to EquipmentDefinition
- [x] 1.4 Add `bonusForesight?: number` to EquipmentDefinition

## 2. New Equipment Definitions

- [x] 2.1 Add Shrapnel Launcher (ARMS uncommon): 5 dmg all, blockCost 2
- [x] 2.2 Add Cryo Cannon (ARMS rare): 12 dmg single, heatConditionOnly 'Cool'
- [x] 2.3 Add Meltdown Cannon (ARMS rare): 4 dmg all, multiFire { threshold: 'Hot', extraFirings: 1 }
- [x] 2.4 Add Tactical Visor (HEAD uncommon): draw 1, bonusForesight 1
- [x] 2.5 Add Neural Sync (HEAD rare): draw 2, bonusForesight 1
- [x] 2.6 Add Pyroclast Scanner (HEAD rare): draw 1, heatBonusThreshold 'Hot', heatBonusValue 2
- [x] 2.7 Add Ablative Plates (TORSO rare): 6 Block
- [x] 2.8 Add Cryo Shell (TORSO rare): 4 Block, heatBonusThreshold 'Cool', bonusHeal 2 (conditional on Cool via heatBonusThreshold)
- [x] 2.9 Add Cryo Lock (LEGS rare): -1 Heat, heatBonusThreshold 'Cool', heatBonusBlock 5
- [x] 2.10 Add Thermal Exhaust (LEGS rare): -1 Heat, heatBonusThreshold 'Hot', heatBonusValue 2 (extra cooling)

## 3. Adjust Existing Equipment

- [x] 3.1 Nerf Coolant Injector: -3 heat → -2 heat (already done in prior session)
- [x] 3.2 Reclassify Calibrated Optics: keep as uncommon (already is)
- [x] 3.3 Update EQUIPMENT array and ALL_EQUIPMENT with new items

## 4. Combat Engine — New Mechanics

- [x] 4.1 Handle `heatConditionOnly` in executeBodyActions: skip action entirely if not in zone
- [x] 4.2 Handle `multiFire` in executeBodyActions: fire extra times when in threshold zone
- [x] 4.3 Handle `blockCost` in executeBodyActions: reduce Block after action resolves
- [x] 4.4 Handle `bonusForesight` in executeBodyActions: apply foresight alongside primary action
- [x] 4.5 Handle Cryo Shell conditional heal: bonusHeal only applies when at heatBonusThreshold
- [x] 4.6 Handle Cryo Lock conditional Block: heatBonusBlock on LEGS applies as Block when at threshold
- [x] 4.7 Update projectSlotActions to account for new mechanics in heat/damage projections

## 5. UI Updates

- [x] 5.1 Show "INACTIVE" or dimmed slot when heatConditionOnly equipment can't fire at projected heat
- [x] 5.2 Show multi-fire indicator in slot projection when in zone

## 6. Verification

- [x]6.1 Playtest: Cryo Cannon does nothing outside Cool, 12 dmg while Cool
- [x]6.2 Playtest: Meltdown Cannon fires twice while Hot, once otherwise
- [x]6.3 Playtest: Shrapnel Launcher costs 2 Block on fire
- [x]6.4 Playtest: Thermal Exhaust cools -3 while Hot, -1 otherwise
- [x]6.5 Playtest: Cryo Lock grants 5 Block while Cool
