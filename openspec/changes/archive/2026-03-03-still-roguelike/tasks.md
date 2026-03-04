## 1. Project Setup

- [x] 1.1 Initialize project with Vite + React + TypeScript (`npm create vite@latest still -- --template react-ts`)
- [x] 1.2 Install dependencies: Zustand, Immer, idb
- [x] 1.3 Set up folder structure: `src/game/`, `src/components/`, `src/data/`, `src/store/`
- [x] 1.4 Configure basic routing: Home (Workshop) and Run screens
- [x] 1.5 Set up localStorage and IndexedDB persistence layer (idb wrapper)

## 2. Game State Store

- [x] 2.1 Define core TypeScript types: Card, Part, Equipable, Enemy, Room, RunState, PermanentState
- [x] 2.2 Create Zustand run store: deck, hand, drawPile, discardPile, exhaustPile, health, energy, block, parts, equipables, shards
- [x] 2.3 Create Zustand permanent store: totalShards, workshopUpgrades, runHistory, fragmentsAccumulated
- [x] 2.4 Wire IndexedDB save/load for permanent store on app init and after each run
- [x] 2.5 Wire localStorage save/load for run state (resume interrupted runs)

## 3. Card System

- [x] 3.1 Define card data schema (id, name, type, cost, description, effects, keywords)
- [x] 3.2 Implement starting deck (5x Strike, 4x Brace, 1x Surge)
- [x] 3.3 Implement draw mechanic (draw pile → hand, with discard shuffle on empty)
- [x] 3.4 Implement card play mechanic (energy deduction, effect execution, move to discard/exhaust)
- [x] 3.5 Implement hand size limit (10 cards, burn overflow)
- [x] 3.6 Build Card component (renders name, cost, type, description)
- [x] 3.7 Build Hand component (displays playable cards during player turn)
- [x] 3.8 Create initial card pool: 30 cards across Attack/Skill/Power types for Act 1

## 4. Protagonist (Still)

- [x] 4.1 Implement Still's stat system (max health, current health, energy cap, current energy, block)
- [x] 4.2 Implement block reset at turn start
- [x] 4.3 Implement damage absorption (block before health)
- [x] 4.4 Implement parts data schema and passive effect application
- [x] 4.5 Implement equipable data schema (slots: Head, Torso, Arms, Legs), equip/unequip logic
- [x] 4.6 Build StillPanel component (shows health bar, energy pips, block value, equipped slots)
- [x] 4.7 Implement starting state for new run (base 70 HP, 3 energy, empty parts/equipables)

## 5. Enemy System

- [x] 5.1 Define enemy data schema (id, name, health, intentPattern, dropPool)
- [x] 5.2 Implement intent system (pattern cycling, display current intent)
- [x] 5.3 Implement enemy AI execution (apply intent on player end-turn)
- [x] 5.4 Build EnemyCard component (shows name, HP bar, intent icon + value)
- [x] 5.5 Create 10 Act 1 enemy types with distinct patterns and drop pools
- [x] 5.6 Implement drop resolution (enemy defeated → generate reward from drop pool)
- [x] 5.7 Create 3 Act 1 elite enemies (enhanced drops, multi-phase behavior)
- [x] 5.8 Create Act 1 boss (named, multi-phase, guaranteed rare reward)

## 6. Combat Loop

- [x] 6.1 Implement combat state machine: start → player turn → end turn → enemy turn → check win/loss → loop
- [x] 6.2 Implement player turn: draw cards, restore energy, enable card play
- [x] 6.3 Implement "End Turn" action: discard hand, trigger enemy intents
- [x] 6.4 Implement win condition: all enemies at 0 HP → combat end, show rewards
- [x] 6.5 Implement loss condition: Still at 0 HP → run end, save persistent rewards
- [x] 6.6 Build CombatScreen layout (Still panel left, enemies right, hand bottom, end turn button)
- [x] 6.7 Implement post-combat reward screen (choose 1 of 3 cards, or skip for shards)
- [x] 6.8 Add status effects system (Weak, Vulnerable, Strength, Dexterity) with combat resolution

## 7. Maze World

- [x] 7.1 Implement room graph generator (branching paths, ~15 rooms per act, guaranteed room type distribution)
- [x] 7.2 Implement room types: Combat, Rest, Shop, Event, Boss
- [x] 7.3 Build MapScreen component (shows branching graph, current position, fog on unseen rooms)
- [x] 7.4 Implement Rest room logic (heal 30% max HP or upgrade a card)
- [x] 7.5 Build card upgrade selection UI for rest rooms
- [x] 7.6 Implement Shop room (3 cards + 2 parts/equipables for purchase with shards)
- [x] 7.7 Create 5 Act 1 event vignettes with 2-3 choices and defined outcomes
- [x] 7.8 Implement fog of war (only show current room + adjacent next rooms)

## 8. Progression (Workshop)

- [x] 8.1 Build Workshop screen (home base between runs)
- [x] 8.2 Implement shard accumulation and display
- [x] 8.3 Create 5 initial Workshop upgrades (starting health, starting deck bonus, shard multiplier, fragment cap, starting equipable slot)
- [x] 8.4 Implement Workshop upgrade purchase flow
- [x] 8.5 Implement idle Fragment generation (calculate offline time on load, cap at 8 hours)
- [x] 8.6 Implement Fragment spend screen (pre-run bonuses)
- [x] 8.7 Implement run history log (store last 20 runs with act reached and closing message)
- [x] 8.8 Build RunHistory component in Workshop

## 9. Narrative Layer

- [x] 9.1 Write 20 run-end encouragement messages (10 defeat, 10 victory) for rotation
- [x] 9.2 Implement run-end screen with message display and Workshop return button
- [x] 9.3 Write Act 1 flavor text for event rooms (Still's internal monologue — disoriented, survival-focused)
- [x] 9.4 Write Act 2 flavor text for event rooms (Still noticing, beginning to wonder)
- [x] 9.5 Implement Grace's Workshop ambient lines (5 rotating phrases on return)
- [x] 9.6 Implement name discovery event room for Act 2 (Still finds "STILL" inscription)
- [x] 9.7 Implement post-discovery name usage in run-end messages and Workshop
- [x] 9.8 Create Yanah companion card (draw 2 + Inspired buff) as Workshop unlock
- [x] 9.9 Create Yuri companion card (heal small + remove 1 debuff) as Workshop unlock

## 10. Polish and MVP Readiness

- [x] 10.1 Add basic CSS styling — dark background, warm accent colors, readable card typography
- [x] 10.2 Implement simple animations: card play, damage number pop, health bar transition
- [x] 10.3 Add keyboard shortcuts (Enter = End Turn)
- [x] 10.4 Implement game over screen with run summary and "Still going?" prompt
- [ ] 10.5 Test full run loop end-to-end (start → combat rooms → boss → Workshop return)
- [x] 10.6 Balance pass: adjust card costs, enemy health, damage values for Act 1
- [ ] 10.7 Deploy to GitHub Pages (or equivalent static host)
- [ ] 10.8 Write a personal README — not technical docs, but the story of why this game exists
