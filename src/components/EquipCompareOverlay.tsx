import type { EquipmentDefinition } from '../game/types'

interface Props {
  current: EquipmentDefinition
  incoming: EquipmentDefinition
  onKeep: () => void
  onEquip: () => void
}

export default function EquipCompareOverlay({ current, incoming, onKeep, onEquip }: Props) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        backgroundColor: '#0d0d1a',
        border: '1px solid #2c3e50',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '520px',
        width: '100%',
      }}>
        <h2 style={{ color: '#e8e8e8', letterSpacing: '3px', fontSize: '16px', marginBottom: '8px' }}>
          EQUIPMENT FOUND
        </h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '28px' }}>
          {incoming.slot} slot is occupied. Replace your current equipment?
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {/* Current */}
          <div style={{
            flex: 1,
            backgroundColor: '#1a1a1a',
            border: '1px solid #2c3e50',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '10px', color: '#666', letterSpacing: '1px', marginBottom: '8px' }}>
              CURRENT
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#e8e8e8', marginBottom: '6px' }}>
              {current.name}
            </div>
            <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
              {current.description}
            </div>
          </div>

          {/* Incoming */}
          <div style={{
            flex: 1,
            backgroundColor: '#16213e',
            border: '1px solid #3498db',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '10px', color: '#3498db', letterSpacing: '1px', marginBottom: '8px' }}>
              NEW
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#e8e8e8', marginBottom: '6px' }}>
              {incoming.name}
            </div>
            <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
              {incoming.description}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onKeep}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #555',
              color: '#888',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            Keep Current
          </button>
          <button
            onClick={onEquip}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#3498db',
              border: 'none',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            Equip New
          </button>
        </div>
      </div>
    </div>
  )
}
