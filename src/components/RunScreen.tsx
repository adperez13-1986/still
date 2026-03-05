import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { Room, FragmentBonus, BehavioralPartDefinition } from '../game/types'
import { useRunStore } from '../store/runStore'
import { usePermanentStore } from '../store/permanentStore'
import MapScreen from './MapScreen'
import CombatScreen from './CombatScreen'
import RestScreen from './RestScreen'
import ShopScreen from './ShopScreen'
import EventScreen from './EventScreen'
import RunInfoOverlay from './RunInfoOverlay'
import { generateMap } from '../game/mapGen'
import { makeEnemyInstance, makeCardInstance } from '../game/combat'
import { ACT1_ENEMIES, ACT1_BOSS } from '../data/enemies'
import { STARTING_CARDS, ACT1_CARD_POOL, yanah, yuri } from '../data/cards'
import { ALL_PARTS, STARTING_TORSO, STARTING_ARMS } from '../data/parts'

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
  const [roomDone, setRoomDone] = useState(false)
  const [infoTab, setInfoTab] = useState<'deck' | 'equips' | null>(null)
  const [brokenCarryNotice, setBrokenCarryNotice] = useState<string | null>(null)

  // Initialize run if not active
  useEffect(() => {
    if (run.active) return

    const bonuses = (location.state as { bonuses?: FragmentBonus[] })?.bonuses ?? []
    const sumBonus = (type: FragmentBonus['type']) =>
      bonuses.filter((b) => b.type === type).reduce((s, b) => s + b.value, 0)

    // Carried part from previous run
    const cp = permanent.carriedPart
    const carriedPartDef: BehavioralPartDefinition | null = cp ? (ALL_PARTS[cp.partId] ?? null) : null
    const initialParts: BehavioralPartDefinition[] = []
    if (cp && carriedPartDef) {
      if (cp.durability > 0) {
        // Intact: include in parts (behavioral parts grant trigger/effect, not stat bonuses)
        initialParts.push(carriedPartDef)
      } else {
        // Broken: don't include, show notice
        setBrokenCarryNotice(`${carriedPartDef.name} is broken — find a Shop to repair it.`)
      }
    }

    const starterDeck = STARTING_CARDS.map((c) => makeCardInstance(c.id))
    if (permanent.companionsUnlocked.includes('yanah')) starterDeck.push(makeCardInstance(yanah.id))
    if (permanent.companionsUnlocked.includes('yuri')) starterDeck.push(makeCardInstance(yuri.id))
    if (permanent.workshopUpgrades['practiced-routine']) {
      const nonBasics = ACT1_CARD_POOL.filter((c) => !['boost', 'emergency-strike', 'coolant-flush', 'diagnostics'].includes(c.id))
      const picked = nonBasics[Math.floor(Math.random() * nonBasics.length)]
      if (picked) starterDeck.push(makeCardInstance(picked.id))
    }
    const bonusHealth = permanent.workshopUpgrades['reinforced-chassis'] ? 15 : 0

    // Starting equipment
    const startingEquipment: import('../game/types').RunState['equipment'] = {
      Head: null,
      Torso: STARTING_TORSO,
      Arms: null,
      Legs: null,
    }
    // "Extra Slot" workshop upgrade: equip Piston Arm in Arms slot
    if (permanent.workshopUpgrades['starting-slot']) {
      startingEquipment.Arms = STARTING_ARMS
    }

    const map = generateMap(1)
    const startMaxHealth = 70 + bonusHealth + sumBonus('health')

    run.startRun({
      act: 1,
      map,
      health: startMaxHealth,
      maxHealth: startMaxHealth,
      drawCount: 5 + sumBonus('drawCount'),
      passiveCoolingBonus: sumBonus('passiveCooling'),
      deck: starterDeck,
      parts: initialParts,
      equipment: startingEquipment,
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

  // Combat active — handled entirely by CombatScreen
  if (run.combat) {
    return <CombatScreen />
  }

  const currentRoom = run.map.rooms[run.map.currentRoomId]

  const handleRoomSelect = (roomId: string) => {
    setRoomDone(false)
    run.moveToRoom(roomId)
    const room = run.map!.rooms[roomId]
    if (!room) return

    if (room.type === 'Combat' || room.type === 'Boss') {
      const enemies = pickEnemiesForRoom(room, run.act)
      run.startCombat(enemies)
    }
  }

  const finishRoom = () => setRoomDone(true)

  const mapWithOverlay = (
    <>
      <MapScreen map={run.map} onRoomSelect={handleRoomSelect} />
      {brokenCarryNotice && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#2d1f0e',
          border: '1px solid #e67e22',
          borderRadius: '6px',
          padding: '10px 20px',
          color: '#e67e22',
          fontSize: '13px',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span>{brokenCarryNotice}</span>
          <button
            onClick={() => setBrokenCarryNotice(null)}
            style={{ background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}
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
          equipment={run.equipment}
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
        carriedPart={permanent.carriedPart}
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
        onRepair={() => {
          const cp = permanent.carriedPart
          if (!cp || cp.durability > 0 || cp.repairsLeft <= 0 || run.shards < 50) return
          const part = ALL_PARTS[cp.partId]
          run.addShards(-50)
          permanent.updateCarriedPart({ durability: cp.maxDurability, repairsLeft: cp.repairsLeft - 1 })
          if (part) run.addPart(part)
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
          if (outcome.type === 'card') {
            const nonBasics = ACT1_CARD_POOL.filter((c) => !['boost', 'emergency-strike', 'coolant-flush', 'diagnostics'].includes(c.id))
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
