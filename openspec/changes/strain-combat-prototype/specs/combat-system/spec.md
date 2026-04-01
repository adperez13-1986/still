## MODIFIED Requirements

### Requirement: Energy system

**REMOVED**

**Reason**: Replaced by strain system. Energy was a per-turn budget that reset — no tension, no accumulation. Strain accumulates permanently, creating the core tension.

**Migration**: All references to `currentEnergy`, `maxEnergy`, `bonusEnergy` replaced by `strain` and `maxStrain` on run state. Cards are not played in this prototype.

### Requirement: Combat phases

Combat proceeds through a fixed sequence of phases each round: planning (push selection), execution, enemy turn.

#### Scenario: Planning phase
- **WHEN** the phase is `planning`
- **THEN** the player may toggle push on each non-disabled body slot. No cards are drawn or played. The player sees current strain, slot actions, and enemy intents.

#### Scenario: Execution phase
- **WHEN** the player ends planning (confirms push selections)
- **THEN** strain is deducted for all pushed slots. Body slots fire in order: Head, Torso, Arms, Legs. Pushed slots fire with amplified values. Non-pushed slots fire at baseline. Disabled slots are skipped.

#### Scenario: Enemy turn
- **WHEN** body actions finish resolving (`executeEnemyTurn`)
- **THEN** each alive enemy executes its current intent (Attack, Block, Buff, Debuff, AttackDebuff, DisableSlot, or Scan), then advances its intent index. Enemy block resets to 0 at the start of the enemy turn.

#### Scenario: End of turn
- **WHEN** the enemy turn completes (`endTurn`)
- **THEN** player Strength and Dexterity each decay by 1 stack. Weak, Vulnerable, and Inspired decrement by 1. Push selections are cleared. No cards to discard.

#### Scenario: Start of next turn
- **WHEN** `startTurn` is called
- **THEN** strain retains its value (no reset). Block resets to 0 (unless persistent block exists). Push selections reset to unpushed. No cards drawn.

### Requirement: Block resets each turn

Block does not carry over between turns unless the LEGS persistent block effect is active.

#### Scenario: Normal block reset
- **WHEN** a new turn starts and no persistent block exists
- **THEN** block is set to 0

#### Scenario: Persistent block from LEGS
- **WHEN** a new turn starts and `persistentBlock > 0`
- **THEN** `persistentBlock` decays by 50% (floored), and block is set to the remaining persistent amount

### Requirement: Status effects

Status effects modify damage dealt and received. Same behavior as current system.

#### Scenario: Strength affects Arms damage
- **WHEN** Arms fires a damage action
- **THEN** Strength stacks are added to the base damage value (or pushed damage value if pushed)

#### Scenario: Dexterity affects Torso block
- **WHEN** Torso fires a block action
- **THEN** Dexterity stacks are added to the base block value (or pushed block value if pushed)

#### Scenario: Weak reduces damage dealt
- **WHEN** a Weak entity deals damage
- **THEN** damage is multiplied by 0.75 (floored)

#### Scenario: Vulnerable increases damage taken
- **WHEN** a Vulnerable entity takes damage
- **THEN** damage is multiplied by 1.5 (floored)

## REMOVED Requirements

### Requirement: Cards are modifier cards with energy costs
**Reason**: Cards are not used in this prototype. Combat decisions come from push selections, not card plays.
**Migration**: Card system code remains but is bypassed. No cards drawn, no hand displayed, no card plays during planning.
