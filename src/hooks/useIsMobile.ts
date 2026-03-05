import { useSyncExternalStore } from 'react'

const query = '(max-width: 600px)'

function subscribe(cb: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}

function getSnapshot() {
  return window.matchMedia(query).matches
}

export default function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
