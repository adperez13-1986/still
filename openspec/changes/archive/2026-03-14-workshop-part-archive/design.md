## Context

The workshop currently has three systems: upgrades (4 one-time purchases), companion unlocks, and carried part selection. Once upgrades are bought, the workshop is inert. The fragment system (idle generation → pre-run bonus spending) adds a screen and state that players ignore. The carried part activates from turn 1 regardless of sector, letting S2 parts trivialize S1.

## Goals / Non-Goals

**Goals:**
- Remove fragment system completely (screen, state, offline calculation)
- Transform carried part into Part Archive with sector-gated activation and cooldown
- Make the workshop a living screen players interact with every run
- Simplify pre-run flow to Workshop → Run

**Non-Goals:**
- Reworking other workshop upgrades (Practiced Routine, Sharp Eye, Extra Slot stay as-is)
- Changing how parts drop during runs (drop system unchanged)
- Adding new parts or rebalancing existing ones
- Changing companion system

## Decisions

### Part Archive stored as a map in permanentStore

```typescript
interface PartArchiveEntry {
  partId: string
  sector: 1 | 2          // sector where this part was found
  cooldownLeft: number    // 0 = ready, >0 = runs until ready
}

// In PermanentState:
partArchive: Record<string, PartArchiveEntry>  // keyed by partId
selectedArchivePart: string | null             // partId chosen for next run
```

**Why a map, not an array**: Deduplication is free — finding the same part again is a no-op. Lookup by partId is O(1) for cooldown checks.

**Why `sector` on each entry**: Parts don't inherently know their sector. We could derive it from pool membership, but storing it at discovery time is simpler and handles future sectors without code changes.

### Sector-gated activation

The carried part loads into run state at run start but with an `activatesAtSector` field. During combat, the part's trigger is checked against the current sector — if the sector hasn't been reached, the part is visible but inert (grayed, like the old broken state).

```
Run starts in Sector 1:
  S1 part → active immediately
  S2 part → visible but inert, labeled "Activates in Sector 2"

Player advances to Sector 2:
  S2 part → becomes active
```

**Alternative considered**: Don't load the part at all until its sector. Rejected because the player should see what they're carrying and know it's coming.

### Win-only cooldown of 3 runs

When a run ends in victory and a carried part was active (i.e., the player reached its sector), the part's `cooldownLeft` is set to 3. Losses don't trigger cooldown — if you died before the part even activated, no penalty.

Cooldown decrements happen at run end (win or loss), not run start. This means starting a run and immediately dying still counts as 1 toward cooldown.

**Why 3, not 5**: With a small early collection (2-3 parts), 5 runs of cooldown means too many "empty" runs. 3 forces rotation without dead stretches.

### Quick Recovery upgrade

Replaces Fragment Reservoir in the upgrade list. Cost: 120 shards (most expensive upgrade). Effect: all archive cooldowns are reduced by 1 (minimum cooldown becomes 2 instead of 3).

This keeps shards relevant as a currency after other upgrades are purchased.

### Migration from current state

1. If `carriedPart` is a non-null string, add it to `partArchive` with `sector: 2` (conservative — we can't know which sector it was found in, and most carry-worthy parts are S2) and `cooldownLeft: 0`. Set `selectedArchivePart` to that partId.
2. Discard `fragmentsAccumulated`. Remove `lastSeenTimestamp` from save data.
3. Remove `fragment-cap` from `workshopUpgrades`. Add `quick-recovery: false`.
4. Delete FragmentScreen route and component.

### Pre-run flow simplification

```
BEFORE: Workshop → Fragment Screen → /run (with bonuses in location.state)
AFTER:  Workshop → /run (no location.state bonuses needed)
```

The `sessionStorage` flag pattern (`still-run-bonuses-consumed`) is no longer needed since there are no fragment bonuses to track. Run restoration on reload simplifies — any navigation to `/run` without active state just attempts restore.

### End-of-run archive additions

When a run ends (win or loss), the RewardScreen or run-end flow checks which parts the player collected during the run. Any part not already in the archive gets added with the appropriate sector and `cooldownLeft: 0`.

The CarrySelectOverlay transforms: instead of "pick one part to carry," it becomes "these parts were added to your archive" — a notification, not a choice. The choice happens at the workshop before the next run.

## Risks / Trade-offs

- **Carried part spec is heavily outdated** — it still references durability/repair which is already removed in code. The delta spec will clean this up alongside archive changes. → Accepted, spec was due for update.
- **Sector detection at drop time** — we need to know which sector the player is in when a part drops, and persist that. The run store already tracks `sector`. → Low risk.
- **Empty archive on first run** — new players have nothing to carry. Same as current behavior (no carried part). → Not a problem.
- **Quick Recovery at 120 shards is a lot** — but it's a permanent 33% cooldown reduction. Players who grind will get it eventually. → Acceptable, can tune cost later.
