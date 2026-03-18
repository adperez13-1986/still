## 1. Card Heat Cost Rebalance

- [x] 1.1 Update starter cards in `cards.ts`: Boost 1→2 (upgraded 1→1), Echo Protocol 2→2 (upgraded 3→1), Emergency Strike 2→2 (upgraded 2→1), Emergency Shield 1→2 (upgraded 1→1), Coolant Flush -3→-4 (upgraded -4→-5), Diagnostics 1→2 (upgraded 1→1)
- [x] 1.2 Update S1 slot modifiers: Overcharge 2→3 (upgraded 2→2), Spread Shot 1→2 (upgraded 0→1), Shield Bash 1→2 (upgraded 1→1)
- [x] 1.3 Update S1 HEAD system cards: Quick Scan 1→2 (upgraded 1→1), Thermal Surge 2→3 (upgraded 2→2), Overclock 1→2 (upgraded 1→1), Target Lock 0→1 (upgraded 0→0), Cold Efficiency 1→2 (upgraded 1→1), Heat Surge 1→2 (upgraded 1→1)
- [x] 1.4 Update S1 LEGS system cards: Deep Freeze -5→-6 (upgraded -5→-7), Heat Vent -2→-3 (upgraded -3→-4)
- [x] 1.5 Update S1 ARMS system cards: Meltdown 0→1 (upgraded 0→0), Precision Strike 1→2 (upgraded 1→1), Reckless Charge 3→4 (upgraded 3→3), Fuel the Fire 1→2 (upgraded 1→1)
- [x] 1.6 Update S1 TORSO system cards: Field Repair -1→-2 (upgraded -2→-3)
- [x] 1.7 Update S2 cards: Reroute 1→2/1, Cascade 4→5/4, Resonance 3→4/3, Glacier Lance 1→2/1, Controlled Burn 2→3/2, Flux Spike 0→1/0, Thermal Equilibrium -3→-4/-5, Failsafe Protocol 1→2/1, Armor Protocol 1→2/1, Salvage Burst -1→-2/-3, Thermal Flux -2→-3/-4
- [x] 1.8 Update companion cards: Yanah 0→1 (upgraded 0→0), Yuri 1→2 (upgraded 1→1)

## 2. Enemy Aggression Rework

- [x] 2.1 Update Rust Guard pattern: [Block 8, Attack 10] → [Attack 8, Attack 10, Block 8]
- [x] 2.2 Update Glitch Node pattern: [Buff Str 1, Buff Str 1, Attack 10] → [Buff Str 1, Attack 8, Attack 10]
- [x] 2.3 Update Sentinel Shard pattern: [Block 8, Block 8, Attack 14] → [Block 8, Attack 10, Attack 14]
- [x] 2.4 Update Hollow Repeater pattern: [Buff Str 1, Attack 3x3, Block 4] → [Buff Str 1, Attack 3x3, Attack 5]
- [x] 2.5 Update Echo Construct pattern: [Block 7, Attack 12, Debuff Weak 2, Attack 12] → [Attack 10, Attack 12, Debuff Weak 2, Attack 12]

## 3. System Cards Stack With Equipment

- [x] 3.1 Update `executeBodyActions` in `combat.ts`: slots with `'__system__'` sentinel should still fire their equipment action during execution (system card fired during planning, equipment fires during execution — both contribute)
- [x] 3.2 Remove the `__system__` skip in `executeBodyActions` — system card slots should be treated like unmodified slots during execution (equipment fires normally)
- [x] 3.3 System card slots should NOT allow slot modifiers (a system card and a modifier on the same slot is too much — keep this restriction)

## 4. Damage Scaling

- [x] 4.1 Reduce damage scaling in `combat.ts` from 8% to 5% per combat cleared

## 5. Playtest

- [ ] 4.1 Verify Cool Runner can play 2 cards + LEGS cooling and stay Cool
- [ ] 4.2 Verify Warm Surfer plays 3 cards at Warm comfortably
- [ ] 4.3 Verify Pyromaniac at 4 plays hits Hot and feels risky
- [ ] 4.4 Verify S1 enemies attack often enough that TORSO block matters every turn
- [ ] 4.5 Verify upgrades feel impactful (2 heat → 1 heat is a big efficiency gain)
- [ ] 4.6 Verify early S1 isn't too punishing with higher costs + more aggressive enemies
