## Context

Parts are currently run-local: they drop from enemies, modify stats, and are wiped when the run ends. There is no meta-persistence beyond shards and workshop upgrades. The carried-part feature introduces a second form of cross-run persistence — one that is fragile by design, grounded in the game's theme of carrying broken things forward.

The game uses Zustand + Immer for run state, with no current persistence layer. Adding a carried part requires a small meta-state (localStorage) that exists outside RunState.

## Goals / Non-Goals

**Goals:**
- Player chooses 1 part to carry after every run
- Carried part has durability that decrements after each combat
- Broken parts stay visible (grayed) — not silently removed
- Workshop can repair a broken part (costs shards, limited repair count)
- When a part with no repairs left breaks again, it is permanently destroyed with flavor text
- Carried part (intact or broken) is carried into the next run and loads on start

**Non-Goals:**
- Carrying more than 1 part
- Carrying equipables (slots) across runs
- Durability loss from events or non-combat rooms
- Any repair option outside the Workshop node

## Decisions

### Durability counter over break-chance %

A fixed break chance (e.g., 20% per combat) is unpredictable — the part could survive 10 combats or die on the first. A durability counter is the same probability over time but *visible*. The player can plan: "2 durability left, I need to reach the workshop before the boss." Counters are more legible and create agency.

**Default values:** `maxDurability: 3`, `maxRepairs: 2`. This gives a lifespan of roughly 3 runs under normal conditions — long enough to form attachment, short enough to feel finite.

### Broken ≠ discarded

When durability hits 0, the part becomes inactive but remains in the player's possession — grayed out in the Equips overlay, inert in combat. This follows the game's philosophy: we don't give up on broken things. The player must actively choose to abandon it (by replacing it at end-of-run) or route toward repair.

### Repair limit enforces finitude

Each repair restores `maxDurability` but decrements `repairsLeft`. When `repairsLeft === 0` and the part breaks again, it is permanently destroyed. This is not a failure state — it is the natural end of the part's story. A single flavor message marks the moment.

### Meta-state in localStorage, not RunState

The carried part persists between runs. It must survive run resets. A small `metaStore` (Zustand + localStorage persist middleware) holds `carriedPart: CarriedPart | null`. RunState receives a snapshot of it at run start; the meta-store is updated at run end and after permanent destruction.

### Repair cost: flat shards

Repair costs a flat shard amount (e.g., 50 shards) regardless of repair count. The scarcity of `repairsLeft` is the constraint, not escalating cost. Keeps the economy simple.

## Risks / Trade-offs

- **New persistence layer**: First use of localStorage in the project. Small scope (one object), but sets a pattern. → Zustand's `persist` middleware handles this cleanly; keep it isolated in `metaStore`.
- **Break happens post-combat, not mid-combat**: Simpler and less punishing. Player always completes the room before the part breaks. → Acceptable trade-off; mid-combat breaks would be confusing.
- **End-of-run selection adds a screen**: Run endings currently flow straight to workshop/results. New selection modal adds a step. → Keep it lightweight — a simple overlay, not a new screen.
- **Starting a run with a broken part**: Player may not notice the part is broken until they check the Equips overlay. → Show a brief notice at run start if carried part is broken.

## Open Questions

- Should repair be available when durability is partially depleted (not just at 0)? Probably not — keep repair as a rescue mechanic, not routine maintenance.
- Should the end-of-run selection show the carried part alongside this run's parts, or separately? Showing them together lets the player compare and decide.
