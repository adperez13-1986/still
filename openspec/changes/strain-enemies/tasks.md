## 1. Engine: Reactive Intent Types

- [x] 1.1 Add new IntentTypes to types.ts: Retaliate, StrainScale, CopyAction, Charge, ConditionalBuff
- [x] 1.2 Extend Intent interface with optional fields: valuePerPush, strainDivisor, chargeTime, blastValue, condition, fallbackValue
- [x] 1.3 Add optional onDeath field to EnemyDefinition: { type: 'spawn', enemyId: string, count: number }
- [x] 1.4 Add chargeCounter to EnemyInstance for Charge tracking

## 2. Engine: Enemy Turn Resolution

- [x] 2.1 Resolve Retaliate: count pushedSlots, deal valuePerPush × count
- [x] 2.2 Resolve StrainScale: deal baseValue + floor(strain / strainDivisor)
- [x] 2.3 Resolve CopyAction: scan combatLog for highest player action, replicate
- [x] 2.4 Resolve Charge: decrement counter, blast when 0, reset
- [x] 2.5 Resolve ConditionalBuff: check if enemy took damage this turn, buff or fallback
- [x] 2.6 On-death spawn: check defeated enemies for onDeath trigger, spawn fragments

## 3. Enemy Definitions

- [x] 3.1 Thorn Sentinel (Punisher): HP 45, Retaliate(3/push) + Attack(10) + Block(6)
- [x] 3.2 Feedback Drone (Scaler): HP 35, ConditionalBuff(undamaged, Str+3) + Attack(8)
- [x] 3.3 Strain Siphon (Pressure Reader): HP 40, StrainScale(8, /5) + Block(5) + StrainScale(10, /5)
- [x] 3.4 Overload Core (Charger): HP 50, Charge(2, 28)
- [x] 3.5 Fracture Host (Splitter): HP 30, Attack(7) + onDeath spawn 2 fragments
- [x] 3.6 Fracture Fragment: HP 12, Attack(6) — spawned by Splitter
- [x] 3.7 Echo Shell (Mirror): HP 20, CopyAction

## 4. Intent Display

- [x] 4.1 Retaliate: show "⚔️ 3 × pushes"
- [x] 4.2 StrainScale: show "⚔️ 8 (+strain)"
- [x] 4.3 CopyAction: show "🪞 Mirrors you"
- [x] 4.4 Charge: show "⚡ Charging... N" or "💥 BLAST 28"
- [x] 4.5 ConditionalBuff: show "⬆️ +3 Str if undamaged"

## 5. Encounters

- [x] 5.1 Add reactive enemies to S1 encounter pool (mid-late encounters, not first 2 fights)
- [x] 5.2 Design 3-4 encounter compositions that create dilemmas (e.g., Punisher + Scaler)

## 6. Playtest

- [ ] 6.1 Verify Punisher makes selective pushing feel meaningful
- [ ] 6.2 Verify Scaler creates urgency — turtling fails
- [ ] 6.3 Verify Pressure Reader punishes high-strain without being unfair at mid-strain
- [ ] 6.4 Verify Charger creates a tense countdown
- [ ] 6.5 Verify Splitter changes kill order decisions
- [ ] 6.6 Verify Mirror rewards restraint
