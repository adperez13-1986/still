## MODIFIED Requirements

### Requirement: Battlefield layout

The combat screen SHALL display one of two layouts based on viewport aspect: a portrait paper-doll layout when `aspect < 1` AND `width ≤ 600 px`, otherwise a landscape cinematic-stage layout.

#### Scenario: Portrait layout structure
- **WHEN** combat is in the planning phase on a portrait viewport (≤ 600 px wide, taller than wide)
- **THEN** the screen displays (top to bottom): a top toolbar with sector / round + segmented strain meter + plan pill, an `// INCOMING ×N` threat-grid header, a 2×2 grid of enemy cards, a 3-line battle log, a 3-column player zone (HAND on the left, BODY rig in the center, STATS rail on the right), and an action bar with hint + EXECUTE button

#### Scenario: Landscape layout structure
- **WHEN** combat is in the planning phase on a landscape viewport (any width when `width > height`, OR width > 600 px)
- **THEN** the screen displays a 2-column layout: a cinematic stage on the left (~70%) containing Still on the left edge of the stage and an enemy column on the right of the stage, with a stage HUD overlaid (sector / round / strain / plan pill); and a control deck on the right (~30%) containing a horizontal body slot row, a horizontal hand row, a TARGET card pinned bottom-left, and an EXECUTE button bottom-right

#### Scenario: Layout switches with rotation
- **WHEN** the viewport changes orientation (e.g. rotating a phone) crossing the portrait / landscape boundary
- **THEN** the layout updates within one render frame; combat state, replay progress, and selection state are preserved

#### Scenario: Sub-screens take over the viewport
- **WHEN** combat phase is `reward`, `forfeit`, or `finished`, OR equipment-conflict / part-replacement modals are active
- **THEN** the corresponding sub-view renders full-screen (existing behaviour); neither portrait nor landscape combat layout is shown

### Requirement: Player card

The player SHALL be visually represented during combat. The representation differs by layout: in portrait, Still appears as a faint silhouette behind the BODY rig with HP / BLK / EN displayed in the STATS rail; in landscape, Still appears as a sprite on the stage with HP / BLK / EN displayed as floating chips above the sprite.

#### Scenario: Portrait stats rail
- **WHEN** combat is active in portrait
- **THEN** the right column of the player zone shows three stacked pills (HP `current` of `max`, BLK `value` if > 0, EN `current` of `max`) and a small "D `<draw>` X `<exhaust>`" pile mini-readout below

#### Scenario: Portrait body silhouette
- **WHEN** combat is active in portrait
- **THEN** the center column of the player zone shows a faint Still sprite (opacity ≈ 0.10) with body slots positioned around it: HEAD top, ARMS left, TORSO center, LEGS bottom

#### Scenario: Landscape Still on stage
- **WHEN** combat is active in landscape
- **THEN** the left side of the stage shows the Still sprite (large pixel scale) with three floating chips above it (HP, BLK if > 0, EN), and a "STILL" label below the sprite

#### Scenario: Player damage numbers
- **WHEN** the player takes damage during replay in either layout
- **THEN** a red floating number appears anchored to whichever wrapper holds Still (BodyRig in portrait, StillStage in landscape); HP readouts update as replay interpolates

#### Scenario: Player block / heal numbers
- **WHEN** a block or heal action fires during replay in either layout
- **THEN** a blue (block) or green (heal) floating number appears anchored to Still's wrapper

### Requirement: Enemy cards with per-enemy floats

Each enemy SHALL display as an individual visual entity with damage numbers anchored to it. The visual differs by layout: portrait shows a 2×2 grid of compact cards (sprite + name + HP slice + intent chip + status badge), landscape shows depth-staggered chrome-less stage figures (sprite + intent chip overlay + thin HP slice).

#### Scenario: Portrait threat card content
- **WHEN** combat is active in portrait
- **THEN** each enemy card shows: small sprite (top-left), name with optional ELITE / BOSS color, thin HP bar with `current` / `max` numbers, intent chip (icon + value, e.g. "Atk 9 · Weak +1"), and a status badge below the card body (e.g. "VULN 2") if the enemy has any status effects

#### Scenario: Portrait threat card target highlight
- **WHEN** an enemy is the current target in portrait
- **THEN** its card has a yellow border, a yellow target pip in the top-right corner, and a yellow glow

#### Scenario: Landscape stage enemy chrome
- **WHEN** combat is active in landscape
- **THEN** each enemy renders as: an intent chip (icon + value + status dots) floating above the sprite, the sprite itself (depth-scaled), and a thin 36×3 px HP slice below the sprite (hidden when at 100% HP). No name, no border, no card background.

#### Scenario: Landscape depth stagger
- **WHEN** multiple enemies render in landscape
- **THEN** array index 0 is at the bottom of the column at full size; each subsequent index is positioned higher, with `--depth` increasing 0 / 0.30 / 0.60 / 0.90 (clamped at 0.9 for index 4+); the wrapper applies `transform: translateX(<jitter>) scale(1 - depth × 0.27)` and `filter: brightness(1 - depth × 0.15)`

#### Scenario: Landscape selected enemy
- **WHEN** an enemy is the current target in landscape
- **THEN** the sprite gets a yellow drop-shadow (`#f1c40f`, 6 px blur) and a small `▾` caret renders above its intent chip

#### Scenario: Defeated enemies stay visible until killing blow
- **WHEN** an enemy dies during execution (either layout)
- **THEN** the enemy remains in its position during replay until the step that kills them plays through; afterwards it stays at `opacity: 0.25 grayscale(1)` until the reward phase replaces the view

#### Scenario: Enemy targeting tap
- **WHEN** the player taps an enemy in either layout
- **THEN** that enemy becomes the target; the previously targeted enemy loses its highlight; the TARGET card (landscape) updates to the new enemy

### Requirement: Step-through execution replay

After the player confirms execution, combat events SHALL replay sequentially with active-entity highlighting in both layouts.

#### Scenario: Sequential playback
- **WHEN** a turn executes
- **THEN** combat events play back as a sequence with appropriate delay between steps (existing timing preserved)

#### Scenario: Active slot highlight (both layouts)
- **WHEN** a body slot fires during replay
- **THEN** in portrait, the corresponding slot in the BODY rig glows; in landscape, the corresponding slot cell in the body row glows. Same `activeSlot` state drives both.

#### Scenario: HP bar interpolation (both layouts)
- **WHEN** replay is playing
- **THEN** Still's HP and each enemy's HP read from `displayHealth` / `displayBlock` / `displayEnemyHealth` overrides (intermediate values), not the post-execution finals

#### Scenario: Replay disables controls
- **WHEN** replay is playing
- **THEN** push toggles, vent, execute, and enemy targeting are disabled

### Requirement: Floating number animation

Combat events SHALL animate as floating numbers anchored to the affected entity's wrapper in both layouts.

#### Scenario: Float animation
- **WHEN** a floating number appears
- **THEN** it fades in, floats upward, and fades out over ≈ 1 s

#### Scenario: Float colors
- **WHEN** floating numbers appear
- **THEN** player-dealt damage is red, healing is green, block is blue, strain changes are orange, enemy damage to player is light red, counter / synergy bonuses are gold

### Requirement: Battle log

A compact battle log SHALL show recent combat events in both layouts. In portrait it sits between the threat grid and the player zone; in landscape it appears as a small overlay on the stage (or is omitted — see scenarios).

#### Scenario: Portrait battle log
- **WHEN** combat is active in portrait
- **THEN** a 3-line battle log renders between the threat grid and the player zone, showing the 3 most-recent events with `R<round>` meta tags, actor names, and value highlights (red for damage, blue for block, green for heal)

#### Scenario: Landscape battle log
- **WHEN** combat is active in landscape
- **THEN** the battle log renders as a small text-only strip along the bottom edge of the cinematic stage (above the floor band) showing the 1–2 most-recent events, OR is omitted entirely if visual clutter outweighs informational value (decision deferred to playtest)

#### Scenario: Empty state
- **WHEN** no combat events have occurred yet
- **THEN** the log shows nothing (no placeholder text)

## ADDED Requirements

### Requirement: Layout selection hook

A `useScreenLayout()` React hook SHALL determine the active combat layout from viewport size and orientation, returning `'portrait'` or `'landscape'`.

#### Scenario: Portrait detection
- **WHEN** `window.innerWidth < window.innerHeight` AND `window.innerWidth ≤ 600 px`
- **THEN** the hook returns `'portrait'`

#### Scenario: Landscape default
- **WHEN** any other viewport (wide phones, phone in landscape, tablet, desktop)
- **THEN** the hook returns `'landscape'`

#### Scenario: Live updates
- **WHEN** the viewport size or orientation changes
- **THEN** the hook re-renders subscribers with the new value within one frame (uses `useSyncExternalStore` + `matchMedia` listener)

### Requirement: Combat top toolbar

A top toolbar SHALL display sector / round, a strain meter, and a phase pill in both layouts.

#### Scenario: Portrait toolbar
- **WHEN** the portrait layout renders
- **THEN** the top toolbar shows `SECTOR N · ROUND M` on the left, a segmented strain meter (4 segments visible; full bar represents `maxStrain`) in the center, and a `PLAN` pill on the right

#### Scenario: Landscape stage HUD
- **WHEN** the landscape layout renders
- **THEN** the same data renders inside the stage as floating overlays: `SECTOR N · ROUND M` top-left, slim strain bar top-center (220 px wide × 4 px tall), `PLAN` pill top-right

#### Scenario: Strain segment colours
- **WHEN** the strain meter renders
- **THEN** segments fill in at strain thresholds: 0–7 → low color (`#636e72`), 8–14 → mid color (`#e67e22`), 15+ → high color (`#e74c3c`)

### Requirement: Portrait paper-doll body rig

The portrait layout's center column SHALL render a Still silhouette with body slots positioned around it.

#### Scenario: Silhouette
- **WHEN** the BODY rig renders
- **THEN** a faint Still sprite (`opacity ≈ 0.10`, `pixelSize` matching the rig height) sits centered behind the slot cells

#### Scenario: Slot positions
- **WHEN** the BODY rig renders 4 slots
- **THEN** HEAD anchors at top center, ARMS anchors at left mid-height, TORSO anchors at center, LEGS anchors at bottom center; each cell shows the slot label, equipment name, action summary, and an optional modifier pip if a modifier is assigned

#### Scenario: Slot tap to assign
- **WHEN** the player has selected a card and taps a body slot in the rig
- **THEN** the card is assigned to that slot via the existing `playCard` flow (with optional push)

#### Scenario: Slot active highlight during replay
- **WHEN** a slot fires during replay
- **THEN** that slot's cell in the rig flashes (border + glow) for the duration of the event

### Requirement: Landscape control deck

The landscape layout's right panel SHALL contain a horizontal body slot row, a horizontal hand row, a target card, and an execute button.

#### Scenario: Body row
- **WHEN** the control deck renders
- **THEN** a `// BODY · 4 SLOTS` header sits above a horizontal row of 4 cells (HEAD / TORSO / ARMS / LEGS), each cell showing label + equip name + action summary + optional modifier pip

#### Scenario: Hand row
- **WHEN** the control deck renders
- **THEN** a `// HAND · N · D# · X#` header sits above a horizontal row of card buttons (each showing name + cost + short description + tag); the row scrolls horizontally if it overflows

#### Scenario: Target card
- **WHEN** an enemy is currently targeted
- **THEN** the TARGET card pinned bottom-left of the panel shows the enemy name, `HP <current>/<max>`, and any relevant modifier (e.g. `VULN ×1.5` from status effects)

#### Scenario: Target card empty state
- **WHEN** no enemy is targeted (or the targeted enemy is defeated)
- **THEN** the TARGET card shows "TARGET — pick an enemy" with no other detail

#### Scenario: Execute button
- **WHEN** the control deck renders during planning
- **THEN** the EXECUTE button (red/orange) sits bottom-right with "END PLANNING" subtext; tapping it triggers the existing `executeTurn` flow

#### Scenario: Execute disabled during replay
- **WHEN** replay is in progress
- **THEN** the EXECUTE button is disabled and visually muted

### Requirement: Push toggle on cards

Cards with `pushCost` SHALL render a push indicator inside the card cell, allowing the player to toggle push state before assigning the card to a slot.

#### Scenario: Push indicator visible
- **WHEN** a card with `pushCost` set renders in HAND (either layout)
- **THEN** the card cell shows a small `PUSH +Ns` indicator (orange when off, filled when on)

#### Scenario: Push toggle
- **WHEN** the player taps the push indicator on a selected pushable card
- **THEN** the card's pushed flag toggles; subsequent slot assignment uses the toggled value

#### Scenario: Push disabled at strain cap
- **WHEN** `combat.strain + card.pushCost ≥ maxStrain`
- **THEN** the push indicator renders dimmed and the toggle is disabled
