## Context

Feedback is currently a slot modifier card (type `slot`, modifier `Feedback`) that goes to a slot's secondary position each turn. It needs to be drawn and played every turn for compounding value. We're converting it to a one-shot system card with a permanent effect.

Current system cards have a fixed `homeSlot` and occupy the primary slot modifier position. Feedback needs to target ANY slot (player's choice) and not occupy either modifier slot — it applies a persistent state.

## Goals / Non-Goals

**Goals:**
- Feedback becomes a system card: play once, exhaust, permanent effect for rest of combat
- Player chooses which slot receives the Feedback effect when playing the card
- Effect does not occupy primary or secondary modifier slots
- LEGS persistent block decay increased to 50% for balance as a free permanent effect

**Non-Goals:**
- Making Feedback a build-defining archetype (it's a good utility card, not a build-around)
- Changing what the Feedback effects DO (HEAD/TORSO/ARMS/LEGS effects stay the same)
- Adding new card types or systems

## Decisions

### 1. Feedback as a freePlay system card with slot targeting

System cards normally have a fixed `homeSlot`. Feedback needs to target any slot. Rather than reworking the system card infrastructure, Feedback will use `freePlay: true` (fires instantly, doesn't occupy a slot) combined with a new field to indicate it needs a target slot from the player.

The `playModifierCard` function will detect Feedback's system effects and apply a persistent flag to `CombatState` based on the chosen `targetSlot`.

**Why not a new card category?** Adding a third category type beyond `slot` and `system` would require changes throughout the codebase (UI, store, combat). Using the existing system card type with `freePlay` and a targeting twist keeps changes minimal.

### 2. Persistent Feedback tracked on CombatState

Add `persistentFeedback: Record<BodySlot, boolean>` to `CombatState`. When a slot has `persistentFeedback[slot] === true`, `resolveBodyAction` applies the Feedback secondary effect for that slot every execution, regardless of whether a Feedback card is in the secondary slot.

This means `executeBodyActions` checks `persistentFeedback[slot]` in addition to the existing secondary modifier check. If either is present, Feedback fires.

### 3. Energy cost: 3E base, 2E upgraded

At 8E budget, 3E is a significant tempo investment for a permanent effect. Comparable to Override cards but with long-term payoff. Upgraded to 2E makes it efficient for decks that have upgraded it via shops.

### 4. Exhaust keyword

Feedback gets the Exhaust keyword. It can only be played once per combat. If a player has multiple copies, each can be played on a different slot (spending 3E each).

### 5. Card targets any slot, including disabled

Feedback can be played on any slot that has equipment, even if the slot is currently disabled. The persistent effect activates when the slot fires on future turns. This prevents feel-bad moments where Wire Jammer's disable blocks your permanent setup.

## Risks / Trade-offs

**[Multiple Feedback copies stack]** → A player with 3 Feedback cards can apply it to 3 slots for 9E. This is a full energy turn of setup. Acceptable because: (a) they need to draw all 3, (b) it costs their entire turn 1, (c) the individual effects are modest.

**[LEGS snowball]** → Increasing decay from 25% to 50% puts equilibrium at ~10 block for a 5-block equipment piece (down from ~17). This is strong but not game-breaking. Sim can validate.

**[Heuristic player needs update]** → The sim heuristic needs to learn to play Feedback as a system card early in combat. Low priority — the sim still works, just doesn't use the new card type optimally until updated.
