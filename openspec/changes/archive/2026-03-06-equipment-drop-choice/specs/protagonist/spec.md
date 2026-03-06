## MODIFIED Requirements

### Requirement: Equipables system (active expression)
Still SHALL have four equipment slots (HEAD, TORSO, ARMS, LEGS) that generate automatic combat actions each turn. Each slot governs a specific domain. Equipping an item in a slot determines the specific action that slot produces.

#### Scenario: Equipping an item defines the slot's action
- **WHEN** the player equips an item into an equipment slot
- **THEN** that slot generates the equipped item's action each turn during combat

#### Scenario: Equipment drop into empty slot auto-equips
- **WHEN** an equipment item drops and the target slot is empty
- **THEN** the item is automatically equipped with no player interaction required

#### Scenario: Equipment drop into occupied slot prompts choice
- **WHEN** an equipment item drops and the target slot already has an item equipped
- **THEN** the player is shown a comparison overlay displaying the current item and the new item side-by-side, and SHALL choose to keep the current item or equip the new one

#### Scenario: Player keeps current equipment
- **WHEN** the player chooses "Keep Current" in the equipment comparison overlay
- **THEN** the current item remains equipped and the dropped item is discarded

#### Scenario: Player equips new equipment
- **WHEN** the player chooses "Equip New" in the equipment comparison overlay
- **THEN** the new item replaces the current item in the slot and the old item is discarded

#### Scenario: Empty slot produces no action
- **WHEN** an equipment slot has no item equipped
- **THEN** it produces no action during the execution phase and generates no Heat
