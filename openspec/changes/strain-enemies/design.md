## Context

Current S1 has 12 enemies that all cycle through fixed Attack/Block/Buff/Debuff patterns. No enemy reads player state. The growth tree creates build diversity but nothing in the encounter system tests it.

## Goals / Non-Goals

**Goals:**
- Six new enemy roles that each test a different player strategy
- Reactive intent system: enemies read PAST actions (lookback), not future intent
- On-death triggers (Splitter spawning)
- Conditional behaviors (Scaler buffs only when undamaged, Charger counts down)
- Intent display communicates reactive behavior to the player

**Non-Goals:**
- Replacing existing enemies (these are additions)
- Encounter composition design (which enemies pair together — separate concern)
- Boss redesign
- Balancing numbers perfectly (playtest-driven)

## Decisions

### 1. Reactive intents read past state

Enemy turn happens AFTER player actions resolve. Reactive enemies read combat state that already exists:
- `pushedSlots` — how many slots were pushed this turn
- `strain` — current strain value
- `combatLog` — what actions fired and for how much

No prediction, no conditional branching in intent data. The reactive behavior is a new intent type that the engine resolves by reading state.

### 2. New intent types

| Type | Data | Resolution |
|------|------|------------|
| `Retaliate` | `valuePerPush: 3` | Count pushed slots this turn, deal `count × valuePerPush` damage |
| `StrainScale` | `baseValue: 8, strainDivisor: 5` | Deal `baseValue + floor(strain / strainDivisor)` damage |
| `CopyAction` | (none) | Find highest-value player action this turn from combatLog, perform it as enemy action (damage→attack player, block→gain block, heal→heal self) |
| `Charge` | `chargeTime: 2, blastValue: 28` | Decrement internal counter. If 0, attack for blastValue and reset counter. |
| `ConditionalBuff` | `condition: 'undamaged', buffType: 'Strength', buffValue: 3` | If condition met, apply buff. Otherwise do fallback (normal attack). |

### 3. On-death trigger

New optional field on EnemyDefinition: `onDeath`. Only Splitter uses it.

```
onDeath: {
  type: 'spawn',
  enemies: [{ id: 'splitter-fragment', count: 2 }]
}
```

Engine checks after each enemy dies. If `onDeath` exists, execute it.

### 4. Enemy designs

**Punisher (Thorn Sentinel)**
- HP: 45
- Pattern: Retaliate(3/push), Attack(10), Block(6)
- Cycles normally. On Retaliate turns, reads pushedSlots and hits back.
- If player pushed 0: deals 0. Pushing 3: deals 9.

**Scaler (Feedback Drone)**
- HP: 35
- Pattern: ConditionalBuff(undamaged, Str+3) / Attack(8), Attack(8)
- Turn 1: if it took no damage, gains +3 Str. If it took damage, attacks for 8.
- Gets out of control fast if ignored. Must take damage every turn to suppress.

**Pressure Reader (Strain Siphon)**
- HP: 40
- Pattern: StrainScale(8, base + strain/5), Block(5), StrainScale(10, base + strain/5)
- At strain 10: hits for 10 and 12. At strain 18: hits for 11 and 13.
- Manageable at low-mid strain. Brutal at high strain.

**Charger (Overload Core)**
- HP: 50
- Pattern: Charge(2, 28)
- Turns 1-2: "Charging..." (does nothing). Turn 3: hits for 28. Repeats.
- 2-turn window to kill or prepare massive block.

**Splitter (Fracture Host)**
- HP: 30
- Pattern: Attack(7), Attack(7)
- onDeath: spawn 2 Fracture Fragments (12 HP, Attack 6 pattern)
- Low HP, easy to kill. But killing it creates more problems.

**Mirror (Echo Shell)**
- HP: 20
- Pattern: CopyAction
- Every turn copies player's highest-value action from combatLog.
- Pushed Strike for 9? Mirror attacks for 9. Pushed Shield for 7? Mirror blocks 7.
- Low HP so it dies fast, but punishes brute force while alive.

### 5. Intent display

Reactive intents need clear communication:
- Retaliate: "⚔️ 3 × pushes"
- StrainScale: "⚔️ 8 (+strain)"
- CopyAction: "🪞 Mirrors you"
- Charge: "⚡ Charging... 2" / "💥 BLAST 28"
- ConditionalBuff: "⬆️ +3 Str if undamaged" / normal attack intent

## Risks / Trade-offs

**[Mirror might be too weak at 20 HP]** → It's meant to die fast. It's a puzzle, not a tank. If it lives too long, raise HP.

**[Punisher might make pushing feel bad]** → That's the point. But if ALL pushing feels bad (not selective pushing), the counter-damage might need to only trigger above a threshold (e.g., 2+ pushes).

**[Charger 28 damage might one-shot]** → Player has 70 max HP. 28 is brutal but survivable. Shield(7 pushed) + Brace(5) = 12 mitigation, taking 16. Tight but fair.

**[Scaler Strength stacking with no cap]** → Grows indefinitely. After 3 undamaged turns: +9 Str. That's intentional — it's the timer. Could add a cap if needed.

## Open Questions

- **Encounter compositions** — which reactive enemies pair well? Punisher + Scaler forces you to push (Scaler) but punishes pushing (Punisher). That's a genuine dilemma.
- **Should reactive enemies appear in sector 1 or sector 2?** They test builds that require growth rewards. Too early = unfair. Too late = boring.
- **Splitter fragment cleanup** — do fragments drop rewards? Probably not.
