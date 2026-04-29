interface Props {
  hint: string
  onExecute: () => void
  disabled: boolean
  onInfo?: () => void
}

export default function ActionBar({ hint, onExecute, disabled, onInfo }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 140px',
      gap: 8,
      alignItems: 'stretch',
      paddingTop: 8,
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid #2a2546',
        borderRadius: 8,
        padding: '7px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 0,
      }}>
        <button
          onClick={onInfo}
          style={{
            flexShrink: 0,
            width: 20,
            height: 20,
            borderRadius: 4,
            border: '1px solid #b2a4f5',
            background: 'transparent',
            color: '#b2a4f5',
            fontSize: 14,
            fontFamily: 'monospace',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            padding: 0,
          }}
        >
          i
        </button>
        <span style={{
          fontSize: 9,
          color: '#a09bbe',
          lineHeight: 1.2,
          flex: 1,
        }}>
          {hint}
        </span>
      </div>
      <button
        onClick={onExecute}
        disabled={disabled}
        style={{
          background: disabled
            ? 'linear-gradient(180deg, #3a2c34 0%, #2a1d22 100%)'
            : 'linear-gradient(180deg, #b53a2c 0%, #8a1d12 100%)',
          border: `1px solid ${disabled ? '#444' : '#d54f3f'}`,
          borderRadius: 8,
          color: disabled ? '#555' : '#fff5f0',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          fontWeight: 'bold',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          padding: 0,
          boxShadow: disabled
            ? 'none'
            : 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(181,58,44,0.4)',
          transition: 'all 0.12s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <span style={{ fontSize: 14 }}>EXECUTE</span>
        <span style={{ fontSize: 8, fontWeight: 400, letterSpacing: 1, opacity: 0.7 }}>
          END PLANNING
        </span>
      </button>
    </div>
  )
}
