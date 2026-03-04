## ADDED Requirements

### Requirement: Three-act narrative arc across runs
The game's narrative SHALL deepen across acts within each run, following the arc: survive → notice → search. The robot Still does not begin with purpose — purpose emerges through persistence.

#### Scenario: Act 1 narrative tone — Survive
- **WHEN** the player is in Act 1
- **THEN** Still's internal monologue (brief flavor text in event rooms and on rest screens) reflects disorientation and pure survival instinct — no questions yet, just movement

#### Scenario: Act 2 narrative tone — Notice
- **WHEN** the player reaches Act 2
- **THEN** Still begins to observe: noting patterns in the maze, wondering about the enemies it meets, asking small questions about its own construction

#### Scenario: Act 3 narrative tone — Search
- **WHEN** the player reaches Act 3
- **THEN** Still moves with intention — not certainty, but direction — and narrative moments reflect a growing sense of something worth moving toward

### Requirement: Run-end encouragement message
Every run SHALL end with a personal, non-judgmental message to the player — regardless of whether they won or lost. The message SHALL affirm that showing up was valuable.

#### Scenario: Run ends in defeat
- **WHEN** Still is defeated
- **THEN** the defeat screen shows a message such as: "You kept going. That's not nothing. Try again?" — never a score shaming the player

#### Scenario: Run ends in victory
- **WHEN** Still clears the final act
- **THEN** the victory screen shows a message of quiet pride: "You made it further than you thought you could. You always do." with an option to continue to deeper acts or return to the Workshop

#### Scenario: Messages vary across runs
- **WHEN** the player completes multiple runs
- **THEN** the encouragement messages rotate through a curated set of distinct phrases so they remain meaningful and don't feel repeated

### Requirement: Grace as a navigational presence
Grace SHALL appear as a subtle, warm presence in the game — not an NPC to interact with, but a feeling. She is the Workshop's ambient voice, the light that orients Still when the maze is darkest.

#### Scenario: Grace's presence in the Workshop
- **WHEN** the player returns to the Workshop
- **THEN** a brief ambient line attributed to Grace appears — a quiet word of orientation, not instruction (e.g., "You're back. That's enough.")

#### Scenario: Grace as compass mechanic
- **WHEN** Still has been in the maze for several rooms without a rest room
- **THEN** a faint warmth indicator (named "Grace signal" internally) guides the player toward the nearest rest room on the map

### Requirement: Yanah and Yuri as run companions (optional)
Yanah and Yuri SHALL be unlockable companion cards or passive presences that can appear during runs. They do not fight — they encourage. Their presence in the run represents what Still is moving for.

#### Scenario: Yanah companion card
- **WHEN** the player has a Yanah companion card in their deck
- **THEN** once per combat, playing Yanah draws 2 cards and adds a status effect "Inspired" (+1 energy next turn) — representing the energy a child's joy can give

#### Scenario: Yuri companion card
- **WHEN** the player has a Yuri companion card in their deck
- **THEN** playing Yuri restores a small amount of health and removes one debuff — representing quiet resilience

#### Scenario: Unlocking companion cards
- **WHEN** the player reaches certain Workshop milestones
- **THEN** Yanah and Yuri companion cards are permanently unlocked and may appear in card reward pools during future runs

### Requirement: Still's name is earned, not given
The game SHALL never announce Still's name in a title card or tutorial. The player discovers the name through the narrative — a moment in Act 2 where Still finds a fragment of text that simply reads its name.

#### Scenario: Name discovery moment
- **WHEN** Still enters a specific event room in Act 2
- **THEN** a narrative moment plays: Still finds a salvaged piece of itself with the word "STILL" inscribed — the first time the player sees the name in-world

#### Scenario: Post-discovery
- **WHEN** the name has been discovered
- **THEN** the Workshop and run-end screens begin referring to the robot by name in their messages
