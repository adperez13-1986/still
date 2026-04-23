## 1. Data Layer — Action & Slot Types

- [x] 1.1 Define ActionDefinition type: id, name, type, baseValue, pushedValue, description, special fields (hits, perHit, persistent, reflectPct, etc.)
- [x] 1.2 Define SlotLayout type: 5 slots as 2 pairs + 1 solo, each holding an ActionDefinition id or null
- [x] 1.3 Define SynergyEffect type: pair type combo → effect id, description, resolution function
- [x] 1.4 Create src/data/actions.ts with all 17 actions (4 starting + 13 findable)
- [x] 1.5 Create synergy combination table: type × type → synergy effect (18 defined, rest = no synergy)
- [x] 1.6 Update RunState: replace growth/strainCombat fields with slotLayout and acquiredActions

## 2. Combat Engine — Unified Slots

- [x] 2.1 New initStrainCombat: reads slotLayout instead of growth state, computes push costs and synergy availability per pair
- [x] 2.2 New StrainCombatState: 5 push toggles, 2 pair synergy flags, per-slot action references
- [x] 2.3 Push cost calculation: 1 per pushed slot + 1 link tax per pair where both pushed AND synergy exists
- [x] 2.4 Execution order: fire slots 1-5 in order, resolve Pair A synergy after slots 1+2, resolve Pair B synergy after slots 3+4
- [x] 2.5 Port Vent special behavior: skips damage actions, recovers strain, Second Wind if paired
- [x] 2.6 Remove old 3-slot system, growth tree, mastery/ability split

## 3. Synergy Resolution

- [x] 3.1 Counter (damage_single + block): if block absorbs full attack, damage action fires again at base
- [x] 3.2 Drain (damage_single + heal): damage heals 30%
- [x] 3.3 Cleave (damage_single + damage_all): single target + 50% to others
- [x] 3.4 Focus (damage_single + damage_single): combine into one hit
- [x] 3.5 Thorns (damage_single + reduce): reduction deals 2 back per hit
- [x] 3.6 Empower (damage_single + buff): buff doubles on damage action
- [x] 3.7 Exploit (damage_single + debuff): +50% to debuffed enemies
- [x] 3.8 Fortify (block + heal): excess block → healing
- [x] 3.9 Bastion (block + reduce): both stack
- [x] 3.10 Bolster (block + buff): block doubled this turn
- [x] 3.11 Recycle (block + convert): remaining block → strain reduction
- [x] 3.12 Suppress (damage_all + debuff): AoE applies debuff
- [x] 3.13 Barrage (damage_all + damage_all): hits doubled
- [x] 3.14 Regenerate (heal + buff): heal over 2 turns
- [x] 3.15 Transfuse (heal + convert): heal also reduces strain by 2
- [x] 3.16 Second Wind (recovery + any): linked action +3 base next turn
- [x] 3.17 Mirror Strike (reflect + damage_single): reflected damage +50%
- [x] 3.18 Focused Aggro (utility + damage_single): counter on every hit received

## 4. Combat UI

- [x] 4.1 Replace 3-slot display with 5-slot paired layout: [1]──[2]  [3]──[4]  [5]
- [x] 4.2 Push toggles per slot with synergy indicator between pairs
- [x] 4.3 Strain projection includes link tax (show breakdown: pushes + links)
- [x] 4.4 Synergy name displayed between paired slots when both pushed
- [x] 4.5 Combat log shows synergy activation events

## 5. Reward Screen & Slot Placement

- [x] 5.1 Growth rewards offer up to 3 findable actions from pool
- [x] 5.2 After accepting growth action, show slot placement screen
- [x] 5.3 Slot placement: choose which slot to place new action in (replacing existing)
- [x] 5.4 Show synergy preview for each possible position
- [x] 5.5 Comfort rewards unchanged

## 6. Slot Rearrangement (Map Screen)

- [x] 6.1 Add rearrangement UI accessible from map screen
- [x] 6.2 Tap-to-swap actions between slot positions
- [x] 6.3 Show synergy preview as player rearranges
- [x] 6.4 No cost to rearrange

## 7. Run State & Persistence

- [x] 7.1 Save/restore slot layout and acquired actions
- [x] 7.2 New run initializes with starting loadout
- [x] 7.3 Update RunScreen startRun calls

## 8. Playtest (observed during extended session)

- [x] 8.1 Link tax makes pair pushing a real decision — **PARTIAL**: Upfront +1 strain for pushing both felt punishing when the synergy was conditional (e.g. Counter only fires on full-block). Moved to "charge on activation" during playtest. Link tax is now only a real decision for unconditional synergies. Reworked mid-session (commit 1668b62).
- [x] 8.2 Synergies feel distinct and meaningful — **PARTIAL**: 8 of 18 synergies were implemented as no-op flags that never read (Counter, Fortify, Recycle, Thorns, Focused Aggro, Empower, Exploit, Suppress). Fixed during playtest (commit ddf710e). Even after fixing: because synergies are type-based, swapping Strike for Focus Fire doesn't change the synergy, only the values. Individual actions within a type feel interchangeable. This is the core limitation surfacing repeatedly.
- [x] 8.3 Slot rearrangement creates build experimentation — **WEAK**: 5 slots × ~4 meaningful type mixes = small build space. Rearranging within types changes numbers, not play pattern. Players converge on a stable loadout and rarely deviate.
- [x] 8.4 Action replacement feels like a real trade-off (moth and flame) — **NO**: Because types determine synergies, replacing a damage_single with another damage_single is a stat swap, not a build change. The "moth and flame" emotional weight doesn't land — you just take the strict upgrade or keep what you have.
- [x] 8.5 No dominant strategy emerges from one pair combo — **WEAK**: Profile sim (seed 42) shows Balanced 33% / Defensive 20% / Aggressive 1%. "Balanced" wins by covering both offense and defense — single-focus builds underperform. Not a dominant COMBO, but a dominant PLAYSTYLE (flexibility).
- [x] 8.6 Reactive enemies still create dilemmas with new system — **YES**: Retaliators, StrainScale, Charge, etc. all translate well. This part works.

### Summary of playtest findings

**What worked:**
- Strain as a self-inflicted pressure meter with 20-cap forfeit — emotional core is intact
- Vent as a real sacrifice (skip damage to recover strain)
- Reactive enemies create per-enemy dilemmas
- Separation of HP (tactical) vs strain (strategic) layer

**What didn't work:**
- Type-based synergies make individual actions within a type interchangeable
- 5 slots is too tight — owning more actions than slots is wasted
- "Push or don't push" is a flat decision space per turn
- Build identity doesn't emerge because rearrangement within types changes nothing
- Momentum/building-up feeling is absent — every turn feels like the last

**Superseded by:** These findings drive a reframe toward dynamic loadouts (action swap per turn from an unbounded owned pool). Next change will explore that direction.
