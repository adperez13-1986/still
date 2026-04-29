import { useState } from 'react'
import type { CombatState, EnemyInstance } from '../game/types'
import { ALL_ENEMIES } from '../data/enemies'
import StageEnemy from './StageEnemy'
import EnemyInspector from './EnemyInspector'
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

const SHIFTS = [0, 36, -32, 56, -42, 24, -16]

export default function EnemyStack({
  combat,
  effectiveTarget,
  combatsCleared,
  damageNumbers,
  displayEnemyHealth,
  onTarget,
}: Props) {
  const [inspectorFor, setInspectorFor] = useState<{
    enemy: EnemyInstance
    anchor: { x: number; y: number }
  } | null>(null)

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column-reverse',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: 24,
      padding: '24px 32px 24px 16px',
      position: 'relative',
      minHeight: 0,
    }}>
      {combat.enemies.map((enemy, i) => {
        const def = ALL_ENEMIES[enemy.definitionId]
        if (!def) return null

        const dispHp = displayEnemyHealth?.[enemy.instanceId]
        const dispDefeated = dispHp != null ? dispHp <= 0 : enemy.isDefeated
        const inst: EnemyInstance = dispHp != null
          ? { ...enemy, currentHealth: Math.max(0, dispHp), isDefeated: dispDefeated }
          : enemy

        const depth = Math.min(i * 0.3, 0.9)
        const shift = SHIFTS[i] ?? 0

        return (
          <div
            key={enemy.instanceId}
            data-enemy-id={enemy.instanceId}
            style={{ position: 'relative', alignSelf: 'flex-end' }}
          >
            <StageEnemy
              instance={inst}
              definition={def}
              selected={effectiveTarget === enemy.instanceId}
              combatsCleared={combatsCleared}
              depth={depth}
              shift={shift}
              onClick={() => { if (!dispDefeated) onTarget(enemy.instanceId) }}
              onLongPress={() => {
                const el = document.querySelector(`[data-enemy-id="${enemy.instanceId}"]`)
                if (el) {
                  const r = el.getBoundingClientRect()
                  setInspectorFor({
                    enemy: inst,
                    anchor: { x: r.right + 4, y: r.top },
                  })
                } else {
                  setInspectorFor({
                    enemy: inst,
                    anchor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
                  })
                }
              }}
            />
            {damageNumbers
              .filter(dn => dn.target === enemy.instanceId)
              .map(dn => (
                <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="50%" y="40%" />
              ))}
          </div>
        )
      })}

      {inspectorFor && ALL_ENEMIES[inspectorFor.enemy.definitionId] && (
        <EnemyInspector
          instance={inspectorFor.enemy}
          definition={ALL_ENEMIES[inspectorFor.enemy.definitionId]!}
          combatsCleared={combatsCleared}
          anchor={inspectorFor.anchor}
          onClose={() => setInspectorFor(null)}
        />
      )}
    </div>
  )
}
