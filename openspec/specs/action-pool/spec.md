# Action Pool

## Purpose

Pool of actions the player can acquire during a run. Starting loadout is 4 fixed actions (Strike, Shield, Barrage, Vent). 21 findable actions are available as growth rewards, covering all action types. Each findable is a sidegrade with a distinct tactical niche.

## Requirements

### Requirement: Findable action pool

The game SHALL maintain a pool of actions that can be found as growth rewards during a run. Each action is a sidegrade — different from starting actions, not strictly better. The pool SHALL contain at least 25 actions covering all action types.

#### Scenario: Action definitions
- **WHEN** a run begins
- **THEN** the findable pool contains the following actions:

**Damage (single target):**
| ID | Name | Type | Base | Pushed | Special |
|----|------|------|------|--------|---------|
| phase-blade | Phase Blade | damage_single | 3 | 5 | hits: 2 |
| focus-fire | Focus Fire | damage_single | 10 | 14 | — |
| quick-jabs | Quick Jabs | damage_single | 2 | 3 | hits: 3 |
| heavy-blow | Heavy Blow | damage_single | 4 | 14 | — |

**Damage (all enemies):**
| ID | Name | Type | Base | Pushed | Special |
|----|------|------|------|--------|---------|
| pulse | Pulse | damage_all | 2 | 3 | hits: 3 (random) |
| splash | Splash | damage_all | 3 | 5 | — |
| flurry | Flurry | damage_all | 2 | 3 | hits: 2 |

**Defense:**
| ID | Name | Type | Base | Pushed | Special |
|----|------|------|------|--------|---------|
| barrier | Barrier | block | 3 | 5 | persistent |
| brace | Brace | reduce | 3 | 5 | perHit |
| redirect | Redirect | reflect | 40 | 60 | reflectPct: 40 |
| iron-wall | Iron Wall | block | 2 | 5 | persistent |
| guard | Guard | reduce | 2 | 4 | perHit |
| thornskin | Thornskin | reflect | 30 | 50 | reflectPct: 30 |

**Sustain:**
| ID | Name | Type | Base | Pushed | Special |
|----|------|------|------|--------|---------|
| repair | Repair | heal | 4 | 6 | — |
| mend | Mend | heal | 2 | 3 | healOverTurns: 2 |
| absorb | Absorb | convert | 3 | 5 | — |
| stitch | Stitch | heal | 3 | 5 | — |
| regen | Regen | heal | 1 | 2 | healOverTurns: 3 |
| recharge | Recharge | convert | 4 | 6 | — |

**Utility:**
| ID | Name | Type | Base | Pushed | Special |
|----|------|------|------|--------|---------|
| patience | Patience | buff | 3 | 5 | — |
| overclock | Overclock | buff | 0 | 0 | — |
| weaken | Weaken | debuff | 3 | 4 | — |
| taunt | Taunt | utility | 0 | 0 | — |
| rally | Rally | buff | 5 | 7 | — |
| cripple | Cripple | debuff | 4 | 6 | — |

#### Scenario: Actions are sidegrades
- **WHEN** a findable action is compared to a starting action of the same type
- **THEN** it is not strictly better. It trades one advantage for another (e.g., Heavy Blow's low base (4) forces commitment via pushing to reach its strong pushed value (14))

#### Scenario: Pool variety in rewards
- **WHEN** growth options are offered after combat victory
- **THEN** the pool contains enough variety that no single action type dominates reward selection across many runs
