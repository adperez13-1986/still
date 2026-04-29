interface Props {
  sector: number
  round: number
  strain: number
  maxStrain: number
  variant: 'bar' | 'stage'
}

function StrainBar({ strain, maxStrain }: { strain: number; maxStrain: number }) {
  const pct = Math.min(100, (strain / maxStrain) * 100)
  return (
    <div style={{
      flex: 1,
      height: 6,
      background: '#1a1535',
      borderRadius: 3,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: 'linear-gradient(90deg, #e67e22, #ff6b3d)',
        borderRadius: 3,
        transition: 'width 0.3s',
      }} />
      {[25, 50, 75].map(t => (
        <div key={t} style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${t}%`,
          width: 1,
          background: 'rgba(13,10,24,0.9)',
        }} />
      ))}
    </div>
  )
}

const PANEL_BG = 'rgba(15, 12, 28, 0.65)'
const PANEL_BORDER = '#3d3868'

function PlanPill() {
  return (
    <div style={{
      padding: '7px 18px',
      border: `1px solid ${PANEL_BORDER}`,
      background: 'rgba(178,164,245,0.08)',
      borderRadius: 6,
      fontSize: 12,
      letterSpacing: 2,
      color: '#e9e4f5',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    }}>
      PLAN
    </div>
  )
}

export default function CombatTopBar({ sector, round, strain, maxStrain, variant }: Props) {
  if (variant === 'bar') {
    // portrait — kept compact (already approved by user)
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 8,
        padding: '8px 4px',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 13,
          letterSpacing: 2.5,
          color: '#6b6585',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}>
          SECTOR <b style={{ color: '#e9e4f5' }}>{sector}</b> · ROUND <b style={{ color: '#e9e4f5' }}>{round}</b>
        </span>
        <StrainBar strain={strain} maxStrain={maxStrain} />
        <PlanPill />
      </div>
    )
  }

  // landscape stage HUD — three bordered panels sitting at the top of the stage
  return (
    <div style={{
      position: 'absolute',
      top: 12,
      left: 16,
      right: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 5,
    }}>
      {/* SECTOR · ROUND panel */}
      <div style={{
        padding: '7px 16px',
        border: `1px solid ${PANEL_BORDER}`,
        background: PANEL_BG,
        borderRadius: 6,
        fontSize: 12,
        letterSpacing: 2.5,
        color: '#6b6585',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
      }}>
        SECTOR <b style={{ color: '#e9e4f5' }}>{sector}</b> · ROUND <b style={{ color: '#e9e4f5' }}>{round}</b>
      </div>

      {/* STRAIN panel — flex grows to fill the gap between the side panels */}
      <div style={{
        flex: 1,
        padding: '7px 14px',
        border: `1px solid ${PANEL_BORDER}`,
        background: PANEL_BG,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 0,
      }}>
        <span style={{
          fontSize: 11,
          color: '#e67e22',
          letterSpacing: 2.5,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
        }}>
          STRAIN
        </span>
        <StrainBar strain={strain} maxStrain={maxStrain} />
      </div>

      <PlanPill />
    </div>
  )
}
