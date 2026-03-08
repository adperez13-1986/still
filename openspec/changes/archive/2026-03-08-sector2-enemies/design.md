## Overview

Add a complete S2 enemy roster to `src/data/enemies.ts`. Enemies use DisableSlot, Absorb, and longer/harder patterns. Define encounter compositions so S2 combat rooms pick from themed enemy groups rather than random singles.

## Enemy Roster

### Standard Enemies (~8)

| Name | HP | Role | Key Mechanic |
|------|----|------|-------------|
| Thermal Leech | 55 | Heat punisher | Absorb(50%) into double attack |
| Wire Jammer | 45 | Arms disruptor | DisableSlot(Arms) then attack |
| Slag Heap | 75 | Scaling tank | Block+Block+Buff(Str)+Attack |
| Feedback Loop | 38 | Glass cannon | Debuff(Vuln) then big attacks |
| Phase Drone | 50 | Head disruptor | DisableSlot(Head) then attack |
| Furnace Tick | 22 | Swarm + heat | Absorb(30%) then light attacks, appears in groups |
| Static Frame | 65 | Generalist | Attack/Block/AttackDebuff — S2's baseline |
| Conduit Spider | 48 | Legs disruptor | DisableSlot(Legs) then Debuff(Vuln) |

### Elites (3)

| Name | HP | Key Pattern |
|------|----|-------------|
| Overcharge Sentinel | 110 | Absorb(60%)+Block into heavy attacks |
| Lockdown Warden | 100 | DisableSlot(Arms)+DisableSlot(Head) then attacks+Buff |
| Meltdown Core | 120 | Debuff(Vuln)+Absorb(80%)+big attack cycle |

### Boss

| Name | HP | Pattern Length |
|------|----|---------------|
| The Thermal Arbiter | 200 | 8-step: Absorb, DisableSlot(Legs), attacks, Buff(Str), AttackDebuff, Absorb, big attack |

## Encounter Compositions

S2 combat rooms don't pick random single enemies. They pick from predefined encounter groups:

```
STANDARD ENCOUNTERS (combat rooms):
- Wire Jammer + Feedback Loop
- Furnace Tick x3
- Thermal Leech + Static Frame
- Phase Drone + Conduit Spider
- Slag Heap + Furnace Tick x2
- Static Frame x2
- Thermal Leech + Feedback Loop
- Wire Jammer + Phase Drone

ELITE ENCOUNTERS (elite rooms, if added, or hard combat rooms):
- Overcharge Sentinel (solo)
- Lockdown Warden (solo)
- Meltdown Core (solo)
```

## Encounter Selection

Currently, `RunScreen` picks enemies for combat rooms. This needs to be sector-aware:
- S1: existing random selection from `SECTOR1_ENEMIES` (1-2 enemies)
- S2: pick from predefined encounter compositions
- Encounters are shuffled at maze generation time and assigned to combat rooms

## Data Structure

Encounter compositions live in `src/data/enemies.ts` as arrays:

```typescript
export interface Encounter {
  enemies: string[] // enemy definition IDs
}

export const SECTOR2_ENCOUNTERS: Encounter[] = [...]
export const SECTOR2_ELITE_ENCOUNTERS: Encounter[] = [...]
```

## Drop Pools

S2 enemies drop:
- More shards than S1 (15-40 range for standard, 40-60 for elites)
- Cards/parts/equipment from S2 pools (defined in the sector2-player-content change)
- Boss drops guaranteed rare reward

Until S2 player content exists, drop pools can reference S1 items as placeholders.

## Sprites

Each new enemy needs a pixel sprite in `src/data/sprites.ts`. These follow the existing pattern: small grid art with a palette array.
