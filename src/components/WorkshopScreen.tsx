import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePermanentStore } from '../store/permanentStore'
import { GRACE_LINES } from '../data/narrative'
import { encodeSaveCode, decodeSaveCode } from '../game/persistence'
import { ALL_PARTS } from '../data/parts'
import RunEndOverlay from './RunEndOverlay'
import CarrySelectOverlay from './CarrySelectOverlay'
import type { PermanentState, WorkshopUpgradeId, BehavioralPartDefinition } from '../game/types'

const WORKSHOP_REPAIR_COST = 50

const COMPANIONS = [
  {
    id: 'yanah',
    name: 'Yanah',
    description: 'Unlocks event: find Yanah during runs. Gain 4 Block (8 while Cool).',
    cost: 80,
  },
  {
    id: 'yuri',
    name: 'Yuri',
    description: 'Unlocks event: find Yuri during runs. Deal 8 damage (14 while Hot).',
    cost: 80,
  },
]

const UPGRADES: Array<{ id: WorkshopUpgradeId; name: string; description: string; cost: number }> = [
  { id: 'practiced-routine', name: 'Practiced Routine', description: 'Start each run with an extra non-basic card.', cost: 75 },
  { id: 'sharp-eye', name: 'Sharp Eye', description: 'Earn 20% more shards from enemies.', cost: 40 },
  { id: 'fragment-cap', name: 'Fragment Reservoir', description: 'Increase max offline fragment accumulation by 50%.', cost: 60 },
  { id: 'starting-slot', name: 'Extra Slot', description: 'Start each run with Torso (Scrap Plating) pre-equipped.', cost: 100 },
]

export default function WorkshopScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const permanent = usePermanentStore()
  const [graceLine] = useState(() => GRACE_LINES[Math.floor(Math.random() * GRACE_LINES.length)])
  const [showHistory, setShowHistory] = useState(false)
  const [exportFeedback, setExportFeedback] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [importCode, setImportCode] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importConfirm, setImportConfirm] = useState(false)
  const runEndState = location.state as { runEnd?: boolean; outcome?: string; message?: string; parts?: BehavioralPartDefinition[] } | null
  const runEnd = runEndState
  const runEndParts: BehavioralPartDefinition[] = runEndState?.parts ?? []
  const hasPartsToCarry = runEndParts.length > 0 || permanent.carriedPart !== null
  const [showCarrySelect, setShowCarrySelect] = useState(() => !!(runEndState?.runEnd && hasPartsToCarry))


  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d1a',
      color: '#e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32px',
      padding: '48px 24px',
    }}>
      {/* Run end overlay */}
      {runEnd?.runEnd && (
        <RunEndOverlay
          outcome={runEnd.outcome as 'victory' | 'defeat'}
          message={runEnd.message ?? ''}
        />
      )}

      {/* Carry select overlay */}
      {showCarrySelect && (
        <CarrySelectOverlay
          runParts={runEndParts}
          currentCarry={permanent.carriedPart}
          onSelect={(partId) => {
            if (partId) {
              const isExistingCarry = permanent.carriedPart?.partId === partId
              if (!isExistingCarry) {
                // New part — fresh durability
                permanent.setCarriedPart({ partId, durability: 3, maxDurability: 3, repairsLeft: 2 })
              }
              // If re-selecting current carry: keep as-is
            } else {
              // "Carry nothing" — clear if they chose to abandon
              // (no-op: we don't clear unless they explicitly had something and chose to drop it)
            }
            permanent.save()
            setShowCarrySelect(false)
          }}
          onDismiss={() => {
            permanent.clearCarriedPart()
            permanent.save()
            setShowCarrySelect(false)
          }}
        />
      )}

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          letterSpacing: '6px',
          fontSize: '32px',
          color: '#a29bfe',
          margin: 0,
          fontWeight: '300',
        }}>
          {permanent.nameEverDiscovered ? 'STILL' : '— — — —'}
        </h1>
        <p style={{
          color: '#888',
          fontSize: '13px',
          fontStyle: 'italic',
          marginTop: '8px',
        }}>
          {graceLine}
        </p>
      </div>

      {/* Resources */}
      <div style={{
        display: 'flex',
        gap: '40px',
        backgroundColor: '#16213e',
        borderRadius: '10px',
        padding: '16px 32px',
        fontSize: '14px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f1c40f', fontSize: '22px', fontWeight: 'bold' }}>
            {permanent.totalShards}
          </div>
          <div style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>SHARDS</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#74b9ff', fontSize: '22px', fontWeight: 'bold' }}>
            {permanent.fragmentsAccumulated}
          </div>
          <div style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>FRAGMENTS</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#55efc4', fontSize: '22px', fontWeight: 'bold' }}>
            {permanent.runHistory.length}
          </div>
          <div style={{ color: '#888', fontSize: '11px', letterSpacing: '1px' }}>RUNS</div>
        </div>
      </div>

      {/* Start Run */}
      <button
        onClick={() => navigate('/fragment')}
        style={{
          padding: '16px 64px',
          backgroundColor: '#a29bfe',
          border: 'none',
          color: '#0d0d1a',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          letterSpacing: '2px',
        }}
      >
        {permanent.nameEverDiscovered ? 'STILL GOING' : 'BEGIN'}
      </button>

      {/* Workshop Upgrades */}
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <h3 style={{ color: '#aaa', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center' }}>
          WORKSHOP
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {UPGRADES.map((u) => {
            const purchased = permanent.workshopUpgrades[u.id]
            const canAfford = permanent.totalShards >= u.cost
            return (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#16213e',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  border: `1px solid ${purchased ? '#27ae60' : '#2c3e50'}`,
                  opacity: purchased ? 0.7 : 1,
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: purchased ? '#27ae60' : '#e8e8e8' }}>
                    {u.name} {purchased && '✓'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{u.description}</div>
                </div>
                {!purchased && (
                  <button
                    onClick={() => permanent.purchaseUpgrade(u.id)}
                    disabled={!canAfford}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: canAfford ? '#f1c40f' : '#2c3e50',
                      border: 'none',
                      borderRadius: '6px',
                      color: canAfford ? '#1a1a1a' : '#555',
                      fontWeight: 'bold',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {u.cost} shards
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Companions */}
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <h3 style={{ color: '#aaa', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center' }}>
          COMPANIONS
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {COMPANIONS.map((c) => {
            const unlocked = permanent.companionsUnlocked.includes(c.id)
            const canAfford = permanent.totalShards >= c.cost
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#16213e',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  border: `1px solid ${unlocked ? '#a29bfe' : '#2c3e50'}`,
                  opacity: unlocked ? 0.7 : 1,
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: unlocked ? '#a29bfe' : '#e8e8e8' }}>
                    {c.name} {unlocked && '✓'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{c.description}</div>
                  {unlocked && (
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', fontStyle: 'italic' }}>
                      Added to your starting deck.
                    </div>
                  )}
                </div>
                {!unlocked && (
                  <button
                    onClick={() => {
                      if (!canAfford) return
                      permanent.spendShards(c.cost)
                      permanent.unlockCompanion(c.id)
                      permanent.save()
                    }}
                    disabled={!canAfford}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: canAfford ? '#a29bfe' : '#2c3e50',
                      border: 'none',
                      borderRadius: '6px',
                      color: canAfford ? '#1a1a1a' : '#555',
                      fontWeight: 'bold',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.cost} shards
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Carried Part */}
      {permanent.carriedPart && (() => {
        const cp = permanent.carriedPart!
        const partDef = ALL_PARTS[cp.partId]
        if (!partDef) return null
        const isBroken = cp.durability === 0
        const canRepair = isBroken && cp.repairsLeft > 0
        const canAffordRepair = permanent.totalShards >= WORKSHOP_REPAIR_COST
        const borderColor = isBroken ? '#e67e22' : '#27ae60'
        return (
          <div style={{ width: '100%', maxWidth: '700px' }}>
            <h3 style={{ color: '#aaa', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center' }}>
              CARRIED MOD
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#16213e',
              borderRadius: '8px',
              padding: '12px 16px',
              border: `1px solid ${borderColor}`,
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: isBroken ? '#e67e22' : '#e8e8e8' }}>
                  {partDef.name}
                  {isBroken && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', color: '#e74c3c', letterSpacing: '1px' }}>[BROKEN]</span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{partDef.description}</div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                  Durability: {cp.durability}/{cp.maxDurability}
                  {cp.repairsLeft > 0 && <span style={{ marginLeft: '8px' }}>Repairs left: {cp.repairsLeft}</span>}
                </div>
              </div>
              {canRepair && (
                <button
                  onClick={() => {
                    if (!canAffordRepair) return
                    permanent.spendShards(WORKSHOP_REPAIR_COST)
                    permanent.updateCarriedPart({ durability: cp.maxDurability, repairsLeft: cp.repairsLeft - 1 })
                    permanent.save()
                  }}
                  disabled={!canAffordRepair}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: canAffordRepair ? '#e67e22' : '#2c3e50',
                    border: 'none',
                    borderRadius: '6px',
                    color: canAffordRepair ? '#fff' : '#555',
                    fontWeight: 'bold',
                    cursor: canAffordRepair ? 'pointer' : 'not-allowed',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Repair — {WORKSHOP_REPAIR_COST} shards
                </button>
              )}
            </div>
          </div>
        )
      })()}

      {/* Compendium */}
      <button
        onClick={() => navigate('/compendium')}
        style={{
          padding: '10px 32px',
          backgroundColor: 'transparent',
          border: '1px solid #a29bfe',
          color: '#a29bfe',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          letterSpacing: '2px',
          fontWeight: 'bold',
        }}
      >
        COMPENDIUM
      </button>

      {/* Run History */}
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            background: 'none',
            border: '1px solid #333',
            color: '#888',
            borderRadius: '6px',
            padding: '8px 20px',
            cursor: 'pointer',
            fontSize: '12px',
            letterSpacing: '1px',
            width: '100%',
          }}
        >
          {showHistory ? 'Hide' : 'Run History'} ({permanent.runHistory.length})
        </button>

        {showHistory && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {permanent.runHistory.slice(0, 10).map((run) => (
              <div key={run.id} style={{
                backgroundColor: '#16213e',
                borderRadius: '8px',
                padding: '12px 16px',
                border: `1px solid ${run.outcome === 'victory' ? '#27ae60' : '#2c3e50'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '12px',
                    color: run.outcome === 'victory' ? '#27ae60' : '#e74c3c',
                    fontWeight: 'bold',
                  }}>
                    {run.outcome.toUpperCase()} — Sector {run.sectorReached}
                  </span>
                  <span style={{ fontSize: '11px', color: '#555' }}>
                    {new Date(run.date).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#aaa', margin: 0, fontStyle: 'italic' }}>
                  "{run.message}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Transfer */}
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <h3 style={{ color: '#aaa', fontSize: '11px', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center' }}>
          SAVE TRANSFER
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={async () => {
              try {
                const { defaultPermanent } = await import('../store/permanentStore')
                const state: PermanentState = {
                  totalShards: permanent.totalShards,
                  fragmentsAccumulated: permanent.fragmentsAccumulated,
                  lastSeenTimestamp: permanent.lastSeenTimestamp,
                  workshopUpgrades: { ...defaultPermanent.workshopUpgrades, ...permanent.workshopUpgrades },
                  runHistory: [...permanent.runHistory],
                  companionsUnlocked: [...permanent.companionsUnlocked],
                  nameEverDiscovered: permanent.nameEverDiscovered,
                  carriedPart: permanent.carriedPart,
                }
                const code = await encodeSaveCode(state)
                await navigator.clipboard.writeText(code)
                setExportFeedback('Copied!')
                setTimeout(() => setExportFeedback(null), 2000)
              } catch {
                setExportFeedback('Failed to export')
                setTimeout(() => setExportFeedback(null), 2000)
              }
            }}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'transparent',
              border: '1px solid #333',
              color: '#888',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '1px',
            }}
          >
            {exportFeedback ?? 'Export Save'}
          </button>
          <button
            onClick={() => { setShowImport(!showImport); setImportError(null); setImportConfirm(false); setImportCode('') }}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'transparent',
              border: '1px solid #333',
              color: '#888',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '1px',
            }}
          >
            Import Save
          </button>
        </div>

        {showImport && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              value={importCode}
              onChange={(e) => { setImportCode(e.target.value); setImportError(null); setImportConfirm(false) }}
              placeholder="Paste your save code here..."
              style={{
                width: '100%',
                minHeight: '60px',
                backgroundColor: '#16213e',
                border: '1px solid #2c3e50',
                borderRadius: '6px',
                color: '#e8e8e8',
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            {importError && (
              <div style={{ color: '#e74c3c', fontSize: '12px' }}>{importError}</div>
            )}
            {!importConfirm ? (
              <button
                onClick={() => {
                  if (!importCode.trim()) { setImportError('Paste a save code first'); return }
                  setImportConfirm(true)
                }}
                disabled={!importCode.trim()}
                style={{
                  padding: '10px',
                  backgroundColor: importCode.trim() ? '#e67e22' : '#2c3e50',
                  border: 'none',
                  color: importCode.trim() ? '#fff' : '#555',
                  borderRadius: '6px',
                  cursor: importCode.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                }}
              >
                Load Save
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ color: '#e67e22', fontSize: '12px', fontWeight: 'bold' }}>
                  This will overwrite your current progress. Are you sure?
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => { setImportConfirm(false) }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'transparent',
                      border: '1px solid #555',
                      color: '#888',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const { defaultPermanent } = await import('../store/permanentStore')
                        const decoded = await decodeSaveCode<PermanentState>(importCode.trim(), defaultPermanent)
                        await permanent.importState(decoded)
                        setShowImport(false)
                        setImportCode('')
                        setImportConfirm(false)
                        setImportError(null)
                      } catch (err) {
                        setImportError(err instanceof Error ? err.message : 'Invalid save code')
                        setImportConfirm(false)
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#e74c3c',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Confirm Import
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
