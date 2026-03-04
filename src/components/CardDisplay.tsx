import type { CardDefinition } from '../game/types'

interface Props {
  card: CardDefinition
  instanceId?: string
  disabled?: boolean
  selected?: boolean
  onClick?: () => void
}

const TYPE_COLORS: Record<string, string> = {
  Attack: '#c0392b',
  Skill: '#2980b9',
  Power: '#8e44ad',
}

export default function CardDisplay({ card, disabled, selected, onClick }: Props) {
  const borderColor = selected ? '#f1c40f' : (TYPE_COLORS[card.type] ?? '#555')

  return (
    <button
      className="card-display"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: `2px solid ${borderColor}`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: '#1a1a2e',
        color: '#e8e8e8',
        borderRadius: '8px',
        padding: '10px 8px',
        width: '110px',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        textAlign: 'center',
        position: 'relative',
        transition: 'transform 0.1s, box-shadow 0.1s',
        boxShadow: selected ? '0 0 8px #f1c40f' : 'none',
      }}
    >
      {/* Cost pip */}
      <div style={{
        position: 'absolute',
        top: '6px',
        left: '6px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#f1c40f',
        color: '#1a1a2e',
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {card.cost}
      </div>

      {/* Type badge */}
      <div style={{
        position: 'absolute',
        top: '6px',
        right: '6px',
        fontSize: '9px',
        color: borderColor,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {card.type}
      </div>

      {/* Name */}
      <div style={{
        marginTop: '28px',
        fontWeight: 'bold',
        fontSize: '13px',
        lineHeight: '1.2',
      }}>
        {card.name}
      </div>

      {/* Description */}
      <div style={{
        fontSize: '11px',
        color: '#ccc',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1.4',
      }}>
        {card.description}
      </div>

      {/* Keywords */}
      {card.keywords.length > 0 && (
        <div style={{ fontSize: '9px', color: '#f39c12', fontStyle: 'italic' }}>
          {card.keywords.join(', ')}
        </div>
      )}
    </button>
  )
}
