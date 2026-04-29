import type { CombatState, BodySlot, RunState } from '../game/types'
import type { SlotProjection } from '../game/combat'
import BodyRow from './BodyRow'
import HandRow from './HandRow'
import TargetCard from './TargetCard'

interface Props {
  combat: CombatState
  run: Pick<RunState, 'parts' | 'equipment'>
  selectedCardId: string | null
  pushed: boolean
  projections: SlotProjection[]
  activeSlot: BodySlot | null
  effectiveTarget: string | null
  animating: boolean
  onSelectCard: (instanceId: string | null) => void
  onTogglePush: () => void
  onAssignSlot: (slot: BodySlot) => void
  onExecute: () => void
}

export default function ControlDeck({
  combat, run, selectedCardId, pushed, projections, activeSlot, effectiveTarget, animating,
  onSelectCard, onTogglePush, onAssignSlot, onExecute,
}: Props) {
  const canExecute = !animating && combat.phase === 'planning'

  return (
    <div style={{
      width: 360,
      flexShrink: 0,
      background: 'linear-gradient(180deg, #0c0a18 0%, #07050d 100%)',
      borderLeft: '1px solid #2a2546',
      display: 'flex',
      flexDirection: 'column',
      padding: '14px 12px 12px',
      gap: 10,
    }}>
      <BodyRow
        combat={combat}
        equipment={run.equipment}
        parts={run.parts}
        selectedCardId={selectedCardId}
        projections={projections}
        activeSlot={activeSlot}
        onAssign={onAssignSlot}
      />
      <HandRow
        combat={combat}
        selectedCardId={selectedCardId}
        pushed={pushed}
        onSelect={onSelectCard}
        onTogglePush={onTogglePush}
      />

      {/* Spacer pushes target + execute to the bottom */}
      <div style={{ flex: 1 }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 130px',
        gap: 8,
        alignItems: 'stretch',
      }}>
        <TargetCard combat={combat} effectiveTarget={effectiveTarget} />
        <button
          onClick={onExecute}
          disabled={!canExecute}
          style={{
            background: canExecute
              ? 'linear-gradient(180deg, #b53a2c 0%, #8a1d12 100%)'
              : 'linear-gradient(180deg, #3a2c34 0%, #2a1d22 100%)',
            border: `1px solid ${canExecute ? '#d54f3f' : '#444'}`,
            borderRadius: 8,
            color: canExecute ? '#fff5f0' : '#555',
            cursor: canExecute ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            fontWeight: 'bold',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            padding: '0 8px',
            boxShadow: canExecute
              ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(181,58,44,0.4)'
              : 'none',
            transition: 'all 0.12s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <span style={{ fontSize: 14 }}>EXECUTE</span>
          <span style={{ fontSize: 8, fontWeight: 400, letterSpacing: 1, opacity: 0.7 }}>
            END PLANNING
          </span>
        </button>
      </div>
    </div>
  )
}
