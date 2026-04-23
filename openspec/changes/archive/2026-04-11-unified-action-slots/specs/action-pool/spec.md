## ADDED Requirements

### Requirement: Findable action pool

The game SHALL maintain a pool of actions that can be found as growth rewards during a run. Each action is a sidegrade — different from starting actions, not strictly better.

#### Scenario: Action definitions
- **WHEN** a run begins
- **THEN** the findable pool contains the following actions:

**Damage actions:**
| ID | Name | Type | Base | Pushed | Notes |
|----|------|------|------|--------|-------|
| phase-blade | Phase Blade | damage_single | 3×2 | 5×2 | Multi-hit single target |
| focus-fire | Focus Fire | damage_single | 10 | 14 | Heavy single hit |
| pulse | Pulse | damage_all | 2×3 | 3×3 | Multi-hit AoE (3 random) |

**Defense actions:**
| ID | Name | Type | Base | Pushed | Notes |
|----|------|------|------|--------|-------|
| barrier | Barrier | block | 3 | 5 | Block + persists 1 turn |
| brace | Brace | reduce | 3/hit | 5/hit | Reduce per hit |
| redirect | Redirect | reflect | 40% | 60% | Reflect damage taken |

**Sustain actions:**
| ID | Name | Type | Base | Pushed | Notes |
|----|------|------|------|--------|-------|
| repair | Repair | heal | 4 | 6 | Heal HP |
| mend | Mend | heal | 2/turn | 3/turn | Heal over 2 turns |
| absorb | Absorb | convert | 3 | 5 | Convert block to strain reduction |

**Utility actions:**
| ID | Name | Type | Base | Pushed | Notes |
|----|------|------|------|--------|-------|
| patience | Patience | buff | +3 | +5 | Linked action gains base value next turn |
| overclock | Overclock | buff | 0 | 0 | Linked action fires twice (push only) |
| weaken | Weaken | debuff | -3 dmg | -4 dmg | Reduce enemy damage 2 turns |
| taunt | Taunt | utility | 0 | 0 | Force all enemies to target you |

#### Scenario: Actions are sidegrades
- **WHEN** a findable action is compared to a starting action of the same type
- **THEN** it is not strictly better. It trades one advantage for another (e.g., Phase Blade hits twice but each hit is weaker, making it worse against Brace enemies)

### Requirement: Action replacement

Taking a new action requires replacing an existing one. The replaced action is permanently lost.

#### Scenario: Filling empty slot
- **WHEN** the player takes a new action and the solo slot (slot 5) is empty
- **THEN** the action fills the empty slot. No replacement needed.

#### Scenario: Replacing existing action
- **WHEN** the player takes a new action and all slots are filled
- **THEN** the player chooses which existing action to replace. The old action is gone permanently.

#### Scenario: Replacement decision
- **WHEN** the player is choosing which action to replace
- **THEN** the UI shows the current slot layout, pair synergies that would change, and a preview of the new configuration
