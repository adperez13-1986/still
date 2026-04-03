## MODIFIED Requirements

### Requirement: Combat phases

The enemy turn resolution SHALL handle reactive intent types by reading combat state from the current turn.

#### Scenario: Retaliate resolution
- **WHEN** an enemy's current intent is Retaliate
- **THEN** the engine counts pushedSlots that are true and deals valuePerPush × count damage to the player

#### Scenario: StrainScale resolution
- **WHEN** an enemy's current intent is StrainScale
- **THEN** the engine reads current strain and deals baseValue + floor(strain / strainDivisor) damage

#### Scenario: CopyAction resolution
- **WHEN** an enemy's current intent is CopyAction
- **THEN** the engine scans combatLog for the highest-value player action this turn and replicates it as an enemy action

#### Scenario: Charge resolution
- **WHEN** an enemy's current intent is Charge
- **THEN** if chargeCounter > 0, decrement and do nothing. If chargeCounter = 0, attack for blastValue and reset.

#### Scenario: ConditionalBuff resolution
- **WHEN** an enemy's current intent is ConditionalBuff
- **THEN** check condition (e.g., 'undamaged' = enemy took no damage from player slots this turn). If true, apply buff. If false, perform fallback attack.

#### Scenario: On-death check
- **WHEN** any enemy's HP reaches 0 during slot execution
- **THEN** check for onDeath trigger. If spawn trigger exists, add new enemies to combat before continuing.

#### Scenario: Intent display for reactive types
- **WHEN** displaying enemy intents during planning phase
- **THEN** reactive intents show descriptive text: Retaliate shows "3 × pushes", StrainScale shows "8 (+strain)", CopyAction shows "Mirrors you", Charge shows countdown or blast warning
