## Context

Shop repair (`ShopScreen.tsx`) costs 50 run shards, calls `permanent.updateCarriedPart({ durability: cp.maxDurability, repairsLeft: cp.repairsLeft - 1 })`. The Workshop screen (`WorkshopScreen.tsx`) already displays the carried part status via `RunInfoOverlay`. All the repair primitives exist — we just need to wire them into the Workshop UI with permanent shards.

## Goals / Non-Goals

**Goals:**
- Repair broken carried parts at the Workshop before starting a run
- Spend permanent shards (50) for the repair

**Non-Goals:**
- Changing shop repair behavior or cost
- Adding new repair mechanics (extra repairs, cheaper repairs, etc.)

## Decisions

### 1. Same cost, different currency

Workshop repair costs 50 permanent shards (matching shop's 50 run shards). No discount or premium — it's the same action, just accessible from a different place.

### 2. UI placement: below companions, above run history

Show the carried part repair section only when the part is broken and has repairs remaining. Styled like the existing workshop upgrade rows — name, description, broken label, repair button with cost.

### 3. Reuse existing store methods

Call `permanent.spendShards(50)` + `permanent.updateCarriedPart(...)` + `permanent.save()`. No new store actions needed.

## Risks / Trade-offs

- **Trivializes shop repair?** Not really — shop repair uses run shards (scarce, earned mid-run), workshop repair uses permanent shards (earned across runs). Both have opportunity costs. Players with excess permanent shards get a convenience benefit, which is the point.
