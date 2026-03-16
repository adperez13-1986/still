## Context

S1 enemies use fixed intent patterns (cycle through attack/block/debuff). None reference Still's heat. The existing enemy-system spec says "Sector 1 enemies do not interact with Heat." This change relaxes that rule — S1 enemies CAN read heat, they just do so simply (one reactive turn per cycle, not full AI).

The intent system uses `IntentType` and a fixed `intentPattern` array. Each turn, the enemy resolves `intentPattern[intentIndex % intentPattern.length]`. We need to add conditional resolution without breaking this cycle.

## Goals / Non-Goals

**Goals:**
- Add `Scan` intent type — telegraphs that next turn is heat-reactive (no action this turn)
- Add `HeatReactive` intent type — resolves to one of three sub-intents based on Still's heat zone at execution time
- Add Thermal Scanner enemy to S1 pool
- Show heat-reactive intents clearly in the UI

**Non-Goals:**
- Full enemy AI or branching behavior trees
- Multiple heat-reactive enemies (just one for now)
- Enemies that modify Still's heat directly

## Decisions

### Intent data model: sub-intents on the Intent interface

Add optional fields to the existing `Intent` interface rather than creating new types:

```typescript
interface Intent {
  type: IntentType  // existing: 'Attack' | 'Block' | etc.
  value: number
  // ... existing fields ...

  // Heat-reactive: sub-intents resolved at execution time
  coolIntent?: Intent    // used when Still is Cool (heat 0-3)
  warmIntent?: Intent    // used when Still is Warm (heat 4-6)
  hotIntent?: Intent     // used when Still is Hot (heat 7+)
}
```

When `type` is `'HeatReactive'`, the enemy execution logic reads Still's heat, picks the matching sub-intent, and executes it as if it were a normal intent. The `value` field on the parent is unused (set to 0).

When `type` is `'Scan'`, the enemy does nothing — it's a telegraph turn. The UI shows "Scanning..." with no damage/block preview.

**Why on Intent, not a separate type:** Keeps the `intentPattern` array homogeneous. No need to change pattern cycling, serialization, or combat state. The heat-reactive resolution is one `if` check in `executeEnemyTurn`.

### UI display for heat-reactive intents

**Scan turn:** Show a distinct icon (eye/scanner) with text "Scanning..." — no damage number. Player learns this means "next turn depends on your heat."

**HeatReactive turn (upcoming):** Show three possible outcomes stacked or abbreviated:
```
Cool: 🗡12  |  Warm: 🗡6  |  Hot: 💪+2
```
Or simply show the intent that WILL happen based on current heat (highlighted), with the others dimmed. This gives the player information to plan around.

### Thermal Scanner definition

```
Thermal Scanner — S1 standard enemy
HP: 35
Pattern (4 turns, repeating):
  Turn 1: Scan (telegraph — no action)
  Turn 2: HeatReactive
    Cool: Attack 12
    Warm: Attack 7
    Hot:  Buff Strength +2
  Turn 3: Attack 8
  Turn 4: Block 6
```

Design rationale:
- **Cool → big attack (12):** Punishes passive Cool Runners who sit back and block. Forces them to consider: stay Cool and take 12, or heat up to reduce the threat?
- **Warm → moderate attack (7):** Neutral. No special punishment or reward.
- **Hot → Strength buff (+2):** Doesn't hurt immediately, but scales. A Pyromaniac staying Hot lets this enemy ramp up. Forces them to consider cooling for one turn.
- The Scan turn gives the player a full turn to adjust their heat zone before the reactive turn resolves.

### Encounter placement

Add Thermal Scanner to S1 encounter pool as a solo encounter and in a pair with Fracture Mite. Not an elite — a standard enemy that teaches the mechanic early.

## Risks / Trade-offs

- **UI complexity** — showing three possible intents may be confusing on mobile. → Mitigation: show only the intent matching current heat, highlighted. Others shown small/dimmed.
- **Balance** — 12 damage to Cool Runners in S1 is significant against 70 HP. → The Scan turn telegraphs it one full turn ahead, giving time to adjust. And Cool Runner has passive Block from unplayed cards.
- **Spec contradiction** — existing spec says S1 enemies don't interact with Heat. → Update the spec. The original rule was about keeping S1 simple. A single reactive turn per cycle IS simple — one if-check, telegraphed in advance.
