## Why

S2 enemies have the same problem S1 had before rework: too many non-threatening opening turns. Slag Heap gives 3 free turns (Block, Block, Buff). Most elites give 2 free turns. The Thermal Arbiter boss opens with Absorb + DisableSlot — neither deals damage. Players stack permanent Str/Dex buffs (Power Surge, Overclock, Controlled Burn) on these free turns and then steamroll. A playtester beat the S2 boss taking zero damage.

Additionally, Absorb intents reference Heat — a system that no longer exists. These need functional replacements.

## What Changes

### Attack-First Patterns
Rework all S2 standard, elite, and boss patterns so turn 1 is threatening. Same treatment as S1 rework: enemies should attack or attack+debuff on their first action. Non-attack actions (Block, Buff, Absorb, DisableSlot) get moved later in the cycle.

### Replace Absorb Intents
Absorb read Still's Heat to gain Block. Heat is gone. Replace Absorb with mechanically interesting alternatives:
- Self-buff patterns (Strength/Block combos)
- AttackDebuff combos that punish passivity
- Block + scaling patterns that create urgency

### Boss Pattern Rework
The Thermal Arbiter's 8-step pattern needs a complete redo. The boss should pressure from turn 1, have a clear escalation arc, and test the player's full kit — not gift two free setup turns.

### Elite Pattern Rework
All 3 elites (Overcharge Sentinel, Lockdown Warden, Meltdown Core) open with non-attack turns. Rework so they're immediately dangerous while keeping their mechanical identities (slot disruption, debuffs, scaling).

## Capabilities

### Modified Capabilities
- `sector2-enemies`: Reworked intent patterns for all S2 standards, elites, and boss. Absorb intents replaced. Attack-first ordering.
- `enemy-system`: Remove or replace Absorb intent type references if Heat-dependent logic remains in resolution code.

## Impact

- **Modify**: `src/data/enemies.ts` — all S2 enemy intent patterns
- **Possibly modify**: Enemy intent resolution code if Absorb has Heat-dependent logic
- **No structural changes**: All intent types except Absorb already work, encounter compositions unchanged
