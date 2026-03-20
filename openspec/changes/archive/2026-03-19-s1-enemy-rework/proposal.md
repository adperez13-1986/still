## Why

S1 enemies all live on the same axis: deal damage, maybe block, maybe debuff. The player's answer is always identical: ARMS first (damage), TORSO if attacked (block), HEAD/LEGS if spare energy (draw). No enemy forces a different priority order or engages Still's unique 4-slot body system.

The slot system is Still's differentiator, but S1 never teaches players that slots are a spatial puzzle. DisableSlot — the one mechanic that directly disrupts slot autopilot — only appears in S2. Multi-enemy encounters are just two independent damage races with no compositional synergy.

## What Changes

### New Enemy: Signal Jammer
A slot-disruption enemy that disables ARMS on its first turn, forcing one turn with zero damage output. Low HP (30) so it's not a wall — it's a teaching enemy. Players learn: "sometimes you can't kill, block and draw instead."

### Reworked Encounter Compositions
Replace some "two independent enemies" encounters with compositions where timing creates real dilemmas:
- Debuffer + multi-hitter (Vulnerable lands when multi-hits arrive)
- Signal Jammer + scaler (ARMS disabled while scaling enemy ramps up)
- Existing enemies paired to create target priority decisions

### Passive Enemy Cleanup
Rework 2-3 existing S1 enemies that have too many non-attack turns. Enemies like Sentinel Shard (Block, Attack, Attack) and Glitch Node (Buff, Attack, Attack) start with a "free" non-threatening turn. Make turn 1 feel dangerous.

## Capabilities

### Modified Capabilities
- `enemy-system`: New S1 enemy with DisableSlot, reworked encounter compositions, adjusted patterns for passive enemies

## Impact

- **Modify**: `src/data/enemies.ts` — new Signal Jammer definition, new encounter compositions, adjusted patterns
- **No system changes**: DisableSlot already exists, encounter system already supports multi-enemy
