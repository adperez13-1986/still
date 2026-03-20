## MODIFIED Requirements

### Requirement: Status effects interact with body actions
Existing status effects SHALL apply to body actions as follows: Strength adds to ARMS damage output, Dexterity adds to TORSO Block output, Weak reduces ARMS damage, Vulnerable increases damage taken, and Inspired grants extra modifier card draws. Strength and Dexterity SHALL decay by 1 at end of each turn (minimum 0).

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

#### Scenario: Strength decays at end of turn
- **WHEN** the end-of-turn phase resolves after enemy actions
- **THEN** Strength is reduced by 1 (minimum 0)

#### Scenario: Dexterity decays at end of turn
- **WHEN** the end-of-turn phase resolves after enemy actions
- **THEN** Dexterity is reduced by 1 (minimum 0)

#### Scenario: Stat decay does not apply to enemy stats
- **WHEN** an enemy has Strength stacks from Buff intents
- **THEN** enemy Strength does NOT decay — only player Strength and Dexterity decay
