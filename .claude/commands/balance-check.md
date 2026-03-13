Audit game balance for Still. Use the balance-reviewer agent to scan the codebase.

Focus areas (pick based on argument, or do all if no argument):
- `cards` — Audit card costs, effects, and rarity distribution in `src/data/cards.ts`
- `equipment` — Audit equipment stats, conditional bonuses, and archetype alignment in `src/data/parts.ts`
- `parts` — Audit behavioral parts for degenerate combos or missing synergies in `src/data/parts.ts`
- `heat` — Trace heat math for each archetype through a typical turn using `src/game/combat.ts`
- `all` — Full audit

Argument: $ARGUMENTS
