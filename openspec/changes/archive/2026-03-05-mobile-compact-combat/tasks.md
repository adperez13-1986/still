## 1. Responsive Hook

- [x] 1.1 Create `src/hooks/useIsMobile.ts` — `useSyncExternalStore` with `window.matchMedia('(max-width: 600px)')`, returns boolean

## 2. Compact Component Modes

- [x] 2.1 StillPanel: add `compact?: boolean` prop, early-return single flex row with mini HP bar (80px, 8px tall), heat in threshold color, block if >0, shutdown badge, abbreviated status pills
- [x] 2.2 EnemyCard: add `compact?: boolean` prop, early-return tappable flex row with TGT label, name, mini health bar, block, intent in bracket notation, abbreviated statuses
- [x] 2.3 BodySlotPanel: add `compact?: boolean` prop, switch to `gridTemplateColumns: '1fr'`, compact padding, each slot as inline flex row with projections, modifier badge, "Tap" hint
- [x] 2.4 Hand: add `compact?: boolean` prop, render cards as pill/chips (name + heat cost only), compact gap/padding/minHeight

## 3. CombatScreen Wiring

- [x] 3.1 Import and call `useIsMobile()` hook
- [x] 3.2 Mobile top section: stack StillPanel (compact) and enemy rows vertically instead of side-by-side
- [x] 3.3 Hide HeatTrack on mobile: `{!isMobile && <HeatTrack ... />}`
- [x] 3.4 Hand wrapper: reduce padding, shorten hint text ("Tap a slot"), hide pile counts on mobile
- [x] 3.5 Sticky Execute: `position: 'sticky'`, `bottom: 0`, full-width button, round counter + target inline
- [x] 3.6 Outer container: `gap: '6px'`, `padding: '8px 8px 60px 8px'` on mobile
- [x] 3.7 Pass `compact={isMobile}` to all child components
