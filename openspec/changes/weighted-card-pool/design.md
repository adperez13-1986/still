## Context

Currently cards are split into `SECTOR1_CARD_POOL` (15 cards) and `SECTOR2_CARD_POOL` (10 cards), hard-gated by sector. Rewards are 3 random cards from the current sector pool — pure shuffle, no weighting. Every run in the same sector sees the same cards.

## Goals / Non-Goals

**Goals:**
- All cards available from any sector, weighted by sector origin
- Higher sectors increase probability of S2 cards
- Elites/bosses offer better (more S2-weighted) card rewards
- No new data fields — use existing sector grouping as the weight

**Non-Goals:**
- Not adding a rarity field to cards (deferred — sector origin serves as proxy)
- Not changing card effects or costs
- Not adding new cards

## Decisions

### Sector-weighted selection

Use the existing `SECTOR1_CARD_POOL` and `SECTOR2_CARD_POOL` as weight groups. When rolling a card reward, first pick which group, then pick a random card from that group.

**Normal combat weights:**
```
In S1:  S1 cards 75%, S2 cards 25%
In S2:  S1 cards 25%, S2 cards 75%
```

**Elite encounter modifier:**
```
In S1:  S1 cards 60%, S2 cards 40%
In S2:  S1 cards 15%, S2 cards 85%
```

**Boss encounter modifier:**
```
In S1:  S1 cards 50%, S2 cards 50%
In S2:  S1 cards 10%, S2 cards 90%
```

Rationale: S2 cards are generally stronger (Resonance, Cascade, Controlled Burn). Getting one in S1 feels like a lucky find. Getting S1 filler in S2 is less exciting but can still be useful — and prevents the pool from feeling tiny in S2 (10 cards → 25 cards visible).

### Card reward selection algorithm

When offering 3 card choices:
1. For each pick, roll sector group using weights for current context
2. Pick a random card from that group
3. No duplicates in the same offer (re-roll if needed)
4. Cards the player already owns CAN appear (duplicates in deck are valid)

### Shop

Shop uses the same weighted system. Guaranteed at least 1 S2 card in shop if player is in S2.

### Unified pool export

Add a `CARD_POOL` export that combines both sector pools. Keep `SECTOR1_CARD_POOL` and `SECTOR2_CARD_POOL` as exports for the weighting logic. The compendium and sim can use `CARD_POOL`.

## Risks / Trade-offs

- [S2 cards in S1 might feel too strong early] → S2 cards cost more energy or have niche effects. Controlled Burn at 3E is hard to play with S1 equipment. The energy cost naturally gates power.
- [S1 cards in S2 feel like wasted slots] → Some S1 cards are genuinely useful in S2 (Echo Protocol, Feedback). Others are filler, which is fine — StS has this too. Skipping bad offers should become a real choice.
