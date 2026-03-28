## ADDED Requirements

### Requirement: Self-damage from modifier cards

Some slot modifiers deal damage to the player as a cost during execution.

#### Scenario: Self-damage resolved during slot execution
- **WHEN** a slot with a self-damage modifier fires
- **THEN** the player loses the specified HP after the slot's action resolves. This damage is NOT blocked.

### Requirement: Slot self-disable from modifier cards

Some modifiers disable the assigned slot for the next turn as a cost.

#### Scenario: Slot disabled by Overclock Slot
- **WHEN** a slot fires with Overclock Slot
- **THEN** that slot is added to `disabledSlots` at end of execution (persists to next turn, cleared on following enemy turn as normal)

### Requirement: Burnout permanent combat effect

#### Scenario: Burnout triggers each turn
- **WHEN** `burnoutActive` is true and a new turn starts
- **THEN** the player loses 3 HP and gains 2 Strength before cards are drawn

### Requirement: Shutdown slot disable and energy gain

#### Scenario: Shutdown targets a player slot
- **WHEN** Shutdown is played targeting a body slot
- **THEN** the slot is immediately disabled for the current turn and the player gains 3 energy. The slot's equipment does not fire this turn.

### Requirement: Volatile Armor block-break damage

#### Scenario: Enemy attack consumes player block with Volatile Armor active
- **WHEN** an enemy attacks and block absorbs some damage while Volatile Armor is active on Torso
- **THEN** the amount of block consumed is dealt as damage to the attacking enemy, independent of Retaliate/Thorns/Voltage

### Requirement: Absorb block-to-heal conversion

#### Scenario: Block gained with Absorb active
- **WHEN** all block sources have been applied during a turn where Absorb is active
- **THEN** the player heals HP equal to 50% of total block gained this turn (floored), capped at max HP
