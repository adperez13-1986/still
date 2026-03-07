## ADDED Requirements

### Requirement: Filled equipment slots generate automatic actions each turn
Each filled equipment slot SHALL produce one action per turn during the execution phase. The action is determined by the equipped item, not the slot itself. Empty slots produce no action.

#### Scenario: Filled slot generates action
- **WHEN** the execution phase begins and an equipment slot has an item equipped
- **THEN** that slot's action fires with its base output value

#### Scenario: Empty slot generates nothing
- **WHEN** the execution phase begins and an equipment slot is empty
- **THEN** no action is generated for that slot

### Requirement: Equipment slots have fixed domains
Each of the four equipment slots SHALL govern a specific combat domain, and equipment items SHALL only fit in their designated slot.

#### Scenario: HEAD slot governs information
- **WHEN** a HEAD item is equipped
- **THEN** its action relates to information — card draw, enemy intent foresight, or reactive scanning

#### Scenario: TORSO slot governs durability
- **WHEN** a TORSO item is equipped
- **THEN** its action relates to durability — gaining Block, healing, or damage reduction

#### Scenario: ARMS slot governs output
- **WHEN** an ARMS item is equipped
- **THEN** its action relates to output — dealing damage to enemies or applying debuffs

#### Scenario: LEGS slot governs flow
- **WHEN** a LEGS item is equipped
- **THEN** its action relates to flow — Heat reduction, card cycling, or turn manipulation

### Requirement: Body actions execute in fixed order
During the execution phase, body actions SHALL fire in a fixed order: HEAD first, then TORSO, then ARMS, then LEGS. The player cannot change this order.

#### Scenario: Execution order is HEAD → TORSO → ARMS → LEGS
- **WHEN** the execution phase begins with multiple filled slots
- **THEN** HEAD fires first, TORSO second, ARMS third, LEGS last, regardless of which modifiers were assigned

#### Scenario: Skipped slots do not delay execution
- **WHEN** a slot in the middle of the order is empty (e.g., TORSO is empty)
- **THEN** execution proceeds to the next filled slot without pause

### Requirement: Body action output is affected by Heat thresholds
Body action output values SHALL be modified by the current Heat threshold at the moment of execution.

#### Scenario: Warm bonus applies to body actions
- **WHEN** a body action fires while Heat is in the Warm range (5-7)
- **THEN** the action's output value is increased by 1 (e.g., "deal 6 damage" becomes "deal 7 damage")

#### Scenario: Hot bonus applies to body actions
- **WHEN** a body action fires while Heat is in the Hot range (8-9)
- **THEN** the action's output value is increased by 2

#### Scenario: Heat threshold checked per action
- **WHEN** body actions fire sequentially and earlier actions change the Heat level (each action adds +1 Heat)
- **THEN** each action uses the Heat threshold at the moment it fires, not the threshold at the start of execution

### Requirement: Body actions can be modified by modifier cards
During the planning phase, the player SHALL be able to assign modifier cards to body slots, altering how that slot's action behaves during execution.

#### Scenario: Modifier enhances body action
- **WHEN** the player assigns a slot modifier card to a filled equipment slot
- **THEN** that slot's action is altered according to the modifier's effect (amplified, redirected, repeated, or overridden)

#### Scenario: Modifier on empty slot
- **WHEN** the player assigns an Override modifier to an empty equipment slot
- **THEN** the override action replaces the empty slot's lack of action, allowing that slot to act this turn

#### Scenario: Non-override modifier on empty slot
- **WHEN** the player attempts to assign an Amplify, Redirect, or Repeat modifier to an empty slot
- **THEN** the assignment is rejected — there is no base action to modify

### Requirement: Status effects interact with body actions
Existing status effects SHALL apply to body actions as follows: Strength adds to ARMS damage output, Dexterity adds to TORSO Block output, Weak reduces ARMS damage, Vulnerable increases damage taken, and Inspired grants extra modifier card draws.

#### Scenario: Strength increases ARMS damage
- **WHEN** Still has Strength stacks and an ARMS body action fires
- **THEN** the ARMS action's damage output is increased by the number of Strength stacks

#### Scenario: Dexterity increases TORSO Block
- **WHEN** Still has Dexterity stacks and a TORSO body action fires
- **THEN** the TORSO action's Block output is increased by the number of Dexterity stacks

#### Scenario: Weak reduces ARMS damage
- **WHEN** Still has the Weak status and an ARMS body action fires
- **THEN** the ARMS action's damage output is reduced by 25% (rounded down)

#### Scenario: Vulnerable increases damage taken
- **WHEN** Still has the Vulnerable status and an enemy deals damage
- **THEN** incoming damage is increased by 50% (rounded down) — this applies to enemy attacks, not body actions

#### Scenario: Inspired grants extra draws
- **WHEN** Still has the Inspired status at the start of a turn
- **THEN** Still draws additional modifier cards equal to the Inspired stacks, then Inspired decrements as normal

#### Scenario: Status effects do not apply to Override actions
- **WHEN** a slot has an Override modifier replacing its action
- **THEN** Strength/Dexterity bonuses do not apply to the override action (the override has its own fixed values)

### Requirement: Equipment items can have heat-conditional effects
Some equipment items SHALL have bonus effects that activate based on Still's heat threshold at the moment of execution.

#### Scenario: Equipment bonus at matching threshold
- **WHEN** a body action fires from equipment with a heat-conditional bonus and Still is at the required threshold
- **THEN** the enhanced effect applies (e.g., extra draw, extra Block)

#### Scenario: Equipment bonus outside threshold
- **WHEN** a body action fires from equipment with a heat-conditional bonus and Still is below the required threshold
- **THEN** only the base effect applies

### Requirement: Each equipment slot has at least three options in Act 1
The Act 1 equipment pool SHALL include at least 3 items per slot, providing meaningful choice within each body domain.

#### Scenario: Third Head equipment option
- **WHEN** Head equipment drops in Act 1
- **THEN** the pool includes Calibrated Optics (draw 1 card, draw 2 while Cool) alongside Basic Scanner and Cracked Lens

#### Scenario: Third Torso equipment option
- **WHEN** Torso equipment drops in Act 1
- **THEN** the pool includes Thermal Plating (gain 3 Block, gain 5 while Hot) alongside Scrap Plating and Patched Hull

#### Scenario: Third Arms equipment option
- **WHEN** Arms equipment drops in Act 1
- **THEN** the pool includes Overclocked Pistons (deal 8 damage, generates +1 Heat) alongside Piston Arm and Welding Torch

#### Scenario: Third Legs equipment option
- **WHEN** Legs equipment drops in Act 1
- **THEN** the pool includes Adaptive Treads (lose 2 Heat, gain 1 Block per heat lost) alongside Worn Actuators and Salvaged Treads

### Requirement: Shutdown disables all body actions
When Still is in Overheat shutdown, no body actions SHALL fire.

#### Scenario: Shutdown turn
- **WHEN** a turn begins in Overheat shutdown state
- **THEN** no body actions execute, no body-action Heat is generated, and the player may only play system cards
