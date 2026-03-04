import { useState } from 'react'
import { ACT1_EVENTS, ACT2_EVENTS, NAME_DISCOVERY_EVENT } from '../data/narrative'
import type { Room } from '../game/types'
import type { EventChoice } from '../data/narrative'

interface Props {
  room: Room
  nameDiscovered: boolean
  onChoice: (outcome: EventChoice['outcome']) => void
}

export default function EventScreen({ room, nameDiscovered, onChoice }: Props) {
  const [event] = useState(() => {
    const pool = room.act >= 2 ? ACT2_EVENTS : ACT1_EVENTS
    // In Act 2+, name discovery takes priority if not yet found
    return (room.act >= 2 && !nameDiscovered && Math.random() < 0.3)
      ? NAME_DISCOVERY_EVENT
      : pool[Math.floor(Math.random() * pool.length)]
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '32px',
      padding: '60px 40px',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <div style={{ color: '#a29bfe', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>
        Event
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
        {event.title}
      </h2>

      <p style={{
        color: '#ccc',
        fontSize: '14px',
        lineHeight: '1.8',
        textAlign: 'center',
        fontStyle: 'italic',
        whiteSpace: 'pre-line',
      }}>
        {event.body}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
        {event.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => onChoice(choice.outcome)}
            style={{
              padding: '14px 24px',
              backgroundColor: '#16213e',
              border: '1px solid #a29bfe',
              color: '#e8e8e8',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left',
              lineHeight: '1.5',
            }}
          >
            <div style={{ marginBottom: '4px' }}>{choice.text}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{choice.outcome.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
