// Simple in-memory nonce store for SIWE wallet authentication.
// In production, replace with Redis or database-backed storage.

import { randomBytes } from 'crypto'

const NONCE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const store = new Map<string, number>()

let lastCleanup = 0

function cleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, expiry] of store) {
    if (now > expiry) store.delete(key)
  }
}

export function generateNonce(): string {
  cleanup()
  const nonce = randomBytes(16).toString('hex')
  store.set(nonce, Date.now() + NONCE_TTL_MS)
  return nonce
}

export function consumeNonce(nonce: string): boolean {
  cleanup()
  const expiry = store.get(nonce)
  if (!expiry || Date.now() > expiry) return false
  store.delete(nonce)
  return true
}
