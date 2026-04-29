import type { CombatState, EnemyInstance, EnemyDefinition } from '../game/types'
import { getStatus } from '../game/combat'
import { ALL_ENEMIES } from '../data/enemies'

interface Props {
  combat: CombatState
  effectiveTarget: string | null
}

function modifierLine(instance: EnemyInstance, definition: EnemyDefinition): string | null {
  const parts: string[] = []
  const vuln = getStatus(instance.statusEffects, 'Vulnerable')
  const weak = getStatus(instance.statusEffects, 'Weak')
  if (vuln > 0) parts.push(`VULN ×${(1 + 0.5 * Math.min(vuln, 3)).toFixed(1)}`)
  if (weak > 0) parts.push('WEAK')
  if (definition.isElite) parts.push('ELITE')
  if (definition.isBoss) parts.push('BOSS')
  return parts.length > 0 ? parts.join(' · ') : null
}

export default function TargetCard({ combat, effectiveTarget }: Props) {
  const target = effectiveTarget
    ? combat.enemies.find(e => e.instanceId === effectiveTarget)
    : null
  const def = target ? ALL_ENEMIES[target.definitionId] : null

  if (!target || !def || target.isDefeated) {
    return (
      <div style={{
        flex: 1,
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px dashed #3d3868',
        borderRadius: 6,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 0,
      }}>
        <div style={{
          fontSize: 9,
          letterSpacing: 2,
          color: '#3d3858',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          lineHeight: 1,
        }}>
          ○ TARGET
        </div>
        <div style={{ fontSize: 11, color: '#6b6585', marginTop: 4, fontStyle: 'italic' }}>
          pick an enemy
        </div>
      </div>
    )
  }

  const mod = modifierLine(target, def)
  const nameColor = def.isBoss ? '#e74c3c' : def.isElite ? '#e67e22' : '#e9e4f5'

  return (
    <div style={{
      flex: 1,
      background: 'rgba(255, 216, 74, 0.08)',
      border: '1px solid #ffd84a',
      borderRadius: 6,
      padding: '6px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      boxShadow: '0 0 16px rgba(255,216,74,0.18)',
      minWidth: 0,
    }}>
      <div style={{
        fontSize: 9,
        letterSpacing: 2,
        color: '#ffd84a',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        lineHeight: 1,
      }}>
        ● TARGET
      </div>
      <div style={{
        fontSize: 13,
        fontWeight: 'bold',
        color: nameColor,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {def.name}
      </div>
      <div style={{ fontSize: 10, color: '#a09bbe', display: 'flex', gap: 8, lineHeight: 1 }}>
        <span>
          HP <b style={{ color: '#e9e4f5' }}>{target.currentHealth}</b>
          <span style={{ color: '#6b6585' }}>/{target.maxHealth}</span>
        </span>
        {mod && <span style={{ color: '#f5b7b1', letterSpacing: 0.5 }}>{mod}</span>}
      </div>
    </div>
  )
}
