import type { CombatState, ModifierCardDefinition, CardInstance } from '../game/types'
import { ALL_CARDS } from '../data/cards'

interface Props {
  combat: CombatState
  selectedCardId: string | null
  pushed: boolean
  onSelect: (instanceId: string | null) => void
  onTogglePush: () => void
}

const TAG_COLORS: Record<string, string> = {
  Amplify: '#b2a4f5', Redirect: '#74b9ff', Repeat: '#fd79a8', Override: '#e17055',
  Feedback: '#f39c12', Retaliate: '#e74c3c',
  Draw: '#ffeaa7', Utility: '#00cec9', Conditional: '#fab1a0',
}

function categoryTag(def: ModifierCardDefinition): string {
  return def.category.modifier
}

function shortDescription(def: ModifierCardDefinition): string {
  const desc = def.description
  const cut = desc.indexOf('. ')
  return cut > 0 ? desc.slice(0, cut) : desc
}

export default function HandRail({ combat, selectedCardId, pushed, onSelect, onTogglePush }: Props) {
  const assignedIds = new Set([
    ...Object.values(combat.slotModifiers).filter((id): id is string => id !== null && id !== '__system__'),
    ...Object.values(combat.slotModifiers2).filter((id): id is string => id !== null),
  ])
  const visibleHand = combat.hand.filter(c => !assignedIds.has(c.instanceId))

  const canPlay = combat.phase === 'planning'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      paddingTop: 4,
      minWidth: 0,
    }}>
      <div style={{
        fontSize: 10,
        letterSpacing: 2,
        color: '#3d3858',
        textAlign: 'center',
        lineHeight: 1,
        marginBottom: 2,
        textTransform: 'uppercase',
      }}>
        Hand · {visibleHand.length}
      </div>
      {visibleHand.map(card => (
        <CardRow
          key={card.instanceId}
          card={card}
          combat={combat}
          isSelected={selectedCardId === card.instanceId}
          isPushed={selectedCardId === card.instanceId && pushed}
          canPlay={canPlay}
          onSelect={() => onSelect(selectedCardId === card.instanceId ? null : card.instanceId)}
          onTogglePush={onTogglePush}
        />
      ))}
      {visibleHand.length === 0 && (
        <div style={{ fontSize: 9, color: '#3d3858', fontStyle: 'italic', padding: 6, textAlign: 'center' }}>
          empty
        </div>
      )}
    </div>
  )
}

function CardRow({
  card, combat, isSelected, isPushed, canPlay, onSelect, onTogglePush,
}: {
  card: CardInstance
  combat: CombatState
  isSelected: boolean
  isPushed: boolean
  canPlay: boolean
  onSelect: () => void
  onTogglePush: () => void
}) {
  const baseDef = ALL_CARDS[card.definitionId]
  if (!baseDef) return null
  const def = card.isUpgraded && baseDef.upgraded ? baseDef.upgraded : baseDef

  const affordable = combat.currentEnergy >= def.energyCost
  const playable = canPlay && affordable
  const tag = categoryTag(def)
  const tagColor = TAG_COLORS[tag] ?? '#6b6585'

  const isPushable = def.pushCost != null && def.pushedCategory != null
  const pushOverCap = isPushable && combat.strain + (def.pushCost ?? 0) >= combat.maxStrain

  const borderColor = isSelected
    ? '#b2a4f5'
    : isPushed
      ? '#e67e22'
      : !affordable
        ? '#e74c3c'
        : isPushable
          ? 'rgba(230,126,34,0.45)'
          : '#3d3868'

  return (
    <div
      onClick={() => playable && onSelect()}
      style={{
        background: isSelected
          ? 'linear-gradient(180deg, rgba(178,164,245,0.32), rgba(178,164,245,0.18))'
          : isPushed
            ? 'linear-gradient(180deg, rgba(230,126,34,0.22), rgba(230,126,34,0.10))'
            : 'linear-gradient(180deg, #2a2546 0%, #1a1535 100%)',
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        padding: '5px 5px 4px',
        cursor: playable ? 'pointer' : 'default',
        opacity: playable ? 1 : 0.5,
        boxShadow: isSelected ? '0 0 16px rgba(178,164,245,0.4)' : 'none',
        transform: isSelected ? 'translateX(4px)' : 'none',
        transition: 'transform 0.12s, border-color 0.12s, box-shadow 0.12s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        textAlign: 'left',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
        gap: 4,
      }}>
        <span style={{
          fontSize: 9.5,
          fontWeight: 'bold',
          color: '#e9e4f5',
          letterSpacing: 0.3,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          minWidth: 0,
        }}>
          {def.name}
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 'bold',
          color: def.energyCost > 0 ? '#f1c40f' : '#6b6585',
          lineHeight: 1,
          flexShrink: 0,
        }}>
          {def.energyCost}
        </span>
      </div>

      <div style={{
        fontSize: 8,
        color: '#a09bbe',
        lineHeight: 1.2,
        whiteSpace: 'normal',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {shortDescription(def)}
      </div>

      <div style={{
        fontSize: 7,
        letterSpacing: 0.5,
        color: tagColor,
        textTransform: 'uppercase',
        marginTop: 2,
      }}>
        // {tag}
      </div>

      {isPushable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!isSelected) onSelect()
            if (!pushOverCap) onTogglePush()
          }}
          disabled={pushOverCap}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 4,
            padding: '3px 0',
            fontSize: 9,
            letterSpacing: 1.5,
            fontWeight: 'bold',
            border: `1px solid ${pushOverCap ? '#3d3858' : '#e67e22'}`,
            background: isPushed
              ? 'linear-gradient(180deg, #e67e22, #c0651b)'
              : 'rgba(230,126,34,0.10)',
            color: isPushed ? '#fff' : pushOverCap ? '#3d3858' : '#e67e22',
            borderRadius: 3,
            cursor: pushOverCap ? 'default' : 'pointer',
            textAlign: 'center',
            textTransform: 'uppercase',
            transition: 'background 0.12s',
          }}
          title={pushOverCap ? 'Would reach forfeit strain' : isPushed ? 'Pushed — tap to disengage' : 'Push for bigger effect, costs strain'}
        >
          {isPushed ? `★ PUSHED +${def.pushCost}s` : `PUSH +${def.pushCost}s`}
        </button>
      )}
    </div>
  )
}
