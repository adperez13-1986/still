import { useState } from 'react'
import CardDisplay from './CardDisplay'
import { ALL_CARDS } from '../data/cards'
import type { CardInstance } from '../game/types'

interface Props {
  health: number
  maxHealth: number
  deck: CardInstance[]
  onHeal: () => void
  onUpgrade: (instanceId: string) => void
  onContinue: () => void
}

export default function RestScreen({ health, maxHealth, deck, onHeal, onUpgrade, onContinue }: Props) {
  const [mode, setMode] = useState<'choose' | 'upgrading' | 'done'>('choose')
  const healAmount = Math.floor(maxHealth * 0.3)
  const alreadyFull = health >= maxHealth

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '40px',
    }}>
      <h2 style={{ letterSpacing: '3px', color: '#27ae60' }}>REST</h2>
      <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', maxWidth: '400px' }}>
        A quiet place. The hum of the corridor fades. Choose carefully.
      </p>

      {mode === 'choose' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => { onHeal(); setMode('done') }}
            disabled={alreadyFull}
            style={{
              padding: '16px 32px',
              backgroundColor: alreadyFull ? '#1a1a1a' : '#16213e',
              border: `1px solid ${alreadyFull ? '#333' : '#27ae60'}`,
              color: alreadyFull ? '#555' : '#27ae60',
              borderRadius: '8px',
              cursor: alreadyFull ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Recover HP<br />
            <span style={{ fontSize: '12px', color: '#888' }}>
              {alreadyFull ? 'Already at full health' : `Restore ${healAmount} health`}
            </span>
          </button>

          <button
            onClick={() => setMode('upgrading')}
            style={{
              padding: '16px 32px',
              backgroundColor: '#16213e',
              border: '1px solid #a29bfe',
              color: '#a29bfe',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Upgrade a Card<br />
            <span style={{ fontSize: '12px', color: '#888' }}>Improve one card permanently</span>
          </button>
        </div>
      )}

      {mode === 'upgrading' && (
        <div>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginBottom: '16px' }}>
            Choose a card to upgrade:
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px' }}>
            {deck.map((inst) => {
              const def = ALL_CARDS[inst.definitionId]
              if (!def || !def.upgraded || inst.isUpgraded) return null
              return (
                <CardDisplay
                  key={inst.instanceId}
                  card={def.upgraded}
                  onClick={() => { onUpgrade(inst.instanceId); setMode('done') }}
                />
              )
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => setMode('choose')}
              style={{
                background: 'none',
                border: '1px solid #555',
                color: '#888',
                borderRadius: '6px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {mode === 'done' && (
        <button
          onClick={onContinue}
          style={{
            padding: '12px 40px',
            backgroundColor: '#27ae60',
            border: 'none',
            color: '#fff',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            letterSpacing: '1px',
          }}
        >
          Continue
        </button>
      )}
    </div>
  )
}
