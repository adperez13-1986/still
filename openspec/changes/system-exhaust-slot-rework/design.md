## Context

Combat currently has two card categories: system cards (play freely, global effects) and slot modifiers (assign to body slots). System cards dominate — there are ~20 system cards vs ~8 slot modifier effects. With abundant draw and cooling, players play everything each turn, neutralizing heat as a constraint. Slot modifiers are mostly pure math (amplify, repeat) and can be assigned to any slot, even where they have no meaningful effect.

## Goals / Non-Goals

**Goals:**
- System cards exhaust on play — each one is a one-time tactical moment per combat
- Slot modifiers restricted to valid slots — no more Spread Shot on HEAD
- Late combat shifts toward a pure slot modifier puzzle as system cards are spent
- HEAD/LEGS equipment feels worth Repeating

**Non-Goals:**
- New modifier card types or slot bonus mechanics (deferred)
- Changing system card effects or numbers (just adding exhaust behavior)
- Reworking the heat system itself
- New equipment items (may buff existing values)

## Decisions

### System card exhaust: category-level rule, not per-card keyword

Currently exhaust is a per-card keyword. Some system cards already have it (Quick Scan, Meltdown, Cascade). The change: **all system cards exhaust on play regardless of keyword**.

Implementation: in `playModifierCard` in `combat.ts`, after resolving a system card's effects, always push to `exhaustPile` instead of checking `card.keywords.includes('Exhaust')`. The Exhaust keyword on system cards becomes redundant but harmless — no need to remove it from card data.

For slot modifiers, exhaust behavior stays keyword-based (currently only Resonance has it).

**Alternative considered**: Adding the Exhaust keyword to every system card in `cards.ts`. Rejected because it's more error-prone (new system cards could forget it) and clutters the card data.

### Slot restrictions: derived from modifier category + effect type

Rather than adding an `allowedSlots` field to every card definition, derive restrictions from the existing category:

```typescript
function getAllowedSlots(card: ModifierCardDefinition): BodySlot[] | null {
  if (card.category.type !== 'slot') return null // system cards don't target slots
  const effect = card.category.effect
  switch (effect.type) {
    case 'amplify':   return ['Arms', 'Torso']
    case 'redirect':  return ['Arms']
    case 'repeat':    return null // universal — all slots
    case 'override':
      // Damage overrides → Arms, Block overrides → Torso
      if (effect.action.type === 'damage') return ['Arms']
      if (effect.action.type === 'block')  return ['Torso']
      return null // other override types: universal
  }
}
```

**Why derive, not store**: The restriction is inherent to the category — all Amplify cards are ARMS/TORSO, all Redirect cards are ARMS. Storing it per-card would be redundant and could drift out of sync.

**Where to enforce**: Two places:
1. `BodySlotPanel.tsx` — filter `validSlots` to only include allowed slots (UI prevention)
2. `playModifierCard` in `combat.ts` — validate slot before applying (safety check)

### Equipment review for Repeat value

Echo Protocol (Repeat: fire 2x) and Cascade (Repeat: fire 3x) are universal. They need to be worth playing on HEAD and LEGS. Current equipment base values:

| Slot | Equipment | Base Value | Echo Protocol value |
|------|-----------|-----------|-------------------|
| HEAD | Basic Scanner | Draw 1 | Draw 2 — decent |
| HEAD | Calibrated Optics | Draw 1 (Cool: 2) | Draw 2 (Cool: 4) — strong |
| HEAD | Pyroclast Scanner | Draw 1 (Hot: 3) | Draw 2 (Hot: 6) — very strong |
| HEAD | Thermal Imager | Draw 2 | Draw 4 — strong |
| HEAD | Neural Sync | Draw 2 + foresight 1 | Draw 4 + foresight 2 — strong |
| LEGS | Worn Actuators | Lose 1 heat | Lose 2 heat — weak |
| LEGS | Adaptive Treads | Lose 2 heat + block/heat | Lose 4 heat + double block — strong |
| LEGS | Coolant Injector | Lose 2 heat | Lose 4 heat — decent |
| LEGS | Stabilizer Treads | Lose 1 heat + 3 block/lost | Lose 2 heat + 6 block — decent |
| LEGS | Cryo Lock | Lose 1 heat (Cool: +5 block) | Lose 2 heat (Cool: +10 block) — strong |
| LEGS | Thermal Exhaust | Lose 1 heat (Hot: 3) | Lose 2 heat (Hot: 6) — strong |

Most HEAD and LEGS equipment is already worth Repeating, especially the archetype-specific pieces. **Worn Actuators** (lose 1 heat, Repeat = lose 2) is the weakest, but it's a starter item meant to be replaced. No equipment buffs needed.

### Starting deck impact

The starting deck has 2x Coolant Flush and 1x Diagnostics as system cards. With exhaust:
- 2 Coolant Flush uses total per combat (−6 heat across the fight)
- 1 Diagnostics use total (draw 2 once)

This is a significant nerf to early combat cooling. But it's intentional — early combat should feel constrained, pushing players to find LEGS equipment and pick up more cooling/draw cards. The 3x Boost (slot modifiers) become the backbone of early turns.

### Failsafe Armor part interaction

Failsafe Armor gives Block equal to exhaust pile size at turn start. System card exhaust makes this part significantly stronger — every system card played grows the exhaust pile. This is a feature, not a bug: it creates a clear build path (play system cards early for effects + exhaust pile growth, then benefit from Failsafe Armor in late combat).

## Risks / Trade-offs

- **Early combat too punishing** → Players start with only 3 system cards (2 Coolant, 1 Diagnostics). If enemies are tuned around having cooling every turn, the first few combats may spike in difficulty. → Mitigation: monitor during playtest, may need to adjust Sector 1 enemy damage if too harsh.
- **Deck building changes** → Players may want to collect more system cards to have "more uses per combat." This is correct behavior — it pushes toward broader decks with redundancy, which is the opposite of the current thin-deck meta. → Feature, not bug.
- **Cards with existing Exhaust keyword** → Quick Scan, Meltdown, Cascade, Resonance (slot) already have Exhaust. For system cards (Quick Scan, Meltdown, Cascade), the keyword becomes redundant. For Resonance (slot modifier), exhaust stays keyword-based. → No code conflict, just display redundancy. Can remove Exhaust keyword from system card descriptions in a polish pass.
