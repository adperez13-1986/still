## Context

Combat screen stacks ~1,200px of content vertically on desktop. All styles are inline React — no CSS breakpoints or responsive patterns exist. On mobile viewports (<=600px), the player must scroll constantly between enemies at the top and the Execute button at the bottom, making the game unplayable.

## Goals / Non-Goals

**Goals:**
- Reduce mobile combat height from ~1,200px to ~400px
- Keep Execute button always visible on mobile (sticky bottom)
- Preserve all combat functionality — targeting, slot assignment, card play
- Zero changes to desktop layout

**Non-Goals:**
- Redesigning any game logic or combat mechanics
- Adding CSS files or a CSS framework — stays inline React
- Handling tablet or other intermediate breakpoints
- Touch gesture support (swipe, long-press, etc.)

## Decisions

### Decision 1: `useSyncExternalStore` hook for breakpoint

Use React 18's `useSyncExternalStore` with `window.matchMedia` for the responsive hook. This avoids useState/useEffect patterns and is SSR-safe by design (not relevant here but idiomatic). Breakpoint set at 600px.

### Decision 2: `compact?: boolean` prop pattern

Each combat component receives an optional `compact` prop. When true, the component early-returns a compact layout before the existing desktop return. This keeps changes minimal and desktop rendering untouched — the compact code path is entirely additive.

### Decision 3: Compact layout specifics

- **StillPanel**: Single flex row (~36px) with mini HP bar (80px wide, 8px tall), heat value in threshold color, block if >0, shutdown badge, abbreviated status pills (first letter + stacks)
- **EnemyCard**: Tappable flex row (~36px) with TGT label (yellow), name, mini health bar, block, intent bracket notation `[sword 6]`, abbreviated statuses
- **BodySlotPanel**: `gridTemplateColumns: '1fr'` instead of `'1fr 1fr'`, each slot is a single flex row with inline projections, "Tap" hint instead of "Click to assign"
- **Hand**: Cards render as pill/chips (borderRadius 12px, ~28px tall) showing only name + heat cost badge. No description, keywords, or category label.
- **HeatTrack**: Simply not rendered on mobile — heat info shown in compact StillPanel
- **Execute**: `position: 'sticky'`, `bottom: 0`, full-width button with round counter and target name inline

### Decision 4: Outer container adjustments

Mobile outer container uses `gap: '6px'` (vs 12px), `padding: '8px 8px 60px 8px'` (60px bottom for sticky execute bar). Top section stacks StillPanel and enemy rows vertically instead of side-by-side flex.

## File Changes

| File | Change |
|------|--------|
| `src/hooks/useIsMobile.ts` | New — `useSyncExternalStore` + `matchMedia` hook |
| `src/components/StillPanel.tsx` | Add `compact` prop, early-return compact row |
| `src/components/EnemyCard.tsx` | Add `compact` prop, early-return compact row |
| `src/components/BodySlotPanel.tsx` | Add `compact` prop, single-column grid, inline slot rows |
| `src/components/Hand.tsx` | Add `compact` prop, pill/chip card rendering |
| `src/components/CombatScreen.tsx` | Import hook, conditional mobile/desktop layouts, sticky execute |
