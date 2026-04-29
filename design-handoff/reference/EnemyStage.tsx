// REFERENCE — new file, drop at src/components/EnemyStage.tsx
//
// Owns the right-hand column of the combat stage. Renders enemies in a
// vertical staggered formation with depth-based scale + horizontal jitter.
//
// Pulls the inspector state up here so only one inspector can be open at
// a time across all enemies.

import { useState, useCallback } from 'react'
import type { CombatState, EnemyInstance } from '../game/types'
import { ALL_ENEMIES } from '../data/enemies'
import EnemyCard from './EnemyCard'
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
  // Override enemy HP for animation replay
  displayEnemyHealth: Record<string, number> | null
  onTarget: (enemyId: string) => void
}

const SHIFTS = [0, -36, 24, -48, 32, -28, 16]

export default function EnemyStage({
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

  const handleLongPress = useCallback((enemy: EnemyInstance, e?: PointerEvent) => {
    // Anchor at last pointer position; fall back to centre of viewport
    const anchor = e
      ? { x: e.clientX, y: e.clientY }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    setInspectorFor({ enemy, anchor })
  }, [])

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column-reverse',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      gap: 28,
      padding: '24px 32px 36px 16px',
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
            style={{ position: 'relative' }}
          >
            <EnemyCard
              instance={inst}
              definition={def}
              selected={effectiveTarget === enemy.instanceId}
              onClick={() => { if (!dispDefeated) onTarget(enemy.instanceId) }}
              onLongPress={() => {
                // window.event is deprecated but works to grab the active pointer event;
                // safer: pass through a ref. For simplicity, anchor near the enemy's bbox:
                const el = document.querySelector(`[data-enemy-id="${enemy.instanceId}"]`)
                if (el) {
                  const r = el.getBoundingClientRect()
                  setInspectorFor({
                    enemy: inst,
                    anchor: { x: r.right, y: r.top },
                  })
                } else {
                  handleLongPress(inst)
                }
              }}
              combatsCleared={combatsCleared}
              depth={depth}
              shift={shift}
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
