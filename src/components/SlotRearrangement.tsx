import { useState } from 'react'
import { useRunStore } from '../store/runStore'
import { ALL_ACTIONS, getSynergyForPair } from '../data/actions'
import type { SynergyEffect } from '../game/types'

function typeLabel(type: string): string {
  switch (type) {
    case 'damage_single': return 'DMG'
    case 'damage_all': return 'AOE'
    case 'block': return 'BLK'
    case 'heal': return 'HEAL'
    case 'reduce': return 'REDUCE'
    case 'reflect': return 'REFLECT'
    case 'buff': return 'BUFF'
    case 'debuff': return 'DEBUFF'
    case 'convert': return 'CONVERT'
    case 'utility': return 'UTIL'
    case 'recovery': return 'VENT'
    default: return type.toUpperCase()
  }
}

function typeColor(type: string): string {
  switch (type) {
    case 'damage_single': case 'damage_all': return '#e74c3c'
    case 'block': return '#3498db'
    case 'heal': return '#2ecc71'
    case 'reduce': case 'debuff': return '#e67e22'
    case 'reflect': return '#9b59b6'
    case 'buff': return '#f1c40f'
    case 'convert': return '#1abc9c'
    case 'utility': return '#95a5a6'
    case 'recovery': return '#636e72'
    default: return '#aaa'
  }
}

export default function SlotRearrangement({ onClose }: { onClose: () => void }) {
  const run = useRunStore()
  const [selected, setSelected] = useState<number | null>(null)
  const slots = run.slotLayout.slots

  const pairASynergy = getSynergyForPair(slots[0], slots[1])
  const pairBSynergy = getSynergyForPair(slots[2], slots[3])

  const handleSlotTap = (index: number) => {
    if (selected === null) {
      setSelected(index)
    } else if (selected === index) {
      setSelected(null)
    } else {
      run.swapSlots(selected, index)
      setSelected(null)
    }
  }

  function renderSlot(index: number) {
    const actionId = slots[index]
    const action = actionId ? ALL_ACTIONS[actionId] : null
    const isSelected = selected === index

    return (
      <button
        key={index}
        onClick={() => handleSlotTap(index)}
        style={{
          flex: 1, padding: '10px 6px',
          background: isSelected ? '#2d3436' : '#1a1a2e',
          border: isSelected ? '2px solid #a29bfe' : '2px solid #444',
          borderRadius: 8, color: '#fff', cursor: 'pointer',
          textAlign: 'center', transition: 'all 0.15s',
        }}
      >
        {action ? (
          <>
            <div style={{ fontSize: 11, color: typeColor(action.type), fontWeight: 600 }}>{typeLabel(action.type)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{action.name}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#dfe6e9', marginTop: 2 }}>
              {action.baseValue}{action.hits && action.hits > 1 ? ` \u00d7${action.hits}` : ''} / {action.pushedValue}{action.hits && action.hits > 1 ? ` \u00d7${action.hits}` : ''}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: '#555' }}>Empty</div>
        )}
        {isSelected && <div style={{ fontSize: 10, color: '#a29bfe', marginTop: 4 }}>Selected</div>}
      </button>
    )
  }

  function renderSynergy(synergy: SynergyEffect | null) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 28, fontSize: 10, color: '#444',
      }}>
        {synergy
          ? <span style={{ color: '#f39c12', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{synergy.name}</span>
          : '\u2500\u2500'
        }
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0d0d1aee', zIndex: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24, color: '#fff',
    }}>
      <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: 2, marginBottom: 8 }}>ACTION SLOTS</div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
        {selected !== null ? 'Tap another slot to swap' : 'Tap a slot to select, then tap another to swap'}
      </div>

      {/* Pair A */}
      <div style={{ width: '100%', maxWidth: 400, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
          {renderSlot(0)}
          {renderSynergy(pairASynergy)}
          {renderSlot(1)}
        </div>
        {pairASynergy && (
          <div style={{ fontSize: 11, color: '#f39c12', textAlign: 'center', marginTop: 3, opacity: 0.8 }}>
            {pairASynergy.description}
          </div>
        )}
      </div>

      {/* Pair B */}
      <div style={{ width: '100%', maxWidth: 400, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
          {renderSlot(2)}
          {renderSynergy(pairBSynergy)}
          {renderSlot(3)}
        </div>
        {pairBSynergy && (
          <div style={{ fontSize: 11, color: '#f39c12', textAlign: 'center', marginTop: 3, opacity: 0.8 }}>
            {pairBSynergy.description}
          </div>
        )}
      </div>

      {/* Solo */}
      <div style={{ width: '100%', maxWidth: 160, marginBottom: 20 }}>
        {renderSlot(4)}
        <div style={{ fontSize: 10, color: '#555', textAlign: 'center', marginTop: 3 }}>Solo — no synergy</div>
      </div>

      <div style={{ fontSize: 12, color: '#636e72', marginBottom: 16 }}>Free to rearrange. No strain cost.</div>

      <button
        onClick={onClose}
        style={{
          padding: '10px 32px', background: '#2d3436', border: '1px solid #636e72',
          borderRadius: 6, color: '#dfe6e9', fontSize: 14, cursor: 'pointer',
        }}
      >
        Done
      </button>
    </div>
  )
}
