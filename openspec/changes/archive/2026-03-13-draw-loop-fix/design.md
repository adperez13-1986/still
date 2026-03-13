## Context

Currently, `drawCards()` in `combat.ts` auto-reshuffles the discard pile into the draw pile whenever the draw pile is empty. This is standard deckbuilder behavior, but combined with Still's lack of an energy system, it allows thin decks with draw cards to loop indefinitely — playing draw cards, reshuffling them back from discard, and drawing them again in the same turn.

The heat system is meant to be the cost constraint, but at 1 heat per draw card, a Diagnostics + Cold Efficiency + Coolant Flush cycle is heat-neutral or heat-negative, creating an effortless infinite.

## Goals / Non-Goals

**Goals:**
- Prevent accidental infinite draw loops in thin decks
- Preserve infinite loops as a deliberate, rare build-around achievement
- Keep draw cards effective in fat decks (early game)
- Maintain deterministic behavior — once the infinite build is assembled, it always works

**Non-Goals:**
- Adding an energy/mana system
- Changing heat costs on existing cards
- Adding Exhaust to existing draw cards
- Balancing the infinite build's damage output (future tuning)

## Decisions

### 1. No mid-turn reshuffle (turn-scoped draw pile)

The draw pile is a finite resource each turn. At the start of each turn, if the draw pile has fewer cards than the hand size, the discard pile shuffles in. During the turn, draw effects pull from the draw pile only — if empty, draws fizzle.

**Why:** This is the simplest change that eliminates the loop. Played cards go to discard and stay there until next turn. No new mechanics, no card changes, no heat rebalancing.

**Alternative considered:** Escalating heat per draw (each subsequent draw card costs +1). Rejected — adds hidden complexity and doesn't create an interesting build-around.

### 2. Perpetual Core: rare part that re-enables reshuffle

A rare behavioral part with a new trigger type `onDrawPileEmpty`. When the draw pile is empty and a draw effect requests cards, this part fires and shuffles the discard pile into the draw pile before the draw resolves.

**Why:** Makes infinite loops require a specific rare piece. The part is the gatekeeper — without it, draw is bounded by deck size. With it, the full discard-to-draw cycle is available, enabling true infinites for players who build toward it.

**Trigger:** `onDrawPileEmpty` — fires inside `drawCards()` when `drawPile.length === 0 && discardPile.length > 0` and the part is equipped.

### 3. Reshuffle at turn start, not just when draw pile is empty

Currently the reshuffle is reactive (triggered when draw pile empties). Change to proactive: at the start of each turn, before drawing, if draw pile is insufficient, shuffle discard into draw pile. This makes the turn-start hand draw always work correctly regardless of deck size.

**Why:** Without this, a player with a 3-card deck would draw 3 cards, have an empty draw pile, and the next turn would also have an empty draw pile (all cards in hand → discard → but no reshuffle trigger). The proactive reshuffle at turn start ensures the deck always cycles between turns.

## Risks / Trade-offs

- **Risk:** Players unfamiliar with deckbuilders may not understand why draw fizzled → Mitigation: could add a subtle visual indicator when draws fizzle (future polish, not this change)
- **Trade-off:** Draw cards become weaker in very thin decks (5-6 cards) without Perpetual Core — this is intentional and creates the deckbuilding tension between consistency and draw power
- **Trade-off:** Perpetual Core is a must-have for draw-heavy builds — concentrating power in one part. Acceptable because it's a rare part and the infinite payoff is the reward for finding it.
