Set up a playtesting session for Still.

## Debug URLs
Remind the user of available debug presets that start in Sector 2 with archetype-specific builds:

| Archetype | URL | Equipment |
|-----------|-----|-----------|
| Cool Runner | `/run?debug=cool` | Cryo Cannon, Predictive Array, Cryo Shell, Cryo Lock |
| Pyromaniac | `/run?debug=hot` | Meltdown Cannon, Pyroclast Scanner, Heat Shield, Thermal Exhaust |
| Warm Surfer | `/run?debug=warm` | Arc Welder, Tactical Visor, Ablative Plates, Stabilizer Treads |
| Generic | `/run?debug=s2` | Mixed build |

## Playtesting Checklist
Based on the argument (archetype or "all"), generate a focused checklist:

- **Heat feel**: Does staying in your target zone feel like an achievement or effortless?
- **Card decisions**: Are you making meaningful choices about which cards to play vs hold?
- **Equipment payoff**: Do conditional bonuses feel earned and impactful?
- **Turn rhythm**: Does each turn have a planning puzzle (heat management)?
- **Damage balance**: Is self-damage (Hot) / opportunity cost (Cool) proportional to the bonuses?
- **LEGS cooling**: Does LEGS feel impactful for setting up next turn?
- **Build cohesion**: Do the pieces feel like they're working together, or just independently better?

## After Playtesting
Ask the user to report findings. Capture any balance issues, bugs, or design insights. Suggest whether findings warrant:
- A balance tweak (direct code change)
- A design exploration (`/opsx:explore`)
- A new change (`/opsx:new`)

Argument: $ARGUMENTS
