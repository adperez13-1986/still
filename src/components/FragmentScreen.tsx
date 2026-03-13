import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermanentStore } from '../store/permanentStore'
import type { FragmentBonus } from '../game/types'

const BONUSES: FragmentBonus[] = [
  {
    id: 'patch-up',
    name: 'Patch-Up',
    description: 'Start with +10 max HP.',
    cost: 10,
    type: 'health',
    value: 10,
  },
  {
    id: 'scrap-cache',
    name: 'Scrap Cache',
    description: 'Start with +10 shards.',
    cost: 5,
    type: 'shards',
    value: 10,
  },
  {
    id: 'sharp-draw',
    name: 'Sharp Draw',
    description: 'Draw 1 extra card each turn.',
    cost: 15,
    type: 'drawCount',
    value: 1,
  },
]

export default function FragmentScreen() {
  const navigate = useNavigate()
  const permanent = usePermanentStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const totalCost = BONUSES
    .filter((b) => selected.has(b.id))
    .reduce((sum, b) => sum + b.cost, 0)

  const remaining = permanent.fragmentsAccumulated - totalCost

  const toggle = (bonus: FragmentBonus) => {
    const next = new Set(selected)
    if (next.has(bonus.id)) {
      next.delete(bonus.id)
    } else if (remaining >= bonus.cost) {
      next.add(bonus.id)
    }
    setSelected(next)
  }

  const handleBegin = (skipAll = false) => {
    const bonuses: FragmentBonus[] = skipAll ? [] : BONUSES.filter((b) => selected.has(b.id))
    if (!skipAll && totalCost > 0) {
      permanent.spendFragments(totalCost)
    }
    navigate('/run', { state: { bonuses } })
  }

  const hasFragments = permanent.fragmentsAccumulated > 0

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '28px',
      padding: '48px 24px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ letterSpacing: '4px', color: '#74b9ff', margin: 0, fontSize: '20px', fontWeight: 300 }}>
          PRE-RUN
        </h2>
        <p style={{ color: '#555', fontSize: '12px', marginTop: '8px' }}>
          Spend fragments before you go.
        </p>
      </div>

      {/* Fragment count */}
      <div style={{
        backgroundColor: '#16213e',
        borderRadius: '8px',
        padding: '12px 28px',
        textAlign: 'center',
      }}>
        <div style={{ color: '#74b9ff', fontSize: '28px', fontWeight: 'bold' }}>
          {permanent.fragmentsAccumulated}
        </div>
        <div style={{ color: '#555', fontSize: '11px', letterSpacing: '1px' }}>FRAGMENTS</div>
        {selected.size > 0 && (
          <div style={{ color: '#a29bfe', fontSize: '12px', marginTop: '6px' }}>
            −{totalCost} → {remaining} remaining
          </div>
        )}
      </div>

      {/* Bonuses grid */}
      {hasFragments ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          maxWidth: '480px',
          width: '100%',
        }}>
          {BONUSES.map((bonus) => {
            const isSelected = selected.has(bonus.id)
            const canAfford = isSelected || remaining >= bonus.cost
            return (
              <div
                key={bonus.id}
                onClick={() => canAfford && toggle(bonus)}
                style={{
                  backgroundColor: isSelected ? '#1a1a3e' : '#16213e',
                  border: `1px solid ${isSelected ? '#74b9ff' : canAfford ? '#2c3e50' : '#1a1a1a'}`,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.35,
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isSelected ? '#74b9ff' : '#e8e8e8',
                  marginBottom: '4px',
                }}>
                  {bonus.name}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                  {bonus.description}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: isSelected ? '#74b9ff' : '#555',
                  fontWeight: 'bold',
                }}>
                  {bonus.cost} fragments
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{ color: '#555', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', maxWidth: '320px' }}>
          No fragments yet. They accumulate while you're away — come back later and there'll be something waiting.
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {hasFragments && selected.size > 0 && (
          <button
            onClick={() => handleBegin(false)}
            style={{
              padding: '12px 36px',
              backgroundColor: '#74b9ff',
              border: 'none',
              color: '#0d0d1a',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            Apply & Begin
          </button>
        )}
        <button
          onClick={() => handleBegin(true)}
          style={{
            padding: '12px 36px',
            backgroundColor: selected.size > 0 ? 'transparent' : '#a29bfe',
            border: selected.size > 0 ? '1px solid #555' : 'none',
            color: selected.size > 0 ? '#888' : '#0d0d1a',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            letterSpacing: '1px',
          }}
        >
          {selected.size > 0 ? 'Skip' : 'Begin Run'}
        </button>
      </div>
    </div>
  )
}
