import { getHeatThreshold, applyPassiveCooling, OVERHEAT_THRESHOLD } from '../../game/types'

interface HeatGaugeProps {
  heat: number
  passiveCoolingBonus: number
  onSetHeat: (heat: number) => void
}

const thresholdColor = (heat: number): string => {
  const t = getHeatThreshold(heat)
  if (t === 'Overheat') return '#e74c3c'
  if (t === 'Hot') return '#e67e22'
  if (t === 'Warm') return '#f1c40f'
  return '#27ae60'
}

export default function HeatGauge({ heat, passiveCoolingBonus, onSetHeat }: HeatGaugeProps) {
  const threshold = getHeatThreshold(heat)
  const cooledTo = applyPassiveCooling(heat, passiveCoolingBonus)

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 'bold' }}>Heat</span>
        <span style={{ color: thresholdColor(heat), fontWeight: 'bold' }}>
          {heat}/{OVERHEAT_THRESHOLD} — {threshold}
        </span>
      </div>

      {/* Bar */}
      <div style={{
        display: 'flex',
        gap: 2,
        marginBottom: 12,
      }}>
        {Array.from({ length: OVERHEAT_THRESHOLD }, (_, i) => (
          <div
            key={i}
            onClick={() => onSetHeat(i + 1)}
            style={{
              flex: 1,
              height: 24,
              borderRadius: 3,
              cursor: 'pointer',
              background: i < heat ? thresholdColor(i + 1) : 'var(--bg-surface)',
              border: '1px solid var(--border)',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>

      {/* Quick set buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
          <button
            key={v}
            onClick={() => onSetHeat(v)}
            style={{
              padding: '2px 8px',
              background: heat === v ? 'var(--accent)' : 'var(--bg-surface)',
              color: heat === v ? '#fff' : 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Info */}
      <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div>After Passive Cooling: <span style={{ color: 'var(--text)' }}>{cooledTo}</span> (base 2 + bonus {passiveCoolingBonus})</div>
      </div>
    </div>
  )
}
