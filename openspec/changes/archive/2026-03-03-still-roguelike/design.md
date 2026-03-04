## Context

**Still** is a personal passion project — a roguelike deckbuilder with idle/incremental elements built by a web developer with 19 years of experience in CRUD applications. The developer's background is TypeScript/web, not game engines or C++. The game's emotional core is more important than technical sophistication: it must feel encouraging, personal, and replayable.

Key constraints:
- Solo developer, part-time
- Web-first (browser playable, no install required)
- No prior game engine experience required
- Art should start minimal — shape-based or simple sprites; soul over polish
- The game must be shippable in iterations — MVP first, depth added over time

## Goals / Non-Goals

**Goals:**
- A playable roguelike loop: enter maze, encounter enemies, collect parts/cards, reach end or die, persist some progress
- Turn-based combat with a card hand + equipped parts system
- Persistent idle progression layer that rewards showing up over time
- A narrative emotional arc across runs (survive → notice → search)
- Run-end messages that are encouraging regardless of outcome
- Web-based, deployable to a static host

**Non-Goals:**
- Real-time action or physics
- Multiplayer
- Complex 3D graphics or animation
- Full narrative voice acting or cutscenes
- Mobile-native app (web responsive is fine)
- Monetization (this is a soul project)

## Decisions

### Technology Stack: TypeScript + React

**Decision**: Build with TypeScript and React for UI/game rendering.

**Rationale**: The developer has 19 years of web development. A roguelike deckbuilder is fundamentally a state management problem — cards, deck, health, run state — which maps naturally to React component trees and immutable state patterns. No need to learn a new paradigm.

**Alternatives considered**:
- **Phaser.js**: Mature game framework, good for 2D canvas games. Rejected because it adds complexity for a UI-heavy card game that doesn't need sprite physics.
- **Godot**: Excellent free engine with GDScript. Rejected for MVP due to learning curve — can revisit if canvas performance becomes an issue later.
- **Vanilla TS + Canvas**: Full control, but reinventing too many wheels. React gives component reuse without framework overhead.

### State Management: Zustand + Immer

**Decision**: Use Zustand for game state with Immer for immutable updates.

**Rationale**: Game state (deck, hand, health, maze position, run flags) needs to be reactive and predictable. Zustand is lightweight and doesn't require Redux boilerplate. Immer lets you write mutations that stay immutable — natural for game logic.

### Persistence: localStorage (run state) + IndexedDB (permanent progression)

**Decision**: Two persistence tiers.
- `localStorage`: Current run state (deck, position, health). Lost on browser clear — acceptable for a run.
- `IndexedDB` (via `idb` library): Permanent progression — persistent currency, unlocked parts, workshop upgrades, run history.

**Rationale**: Keeps implementation simple. No backend required. The game is single-player and local-first.

### Maze Generation: Simple Room Graph

**Decision**: Represent the maze as a directed graph of rooms, not a literal rendered maze.

**Rationale**: Slay the Spire's map model (branching paths, room icons, clear choices) gives the "maze feel" without complex pathfinding. The robot is "in a maze" emotionally — the UI can evoke that with atmosphere and fog-of-war, not literal corridor rendering.

### Art Style: Text-Heavy + Minimal Shapes (MVP)

**Decision**: Start with CSS-styled cards, shape-based robot/enemy representations, and strong typography. Art can be added iteratively.

**Rationale**: The game's value is in its systems and soul. A beautiful card layout with no art is better than an unplayable game waiting for sprites. Placeholder art keeps momentum.

### Card + Parts Duality

**Decision**: Two distinct systems — Cards (what Still *does*) and Parts (what Still *is*).
- **Cards**: drawn from deck, played for energy cost, have immediate combat effects
- **Parts**: equipped in slots, always active, modify stats and unlock passive behaviors

**Rationale**: This mirrors the philosophical distinction between identity (formed by experience) and agency (expressed by choice). Parts are given by the journey; cards are wielded intentionally.

## Risks / Trade-offs

- **Scope creep** → Mitigation: Define and ship a tight MVP (one act, ~10 enemy types, ~30 cards) before adding depth
- **Game balance** → Mitigation: Start with fixed, hand-tuned values; add randomization gradually; keep a balance spreadsheet
- **Art bottleneck** → Mitigation: Commit to shape/text art for v1; never block shipping on art
- **Idle layer complexity** → Mitigation: Idle layer starts as "workshop generates 1 resource/hour"; complexity added in later iterations
- **Narrative thin in MVP** → Mitigation: The run-end message system is high-value, low-effort — implement this first

## Open Questions

- What build tool? (Vite is recommended — fast, TypeScript-native)
- Hosting target? (GitHub Pages is simplest for a personal project)
- Does the robot Still have a visual form in MVP, or just a named card display?
- Should Yanah and Yuri appear as collectible companion cards, or as passive narrative echoes between runs?
