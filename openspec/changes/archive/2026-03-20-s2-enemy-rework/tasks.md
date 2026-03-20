## 1. Standard Enemy Patterns

- [x] 1.1 Rework Thermal Leech: replace Absorb opener with Attack, move defensive action later
- [x] 1.2 Rework Wire Jammer: move DisableSlot after turn 1 Attack
- [x] 1.3 Rework Slag Heap: replace Block/Block/Buff opener with Attack turn 1, move Block+Buff later
- [x] 1.4 Rework Feedback Loop: replace Debuff opener with Attack or AttackDebuff
- [x] 1.5 Rework Phase Drone: move DisableSlot after turn 1 Attack
- [x] 1.6 Rework Furnace Tick: replace Absorb opener with Attack
- [x] 1.7 Verify Static Frame and Conduit Spider patterns (Static Frame already attacks turn 1; Conduit Spider opens with DisableSlot — fix)

## 2. Elite Enemy Patterns

- [x] 2.1 Rework Overcharge Sentinel: replace Absorb+Block opener with Attack turn 1, move defensive actions later
- [x] 2.2 Rework Lockdown Warden: replace DisableSlot+DisableSlot opener with Attack turn 1, interleave disruption
- [x] 2.3 Rework Meltdown Core: replace Debuff+Absorb opener with Attack turn 1, move debuffs and defense later

## 3. Boss Pattern

- [x] 3.1 Rework Thermal Arbiter 8-step pattern: Attack turn 1, pressure→disrupt→escalate→peak arc, replace both Absorb intents

## 4. Remove Absorb Intent

- [x] 4.1 Remove 'Absorb' from IntentType union in types.ts
- [x] 4.2 Remove Absorb case from enemy intent resolution in combat.ts
- [x] 4.3 Verify no remaining Absorb references in codebase
