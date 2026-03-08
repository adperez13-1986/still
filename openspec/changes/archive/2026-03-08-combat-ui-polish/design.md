## Approach

Use a long-press (touch-hold ~500ms) handler on body slot panels that have equipment. Show a tooltip/popup overlay with the equipment's name, description, slot, action details, and rarity.

## Key Decisions

- **Long-press over tap**: Tap is already used for slot card assignment. Long-press is the standard mobile pattern for "more info."
- **Inline popup, not full overlay**: A small floating card near the slot, dismissed on release or tap-away. Lightweight and contextual.
- **Desktop hover alternative**: On desktop, could show on hover — but long-press works with mouse too, so keep it consistent.

## Implementation

1. BodySlotPanel: Add long-press detection (onTouchStart/onTouchEnd/onMouseDown/onMouseUp with timer)
2. Show a positioned popup with equipment details when long-press triggers
3. Dismiss on pointer up or touch end
