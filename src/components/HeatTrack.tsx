import { getHeatThreshold, OVERHEAT_THRESHOLD } from '../game/types'

interface Props {
  heat: number
  projectedHeat: number
  nextRoundHeat?: number
  heatLocked?: boolean
  heatLockTurnsLeft?: number
  heatDebt?: number
}

function segmentColor(i: number): string {
  if (i >= 10) return '#e74c3c'
  if (i >= 7) return '#e67e22'
  if (i >= 4) return '#f1c40f'
  return '#27ae60'
}

export default function HeatTrack({ heat, projectedHeat, nextRoundHeat, heatLocked, heatLockTurnsLeft, heatDebt }: Props) {
  const threshold = getHeatThreshold(heat)
  const projectedThreshold = getHeatThreshold(projectedHeat)
  const showProjection = projectedHeat !== heat
  const showNextRound = nextRoundHeat != null && showProjection

  return (
    <div style={{
      backgroundColor: '#16213e',
      border: '1px solid #2c3e50',
      borderRadius: '8px',
      padding: '12px 16px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontSize: '12px',
      }}>
        <span style={{ color: '#aaa' }}>
          Heat: <span style={{ color: segmentColor(heat), fontWeight: 'bold' }}>{heat}/{OVERHEAT_THRESHOLD}</span>
          <span style={{ color: '#555', marginLeft: '6px' }}>({threshold})</span>
          {heatLocked && (
            <span style={{
              marginLeft: '8px',
              padding: '1px 6px',
              background: 'rgba(52, 152, 219, 0.2)',
              color: '#3498db',
              borderRadius: '3px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}>
              LOCKED {heatLockTurnsLeft}t | +{heatDebt ?? 0} debt
            </span>
          )}
        </span>
        {showProjection && (
          <span style={{ color: '#888', fontSize: '11px' }}>
            After execute: <span style={{ color: segmentColor(projectedHeat), fontWeight: 'bold' }}>
              {projectedHeat}
            </span>
            <span style={{ color: '#555', marginLeft: '4px' }}>({projectedThreshold})</span>
            {showNextRound && (
              <>
                <span style={{ color: '#555', margin: '0 6px' }}>→</span>
                <span style={{ color: '#555' }}>Next turn: </span>
                <span style={{ color: segmentColor(nextRoundHeat!), fontWeight: 'bold' }}>
                  {nextRoundHeat}
                </span>
                <span style={{ color: '#555', marginLeft: '4px' }}>
                  ({getHeatThreshold(nextRoundHeat!)})
                </span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Bar */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {Array.from({ length: OVERHEAT_THRESHOLD }, (_, i) => {
          const idx = i + 1
          const isFilled = idx <= heat
          const isProjected = !isFilled && idx <= projectedHeat
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: '20px',
                borderRadius: '3px',
                background: isFilled
                  ? segmentColor(idx)
                  : isProjected
                    ? `${segmentColor(idx)}44`
                    : '#1a1a2e',
                border: `1px solid ${isFilled ? segmentColor(idx) : '#2c3e50'}`,
                transition: 'background 0.15s',
              }}
            />
          )
        })}
      </div>

      {/* Threshold labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '4px',
        fontSize: '9px',
        color: '#555',
      }}>
        <span>Cool 0-3</span>
        <span>Warm 4-6</span>
        <span>Hot 7-9</span>
        <span>OVH 10+</span>
      </div>
    </div>
  )
}
