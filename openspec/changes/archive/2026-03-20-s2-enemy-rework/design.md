## Context

S2 enemies were designed when Heat was still a system. Although Absorb was mechanically updated to read energy-spent instead of Heat (`energySpent * (value / 100)`), the patterns were never retuned. With 8 max energy, the highest Absorb (value: 80) yields at most 6 block — trivial for an elite/boss.

More critically, the intent *ordering* gives players 2-3 free setup turns. S1 just got the attack-first treatment and plays much better. S2 needs the same pass.

## Goals / Non-Goals

**Goals:**
- Every S2 enemy attacks or attack-debuffs on turn 1
- Absorb either becomes meaningful or gets replaced
- Boss fight has a clear pressure arc with no free turns
- Preserve each enemy's mechanical identity (slot disabler, debuffer, tank, etc.)

**Non-Goals:**
- Changing encounter compositions (that's working fine)
- Adding new enemies (no new definitions, just rework existing patterns)
- Stat scaling / permanent buff problem (separate exploration)
- Changing HP values (tuned separately)

## Decisions

### Decision 1: Replace Absorb with Block+Buff combo
Absorb's energy-reading mechanic caps at ~6 block, which is meaningless for a 120 HP elite. Rather than inflating values (which makes it feel random/invisible), replace Absorb intents with straightforward Block or Block+Buff patterns that create visible, predictable tension.

**Alternative considered**: Retune Absorb values. Rejected because the energy-spent scaling is too narrow (0-8 range). Even at 100%, max 8 block. The mechanic doesn't have room to be interesting.

**Alternative considered**: Make Absorb read something else (e.g., cards played). Rejected because it adds a new invisible coupling and the fix is more invasive than the value.

### Decision 2: Attack-first, utility-second pattern ordering
Every enemy's intentPattern[0] should be Attack or AttackDebuff. Utility actions (Block, Buff, Debuff, DisableSlot) go to positions 1+ in the cycle. This matches S1 rework and creates immediate pressure.

### Decision 3: Boss escalation arc
Thermal Arbiter's 8-step pattern should follow: pressure → disrupt → escalate → peak. Turn 1 attacks. DisableSlot appears mid-cycle to disrupt established rhythm. Buff and heavy attacks come late, creating a race against scaling.

## Risks / Trade-offs

- **Absorb removal makes energy-spending meaningless for enemies** → Acceptable; energy tension comes from player-side budget, not enemy-side reading. If we want enemies to care about energy later, that's a new mechanic.
- **Attack-first may make S2 feel samey vs S1** → Mitigate by keeping S2's unique intent types (DisableSlot, Debuff combos). S2 attacks should also be harder-hitting than S1.
- **Pattern changes may break encounter composition balance** → Compositions themselves unchanged; just need to verify that reworked patterns still create the intended multi-enemy dynamics.
