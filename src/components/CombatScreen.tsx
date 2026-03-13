import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRunStore } from '../store/runStore'
import { usePermanentStore } from '../store/permanentStore'
import { ALL_ENEMIES } from '../data/enemies'
import { resolveDrops, resolveWarperDrop } from '../game/drops'
import { makeCardInstance, projectSlotActions } from '../game/combat'
import { ALL_PARTS, ALL_EQUIPMENT } from '../data/parts'
import { ALL_CARDS, SECTOR1_CARD_POOL, SECTOR2_CARD_POOL } from '../data/cards'
import type { BodySlot, EquipmentDefinition, CombatEvent } from '../game/types'

import useIsMobile from '../hooks/useIsMobile'
import StillPanel from './StillPanel'
import EnemyCard from './EnemyCard'
import BodySlotPanel from './BodySlotPanel'
import HeatTrack from './HeatTrack'
import Hand from './Hand'
import RewardScreen from './RewardScreen'
import EquipCompareOverlay from './EquipCompareOverlay'
import RunInfoOverlay from './RunInfoOverlay'
import DamageNumber from './DamageNumber'
import PartBadges from './PartBadges'

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

  // ─── Animation Replay State ──────────────────────────────────────
  const [animating, setAnimating] = useState(false)
  const [activeSlot, setActiveSlot] = useState<BodySlot | null>(null)
  const [screenFlash, setScreenFlash] = useState(false)
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: number; value: number; color: string
    target: 'still' | string // 'still' or enemyInstanceId
  }>>([])
  const dmgIdRef = useRef(0)
  const animLogRef = useRef<CombatEvent[]>([])
  const [activePartIds, setActivePartIds] = useState<Set<string>>(new Set())
  const rewardDropsRef = useRef<import('../game/drops').ResolvedDrop[] | null>(null)
  const rewardPhaseKey = useRef<string | null>(null)

  // ─── Display State (intermediate values during animation) ───────
  const [displayHealth, setDisplayHealth] = useState<number | null>(null)
  const [displayBlock, setDisplayBlock] = useState<number | null>(null)
  const [displayEnemyHealth, setDisplayEnemyHealth] = useState<Record<string, number> | null>(null)

  // When combat log has events, start animation replay
  useEffect(() => {
    if (!combat || combat.combatLog.length === 0 || animating) return
    // Capture the log and clear it from state
    const events = [...combat.combatLog]
    animLogRef.current = events
    useRunStore.setState((s) => {
      if (s.combat) s.combat.combatLog = []
    })
    setAnimating(true)

    const applyEvent = (event: CombatEvent) => {
      if (event.type === 'slotFire') {
        // Update enemy HP display
        if (event.damages) {
          setDisplayEnemyHealth(prev => {
            if (!prev) return prev
            const next = { ...prev }
            for (const d of event.damages!) {
              if (next[d.enemyId] !== undefined) {
                next[d.enemyId] = Math.max(0, next[d.enemyId] - d.amount)
              }
            }
            return next
          })
          // Show damage numbers per enemy (aggregate repeated hits)
          const perEnemy = new Map<string, number>()
          for (const d of event.damages) {
            perEnemy.set(d.enemyId, (perEnemy.get(d.enemyId) ?? 0) + d.amount)
          }
          for (const [enemyId, total] of perEnemy) {
            const id = ++dmgIdRef.current
            setDamageNumbers(prev => [...prev, { id, value: -total, color: '#e74c3c', target: enemyId }])
          }
        }
        if (event.block) {
          setDisplayBlock(prev => (prev ?? 0) + event.block!)
          const id = ++dmgIdRef.current
          setDamageNumbers(prev => [...prev, { id, value: event.block!, color: '#3498db', target: 'still' }])
        }
        if (event.heal) {
          setDisplayHealth(prev => Math.min(run.maxHealth, (prev ?? run.health) + event.heal!))
          const id = ++dmgIdRef.current
          setDamageNumbers(prev => [...prev, { id, value: event.heal!, color: '#27ae60', target: 'still' }])
        }
      } else if (event.type === 'enemyAction') {
        // Reduce display block by blocked amount
        if (event.blocked && event.blocked > 0) {
          setDisplayBlock(prev => Math.max(0, (prev ?? 0) - event.blocked!))
        }
        if (event.damage && event.damage > 0) {
          setScreenFlash(true)
          setTimeout(() => setScreenFlash(false), 250)
          setDisplayHealth(prev => Math.max(0, (prev ?? run.health) - event.damage!))
          const id = ++dmgIdRef.current
          setDamageNumbers(prev => [...prev, { id, value: -event.damage!, color: '#e74c3c', target: 'still' }])
        } else if (event.blocked && event.blocked > 0) {
          // All damage was blocked — show blue "blocked" number
          const id = ++dmgIdRef.current
          setDamageNumbers(prev => [...prev, { id, value: event.blocked!, color: '#3498db', target: 'still' }])
        }
      } else if (event.type === 'hotPenalty') {
        setScreenFlash(true)
        setTimeout(() => setScreenFlash(false), 250)
        setDisplayHealth(prev => Math.max(0, (prev ?? run.health) - event.damage))
        const id = ++dmgIdRef.current
        setDamageNumbers(prev => [...prev, { id, value: -event.damage, color: '#e67e22', target: 'still' }])
      }
    }

    let idx = 0
    const playNext = () => {
      if (idx >= events.length) {
        // Brief pause at end before clearing display overrides
        setTimeout(() => {
          setAnimating(false)
          setActiveSlot(null)
          setActivePartIds(new Set())
          setDamageNumbers([])
          setDisplayHealth(null)
          setDisplayBlock(null)
          setDisplayEnemyHealth(null)
        }, 300)
        return
      }

      const event = events[idx]
      idx++

      if (event.type === 'slotFire') {
        // Step 1: Highlight the slot
        setActiveSlot(event.slot)
        // Step 2: After a beat, apply effects and show numbers
        setTimeout(() => {
          applyEvent(event)
          // Step 3: Hold so the player can read it, then next
          setTimeout(playNext, 600)
        }, 350)
      } else if (event.type === 'enemyAction') {
        setActiveSlot(null)
        setTimeout(() => {
          applyEvent(event)
          setTimeout(playNext, 550)
        }, 250)
      } else if (event.type === 'hotPenalty') {
        setActiveSlot(null)
        setTimeout(() => {
          applyEvent(event)
          setTimeout(playNext, 500)
        }, 200)
      } else if (event.type === 'partTrigger') {
        // Glow the badge immediately, clear after 600ms, no delay on sequence
        setActivePartIds(prev => new Set([...prev, event.partId]))
        setTimeout(() => {
          setActivePartIds(prev => {
            const next = new Set(prev)
            next.delete(event.partId)
            return next
          })
        }, 600)
        playNext()
      } else if (event.type === 'overheatDamage') {
        setTimeout(playNext, 400)
      } else {
        setTimeout(playNext, 300)
      }
    }

    // Pause before starting replay so Execute click registers visually
    setTimeout(playNext, 300)
  }, [combat?.combatLog.length])

  const projections = useMemo(() => {
    if (!combat) return []
    return projectSlotActions(combat, run.equipment, ALL_CARDS, run.parts)
  }, [combat, run.equipment, run.parts])

  // Projected heat after execution: current heat + LEGS cooling (slots no longer generate heat)
  const projectedHeat = useMemo(() => {
    if (!combat) return 0
    const legsCooling = projections.reduce((sum, p) => sum + p.heatCost, 0)
    return Math.max(0, combat.heat + legsCooling)
  }, [combat, projections])

  // No free passive cooling — heat persists between turns (only LEGS equipment cools)
  const nextRoundHeat = projectedHeat

  // ─── Card Interaction ─────────────────────────────────────────────
  const handleSelectSlotCard = useCallback((instanceId: string | null) => {
    if (animating) return
    setSelectedCardId(instanceId)
  }, [animating])

  const handlePlaySystemCard = useCallback((instanceId: string) => {
    if (animating) return
    run.playCard(instanceId, undefined, targetEnemyId ?? undefined)
    setSelectedCardId(null)
  }, [run, targetEnemyId, animating])

  const handleAssignSlot = useCallback((slot: BodySlot) => {
    if (animating || !selectedCardId) return
    run.playCard(selectedCardId, slot, targetEnemyId ?? undefined)
    setSelectedCardId(null)
  }, [run, selectedCardId, targetEnemyId, animating])

  const handleUnassignSlot = useCallback((slot: BodySlot) => {
    run.unassignSlotModifier(slot)
  }, [run])

  // ─── Execute Turn ─────────────────────────────────────────────────
  const handleExecute = useCallback(() => {
    if (animating || !combat || combat.phase !== 'planning') return
    setSelectedCardId(null)

    // Snapshot current values BEFORE execution so we can animate incrementally
    setDisplayHealth(run.health)
    setDisplayBlock(combat.block)
    const enemySnap: Record<string, number> = {}
    for (const enemy of combat.enemies) {
      enemySnap[enemy.instanceId] = enemy.currentHealth
    }
    setDisplayEnemyHealth(enemySnap)

    // Use effectiveTarget: falls back to first alive enemy if current target is dead
    const aliveTarget = targetEnemyId && combat.enemies.some(e => e.instanceId === targetEnemyId && !e.isDefeated)
      ? targetEnemyId
      : combat.enemies.find(e => !e.isDefeated)?.instanceId
    run.executeTurn(aliveTarget ?? undefined)
  }, [run, combat, targetEnemyId, animating])

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
  if (!animating && combat?.phase === 'reward') {
    // Calculate drops ONCE per reward phase (avoid re-rolling on re-render)
    const phaseKey = combat.enemies.map(e => e.instanceId).join(',')
    if (rewardPhaseKey.current !== phaseKey) {
      rewardPhaseKey.current = phaseKey
      const defeatedEnemies = combat.enemies.filter(e => e.isDefeated)
      let anyEquip = false
      // Use the first enemy with a drop pool to resolve ONE set of drops for the encounter
      const primaryEnemy = defeatedEnemies.find(e => {
        const def = ALL_ENEMIES[e.definitionId]
        return def?.dropPool.length
      })
      let drops: import('../game/drops').ResolvedDrop[] = []
      if (primaryEnemy) {
        const def = ALL_ENEMIES[primaryEnemy.definitionId]!
        const result = resolveDrops(def.dropPool, run.equipPity, run.sector, run.parts.map(p => p.id))
        if (result.droppedEquipment) anyEquip = true
        // Replace card drops with a clean 3-pick from sector pool
        const nonCards = result.drops.filter(d => d.type !== 'card')
        const hasCards = result.drops.some(d => d.type === 'card')
        drops = [...nonCards]
        if (hasCards) {
          const pool = run.sector >= 2 ? SECTOR2_CARD_POOL : SECTOR1_CARD_POOL
          const shuffled = [...pool].sort(() => Math.random() - 0.5)
          drops.push(...shuffled.slice(0, 3).map(c => ({ type: 'card' as const, cardId: c.id })))
        }
      }

      // Run-warping part drop chance for elite/boss encounters
      const hasEliteOrBoss = defeatedEnemies.some(e => {
        const def = ALL_ENEMIES[e.definitionId]
        return def?.isElite || def?.isBoss
      })
      if (hasEliteOrBoss) {
        const ownedWarperIds = run.parts.map(p => p.id)
        const warperDrop = resolveWarperDrop(ownedWarperIds)
        if (warperDrop) drops.push(warperDrop)
      }

      rewardDropsRef.current = drops
      // Store anyEquipDropped in the drops array for later access
      ;(rewardDropsRef.current as any)._anyEquip = anyEquip
    }
    const allDrops = rewardDropsRef.current!
    const anyEquipDropped = (allDrops as any)._anyEquip ?? false

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
            const newDurability = permanent.carriedPart.durability - 1
            permanent.updateCarriedPart({ durability: newDurability })
            if (newDurability === 0) {
              run.removePart(permanent.carriedPart.partId)
            }
          }

          // Post-reward: boss staging/victory, or return to map
          const finishReward = () => {
            const bossDefeated = combat.enemies.filter(e => e.isDefeated).some(e => ALL_ENEMIES[e.definitionId]?.isBoss)
            if (bossDefeated) {
              if (run.sector < 3) {
                // Non-final sector boss — go to staging area
                useRunStore.setState((s) => {
                  if (s.map) {
                    const tile = s.map.grid[s.map.playerY][s.map.playerX]
                    if (tile) tile.cleared = true
                  }
                  s.combat = null
                })
                navigate('/staging')
                return
              }
              // Final sector boss — end the run
              if (!run.isDebug) {
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
              }
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
              s.combat = null
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
  if (!animating && (combat?.phase === 'finished' || (combat && run.health <= 0))) {
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
            if (!run.isDebug) {
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
            }
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
          <div style={{ position: 'relative' }}>
            <StillPanel
              health={displayHealth ?? run.health}
              maxHealth={run.maxHealth}
              heat={combat.heat}
              block={displayBlock ?? combat.block}
              statusEffects={combat.statusEffects}
              compact
              projectedHeat={animating ? combat.heat : projectedHeat}
              nextRoundHeat={animating ? undefined : nextRoundHeat}
            />
            {damageNumbers.filter(dn => dn.target === 'still').map(dn => (
              <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="50%" y="0%" />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {combat.enemies.map(enemy => {
              const def = ALL_ENEMIES[enemy.definitionId]
              if (!def) return null
              const dispHp = displayEnemyHealth?.[enemy.instanceId]
              const dispDefeated = dispHp != null ? dispHp <= 0 : enemy.isDefeated
              const inst = dispHp != null ? { ...enemy, currentHealth: Math.max(0, dispHp), isDefeated: dispDefeated } : enemy
              return (
                <div key={enemy.instanceId} style={{ position: 'relative' }}>
                  <EnemyCard
                    instance={inst}
                    definition={def}
                    selected={effectiveTarget === enemy.instanceId}
                    onClick={() => {
                      if (!dispDefeated) setTargetEnemyId(enemy.instanceId)
                    }}
                    compact
                  />
                  {damageNumbers.filter(dn => dn.target === enemy.instanceId).map(dn => (
                    <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="70%" y="30%" />
                  ))}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        // Desktop: side-by-side
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <StillPanel
              health={displayHealth ?? run.health}
              maxHealth={run.maxHealth}
              heat={combat.heat}
              block={displayBlock ?? combat.block}
              statusEffects={combat.statusEffects}
            />
            {damageNumbers.filter(dn => dn.target === 'still').map(dn => (
              <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="50%" y="20%" />
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {combat.enemies.filter(e => !e.isDefeated).length > 1 && (
              <div style={{ width: '100%', fontSize: '11px', color: '#f1c40f', marginBottom: '-4px' }}>
                Click an enemy to set target
              </div>
            )}
            {combat.enemies.map(enemy => {
              const def = ALL_ENEMIES[enemy.definitionId]
              if (!def) return null
              const dispHp = displayEnemyHealth?.[enemy.instanceId]
              const dispDefeated = dispHp != null ? dispHp <= 0 : enemy.isDefeated
              const inst = dispHp != null ? { ...enemy, currentHealth: Math.max(0, dispHp), isDefeated: dispDefeated } : enemy
              return (
                <div key={enemy.instanceId} style={{ position: 'relative' }}>
                  <EnemyCard
                    instance={inst}
                    definition={def}
                    selected={effectiveTarget === enemy.instanceId}
                    onClick={() => {
                      if (!dispDefeated) setTargetEnemyId(enemy.instanceId)
                    }}
                  />
                  {damageNumbers.filter(dn => dn.target === enemy.instanceId).map(dn => (
                    <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="50%" y="40%" />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Body Slot Panel */}
      <BodySlotPanel
        combat={combat}
        equipment={run.equipment}
        parts={run.parts}
        selectedCardId={selectedCardId}
        projections={projections}
        onAssign={handleAssignSlot}
        onUnassign={handleUnassignSlot}
        compact={isMobile}
        activeSlot={activeSlot}
      />

      {/* Heat Track — hidden on mobile (heat shown in compact StillPanel) */}
      {!isMobile && (
        <HeatTrack
          heat={combat.heat}
          projectedHeat={animating ? combat.heat : projectedHeat}
          nextRoundHeat={animating ? undefined : nextRoundHeat}
          heatLocked={combat.heatLocked}
          heatLockTurnsLeft={combat.heatLockTurnsLeft}
          heatDebt={combat.heatDebt}
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
        // Sticky bottom bar + part badges on mobile
        <>
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
              Sector {run.sector} · Round {combat.roundNumber}
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
            <button
              onClick={handleExecute}
              disabled={animating || combat.phase !== 'planning'}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: !animating && combat.phase === 'planning' ? '#a29bfe' : '#2c3e50',
                border: 'none',
                color: !animating && combat.phase === 'planning' ? '#0d0d1a' : '#555',
                borderRadius: '6px',
                cursor: !animating && combat.phase === 'planning' ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '2px',
              }}
            >
              EXECUTE
            </button>
          </div>
          {run.parts.length > 0 && (
            <PartBadges parts={run.parts} activePartIds={activePartIds} />
          )}
        </>
      ) : (
        // Desktop: centered button + round info
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleExecute}
              disabled={animating || combat.phase !== 'planning'}
              style={{
                padding: '14px 48px',
                backgroundColor: !animating && combat.phase === 'planning' ? '#a29bfe' : '#2c3e50',
                border: 'none',
                color: !animating && combat.phase === 'planning' ? '#0d0d1a' : '#555',
                borderRadius: '8px',
                cursor: !animating && combat.phase === 'planning' ? 'pointer' : 'not-allowed',
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
            <span>Sector {run.sector}</span>
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

      {/* Screen flash on damage */}
      {screenFlash && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(231, 76, 60, 0.15)',
          pointerEvents: 'none',
          zIndex: 200,
          animation: 'screenFlash 200ms ease-out forwards',
        }}>
          <style>{`
            @keyframes screenFlash {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Damage numbers are now rendered inline with their target elements */}
    </div>
  )
}
