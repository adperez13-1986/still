import { useState } from 'react'

interface Props {
  outcome: 'victory' | 'defeat'
  message: string
}

export default function RunEndOverlay({ outcome, message }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      gap: '24px',
      padding: '40px',
    }}>
      <div style={{
        color: outcome === 'victory' ? '#a29bfe' : '#e74c3c',
        fontSize: '11px',
        letterSpacing: '4px',
        textTransform: 'uppercase',
      }}>
        {outcome === 'victory' ? 'Run Complete' : 'Run Over'}
      </div>

      <p style={{
        color: '#e8e8e8',
        fontSize: '20px',
        textAlign: 'center',
        maxWidth: '500px',
        lineHeight: '1.7',
        fontStyle: 'italic',
        fontWeight: '300',
      }}>
        "{message}"
      </p>

      <button
        onClick={() => setDismissed(true)}
        style={{
          padding: '12px 40px',
          backgroundColor: 'transparent',
          border: `1px solid ${outcome === 'victory' ? '#a29bfe' : '#555'}`,
          color: outcome === 'victory' ? '#a29bfe' : '#888',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          letterSpacing: '1px',
          marginTop: '8px',
        }}
      >
        Still going?
      </button>
    </div>
  )
}
