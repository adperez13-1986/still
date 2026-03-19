import type { ModifierCardDefinition } from '../game/types'

interface Props {
  card: ModifierCardDefinition
  instanceId?: string
  disabled?: boolean
  selected?: boolean
  onClick?: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Amplify: '#a29bfe',
  Redirect: '#74b9ff',
  Repeat: '#fd79a8',
  Override: '#e17055',
  Utility: '#00cec9',
  Draw: '#ffeaa7',
  Conditional: '#fab1a0',
}

export default function CardDisplay({ card, disabled, selected, onClick }: Props) {
  const category = card.category.type === 'slot' ? card.category.modifier : card.category.homeSlot
  const categoryColor = card.category.type === 'slot'
    ? CATEGORY_COLORS[card.category.modifier] ?? '#888'
    : '#f1c40f'

  const borderColor = selected ? '#f1c40f' : categoryColor

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
      {/* Energy cost */}
      <div style={{
        position: 'absolute',
        top: '6px',
        left: '6px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: card.energyCost > 0 ? '#e67e22' : '#555',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {card.energyCost}
      </div>

      {/* Category badge */}
      <div style={{
        position: 'absolute',
        top: '6px',
        right: '6px',
        fontSize: '8px',
        color: categoryColor,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {category}
      </div>

      {/* Name */}
      <div style={{
        marginTop: '28px',
        fontWeight: 'bold',
        fontSize: '12px',
        lineHeight: '1.2',
      }}>
        {card.name}
      </div>

      {/* Description */}
      <div style={{
        fontSize: '10px',
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
      <div style={{ fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {(card.keywords.length > 0 || card.category.type === 'system') && (
          <div style={{ color: '#f39c12', fontStyle: 'italic' }}>
            {card.category.type === 'system'
              ? card.keywords.length > 0
                ? [...new Set([...card.keywords, 'Exhaust'])].join(', ')
                : 'Exhaust'
              : card.keywords.join(', ')}
          </div>
        )}
      </div>
    </button>
  )
}
