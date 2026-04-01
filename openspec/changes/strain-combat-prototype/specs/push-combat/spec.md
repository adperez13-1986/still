## ADDED Requirements

### Requirement: Three generic combat slots

Combat SHALL use 3 hardcoded slots with placeholder identities. No equipment system — actions are fixed.

#### Scenario: Slot definitions
- **WHEN** combat initializes
- **THEN** the player has 3 slots:
  - Slot A: deal 6 damage to one enemy (pushed: 9 damage)
  - Slot B: gain 5 block (pushed: 7 block)
  - Slot C: deal 4 damage to all enemies (pushed: 6 damage to all)

#### Scenario: Slots fire in order
- **WHEN** the execution phase begins
- **THEN** slots fire in order: A → B → C

### Requirement: Push mechanic

During planning, the player SHALL toggle push on each slot. Pushing costs 1 strain and amplifies the action (base × 1.5, floored).

#### Scenario: Baseline action (no push)
- **WHEN** a slot is not pushed
- **THEN** it fires at base values (0 strain cost)

#### Scenario: Pushed action
- **WHEN** a slot is pushed
- **THEN** strain increases by 1 and the slot fires at amplified values

#### Scenario: Toggle push during planning
- **WHEN** the player toggles a slot's push state
- **THEN** the UI updates to show the strain cost preview and amplified action values

#### Scenario: Confirm push selections
- **WHEN** the player confirms selections (ends planning)
- **THEN** strain is deducted for all pushed slots, then execution begins

### Requirement: Planning phase is push selection only

No cards, no hand, no energy. The player's only decision is which slots to push.

#### Scenario: Planning phase UI
- **WHEN** planning begins
- **THEN** player sees 3 slots with push toggles, current strain, and enemy intents

#### Scenario: Execute button
- **WHEN** the player has made selections
- **THEN** they can press Execute to proceed
