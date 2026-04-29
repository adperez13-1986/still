import type { CombatState } from '../game/types'
import DamageNumber from './DamageNumber'

interface DamageNumberItem {
  id: number
  value: number
  color: string
  target: 'still' | string
}

interface Props {
  combat: CombatState
  health: number
  maxHealth: number
  block: number
  damageNumbers: DamageNumberItem[]
}

function StatPill({ label, value, sub, color }: {
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #1f1a3a, #15122a)',
      border: '1px solid #2a2546',
      borderRadius: 6,
      padding: '6px 5px 5px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 9,
        letterSpacing: 1.5,
        color: '#3d3858',
        lineHeight: 1,
        marginBottom: 1,
        textTransform: 'uppercase',
        fontWeight: 'bold',
      }}>
        {label}
      </div>
      <div style={{
        fontWeight: 'bold',
        fontSize: 13,
        color,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        {value}
        {sub && (
          <span style={{
            display: 'block',
            fontSize: 8,
            color: '#6b6585',
            fontWeight: 400,
            marginTop: 2,
            letterSpacing: 0.5,
          }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}

export default function StatsRail({ combat, health, maxHealth, block, damageNumbers }: Props) {
  const drawCount = combat.drawPile.length
  const exhaustCount = combat.exhaustPile.length

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      paddingTop: 4,
      position: 'relative',
      minWidth: 0,
    }}>
      <StatPill label="HP" value={health} sub={`of ${maxHealth}`} color="#e74c3c" />
      <StatPill label="BLK" value={block} color="#74b9ff" />
      <StatPill label="EN" value={combat.currentEnergy} sub={`of ${combat.maxEnergy}`} color="#f1c40f" />
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: 8,
        color: '#6b6585',
        padding: '4px 0 2px',
      }}>
        <span>D <b style={{ color: '#e9e4f5' }}>{drawCount}</b></span>
        <span>X <b style={{ color: '#e9e4f5' }}>{exhaustCount}</b></span>
      </div>
      {damageNumbers
        .filter(dn => dn.target === 'still')
        .map(dn => (
          <DamageNumber key={dn.id} value={dn.value} color={dn.color} x="50%" y="20%" />
        ))}
    </div>
  )
}
