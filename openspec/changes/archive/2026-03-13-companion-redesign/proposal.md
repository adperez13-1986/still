## Why

Yanah and Yuri companion cards are auto-included in every run's starting deck via Workshop unlock, making them feel like passive stat buffs rather than meaningful choices. Yanah is overpowered in thin decks (free block every cycle), and neither card has mechanical identity tied to the heat archetype system. They deserve to be event-gated acquisitions with archetype alignment and emotional resonance.

## What Changes

- **Remove companions from starting deck** — Workshop unlock no longer auto-adds them to deck
- **New companion events** — Yanah and Yuri are found during runs via special event encounters
- **Workshop unlock gates event availability** — unlocking a companion makes their event appear in the event pool, not auto-deck-include
- **Redesigned card effects** — Yanah becomes Cool Runner aligned (block + enhanced Cool block), Yuri becomes Pyromaniac aligned (damage + enhanced Hot damage)
- **New event outcome type** — events need a `companion` outcome type that adds a companion card to the player's deck mid-run

## Capabilities

### New Capabilities
- `companion-events`: Event definitions for finding Yanah and Yuri during runs, including narrative text, choice structure, and companion-acquisition outcome type

### Modified Capabilities
- `narrative`: Yanah/Yuri acquisition changes from Workshop auto-deck to event-gated. Workshop unlock now gates event availability instead of deck inclusion.

## Impact

- `src/data/cards.ts` — Redesign yanah/yuri card definitions (new effects, heat conditions)
- `src/data/narrative.ts` — Add companion event definitions, new outcome type `companion`
- `src/components/EventScreen.tsx` — Handle new `companion` outcome type
- `src/components/RunScreen.tsx` — Remove companion auto-add to starting deck
- `src/store/runStore.ts` — Handle companion outcome in event resolution
- `src/components/WorkshopScreen.tsx` — Update companion description (unlocks event, not deck inclusion)
- `src/components/CompendiumScreen.tsx` — May need update for companion card display
