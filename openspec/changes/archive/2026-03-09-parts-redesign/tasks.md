## Tasks

### Type system
- [x] Add new PartTrigger variants: onCardPlay, onCardExhaust, onModifierAssign, onWouldOverheat, onPlanningEnd, onDamageTaken
- [x] Add new PartEffect variants: blockPerCard, damageRandomEnemy, reduceCardHeatCosts, preventOverheat, amplifyModifiers, blockForDisabledSlots, blockPerExhausted, halveLargeDamage, blockPerUnplayedCard

### Part definitions
- [x] Remove 14 old stat-bump parts from parts.ts
- [x] Add 14 new part definitions (keeping Reactive Frame, Flux Capacitor, Volatile Reactor)
- [x] Create SECTOR1_PART_POOL and SECTOR2_PART_POOL exports

### Combat hooks
- [x] Add onCardPlay hook in playModifierCard (for Cryo Engine, Gyro Stabilizer)
- [x] Add onCardExhaust hook in card exhaust logic (for Scrap Recycler)
- [x] Add onModifierAssign hook in slot assignment (for Feedback Loop)
- [x] Add onWouldOverheat intercept in heat application (for Pressure Valve)
- [x] Add onPlanningEnd hook before body actions execute (for Empty Chamber)
- [x] Add onDamageTaken hook in damage application (for Ablative Shell)
- [x] Add Residual Charge: system cards reduce Heat by 1 in playModifierCard
- [x] Add Zero Point Field: reduce card heat costs at turn start while Cool
- [x] Add Meltdown Core: +50% modifier effect values while Hot in executeBodyActions
- [x] Add Momentum Core: check if all 4 slots fired after executeBodyActions
- [x] Add Salvage Protocol: disabled slots generate Block in executeBodyActions
- [x] Add Failsafe Armor: gain Block equal to exhaust pile at turn start

### Drop pools
- [x] Update S1 enemy drop pools to reference new S1 part IDs
- [x] Update S2 enemy drop pools to reference new S2 part IDs
- [x] Make drops sector-aware for parts (S1 enemies drop S1 parts, S2 drop S2 parts)

### UI
- [x] Update CompendiumScreen with new part listings and sector groupings
