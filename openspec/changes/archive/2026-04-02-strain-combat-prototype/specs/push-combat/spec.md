## ADDED Requirements

### Requirement: Three generic combat slots

Combat SHALL use 3 hardcoded slots with placeholder identities. No equipment system — actions are fixed.

#### Scenario: Slot definitions
- **WHEN** combat initializes
- **THEN** the player has 3 slots:
  - Slot A "Strike": deal 6 damage to selected enemy (pushed: 9 damage)
  - Slot B "Shield": gain 5 block (pushed: 7 block)
  - Slot C "Barrage": deal 4 damage to all enemies (pushed: 6 damage to all)

#### Scenario: Slots fire in order
- **WHEN** the execution phase begins
- **THEN** slots fire in order: A → B → C

### Requirement: Push mechanic

During planning, the player SHALL toggle push on each slot. Pushing costs 1 strain and amplifies the action.

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
- **THEN** strain is deducted for all pushed slots and active abilities, then execution begins

#### Scenario: Push disabled during vent
- **WHEN** Vent is active
- **THEN** push toggles are disabled and all slots fire at base values (but see Vent — slots are skipped entirely)

### Requirement: Enemy targeting

The player SHALL select which enemy receives single-target damage.

#### Scenario: Default target
- **WHEN** combat initializes
- **THEN** the first alive enemy is selected as the target

#### Scenario: Target selection
- **WHEN** the player taps an enemy during planning
- **THEN** that enemy becomes the selected target (highlighted with red border)

#### Scenario: Strike targets selected enemy
- **WHEN** Slot A (Strike) fires
- **THEN** damage goes to the selected target. If that target is defeated, falls back to first alive enemy.

### Requirement: Abilities

The player has fixed abilities that compete with pushes for the same strain budget. Abilities are toggled on/off during planning, same as pushes.

#### Scenario: Repair (1 strain)
- **WHEN** the player activates Repair and confirms
- **THEN** strain increases by 1, player heals 4 HP (capped at max health)

#### Scenario: Brace (1 strain)
- **WHEN** the player activates Brace and confirms
- **THEN** strain increases by 1, all incoming damage this turn is reduced by 3 per hit (applied before block)

#### Scenario: Vent (0 strain cost, recovers 4 strain)
- **WHEN** the player activates Vent and confirms
- **THEN** strain decreases by 4 (minimum 0). All slot attacks are skipped this turn. Push toggles are disabled. Other abilities (Repair, Brace) can still be used alongside Vent.

#### Scenario: Abilities reset each turn
- **WHEN** a new turn begins
- **THEN** all ability toggles are cleared. Damage reduction resets to 0.

### Requirement: Planning phase is push + ability + target selection

No cards, no hand, no energy. The player's decisions are: which slots to push, which abilities to activate, and which enemy to target.

#### Scenario: Planning phase UI
- **WHEN** planning begins
- **THEN** player sees 3 slots with push toggles, ability buttons, enemy cards (tappable for targeting), current strain with projection, and enemy intents

#### Scenario: Execute button
- **WHEN** the player has made selections
- **THEN** they can press Execute to proceed
