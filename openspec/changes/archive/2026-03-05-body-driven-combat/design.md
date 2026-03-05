## Context

Still's combat is currently a standard card-as-action model: draw cards, spend energy, play cards that deal damage or gain block. Equipment and parts are passive stat modifiers. The robot identity has no mechanical expression — any theme could be swapped in without changing gameplay.

The current combat state is managed by `combat.ts` (pure functions), `runStore.ts` (Zustand + Immer), and `CombatScreen.tsx` (React UI). Card definitions live in `data/cards.ts`, equipment in `data/parts.ts`, enemies in `data/enemies.ts`. All combat logic is synchronous and deterministic.

## Goals / Non-Goals

**Goals:**
- Make Still's body the primary combat system — equipment generates actions, cards modify them
- Heat as the single central resource replacing energy, creating a uniquely robotic push-your-luck dynamic
- Every equipment choice and modifier card creates meaningful decisions, not just bigger numbers
- Preserve the pure-function combat architecture (no side effects in combat logic)
- Real-time projected Heat display so players make informed decisions, not arithmetic errors

**Non-Goals:**
- Designing Act 2/3 enemy behaviors (future change — this change establishes the combat foundation)
- Changing the map/room structure, shop, rest rooms, or event system
- Redesigning meta-progression systems (Workshop, fragments, shards are adapted minimally to work with the new combat model, not redesigned)
- Animation or visual polish for the execution phase (functional first, pretty later)
- Balancing final numbers — initial values are starting points for playtesting

## Decisions

### Decision 1: Heat replaces energy entirely

Heat is the sole resource constraining combat actions. There is no energy system.

- Body actions fire automatically and each generates +1 Heat
- Modifier cards have a printed Heat cost (typically +1 to +3)
- Heat decays by 2 at the start of each turn (passive cooling)
- No per-turn hard limit on modifier plays — Heat is a soft constraint with escalating consequences

**Why not keep energy alongside Heat?** Two resources competing for the same decision space (what to play this turn) creates confusion without depth. Energy would either be the binding constraint (making Heat irrelevant) or irrelevant itself. One resource, one tension.

**Why soft constraint instead of hard?** A hard limit (e.g., "max 3 modifiers per turn") removes the push-your-luck dynamic. The whole point of Heat is that you *can* play everything — but should you? The thresholds create escalating pressure without a binary yes/no gate.

### Decision 2: Body actions execute in fixed slot order (HEAD → TORSO → ARMS → LEGS)

Execution order is always top-to-bottom. The player cannot reorder slot execution.

**Why fixed order?** It creates inherent sequencing puzzles. HEAD (information/draw) fires first — so a Scanner that draws a card won't help this turn's ARMS modifier because you already assigned modifiers. TORSO (block) fires before ARMS (damage), which means Discharge-style "convert block to damage" effects have a natural home. LEGS (flow/cooling) fires last, serving as end-of-turn cleanup.

**Alternative considered: player-chosen order.** More flexible, but adds a decision that's often trivially optimal (damage first to kill before enemies act... but enemies act after all slots anyway). Fixed order is simpler and creates more interesting constraints.

### Decision 3: One modifier per slot per turn (slot modifiers); unlimited system cards

Each body slot can have at most one modifier card assigned to it per turn. System cards (cooling, draw, conditional) have no slot limit — they're played freely.

**Why limit slot modifiers to one per slot?** Without this constraint, the optimal play is always "stack everything on ARMS, kill instantly." One-per-slot forces the player to spread investment across their body or choose which slot matters most this turn. It also makes hand composition matter — drawing two ARMS modifiers when you can only use one means choosing between them.

**Why unlimited system cards?** System cards are the safety valves (cooling, draws). Limiting them would make Heat spirals unrecoverable. They're self-balancing: cooling cards cost a hand slot that could have been a modifier.

### Decision 4: Equipment defines the action, not the slot

A HEAD slot always *governs* information, but different HEAD equipment produces different information actions. The slot is the domain; the equipment is the specific verb.

```
HEAD slot domain: Information
  Basic Scanner    → draw 1 modifier card
  Cracked Lens     → reveal 1 additional future enemy intent
  Thermal Sensor   → if enemy intends Attack, gain 3 Block (reactive)
```

**Why not let equipment go in any slot?** Slot identity is what makes body-building meaningful. If any gear goes anywhere, slots are just "equipment slot 1-4" with no character. Domain constraints force trade-offs: "I have two great HEAD items but I only have one HEAD."

### Decision 5: Parts become behavioral modifiers, not stat sticks

Parts no longer add flat stat bonuses. Instead, they modify how body actions or cards behave. They remain passive (no activation) but create conditional interactions.

```
Current: "Salvaged Plating — Gain 10 max health"
New:     "Salvaged Plating — When TORSO action fires, gain +2 Block"

Current: "Tension Spring — Gain 1 Strength permanently"
New:     "Tension Spring — When you play an Amplify modifier, reduce its Heat cost by 1"

Current: "Reactive Frame — Gain 2 Block at start of turn"
New:     "Reactive Frame — When Heat is WARM+, TORSO action fires twice"
```

**Why not keep some stat-stick parts?** Stat sticks are invisible during gameplay — the player equips them and forgets. Behavioral parts create moments: "Oh, I'm Warm now, my Reactive Frame kicks in." They make parts feel *present* in combat, not just a setup screen bonus.

**Trade-off:** Behavioral parts are harder to evaluate at a glance. Mitigation: keep part descriptions short and condition-based ("When X, Y happens"), and show active part triggers visually during execution.

### Decision 6: Starting state — Torso only, 8 basic modifiers

Still begins a run with:
- HEAD: empty
- TORSO: Scrap Plating (gain 3 Block)
- ARMS: empty
- LEGS: empty
- Deck: 8 basic modifier cards

The starting deck:
- 3x Boost (+1 Heat, +50% to one action's output)
- 2x Emergency Strike (+2 Heat, any slot → deal 8 damage this turn)
- 2x Coolant Flush (−3 Heat)
- 1x Diagnostics (+1 Heat, draw 2 modifiers)

**Why start so bare?** The "build yourself" arc only works if you start incomplete. With only a Torso, the player can block a little but can't deal damage without Emergency Strike overrides. Finding Arms is urgent and exciting. Each new slot changes what your deck can do, making early-run equipment the most impactful rewards.

**Why include Emergency Strike?** Without any damage source, the player can't progress. Emergency Strike is an expensive, inefficient way to deal damage — it costs a hand slot and +2 Heat for what a basic Arms would do for free. The player is motivated to replace these crutch cards with real equipment.

### Decision 7: Modifier card categories and Heat cost ranges

| Category | Targets | Heat Cost | Effect |
|----------|---------|-----------|--------|
| Amplify | One slot | +1 to +3 | Increase action output (50%, 100%, 150%) |
| Redirect | One slot | +1 | Change targeting (single→AoE, focus lowest HP) |
| Repeat | One slot | +2 to +3 | Action fires additional times |
| Override | One slot | +1 to +2 | Replace slot's action entirely this turn |
| Cooling | Global | −2 to −5 | Reduce Heat, sometimes with bonus effects |
| Draw | Global | +1 | Draw additional modifier cards |
| Conditional | Global | +0 | Powerful effects gated by Heat threshold state |

Heat costs are the primary balancing lever. A card that's too strong gets a higher Heat cost, pushing the player closer to dangerous thresholds.

### Decision 8: Projected Heat display — always visible, free

The combat UI shows a real-time Heat projection that updates as the player assigns modifiers:

```
Current Heat: 4  →  After this turn: 9 (HOT ⚠️ −3 HP)
```

This projection accounts for: current Heat − 2 (cooling) + body actions (filled slots) + assigned modifier costs + LEGS cooling (if applicable).

**Why not gate behind equipment?** Hiding basic arithmetic behind a perk punishes new players for miscounting, not for bad strategy. The interesting gated information is multi-turn projection ("you'll overheat in 2 turns at this rate"), which could be a HEAD equipment perk.

## Risks / Trade-offs

**[Risk: Turns feel thin without enough modifier variety]** With only 1 modifier per slot and 4 slots, turns could feel like "play the obvious best modifier on each slot." → Mitigation: System cards add decisions beyond slot assignment. Conditional cards create Heat-threshold minigames. Parts create unexpected synergies. If early playtesting shows thin turns, increase hand size from 4 to 5.

**[Risk: Empty slots early game make combat feel helpless]** Starting with only Torso means no damage without Emergency Strike overrides, which are expensive. → Mitigation: Ensure Act 1 early rooms drop Arms equipment frequently. First combat could be a weak enemy (tutorial fight) that Torso block alone can outlast. Map generation could guarantee an equipment reward in the first 1-2 rooms.

**[Risk: Heat math overwhelms new players]** Four thresholds, per-action generation, passive cooling, modifier costs — lots of numbers. → Mitigation: The projected Heat display does all the math. Thresholds are color-coded (blue/yellow/orange/red). Overheat is dramatic and recoverable (shutdown + reset to 5), not a death sentence.

**[Risk: Breaking all existing content simultaneously]** Every card, every part, every equipable, and the combat loop all change at once. → Mitigation: Implement in layers: (1) new types + combat loop with placeholder data, (2) body action system, (3) Heat system, (4) modifier cards, (5) parts rework, (6) UI. Each layer is testable independently.

**[Risk: Carried part system needs adaptation]** Carried parts currently use PartDefinition with stat effects. They need to work with behavioral parts. → Mitigation: Carried parts adopt the new behavioral part format. Durability and repair mechanics are unchanged — only the effect type changes.

**[Trade-off: Losing deck-building depth for body-building depth]** The modifier deck is smaller and less varied than a full StS-style deck. Deck building becomes secondary to body building. This is intentional — the body IS the build — but players who love pure deckbuilding may miss it. The modifier deck still grows and improves over a run, just with a different ceiling.

### Decision 9: Status effects map to body actions by domain

Existing status effects are preserved but mapped to the body-action system:
- **Strength** → adds to ARMS damage output (per firing)
- **Dexterity** → adds to TORSO Block output (per firing)
- **Weak** → reduces ARMS damage by 25%
- **Vulnerable** → increases incoming enemy damage by 50% (unchanged)
- **Inspired** → reworked: draw +N extra modifier cards next turn (replaces +1 energy)

Override actions do NOT receive Strength/Dexterity bonuses — they have fixed values. This prevents Emergency Strike from scaling with Strength, keeping it as an early-game crutch.

### Decision 10: Companion cards become system modifiers

Yanah and Yuri keep their identities but adapt to the modifier card format:
- **Yanah** → System (Draw), +1 Heat: draw 2 modifier cards, gain 1 Inspired
- **Yuri** → System (Cooling), +0 Heat: heal 6 HP, remove 1 debuff

They're added to the starting deck when unlocked, same as before.

### Decision 11: Progression system adaptations

Three Workshop/Fragment systems are affected by removing energy:
- **"Extra Slot" upgrade** → pre-equips basic Piston Arm in ARMS slot. This is the single most impactful Workshop upgrade because it gives a damage-dealing body action from turn 1.
- **"Overcharged" Fragment bonus** → replaced with "Cooled Start" (+1 passive cooling for first 3 turns). Cool 3 Heat/turn instead of 2, giving a gentler Heat curve in early combat.
- **"Practiced Routine" upgrade** → adds a random Act 1 modifier card to the starting deck.
- **"drawCount" Fragment bonus** → still works, increases hand size from 4 to 5 for the run.

### Decision 12: Carried parts use behavioral format

Carried parts adopt the behavioral part format. When broken (durability 0), the behavioral trigger deactivates — it no longer fires during combat. When repaired, the trigger reactivates. Durability, repair, and permanent destruction mechanics are unchanged.

### Decision 13: Power card equivalent deferred

The old "Power" card type (permanent combat effect, removed from play) has no direct analog in this change. This is intentionally deferred — the modifier card system may naturally evolve to include "Install" cards (system cards that provide a permanent combat bonus and Exhaust) in a future change. For now, Momentum-style permanent Strength is achieved through behavioral parts, not cards.

## Open Questions

- **Hand size tuning**: Starting at 4 modifiers per turn. Does this provide enough choice? Might need 5 if turns feel predetermined.
- **Shop/rest room changes**: Do shops sell equipment + modifiers separately? Do rest rooms still offer card upgrades (now modifier upgrades)?
