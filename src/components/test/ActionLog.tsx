import { useEffect, useRef } from 'react'

interface ActionLogProps {
  log: string[]
}

export default function ActionLog({ log }: ActionLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 12,
      maxHeight: 300,
      overflowY: 'auto',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Action Log</div>
      {log.length === 0 ? (
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>No actions yet.</div>
      ) : (
        <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {log.map((entry, i) => {
            const isHeader = entry.startsWith('---')
            const isDebug = entry.startsWith('[DEBUG]')
            return (
              <div
                key={i}
                style={{
                  padding: '2px 0',
                  color: isHeader ? 'var(--accent)' : isDebug ? 'var(--gold)' : 'var(--text)',
                  fontWeight: isHeader ? 'bold' : 'normal',
                  borderTop: isHeader ? '1px solid var(--border)' : undefined,
                  marginTop: isHeader ? 4 : 0,
                }}
              >
                {entry}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}
