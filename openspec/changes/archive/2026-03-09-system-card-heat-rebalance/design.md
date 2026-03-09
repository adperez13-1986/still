## Context

Card removal was just added (60 shard shop recycler + events). Thin decks of 0-heat system cards can now be reliably constructed, making Cool archetype and Failsafe Protocol spammable with no resource tension. Hot payoff cards at 0 heat are gated by requiring Warm/Hot threshold — Cool cards have no equivalent gate.

## Goals / Non-Goals

**Goals:**
- Add heat cost to Cool payoff cards so the Cool archetype requires cooling infrastructure to function
- Add heat cost to Failsafe Protocol to prevent free Block + Draw every turn

**Non-Goals:**
- Rebalancing Hot payoff cards (already gated by threshold requirement)
- Rebalancing slot modifier cards (already limited to 4 slots per turn)
- Adding new cards or mechanics

## Decisions

### Cool payoff cards: 0 → 1 heat

Precision Strike, Cold Efficiency, and Glacier Lance each go from 0 to 1 heat. This means playing Cool cards pushes you toward Warm, creating the intended tension: you need cooling (Legs slot, cooling cards, Feedback Loop part) to stay Cool while using Cool cards. Without cooling investment, you can play 2-3 Cool cards before losing the bonus. With investment, you can spam them — which is the reward for building around cooling.

Upgraded variants also change to 1 heat (were 0). Upgrades improve effects, not costs.

### Failsafe Protocol: 0 → 1 heat

10 Block + Draw 1 is generically strong. At 0 heat it goes in every deck with no opportunity cost. At 1 heat it's still good but competes for heat budget. Upgraded variant also goes to 1.

### No description changes needed

Card descriptions don't display heat cost (that's shown separately in the card UI). Only the `heatCost` field changes.

## Risks / Trade-offs

- **Cool archetype gets weaker** → Intentional. Cool was the strongest archetype with zero investment. It now requires building around cooling, which is the intended design. Parts like Feedback Loop and Cryo Engine become more important.
- **Failsafe Protocol less auto-include** → Also intentional. At 1 heat it's a real choice, not a freebie.
