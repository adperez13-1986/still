import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StillPanel from './StillPanel'
import EnemyCard from './EnemyCard'
import Hand from './Hand'
import RewardScreen from './RewardScreen'
import { useRunStore } from '../store/runStore'
import { usePermanentStore } from '../store/permanentStore'
import { ALL_CARDS } from '../data/cards'
import { ALL_ENEMIES } from '../data/enemies'
import { ALL_PARTS } from '../data/parts'
import {
  playCard as calcPlayCard,
  executeEnemyTurn,
  allEnemiesDefeated,
  isStillDefeated,
  makeCardInstance,
} from '../game/combat'
import { resolveDrops } from '../game/drops'
import type { CardDefinition, CombatState } from '../game/types'
import { RUN_END_MESSAGES } from '../data/narrative'

export default function CombatScreen() {
  const navigate = useNavigate()
  const run = useRunStore()
  const permanent = usePermanentStore()
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [rewards, setRewards] = useState<ReturnType<typeof resolveDrops> | null>(null)
  const [damagePopups, setDamagePopups] = useState<Record<string, number>>({})

  const showDamagePopups = (before: CombatState, after: CombatState) => {
    const popups: Record<string, number> = {}
    for (const afterEnemy of after.enemies) {
      const beforeEnemy = before.enemies.find((e) => e.instanceId === afterEnemy.instanceId)
      if (beforeEnemy && afterEnemy.currentHealth < beforeEnemy.currentHealth) {
        popups[afterEnemy.instanceId] = beforeEnemy.currentHealth - afterEnemy.currentHealth
      }
    }
    if (Object.keys(popups).length > 0) {
      setDamagePopups(popups)
      setTimeout(() => setDamagePopups({}), 900)
    }
  }

  const combat = run.combat
  if (!combat) return null

  const phase = combat.phase

  const appendLog = (entries: string[]) => {
    setLog((prev) => [...prev.slice(-20), ...entries])
  }

  const handlePlayCard = useCallback(
    (instanceId: string, def: CardDefinition) => {
      if (phase !== 'playerTurn') return
      if (def.cost > combat.energy) return

      const targetId = selectedEnemyId ?? combat.enemies.find((e) => !e.isDefeated)?.instanceId

      const ctx = {
        combat,
        stillHealth: run.health,
        maxHealth: run.maxHealth,
        energyCap: run.energyCap,
        drawCount: run.drawCount,
        targetEnemyId: targetId ?? undefined,
      }

      const result = calcPlayCard(ctx, def, instanceId)
      appendLog(result.log)
      showDamagePopups(combat, result.combat)

      // Auto-shift target if the selected enemy just died
      if (selectedEnemyId) {
        const nowDead = result.combat.enemies.find(
          (e) => e.instanceId === selectedEnemyId && e.isDefeated
        )
        if (nowDead) {
          const nextAlive = result.combat.enemies.find((e) => !e.isDefeated)
          setSelectedEnemyId(nextAlive?.instanceId ?? null)
        }
      }

      // Sync back to store
      useRunStore.setState((s) => ({
        ...s,
        health: result.stillHealth,
        combat: result.combat,
      }))

      if (isStillDefeated(result.stillHealth)) {
        endRun('defeat', result.combat)
        return
      }

      if (allEnemiesDefeated(result.combat)) {
        handleCombatWon(result.combat)
      }
    },
    [combat, run, selectedEnemyId, phase]
  )

  const handleEndTurn = useCallback(() => {
    if (phase !== 'playerTurn') return

    const blockOnTurnStart = run.parts.reduce(
      (sum, p) => sum + p.effects.filter((e) => e.type === 'blockOnTurnStart').reduce((a, e) => a + e.value, 0),
      0
    )

    const ctx = {
      combat,
      stillHealth: run.health,
      maxHealth: run.maxHealth,
      energyCap: run.energyCap,
      drawCount: run.drawCount,
      blockOnTurnStart,
    }

    const result = executeEnemyTurn(ctx, ALL_ENEMIES)
    appendLog(result.log)

    useRunStore.setState((s) => ({
      ...s,
      health: result.stillHealth,
      combat: result.combat,
    }))

    if (isStillDefeated(result.stillHealth)) {
      endRun('defeat', result.combat)
    } else if (allEnemiesDefeated(result.combat)) {
      handleCombatWon(result.combat)
    }
  }, [combat, run, phase])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && phase === 'playerTurn') handleEndTurn()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, handleEndTurn])

  const handleCombatWon = (finalCombat: typeof combat) => {
    const drops = finalCombat.enemies.flatMap((e) => {
      const def = ALL_ENEMIES[e.definitionId]
      return def ? resolveDrops(def.dropPool) : []
    })

    // Shards: auto-given immediately
    // Multiplier stacks additively: Sharp Eye (+20%) + any shardBonus parts (+N%)
    const rawShards = drops
      .filter((d) => d.type === 'shards')
      .reduce((sum, d) => sum + (d.type === 'shards' ? d.amount : 0), 0)
    const partShardBonus = run.parts
      .flatMap((p) => p.effects)
      .filter((e) => e.type === 'shardBonus')
      .reduce((sum, e) => sum + e.value, 0)
    const shardMultiplier = 1
      + (permanent.workshopUpgrades['sharp-eye'] ? 0.2 : 0)
      + partShardBonus / 100
    const shardsGained = Math.floor(rawShards * shardMultiplier)
    run.addShards(shardsGained)

    // Parts: auto-given immediately (you salvaged them, they're yours)
    for (const drop of drops) {
      if (drop.type === 'part') {
        const part = ALL_PARTS[drop.partId]
        if (part) run.addPart(part)
      }
    }

    // Cards: player chooses one — shown on reward screen
    const cardDrops = drops.filter((d) => d.type === 'card')

    useRunStore.setState((s) => ({ ...s, combat: { ...finalCombat, phase: 'reward' } }))
    setRewards(cardDrops) // may be empty — RewardScreen handles that with a Continue button
  }

  const handleRewardChosen = (cardId?: string) => {
    if (cardId) {
      const instance = makeCardInstance(cardId)
      run.addCardToDeck(instance)
    }
    setRewards(null)
    useRunStore.setState((s) => ({
      ...s,
      combat: null,
    }))
    navigate('/run')
  }

  const endRun = (outcome: 'victory' | 'defeat', finalCombat: typeof combat) => {
    const messages = RUN_END_MESSAGES[outcome]
    const message = messages[Math.floor(Math.random() * messages.length)]
    const runEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      actReached: run.act,
      outcome,
      message,
      notable: run.parts.map((p) => p.name),
    }
    permanent.addRunHistory(runEntry)
    permanent.addShards(run.shards)
    permanent.save()
    useRunStore.setState((s) => ({ ...s, combat: { ...finalCombat, phase: 'finished' } }))

    setTimeout(() => {
      run.endRun()
      navigate('/', { state: { runEnd: true, outcome, message } })
    }, 200)
  }

  if (rewards !== null) {
    return <RewardScreen drops={rewards} onChoose={handleRewardChosen} />
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      userSelect: 'none',
    }}>
      {/* Top area: Still + Enemies */}
      <div style={{
        display: 'flex',
        flex: 1,
        gap: '24px',
        padding: '20px',
        alignItems: 'flex-start',
      }}>
        {/* Still */}
        <StillPanel
          health={run.health}
          maxHealth={run.maxHealth}
          energy={combat.energy}
          energyCap={run.energyCap}
          block={combat.block}
          parts={run.parts}
          equipables={run.equipables}
          statusEffects={combat.statusEffects}
        />

        {/* Enemies */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {combat.enemies.map((enemy) => {
            const def = ALL_ENEMIES[enemy.definitionId]
            if (!def) return null
            return (
              <EnemyCard
                key={enemy.instanceId}
                instance={enemy}
                definition={def}
                selected={selectedEnemyId === enemy.instanceId}
                recentDamage={damagePopups[enemy.instanceId]}
                onClick={() => setSelectedEnemyId(
                  selectedEnemyId === enemy.instanceId ? null : enemy.instanceId
                )}
              />
            )
          })}
        </div>

        {/* Combat log */}
        <div style={{
          marginLeft: 'auto',
          fontSize: '11px',
          color: '#666',
          maxWidth: '200px',
          maxHeight: '300px',
          overflowY: 'auto',
          lineHeight: '1.6',
        }}>
          {log.slice(-10).map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      {/* Deck/discard counts */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '0 20px',
        fontSize: '12px',
        color: '#888',
      }}>
        <span>Draw: {combat.drawPile.length}</span>
        <span>Discard: {combat.discardPile.length}</span>
        <span>Exhaust: {combat.exhaustPile.length}</span>
        <span style={{ marginLeft: 'auto', color: '#f1c40f' }}>Round {combat.roundNumber}</span>
      </div>

      {/* Hand */}
      <Hand
        hand={combat.hand}
        cardDefs={ALL_CARDS}
        energy={combat.energy}
        playerTurn={phase === 'playerTurn'}
        onPlayCard={handlePlayCard}
      />

      {/* End Turn button */}
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleEndTurn}
          disabled={phase !== 'playerTurn'}
          style={{
            padding: '12px 48px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: phase === 'playerTurn' ? '#27ae60' : '#2c3e50',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: phase === 'playerTurn' ? 'pointer' : 'not-allowed',
            letterSpacing: '1px',
          }}
        >
          End Turn
        </button>
      </div>
    </div>
  )
}
