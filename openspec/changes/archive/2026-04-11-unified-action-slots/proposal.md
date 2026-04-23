## Why

The current strain combat system has a shallow turn-by-turn decision space. 3 fixed slots (Strike, Shield, Barrage) with binary push toggles + 2 abilities create ~5 decisions per turn, most of which are obvious after reading enemy intents. Growth rewards modify these slots but don't change the fundamental action structure. By end of sector 2, the game feels solved regardless of which rewards were taken.

Games like FTL, Into the Breach, and Card Crawl achieve depth not through more buttons but by making the same buttons mean different things based on context. FF7's materia system achieves build identity through slot arrangement — the same materia in different linked slots creates different synergies.

This change replaces the fixed slot + ability split with a unified action slot system where position matters. One system, one reward type, emergent depth from arrangement.

## What Changes

**Unified action slots replace fixed slots + abilities:**
- 5-6 action slots arranged in linked pairs + optional solo slot
- Every action (Strike, Shield, Barrage, Vent, Repair, Brace, and new actions found during a run) occupies the same type of slot
- Actions in linked pairs synergize automatically — the synergy is determined by the combination
- Pushing a single slot: 1 strain (link dormant). Pushing BOTH linked slots: 3 strain (1+1+1 link tax), link activates
- Solo slot has no link — push for 1 strain, always independent

**One reward type: new actions**
- Growth rewards are new action types found after combat (replacing the 29-item growth tree)
- The player decides WHERE to slot them — which pair, which position
- Rearranging slots between fights changes your build without finding new rewards
- Sidegrades, not upgrades — each action is good at some things and bad at others

**Link synergies are emergent, not items:**
- No separate "link effects" to find. The synergy comes from what's paired
- Strike + Repair = Drain (damage heals). Strike + Shield = Counter (block triggers attack)
- Same action in different pairs creates different builds
- The combinatorial space of actions × positions IS the build depth

**Strain cost model:**
- Push one slot in a pair: 1 strain, that action fires at pushed value, link dormant
- Push both slots in a pair: 3 strain (link tax), both fire at pushed values, link synergy activates
- Push solo slot: 1 strain, fires at pushed value
- Unpushed slots fire at base value, no strain cost
- Link tax maps to genesis: connected things cost more to push together (seed #9)

**Starting state:**
- Begin with 5 slots: [Strike]──[Shield]  [Barrage]──[Vent]  [Repair earned later or empty]
- Base links exist from turn 1 — player discovers what Strike+Shield does by pushing both
- During the run, find replacement actions and rearrange to build synergies

## Capabilities

### New Capabilities
- `action-slots`: Unified action slot system — slots, pairs, solo position, push mechanics, link activation
- `link-synergies`: Emergent synergy effects from action pairs — the combination table defining what each pair produces
- `action-pool`: Pool of findable actions (sidegrades) that replace starting actions during a run

### Modified Capabilities
- `combat-system`: Turn structure changes from fixed slots + abilities to unified action slots with pair-based link resolution
- `growth-rewards`: Growth rewards become new actions to slot, replacing the tiered dependency tree. Slot arrangement between fights replaces explicit upgrade paths.
- `reward-choices`: Post-combat reward screen offers new actions instead of tree rewards. Growth cost is strain to take the action. Player then decides where to slot it.

## Impact

- `src/game/strainCombat.ts` — complete rework: action slot system, pair/link resolution, link tax, new execution order
- `src/game/types.ts` — new types for action slots, slot pairs, action definitions, link synergy table
- `src/components/StrainCombatScreen.tsx` — new UI: paired slot display, link indicators, rearrangement between fights
- `src/store/runStore.ts` — growth state becomes action loadout (which actions, which positions)
- `src/data/actions.ts` — new file: action definitions (starting + findable), synergy combination table
- `src/data/enemies.ts` — existing enemies work as-is, but intent display may need updates for new action types
