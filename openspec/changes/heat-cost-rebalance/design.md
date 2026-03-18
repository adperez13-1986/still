## Context

Cards currently cost 1 heat each. Playing 5 cards = heat 5 (Warm). This means heat doesn't meaningfully limit card play — you can play nearly everything every turn. The system-cards-to-slots change gave every slot a purpose, but slots feel dead because there's no pressure to use them all and no cost to ignoring them.

## Goals / Non-Goals

**Goals:**
- 2 heat base cost makes every card play a meaningful commitment
- Upgraded/found cards at 1 heat feel rewarding (efficiency gain)
- S1 enemies attack frequently enough that TORSO block is required most turns
- Cool Runner plays 2 cards + cooling per turn (active, not idle)
- Pyromaniac plays 4 cards per turn at real risk (Hot, -3 HP)

**Non-Goals:**
- Changing heat thresholds (Cool 0-3, Warm 4-6, Hot 7-9 stay as-is)
- Adding new cards
- Changing equipment stats
- Changing part effects

## Decisions

### Card heat cost mapping

| Category | Base Cost | Upgraded Cost | Rationale |
|----------|-----------|---------------|-----------|
| **Starter slot modifiers** (Boost, Echo Protocol, Emergency Strike, Emergency Shield) | 2 | 1 | Baseline. Upgrading = efficiency. |
| **S1 slot modifiers** (Overcharge, Spread Shot, Shield Bash) | 2 | 1 | Same tier as starters but found, not given. |
| **S2 slot modifiers** (Reroute, Cascade, Resonance) | 3 | 2 | Premium, requires commitment. |
| **HEAD system cards** (Diagnostics, Quick Scan, Cold Efficiency, Heat Surge, Thermal Surge, Overclock, Target Lock) | 2 | 1 | Standard system play cost. |
| **LEGS system cards** (Coolant Flush, Deep Freeze, Heat Vent, Thermal Flux, Thermal Equilibrium, Salvage Burst) | Negative (cooling) | More negative | Adjusted proportionally. |
| **ARMS system cards** (Meltdown, Reckless Charge, Precision Strike, Glacier Lance, Flux Spike, Fuel the Fire, Controlled Burn) | 2-3 | 1-2 | Offensive burst, some premium. |
| **TORSO system cards** (Field Repair, Failsafe Protocol, Armor Protocol) | 2 | 1 | Standard system play cost. |
| **Companion cards** (Yanah, Yuri) | 1 | 1 | Companions are efficient by design. |

### Specific card heat costs

**Starter deck (8 cards):**
| Card | Current | New Base | New Upgraded |
|------|---------|----------|-------------|
| Boost | 1 | 2 | 1 |
| Echo Protocol | 2 | 2 | 1 |
| Emergency Strike | 2 | 2 | 1 |
| Emergency Shield | 1 | 2 | 1 |
| Coolant Flush | -3 | -4 | -5 |
| Diagnostics | 1 | 2 | 1 |

**S1 slot modifiers:**
| Card | Current | New Base | New Upgraded |
|------|---------|----------|-------------|
| Overcharge | 2 | 3 | 2 |
| Spread Shot | 1 | 2 | 1 |
| Shield Bash | 1 | 2 | 1 |

**S1 HEAD system cards:**
| Card | Current | New Base | New Upgraded |
|------|---------|----------|-------------|
| Quick Scan | 1 | 2 | 1 |
| Thermal Surge | 2 | 3 | 2 |
| Overclock | 1 | 2 | 1 |
| Target Lock | 0 | 1 | 0 |
| Cold Efficiency | 1 | 2 | 1 |
| Heat Surge | 1 | 2 | 1 |

**S1 LEGS system cards (cooling):**
| Card | Current | New Base | New Upgraded |
|------|---------|----------|-------------|
| Deep Freeze | -5 | -6 | -7 |
| Heat Vent | -2 | -3 | -4 |

**S1 ARMS system cards:**
| Card | Current | New Base | New Upgraded |
|------|---------|----------|-------------|
| Meltdown | 0 | 1 | 0 |
| Precision Strike | 1 | 2 | 1 |
| Reckless Charge | 3 | 4 | 3 |
| Fuel the Fire | 1 | 2 | 1 |

**S1 TORSO system cards:**
| Card | Current | New Base | New Upgraded |
|------|---------|----------|-------------|
| Field Repair | -1 | -2 | -3 |

**S2 cards:**
| Card | Current | New Base | New Upgraded |
|------|---------|----------|-------------|
| Reroute | 1 | 2 | 1 |
| Cascade | 4 | 5 | 4 |
| Resonance | 3 | 4 | 3 |
| Glacier Lance | 1 | 2 | 1 |
| Controlled Burn | 2 | 3 | 2 |
| Flux Spike | 0 | 1 | 0 |
| Thermal Equilibrium | -3 | -4 | -5 |
| Failsafe Protocol | 1 | 2 | 1 |
| Armor Protocol | 1 | 2 | 1 |
| Salvage Burst | -1 | -2 | -3 |
| Thermal Flux | -2 | -3 | -4 |

**Companions:**
| Card | Current | New Base | New Upgraded |
|------|---------|----------|-------------|
| Yanah | 0 | 1 | 0 |
| Yuri | 1 | 2 | 1 |

### Enemy aggression rework

Target: S1 standard enemies attack on at least 2 of every 3 turns.

| Enemy | Current Pattern | New Pattern |
|-------|----------------|-------------|
| Rust Guard | Block, Attack | Attack, Attack, Block |
| Glitch Node | Buff, Buff, Attack | Buff, Attack, Attack |
| Sentinel Shard | Block, Block, Attack | Block, Attack, Attack |
| Hollow Repeater | Buff, Attack(3hit), Block | Buff, Attack(3hit), Attack |
| Echo Construct | Block, Attack, Debuff, Attack | Attack, Attack, Debuff, Attack |

Other S1 enemies already have 2/3+ attack ratio — no changes needed.

### Damage scaling reduction

Reduce from 8% to 5% per combat cleared. With enemies attacking more often, total damage output per combat is higher even with lower scaling. This prevents late-S1 elites from being impossible while keeping early combats threatening.

## Risks / Trade-offs

- **Early game difficulty spike** — 2 heat per card + more enemy attacks is a double nerf to players. → Mitigation: starting Coolant Flush at -4 (up from -3) gives more cooling budget. LEGS equipment cools every turn.
- **Cool Runner at 2 plays per turn may feel slow** — → But each play is now a real commitment with real impact. Quality over quantity.
- **Upgrades become much more valuable** — going from 2 heat to 1 heat is a 50% cost reduction. This is intended — rest room upgrades should feel impactful.
