## Context

Parts were just redesigned into 17 decision-making parts with combat hooks. But there's no visual feedback — parts trigger silently. The mobile combat screen has ~200px of dead space below the execute bar.

## Goals / Non-Goals

**Goals:**
- Show owned parts as compact badges on mobile combat screen
- Animate badges when parts trigger during execution replay
- Let players tap badges to see part details

**Non-Goals:**
- Desktop layout changes (desktop has more room, can be done later)
- Part selection/management during combat
- Detailed trigger history or log

## Decisions

### Badge rendering — letter abbreviations in styled circles

Each part gets a 2-letter abbreviation (e.g., FL for Feedback Loop, PV for Pressure Valve) rendered as a small circle. Rarity determines border color (uncommon=blue, rare=gold). Heat condition shown as a subtle colored dot.

Alternative: colored dots with no text — too minimal, parts lose identity at a glance.

### Placement — below the sticky execute bar

Parts are passive information. Placing them below the action zone (slots + hand + execute) keeps them visible without competing for attention. Rendered as a horizontal row that wraps if needed.

### Animation — CSS glow pulse via state flag

When the animation replay encounters a `partTrigger` event, set the part's badge to "active" state for ~600ms. Active state applies a CSS box-shadow glow animation. Color matches effect type:
- Blue glow for block effects
- Green glow for heat reduction
- Red glow for damage effects
- White glow for draw/other

No need for DamageNumber floaters on parts — the effect is already shown on Still or enemies.

### Event plumbing — add `partTrigger` to `CombatEvent`

```typescript
| { type: 'partTrigger'; partId: string }
```

Emit from `applyPartEffect` and from inline part-specific code (Thermal Oscillator AOE, Momentum Core draw, Pressure Valve, Ablative Shell). The animation replay system processes these events alongside existing ones.

### Tap-to-info — reuse long-press popup pattern

Same pattern as BodySlotPanel's equipment popup. Tap (not long-press, since parts aren't interactive) shows a small popup with part name, description, and rarity. Dismiss on tap-outside.

## Risks / Trade-offs

- **Many part triggers per execution** → Multiple badges may glow simultaneously. This is fine — it shows the player their build is working. Sequential glow via staggered delays would slow down animation replay too much.
- **Badge abbreviations may be ambiguous** → Two parts could share initials (e.g., if both start with "S"). Use first letter of each word or unique abbreviations. Only 2-4 parts are owned at once, so collisions are unlikely in practice.
