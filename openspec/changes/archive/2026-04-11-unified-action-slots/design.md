## Context

The strain combat system has the right emotional core (push = permanent cost, growth vs comfort) but shallow turn-by-turn decisions. 3 fixed slots with binary push + 2 abilities = ~5 obvious decisions per turn. Growth rewards modify values but don't change the action structure.

This change unifies all actions into a single slot system with linked pairs, creating emergent depth from arrangement.

## Goals / Non-Goals

**Goals:**
- Replace fixed slots + abilities with unified action slots
- Linked pairs create emergent synergies when both are pushed
- Link tax (pushing both = 3 strain instead of 2) creates real per-turn decisions
- Growth rewards are new actions found during the run
- Comfort rewards unchanged (heal, strain relief, companion moments)
- Rearranging slots between fights = free build experimentation
- Same emotional core: strain accumulates, push is costly, growth vs comfort

**Non-Goals:**
- Designing every possible findable action (start with ~12, expand later)
- Balancing all synergy combinations perfectly (playtest-driven)
- Changing the enemy system (reactive enemies work as-is)
- Changing the map/sector structure
- Visual polish on slot arrangement UI

## Decisions

### 1. Slot layout: 2 linked pairs + 1 solo = 5 slots

```
  [Slot 1]──[Slot 2]    [Slot 3]──[Slot 4]    [Slot 5]
     Pair A                 Pair B              Solo
```

5 slots total. 2 pairs that can synergize, 1 solo that's always independent. This gives the player:
- 2 synergy combos per build (pair A link + pair B link)
- 1 reliable action that doesn't depend on pairing
- Enough slots for variety without overwhelming decision space

### 2. Starting loadout

```
  [Strike]──[Shield]    [Barrage]──[Vent]    [ empty ]
   Pair A: Counter       Pair B: Recovery     Solo: unlocked later
```

Player starts with 4 actions in 2 pairs. The 5th slot is empty — first growth reward fills it. Starting links:
- Strike + Shield = Counter (blocking a full attack triggers a Strike back)
- Barrage + Vent = Recovery (venting after AoE clears the field — thematic, not mechanical initially)

### 3. Push and link cost model

| Action | Strain cost |
|--------|------------|
| Push one slot in a pair | 1 (link dormant) |
| Push both slots in a pair | 3 (1+1+1 link tax) |
| Push solo slot | 1 |
| Unpushed slot | 0 (fires at base value) |

Link tax is always +1 on top of the individual push costs. This means:
- 2 solo pushes = 2 strain (no synergy)
- 1 linked pair push = 3 strain (synergy active)
- 2 linked pairs pushed = 6 strain (both synergies)
- Everything pushed = 8 strain (2 pairs × 3 + solo × 1 + overextend penalty)

At 8 strain per turn for full push, the player MUST vent or take comfort. Strain budget creates real tension.

### 4. Action definitions

**Starting actions (always available):**

| Action | Type | Base | Pushed | Description |
|--------|------|------|--------|-------------|
| Strike | damage_single | 6 | 9 | Hit selected enemy |
| Shield | block | 5 | 7 | Gain block |
| Barrage | damage_all | 4 | 6 | Hit all enemies |
| Vent | recovery | 0 | 0 | Skip attacks, recover 4 strain. Special: can't be pushed, doesn't cost strain |

**Findable actions (growth rewards, ~12 to start):**

| Action | Type | Base | Pushed | Description | Strain cost to take |
|--------|------|------|--------|-------------|-------------------|
| Phase Blade | damage_single | 3×2 | 5×2 | Multi-hit single target | 3 |
| Focus Fire | damage_single | 10 | 14 | Heavy single target | 3 |
| Repair | heal | 4 | 6 | Heal HP | 3 |
| Brace | reduce | 3/hit | 5/hit | Reduce incoming damage per hit | 3 |
| Redirect | reflect | 0 | 0 | Reflect 40% of damage taken back to attacker | 4 |
| Pulse | damage_all | 2×3 | 3×3 | Multi-hit AoE (3 random targets) | 4 |
| Siphon | drain | 0 | 0 | Next damage action in this pair heals for 30% | 4 |
| Patience | buff | 0 | 0 | Next turn, linked action's base value +4 | 4 |
| Taunt | utility | 0 | 0 | Force all enemies to target you (block matters more) | 3 |
| Weaken | debuff | 0 | 0 | Reduce enemy damage by 3 for 2 turns | 3 |
| Overclock | buff | 0 | 0 | This turn, linked action fires twice | 5 |
| Absorb | convert | 0 | 0 | Convert up to 5 block into strain reduction | 4 |

Vent is special: it always occupies a slot but can't be pushed. It's the "rest" action. Pairing it with something changes the LINKED action's behavior, not Vent's.

### 5. Synergy combination table

When both actions in a pair are pushed (link tax paid), a synergy effect activates. The synergy is determined by the TYPE combination of the two actions:

| Type A | Type B | Synergy | Example |
|--------|--------|---------|---------|
| damage_single | block | **Counter** — blocking full attack triggers A's damage | Strike + Shield |
| damage_single | heal | **Drain** — A's damage heals you for 30% | Strike + Repair |
| damage_single | damage_all | **Cleave** — A's target takes full, others take 50% | Strike + Barrage |
| damage_single | damage_single | **Focus** — combine both into one hit (sum values) | Strike + Focus Fire |
| damage_single | reduce | **Thorns** — damage reduction also deals 2 back per hit | Phase Blade + Brace |
| damage_single | buff | **Empower** — buff applies to A (double value) | Strike + Patience |
| damage_single | debuff | **Exploit** — A deals +50% to debuffed enemies | Focus Fire + Weaken |
| block | heal | **Fortify** — excess block converts to healing | Shield + Repair |
| block | reduce | **Bastion** — block + damage reduction stack (both apply) | Shield + Brace |
| block | buff | **Bolster** — block value doubled this turn | Shield + Patience |
| block | convert | **Recycle** — block converts to strain reduction efficiently | Shield + Absorb |
| damage_all | damage_all | **Barrage** — hits doubled | Barrage + Pulse |
| damage_all | debuff | **Suppress** — AoE also applies debuff to all | Barrage + Weaken |
| heal | buff | **Regenerate** — heal applies over 2 turns | Repair + Patience |
| heal | convert | **Transfuse** — heal also reduces strain by 2 | Repair + Absorb |
| recovery | any | **Second Wind** — after vent, linked action gets +3 base next turn | Vent + anything |
| reflect | damage_single | **Mirror Strike** — reflect damage is amplified by A's value | Redirect + Strike |
| debuff | debuff | **Cripple** — debuff duration doubled | Weaken + Weaken (if 2 copies) |
| utility | damage_single | **Focused Aggro** — taunt + counter on every hit taken | Taunt + Strike |
| buff | buff | **Overclock** — both buffs apply, bonus +2 to all actions | Overclock + Patience |

Not all combinations need a unique synergy. Some pairs just fire independently with no special link effect — that's fine. The interesting pairs are the ones the player discovers and builds around.

### 6. Slot arrangement happens between fights

After combat (on the map), the player can rearrange their actions:
- Drag actions between slot positions
- See synergy preview for each pair configuration
- No strain cost to rearrange — it's free experimentation
- This is where build theorycrafting happens

Finding a new action mid-run forces a decision: which slot does it replace? And does that rearrangement break a synergy I depend on?

### 7. Growth reward: finding new actions

After combat victory, growth option offers a new action (instead of the old tree rewards):
- See the action's type, values, and description
- Costs strain to take (3-5 depending on power)
- Must choose which existing action to replace (or fill empty slot)
- The replaced action is GONE — can't get it back

This is the moth and the flame: the new action looks powerful but you're giving up something you know works.

### 8. Comfort rewards unchanged

- Heal: restore 8 HP (free)
- Relief: reduce strain by 4 (free)
- Companion moment: reduce strain by 2 + narrative text (free)
- Contextual selection based on HP/strain as before

### 9. How this replaces the current system

| Current | Becomes |
|---------|---------|
| 3 fixed slots (Strike, Shield, Barrage) | 5 action slots (2 pairs + 1 solo) |
| Abilities (Repair, Brace, Vent) | Actions occupying slots, same as damage/block |
| Push toggle per slot | Push toggle per slot + link tax for pairs |
| 29-reward growth tree | ~12 findable actions + arrangement decisions |
| Masteries (push cost reduction) | Gone — push always costs 1 per slot |
| Overextension penalty | Replaced by link tax (natural cost scaling) |
| Identity rewards (Desperate Repair, etc.) | Emerge from synergy combinations |

## Risks / Trade-offs

**[Synergy table is large and hard to balance]** → Start with type-based synergies (damage+block = Counter). Don't need unique effects for every combination. Unknown pairs just fire independently.

**[Replacing an action is permanent and scary]** → That's intentional (moth and flame). But if it feels too punishing, allow 1 "undo" per run.

**[Vent is special and doesn't fit the push model]** → Vent keeps its current behavior: skip attacks, recover strain. It's the "rest" slot. Pairing it grants Second Wind to the linked action. Vent cannot be pushed (it's inherently unpushed — venting IS choosing not to push).

**[5 slots × push decisions × 2 link activations may be overwhelming]** → 5 toggles + 2 link decisions = 7 decisions. More than current 5, but still manageable. The link tax naturally limits how many you activate (can't afford both pairs every turn).

**[This is the third architecture change]** → Yes. But this time the emotional core (strain, push cost, growth vs comfort) is proven and stays. We're changing the action layer, not the foundation.

## Open Questions

- **Exactly which starting pair synergies feel right?** Strike+Shield=Counter is intuitive. Barrage+Vent is less clear — what does that link do?
- **Should the player see the synergy table, or discover through play?** Showing previews during arrangement reduces frustration. Pure discovery is more exciting but risks confusion.
- **How many findable actions for first pass?** Proposed 12. May need more for 3-sector depth.
- **Can Vent be in a pair, or must it always be solo?** Currently proposed as pairable with Second Wind synergy. Solo Vent is simpler but loses a synergy slot.
