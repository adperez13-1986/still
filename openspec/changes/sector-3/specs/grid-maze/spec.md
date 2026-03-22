## ADDED Requirements

### Requirement: Map generation supports Sector 3
The maze generator SHALL accept sector 3 as a valid input and produce a maze with the same structure as sectors 1 and 2.

#### Scenario: Sector 3 maze generation
- **WHEN** `generateGridMaze(3)` is called
- **THEN** a 7×7 grid maze is generated with 8-10 combat rooms, rest rooms, shop rooms, event rooms, and a boss room

#### Scenario: Sector 3 room types
- **WHEN** a Sector 3 maze is generated
- **THEN** room distribution follows the same rules as sectors 1 and 2 (boss at farthest point, rest/shop/event at dead ends and junctions, combat on remaining tiles)
