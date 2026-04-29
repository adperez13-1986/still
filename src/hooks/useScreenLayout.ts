import { useSyncExternalStore } from 'react'

const query = '(orientation: portrait) and (max-width: 600px)'

function subscribe(cb: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}

function getSnapshot(): 'portrait' | 'landscape' {
  return window.matchMedia(query).matches ? 'portrait' : 'landscape'
}

export default function useScreenLayout(): 'portrait' | 'landscape' {
  return useSyncExternalStore(subscribe, getSnapshot)
}
