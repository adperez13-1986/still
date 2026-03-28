import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SECTOR1_CARD_POOL, SECTOR2_CARD_POOL, CARD_POOL, STARTING_CARDS, ALL_CARDS } from '../data/cards'
import { EQUIPMENT, SECTOR1_PART_POOL, SECTOR2_PART_POOL } from '../data/parts'
import { SECTOR1_ENEMIES, SECTOR1_ELITES, SECTOR1_BOSS, SECTOR2_ENEMIES, SECTOR2_ELITES, SECTOR2_BOSS } from '../data/enemies'
import type { ModifierCardDefinition, EnemyDefinition } from '../game/types'

const TABS = ['Cards', 'Equipment', 'Mods', 'Bestiary'] as const
type Tab = (typeof TABS)[number]

const RARITY_COLORS: Record<string, string> = {
  common: '#888',
  uncommon: '#74b9ff',
  rare: '#f1c40f',
}

const SLOT_ORDER = ['Head', 'Torso', 'Arms', 'Legs'] as const

// ─── Shared Styles ──────────────────────────────────────────────────────────

const entryStyle: React.CSSProperties = {
  backgroundColor: '#16213e',
  borderRadius: '8px',
  padding: '12px 16px',
  border: '1px solid #2c3e50',
}

const sectionHeaderStyle: React.CSSProperties = {
  color: '#aaa',
  fontSize: '11px',
  letterSpacing: '3px',
  margin: '20px 0 10px',
}

// ─── Card Entry ─────────────────────────────────────────────────────────────

function CardEntry({ card }: { card: ModifierCardDefinition }) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const display = showUpgrade && card.upgraded ? card.upgraded : card

  const energyLabel = `${display.energyCost} Energy`
  const energyColor = display.energyCost === 0 ? '#888' : '#fdcb6e'

  return (
    <div style={entryStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e8e8e8' }}>
          {display.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: energyColor }}>{energyLabel}</span>
          {card.upgraded && (
            <button
              onClick={() => setShowUpgrade(!showUpgrade)}
              style={{
                padding: '2px 8px',
                backgroundColor: showUpgrade ? '#a29bfe' : 'transparent',
                border: `1px solid ${showUpgrade ? '#a29bfe' : '#555'}`,
                borderRadius: '4px',
                color: showUpgrade ? '#0d0d1a' : '#888',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              +
            </button>
          )}
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{display.description}</div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', color: '#74b9ff', letterSpacing: '1px' }}>
          {display.category.modifier}
        </span>
        {display.keywords.map((k) => (
          <span key={k} style={{ fontSize: '10px', color: '#e17055', letterSpacing: '1px' }}>{k}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Cards Tab ──────────────────────────────────────────────────────────────

// Deduplicate starting cards (e.g., 3x Boost → 1 entry)
const uniqueStarting = STARTING_CARDS.filter(
  (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i,
)
const allUniqueCards = [
  ...uniqueStarting,
  ...SECTOR1_CARD_POOL.filter((c) => !uniqueStarting.some((s) => s.id === c.id)),
]
// Add companion cards
const companionIds = Object.keys(ALL_CARDS).filter(
  (id) => !allUniqueCards.some((c) => c.id === id),
)
const companionCards = companionIds.map((id) => ALL_CARDS[id])

function CardsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h4 style={sectionHeaderStyle}>STARTING</h4>
      {uniqueStarting.map((c) => <CardEntry key={c.id} card={c} />)}
      <h4 style={sectionHeaderStyle}>COMMON (more likely in S1)</h4>
      {SECTOR1_CARD_POOL.map((c) => <CardEntry key={c.id} card={c} />)}
      <h4 style={sectionHeaderStyle}>ADVANCED (more likely in S2)</h4>
      {SECTOR2_CARD_POOL.map((c) => <CardEntry key={c.id} card={c} />)}
      {companionCards.length > 0 && (
        <>
          <h4 style={sectionHeaderStyle}>COMPANIONS</h4>
          {companionCards.map((c) => <CardEntry key={c.id} card={c} />)}
        </>
      )}
    </div>
  )
}

// ─── Equipment Tab ──────────────────────────────────────────────────────────

function EquipmentTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {SLOT_ORDER.map((slot) => {
        const items = EQUIPMENT.filter((e) => e.slot === slot)
        if (items.length === 0) return null
        return (
          <div key={slot}>
            <h4 style={sectionHeaderStyle}>{slot.toUpperCase()}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((e) => (
                <div key={e.id} style={entryStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#e8e8e8' }}>{e.name}</span>
                    <span style={{ fontSize: '10px', color: RARITY_COLORS[e.rarity], letterSpacing: '1px' }}>
                      {e.rarity.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{e.description}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Mods Tab ───────────────────────────────────────────────────────────────

function PartEntry({ part }: { part: { id: string; name: string; description: string; rarity: string } }) {
  return (
    <div style={entryStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#e8e8e8' }}>{part.name}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: RARITY_COLORS[part.rarity], letterSpacing: '1px' }}>
            {part.rarity.toUpperCase()}
          </span>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{part.description}</div>
    </div>
  )
}

function ModsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h4 style={sectionHeaderStyle}>SECTOR 1</h4>
      {SECTOR1_PART_POOL.map((p) => <PartEntry key={p.id} part={p} />)}
      <h4 style={sectionHeaderStyle}>SECTOR 2</h4>
      {SECTOR2_PART_POOL.map((p) => <PartEntry key={p.id} part={p} />)}
    </div>
  )
}

// ─── Bestiary Tab ───────────────────────────────────────────────────────────

function IntentSummary({ enemy }: { enemy: EnemyDefinition }) {
  const summary = enemy.intentPattern.map((intent) => {
    if (intent.type === 'Attack') return `Atk ${intent.value}`
    if (intent.type === 'Block') return `Blk ${intent.value}`
    if (intent.type === 'Buff') return `Buff ${intent.status} ${intent.value}`
    if (intent.type === 'Debuff') return `${intent.status} ${intent.value}`
    if (intent.type === 'AttackDebuff') return `Atk ${intent.value}+${intent.status}`
    return intent.type
  })
  return (
    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
      Pattern: {summary.join(' → ')}
    </div>
  )
}

function EnemyEntry({ enemy }: { enemy: EnemyDefinition }) {
  return (
    <div style={entryStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#e8e8e8' }}>{enemy.name}</span>
        <span style={{ fontSize: '12px', color: '#e74c3c' }}>HP {enemy.maxHealth}</span>
      </div>
      {enemy.flavorText && (
        <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', marginTop: '4px' }}>
          "{enemy.flavorText}"
        </div>
      )}
      <IntentSummary enemy={enemy} />
      <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
        Drops: {enemy.dropPool
          .filter((d) => d.type !== 'shards')
          .map((d) => {
            if (d.type === 'card') return `Cards(${d.ids?.join(', ') ?? 'pool'})`
            if (d.type === 'part') return `Mods(${d.ids?.join(', ') ?? 'pool'})`
            if (d.type === 'equipment') return `Equip(${d.ids?.join(', ') ?? 'pool'})`
            return d.type
          })
          .join(', ') || 'Shards only'}
      </div>
    </div>
  )
}

function BestiaryTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h4 style={sectionHeaderStyle}>SECTOR 1 — STANDARD</h4>
      {SECTOR1_ENEMIES.map((e) => <EnemyEntry key={e.id} enemy={e} />)}
      <h4 style={sectionHeaderStyle}>SECTOR 1 — ELITE</h4>
      {SECTOR1_ELITES.map((e) => <EnemyEntry key={e.id} enemy={e} />)}
      <h4 style={sectionHeaderStyle}>SECTOR 1 — BOSS</h4>
      <EnemyEntry enemy={SECTOR1_BOSS} />
      <h4 style={sectionHeaderStyle}>SECTOR 2 — STANDARD</h4>
      {SECTOR2_ENEMIES.map((e) => <EnemyEntry key={e.id} enemy={e} />)}
      <h4 style={sectionHeaderStyle}>SECTOR 2 — ELITE</h4>
      {SECTOR2_ELITES.map((e) => <EnemyEntry key={e.id} enemy={e} />)}
      <h4 style={sectionHeaderStyle}>SECTOR 2 — BOSS</h4>
      <EnemyEntry enemy={SECTOR2_BOSS} />
    </div>
  )
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function CompendiumScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('Cards')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', width: '100%', maxWidth: '700px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: '1px solid #333',
            color: '#888',
            borderRadius: '6px',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Back
        </button>
        <h1 style={{
          letterSpacing: '4px',
          fontSize: '20px',
          color: '#a29bfe',
          margin: 0,
          fontWeight: '300',
        }}>
          COMPENDIUM
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        width: '100%',
        maxWidth: '700px',
        marginBottom: '20px',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 0',
              backgroundColor: activeTab === tab ? '#1e3a5f' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #a29bfe' : '2px solid #2c3e50',
              color: activeTab === tab ? '#a29bfe' : '#666',
              fontSize: '12px',
              letterSpacing: '1px',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: '700px', paddingBottom: '40px' }}>
        {activeTab === 'Cards' && <CardsTab />}
        {activeTab === 'Equipment' && <EquipmentTab />}
        {activeTab === 'Mods' && <ModsTab />}
        {activeTab === 'Bestiary' && <BestiaryTab />}
      </div>
    </div>
  )
}
