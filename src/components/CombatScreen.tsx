import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRunStore } from '../store/runStore'
import { usePermanentStore } from '../store/permanentStore'
import { ALL_ENEMIES } from '../data/enemies'
import { resolveDrops } from '../game/drops'
import { makeCardInstance, projectSlotActions } from '../game/combat'
import { ALL_PARTS, ALL_EQUIPMENT } from '../data/parts'
import { ALL_CARDS } from '../data/cards'
import type { BodySlot, EquipmentDefinition } from '../game/types'
import { HEAT_MAX, OVERHEAT_RESET, applyPassiveCooling } from '../game/types'

import useIsMobile from '../hooks/useIsMobile'
import StillPanel from './StillPanel'
import EnemyCard from './EnemyCard'
import BodySlotPanel from './BodySlotPanel'
import HeatTrack from './HeatTrack'
import Hand from './Hand'
import RewardScreen from './RewardScreen'
import EquipCompareOverlay from './EquipCompareOverlay'
import RunInfoOverlay from './RunInfoOverlay'

export default function CombatScreen() {
  const navigate = useNavigate()
  const run = useRunStore()
  const permanent = usePermanentStore()
  const combat = run.combat

  const isMobile = useIsMobile()
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [targetEnemyId, setTargetEnemyId] = useState<string | null>(null)
  const [equipConflicts, setEquipConflicts] = useState<EquipmentDefinition[]>([])
  const [pendingPostReward, setPendingPostReward] = useState<(() => void) | null>(null)
  const [infoTab, setInfoTab] = useState<'deck' | 'equips' | null>(null)

  const projections = useMemo(() => {
    if (!combat || combat.shutdown) return []
    return projectSlotActions(combat, run.equipment, ALL_CARDS, run.parts)
  }, [combat, run.equipment, run.parts])

  const projectedHeat = useMemo(() => {
    if (!combat) return 0
    const totalHeatCost = projections.reduce((sum, p) => sum + p.heatCost, 0)
    return Math.min(HEAT_MAX, combat.heat + totalHeatCost)
  }, [combat, projections])

  const nextRoundHeat = useMemo(() => {
    const postExecute = projectedHeat >= HEAT_MAX ? OVERHEAT_RESET : projectedHeat
    return applyPassiveCooling(postExecute, run.passiveCoolingBonus)
  }, [projectedHeat, run.passiveCoolingBonus])

  // ─── Card Interaction ─────────────────────────────────────────────
  const handleSelectSlotCard = useCallback((instanceId: string | null) => {
    setSelectedCardId(instanceId)
  }, [])

  const handlePlaySystemCard = useCallback((instanceId: string) => {
    run.playCard(instanceId, undefined, targetEnemyId ?? undefined)
    setSelectedCardId(null)
  }, [run, targetEnemyId])

  const handleAssignSlot = useCallback((slot: BodySlot) => {
    if (!selectedCardId) return
    run.playCard(selectedCardId, slot, targetEnemyId ?? undefined)
    setSelectedCardId(null)
  }, [run, selectedCardId, targetEnemyId])

  const handleUnassignSlot = useCallback((slot: BodySlot) => {
    run.unassignSlotModifier(slot)
  }, [run])

  // ─── Execute Turn ─────────────────────────────────────────────────
  const handleExecute = useCallback(() => {
    if (!combat || combat.phase !== 'planning') return
    setSelectedCardId(null)
    run.executeTurn(targetEnemyId ?? undefined)
  }, [run, combat, targetEnemyId])

  // ─── Equipment conflict resolution ──────────────────────────────
  if (equipConflicts.length > 0 && pendingPostReward) {
    const incoming = equipConflicts[0]
    const current = run.equipment[incoming.slot]!

    const resolveConflict = (equip: boolean) => {
      if (equip) run.equipItem(incoming)
      const remaining = equipConflicts.slice(1)
      if (remaining.length > 0) {
        setEquipConflicts(remaining)
      } else {
        setEquipConflicts([])
        pendingPostReward()
        setPendingPostReward(null)
      }
    }

    return (
      <EquipCompareOverlay
        current={current}
        incoming={incoming}
        onKeep={() => resolveConflict(false)}
        onEquip={() => resolveConflict(true)}
      />
    )
  }

  // ─── Reward Phase ─────────────────────────────────────────────────
  if (combat?.phase === 'reward') {
    // Calculate drops from defeated enemies
    const defeatedEnemies = combat.enemies.filter(e => e.isDefeated)
    let anyEquipDropped = false
    const allDrops = defeatedEnemies.flatMap(e => {
      const def = ALL_ENEMIES[e.definitionId]
      if (!def?.dropPool.length) return []
      const result = resolveDrops(def.dropPool, run.equipPity)
      if (result.droppedEquipment) anyEquipDropped = true
      return result.drops
    })

    // Auto-collect shards
    const shardDrops = allDrops.filter(d => d.type === 'shards')
    const totalShards = shardDrops.reduce((s, d) => s + (d.type === 'shards' ? d.amount : 0), 0)

    // Part drops — auto-add to parts
    const partDrops = allDrops.filter(d => d.type === 'part')

    return (
      <RewardScreen
        drops={allDrops}
        onChoose={(cardId) => {
          // Collect shards
          if (totalShards > 0) {
            run.addShards(totalShards)
            const shardBonus = permanent.workshopUpgrades['sharp-eye'] ? Math.floor(totalShards * 0.2) : 0
            if (shardBonus > 0) run.addShards(shardBonus)
          }
          // Auto-add part drops
          for (const drop of partDrops) {
            if (drop.type === 'part') {
              const partDef = ALL_PARTS[drop.partId]
              if (partDef) run.addPart(partDef)
            }
          }
          // Split equipment drops: auto-equip empty slots, collect conflicts
          const equipDrops = allDrops.filter(d => d.type === 'equipment')
          const conflicts: EquipmentDefinition[] = []
          for (const drop of equipDrops) {
            if (drop.type === 'equipment') {
              const equipDef = ALL_EQUIPMENT[drop.equipmentId]
              if (!equipDef) continue
              if (run.equipment[equipDef.slot] === null) {
                run.equipItem(equipDef)
              } else {
                conflicts.push(equipDef)
              }
            }
          }
          // Add chosen card
          if (cardId) {
            run.addCardToDeck(makeCardInstance(cardId))
          }
          // Update equipment pity counter
          useRunStore.setState((s) => ({
            ...s,
            equipPity: anyEquipDropped ? 0 : s.equipPity + 1,
          }))
          // Decrement carried part durability
          if (permanent.carriedPart && permanent.carriedPart.durability > 0) {
            permanent.updateCarriedPart({ durability: permanent.carriedPart.durability - 1 })
          }

          // Post-reward: either boss end or return to map
          const finishReward = () => {
            const bossDefeated = defeatedEnemies.some(e => ALL_ENEMIES[e.definitionId]?.isBoss)
            if (bossDefeated) {
              permanent.addShards(run.shards)
              permanent.addRunHistory({
                id: `run-${Date.now()}`,
                date: new Date().toISOString(),
                sectorReached: run.sector,
                outcome: 'victory',
                message: 'Cleared the sector.',
                notable: run.parts.map(p => p.name),
              })
              permanent.save()
              run.endRun()
              navigate('/', {
                state: {
                  runEnd: true,
                  outcome: 'victory',
                  message: 'Cleared the sector.',
                  parts: run.parts,
                  shards: run.shards,
                },
              })
              return
            }
            // Normal combat end — mark room cleared and return to map
            useRunStore.setState((s) => {
              if (s.map) {
                const tile = s.map.grid[s.map.playerY][s.map.playerX]
                if (tile) tile.cleared = true
              }
              return { ...s, combat: null }
            })
          }

          // If there are equipment conflicts, show comparison overlay(s) before finishing
          if (conflicts.length > 0) {
            setEquipConflicts(conflicts)
            setPendingPostReward(() => finishReward)
          } else {
            finishReward()
          }
        }}
      />
    )
  }

  // ─── Defeat ───────────────────────────────────────────────────────
  if (combat?.phase === 'finished' || (combat && run.health <= 0)) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0d0d1a',
        color: '#e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
      }}>
        <h2 style={{ letterSpacing: '3px', color: '#e74c3c' }}>DEFEATED</h2>
        <p style={{ color: '#888', fontSize: '13px', fontStyle: 'italic' }}>
          The maze continues without you.
        </p>
        <button
          onClick={() => {
            // Transfer shards to permanent store
            permanent.addShards(run.shards)
            // Record run history
            permanent.addRunHistory({
              id: `run-${Date.now()}`,
              date: new Date().toISOString(),
              sectorReached: run.sector,
              outcome: 'defeat',
              message: 'Fell in combat.',
              notable: run.parts.map(p => p.name),
            })
            permanent.save()
            run.endRun()
            navigate('/', {
              state: {
                runEnd: true,
                outcome: 'defeat',
                message: 'Fell in combat.',
                parts: run.parts,
                shards: run.shards,
              },
            })
          }}
          style={{
            padding: '12px 40px',
            backgroundColor: '#e74c3c',
            border: 'none',
            color: '#fff',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
          }}
        >
          Return
        </button>
      </div>
    )
  }

  if (!combat) return null

  // ─── Main Combat UI ───────────────────────────────────────────────
  const firstAliveEnemy = combat.enemies.find(e => !e.isDefeated)
  const targetAlive = targetEnemyId && combat.enemies.some(e => e.instanceId === targetEnemyId && !e.isDefeated)
  const effectiveTarget = (targetAlive ? targetEnemyId : null) ?? firstAliveEnemy?.instanceId ?? null

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '6px' : '12px',
      padding: isMobile ? '8px 8px 60px 8px' : '16px',
    }}>
      {/* Top section: Still panel + Enemies */}
      {isMobile ? (
        // Mobile: stack vertically
        <>
          <StillPanel
            health={run.health}
            maxHealth={run.maxHealth}
            heat={combat.heat}
            block={combat.block}
            statusEffects={combat.statusEffects}
            shutdown={combat.shutdown}
            compact
            projectedHeat={projectedHeat}
            nextRoundHeat={nextRoundHeat}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {combat.enemies.map(enemy => {
              const def = ALL_ENEMIES[enemy.definitionId]
              if (!def) return null
              return (
                <EnemyCard
                  key={enemy.instanceId}
                  instance={enemy}
                  definition={def}
                  selected={effectiveTarget === enemy.instanceId}
                  onClick={() => {
                    if (!enemy.isDefeated) setTargetEnemyId(enemy.instanceId)
                  }}
                  compact
                />
              )
            })}
          </div>
        </>
      ) : (
        // Desktop: side-by-side
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <StillPanel
            health={run.health}
            maxHealth={run.maxHealth}
            heat={combat.heat}
            block={combat.block}
            statusEffects={combat.statusEffects}
            shutdown={combat.shutdown}
          />
          <div style={{ flex: 1, display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {combat.enemies.filter(e => !e.isDefeated).length > 1 && (
              <div style={{ width: '100%', fontSize: '11px', color: '#f1c40f', marginBottom: '-4px' }}>
                Click an enemy to set target
              </div>
            )}
            {combat.enemies.map(enemy => {
              const def = ALL_ENEMIES[enemy.definitionId]
              if (!def) return null
              return (
                <EnemyCard
                  key={enemy.instanceId}
                  instance={enemy}
                  definition={def}
                  selected={effectiveTarget === enemy.instanceId}
                  onClick={() => {
                    if (!enemy.isDefeated) setTargetEnemyId(enemy.instanceId)
                  }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Body Slot Panel */}
      <BodySlotPanel
        combat={combat}
        equipment={run.equipment}
        selectedCardId={selectedCardId}
        projections={projections}
        onAssign={handleAssignSlot}
        onUnassign={handleUnassignSlot}
        compact={isMobile}
      />

      {/* Heat Track — hidden on mobile (heat shown in compact StillPanel) */}
      {!isMobile && (
        <HeatTrack
          heat={combat.heat}
          projectedHeat={projectedHeat}
          nextRoundHeat={nextRoundHeat}
        />
      )}

      {/* Hand */}
      <div style={{
        backgroundColor: '#16213e',
        border: '1px solid #2c3e50',
        borderRadius: isMobile ? '6px' : '8px',
        padding: isMobile ? '4px' : '8px',
      }}>
        <div style={{
          fontSize: isMobile ? '10px' : '11px',
          color: '#aaa',
          letterSpacing: '1px',
          marginBottom: isMobile ? '2px' : '6px',
          paddingLeft: isMobile ? '4px' : '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>
            HAND
            {selectedCardId && (
              <span style={{ color: '#a29bfe', marginLeft: '8px', fontWeight: 'normal' }}>
                {isMobile ? 'Tap a slot' : 'Select a body slot to assign modifier'}
              </span>
            )}
          </span>
          {!isMobile && (
            <span style={{ color: '#555' }}>
              Draw: {combat.drawPile.length} | Discard: {combat.discardPile.length} | Exhaust: {combat.exhaustPile.length}
            </span>
          )}
        </div>
        <Hand
          combat={combat}
          selectedCardId={selectedCardId}
          onSelectSlotCard={handleSelectSlotCard}
          onPlaySystemCard={handlePlaySystemCard}
          compact={isMobile}
        />
      </div>

      {/* Execute section */}
      {isMobile ? (
        // Sticky bottom bar on mobile
        <div style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#0d0d1a',
          borderTop: '1px solid #2c3e50',
          padding: '8px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap' }}>
            R{combat.roundNumber}
          </span>
          <button
            onClick={() => setInfoTab('equips')}
            style={{
              background: 'none',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#74b9ff',
              fontSize: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              whiteSpace: 'nowrap',
            }}
          >
            Info
          </button>
          {effectiveTarget && (() => {
            const targetEnemy = combat.enemies.find(e => e.instanceId === effectiveTarget)
            if (!targetEnemy || targetEnemy.isDefeated) return null
            const targetDef = ALL_ENEMIES[targetEnemy.definitionId]
            return (
              <span style={{ fontSize: '11px', color: '#f1c40f', whiteSpace: 'nowrap' }}>
                {targetDef?.name ?? '???'}
              </span>
            )
          })()}
          <button
            onClick={handleExecute}
            disabled={combat.phase !== 'planning'}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: combat.phase === 'planning' ? '#a29bfe' : '#2c3e50',
              border: 'none',
              color: combat.phase === 'planning' ? '#0d0d1a' : '#555',
              borderRadius: '6px',
              cursor: combat.phase === 'planning' ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '2px',
            }}
          >
            EXECUTE
          </button>
        </div>
      ) : (
        // Desktop: centered button + round info
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            {effectiveTarget && (() => {
              const targetEnemy = combat.enemies.find(e => e.instanceId === effectiveTarget)
              if (!targetEnemy || targetEnemy.isDefeated) return null
              const targetDef = ALL_ENEMIES[targetEnemy.definitionId]
              return (
                <span style={{ fontSize: '12px', color: '#f1c40f' }}>
                  Target: {targetDef?.name ?? '???'}
                </span>
              )
            })()}
            <button
              onClick={handleExecute}
              disabled={combat.phase !== 'planning'}
              style={{
                padding: '14px 48px',
                backgroundColor: combat.phase === 'planning' ? '#a29bfe' : '#2c3e50',
                border: 'none',
                color: combat.phase === 'planning' ? '#0d0d1a' : '#555',
                borderRadius: '8px',
                cursor: combat.phase === 'planning' ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '2px',
              }}
            >
              EXECUTE
            </button>
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#555',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span>Round {combat.roundNumber}</span>
            <button
              onClick={() => setInfoTab('equips')}
              style={{
                background: 'none',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#74b9ff',
                fontSize: '11px',
                cursor: 'pointer',
                padding: '2px 10px',
                letterSpacing: '1px',
              }}
            >
              Info
            </button>
          </div>
        </>
      )}

      {/* Run Info Overlay */}
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
    </div>
  )
}
