## Context

Currently `addPart` in `runStore.ts` pushes parts onto an unlimited array. Parts are acquired from combat drops (auto-added in CombatScreen reward flow) and the staging screen (carried part from previous run). There are 4 S1 parts and 8 S2 parts = 12 total. A player can theoretically hold all 12.

## Goals / Non-Goals

**Goals:**
- Hard cap of 4 parts
- When at cap, part drops show a replacement UI
- Player can choose to skip the new part or replace one existing part
- Clean, simple overlay — show new part vs existing parts, pick one to discard

**Non-Goals:**
- Changing how parts are dropped or their drop rates
- Changing part effects or balance
- Adding part storage/banking between runs

## Decisions

### 1. Cap at 4, enforced in addPart

Add `MAX_PARTS = 4` constant. The `addPart` store action checks `state.parts.length >= MAX_PARTS` and refuses if at capacity. The calling code (CombatScreen reward flow) detects this and shows the replacement UI instead of auto-adding.

### 2. Replacement flow in CombatScreen

The current reward flow auto-adds parts. With the limit:

1. If `parts.length < MAX_PARTS` → auto-add as before
2. If `parts.length >= MAX_PARTS` → show a Part Replacement Overlay:
   - Displays the new part at the top
   - Lists current 4 parts below
   - Player taps an existing part to replace it, or taps "Skip" to discard the new part
   - `replacePart(oldPartId, newPart)` action on the store swaps them

### 3. Store gets a replacePart action

New store action: `replacePart(oldPartId: string, newPart: BehavioralPartDefinition)` — removes the old part and adds the new one in its place. Single atomic operation.

## Risks / Trade-offs

**[Carried part counts toward limit]** → The part carried from a previous run occupies 1 of the 4 slots. This is intentional — it's a real cost of carrying forward.

**[Part drops feel wasted at cap]** → If the player has 4 parts they like and gets a new drop, they might always skip. This is fine — it's the same as getting a card reward and skipping all 3. The choice is still presented.
