## MODIFIED Requirements

### Requirement: Combat phases

Combat proceeds through a fixed sequence of phases each round: planning (push/ability/target selection), execution, enemy turn. Victory transitions to the reward choice screen.

#### Scenario: Planning phase
- **WHEN** the phase is `planning`
- **THEN** the player may toggle push on each slot, toggle acquired abilities (only those earned via growth rewards, plus Vent which is always available), and select an enemy target. The player sees current strain with projection, slot actions, ability costs, and enemy intents.

#### Scenario: Execution phase
- **WHEN** the player ends planning (confirms selections)
- **THEN** strain is adjusted (pushes add based on current push cost which may be 0 if mastered, vent subtracts, abilities add). Abilities resolve first (Repair heals, Brace sets damage reduction, Vent logged). Then slots fire in order: A → B → C. If Vent is active, slot attacks are skipped entirely.

#### Scenario: Enemy turn
- **WHEN** slot actions finish resolving
- **THEN** each alive enemy executes its current intent (Attack, Block, Buff, Debuff, AttackDebuff, DisableSlot, or Scan), then advances its intent index. Brace damage reduction applies per hit before block.

#### Scenario: End of turn
- **WHEN** the enemy turn completes
- **THEN** block resets to 0. Damage reduction resets to 0. Push selections cleared. Ability toggles cleared. Round number increments. Phase returns to planning.

#### Scenario: Victory
- **WHEN** all enemies are defeated
- **THEN** phase transitions to `reward`. The reward choice screen is displayed (see reward-choices spec).
