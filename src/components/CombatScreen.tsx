import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRunStore } from '../store/runStore'
import { usePermanentStore } from '../store/permanentStore'
import { ALL_ENEMIES } from '../data/enemies'
import { resolveDrops, resolveWarperDrop } from '../game/drops'
import { collapseRandomRoom } from '../game/mapGen'
import { makeCardInstance, projectSlotActions } from '../game/combat'
import { ALL_PARTS, ALL_EQUIPMENT, getPartSector } from '../data/parts'
import { ALL_CARDS } from '../data/cards'
import type { BodySlot, EquipmentDefinition, BehavioralPartDefinition, CombatEvent } from '../game/types'
import { MAX_PARTS } from '../game/types'

import useScreenLayout from '../hooks/useScreenLayout'
import RewardScreen, { type RewardTier } from './RewardScreen'
import EquipCompareOverlay from './EquipCompareOverlay'
import RunInfoOverlay from './RunInfoOverlay'
import PartBadges from './PartBadges'

// New layout components
import CombatTopBar from './CombatTopBar'
import ThreatGrid from './ThreatGrid'
import BattleLog from './BattleLog'
import PlayerZone from './PlayerZone'
import ActionBar from './ActionBar'
import CombatStage from './CombatStage'
import ControlDeck from './ControlDeck'

export default function CombatScreen() {
  const navigate = useNavigate()
  const run = useRunStore()
  const permanent = usePermanentStore()
  const combat = run.combat

  const layout = useScreenLayout()
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [pushed, setPushed] = useState(false)
  const [targetEnemyId, setTargetEnemyId] = useState<string | null>(null)
  const [equipConflicts, setEquipConflicts] = useState<EquipmentDefinition[]>([])
  const [partReplacements, setPartReplacements] = useState<BehavioralPartDefinition[]>([])
  const [pendingPostReward, setPendingPostReward] = useState<(() => void) | null>(null)
  const [infoTab, setInfoTab] = useState<'deck' | 'equips' | null>(null)
  const [pileView, setPileView] = useState<'draw' | 'discard' | 'exhaust' | null>(null)

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
        // Damage reduction from LEGS — show teal number on still
        if (event.reduced && event.reduced > 0) {
          const id = ++dmgIdRef.current
          setDamageNumbers(prev => [...prev, { id, value: event.reduced!, color: '#1abc9c', target: 'still' }])
        }
        // Counter damage (retaliate, thorns, voltage) — show on the attacking enemy
        if (event.counterDamage && event.counterDamage > 0) {
          setDisplayEnemyHealth(prev => {
            if (!prev) return prev
            const next = { ...prev }
            if (next[event.enemyId] !== undefined) {
              next[event.enemyId] = Math.max(0, next[event.enemyId] - event.counterDamage!)
            }
            return next
          })
          const id = ++dmgIdRef.current
          setDamageNumbers(prev => [...prev, { id, value: -event.counterDamage!, color: '#e74c3c', target: event.enemyId }])
        }
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

  // ─── Card Interaction ─────────────────────────────────────────────
  const handleSelectSlotCard = useCallback((instanceId: string | null) => {
    if (animating) return
    // Free-play cards (companions, vent) play immediately without slot selection
    if (instanceId && combat) {
      const cardInst = combat.hand.find(c => c.instanceId === instanceId)
      if (cardInst) {
        const baseDef = ALL_CARDS[cardInst.definitionId]
        const def = cardInst.isUpgraded && baseDef?.upgraded ? baseDef.upgraded : baseDef
        if (def?.freePlay) {
          // Some freePlay cards need slot targeting — go through slot selection flow
          const needsSlotTarget = def.category.type === 'system' &&
            def.category.effects.some(e => e.type === 'applyFeedback' || e.type === 'disableOwnSlot')
          if (!needsSlotTarget) {
            const homeSlot = def.category.type === 'system' ? def.category.homeSlot : undefined
            run.playCard(instanceId, homeSlot ?? 'Head', targetEnemyId ?? undefined, false)
            return
          }
        }
      }
    }
    setSelectedCardId(instanceId)
    setPushed(false)
  }, [animating, combat, run, targetEnemyId])

  const handleAssignSlot = useCallback((slot: BodySlot) => {
    if (animating || !selectedCardId) return
    run.playCard(selectedCardId, slot, targetEnemyId ?? undefined, pushed)
    setSelectedCardId(null)
    setPushed(false)
  }, [run, selectedCardId, targetEnemyId, animating, pushed])

  // (handleUnassignSlot removed — the new layouts use the existing playCard flow only;
  // unassignment will return when we add a "tap a filled slot to remove" interaction.)

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

  // ─── Part replacement resolution ────────────────────────────────
  if (partReplacements.length > 0 && pendingPostReward) {
    const incoming = partReplacements[0]

    const resolvePartChoice = (replacePartId: string | null) => {
      if (replacePartId) {
        run.replacePart(replacePartId, incoming)
      }
      const remaining = partReplacements.slice(1)
      if (remaining.length > 0) {
        setPartReplacements(remaining)
      } else {
        setPartReplacements([])
        pendingPostReward()
        setPendingPostReward(null)
      }
    }

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
      }}>
        <div style={{
          backgroundColor: '#1e1e2e', border: '2px solid #4a4a6a', borderRadius: '12px',
          padding: '20px', maxWidth: '340px', width: '90%', color: '#e8e8e8',
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', color: '#f39c12' }}>
            Parts Full (4/4)
          </div>
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#aaa' }}>New part found:</div>
          <div style={{
            padding: '8px', backgroundColor: 'rgba(243,156,18,0.15)', border: '1px solid #f39c12',
            borderRadius: '6px', marginBottom: '12px',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{incoming.name}</div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{incoming.description}</div>
          </div>
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#aaa' }}>Replace one:</div>
          {run.parts.map(part => (
            <div
              key={part.id}
              onClick={() => resolvePartChoice(part.id)}
              style={{
                padding: '8px', marginBottom: '4px', backgroundColor: '#16213e',
                border: '1px solid #2c3e50', borderRadius: '6px', cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{part.name}</div>
              <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{part.description}</div>
            </div>
          ))}
          <div
            onClick={() => resolvePartChoice(null)}
            style={{
              padding: '8px', marginTop: '8px', textAlign: 'center',
              backgroundColor: '#2c3e50', borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', color: '#aaa',
            }}
          >
            Skip
          </div>
        </div>
      </div>
    )
  }

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
        const ownedEquipIds = Object.values(run.equipment).filter(Boolean).map(e => e!.id)
        const encType: import('../game/drops').EncounterType = def.isBoss ? 'boss' : def.isElite ? 'elite' : 'normal'
        const result = resolveDrops(def.dropPool, run.equipPity, run.sector, run.parts.map(p => p.id), ownedEquipIds, encType)
        if (result.droppedEquipment) anyEquip = true
        drops = result.drops
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

    // Pick a comfort option based on current run state
    const pickComfort = () => {
      if (run.health < run.maxHealth * 0.5) return { id: 'heal', label: 'Rest', description: 'Heal 8 HP' }
      if (combat.strain >= 10) return { id: 'relief', label: 'Relief', description: '-4 strain' }
      return { id: 'companion', label: 'Companion', description: '-2 strain' }
    }
    const comfort = pickComfort()

    const proceedCommon = (
      cardId: string | undefined,
      skippedPartSet: Set<string>,
      skippedEquipSet: Set<string>,
    ) => {
          // Collect shards
          if (totalShards > 0) {
            run.addShards(totalShards)
            const shardBonus = permanent.workshopUpgrades['sharp-eye'] ? Math.floor(totalShards * 0.2) : 0
            if (shardBonus > 0) run.addShards(shardBonus)
          }
          // Add part drops — auto-add if under limit, queue replacements if at capacity
          const pendingParts: BehavioralPartDefinition[] = []
          for (const drop of partDrops) {
            if (drop.type === 'part' && !skippedPartSet.has(drop.partId)) {
              const partDef = ALL_PARTS[drop.partId]
              if (!partDef) continue
              if (run.parts.length < MAX_PARTS) {
                run.addPart(partDef)
              } else {
                pendingParts.push(partDef)
              }
            }
          }
          // Split equipment drops: auto-equip empty slots, collect conflicts (unless skipped)
          const equipDrops = allDrops.filter(d => d.type === 'equipment')
          const conflicts: EquipmentDefinition[] = []
          for (const drop of equipDrops) {
            if (drop.type === 'equipment') {
              if (skippedEquipSet.has(drop.equipmentId)) continue
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
          // Post-reward: boss staging/victory, or return to map
          const finishReward = async () => {
            const bossDefeated = combat.enemies.filter(e => e.isDefeated).some(e => ALL_ENEMIES[e.definitionId]?.isBoss)
            if (bossDefeated) {
              if (run.sector < 2) {
                // Non-final sector boss — go to staging area
                useRunStore.setState((s) => {
                  if (s.map) {
                    const tile = s.map.grid[s.map.playerY][s.map.playerX]
                    if (tile) tile.cleared = true
                  }
                })
                useRunStore.getState().finishCombat()
                useRunStore.getState().saveRun()
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
                  deck: run.deck.map(c => c.definitionId + (c.isUpgraded ? '+' : '')),
                  equipment: Object.fromEntries(
                    Object.entries(run.equipment).map(([slot, eq]) => [slot, eq?.name ?? null])
                  ),
                  parts: run.parts.map(p => p.name),
                  combatsCleared: run.combatsCleared,
                  health: run.health,
                })
                // Archive new parts from this run
                for (const part of run.parts) {
                  permanent.addToArchive(part.id, getPartSector(part.id))
                }
                // Trigger cooldown on carried part (if it was active — sector was reached)
                if (permanent.selectedArchivePart && run.carriedPartSector && run.carriedPartSector <= run.sector) {
                  permanent.triggerCooldown(permanent.selectedArchivePart)
                }
                permanent.decrementAllCooldowns()
                await permanent.save()
              }
              const endParts = [...run.parts]
              run.endRun()
              navigate('/', {
                state: {
                  runEnd: true,
                  outcome: 'victory',
                  message: 'Cleared the sector.',
                  parts: endParts,
                },
              })
              return
            }
            // Normal combat end — mark room cleared, increment combatsCleared, maybe collapse
            useRunStore.setState((s) => {
              if (s.map) {
                const tile = s.map.grid[s.map.playerY][s.map.playerX]
                if (tile) tile.cleared = true
              }
              s.combatsCleared += 1
              // Trigger collapse at every 3rd combat (3, 6, 9)
              if (s.combatsCleared % 3 === 0 && s.map) {
                const collapsed = collapseRandomRoom(s.map)
                if (collapsed) {
                  s.lastCollapseMessage = `A ${collapsed.type} room has collapsed!`
                }
              }
            })
            useRunStore.getState().finishCombat()
            useRunStore.getState().saveRun()
          }

          // Chain: part replacements → equipment conflicts → finishReward
          const afterPartReplacements = () => {
            if (conflicts.length > 0) {
              setEquipConflicts(conflicts)
              setPendingPostReward(() => finishReward)
            } else {
              finishReward()
            }
          }

          if (pendingParts.length > 0) {
            setPartReplacements(pendingParts)
            setPendingPostReward(() => afterPartReplacements)
          } else if (conflicts.length > 0) {
            setEquipConflicts(conflicts)
            setPendingPostReward(() => finishReward)
          } else {
            finishReward()
          }
    }

    const handleReward = (
      cardId: string | undefined,
      skippedPartIds: string[],
      skippedEquipIds: string[],
      acceptedTiers: RewardTier[],
    ) => {
      // Bill strain for accepted tiers (writes into combat.strain during reward phase)
      for (const tier of acceptedTiers) {
        run.applyGrowthStrainCost(tier)
      }
      proceedCommon(cardId, new Set(skippedPartIds), new Set(skippedEquipIds))
    }

    const handleComfort = (comfortId: string) => {
      // Apply comfort directly to CombatState.strain / health (so finishCombat captures it)
      if (comfortId === 'heal') {
        run.heal(8)
      } else if (comfortId === 'relief') {
        useRunStore.setState((s) => {
          if (s.combat) s.combat.strain = Math.max(0, s.combat.strain - 4)
        })
      } else if (comfortId === 'companion') {
        useRunStore.setState((s) => {
          if (s.combat) s.combat.strain = Math.max(0, s.combat.strain - 2)
        })
      }
      // Skip all growth drops — pass all part/equip IDs as skipped, no card, no accepted tiers
      const skipParts = allDrops.flatMap(d => d.type === 'part' ? [d.partId] : [])
      const skipEquips = allDrops.flatMap(d => d.type === 'equipment' ? [d.equipmentId] : [])
      proceedCommon(undefined, new Set(skipParts), new Set(skipEquips))
    }

    return (
      <>
      <RewardScreen
        drops={allDrops}
        strain={combat.strain}
        maxStrain={combat.maxStrain}
        comfort={comfort}
        onChoose={handleReward}
        onComfort={handleComfort}
      />
      {/* Info buttons on reward screen */}
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
  }

  // ─── Forfeit (strain hit cap) ─────────────────────────────────────
  if (!animating && combat?.phase === 'forfeit') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0d0d1a',
        color: '#e8e8e8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 20,
      }}>
        <div style={{ fontSize: 28, fontWeight: 300, color: '#636e72' }}>You stopped.</div>
        <div style={{ fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 360 }}>
          Strain reached {combat.maxStrain}. The fight ends. No rewards this time.
          <br />
          Strain drops to {combat.strain}, then settles further between rooms.
        </div>
        <button
          onClick={() => {
            // Mark room cleared so the player doesn't re-enter this combat, then finishCombat
            useRunStore.setState((s) => {
              if (s.map) {
                const tile = s.map.grid[s.map.playerY][s.map.playerX]
                if (tile) tile.cleared = true
              }
            })
            run.finishCombat()
            useRunStore.getState().saveRun()
          }}
          style={{
            padding: '12px 32px',
            background: '#2d3436',
            border: '1px solid #636e72',
            borderRadius: 6,
            color: '#dfe6e9',
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
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
          onClick={async () => {
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
                deck: run.deck.map(c => c.definitionId + (c.isUpgraded ? '+' : '')),
                equipment: Object.fromEntries(
                  Object.entries(run.equipment).map(([slot, eq]) => [slot, eq?.name ?? null])
                ),
                parts: run.parts.map(p => p.name),
                combatsCleared: run.combatsCleared,
                health: run.health,
              })
              // Archive new parts from this run (no cooldown on defeat)
              for (const part of run.parts) {
                const partSector = (run.carriedPartSector && part.id === permanent.selectedArchivePart) ? run.carriedPartSector : run.sector as 1 | 2
                permanent.addToArchive(part.id, partSector)
              }
              permanent.decrementAllCooldowns()
              await permanent.save()
            }
            const endParts = [...run.parts]
            run.endRun()
            navigate('/', {
              state: {
                runEnd: true,
                outcome: 'defeat',
                message: 'Fell in combat.',
                parts: endParts,
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

  // ─── Portrait Layout (paper-doll) ─────────────────────────────────
  if (layout === 'portrait') {
    const hint = selectedCardId
      ? 'Tap a body slot to assign. Re-tap a card to deselect.'
      : 'Tap a card, then tap a body slot to assign.'
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0e0b1c 0%, #0a0815 50%, #07050d 100%)',
        color: '#e9e4f5',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '8px 16px 12px 16px',
      }}>
        <CombatTopBar
          sector={run.sector}
          round={combat.roundNumber}
          strain={combat.strain}
          maxStrain={combat.maxStrain}
          variant="bar"
        />
        <ThreatGrid
          combat={combat}
          effectiveTarget={effectiveTarget}
          combatsCleared={run.combatsCleared}
          damageNumbers={damageNumbers}
          displayEnemyHealth={displayEnemyHealth}
          onTarget={setTargetEnemyId}
        />
        {/* Bottom group — pins to the bottom of the viewport so any extra space sits above */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <BattleLog combat={combat} lines={3} variant="portrait" />
          <PlayerZone
            combat={combat}
            run={{ health: run.health, maxHealth: run.maxHealth, parts: run.parts, equipment: run.equipment }}
            selectedCardId={selectedCardId}
            pushed={pushed}
            projections={projections}
            activeSlot={activeSlot}
            displayHealth={displayHealth}
            displayBlock={displayBlock}
            damageNumbers={damageNumbers}
            onSelectCard={handleSelectSlotCard}
            onTogglePush={() => setPushed(p => !p)}
            onAssignSlot={handleAssignSlot}
          />
          {run.parts.length > 0 && (
            <PartBadges parts={run.parts} activePartIds={activePartIds} />
          )}
          <ActionBar
            hint={hint}
            onExecute={handleExecute}
            disabled={animating || combat.phase !== 'planning'}
            onInfo={() => setInfoTab('equips')}
          />
        </div>
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
        {/* Pile viewer */}
        {pileView && (() => {
          const pile = pileView === 'draw' ? combat.drawPile
            : pileView === 'discard' ? combat.discardPile
            : combat.exhaustPile
          return (
            <div
              onClick={() => setPileView(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#1e1e2e', border: '2px solid #4a4a6a', borderRadius: 10,
                  padding: 16, maxWidth: 360, width: '100%', maxHeight: '80vh', overflow: 'auto',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: 14, color: '#a29bfe', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {pileView} pile · {pile.length}
                </div>
                {pile.map(c => {
                  const def = ALL_CARDS[c.definitionId]
                  return (
                    <div key={c.instanceId} style={{ fontSize: 12, color: '#dfe6e9', padding: '4px 0', borderBottom: '1px solid #2c3e50' }}>
                      {def?.name ?? c.definitionId}{c.isUpgraded ? '+' : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  // ─── Landscape Layout (cinematic stage + control deck) ─────────────
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      background: 'linear-gradient(180deg, #0e0b1c 0%, #07050d 100%)',
      color: '#e9e4f5',
      overflow: 'hidden',
    }}>
      <CombatStage
        combat={combat}
        run={{
          health: run.health,
          maxHealth: run.maxHealth,
          sector: run.sector,
          combatsCleared: run.combatsCleared,
        }}
        displayHealth={displayHealth}
        displayBlock={displayBlock}
        displayEnemyHealth={displayEnemyHealth}
        effectiveTarget={effectiveTarget}
        damageNumbers={damageNumbers}
        onTarget={setTargetEnemyId}
      />
      <ControlDeck
        combat={combat}
        run={{ parts: run.parts, equipment: run.equipment }}
        selectedCardId={selectedCardId}
        pushed={pushed}
        projections={projections}
        activeSlot={activeSlot}
        effectiveTarget={effectiveTarget}
        animating={animating}
        onSelectCard={handleSelectSlotCard}
        onTogglePush={() => setPushed(p => !p)}
        onAssignSlot={handleAssignSlot}
        onExecute={handleExecute}
      />
      {run.parts.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 12,
          zIndex: 10,
        }}>
          <PartBadges parts={run.parts} activePartIds={activePartIds} />
        </div>
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

      {/* Pile viewer overlay */}
      {pileView && (() => {
        const pile = pileView === 'draw' ? combat.drawPile
          : pileView === 'discard' ? combat.discardPile
          : combat.exhaustPile
        const title = pileView === 'draw' ? 'Draw Pile' : pileView === 'discard' ? 'Discard Pile' : 'Exhaust Pile'
        const cards = pile.map(c => ALL_CARDS[c.definitionId]).filter(Boolean)
        const sorted = [...cards].sort((a, b) => a.name.localeCompare(b.name))
        return (
          <div
            onClick={() => setPileView(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 250,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: '#0d0d1a',
                border: '1px solid #2c3e50',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '400px',
                width: '100%',
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#e8e8e8', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>
                  {title} ({pile.length})
                </span>
                <button
                  onClick={() => setPileView(null)}
                  style={{ background: 'none', border: 'none', color: '#666', fontSize: '18px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              {sorted.length === 0 ? (
                <div style={{ color: '#444', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>Empty</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sorted.map((card, i) => {
                    const cat = card.category.type === 'slot' ? card.category.modifier : 'System'
                    const catColor = card.category.type === 'slot'
                      ? { Amplify: '#a29bfe', Redirect: '#74b9ff', Repeat: '#fd79a8', Override: '#e17055', Feedback: '#55efc4', Retaliate: '#e74c3c' }[card.category.modifier] ?? '#888'
                      : '#f1c40f'
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        backgroundColor: '#16213e',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        <span style={{ color: catColor, fontSize: '9px', fontWeight: 'bold', minWidth: '50px', textTransform: 'uppercase' }}>
                          {cat}
                        </span>
                        <span style={{ color: '#e8e8e8', fontWeight: 'bold' }}>{card.name}</span>
                        {card.energyCost > 0 && (
                          <span style={{ color: '#e67e22', fontSize: '10px', marginLeft: 'auto' }}>
                            {card.energyCost}E
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })()}

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
    </div>
  )
}
