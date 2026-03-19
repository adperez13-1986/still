import type { CombatState, EnemyDefinition, EnemyInstance, Intent } from '../../game/types'

interface EnemyPanelProps {
  combat: CombatState | null
  enemyDefs: Record<string, EnemyDefinition>
}

function intentLabel(intent: Intent): string {
  switch (intent.type) {
    case 'Attack': return `Attack ${intent.value}`
    case 'Block': return `Block ${intent.value}`
    case 'Buff': return `Buff ${intent.status ?? ''} +${intent.value}`
    case 'Debuff': return `Debuff ${intent.status ?? ''} ${intent.statusStacks ?? intent.value}`
    case 'AttackDebuff': return `Atk ${intent.value} + ${intent.status ?? ''}`
    case 'DisableSlot': return `Disable ${intent.targetSlot ?? '?'}`
    case 'Absorb': return `Absorb ${intent.value}%`
    case 'Scan': return 'Scanning...'
  }
}

function intentColor(intent: Intent): string {
  switch (intent.type) {
    case 'Attack':
    case 'AttackDebuff':
      return 'var(--danger)'
    case 'Block':
    case 'Absorb':
      return '#3498db'
    case 'Buff':
      return 'var(--gold)'
    case 'Debuff':
    case 'DisableSlot':
      return '#9b59b6'
    case 'Scan':
      return '#a29bfe'
  }
}

function EnemyCard({ enemy, def }: { enemy: EnemyInstance; def: EnemyDefinition | undefined }) {
  if (!def) return null
  const intent = def.intentPattern[enemy.intentIndex % def.intentPattern.length]
  const hpPct = enemy.maxHealth > 0 ? (enemy.currentHealth / enemy.maxHealth) * 100 : 0

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 10,
      opacity: enemy.isDefeated ? 0.4 : 1,
      flex: 1,
      minWidth: 150,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 'bold', fontSize: 13 }}>
          {def.name}
          {def.isElite && <span style={{ color: 'var(--gold)', marginLeft: 4 }}>E</span>}
          {def.isBoss && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>B</span>}
        </span>
        {enemy.isDefeated && <span style={{ color: 'var(--danger)', fontSize: 11 }}>DEAD</span>}
      </div>

      {/* HP bar */}
      <div style={{
        height: 6,
        background: 'var(--bg-deep)',
        borderRadius: 3,
        marginBottom: 6,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${hpPct}%`,
          background: hpPct > 50 ? 'var(--health)' : hpPct > 25 ? 'var(--gold)' : 'var(--danger)',
          transition: 'width 0.2s',
        }} />
      </div>

      <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>HP: {enemy.currentHealth}/{enemy.maxHealth}</span>
        {enemy.block > 0 && <span style={{ color: '#3498db' }}>Block: {enemy.block}</span>}
      </div>

      {/* Intent */}
      {!enemy.isDefeated && (
        <div style={{
          fontSize: 11,
          padding: '3px 8px',
          background: 'var(--bg-raised)',
          borderRadius: 4,
          marginBottom: 4,
        }}>
          <span style={{ color: 'var(--muted)' }}>Intent: </span>
          <span style={{ color: intentColor(intent), fontWeight: 'bold' }}>
            {intentLabel(intent)}
          </span>
          <span style={{ color: 'var(--muted)', marginLeft: 4 }}>
            (idx {enemy.intentIndex % def.intentPattern.length}/{def.intentPattern.length})
          </span>
        </div>
      )}

      {/* Status effects */}
      {enemy.statusEffects.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {enemy.statusEffects.map(s => (
            <span key={s.type} style={{
              fontSize: 10,
              padding: '1px 4px',
              background: 'var(--bg-raised)',
              borderRadius: 3,
            }}>
              {s.type} x{s.stacks}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EnemyPanel({ combat, enemyDefs }: EnemyPanelProps) {
  if (!combat) return null

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 12,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Enemies</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {combat.enemies.map(enemy => (
          <EnemyCard
            key={enemy.instanceId}
            enemy={enemy}
            def={enemyDefs[enemy.definitionId]}
          />
        ))}
      </div>
    </div>
  )
}
