## Context

The deckbuilder engine (`src/game/combat.ts`, 1815 lines) and UI (`CombatScreen.tsx`) remain fully intact in the codebase. 95 cards, 20 equipment, 13 parts, 4 body slots, status effects — all there and functional. The work is:

1. **Wire runs back to the old combat flow.** The startCombat/playCard/executeTurn methods in runStore already exist; we just need to call them instead of the strain flow.
2. **Add strain state to the combat engine.** Strain becomes a second field on CombatState alongside `currentEnergy`/`maxEnergy`/`block`.
3. **Add pushable cards.** Cards gain optional `pushCost: number` and `pushedEffect: SlotModifierEffect`. When the player plays a pushable card, they choose baseline or push (UI affordance).
4. **Port the UI improvements.** Player card + per-entity floats + step-through replay from StrainCombatScreen → CombatScreen.
5. **Prevent the previous HEAD bug.** Cap Vulnerable stacks from HEAD, and prevent Repeat from double-applying debuffs.
6. **Migrate rewards.** Growth offers cards/parts/equipment again.

## Goals / Non-Goals

**Goals:**
- Two resources coexist: energy (per-turn) + strain (permanent accumulator)
- Strain's emotional weight (commitment, 20 = forfeit, vent as sacrifice) is preserved from Era 3
- Deckbuilder's tactical depth (card draw, energy allocation, build identity via card+equipment+part combos) is restored from Era 2
- Mobile UI improvements from combat-ui-battlefield carry over
- At least 2 viable archetypes feel distinct in play (target: Counter build, Pyromaniac/aggressive build, maybe a Block/Overclock build)
- Old content works without mass rewrite (95 cards, 20 equipment, 13 parts)

**Non-Goals:**
- Redesigning any Era 2 cards beyond adding push variants to 10-15 chosen ones
- Changing the enemy roster or reactive enemy semantics
- Sector 3 content (still on hold)
- Rewriting the sim from scratch right away (can be deferred — first focus on playable build)
- Restoring every archetype that ever existed (start with 2-3 viable, expand later)

## Decisions

### 1. Strain integration model (Model 1 architecture)

Strain is a separate field on CombatState that accumulates across turns within a combat. It does NOT reset at turn start. Between combats it decays by 4 (same as current). 20 = forfeit.

```typescript
interface CombatState {
  // ... existing fields ...
  strain: number          // accumulates during combat, persists between combats
  maxStrain: number       // 20
  // energy fields unchanged
}
```

Energy keeps its role: per-turn budget for playing cards. Cards cost energy. A card's `energyCost` is checked and deducted when played.

Strain enters the picture via pushable cards (see decision 2) and growth rewards (decision 5).

### 2. Pushable cards (Model 2 initial content scope)

Cards gain two optional fields:

```typescript
interface ModifierCardDefinition {
  // ... existing fields ...
  pushCost?: number                  // strain cost to push (in addition to energyCost)
  pushedEffect?: SlotModifierEffect  // replaces category.effect when pushed
}
```

When a card has `pushCost` set, the player sees a "push" toggle when assigning it to a slot. Toggling push makes them pay the strain on top of energy and activates the `pushedEffect` instead of the base effect.

**Initial pushable cards (first pass):**

| Card | Base | Pushed | Push Cost |
|------|------|--------|-----------|
| Overcharge | Amplify ×1.5 | Amplify ×2.5 + exhaust | 1 strain |
| Meltdown | Override: 10 single | Override: 18 single + self 3 | 2 strain |
| Reckless Charge | Repeat +1 firing | Repeat +2 firings, slot disabled next turn | 1 strain |
| Fortify | Amplify block ×1.5 | Amplify block ×2.5 + persist | 1 strain |
| Shield Bash | Override: 6 damage + 4 block | Override: 10 damage + 8 block | 1 strain |
| Feedback | Feedback | Feedback + bonus damage on HEAD next turn | 1 strain |
| Thermal Surge | Amplify damage ×2 this turn | Amplify damage ×3 this turn, +2 self damage | 2 strain |
| Spread Shot | Redirect to all | Redirect to all + amplify ×1.5 | 1 strain |
| Emergency Shield | Override: 10 block | Override: 15 block + 5 next turn persist | 1 strain |
| Deep Freeze | Apply Weak 2 | Apply Weak 2 + Vulnerable 1 | 1 strain |
| Retaliate | Retaliate | Retaliate ×1.5 value | 1 strain |
| Echo Protocol | Repeat +1 firing on chosen slot | Repeat +1 firing on ALL slots | 2 strain |

~12 cards. Roughly split across categories (amplify, override, repeat, retaliate, feedback, redirect).

### 3. Vent

Vent remains a "spend your turn, recover strain" escape valve.

**Implementation:** Vent is a card (Innate, free play). When played, ends your turn immediately (no more card plays this turn) and recovers 5 strain. Body slot actions still fire (they're automatic). Damage actions are skipped.

Alternatively, Vent could be a button in the UI (not a card). Either works. Card version is more consistent with the deckbuilder.

**Proposal:** Vent is a Starter card that every player gets (Innate, free, -5 strain, ends turn). Keeps it accessible without needing to slot modifiers.

### 4. UI integration

```
┌────────────────────────────┐
│ STRAIN ████░░░  6 / 20     │  ← ported from StrainCombatScreen
│ STILL  [HP bar] [BLK] [E]  │  ← ported PlayerCard, add energy display
│                            │
│ [Enemy card] [Enemy card]  │  ← with per-entity floats + replay flash
│                            │
│ [Combat log]               │  ← compact battle log
│                            │
│ ┌──────┐┌──────┐          │
│ │HEAD  ││TORSO │          │
│ │[eq]  ││[eq]  │          │
│ │[mod] ││[mod] │          │  ← body slots (current Era 2 UI,
│ └──────┘└──────┘          │     maybe compact on mobile)
│ ┌──────┐┌──────┐          │
│ │ARMS  ││LEGS  │          │
│ │[eq]  ││[eq]  │          │
│ │[mod] ││[mod] │          │
│ └──────┘└──────┘          │
│                            │
│ [Hand: card card card ...] │  ← card hand (Era 2)
│                            │
│ [End Turn]                 │
└────────────────────────────┘
```

The player card at top carries over from StrainCombatScreen. The body-slot + hand UI at the bottom is the Era 2 CombatScreen layout. Step-through replay (slot glows, per-entity floats) is wrapped around the execution phase.

### 5. Growth rewards

Return to Era 2 pattern:
- After combat victory, reward screen shows up to 3 growth options + 1 comfort option
- Growth options are card/part/equipment drops (pulled from current drop system in `drops.ts`)
- Taking a growth reward adds strain equal to the item's tier (common: 2, uncommon: 3, rare: 4)
- Comfort remains unchanged (heal 8, strain -4, companion -2)

This uses the `applyGrowthReward(strainCost)` pattern that already exists; we just point it at card/part/equipment instead of actions.

### 6. HEAD VULN fix (the lesson)

The bug: HEAD applies Vulnerable each turn. With Repeat modifier, it applies 2 stacks. Over many turns, stacks to +50% damage multiplier permanently.

**Fixes (belt and suspenders):**
1. Vulnerable applied by HEAD caps at 3 stacks total per enemy per combat.
2. Repeat modifier applied to HEAD does NOT double-apply debuff stacks. It re-fires the action but the debuff-apply step runs once per turn, not per firing.

Implement in `resolveBodyAction()` with an explicit `appliedDebuffsThisTurn` Set tracking enemyId+debuffType pairs.

### 7. Retiring unified-action-slots

Files to delete:
- `src/game/strainCombat.ts`
- `src/components/StrainCombatScreen.tsx`
- `src/components/SlotRearrangement.tsx`

Types to remove from `src/game/types.ts`:
- `ActionType`, `ActionDefinition`, `SlotLayout`, `SynergyEffect`, `SynergyId`
- The `slotLayout` and `acquiredActions` fields on RunState
- The `strain`, `strainCombat` fields (but ADD strain back in CombatState — the RunState field becomes redundant)

Wait — strain needs to persist on RunState (carries between combats), but during a combat it lives on CombatState. We reconcile at combat start/end:
- Combat start: CombatState.strain = RunState.strain
- Combat end: RunState.strain = CombatState.strain (then decay applied)

Files affected but NOT deleted:
- `src/data/actions.ts` — can be deleted along with strainCombat.ts, since actions are no longer a concept
- `src/sim/*` — rewrite sim to model deckbuilder (big task, defer to later change if needed)

### 8. Initial run setup

Starting loadout (new run):
- Deck: STARTING_CARDS (from `data/cards.ts`) + Vent card + any workshop-upgrade bonus card
- Equipment: STARTING_HEAD, STARTING_TORSO, STARTING_ARMS, STARTING_LEGS (scrap-tier)
- Parts: empty (can acquire from shops / drops)
- Strain: 2
- HP: 70, Max HP: 70

### 9. Enemy compatibility

All reactive enemies (Retaliate, StrainScale, Charge, Leech, Enrage, PhaseShift, etc.) are already implemented in the deckbuilder engine (`src/game/combat.ts`). The strain-specific enemy intents (StrainTick, StrainScale) work because CombatState now has a strain field. No enemy code changes needed.

### 10. Migration path

There's no "migrate existing runs." Saved runs from the unified-action-slots system get invalidated when the save schema changes. This is acceptable because:
- The game is pre-release (no real players to lose)
- The slot layout concept doesn't map cleanly to cards/equipment/parts

In `runStore.restoreRun`: check for presence of deck/equipment fields; if missing (old save), clear and start fresh.

## Risks / Trade-offs

**[Double resources = double cognitive load]** → Energy is the primary tactical resource. Strain is accessed only when pushing. Most turns the player thinks in energy; pushing is a moment of decision. This is similar to StS class resources (Watcher Mantra, Ironclad block) layered on energy.

**[Pushing always-optimal → pushing always-every-card]** → Initial pushable count is ~12 cards (not all). Push effects come with real costs (exhaust, self-damage, slot disable). Tuning goal: push 0-2 cards per turn is typical; 4+ is pushing too hard.

**[Re-enabling Era 2 bugs we don't remember]** → The HEAD VULN fix is in. Other bugs may surface in playtest. Accept this risk — the rest of the content was working when abandoned.

**[Sim rewrite is a big task]** → Defer. Get a playable build first, run manual playtests, rewrite sim once the mechanics are stable. The current sim is for the unified-slot system anyway; it's scheduled for deletion.

**[What if 2 viable archetypes don't emerge after all?]** → Then we have evidence against the revival hypothesis. Record in the history doc and evaluate options. But the Era 2 archive already shows multiple viable builds existed, so the prior probability is high.

## Open Questions

- **Should Vent be a card or a button?** Proposal above says card (Innate, free). Open to button if it's annoying to draw.
- **Strain cost on growth rewards** — is tier-based (2/3/4) right? Current system is 3-5 per action. Tune during playtest.
- **Initial strain of 2** — keep or change? Current game starts at 2; argues for consistency.
- **Do we keep the combat-ui battlefield layout order** (strain → player → enemies → slots → log → controls)? The deckbuilder UI has more to fit. May need to compact the body slot panels on mobile.
