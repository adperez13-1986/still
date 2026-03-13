Trace heat flow for a specific scenario in Still's combat system.

## How to use
Argument can be an archetype name or a specific scenario:
- `cool` — Trace a Cool Runner turn (play 2-3 cards, stay Cool, check all slot bonuses)
- `hot` — Trace a Pyromaniac turn (play 6-7 cards, push into Hot, calculate self-damage + overheat risk)
- `warm` — Trace a Warm Surfer turn (play 4-5 cards, stay in Warm)
- `oscillator` — Trace an Oscillator turn (pump heat up and down during planning, count threshold crosses)
- Or describe a custom scenario

## What to trace
For the given scenario, read `src/game/combat.ts` and `src/game/types.ts`, then calculate:

1. **Planning phase heat**: Starting heat + card plays + cooling cards = planning-end heat
2. **Execution phase**: All slots check against planning-end heat (no per-slot drift). List which equipment bonuses activate.
3. **End of turn**: LEGS cooling + passive cooling (-2) = next turn starting heat
4. **Multi-turn trajectory**: Does this archetype stabilize at its target zone over 3 turns?
5. **Risk assessment**: How many cards can be played before overheat? What's the HP cost per turn?

Use actual card/equipment definitions from `src/data/cards.ts` and `src/data/parts.ts`.

Present results as a turn-by-turn table showing heat at each step.

Argument: $ARGUMENTS
