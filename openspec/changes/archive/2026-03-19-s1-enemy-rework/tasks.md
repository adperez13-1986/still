## 1. New Enemy: Signal Jammer

- [x] 1.1 Add Signal Jammer enemy definition in `enemies.ts`: HP 30, pattern [DisableSlot Arms, Attack 8, Attack 10], dropPool with shards + equipment
- [x] 1.2 Add Signal Jammer to SECTOR1_ENEMIES export array

## 2. Rework Passive Enemy Openers

- [x] 2.1 Sentinel Shard: [Block 8, Attack 10, Attack 14] → [Attack 8, Block 8, Attack 14]
- [x] 2.2 Glitch Node: [Buff Str 1, Attack 8, Attack 10] → [Attack 6, Buff Str 1, Attack 10]
- [x] 2.3 Hollow Repeater: [Buff Str 1, Attack 3×3, Attack 5] → [Attack 3×2, Buff Str 1, Attack 3×3]

## 3. New Encounter Compositions

- [x] 3.1 Add encounter: Signal Jammer + Fracture Mite (intro to slot disruption)
- [x] 3.2 Add encounter: Signal Jammer + Glitch Node (disable + scaling pressure)
- [x] 3.3 Add encounter: Iron Crawler + Fracture Mite × 2 (Vulnerable + multi-hit synergy)
- [x] 3.4 Add encounter: Corroded Sentry + Glitch Node (Weak + scaling synergy)

## 4. Verification

- [x] 4.1 Verify compilation passes
- [x] 4.2 Verify Signal Jammer appears in ALL_ENEMIES record
