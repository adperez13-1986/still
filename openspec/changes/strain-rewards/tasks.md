## 1. Growth State & Reward Data

- [x] 1.1 Add `growth` object to RunState (`abilities: string[]`, `masteries: string[]`) and initialize empty on new run
- [x] 1.2 Define growth reward pool: Repair (2 strain), Brace (2 strain), Strike Mastery (3 strain), Shield Mastery (3 strain), Barrage Mastery (3 strain)
- [x] 1.3 Define comfort reward types: Heal (8 HP), Relief (-4 strain), Companion moment (-2 strain + text)
- [x] 1.4 Add growth state to save/restore

## 2. Sparse Starting State

- [x] 2.1 Remove Repair and Brace from default abilities — only Vent available at start
- [x] 2.2 Combat UI reads from `growth.abilities` to determine which abilities to show (plus Vent always)
- [x] 2.3 Combat engine reads from `growth.masteries` to determine push costs (0 if mastered, base otherwise)

## 3. Reward Screen Logic

- [x] 3.1 After victory, select growth reward: draw one unacquired reward from pool
- [x] 3.2 Check affordability: if current strain + growth cost >= 20, growth is unavailable
- [x] 3.3 Select comfort reward contextually: Heal if HP < 50%, Relief if strain >= 10, Companion moment otherwise
- [x] 3.4 Apply growth reward: add to `growth.abilities` or `growth.masteries`, increase strain by cost
- [x] 3.5 Apply comfort reward: heal HP, reduce strain, or show companion text

## 4. Reward Screen UI

- [x] 4.1 Replace bare "Still standing" victory screen with reward choice screen
- [x] 4.2 Show two cards: growth (left) with strain cost + projected strain, comfort (right) marked free
- [x] 4.3 Grey out / hide growth option when unaffordable or pool exhausted
- [x] 4.4 After selection, apply reward and return to map (clear room, save run)

## 5. Playtest

- [ ] 5.1 Verify: first fight offers a growth ability (Repair or Brace) and a comfort reward
- [ ] 5.2 Verify: acquired ability appears in next combat
- [ ] 5.3 Verify: mastery reduces push cost to 0 in combat
- [ ] 5.4 Verify: growth greyed out when strain too high
- [ ] 5.5 Verify: run feels different based on reward choices (growth-heavy vs comfort-heavy)
