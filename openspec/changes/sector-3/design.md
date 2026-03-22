## Context

S1 and S2 use the same enemy system: `EnemyDefinition` with intent patterns, `EnemyInstance` with HP/block/status tracking, predefined encounter compositions. S3 reuses this system entirely — no new engine mechanics needed. The novel S3 behaviors (mirroring, adapting, draining) are implemented through creative use of existing intent types plus a small number of new ones.

The boss is the exception: The Reflection needs to read the player's equipment to set its stats, which is a new pattern.

## Goals / Non-Goals

**Goals:**
- S3 enemies feel fundamentally different from S1/S2 through behavior, not through new systems
- Every S3 encounter tests a specific aspect of the player's build
- No safe turns — every enemy creates pressure or punishes stalling
- The Reflection boss creates a climactic "fight yourself" moment
- S3 events are identity-defining choices, not resource transactions

**Non-Goals:**
- New card pool for S3 (explicitly excluded — "you are enough")
- New equipment or parts for S3
- New combat mechanics or card types
- Narrative text polish (mechanics first, flavor last per design principle)

## Decisions

### 1. New intent types for S3 behaviors

Most S3 enemy mechanics can be expressed through existing intent types (Attack, Block, Buff, Debuff, DisableSlot, Scan). Three new ones are needed:

- **Drain**: Steals the player's block (player block → 0, enemy gains that value as attack damage this turn). Implemented as a new IntentType.
- **Exhaust**: Forces the player to exhaust a random card from their draw pile. Implemented as a new IntentType.
- **Adapt**: Enemy gains block equal to damage received last turn. Implemented as a buff applied during enemy turn resolution, tracked via a flag on EnemyInstance or as a special intent.

Mirror behavior (Echo Shell) and phase immunity (Phase Shade) can be handled through intent patterns with conditional logic rather than new intent types — using the existing pattern system with multi-phase intents.

**Alternative considered**: Implementing all S3 behaviors as new IntentTypes. Rejected because it would bloat the intent system. Most S3 behaviors are compositions of existing mechanics.

### 2. The Reflection boss reads player equipment

The boss definition can't be static — its stats depend on the player's loadout. Two approaches:

**Chosen: Runtime stat injection.** The Reflection's `EnemyDefinition` has placeholder values. When the encounter is created, `makeEnemyInstance` (or a wrapper) reads the player's equipment and adjusts the instance's HP, and the intent pattern values are computed from equipment stats.

This requires a small addition to the encounter setup flow: a function that takes the player's equipment and returns a customized Reflection definition. The boss's intent pattern adapts using a state machine rather than a fixed pattern array.

### 3. Bonded Pair mechanic

Two enemies that share damage (hitting one heals the other 50%). This is NOT a new intent type — it's a combat-level modifier. When resolving damage against a bonded enemy, 50% of actual damage dealt is healed on the partner.

Implemented by adding an optional `bondedWith?: string` field to `EnemyInstance` and checking it during damage resolution in `executeBodyActions`.

### 4. S3 map generation

`generateGridMaze` already accepts a sector parameter. S3 uses the same 7×7 grid, same room distribution (8-10 combats, rest, shop, events, boss). No structural changes needed — just ensure sector 3 is a valid input.

### 5. Sector transition and combatsCleared reset

Same pattern as S1→S2: after defeating S2 boss, `advanceSector` sets sector to 3, generates new maze, resets `combatsCleared` to 0. S3 enemies use the same HP scaling formula (+10% per combat cleared).

### 6. S3 reward handling — no new pools

Combat rewards in S3 pull from S2 card/equipment/part pools. The player can still find S2 cards and equipment, but no S3-exclusive content exists. This is a deliberate design choice: S3 rewards help you refine your build, not expand it.

## Risks / Trade-offs

**[Reflection boss complexity]** → A boss that reads player state is a new pattern. Risk of edge cases (empty equipment slots, extreme builds).
Mitigation: Use sensible defaults (minimum HP floor, minimum attack value) so the boss is always viable.

**[S3 might be too hard]** → Every encounter is designed to counter strategies. Players may feel punished.
Mitigation: The combat simulator can validate win rates. Target: 50-70% win rate per encounter with a strong S2 loadout.

**[No new cards may feel unrewarding]** → Players expect new content each sector.
Mitigation: S3 events offer unique rewards (equipment fusion, radical thinning) that don't exist in S1/S2. The novelty comes from enemy mechanics, not player mechanics.
