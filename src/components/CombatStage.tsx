import type { CombatState, RunState } from '../game/types'
import StillStage from './StillStage'
import EnemyStack from './EnemyStack'
import CombatTopBar from './CombatTopBar'

interface DamageNumberItem {
  id: number
  value: number
  color: string
  target: 'still' | string
}

interface Props {
  combat: CombatState
  run: Pick<RunState, 'health' | 'maxHealth' | 'sector' | 'combatsCleared'>
  displayHealth: number | null
  displayBlock: number | null
  displayEnemyHealth: Record<string, number> | null
  effectiveTarget: string | null
  damageNumbers: DamageNumberItem[]
  onTarget: (enemyId: string) => void
}

export default function CombatStage({
  combat, run, displayHealth, displayBlock, displayEnemyHealth,
  effectiveTarget, damageNumbers, onTarget,
}: Props) {
  const health = displayHealth ?? run.health
  const block = displayBlock ?? combat.block

  return (
    <div style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      alignItems: 'stretch',
      background:
        'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(178,164,245,0.05) 0%, transparent 70%), ' +
        'linear-gradient(180deg, #0e0b1c 0%, #07050d 100%)',
      overflow: 'hidden',
      borderRight: '1px solid #2a2546',
    }}>
      {/* Floor perspective lines */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',
        background:
          'repeating-linear-gradient(180deg, transparent 0 28px, rgba(178,164,245,0.04) 28px 29px)',
        pointerEvents: 'none',
      }} />
      {/* Floor fog at the bottom */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 70,
        background: 'linear-gradient(to top, rgba(7, 5, 13, 0.9), transparent)',
        pointerEvents: 'none',
      }} />

      {/* HUD overlay (sector / round / strain / plan pill) */}
      <CombatTopBar
        sector={run.sector}
        round={combat.roundNumber}
        strain={combat.strain}
        maxStrain={combat.maxStrain}
        variant="stage"
      />

      {/* Still on the left */}
      <StillStage
        combat={combat}
        health={health}
        maxHealth={run.maxHealth}
        block={block}
        damageNumbers={damageNumbers}
      />

      {/* Enemies on the right */}
      <EnemyStack
        combat={combat}
        effectiveTarget={effectiveTarget}
        combatsCleared={run.combatsCleared}
        damageNumbers={damageNumbers}
        displayEnemyHealth={displayEnemyHealth}
        onTarget={onTarget}
      />
    </div>
  )
}
