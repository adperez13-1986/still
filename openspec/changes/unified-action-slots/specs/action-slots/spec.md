## ADDED Requirements

### Requirement: Unified action slot system

All combat actions (damage, block, heal, utility) SHALL occupy the same type of slot. There are 5 slots arranged as 2 linked pairs + 1 solo.

#### Scenario: Slot layout
- **WHEN** combat begins
- **THEN** the player has 5 action slots: Pair A (slot 1 + slot 2), Pair B (slot 3 + slot 4), Solo (slot 5)

#### Scenario: Starting loadout
- **WHEN** a new run begins
- **THEN** the slots are: [Strike]──[Shield], [Barrage]──[Vent], [empty]

#### Scenario: All actions fire every turn
- **WHEN** the execution phase begins
- **THEN** all non-empty slots fire in order (slot 1 through 5). Unpushed slots fire at base value. Pushed slots fire at pushed value.

#### Scenario: Vent is special
- **WHEN** Vent occupies a slot
- **THEN** Vent cannot be pushed. When active (toggled on), all OTHER damage slots are skipped. Vent recovers 4 strain. Vent counts as using that slot for the turn.

### Requirement: Push cost per slot

Each slot push costs 1 strain. Pushing both slots in a linked pair costs 3 strain (1+1+1 link tax).

#### Scenario: Single push in a pair
- **WHEN** the player pushes one slot in a pair and leaves the other unpushed
- **THEN** strain increases by 1. The pushed slot fires at pushed value. The link is dormant.

#### Scenario: Both pushed in a pair (link activated)
- **WHEN** the player pushes both slots in a linked pair
- **THEN** strain increases by 3 (1+1+1). Both slots fire at pushed values. The pair's synergy effect activates.

#### Scenario: Solo slot push
- **WHEN** the player pushes the solo slot
- **THEN** strain increases by 1. No link involved.

### Requirement: Slot rearrangement between fights

The player SHALL rearrange actions between slot positions on the map screen, at no cost.

#### Scenario: Rearrange actions
- **WHEN** the player is on the map (not in combat)
- **THEN** they can drag actions between slot positions to change pair compositions

#### Scenario: Synergy preview
- **WHEN** the player moves an action to a new pair position
- **THEN** the UI shows a preview of the synergy that pair would create

#### Scenario: No cost to rearrange
- **WHEN** the player rearranges slots
- **THEN** no strain, HP, or other cost is incurred
