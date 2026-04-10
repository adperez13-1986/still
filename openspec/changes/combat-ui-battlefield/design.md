## Context

The combat screen is a vertical stack with no spatial battlefield. The player is invisible — just a text HP line. Damage numbers float to screen edges. On mobile (~375×667px), it's hard to follow the action.

This change restructures the combat UI into a battlefield layout: enemies at top, player card in the middle, compact action bar at the bottom. All combat feedback (damage, block, heal) appears as floating numbers on the entity that's affected.

## Goals / Non-Goals

**Goals:**
- Player represented as a visible entity card (HP bar, block badge)
- Enemy damage numbers appear on the specific enemy card hit
- Player damage/heal/block numbers appear on the player card
- Action slots compact enough to fit below the player card on mobile
- Remove combat log — floating numbers replace it
- 500ms delay between sequential combat events

**Non-Goals:**
- Robot avatar/sprite (just functional card for now)
- Sound effects
- Particle effects beyond floating numbers
- Changing the combat engine
- Changing the reward/forfeit/death screens

## Decisions

### 1. Mobile-first vertical layout

```
┌──────────────────────┐
│ STRAIN ████░░░  8/20 │  ~40px
│                      │
│  ┌──────┐ ┌──────┐   │  ~90px  ENEMY ZONE
│  │ Fury │ │ Echo │   │  (cards with HP bar,
│  │██░ 35│ │███ 28│   │   intent, damage floats)
│  │ ⚔ 12 │ │ 🪞   │   │
│  └──────┘ └──────┘   │
│                      │
│     ┌──────────┐     │  ~70px  PLAYER CARD
│     │████████░ │     │  (HP bar, block badge,
│     │ 52/70 🛡9│     │   damage/heal floats)
│     └──────────┘     │
│                      │
│ ┌─────┐─┌─────┐     │  ~160px ACTION BAR
│ │Strke│ │Sheld│     │  (2 rows: pair A, pair B)
│ │ ⚔11 │ │ 🛡9 │     │  (1 row: solo)
│ └─────┘─└─────┘     │
│ ┌─────┐─┌─────┐     │
│ │Brrge│ │ Vent│     │
│ │⚔7all│ │ -5  │     │
│ └─────┘─└─────┘     │
│      ┌─────┐         │
│      │Solo │         │
│      └─────┘         │
│                      │
│ [Vent -5]  [Execute] │  ~44px
└──────────────────────┘
Total: ~404px (fits 667px iPhone)
```

### 2. Player card design

Compact horizontal card, centered between enemies and actions:

```
┌──────────────────────┐
│ ██████████░░░  52/70 │  ← HP bar with number
│                 🛡 9 │  ← block badge (only if >0)
└──────────────────────┘
```

- HP bar fills the width, number on the right
- Block shown as shield icon + number, bottom-right
- No name label needed (there's only one player)
- Damage numbers float upward from the card (red)
- Heal numbers float upward (green)
- Block gained floats upward (blue)

### 3. Enemy card design

Each enemy is a self-contained card with its own floating numbers:

```
┌──────────────┐
│ Fury Core    │  ← name
│ ██████░░  35 │  ← HP bar + number
│ ⚔ 12        │  ← intent
└──────────────┘
   -14 ← damage float (red, appears on card)
```

- Selected enemy has highlight border (for targeting)
- Block shown inline if enemy has block
- Damage floats appear inside/above the card, positioned relative to it

### 4. Compact action slot design

Each slot is a button showing: type icon, name, value, push state.

```
Unpushed:                 Pushed:
┌─────────────┐          ┌─────────────┐
│ ⚔ Strike    │          │ ⚔ Strike    │  ← orange border
│     7       │          │    11       │  ← pushed value
└─────────────┘          └─────────────┘
```

- Type icon (⚔🛡💚 etc.) + name on first line
- Value large and centered
- Push state shown by border color (orange = pushed)
- Synergy name shown between paired slots when both pushed
- ~40px per slot height

### 5. Floating number system

Numbers are positioned relative to the entity card they affect:

- **Positioned**: `position: absolute` within each card's container
- **Sequenced**: 500ms delay between events
- **Animation**: fade in, float up 28px, fade out (1s total)
- **Colors**: red (damage taken), green (heal/strain recovery), blue (block), gold (synergy bonus)

Events map to areas:
| Event | Area | Text |
|-------|------|------|
| Player slot deals damage | Enemy card | -14 |
| Player gains block | Player card | +9 🛡 |
| Player heals | Player card | +6 |
| Enemy attacks player | Player card | -8 |
| Enemy attack blocked | Player card | BLOCKED |
| Synergy deals damage | Enemy card | -7 (gold) |
| Synergy heals | Player card | +4 (gold) |
| Vent strain recovery | Player card | -5 strain |

### 6. Combat log removed

The floating numbers on entity cards replace the text combat log entirely. Players see what happened spatially — damage on the thing that got damaged.

### 7. Per-enemy damage targeting

Damage floats need to appear on the *specific* enemy that was hit. The combat log events include `enemyId` for damage events. Each enemy card has a ref, and floats are rendered inside that card's container.

For AoE damage that hits all enemies, each enemy gets its own float simultaneously.

## Risks / Trade-offs

**[Vertical space on small phones]** → Layout calculated for 667px (iPhone SE). Larger phones have more room. If slots are too cramped, the solo slot could be hidden when empty.

**[Many floats during big turns]** → With 5 slots + synergies + enemy attacks, a turn could have 10+ events at 500ms each = 5+ seconds of animation. If this feels slow, reduce delay to 350ms or batch simultaneous events (e.g., all slot fires at once, then synergies, then enemy attacks).

**[No combat log for debugging]** → Could add a collapsed "log" button that expands a text log for debugging. Not needed for v1.
