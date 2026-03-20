## ADDED Requirements

### Requirement: Scan intent telegraphs heat-reactive behavior
Enemies SHALL have a `Scan` intent type that performs no action during the enemy phase but signals to the player that the next turn's intent depends on Still's heat zone.

#### Scenario: Enemy executes Scan intent
- **WHEN** an enemy's current intent is `Scan`
- **THEN** no damage, block, buff, or debuff is applied — the turn is a telegraph only

#### Scenario: Scan intent displayed in UI
- **WHEN** an enemy's upcoming intent is `Scan`
- **THEN** the UI shows a distinct "Scanning..." indicator instead of a damage/block number

### Requirement: HeatReactive intent resolves based on Still's heat zone
Enemies SHALL have a `HeatReactive` intent type that contains three sub-intents — one for each heat zone (Cool, Warm, Hot). At enemy execution time, the sub-intent matching Still's current heat zone is resolved as a normal intent.

#### Scenario: Still is Cool when HeatReactive resolves
- **WHEN** an enemy executes a `HeatReactive` intent and Still's heat is 0-3 (Cool)
- **THEN** the `coolIntent` sub-intent is executed as a normal intent

#### Scenario: Still is Warm when HeatReactive resolves
- **WHEN** an enemy executes a `HeatReactive` intent and Still's heat is 4-6 (Warm)
- **THEN** the `warmIntent` sub-intent is executed as a normal intent

#### Scenario: Still is Hot when HeatReactive resolves
- **WHEN** an enemy executes a `HeatReactive` intent and Still's heat is 7+ (Hot or Overheat)
- **THEN** the `hotIntent` sub-intent is executed as a normal intent

#### Scenario: HeatReactive intent displayed in UI
- **WHEN** an enemy's upcoming intent is `HeatReactive`
- **THEN** the UI shows the sub-intent matching Still's current heat zone as the primary display, with the other two zones shown as smaller alternatives

### Requirement: HeatReactive intents cycle normally in patterns
HeatReactive and Scan intents SHALL participate in the normal intent pattern cycling. They occupy one slot in the `intentPattern` array like any other intent.

#### Scenario: Pattern advances past HeatReactive
- **WHEN** an enemy completes a turn with a HeatReactive intent
- **THEN** the intent index advances by 1 as normal, proceeding to the next intent in the pattern
