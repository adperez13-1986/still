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

// ─── Save Share Codes ────────────────────────────────────────────────────────

const SAVE_CODE_VERSION = 'v1'

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (str.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function compress(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('deflate')
  const writer = cs.writable.getWriter()
  writer.write(data as Uint8Array)
  writer.close()
  const chunks: Uint8Array[] = []
  const reader = cs.readable.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) { result.set(c, offset); offset += c.length }
  return result
}

async function decompress(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate')
  const writer = ds.writable.getWriter()
  writer.write(data as Uint8Array)
  writer.close()
  const chunks: Uint8Array[] = []
  const reader = ds.readable.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) { result.set(c, offset); offset += c.length }
  return result
}

export async function encodeSaveCode<T>(state: T): Promise<string> {
  const json = JSON.stringify(state)
  const compressed = await compress(new TextEncoder().encode(json))
  return `${SAVE_CODE_VERSION}:${toBase64Url(compressed)}`
}

export async function decodeSaveCode<T>(code: string, defaults: T): Promise<T> {
  const colonIdx = code.indexOf(':')
  if (colonIdx === -1) throw new Error('Invalid save code format')

  const version = code.slice(0, colonIdx)
  if (version !== SAVE_CODE_VERSION) throw new Error(`Unsupported save code version: ${version}`)

  const payload = code.slice(colonIdx + 1)
  const compressed = fromBase64Url(payload)
  const decompressed = await decompress(compressed)
  const json = new TextDecoder().decode(decompressed)
  const parsed = JSON.parse(json)

  if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid save data')

  // Merge with defaults so missing fields get filled in
  return { ...defaults, ...parsed }
}
