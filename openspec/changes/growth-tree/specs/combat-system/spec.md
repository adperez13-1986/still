## MODIFIED Requirements

### Requirement: Combat phases

Combat proceeds through phases each round. The execution phase is modified to resolve tier 2-3 growth reward effects.

#### Scenario: Execution phase with growth effects
- **WHEN** the player ends planning and execution begins
- **THEN** the following resolution order applies:
  1. Strain adjusted (pushes, abilities, vent)
  2. Check forfeit
  3. Resolve abilities (Repair with possible +/desperate upgrade, Brace with possible +/calm upgrade, Vent with possible Lifeline heal)
  4. Fire slots A → B → C (with possible Piercing Strike, Drain Strike heal, Scatter Barrage, Executioner bonus, Chain Reaction). Shield slot is SKIPPED here if Reactive Shield is active.
  5. Check win
  6. Enemy turn
  7. If Reactive Shield active: fire Shield now (block gained after damage taken)
  8. If Fortify active: convert remaining block to HP heal
  9. Check loss
  10. Reset for next turn

#### Scenario: Drain Strike healing
- **WHEN** Strike deals damage and drain-strike is acquired
- **THEN** player heals floor(damage / 2) immediately after Strike resolves

#### Scenario: Reactive Shield delayed execution
- **WHEN** reactive-shield is acquired
- **THEN** Shield does not fire during step 4. Instead it fires after the enemy turn (step 7). Block from Shield is fresh and fully available next turn.

#### Scenario: Chain Reaction trigger
- **WHEN** an enemy is killed during Barrage and chain-reaction is acquired
- **THEN** a bonus Barrage fires immediately with the same value against remaining alive enemies

#### Scenario: Fortify end-of-turn healing
- **WHEN** the enemy turn ends and fortify is acquired and block > 0
- **THEN** remaining block converts to HP healing (1 block = 1 HP) before block resets to 0
