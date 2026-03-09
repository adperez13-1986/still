## Why

Cool archetype system cards (Precision Strike, Cold Efficiency, Glacier Lance) cost 0 heat and reward being Cool. Combined with deck thinning, this creates a degenerate loop where players spam free cards every turn with no resource tension. Hot payoff cards are fine at 0 heat because they require a Warm/Hot gate — you paid heat to get there. Cool cards have no equivalent cost. Failsafe Protocol is also too strong at 0 heat (10 Block + Draw 1 for free).

## What Changes

- Bump Precision Strike from 0 → 1 heat
- Bump Cold Efficiency from 0 → 1 heat
- Bump Glacier Lance from 0 → 1 heat
- Bump Failsafe Protocol from 0 → 1 heat
- No changes to Hot payoff cards (Thermal Surge, Target Lock, Meltdown, Flux Spike) — their Warm/Hot requirement is sufficient gating
- No changes to companion cards (Yanah) — not archetype cards

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `modifier-cards`: Heat cost changes for 4 system cards

## Impact

- `src/data/cards.ts` — update `heatCost` for 4 cards (base + upgraded variants)
