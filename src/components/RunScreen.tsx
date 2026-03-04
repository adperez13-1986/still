import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { Room, FragmentBonus } from '../game/types'
import { useRunStore } from '../store/runStore'
import { usePermanentStore } from '../store/permanentStore'
import MapScreen from './MapScreen'
import CombatScreen from './CombatScreen'
import RestScreen from './RestScreen'
import ShopScreen from './ShopScreen'
import EventScreen from './EventScreen'
import RunInfoOverlay from './RunInfoOverlay'
import { generateMap } from '../game/mapGen'
import { initCombat, makeEnemyInstance, makeCardInstance } from '../game/combat'
import { ACT1_ENEMIES, ACT1_BOSS } from '../data/enemies'
import { STARTING_CARDS, ACT1_CARD_POOL, yanah, yuri } from '../data/cards'
import { ALL_PARTS, EQUIPABLES } from '../data/parts'

function pickEnemiesForRoom(room: Room, _act: number) {
  if (room.type === 'Boss') return [makeEnemyInstance(ACT1_BOSS)]
  const pool = ACT1_ENEMIES
  const count = Math.random() < 0.3 ? 2 : 1
  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
  return picked.map(makeEnemyInstance)
}

export default function RunScreen() {
  const run = useRunStore()
  const permanent = usePermanentStore()
  const location = useLocation()
  // Track whether the current room has been completed — show map when true
  const [roomDone, setRoomDone] = useState(false)
  const [infoTab, setInfoTab] = useState<'deck' | 'equips' | null>(null)

  // Initialize run if not active
  useEffect(() => {
    if (run.active) return

    const bonuses = (location.state as { bonuses?: FragmentBonus[] })?.bonuses ?? []
    const sumBonus = (type: FragmentBonus['type']) =>
      bonuses.filter((b) => b.type === type).reduce((s, b) => s + b.value, 0)

    const starterDeck = STARTING_CARDS.map((c) => makeCardInstance(c.id))
    if (permanent.companionsUnlocked.includes('yanah')) starterDeck.push(makeCardInstance(yanah.id))
    if (permanent.companionsUnlocked.includes('yuri')) starterDeck.push(makeCardInstance(yuri.id))
    if (permanent.workshopUpgrades['practiced-routine']) {
      const nonBasics = ACT1_CARD_POOL.filter((c) => !['strike', 'brace', 'surge'].includes(c.id))
      const picked = nonBasics[Math.floor(Math.random() * nonBasics.length)]
      if (picked) starterDeck.push(makeCardInstance(picked.id))
    }
    const bonusHealth = permanent.workshopUpgrades['reinforced-chassis'] ? 15 : 0

    const startingEquipables: Record<string, import('../game/types').EquipableDefinition | null> = {
      Head: null, Torso: null, Arms: null, Legs: null,
    }
    let equipBonusHealth = 0
    let equipBonusEnergy = 0
    let equipBonusDraw = 0
    if (permanent.workshopUpgrades['starting-slot']) {
      const equip = EQUIPABLES[Math.floor(Math.random() * EQUIPABLES.length)]
      startingEquipables[equip.slot] = equip
      for (const effect of equip.statEffects) {
        if (effect.type === 'maxHealth') equipBonusHealth += effect.value
        if (effect.type === 'energyCap') equipBonusEnergy += effect.value
        if (effect.type === 'drawCount') equipBonusDraw += effect.value
      }
    }

    const map = generateMap(1)
    const startMaxHealth = 70 + bonusHealth + sumBonus('health') + equipBonusHealth

    run.startRun({
      act: 1,
      map,
      health: startMaxHealth,
      maxHealth: startMaxHealth,
      energyCap: 3 + sumBonus('energyCap') + equipBonusEnergy,
      drawCount: 5 + sumBonus('drawCount') + equipBonusDraw,
      bonusStrength: 0,
      deck: starterDeck,
      parts: [],
      equipables: startingEquipables as import('../game/types').RunState['equipables'],
      shards: sumBonus('shards'),
      combat: null,
      nameDiscovered: permanent.nameEverDiscovered,
    })
  }, [])

  if (!run.active || !run.map) {
    return (
      <div style={{ color: '#e8e8e8', textAlign: 'center', marginTop: '40px' }}>
        Preparing...
      </div>
    )
  }

  // Combat active — handled entirely by CombatScreen (uses its own navigation)
  if (run.combat) {
    return <CombatScreen />
  }

  const currentRoom = run.map.rooms[run.map.currentRoomId]

  const handleRoomSelect = (roomId: string) => {
    setRoomDone(false) // entering a new room — reset
    run.moveToRoom(roomId)
    const room = run.map!.rooms[roomId]
    if (!room) return

    if (room.type === 'Combat' || room.type === 'Boss') {
      const enemies = pickEnemiesForRoom(room, run.act)
      const sumPartEffect = (type: string) =>
        run.parts.reduce((s, p) => s + p.effects.filter(e => e.type === type).reduce((a, e) => a + e.value, 0), 0) +
        Object.values(run.equipables).filter(Boolean).reduce((s, eq) => s + eq!.statEffects.filter(e => e.type === type).reduce((a, e) => a + e.value, 0), 0)
      const strengthBonus = sumPartEffect('strengthBonus') + run.bonusStrength
      const combat = initCombat(run.deck, run.energyCap, run.drawCount, enemies, strengthBonus)
      useRunStore.setState((s) => ({ ...s, combat }))
    }
  }

  const finishRoom = () => setRoomDone(true)

  const mapWithOverlay = (
    <>
      <MapScreen map={run.map} onRoomSelect={handleRoomSelect} />
      {/* Floating info buttons */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 50,
      }}>
        <button
          onClick={() => setInfoTab('deck')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#16213e',
            border: '1px solid #a29bfe',
            borderRadius: '6px',
            color: '#a29bfe',
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          Deck ({run.deck.length})
        </button>
        <button
          onClick={() => setInfoTab('equips')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#16213e',
            border: '1px solid #74b9ff',
            borderRadius: '6px',
            color: '#74b9ff',
            fontSize: '12px',
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          Equips
        </button>
      </div>
      {infoTab && (
        <RunInfoOverlay
          tab={infoTab}
          deck={run.deck}
          parts={run.parts}
          equipables={run.equipables}
          onClose={() => setInfoTab(null)}
          onTabChange={setInfoTab}
        />
      )}
    </>
  )

  // Show map when room is done or no special room is active
  if (roomDone || !currentRoom || currentRoom.type === 'Combat' || currentRoom.type === 'Boss') {
    return mapWithOverlay
  }

  if (currentRoom.type === 'Rest') {
    return (
      <RestScreen
        health={run.health}
        maxHealth={run.maxHealth}
        deck={run.deck}
        onHeal={() => {
          run.heal(Math.floor(run.maxHealth * 0.3))
          finishRoom()
        }}
        onUpgrade={(instanceId) => {
          useRunStore.setState((s) => ({
            ...s,
            deck: s.deck.map((c) =>
              c.instanceId === instanceId ? { ...c, isUpgraded: true } : c
            ),
          }))
          finishRoom()
        }}
        onContinue={finishRoom}
      />
    )
  }

  if (currentRoom.type === 'Shop') {
    return (
      <ShopScreen
        shards={run.shards}
        onBuyCard={(cardId, cost) => {
          if (run.shards < cost) return
          run.addShards(-cost)
          run.addCardToDeck(makeCardInstance(cardId))
        }}
        onBuyPart={(partId, cost) => {
          if (run.shards < cost) return
          const part = ALL_PARTS[partId]
          if (!part) return
          run.addShards(-cost)
          run.addPart(part)
        }}
        onLeave={finishRoom}
      />
    )
  }

  if (currentRoom.type === 'Event') {
    return (
      <EventScreen
        room={currentRoom}
        nameDiscovered={run.nameDiscovered}
        onChoice={(outcome) => {
          if (outcome.type === 'health') run.heal(outcome.value)
          if (outcome.type === 'shards') run.addShards(outcome.value)
          if (outcome.type === 'status') run.addBonusStrength(outcome.value)
          if (outcome.type === 'card') {
            const nonBasics = ACT1_CARD_POOL.filter((c) => !['strike', 'brace', 'surge'].includes(c.id))
            const picked = nonBasics[Math.floor(Math.random() * nonBasics.length)]
            if (picked) run.addCardToDeck(makeCardInstance(picked.id))
          }
          if (!run.nameDiscovered && !permanent.nameEverDiscovered) {
            run.discoverName()
            permanent.setNameDiscovered()
          }
          finishRoom()
        }}
      />
    )
  }

  return mapWithOverlay
}
