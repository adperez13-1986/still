import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import WorkshopScreen from './components/WorkshopScreen'
import RunScreen from './components/RunScreen'
import FragmentScreen from './components/FragmentScreen'
import CompendiumScreen from './components/CompendiumScreen'
import StagingScreen from './components/StagingScreen'
import TestHarness from './components/test/TestHarness'
import { usePermanentStore } from './store/permanentStore'

function App() {
  const loadPermanent = usePermanentStore((s) => s.load)
  const savePermanent = usePermanentStore((s) => s.save)
  const tickFragments = usePermanentStore((s) => s.tickFragments)

  useEffect(() => {
    loadPermanent()
  }, [loadPermanent])

  // Tick fragments every 6 minutes while the tab is open (10/hour = 1 per 6 min)
  useEffect(() => {
    const id = setInterval(tickFragments, 6 * 60 * 1000)
    return () => clearInterval(id)
  }, [tickFragments])

  // Save permanent state on page unload.
  // Also write lastSeenTimestamp to localStorage synchronously — the async
  // IndexedDB write may not complete before the browser tears the page down,
  // but localStorage.setItem is synchronous and always lands.
  useEffect(() => {
    const handler = () => {
      localStorage.setItem('still-last-seen', String(Date.now()))
      savePermanent()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [savePermanent])

  return (
    <Routes>
      <Route path="/" element={<WorkshopScreen />} />
      <Route path="/fragment" element={<FragmentScreen />} />
      <Route path="/run" element={<RunScreen />} />
      <Route path="/compendium" element={<CompendiumScreen />} />
      <Route path="/staging" element={<StagingScreen />} />
      <Route path="/test" element={<TestHarness />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
