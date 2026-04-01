## Why

The strain combat prototype is playable but has no progression. Every run starts and ends with the same 3 slots and 3 abilities. There's no reason to enter the next combat room — no pull, only pressure. Rewards need to give the player something to look forward to AND create the core tension of the game: growth vs. comfort, investing in yourself vs. resting so you can be present for what matters.

## What Changes

- After winning a combat, the player chooses between a **growth reward** and a **comfort reward**
- **Growth rewards** reduce future strain costs (push costs, ability costs) or add new abilities/slot mutations — making the player more efficient, not more powerful. "The same work costs less." Growth rewards cost strain to take (you're investing in yourself).
- **Comfort rewards** provide immediate relief — HP healing, strain reduction, companion moments. No strain cost, but no lasting improvement.
- Neither path is wrong. Both have consequences:
  - Always choosing growth → strain climbs, risk of forfeit, missing companion warmth
  - Always choosing comfort → underprepared for later fights, can't beat the boss
- The intended run arc: invest early (growth), reap later (comfort). Push now so you can breathe later.
- **Three run outcomes:**
  - **HP = 0** → Game Over. You broke.
  - **Strain ≥ 20** → You stopped. Suboptimal ending. Run ends immediately — not game over, but you gave up. (Seed #8: the soft regret.)
  - **Boss defeated** → You made it.
- The **sector boss is a hard wall**. If the player coasted on comfort rewards and never grew, they won't have the strain budget or tools to survive the boss fight. Comfort's cost isn't a punishment mechanic — it's the bill coming due at the end.
- Some abilities that are currently available from the start (Repair, Brace) may become growth rewards instead of defaults, to create a sparser starting state that grows over the run.

## Capabilities

### New Capabilities
- `reward-choices`: The post-combat reward screen presenting growth vs. comfort choices, reward pool, and strain cost for growth rewards
- `growth-rewards`: Growth reward types — push cost reductions, new abilities, slot mutations. Mechanics for how they modify combat state.
- `comfort-rewards`: Comfort reward types — HP healing, strain reduction, companion moments. Immediate effects with no lasting power gain.

### Modified Capabilities
- `combat-system`: Combat victory now transitions to the reward choice screen instead of a bare "Still standing" continue button
- `game-core`: Run progression now shaped by accumulated reward choices. Starting state may be sparser (fewer default abilities).

## Impact

- `src/game/strainCombat.ts` — reward phase needs to present choices, apply growth/comfort effects
- `src/components/StrainCombatScreen.tsx` — reward screen UI replacing the current bare victory screen
- `src/store/runStore.ts` — track acquired growth rewards (reduced costs, new abilities) across the run
- `src/game/types.ts` — new types for reward definitions, player growth state
