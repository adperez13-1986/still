## Context

Equipment drops use a weighted random system in `resolveDrops()`. Each enemy has a `dropPool` with shard, card, part, and equipment entries at various weights. Shards always drop; one bonus item is rolled from the remaining entries. Many enemies (e.g., Wandering Drone, Corroded Sentry, Fracture Mite, Glitch Node) have no equipment in their pool at all, creating dead zones where equipment can never drop regardless of luck.

Players start with 2 equipped slots (Torso default + Arms from workshop upgrade) and rarely fill Head or Legs before the boss.

## Goals / Non-Goals

**Goals:**
- Players reliably obtain 3-4 equipment pieces per Act 1 run
- The system feels organic — players shouldn't notice the pity mechanic
- Equipment drought never exceeds ~4 combats without a drop

**Non-Goals:**
- Guaranteeing specific slots fill (Head vs Legs is still RNG)
- Changing enemy drop pool definitions
- Adding equipment to the shop (separate concern)

## Decisions

### Pity counter on run state, not global
The counter lives on `RunState.equipPity` and resets each run. This keeps it simple and avoids cross-run state complexity. Starts at 0.

**Alternative considered:** Global pity across runs — rejected because each run should feel independent.

### Additive weight boost
The pity value is added directly to equipment entry weights in the bonus drop roll. At pity=0, weights are unchanged. At pity=3, an equipment entry with base weight 1 becomes weight 4.

**Alternative considered:** Multiplicative scaling — rejected because it doesn't help enemies with weight 0 (no equipment entry).

### Inject generic equipment entry at pity >= 2
For enemies with no equipment in their drop pool, a generic entry (weight 0 + pity boost) is injected when pity reaches 2. This draws from the full equipment pool. This prevents dead-zone enemies from blocking progression entirely.

**Alternative considered:** Only boost existing entries — rejected because it would mean pity has zero effect against ~40% of enemies.

### Reset to 0 on any equipment drop
Binary reset rather than partial reduction. Simple, predictable, and matches the "drought-breaker" intent.

## Risks / Trade-offs

- [Over-gearing] Players might get equipment too fast in lucky runs → Low risk: base weights are unchanged, pity only helps unlucky runs
- [Duplicate slots] Pity doesn't know which slots are filled, so players might get equipment for an already-filled slot → Acceptable: the equip-compare overlay handles this, and player can choose to keep or swap
- [Generic pool quality] Injected equipment from the generic pool might not match the enemy's thematic drops → Minor: players won't notice since they don't see the drop pool
