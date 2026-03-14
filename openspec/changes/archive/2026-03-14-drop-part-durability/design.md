## Context

Carried parts currently have a durability system: 3 uses, breaks at 0, repairable at workshop/shop for 50 shards, max 2 repairs. This creates maintenance overhead without meaningful decisions. The system is being simplified to: you carry one part, it's always active, replace it when you find something better.

## Goals / Non-Goals

**Goals:**
- Remove all durability/repair/breakage logic from carried parts
- Simplify `CarriedPart` type to just a part ID string
- Remove repair UI from Workshop and Shop
- Maintain existing carry selection flow (pick one part at end of run)

**Non-Goals:**
- Changing the carry selection overlay behavior (still pick 1 or none)
- Adding new carried part mechanics (slot limits, costs, etc.)
- Rebalancing parts for the permanent carry change

## Decisions

**Simplify `CarriedPart` to `string | null`**: Instead of an object with `partId`, `durability`, `maxDurability`, `repairsLeft`, the permanent store just holds the part ID string (or null). This is the simplest representation and removes all state that existed only for durability tracking.

**Remove `updateCarriedPart` action**: Only `setCarriedPart(partId)` and `clearCarriedPart()` are needed. No partial updates.

**Remove durability decrement from combat**: Currently combat win decrements carried part durability. This code path is deleted entirely.

## Risks / Trade-offs

- **Carried parts become a permanent power boost** — mitigated by the fact that you can only carry one, and replacing it is a real choice. The power level is bounded.
- **Existing saves with old CarriedPart format** — migration: if the stored value is an object with `partId`, extract the `partId` string. If it's already a string, use as-is.
