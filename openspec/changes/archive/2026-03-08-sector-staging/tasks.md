## 1. Store & Flow Changes

- [x] 1.1 Add `advanceSector` action to runStore — increments `sector`, generates new maze via `generateGridMaze`, resets `combat` to null
- [x] 1.2 Change CombatScreen boss victory flow — if `sector < 3`, navigate to `/staging` instead of ending the run
- [x] 1.3 Add `/staging` route in App.tsx

## 2. Staging Screen

- [x] 2.1 Create `StagingScreen.tsx` with step-based flow (step 1-4 + continue)
- [x] 2.2 Step 1 — Repair: auto-heal to maxHealth, show narrative flavor text, advance on tap/timer
- [x] 2.3 Step 2 — Upgrade: show all deck cards, tap to upgrade (reuse rest room upgrade logic), skip button
- [x] 2.4 Step 3 — Remove: show all deck cards, tap to remove, skip button, enforce min deck size of 5
- [x] 2.5 Step 4 — Bonus reward: show 3 options (S2 card pick-1-of-3, random part, random equipment), handle equip conflicts
- [x] 2.6 Continue button: call `advanceSector()`, navigate to `/run`

## 3. Integration

- [x] 3.1 Wire StagingScreen to read from runStore (deck, equipment, parts, sector)
- [x] 3.2 Ensure map screen (RunScreen) works when sector > 1 — new maze loads correctly
- [x] 3.3 Verify final sector (S3) boss still triggers normal victory/run-end flow
