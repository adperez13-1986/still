import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRunStore } from '../store/runStore'
import { ALL_CARDS, SECTOR1_CARD_POOL, SECTOR2_CARD_POOL } from '../data/cards'
import { BEHAVIORAL_PARTS, EQUIPMENT } from '../data/parts'
import { makeCardInstance } from '../game/combat'
import CardDisplay from './CardDisplay'
import EquipCompareOverlay from './EquipCompareOverlay'
import type { EquipmentDefinition } from '../game/types'

const SECTOR_FLAVOR: Record<number, string> = {
  1: 'The corridor opens into warmth. Something ahead hums with purpose.',
  2: 'The deeper halls breathe. Light flickers where none should exist.',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function StagingScreen() {
  const navigate = useNavigate()
  const run = useRunStore()
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [equipConflict, setEquipConflict] = useState<EquipmentDefinition | null>(null)

  const nextSector = run.sector + 1

  const nextCardPool = useMemo(() => {
    return nextSector >= 2 ? SECTOR2_CARD_POOL : SECTOR1_CARD_POOL
  }, [nextSector])

  // Bonus reward options (generated once)
  const bonusCards = useMemo(() => shuffle(nextCardPool).slice(0, 3), [nextCardPool])
  const bonusPart = useMemo(() => {
    const parts = shuffle(BEHAVIORAL_PARTS)
    return parts[0] ?? null
  }, [])
  const bonusEquip = useMemo(() => {
    const equips = shuffle(EQUIPMENT)
    return equips[0] ?? null
  }, [])

  // Step 1: Repair (auto-heal)
  if (step === 1) {
    const healed = run.health < run.maxHealth
    return (
      <div style={containerStyle}>
        <h2 style={{ letterSpacing: '3px', color: '#27ae60' }}>SECTOR {run.sector} CLEARED</h2>
        <p style={{ color: '#888', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', maxWidth: '400px' }}>
          {SECTOR_FLAVOR[run.sector] ?? 'The path continues.'}
        </p>
        <div style={{
          backgroundColor: '#16213e',
          borderRadius: '8px',
          padding: '20px 32px',
          border: '1px solid #27ae60',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '16px', color: '#27ae60', fontWeight: 'bold', marginBottom: '8px' }}>
            REPAIR COMPLETE
          </div>
          <div style={{ fontSize: '14px', color: '#e8e8e8' }}>
            {healed
              ? `Restored to full health: ${run.maxHealth}/${run.maxHealth}`
              : `Already at full health: ${run.maxHealth}/${run.maxHealth}`}
          </div>
        </div>
        <button
          onClick={() => {
            run.heal(run.maxHealth)
            setStep(2)
          }}
          style={primaryButtonStyle}
        >
          Continue
        </button>
      </div>
    )
  }

  // Step 2: Upgrade a card
  if (step === 2) {
    const upgradeable = run.deck.filter(inst => {
      const def = ALL_CARDS[inst.definitionId]
      return def?.upgraded && !inst.isUpgraded
    })

    return (
      <div style={containerStyle}>
        <h2 style={{ letterSpacing: '3px', color: '#a29bfe' }}>UPGRADE</h2>
        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center' }}>
          Choose a card to upgrade, or skip.
        </p>
        {upgradeable.length > 0 ? (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px' }}>
            {upgradeable.map(inst => {
              const def = ALL_CARDS[inst.definitionId]
              if (!def?.upgraded) return null
              return (
                <CardDisplay
                  key={inst.instanceId}
                  card={def.upgraded}
                  onClick={() => {
                    useRunStore.setState(s => {
                      const card = s.deck.find(c => c.instanceId === inst.instanceId)
                      if (card) card.isUpgraded = true
                    })
                    setStep(3)
                  }}
                />
              )
            })}
          </div>
        ) : (
          <p style={{ color: '#555', fontSize: '13px' }}>No cards available to upgrade.</p>
        )}
        <button onClick={() => setStep(3)} style={secondaryButtonStyle}>
          Skip
        </button>
      </div>
    )
  }

  // Step 3: Remove a card
  if (step === 3) {
    const canRemove = run.deck.length > 5

    if (!canRemove) {
      // Auto-skip if deck too small
      return (
        <div style={containerStyle}>
          <h2 style={{ letterSpacing: '3px', color: '#e67e22' }}>SCRAP</h2>
          <p style={{ color: '#555', fontSize: '13px', textAlign: 'center' }}>
            Deck too small to remove a card (minimum 5).
          </p>
          <button onClick={() => setStep(4)} style={primaryButtonStyle}>
            Continue
          </button>
        </div>
      )
    }

    return (
      <div style={containerStyle}>
        <h2 style={{ letterSpacing: '3px', color: '#e67e22' }}>SCRAP</h2>
        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center' }}>
          Choose a card to permanently remove from your deck, or skip.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px' }}>
          {run.deck.map(inst => {
            const def = ALL_CARDS[inst.definitionId]
            if (!def) return null
            const displayDef = inst.isUpgraded && def.upgraded ? def.upgraded : def
            return (
              <CardDisplay
                key={inst.instanceId}
                card={displayDef}
                onClick={() => {
                  run.removeCardFromDeck(inst.instanceId)
                  setStep(4)
                }}
              />
            )
          })}
        </div>
        <button onClick={() => setStep(4)} style={secondaryButtonStyle}>
          Skip
        </button>
      </div>
    )
  }

  // Step 4: Bonus reward
  if (step === 4) {
    // Equipment conflict overlay
    if (equipConflict) {
      const current = run.equipment[equipConflict.slot]!
      return (
        <EquipCompareOverlay
          current={current}
          incoming={equipConflict}
          onKeep={() => {
            setEquipConflict(null)
            setStep(5)
          }}
          onEquip={() => {
            run.equipItem(equipConflict)
            setEquipConflict(null)
            setStep(5)
          }}
        />
      )
    }

    return (
      <div style={containerStyle}>
        <h2 style={{ letterSpacing: '3px', color: '#f1c40f' }}>BONUS</h2>
        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center' }}>
          Choose a reward to take into Sector {nextSector}.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Card option */}
          <BonusOption
            title="Card"
            description={`Pick 1 of ${bonusCards.length} cards`}
            color="#a29bfe"
            onClick={() => {
              // Show card pick sub-step — for simplicity, render inline
              setStep(4.5 as any)
            }}
          />
          {/* Part option */}
          {bonusPart && (
            <BonusOption
              title="Part"
              description={bonusPart.name}
              color="#27ae60"
              onClick={() => {
                run.addPart(bonusPart)
                setStep(5)
              }}
            />
          )}
          {/* Equipment option */}
          {bonusEquip && (
            <BonusOption
              title="Equipment"
              description={bonusEquip.name}
              color="#74b9ff"
              onClick={() => {
                if (run.equipment[bonusEquip.slot] !== null) {
                  setEquipConflict(bonusEquip)
                } else {
                  run.equipItem(bonusEquip)
                  setStep(5)
                }
              }}
            />
          )}
        </div>
      </div>
    )
  }

  // Step 4.5: Card pick (sub-step of bonus)
  if ((step as number) === 4.5) {
    return (
      <div style={containerStyle}>
        <h2 style={{ letterSpacing: '3px', color: '#a29bfe' }}>CHOOSE A CARD</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {bonusCards.map(def => (
            <CardDisplay
              key={def.id}
              card={def}
              onClick={() => {
                run.addCardToDeck(makeCardInstance(def.id))
                setStep(5)
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  // Step 5: Continue to next sector
  return (
    <div style={containerStyle}>
      <h2 style={{ letterSpacing: '3px', color: '#a29bfe' }}>READY</h2>
      <p style={{ color: '#888', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
        The path descends. Something new awaits.
      </p>
      <div style={{
        backgroundColor: '#16213e',
        borderRadius: '8px',
        padding: '16px 24px',
        border: '1px solid #2c3e50',
        fontSize: '13px',
        color: '#aaa',
        textAlign: 'center',
      }}>
        <div>HP: {run.health}/{run.maxHealth}</div>
        <div>Deck: {run.deck.length} cards</div>
        <div>Parts: {run.parts.length}</div>
      </div>
      <button
        onClick={() => {
          run.advanceSector()
          navigate('/run')
        }}
        style={{
          ...primaryButtonStyle,
          backgroundColor: '#a29bfe',
          fontSize: '18px',
          padding: '16px 64px',
        }}
      >
        CONTINUE TO SECTOR {nextSector}
      </button>
    </div>
  )
}

function BonusOption({ title, description, color, onClick }: {
  title: string
  description: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#16213e',
        border: `2px solid ${color}`,
        borderRadius: '10px',
        padding: '20px 24px',
        cursor: 'pointer',
        color: '#e8e8e8',
        minWidth: '140px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 'bold', color, marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: '#aaa' }}>
        {description}
      </div>
    </button>
  )
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#0d0d1a',
  color: '#e8e8e8',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
  padding: '40px',
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '12px 40px',
  backgroundColor: '#27ae60',
  border: 'none',
  color: '#fff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 'bold',
  letterSpacing: '1px',
}

const secondaryButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid #555',
  color: '#888',
  borderRadius: '6px',
  padding: '8px 24px',
  cursor: 'pointer',
  fontSize: '12px',
}
