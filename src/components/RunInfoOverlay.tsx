import CardDisplay from './CardDisplay'
import { ALL_CARDS } from '../data/cards'
import { ALL_PARTS } from '../data/parts'
import { usePermanentStore } from '../store/permanentStore'
import { useRunStore } from '../store/runStore'
import type { CardInstance, BehavioralPartDefinition, EquipmentDefinition, BodySlot } from '../game/types'
import { BODY_SLOTS } from '../game/types'

interface Props {
  tab: 'deck' | 'equips'
  deck: CardInstance[]
  parts: BehavioralPartDefinition[]
  equipment: Record<BodySlot, EquipmentDefinition | null>
  onClose: () => void
  onTabChange: (tab: 'deck' | 'equips') => void
}

export default function RunInfoOverlay({ tab, deck, parts, equipment, onClose, onTabChange }: Props) {
  const permanent = usePermanentStore()
  const run = useRunStore()
  const archivePartId = permanent.selectedArchivePart
  const archiveEntry = archivePartId ? permanent.partArchive[archivePartId] : null
  const carriedPartDef = archivePartId ? (ALL_PARTS[archivePartId] ?? null) : null
  const isCarriedPartActive = archiveEntry ? archiveEntry.sector <= run.sector : false

  const resolveDef = (instance: CardInstance) => {
    const base = ALL_CARDS[instance.definitionId]
    if (!base) return null
    return instance.isUpgraded && base.upgraded ? base.upgraded : base
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0d0d1a',
          border: '1px solid #2c3e50',
          borderRadius: '12px',
          marginTop: '40px',
          width: '90%',
          maxWidth: '760px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #2c3e50',
          gap: '8px',
        }}>
          <button
            onClick={() => onTabChange('deck')}
            style={{
              background: 'none',
              border: 'none',
              color: tab === 'deck' ? '#a29bfe' : '#666',
              fontSize: '13px',
              letterSpacing: '2px',
              cursor: 'pointer',
              fontWeight: tab === 'deck' ? 'bold' : 'normal',
              padding: '4px 8px',
            }}
          >
            DECK ({deck.length})
          </button>
          <span style={{ color: '#333' }}>|</span>
          <button
            onClick={() => onTabChange('equips')}
            style={{
              background: 'none',
              border: 'none',
              color: tab === 'equips' ? '#a29bfe' : '#666',
              fontSize: '13px',
              letterSpacing: '2px',
              cursor: 'pointer',
              fontWeight: tab === 'equips' ? 'bold' : 'normal',
              padding: '4px 8px',
            }}
          >
            EQUIPS
          </button>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
          {tab === 'deck' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {deck.length === 0 && (
                <div style={{ color: '#555', fontSize: '14px' }}>No cards.</div>
              )}
              {deck.map((instance) => {
                const def = resolveDef(instance)
                if (!def) return null
                return (
                  <CardDisplay
                    key={instance.instanceId}
                    card={def}
                    disabled
                  />
                )
              })}
            </div>
          )}

          {tab === 'equips' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Equip slots */}
              <div>
                <div style={{ color: '#888', fontSize: '11px', letterSpacing: '2px', marginBottom: '12px' }}>
                  EQUIPPED
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {BODY_SLOTS.map((slot) => {
                    const item = equipment[slot]
                    return (
                      <div
                        key={slot}
                        style={{
                          backgroundColor: '#16213e',
                          border: `1px solid ${item ? '#a29bfe' : '#2c3e50'}`,
                          borderRadius: '8px',
                          padding: '12px 16px',
                          minWidth: '160px',
                          flex: 1,
                        }}
                      >
                        <div style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', marginBottom: '6px' }}>
                          {slot.toUpperCase()}
                        </div>
                        {item ? (
                          <>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#a29bfe', marginBottom: '4px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.5' }}>
                              {item.description}
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: '12px', color: '#444', fontStyle: 'italic' }}>Empty</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Carried part */}
              {carriedPartDef && (
                <div>
                  <div style={{ color: '#888', fontSize: '11px', letterSpacing: '2px', marginBottom: '12px' }}>
                    ARCHIVED PART
                  </div>
                  <div style={{
                    backgroundColor: '#16213e',
                    border: `1px solid ${isCarriedPartActive ? '#e67e22' : '#555'}`,
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: isCarriedPartActive ? 1 : 0.5,
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', color: isCarriedPartActive ? '#e67e22' : '#888' }}>
                        {carriedPartDef.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{carriedPartDef.description}</div>
                    </div>
                    <div style={{ fontSize: '10px', color: isCarriedPartActive ? '#e67e22' : '#888', letterSpacing: '1px', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                      {isCarriedPartActive ? 'ACTIVE' : `S${archiveEntry?.sector}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Passive parts */}
              <div>
                <div style={{ color: '#888', fontSize: '11px', letterSpacing: '2px', marginBottom: '12px' }}>
                  MODS ({parts.length})
                </div>
                {parts.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#444', fontStyle: 'italic' }}>None salvaged yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {parts.map((part, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: '#16213e',
                          border: '1px solid #2c3e50',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#e8e8e8' }}>{part.name}</div>
                          <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{part.description}</div>
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: part.rarity === 'rare' ? '#f1c40f' : part.rarity === 'uncommon' ? '#a29bfe' : '#888',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          marginLeft: '12px',
                          whiteSpace: 'nowrap',
                        }}>
                          {part.rarity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
