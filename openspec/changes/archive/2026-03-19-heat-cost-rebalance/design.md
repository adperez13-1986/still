## Context

Still uses a per-turn energy budget of 8 that resets each turn. Cards cost energy to play and are assigned to one of 4 body slots. Currently most starter cards cost 1 energy, meaning players always have enough energy to fill all slots with no tradeoffs.

## Goals / Non-Goals

**Goals:**
- Make energy the binding constraint (not slots)
- Ensure filling all 4 slots costs the full 8-energy budget with base cards
- Ensure upgrades (2E→1E) feel impactful as a cost reduction reward

**Non-Goals:**
- Changing the energy budget (stays at 8)
- Changing pool card costs that are already at 2E+
- Rebalancing card effects or values

## Decisions

### Decision 1: 2 energy baseline for all cards

Every card costs at minimum 2 energy. This is the "standard rate." Playing 4 base cards = exactly 8 energy = full budget.

**Alternative considered:** Lower budget to 6 — rejected because 2E baseline + 8 budget creates clean arithmetic (4 slots × 2E = 8E exactly) and leaves room for the 3-4E power tier to force real slot tradeoffs.

### Decision 2: Upgraded costs follow "base - 1" pattern

All upgraded cards cost 1 less than their base version. 2E→1E, 3E→2E, etc. This means upgrading at rest rooms directly translates to energy headroom.

### Decision 3: Companion cards stay cheap

Yanah (0E) and Yuri (1E) keep their current costs. Companions are rewards for unlocking them.

## Risks / Trade-offs

**[Starter deck feels slow]** → 4 cards at 2E each fills the whole budget. No "bonus" plays. Mitigation: this is the tension we want. Upgraded cards create headroom.

**[Draw cards at 2E feel expensive]** → Vent/Diagnostics now cost 2E. Mitigation: draw is still valuable. Upgraded Vent at 1E is a strong upgrade target.
