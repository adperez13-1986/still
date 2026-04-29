import type { CombatState } from '../game/types'
import { ALL_ENEMIES } from '../data/enemies'
import ThreatCard from './ThreatCard'
import DamageNumber from './DamageNumber'

interface DamageNumberItem {
  id: number
  value: number
  color: string
  target: 'still' | string
}

interface Props {
  combat: CombatState
  effectiveTarget: string | null
  combatsCleared: number
  damageNumbers: DamageNumberItem[]
  displayEnemyHealth: Record<string, number> | null
  onTarget: (enemyId: string) => void
}

export default function ThreatGrid({
  combat,
  effectiveTarget,
  combatsCleared,
  damageNumbers,
  displayEnemyHealth,
  onTarget,
}: Props) {
  const aliveCount = combat.enemies.filter(e => !e.isDefeated).length

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: 16,
          letterSpacing: 4,
          color: '#a09bbe',
        }}>
          // INCOMING <b style={{ color: '#ffd84a' }}>×{aliveCount}</b>
        </span>
        {aliveCount > 1 && (
          <span style={{
            fontSize: 9,
            letterSpacing: 1.5,
            color: '#3d3858',
            textTransform: 'uppercase',
          }}>
            tap to retarget
          </span>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
      }}>
        {combat.enemies.map(enemy => {
          const def = ALL_ENEMIES[enemy.definitionId]
          if (!def) return null
          const dispHp = displayEnemyHealth?.[enemy.instanceId]
          const dispDefeated = dispHp != null ? dispHp <= 0 : enemy.isDefeated
          const inst = dispHp != null
            ? { ...enemy, currentHealth: Math.max(0, dispHp), isDefeated: dispDefeated }
            : enemy
          return (
            <div key={enemy.instanceId} style={{ position: 'relative' }}>
              <ThreatCard
                instance={inst}
                definition={def}
                selected={effectiveTarget === enemy.instanceId}
                combatsCleared={combatsCleared}
                onClick={() => { if (!dispDefeated) onTarget(enemy.instanceId) }}
              />
              {damageNumbers
                .filter(dn => dn.target === enemy.instanceId)
                .map(dn => (
                  <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="50%" y="40%" />
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
