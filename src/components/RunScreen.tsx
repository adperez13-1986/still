import { useEffect, useState, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import type { GridRoom, FragmentBonus, BehavioralPartDefinition } from '../game/types'
import { useRunStore } from '../store/runStore'
import { usePermanentStore } from '../store/permanentStore'
import MapScreen from './MapScreen'
import CombatScreen from './CombatScreen'
import RestScreen from './RestScreen'
import ShopScreen from './ShopScreen'
import EventScreen from './EventScreen'
import CardPicker from './CardPicker'
import RunInfoOverlay from './RunInfoOverlay'
import { generateGridMaze, findPath } from '../game/mapGen'
import { makeEnemyInstance, makeCardInstance } from '../game/combat'
import {
  SECTOR1_BOSS, SECTOR2_BOSS,
  SECTOR1_ENCOUNTERS, SECTOR1_ELITE_ENCOUNTERS,
  SECTOR2_ENCOUNTERS, SECTOR2_ELITE_ENCOUNTERS,
  ALL_ENEMIES,
} from '../data/enemies'
import { STARTING_CARDS, SECTOR1_CARD_POOL, SECTOR2_CARD_POOL } from '../data/cards'
import { ALL_PARTS, ALL_EQUIPMENT, STARTING_TORSO, STARTING_ARMS } from '../data/parts'

function pickEnemiesForRoom(room: GridRoom, sector: number, combatsCleared: number) {
  if (room.type === 'Boss') {
    const boss = sector >= 2 ? SECTOR2_BOSS : SECTOR1_BOSS
    return [makeEnemyInstance(boss)]
  }
  const encounters = sector >= 2 ? SECTOR2_ENCOUNTERS : SECTOR1_ENCOUNTERS
  const eliteEncounters = sector >= 2 ? SECTOR2_ELITE_ENCOUNTERS : SECTOR1_ELITE_ENCOUNTERS
  // ~20% of combat rooms are elite encounters, but not in the first 3 combats
  const canBeElite = combatsCleared >= 3
  const pool = canBeElite && Math.random() < 0.2 ? eliteEncounters : encounters
  const encounter = pool[Math.floor(Math.random() * pool.length)]
  return encounter.enemies.map(id => {
    const def = ALL_ENEMIES[id]
    if (!def) throw new Error(`Unknown enemy: ${id}`)
    return makeEnemyInstance(def)
  })
}

export default function RunScreen() {
  const run = useRunStore()
  const permanent = usePermanentStore()
  const location = useLocation()
  const [roomDone, setRoomDone] = useState(false)
  const [infoTab, setInfoTab] = useState<'deck' | 'equips' | null>(null)
  const [brokenCarryNotice, setBrokenCarryNotice] = useState<string | null>(null)
  const [eventCardRemoval, setEventCardRemoval] = useState<number | null>(null)
  const [autoPath, setAutoPath] = useState<[number, number][] | null>(null)
  const walkingRef = useRef(false)

  // Initialize run if not active
  useEffect(() => {
    if (run.active) return

    // Debug shortcut: /run?debug=<preset> starts directly in Sector 2 with a loaded build
    // Presets: s2 (generic), cool (Cool Runner), hot (Pyromaniac), warm (Warm Surfer)
    const params = new URLSearchParams(location.search)
    const debugPreset = params.get('debug')
    if (debugPreset && ['s2', 'cool', 'hot', 'warm'].includes(debugPreset)) {
      const presets: Record<string, {
        deck: string[]
        parts: string[]
        equipment: Record<string, string>
      }> = {
        s2: {
          deck: ['overcharge', 'spread-shot', 'thermal-flux', 'glacier-lance', 'controlled-burn', 'failsafe-protocol', 'salvage-burst'],
          parts: ['thermal-oscillator', 'momentum-core'],
          equipment: { Head: 'calibrated-optics', Torso: 'reactive-plating', Arms: 'overclocked-pistons', Legs: 'coolant-injector' },
        },
        cool: {
          deck: ['precision-strike', 'cold-efficiency', 'coolant-flush', 'glacier-lance', 'thermal-equilibrium', 'salvage-burst'],
          parts: ['zero-point-field', 'cryo-engine'],
          equipment: { Head: 'predictive-array', Torso: 'cryo-shell', Arms: 'cryo-cannon', Legs: 'cryo-lock' },
        },
        hot: {
          deck: ['overcharge', 'controlled-burn', 'spread-shot', 'heat-vent', 'thermal-flux', 'meltdown', 'salvage-burst'],
          parts: ['reactive-frame', 'pressure-valve'],
          equipment: { Head: 'pyroclast-scanner', Torso: 'heat-shield', Arms: 'meltdown-cannon', Legs: 'thermal-exhaust' },
        },
        warm: {
          deck: ['overcharge', 'spread-shot', 'thermal-flux', 'precision-strike', 'controlled-burn', 'failsafe-protocol', 'salvage-burst'],
          parts: ['momentum-core', 'ablative-shell'],
          equipment: { Head: 'tactical-visor', Torso: 'ablative-plates', Arms: 'arc-welder', Legs: 'stabilizer-treads' },
        },
      }
      const preset = presets[debugPreset]
      const deck = [
        ...STARTING_CARDS.map(c => makeCardInstance(c.id)),
        ...preset.deck.map(id => makeCardInstance(id)),
      ]
      run.startRun({
        sector: 2,
        map: generateGridMaze(2),
        health: 70,
        maxHealth: 70,
        drawCount: 5,
        deck,
        parts: preset.parts.map(id => ALL_PARTS[id]).filter(Boolean),
        equipment: {
          Head: ALL_EQUIPMENT[preset.equipment.Head] ?? null,
          Torso: ALL_EQUIPMENT[preset.equipment.Torso] ?? null,
          Arms: ALL_EQUIPMENT[preset.equipment.Arms] ?? null,
          Legs: ALL_EQUIPMENT[preset.equipment.Legs] ?? null,
        },
        shards: 80,
        combat: null,
        nameDiscovered: true,
        equipPity: 0,
        companionsAcquired: [],
        combatsCleared: 0,
        lastCollapseMessage: null,
        isDebug: true,
      })
      return
    }

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
    if (permanent.workshopUpgrades['practiced-routine']) {
      const nonBasics = SECTOR1_CARD_POOL.filter((c) => !['boost', 'emergency-strike', 'coolant-flush', 'diagnostics'].includes(c.id))
      const picked = nonBasics[Math.floor(Math.random() * nonBasics.length)]
      if (picked) starterDeck.push(makeCardInstance(picked.id))
    }
    // Starting equipment
    const startingEquipment: import('../game/types').RunState['equipment'] = {
      Head: null,
      Torso: null,
      Arms: STARTING_ARMS,
      Legs: null,
    }
    // "Extra Slot" workshop upgrade: equip Scrap Plating in Torso slot
    if (permanent.workshopUpgrades['starting-slot']) {
      startingEquipment.Torso = STARTING_TORSO
    }

    const map = generateGridMaze(1)
    const startMaxHealth = 70 + sumBonus('health')

    run.startRun({
      sector: 1,
      map,
      health: startMaxHealth,
      maxHealth: startMaxHealth,
      drawCount: 5 + sumBonus('drawCount'),
      deck: starterDeck,
      parts: initialParts,
      equipment: startingEquipment,
      shards: sumBonus('shards'),
      combat: null,
      nameDiscovered: permanent.nameEverDiscovered,
      equipPity: 0,
      companionsAcquired: [],
      combatsCleared: 0,
      lastCollapseMessage: null,
    })
  }, [])

  const handleTileSelect = useCallback(async (x: number, y: number) => {
    const map = useRunStore.getState().map
    if (!map || walkingRef.current) return
    setRoomDone(false)

    // Compute path from player to destination
    const path = findPath(map, map.playerX, map.playerY, x, y)
    if (path.length === 0) return

    setAutoPath(path)
    walkingRef.current = true

    const STEP_DELAY = 120 // ms per tile

    // Walk along the path, one tile at a time
    for (let i = 0; i < path.length; i++) {
      const [px, py] = path[i]
      useRunStore.getState().moveToTile(px, py)
      setAutoPath(path.slice(i))

      const currentMap = useRunStore.getState().map!
      const tile = currentMap.grid[py][px]
      if (!tile) continue

      // Skip empty corridors, cleared rooms, and collapsed rooms
      if (tile.type === 'Empty' || tile.cleared || tile.collapsed) {
        if (i < path.length - 1) {
          await new Promise(r => setTimeout(r, STEP_DELAY))
        }
        continue
      }

      // Hit an encounter — stop here
      if (tile.type === 'Combat' || tile.type === 'Boss') {
        const combatsCleared = currentMap.grid.flat().filter(
          r => r && r.cleared && (r.type === 'Combat' || r.type === 'Boss')
        ).length
        const enemies = pickEnemiesForRoom(tile, useRunStore.getState().sector, combatsCleared)
        const remaining = path.slice(i + 1)
        setAutoPath(remaining.length > 0 ? remaining : null)
        walkingRef.current = false
        useRunStore.getState().startCombat(enemies)
        return
      }

      // Non-combat encounter (Rest, Shop, Event) — stop here
      const remaining = path.slice(i + 1)
      setAutoPath(remaining.length > 0 ? remaining : null)
      walkingRef.current = false
      return
    }

    // Reached destination with no encounters along the way
    setAutoPath(null)
    walkingRef.current = false
  }, [])

  const finishRoom = () => {
    run.clearCurrentRoom()
    setAutoPath(null)
    walkingRef.current = false
    setRoomDone(true)
  }

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

  const currentRoom = run.map.grid[run.map.playerY][run.map.playerX]

  const mapWithOverlay = (
    <>
      <MapScreen
        map={run.map}
        combatsCleared={run.combatsCleared}
        collapseMessage={run.lastCollapseMessage}
        autoPath={autoPath}
        onTileSelect={handleTileSelect}
        onDismissCollapse={() => useRunStore.setState((s) => { s.lastCollapseMessage = null })}
      />
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
        alignItems: 'center',
        zIndex: 50,
      }}>
        <span style={{
          padding: '8px 12px',
          backgroundColor: '#16213e',
          border: '1px solid #636e72',
          borderRadius: '6px',
          color: '#dfe6e9',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1px',
        }}>
          Sector {run.sector}
        </span>
        <span style={{
          padding: '8px 12px',
          backgroundColor: '#16213e',
          border: '1px solid #f1c40f',
          borderRadius: '6px',
          color: '#f1c40f',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1px',
        }}>
          {run.shards} shards
        </span>
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

  // Show map when room is done, no room, empty corridor, cleared, or combat/boss type
  if (roomDone || !currentRoom || currentRoom.type === 'Empty' || currentRoom.cleared || currentRoom.collapsed || currentRoom.type === 'Combat' || currentRoom.type === 'Boss') {
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
        sector={run.sector}
        deck={run.deck}
        ownedPartIds={run.parts.map(p => p.id)}
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
        onRecycle={(instanceId) => {
          if (run.shards < 60) return
          run.removeCardFromDeck(instanceId)
          run.addShards(-60)
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
      <>
        <EventScreen
          room={currentRoom}
          nameDiscovered={run.nameDiscovered}
          companionsUnlocked={permanent.companionsUnlocked}
          companionsAcquired={run.companionsAcquired}
          onChoice={(outcome) => {
            if (outcome.type === 'health') run.heal(outcome.value)
            if (outcome.type === 'shards') run.addShards(outcome.value)
            if (outcome.type === 'card') {
              const sectorPool = run.sector >= 2 ? SECTOR2_CARD_POOL : SECTOR1_CARD_POOL
              const nonBasics = sectorPool.filter((c) => !['boost', 'emergency-strike', 'coolant-flush', 'diagnostics'].includes(c.id))
              const picked = nonBasics[Math.floor(Math.random() * nonBasics.length)]
              if (picked) run.addCardToDeck(makeCardInstance(picked.id))
            }
            if (!run.nameDiscovered && !permanent.nameEverDiscovered) {
              run.discoverName()
              permanent.setNameDiscovered()
            }
            if (outcome.type === 'companion' && outcome.companionId) {
              run.addCardToDeck(makeCardInstance(outcome.companionId))
              run.acquireCompanion(outcome.companionId)
            }
            if (outcome.type === 'removeCard') {
              setEventCardRemoval(outcome.value)
              return
            }
            finishRoom()
          }}
        />
        {eventCardRemoval !== null && (
          <CardPicker
            deck={run.deck}
            onSelect={(instanceId) => {
              run.removeCardFromDeck(instanceId)
              if (eventCardRemoval > 0) run.heal(eventCardRemoval)
              setEventCardRemoval(null)
              finishRoom()
            }}
            onCancel={() => {
              setEventCardRemoval(null)
              finishRoom()
            }}
          />
        )}
      </>
    )
  }

  return mapWithOverlay
}
