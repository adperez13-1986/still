## Why

Draw cards in thin decks create an unintentional infinite loop. When the draw pile empties mid-turn, the discard pile auto-reshuffles, letting played draw cards immediately return — two common draw cards (Diagnostics + Cold Efficiency) in a ~5-card deck cycle endlessly with no effort. Infinite combos should be possible but require deliberate deckbuilding, not accidental thin decks.

## What Changes

- **Remove mid-turn reshuffle**: The discard pile no longer auto-shuffles into the draw pile during a turn. If the draw pile is empty mid-turn, draws fizzle. Reshuffling only happens at the start of each turn when drawing the opening hand.
- **Add a rare part "Perpetual Core"**: A rare behavioral part that re-enables mid-turn reshuffle — "When your draw pile is empty, shuffle your discard pile into your draw pile." This makes infinite loops a build-around reward requiring a specific rare piece.
- **No new cards needed**: Existing cooling cards (Coolant Flush at -3 heat) can already serve as the heat management piece in an infinite loop. The build requires: thin deck + draw cards + Perpetual Core + cooling card.

## Capabilities

### New Capabilities
- `perpetual-core`: Rare behavioral part that enables mid-turn draw pile reshuffle from discard

### Modified Capabilities
- `modifier-cards`: Draw pile reshuffle behavior changes — no longer auto-reshuffles mid-turn, only at turn start

## Impact

- `src/game/combat.ts` — `drawCards()` function: remove reshuffle-from-discard logic; `startTurn` or equivalent: ensure reshuffle happens before drawing opening hand
- `src/data/parts.ts` — Add Perpetual Core part definition
- `src/game/combat.ts` — Add part trigger for draw-pile-empty reshuffle
