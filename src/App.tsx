import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import WorkshopScreen from './components/WorkshopScreen'
import RunScreen from './components/RunScreen'
import CompendiumScreen from './components/CompendiumScreen'
import StagingScreen from './components/StagingScreen'
import TestHarness from './components/test/TestHarness'
import { usePermanentStore } from './store/permanentStore'

function App() {
  const loadPermanent = usePermanentStore((s) => s.load)
  const savePermanent = usePermanentStore((s) => s.save)
  useEffect(() => {
    loadPermanent()
  }, [loadPermanent])

  useEffect(() => {
    const handler = () => {
      savePermanent()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [savePermanent])

  return (
    <Routes>
      <Route path="/" element={<WorkshopScreen />} />
      <Route path="/run" element={<RunScreen />} />
      <Route path="/compendium" element={<CompendiumScreen />} />
      <Route path="/staging" element={<StagingScreen />} />
      <Route path="/test" element={<TestHarness />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
