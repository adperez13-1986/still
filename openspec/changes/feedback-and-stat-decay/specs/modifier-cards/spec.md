## MODIFIED Requirements

### Requirement: Slot modifier categories
Slot modifiers SHALL fall into five categories, each altering the body action differently.

#### Scenario: Amplify modifier increases output
- **WHEN** an Amplify modifier is assigned to a slot
- **THEN** the slot's action output is multiplied (e.g., +50%, double, or triple depending on the specific card)

#### Scenario: Redirect modifier changes targeting
- **WHEN** a Redirect modifier is assigned to a slot
- **THEN** the slot's action target changes (e.g., single enemy → all enemies, or gains a focus bonus against lowest-HP enemy)

#### Scenario: Repeat modifier triggers the action again
- **WHEN** a Repeat modifier is assigned to a slot
- **THEN** the slot's action fires an additional time during execution; the Repeat card's energy cost is paid when assigned during the planning phase

#### Scenario: Override modifier replaces the action
- **WHEN** an Override modifier is assigned to a slot
- **THEN** the slot's normal action is replaced entirely with the override's action for this turn

#### Scenario: Feedback modifier applies slot-dependent effect
- **WHEN** a Feedback modifier is assigned to a slot
- **THEN** the slot's action gains a secondary effect determined by which slot it occupies (HEAD: draw→Arms damage, TORSO: block→reflected damage, ARMS: damage→healing, LEGS: block persists)
