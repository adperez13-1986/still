## Why

Stat stacking (Strength/Dexterity) is the only viable win condition. Stats are permanent, unbounded, and free after investment — they always dominate per-turn modifier plays. The modifier card system (Amplify, Redirect, Repeat, Override) is numerically powerful but creates no qualitatively different combat dynamics. There is no reason to skip stat cards in favor of modifier cards because stats compound with everything.

Two complementary changes fix this: a new modifier type that creates alternative win conditions through slot-dependent behavior (inspired by FFVII materia linking), and stat decay that makes permanent stat accumulation an ongoing energy cost rather than a free investment.

## What Changes

### New Modifier Type: Feedback
A slot modifier card that behaves differently depending on which body slot it is assigned to. **BREAKING**: introduces a 5th slot modifier category.
- **HEAD**: Cards drawn by HEAD add +2 damage to Arms this turn
- **TORSO**: 75% of block gained by Torso is dealt as damage to a random enemy
- **ARMS**: 33% of damage dealt by Arms heals the player
- **LEGS**: Block from Legs persists to next turn (25% decay of carried block each turn)

The same card creates four distinct builds depending on equipment and slot assignment. Players discover synergies through experimentation — the slot IS the context that gives the modifier meaning.

### Stat Decay
**BREAKING**: Strength and Dexterity decay by 1 at end of each turn (minimum 0). Stats become a per-turn energy investment (2E/turn to maintain +2 Str via Power Surge) rather than a free permanent escalation. This creates a genuine tradeoff: spend energy maintaining stats OR spend that energy on modifier cards like Feedback.

### Feedback Card Definition
- Energy cost: 2E (upgraded: 1E)
- Type: Slot modifier (universal — can be assigned to any slot with equipment)
- Sector: S1 card pool (available from start for maximum discovery time)
- No exhaust keyword (reusable like Boost)

## Capabilities

### New Capabilities
- `feedback-modifier`: The Feedback slot modifier card and its four slot-dependent behaviors

### Modified Capabilities
- `modifier-cards`: New 5th slot modifier category (Feedback) added to the existing four
- `enemy-system`: Strength/Dexterity decay at end of turn changes status effect lifecycle

## Impact

- **Modify**: `src/game/types.ts` — new SlotModifierEffect variant, add feedbackArmsBonus and persistentBlock to CombatState
- **Modify**: `src/game/combat.ts` — Feedback resolution in resolveBodyAction, stat decay in endTurn, persistent block logic
- **Modify**: `src/data/cards.ts` — new Feedback card definition (base + upgraded)
- **Modify**: `src/components/EnemyCard.tsx` and `src/components/test/EnemyPanel.tsx` — display Feedback intent descriptions
- **Modify**: `src/components/BodySlotPanel.tsx` — allow Feedback on any slot with equipment
