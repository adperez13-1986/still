## 1. EquipCompareOverlay Component

- [x] 1.1 Create `src/components/EquipCompareOverlay.tsx` — modal overlay showing current vs. new equipment with "Keep Current" and "Equip New" buttons (styled like CarrySelectOverlay)

## 2. Reward Flow Integration

- [x] 2.1 In `CombatScreen.tsx`, split equipment drops into auto-equip (empty slot) and conflicts (occupied slot) during `onChoose`
- [x] 2.2 Add state to CombatScreen to track pending equipment conflicts and show EquipCompareOverlay sequentially after card choice
- [x] 2.3 After all conflicts resolved (or none), proceed to map/next room as before
