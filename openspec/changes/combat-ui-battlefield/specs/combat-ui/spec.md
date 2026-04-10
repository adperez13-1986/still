## ADDED Requirements

### Requirement: Battlefield layout

The combat screen SHALL display a vertical battlefield with enemies at top, player card in the middle, and action controls at bottom.

#### Scenario: Layout order
- **WHEN** combat is in the planning phase
- **THEN** the screen displays (top to bottom): strain meter, enemy cards, player card, action slots, vent/execute buttons

#### Scenario: Mobile fit
- **WHEN** displayed on a 375×667px screen
- **THEN** all elements are visible without scrolling

### Requirement: Player card

The player SHALL be represented as a visible entity card during combat.

#### Scenario: Player card display
- **WHEN** combat is active
- **THEN** a centered card shows: HP bar (with current/max number), block badge (shield icon + number, only when block > 0)

#### Scenario: Player takes damage
- **WHEN** an enemy deals damage to the player
- **THEN** a red floating number appears on the player card showing the damage amount

#### Scenario: Player gains block
- **WHEN** a block action fires
- **THEN** a blue floating number appears on the player card

#### Scenario: Player heals
- **WHEN** a heal action fires
- **THEN** a green floating number appears on the player card

#### Scenario: Attack fully blocked
- **WHEN** an enemy attack is fully absorbed by block
- **THEN** a blue "BLOCKED" text appears on the player card

### Requirement: Enemy cards with per-enemy floats

Each enemy SHALL display as an individual card with damage numbers appearing on that specific card.

#### Scenario: Enemy card display
- **WHEN** combat is active
- **THEN** each alive enemy shows: name, HP bar with number, block (if any), next intent

#### Scenario: Enemy takes damage
- **WHEN** a player action deals damage to a specific enemy
- **THEN** a red floating number appears on that enemy's card

#### Scenario: Synergy damage to enemy
- **WHEN** a synergy effect deals damage to an enemy
- **THEN** a gold floating number appears on that enemy's card

#### Scenario: Enemy targeting
- **WHEN** the player taps an enemy during planning
- **THEN** that enemy card is highlighted as the selected target

### Requirement: Floating number animation

Combat events SHALL be displayed as floating numbers on the relevant entity, played sequentially.

#### Scenario: Sequential playback
- **WHEN** a turn executes
- **THEN** combat events appear as floating numbers with 500ms delay between each event

#### Scenario: Float animation
- **WHEN** a floating number appears
- **THEN** it fades in, floats upward ~28px, and fades out over ~1 second

#### Scenario: Float colors
- **WHEN** floating numbers appear
- **THEN** damage is red, healing is green, block is blue, synergy bonuses are gold, strain changes are orange

### Requirement: Compact action slots

Action slots SHALL display name, type, and value in a compact format that fits below the player card.

#### Scenario: Slot display
- **WHEN** the planning phase is active
- **THEN** each slot shows: type icon, action name, current value (base or pushed), push state via border color

#### Scenario: Pair layout
- **WHEN** slots are displayed
- **THEN** Pair A (slots 1+2) and Pair B (slots 3+4) show as rows with synergy indicator between them. Solo slot (5) is centered below.

#### Scenario: Synergy indicator
- **WHEN** both slots in a pair are pushed and a synergy exists
- **THEN** the synergy name is displayed between the paired slots

### Requirement: Combat log removed

The text-based combat log SHALL be removed from the combat screen. Floating numbers on entity cards replace it.

#### Scenario: No combat log
- **WHEN** combat is active
- **THEN** there is no scrolling text log visible on screen
