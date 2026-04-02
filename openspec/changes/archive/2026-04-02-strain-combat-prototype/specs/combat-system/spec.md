## MODIFIED Requirements

### Requirement: Energy system

**REMOVED**

**Reason**: Replaced by strain system. Energy was a per-turn budget that reset — no tension, no accumulation. Strain accumulates permanently, creating the core tension.

**Migration**: All references to `currentEnergy`, `maxEnergy`, `bonusEnergy` replaced by `strain` and `maxStrain` on run state. Cards are not played in this prototype.

### Requirement: Combat phases

Combat proceeds through a fixed sequence of phases each round: planning (push/ability/target selection), execution, enemy turn.

#### Scenario: Planning phase
- **WHEN** the phase is `planning`
- **THEN** the player may toggle push on each slot, toggle abilities (Repair, Brace, Vent), and select an enemy target. The player sees current strain with projection, slot actions, ability costs, and enemy intents.

#### Scenario: Execution phase
- **WHEN** the player ends planning (confirms selections)
- **THEN** strain is adjusted (pushes add, vent subtracts, abilities add). Abilities resolve first (Repair heals, Brace sets damage reduction, Vent logged). Then slots fire in order: A → B → C. If Vent is active, slot attacks are skipped entirely.

#### Scenario: Enemy turn
- **WHEN** slot actions finish resolving
- **THEN** each alive enemy executes its current intent (Attack, Block, Buff, Debuff, AttackDebuff, DisableSlot, or Scan), then advances its intent index. Brace damage reduction applies per hit before block.

#### Scenario: End of turn
- **WHEN** the enemy turn completes
- **THEN** block resets to 0. Damage reduction resets to 0. Push selections cleared. Ability toggles cleared. Round number increments. Phase returns to planning.

### Requirement: Block resets each turn

Block does not carry over between turns.

#### Scenario: Normal block reset
- **WHEN** a new turn starts
- **THEN** block is set to 0

### Requirement: Damage reduction from Brace

Brace reduces incoming damage per hit before block is applied.

#### Scenario: Brace active during enemy attack
- **WHEN** an enemy attacks and Brace is active (damageReduction = 3)
- **THEN** each hit is reduced by 3 (minimum 0 damage per hit), then remaining damage is absorbed by block, then remainder hits HP

## REMOVED Requirements

### Requirement: Cards are modifier cards with energy costs
**Reason**: Cards are not used in this prototype. Combat decisions come from push selections and abilities, not card plays.
**Migration**: Card system code remains but is bypassed. No cards drawn, no hand displayed, no card plays during planning.

### Requirement: Status effects (Strength, Dexterity, Weak, Vulnerable, Inspired)
**Reason**: Not implemented in prototype. Status effects from the card combat system are not used. May be reintroduced later.
**Migration**: Status effect code remains but is not referenced by strain combat.
