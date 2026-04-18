## ADDED Requirements

### Requirement: Battlefield layout

The combat screen SHALL display a vertical stacked layout that reads top-to-bottom, with the player's own stats near the top (next to the strain meter) so the player's eye doesn't have to jump between screen halves.

#### Scenario: Layout order
- **WHEN** combat is in the planning phase
- **THEN** the screen displays (top to bottom): strain meter, player card, enemy cards, action slots (pair A, pair B, solo), battle log, vent/execute controls

#### Scenario: Mobile fit
- **WHEN** displayed on a 375×667px screen
- **THEN** all elements are visible without scrolling

### Requirement: Player card

The player SHALL be represented as a visible entity card labeled "STILL" during combat.

#### Scenario: Player card display
- **WHEN** combat is active
- **THEN** the player card shows: "STILL" label, HP bar (proportional fill, green above 40% max HP, red below), current/max HP, and a block badge (shield icon + number, only when block > 0)

#### Scenario: Player takes damage
- **WHEN** an enemy deals damage to the player during replay
- **THEN** the player card's border flashes red and a red floating number appears on the card showing the damage amount

#### Scenario: Player gains block
- **WHEN** a block action fires during replay
- **THEN** the player card's border flashes blue and a blue floating number (+N) appears on the card

#### Scenario: Player heals
- **WHEN** a heal action fires during replay
- **THEN** the player card's border flashes green and a green floating number (+N) appears on the card

#### Scenario: Attack fully blocked
- **WHEN** an enemy attack is fully absorbed by block
- **THEN** a blue "BLOCKED" text appears on the player card

### Requirement: Enemy cards with per-enemy floats

Each enemy SHALL display as an individual card with damage numbers appearing on that specific card.

#### Scenario: Enemy card display
- **WHEN** combat is active
- **THEN** each alive enemy shows: name, HP bar with number, block (if any), next intent

#### Scenario: Enemy takes damage
- **WHEN** a player action deals damage to a specific enemy during replay
- **THEN** that enemy's card border flashes red and a red floating number (-N) appears on it

#### Scenario: Synergy damage to enemy
- **WHEN** a synergy effect deals damage to an enemy during replay
- **THEN** the enemy's card border flashes gold and a gold floating number (-N) appears on it

#### Scenario: Enemy targeting
- **WHEN** the player taps an enemy during planning
- **THEN** that enemy card is highlighted with a red border as the selected target

#### Scenario: Dying enemies stay visible until killing blow
- **WHEN** an enemy dies during execution
- **THEN** the enemy remains on screen during replay until the step that kills them plays through. It disappears only after its display HP reaches 0 in the replay.

### Requirement: Step-through execution replay

After the player confirms execution, combat events SHALL replay sequentially with active-entity highlighting so the player can follow the flow.

#### Scenario: Sequential playback
- **WHEN** a turn executes
- **THEN** combat events play back as a sequence with 1000ms delay between each step

#### Scenario: Active slot highlight
- **WHEN** a slot fires during replay
- **THEN** that slot is highlighted with a white glow/border so the player knows which action is resolving

#### Scenario: HP bars interpolate during replay
- **WHEN** replay is playing
- **THEN** player HP, block, and enemy HP bars display intermediate values at each step (computed from pre-execution state + events up to the current step), not the final post-execution values

#### Scenario: End screens wait for replay
- **WHEN** execution results in a win, forfeit, or death
- **THEN** the reward, forfeit, or death screen only appears after the full replay finishes, so the killing blow (or final event) animates before transitioning

#### Scenario: Controls disabled during replay
- **WHEN** replay is playing
- **THEN** push toggles, vent, execute, and enemy targeting are disabled so the player cannot input mid-animation

### Requirement: Floating number animation

Combat events SHALL be displayed as floating numbers attached to the affected entity's card.

#### Scenario: Float animation
- **WHEN** a floating number appears
- **THEN** it fades in, floats upward ~28px, and fades out over ~1 second

#### Scenario: Float colors
- **WHEN** floating numbers appear
- **THEN** player-dealt damage is red, healing is green, block is blue, synergy bonuses are gold, strain changes are orange, enemy damage to player is light red (#ff6b6b)

### Requirement: Compact action slots

Action slots SHALL display name, type, and value in a compact format that fits below the enemy row.

#### Scenario: Slot display
- **WHEN** the planning phase is active
- **THEN** each slot shows: type icon, action name, current value (base or pushed), push state via border color (orange when pushed, gray otherwise)

#### Scenario: Pair layout
- **WHEN** slots are displayed
- **THEN** Pair A (slots 1+2) and Pair B (slots 3+4) show as rows with synergy indicator between them. Solo slot (5) is centered below.

#### Scenario: Synergy indicator
- **WHEN** both slots in a pair are pushed and a synergy exists
- **THEN** the synergy name is displayed between the paired slots in gold

### Requirement: Battle log

A compact scrolling battle log SHALL appear between the action slots and controls, showing a text record of combat events that complements the floating numbers.

#### Scenario: Log display
- **WHEN** combat is active
- **THEN** a compact text log is visible between the action slots and the vent/execute controls, filling the flex space

#### Scenario: Log contents
- **WHEN** events occur during execution
- **THEN** the log shows entries for: slot fires (damage, block, heal, strain change), synergy activations (with damage/heal/strain values), enemy actions (damage dealt, damage blocked, block gained), and forfeit messages

#### Scenario: Empty state
- **WHEN** no combat events have occurred yet
- **THEN** the log shows "Waiting..." as a placeholder
