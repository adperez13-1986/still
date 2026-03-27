## Combat System

### Requirement: Energy system

Each combat turn, Still has a pool of energy to spend on playing modifier cards. Energy resets fully at the start of each turn.

- `DEFAULT_MAX_ENERGY` is 8 (defined in `types.ts`)
- Each of the 4 equipment slots represents a 2E baseline (8E / 4 slots)
- Parts with `bonusEnergy` increase `maxEnergy` beyond the default
- Energy is deducted when a card is played; refunded if a slot modifier is unassigned during planning

#### Scenario: Energy resets each turn
- **WHEN** a new turn begins (`startTurn`)
- **THEN** `currentEnergy` is set to `maxEnergy`

#### Scenario: Insufficient energy
- **WHEN** the player attempts to play a card whose `energyCost` exceeds `currentEnergy`
- **THEN** the card cannot be played

#### Scenario: Parts increase max energy
- **WHEN** the player has a part with `bonusEnergy` effect
- **THEN** `maxEnergy` is increased by that value at combat initialization

### Requirement: Combat phases

Combat proceeds through a fixed sequence of phases each round: planning, execution, enemy turn.

#### Scenario: Planning phase
- **WHEN** the phase is `planning`
- **THEN** the player may assign slot modifier cards to body slots, play system cards, play freePlay cards, and unassign previously assigned modifiers (refunding energy)

#### Scenario: Execution phase
- **WHEN** the player ends planning (`executeBodyActions`)
- **THEN** body slots fire in order: Head, Torso, Arms, Legs. Each equipped slot resolves its action (modified by any assigned cards). System card slots marked `__system__` are cleared (their effects already fired during planning). Disabled slots are skipped.

#### Scenario: Enemy turn
- **WHEN** body actions finish resolving (`executeEnemyTurn`)
- **THEN** each alive enemy executes its current intent (Attack, Block, Buff, Debuff, AttackDebuff, DisableSlot, or Scan), then advances its intent index. Enemy block resets to 0 at the start of the enemy turn. Disabled slots from the previous enemy turn are cleared before new disables are applied.

#### Scenario: End of turn
- **WHEN** the enemy turn completes (`endTurn`)
- **THEN** player Strength and Dexterity each decay by 1 stack. Weak, Vulnerable, and Inspired decrement by 1 (standard). Assigned slot modifiers move to discard (or exhaust if they have the Exhaust keyword). Remaining hand cards are discarded. The hand is emptied.

#### Scenario: Start of next turn
- **WHEN** `startTurn` is called
- **THEN** energy resets to max. Block resets to 0 (unless persistent block exists from LEGS Feedback, which decays by 50% per turn). Cards are drawn equal to `drawCount` + Inspired bonus + HEAD equipment draw bonus. If the draw pile is insufficient, the discard pile is shuffled in first.

### Requirement: Block resets each turn

Block does not carry over between turns unless the LEGS Feedback effect is active.

#### Scenario: Normal block reset
- **WHEN** a new turn starts and no persistent block exists
- **THEN** block is set to 0

#### Scenario: Persistent block from LEGS Feedback
- **WHEN** a new turn starts and `persistentBlock > 0`
- **THEN** `persistentBlock` decays by 50% (floored), and block is set to the remaining persistent amount

### Requirement: Status effects

Status effects modify damage dealt and received. Player and enemy statuses follow different decay rules.

#### Scenario: Strength affects Arms damage
- **WHEN** Arms fires a damage action (non-Override)
- **THEN** Strength stacks are added to the base damage value

#### Scenario: Dexterity affects Torso block
- **WHEN** Torso fires a block action (non-Override)
- **THEN** Dexterity stacks are added to the base block value

#### Scenario: Override actions do not receive stat bonuses
- **WHEN** a slot fires with an Override modifier
- **THEN** Strength and Dexterity are NOT applied to the override action

#### Scenario: Weak reduces damage dealt
- **WHEN** a Weak entity deals damage (player Arms or enemy attack)
- **THEN** damage is multiplied by 0.75 (floored)

#### Scenario: Vulnerable increases damage taken
- **WHEN** a Vulnerable entity is hit
- **THEN** incoming damage is multiplied by 1.5 (floored)

#### Scenario: Player Strength and Dexterity decay by 1 per turn
- **WHEN** the player's turn ends (`endTurn`)
- **THEN** player Strength loses 1 stack and player Dexterity loses 1 stack. If either reaches 0, it is removed.

#### Scenario: Enemy Strength and Dexterity are permanent
- **WHEN** an enemy's statuses are decremented at the end of its action
- **THEN** Strength and Dexterity are skipped (they persist across turns). Only Weak, Vulnerable, and Inspired decrement by 1.

#### Scenario: Inspired grants bonus draw
- **WHEN** the player has Inspired stacks at end of turn
- **THEN** the Inspired value is passed to the next `startTurn` as a draw bonus. Inspired then decrements normally.

### Requirement: Disabled slots

Enemies with the DisableSlot intent can disable a body slot for the next turn.

#### Scenario: Slot disabled by enemy
- **WHEN** an enemy uses a DisableSlot intent targeting a specific slot
- **THEN** that slot is added to `disabledSlots` and cannot be assigned modifiers or fire during the next execution phase

#### Scenario: Disabled slots cleared each enemy turn
- **WHEN** the enemy turn begins
- **THEN** all previously disabled slots are cleared before new disables are applied

### Requirement: Enemy damage scaling

Enemy damage scales with progression to maintain challenge.

#### Scenario: Regular enemy damage scaling
- **WHEN** a regular (non-boss) enemy attacks
- **THEN** base damage is multiplied by `1 + combatsCleared * 0.05`

#### Scenario: Boss damage scaling
- **WHEN** a boss enemy attacks
- **THEN** base damage is multiplied by a flat 1.15

#### Scenario: Enemy HP scaling
- **WHEN** a regular enemy is instantiated
- **THEN** max HP is multiplied by `1 + combatsCleared * 0.10`. Boss HP is not scaled.

### Requirement: Multi-hit attacks

Some enemies deal damage across multiple separate hits, each resolving independently against block.

#### Scenario: Multi-hit intent
- **WHEN** an enemy intent has `hits > 1`
- **THEN** the per-hit damage is calculated once, then applied that many times. Each hit is absorbed by block independently.

### Requirement: Retaliate

The Retaliate modifier causes all incoming damage (including blocked portion) to be reflected back to the attacker.

#### Scenario: Retaliate active
- **WHEN** Retaliate is assigned to Torso and an enemy attacks
- **THEN** the total incoming damage (dealt + blocked) is dealt back to the attacker. Retaliate resets at the start of each execution phase.

### Requirement: Counter parts (Thorns, Voltage)

Parts can trigger counter-damage when the player takes damage.

#### Scenario: Thorns
- **WHEN** the player takes HP damage and has a Thorns part
- **THEN** flat thorns damage is dealt to the attacker

#### Scenario: Voltage Core
- **WHEN** the player blocks damage and has a Voltage Core part
- **THEN** the amount of block consumed is dealt as damage to the attacker

### Requirement: Win and loss conditions

#### Scenario: All enemies defeated
- **WHEN** every enemy's `isDefeated` is true
- **THEN** combat is won and proceeds to the reward phase

#### Scenario: Still defeated
- **WHEN** Still's health reaches 0
- **THEN** combat (and the run) is lost

### Requirement: Part drops are unique

Parts offered as combat rewards exclude parts the player already owns.

#### Scenario: Part already owned
- **WHEN** a part drop is resolved and the player already owns that part
- **THEN** that part is excluded from the drop pool and a different part or fallback reward is given
