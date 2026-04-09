## 1. Data Layer — Action & Slot Types

- [x] 1.1 Define ActionDefinition type: id, name, type, baseValue, pushedValue, description, special fields (hits, perHit, persistent, reflectPct, etc.)
- [x] 1.2 Define SlotLayout type: 5 slots as 2 pairs + 1 solo, each holding an ActionDefinition id or null
- [x] 1.3 Define SynergyEffect type: pair type combo → effect id, description, resolution function
- [x] 1.4 Create src/data/actions.ts with all 17 actions (4 starting + 13 findable)
- [x] 1.5 Create synergy combination table: type × type → synergy effect (18 defined, rest = no synergy)
- [x] 1.6 Update RunState: replace growth/strainCombat fields with slotLayout and acquiredActions

## 2. Combat Engine — Unified Slots

- [ ] 2.1 New initStrainCombat: reads slotLayout instead of growth state, computes push costs and synergy availability per pair
- [ ] 2.2 New StrainCombatState: 5 push toggles, 2 pair synergy flags, per-slot action references
- [ ] 2.3 Push cost calculation: 1 per pushed slot + 1 link tax per pair where both pushed AND synergy exists
- [ ] 2.4 Execution order: fire slots 1-5 in order, resolve Pair A synergy after slots 1+2, resolve Pair B synergy after slots 3+4
- [ ] 2.5 Port Vent special behavior: skips damage actions, recovers strain, Second Wind if paired
- [ ] 2.6 Remove old 3-slot system, growth tree, mastery/ability split

## 3. Synergy Resolution

- [ ] 3.1 Counter (damage_single + block): if block absorbs full attack, damage action fires again at base
- [ ] 3.2 Drain (damage_single + heal): damage heals 30%
- [ ] 3.3 Cleave (damage_single + damage_all): single target + 50% to others
- [ ] 3.4 Focus (damage_single + damage_single): combine into one hit
- [ ] 3.5 Thorns (damage_single + reduce): reduction deals 2 back per hit
- [ ] 3.6 Empower (damage_single + buff): buff doubles on damage action
- [ ] 3.7 Exploit (damage_single + debuff): +50% to debuffed enemies
- [ ] 3.8 Fortify (block + heal): excess block → healing
- [ ] 3.9 Bastion (block + reduce): both stack
- [ ] 3.10 Bolster (block + buff): block doubled this turn
- [ ] 3.11 Recycle (block + convert): remaining block → strain reduction
- [ ] 3.12 Suppress (damage_all + debuff): AoE applies debuff
- [ ] 3.13 Barrage (damage_all + damage_all): hits doubled
- [ ] 3.14 Regenerate (heal + buff): heal over 2 turns
- [ ] 3.15 Transfuse (heal + convert): heal also reduces strain by 2
- [ ] 3.16 Second Wind (recovery + any): linked action +3 base next turn
- [ ] 3.17 Mirror Strike (reflect + damage_single): reflected damage +50%
- [ ] 3.18 Focused Aggro (utility + damage_single): counter on every hit received

## 4. Combat UI

- [ ] 4.1 Replace 3-slot display with 5-slot paired layout: [1]──[2]  [3]──[4]  [5]
- [ ] 4.2 Push toggles per slot with synergy indicator between pairs
- [ ] 4.3 Strain projection includes link tax (show breakdown: pushes + links)
- [ ] 4.4 Synergy name displayed between paired slots when both pushed
- [ ] 4.5 Combat log shows synergy activation events

## 5. Reward Screen & Slot Placement

- [ ] 5.1 Growth rewards offer up to 3 findable actions from pool
- [ ] 5.2 After accepting growth action, show slot placement screen
- [ ] 5.3 Slot placement: choose which slot to place new action in (replacing existing)
- [ ] 5.4 Show synergy preview for each possible position
- [ ] 5.5 Comfort rewards unchanged

## 6. Slot Rearrangement (Map Screen)

- [ ] 6.1 Add rearrangement UI accessible from map screen
- [ ] 6.2 Drag actions between slot positions
- [ ] 6.3 Show synergy preview as player drags
- [ ] 6.4 No cost to rearrange

## 7. Run State & Persistence

- [ ] 7.1 Save/restore slot layout and acquired actions
- [ ] 7.2 New run initializes with starting loadout
- [ ] 7.3 Update RunScreen startRun calls

## 8. Playtest

- [ ] 8.1 Verify link tax makes pair pushing a real decision
- [ ] 8.2 Verify synergies feel distinct and meaningful
- [ ] 8.3 Verify slot rearrangement creates build experimentation
- [ ] 8.4 Verify action replacement feels like a real trade-off (moth and flame)
- [ ] 8.5 Verify no dominant strategy emerges from one pair combo
- [ ] 8.6 Verify reactive enemies still create dilemmas with new system
