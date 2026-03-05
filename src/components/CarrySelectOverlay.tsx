import { ALL_PARTS } from '../data/parts'
import type { BehavioralPartDefinition, CarriedPart } from '../game/types'

interface Props {
  runParts: BehavioralPartDefinition[]
  currentCarry: CarriedPart | null
  onSelect: (partId: string | null) => void
  onDismiss: () => void
}

export default function CarrySelectOverlay({ runParts, currentCarry, onSelect, onDismiss }: Props) {
  const currentDef = currentCarry ? ALL_PARTS[currentCarry.partId] : null

  // Parts available to select: run parts (excluding the current carried part if intact)
  const selectableParts = runParts.filter((p) => p.id !== currentCarry?.partId)

  const hasAnything = selectableParts.length > 0 || currentCarry !== null

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
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 style={{ color: '#e8e8e8', letterSpacing: '3px', fontSize: '16px', marginBottom: '8px' }}>
          CARRY FORWARD
        </h2>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '28px', lineHeight: '1.6' }}>
          Choose one part to carry into the next run. It will wear with use, but it is yours to keep.
        </p>

        {!hasAnything && (
          <div style={{ color: '#444', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', marginBottom: '24px' }}>
            Nothing to carry. You leave with what you learned.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {/* Current carry (if exists and broken — not in runParts) */}
          {currentCarry && currentDef && !selectableParts.some((p) => p.id === currentCarry.partId) && (
            <button
              onClick={() => onSelect(currentCarry.partId)}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #e67e22',
                borderRadius: '8px',
                padding: '14px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                color: '#e8e8e8',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#e67e22', marginBottom: '4px' }}>
                    {currentDef.name}
                    {currentCarry.durability === 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', color: '#e74c3c', letterSpacing: '1px' }}>[BROKEN]</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{currentDef.description}</div>
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                    {currentCarry.durability > 0
                      ? `Durability: ${currentCarry.durability}/${currentCarry.maxDurability} · Repairs left: ${currentCarry.repairsLeft}`
                      : `Repairs left: ${currentCarry.repairsLeft}`}
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#e67e22', letterSpacing: '1px', marginLeft: '16px', whiteSpace: 'nowrap' }}>
                  CURRENT CARRY
                </div>
              </div>
            </button>
          )}

          {/* Parts from this run */}
          {selectableParts.map((part) => (
            <button
              key={part.id}
              onClick={() => onSelect(part.id)}
              style={{
                backgroundColor: '#16213e',
                border: '1px solid #2c3e50',
                borderRadius: '8px',
                padding: '14px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                color: '#e8e8e8',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{part.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{part.description}</div>
                </div>
                <div style={{
                  fontSize: '10px',
                  color: part.rarity === 'rare' ? '#f1c40f' : part.rarity === 'uncommon' ? '#a29bfe' : '#888',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginLeft: '16px',
                  whiteSpace: 'nowrap',
                }}>
                  {part.rarity}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onDismiss}
          style={{
            padding: '10px 32px',
            background: 'none',
            border: '1px solid #333',
            color: '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            width: '100%',
          }}
        >
          Carry nothing
        </button>
      </div>
    </div>
  )
}
