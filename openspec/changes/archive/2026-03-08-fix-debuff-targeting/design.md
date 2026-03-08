## Approach

Minimal type expansion. The `SystemEffect` applyStatus variant gains a union target type. Combat execution branches on the target value.

## Key Decisions

- **Union type over separate effect types**: Adding `'all_enemies'` to the existing target field is simpler than creating a new effect type. The target field already exists, it just needed a wider type.
- **Apply to all non-defeated enemies**: Consistent with how damage targeting works — skip defeated enemies.

## Implementation

1. `src/game/types.ts`: Change `target: 'self'` to `target: 'self' | 'all_enemies'` in the applyStatus SystemEffect variant
2. `src/game/combat.ts`: Branch on `effect.target` in the applyStatus case — `'self'` applies to player, `'all_enemies'` loops over non-defeated enemies
3. `src/data/cards.ts`: Update Target Lock (`target: 'all_enemies'` for Vulnerable) and Glacier Lance heatBonus (`target: 'all_enemies'` for Weak)
