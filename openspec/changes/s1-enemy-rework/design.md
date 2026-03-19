## Context

S1 has 11 standard enemies, 3 elites, 1 boss, and 15 encounter compositions. Every standard enemy is a damage-race variant. DisableSlot exists in the engine but is S2-only. Multi-enemy encounters pair independent enemies with no compositional synergy.

Still's combat uses a 4-slot body system (HEAD/TORSO/ARMS/LEGS) with 8 energy per turn and 2E card baseline. The energy rework means filling all 4 slots costs the full budget — but since enemies only threaten damage/HP, the priority order (ARMS→TORSO→HEAD→LEGS) never changes.

## Goals / Non-Goals

**Goals:**
- Introduce DisableSlot to S1 via one new enemy (Signal Jammer)
- Create encounter compositions where enemy pattern timing creates dilemmas
- Reduce passive first turns on existing enemies that feel non-threatening

**Non-Goals:**
- New intent types or enemy-to-enemy interaction mechanics (future work)
- Rebalancing S2 enemies or elites/bosses
- Changing the encounter selection system

## Decisions

### Decision 1: Signal Jammer — DisableSlot Arms, then attack

Pattern: DisableSlot Arms → Attack 8 → Attack 10. HP: 30.

The ARMS disable on turn 1 means zero damage from equipment or ARMS-homed system cards for one turn. Player must block, draw, and prepare. Low HP ensures the fight is short once ARMS comes back online.

**Alternative considered:** Disable TORSO instead — rejected because ARMS-disable is the stronger teaching moment. It breaks the "ARMS first" autopilot directly. TORSO-disable could be a second S1 disruptor later.

### Decision 2: Synergy encounters use existing enemies + Signal Jammer

New encounter compositions pair enemies whose independent patterns create timing pressure:
- **Signal Jammer + Glitch Node**: ARMS disabled while Node scales Strength. Urgency to kill Node but no ARMS turn 1.
- **Iron Crawler + Fracture Mite × 2**: Vulnerable lands when multi-hits arrive. Target priority dilemma.
- **Signal Jammer + Fracture Mite**: ARMS disabled, mites chip away. Light intro to slot disruption.
- **Corroded Sentry + Glitch Node**: Weak debuff reduces your damage against the scaling Node. Kill sentry to preserve damage, or rush the Node?

### Decision 3: Rework passive enemy openers

Enemies with non-threatening turn 1 get adjusted:
- **Sentinel Shard**: Block 8, Attack 10, Attack 14 → Attack 8, Block 8, Attack 14. Attacks immediately.
- **Glitch Node**: Buff Str, Attack 8, Attack 10 → Attack 6, Buff Str, Attack 10. Attacks immediately, then scales.
- **Hollow Repeater**: Buff Str, Attack 3×3, Attack 5 → Attack 3×2, Buff Str, Attack 3×3. Attacks immediately, then scales into multi-hit.

This ensures every encounter feels threatening from turn 1.

## Risks / Trade-offs

**[S1 difficulty increase]** → Signal Jammer + reworked patterns make S1 harder. Mitigation: Signal Jammer has low HP (30), single encounters with it are short. Reworked patterns change timing, not total damage per cycle.

**[Signal Jammer feels unfair to new players]** → Losing ARMS for a turn with no counterplay might frustrate. Mitigation: it's one turn, the enemy has 30 HP, and the player still has 3 other slots to use. The lesson is valuable.
