import type { CombatState } from '../../game/types'

type TurnStep = 'planning' | 'body_done' | 'enemy_done' | 'end_done'

interface TurnControlsProps {
  turnStep: TurnStep
  combat: CombatState | null
  onExecuteBody: () => void
  onExecuteEnemy: () => void
  onEndTurn: () => void
  onStartNextTurn: () => void
}

const btnStyle = (enabled: boolean, active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '10px 8px',
  background: active ? 'var(--accent)' : enabled ? 'var(--bg-surface)' : 'var(--bg-raised)',
  color: active ? '#fff' : enabled ? 'var(--text)' : 'var(--muted)',
  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: 6,
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: 12,
  fontWeight: active ? 'bold' : 'normal',
  opacity: enabled ? 1 : 0.4,
})

export default function TurnControls({
  turnStep,
  combat,
  onExecuteBody,
  onExecuteEnemy,
  onEndTurn,
  onStartNextTurn,
}: TurnControlsProps) {
  if (!combat) return null

  const steps: { label: string; step: TurnStep; onClick: () => void }[] = [
    { label: '1. Execute Body Actions', step: 'planning', onClick: onExecuteBody },
    { label: '2. Execute Enemy Turn', step: 'body_done', onClick: onExecuteEnemy },
    { label: '3. End Turn', step: 'enemy_done', onClick: onEndTurn },
    { label: '4. Start Next Turn', step: 'end_done', onClick: onStartNextTurn },
  ]

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 12,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Turn Execution</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {steps.map(({ label, step, onClick }) => {
          const isActive = turnStep === step
          const isDone = steps.findIndex(s => s.step === turnStep) > steps.findIndex(s => s.step === step)
          return (
            <button
              key={step}
              disabled={!isActive}
              onClick={onClick}
              style={btnStyle(isActive, isActive)}
            >
              {isDone ? '\u2713 ' : ''}{label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
