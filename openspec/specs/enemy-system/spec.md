## ADDED Requirements

### Requirement: Every enemy drops something valuable
In keeping with the game's philosophy, no encounter SHALL be wasted. Every defeated enemy drops at least one reward — a card, a part fragment, or shards. The player is always better for having fought.

#### Scenario: Enemy defeated drops reward
- **WHEN** an enemy is defeated
- **THEN** its designated drop (card pool, part fragment, or shard amount) is added to the post-combat reward screen

#### Scenario: Enemies with rare drops
- **WHEN** a rare or elite enemy is defeated
- **THEN** it drops from an enhanced pool with higher-quality parts or cards not available from standard enemies

### Requirement: Enemy intent system
Enemies SHALL telegraph their intended action each round. The player can always see what an enemy plans to do before deciding how to act.

#### Scenario: Intent displayed before player acts
- **WHEN** a new combat round begins
- **THEN** each enemy shows an icon and numeric value indicating their planned action (e.g., sword icon + "9" for Attack 9, shield icon + "6" for Block 6)

#### Scenario: Intent changes based on AI pattern
- **WHEN** an enemy follows a pattern (e.g., attack twice then block)
- **THEN** the intent updates each round to reflect the next step in the pattern

### Requirement: Enemy behavior is rule-based, not random
Enemy behavior SHALL follow deterministic or semi-deterministic patterns. Players who understand an enemy's pattern can plan accordingly, rewarding learning across runs.

#### Scenario: Learning an enemy pattern
- **WHEN** a player has faced an enemy type multiple times
- **THEN** they can anticipate its attack/block cycle and plan their turns accordingly

#### Scenario: Elite enemies have multi-phase behavior
- **WHEN** an elite enemy's health crosses a threshold
- **THEN** it changes its behavior pattern, potentially gaining new abilities or increased stats

### Requirement: Enemy types scale with acts
Enemy types and difficulty SHALL scale across acts, reflecting the narrative arc. Act 1 enemies are basic. Act 2 enemies introduce complexity. Act 3 enemies challenge the player's full build.

#### Scenario: Act 1 enemy simplicity
- **WHEN** Still encounters an Act 1 enemy
- **THEN** the enemy has simple 1-2 step patterns, moderate health, and clear intent

#### Scenario: Act 3 enemy complexity
- **WHEN** Still encounters an Act 3 enemy
- **THEN** the enemy has multi-step patterns, high health or defense, and potentially multiple intents per round

### Requirement: Boss enemies are named and memorable
Each act SHALL end with a unique named boss. Bosses have distinct visual identities, multi-phase patterns, and special reward drops.

#### Scenario: Boss encounter begins
- **WHEN** Still enters a boss room
- **THEN** the boss is introduced with a name and brief flavor text before combat begins

#### Scenario: Boss defeated
- **WHEN** a boss is defeated
- **THEN** the player receives a guaranteed high-quality reward (a rare part, rare card, or special equipable) and the act is marked complete
