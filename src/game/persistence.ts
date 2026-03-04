import { openDB } from 'idb'

const DB_NAME = 'still-game'
const DB_VERSION = 1
const STORE_NAME = 'permanent'
const RUN_KEY = 'current-run'

// IndexedDB for permanent progression data
export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function savePermanent<T>(key: string, value: T): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, value, key)
}

export async function loadPermanent<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, key)
}

// localStorage for current run state (fast, ephemeral)
export function saveRunState<T>(state: T): void {
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — not fatal
  }
}

export function loadRunState<T>(): T | null {
  try {
    const raw = localStorage.getItem(RUN_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function clearRunState(): void {
  localStorage.removeItem(RUN_KEY)
}
