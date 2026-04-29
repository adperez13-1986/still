# Patch: src/components/BodySlotPanel.tsx

The compact (mobile) branch is unchanged. Only the non-compact (desktop) branch is restyled.

## Change 1: 4-column horizontal strip

Find the outer `<div>` in the non-compact return (the one wrapping the `<div style={{ display: 'grid', gridTemplateColumns: ... }}>`). Change the grid template:

```tsx
// BEFORE
<div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: compact ? '4px' : '8px' }}>

// AFTER
<div style={{
  display: 'grid',
  gridTemplateColumns: compact ? '1fr' : 'repeat(4, minmax(0, 1fr))',
  gap: compact ? '4px' : '8px',
}}>
```

## Change 2: Compact each cell vertically

In the non-compact slot cell (the `return (<div key={slot} onClick={...}> ... </div>)` block at the bottom of the map), reduce padding and font sizes so 4 cells fit comfortably:

```tsx
style={{
  padding: '8px 10px',           // was '10px'
  ...
}}
```

Inside the cell, the `equip.description` line is too verbose for a 4-column layout. Replace:

```tsx
{equip && (
  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
    {equip.description}
  </div>
)}
```

with a single short action summary:

```tsx
{equip && (
  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
    {equip.action.type === 'damage' ? `${equip.action.baseValue} dmg`
      : equip.action.type === 'block' ? `${equip.action.baseValue} block`
      : equip.action.type === 'heal' ? `${equip.action.baseValue} heal`
      : equip.action.type === 'draw' ? `+${equip.action.baseValue} draw`
      : equip.action.type === 'foresight' ? `foresight ${equip.action.baseValue}`
      : equip.action.type === 'debuff' ? `${equip.action.debuffType} ${equip.action.baseValue}`
      : equip.action.type === 'reduce' ? `-${equip.action.baseValue}/hit`
      : ''}
  </div>
)}
```

The full description is still visible on long-press via the existing `EquipPopup`.

## Change 3 (optional): Ghost Still sprite behind the strip

Add an absolutely positioned, faint `Sprite` of Still behind the strip to tie it visually to the stage above.

At the top of the file:

```tsx
import Sprite from './Sprite'
import { STILL_SPRITE } from '../data/sprites'
```

In the outer panel `<div>`, set `position: 'relative'` and `overflow: 'hidden'`. Then before the title row, add:

```tsx
{!compact && (
  <div style={{
    position: 'absolute',
    left: -8,
    top: '50%',
    transform: 'translateY(-50%) scale(1)',
    opacity: 0.08,
    pointerEvents: 'none',
    zIndex: 0,
  }}>
    <Sprite art={STILL_SPRITE.art} palette={STILL_SPRITE.palette} pixelSize={4} />
  </div>
)}
```

And ensure the title row + grid have `position: 'relative'; zIndex: 1` so they sit above the ghost.

## Verify

1. Desktop: 4 slots in a row, equal width.
2. Each slot shows: name, short action summary, optional modifier chip, projection chips when active.
3. Long-press a slot → existing `EquipPopup` still appears with full description.
4. Mobile: stacks vertically, exactly as before — no visual change.
