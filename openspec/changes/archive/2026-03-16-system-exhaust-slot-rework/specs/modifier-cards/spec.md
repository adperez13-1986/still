## MODIFIED Requirements

### Requirement: System cards provide global effects
System cards SHALL affect combat state globally without targeting a specific body slot. They have no slot limit — any number of system cards may be played per turn. All system cards SHALL exhaust on play (removed from the deck for the rest of combat), making each use a one-time tactical decision.

#### Scenario: Playing a system card
- **WHEN** the player plays a system card
- **THEN** its effect applies immediately without targeting a body slot

#### Scenario: System card exhausts after play
- **WHEN** a system card is played
- **THEN** it is moved to the exhaust pile and does not return to the draw/discard cycle for the rest of combat

#### Scenario: System card returns between combats
- **WHEN** a new combat encounter begins
- **THEN** all previously exhausted system cards are back in the deck (exhaust piles reset per combat)

### Requirement: Slot modifier categories
Slot modifiers SHALL fall into four categories, each altering the body action differently. Each category SHALL have slot restrictions limiting which body slots it can be assigned to.

#### Scenario: Amplify modifier restricted to ARMS/TORSO
- **WHEN** the player selects an Amplify modifier card
- **THEN** only ARMS and TORSO slots are valid assignment targets (multiplying small HEAD draw or LEGS cooling values is not meaningful)

#### Scenario: Redirect modifier restricted to ARMS
- **WHEN** the player selects a Redirect modifier card
- **THEN** only the ARMS slot is a valid assignment target (redirecting targeting only applies to damage actions)

#### Scenario: Repeat modifier is universal
- **WHEN** the player selects a Repeat modifier card
- **THEN** all filled, non-disabled slots are valid assignment targets (double draw on HEAD, double block on TORSO, double damage on ARMS, double cooling on LEGS are all meaningful)

#### Scenario: Override damage modifier restricted to ARMS
- **WHEN** the player selects an Override modifier whose action type is damage
- **THEN** only the ARMS slot is a valid assignment target

#### Scenario: Override block modifier restricted to TORSO
- **WHEN** the player selects an Override modifier whose action type is block
- **THEN** only the TORSO slot is a valid assignment target

#### Scenario: Invalid slot assignment rejected
- **WHEN** the player attempts to assign a modifier to a slot outside its allowed set
- **THEN** the assignment is rejected and the card remains in hand

### Requirement: Slot modifier cards target one body slot
Slot modifier cards SHALL target a specific body slot, altering that slot's action for the current turn. Each slot may receive at most one slot modifier per turn. Slot restrictions are enforced based on the modifier's category.

#### Scenario: Assigning a slot modifier
- **WHEN** the player plays a slot modifier card
- **THEN** the player selects which body slot to apply it to from the set of valid slots for that modifier's category

#### Scenario: One modifier per slot limit
- **WHEN** a slot already has a modifier assigned this turn
- **THEN** the player cannot assign another slot modifier to that slot

#### Scenario: Replacing an assigned modifier
- **WHEN** the player wants to change a slot's modifier during the planning phase
- **THEN** they may unassign the current modifier (returning it to hand, refunding its Heat) and assign a different one

### Requirement: Exhaust keyword on modifiers
Some modifier cards SHALL have the Exhaust keyword. For slot modifier cards, the Exhaust keyword causes exhaustion on play. For system cards, the keyword is redundant (all system cards exhaust automatically) but may appear for display clarity.

#### Scenario: Slot modifier with Exhaust keyword
- **WHEN** a slot modifier card with the Exhaust keyword is played
- **THEN** it is placed in the exhaust pile at end of turn instead of the discard pile

#### Scenario: System card Exhaust keyword is redundant
- **WHEN** a system card with the Exhaust keyword is played
- **THEN** it exhausts as all system cards do — the keyword has no additional effect
