interface EnergyGaugeProps {
  currentEnergy: number
  maxEnergy: number
  onSetEnergy: (energy: number) => void
}

export default function EnergyGauge({ currentEnergy, maxEnergy, onSetEnergy }: EnergyGaugeProps) {
  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 'bold' }}>Energy</span>
        <span style={{ fontWeight: 'bold' }}>
          {currentEnergy}/{maxEnergy}
        </span>
      </div>

      {/* Bar */}
      <div style={{
        display: 'flex',
        gap: 2,
        marginBottom: 12,
      }}>
        {Array.from({ length: maxEnergy }, (_, i) => (
          <div
            key={i}
            onClick={() => onSetEnergy(i + 1)}
            style={{
              flex: 1,
              height: 24,
              borderRadius: 3,
              cursor: 'pointer',
              background: i < currentEnergy ? '#e67e22' : 'var(--bg-surface)',
              border: '1px solid var(--border)',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>

      {/* Quick set buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {Array.from({ length: maxEnergy + 1 }, (_, v) => (
          <button
            key={v}
            onClick={() => onSetEnergy(v)}
            style={{
              padding: '2px 8px',
              background: currentEnergy === v ? 'var(--accent)' : 'var(--bg-surface)',
              color: currentEnergy === v ? '#fff' : 'var(--text)',
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
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>
        Energy resets to max each turn. Cards cost energy to play.
      </div>
    </div>
  )
}
