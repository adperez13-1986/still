## ADDED Requirements

### Requirement: Execution phase plays step by step
When the player clicks Execute, body slot actions SHALL fire visually one at a time with a pause between each, rather than all resolving instantly.

#### Scenario: Body slots fire sequentially
- **WHEN** the player clicks Execute
- **THEN** each body slot (HEAD, TORSO, ARMS, LEGS) SHALL highlight and show its result one at a time with approximately 400ms between each

#### Scenario: Active slot is highlighted
- **WHEN** a body slot fires during the execution sequence
- **THEN** that slot SHALL be visually highlighted (bright border) while the others are dimmed

#### Scenario: Skipped slots are not shown
- **WHEN** a body slot has no equipment and no modifier
- **THEN** it SHALL be skipped in the execution sequence (no pause for empty slots)

### Requirement: Enemy actions play sequentially
After body slot execution completes, each enemy's action SHALL play one at a time.

#### Scenario: Enemies act in order
- **WHEN** the body slot execution sequence finishes
- **THEN** each surviving enemy SHALL visually execute its intent one at a time with approximately 350ms between each

#### Scenario: Enemy damage is shown
- **WHEN** an enemy deals damage during its action
- **THEN** a damage number SHALL appear near Still's health display

### Requirement: Floating damage numbers
Damage, block, and healing values SHALL appear as floating numbers that animate and fade out.

#### Scenario: Damage number on enemy
- **WHEN** a body slot deals damage to an enemy
- **THEN** a red number SHALL appear near the enemy and animate upward while fading out

#### Scenario: Block number on Still
- **WHEN** a body slot grants block to Still
- **THEN** a blue number SHALL appear near Still's panel and animate upward while fading out

#### Scenario: Heal number on Still
- **WHEN** healing occurs
- **THEN** a green number SHALL appear and animate upward while fading out

#### Scenario: Numbers fade within 600ms
- **WHEN** a floating number appears
- **THEN** it SHALL fully fade out within 600ms

### Requirement: Screen flash on damage taken
When Still takes damage from an enemy, a brief visual flash SHALL indicate the hit.

#### Scenario: Red flash on enemy hit
- **WHEN** an enemy deals damage to Still during the enemy action sequence
- **THEN** a brief red overlay SHALL flash across the screen (200ms duration)

### Requirement: Smooth value transitions
Health bars, block displays, and the heat gauge SHALL animate smoothly when values change, rather than jumping instantly.

#### Scenario: Health bar animates
- **WHEN** Still's health changes
- **THEN** the health bar width SHALL transition smoothly over 300ms

#### Scenario: Enemy health bar animates
- **WHEN** an enemy's health changes
- **THEN** the enemy health bar width SHALL transition smoothly over 300ms

#### Scenario: Heat gauge animates
- **WHEN** the heat level changes
- **THEN** the heat gauge SHALL transition smoothly over 300ms

### Requirement: Input blocked during animation
Player input SHALL be disabled while the execution and enemy action sequences are playing.

#### Scenario: Cannot play cards during execution
- **WHEN** the execution sequence is playing
- **THEN** card interactions and the Execute button SHALL be disabled

#### Scenario: Input re-enables after sequence
- **WHEN** the full sequence (body slots + enemies + end-of-turn) completes
- **THEN** the planning phase begins and all inputs re-enable
