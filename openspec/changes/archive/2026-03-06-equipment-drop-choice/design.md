## Context

Equipment drops currently auto-equip via `run.equipItem(equipDef)` in `CombatScreen.tsx` (line 102). The `equipItem` method in `runStore.ts` unconditionally replaces whatever is in the target slot, returning the displaced item — which is then discarded. The player has no say.

The reward flow is: combat ends → drops resolved → shards/parts/equipment auto-collected → RewardScreen shows summary + card picker → `onChoose` callback finalizes everything.

The key reference for UI pattern is `CarrySelectOverlay.tsx` — a fullscreen overlay with side-by-side item comparison. We'll follow the same visual approach.

## Goals / Non-Goals

**Goals:**
- Give the player a choice when equipment would replace an existing item
- Keep auto-equip for empty slots (no friction for pure upgrades)
- Show both items' names and body actions so the decision is informed

**Non-Goals:**
- Equipment inventory or stash (no hoarding)
- Changing drop rates or equipment definitions
- Persisting equipment between runs

## Decisions

### 1. Defer equipment equipping to the RewardScreen phase

Currently equipment is equipped inside the `onChoose` callback alongside everything else. Instead, we'll split it:

- **Empty slot drops**: Still auto-equip immediately in `onChoose` (no conflict)
- **Conflict drops**: Stored as pending, shown in an `EquipCompareOverlay` after the card choice

**Why**: This keeps the reward flow sequential — summary → card pick → equipment choices → continue. The player resolves one decision at a time.

**Alternative considered**: Showing the compare overlay inline within RewardScreen. Rejected because it would complicate the card picker UI and conflate two different decisions.

### 2. New EquipCompareOverlay component

A modal overlay (styled like `CarrySelectOverlay`) that shows:
- Current equipped item (name, slot, body action description)
- Dropped item (name, slot, body action description)
- Two buttons: "Keep Current" / "Equip New"

If multiple equipment conflicts exist in one reward (rare but possible), show them sequentially — one overlay per conflict.

### 3. Flow integration in CombatScreen

The `onChoose` callback currently handles everything at once. We'll add state to track pending equipment conflicts:

1. `onChoose` fires → auto-equip empty-slot drops, collect conflicts into state
2. If conflicts exist, show `EquipCompareOverlay` for the first conflict
3. Player resolves → next conflict (or continue if done)
4. After all resolved, proceed to map/next room

## Risks / Trade-offs

- **Multiple equipment drops in one combat**: Rare but possible. Sequential overlays handle this — each resolution is independent. Not a UX concern at current drop rates.
- **Overlay fatigue**: Adding another overlay to the reward flow. Mitigated by only showing when there's an actual conflict (empty slots skip it).
