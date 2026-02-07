import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

/**
 * Simple in-memory rate limiter for write operations.
 * Tracks requests per nullifier_hash: max 10 write requests per minute.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function isRateLimited(identifier: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

/**
 * Periodically clean up expired rate limit entries to avoid unbounded memory growth.
 * Runs at most every 60 seconds when the middleware is invoked.
 */
let lastCleanup = 0

function cleanupRateLimitMap(): void {
  const now = Date.now()
  if (now - lastCleanup < RATE_LIMIT_WINDOW_MS) return
  lastCleanup = now

  for (const [key, entry] of rateLimitMap) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const method = request.method

  // 1. Allow the login endpoint without JWT
  if (pathname === '/api/auth/verify' && method === 'POST') {
    return NextResponse.next()
  }

  // 2. Allow all GET requests (read operations) without JWT
  if (method === 'GET') {
    return NextResponse.next()
  }

  // 3. For all other requests (POST/PUT/DELETE to /api/*), require JWT
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 4. Rate limiting on write operations
  cleanupRateLimitMap()

  if (isRateLimited(payload.nullifierHash)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 10 write requests per minute.' },
      { status: 429 }
    )
  }

  // 5. Add user identity headers and pass through
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-verification-level', payload.verificationLevel)
  requestHeaders.set('x-nullifier-hash', payload.nullifierHash)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: '/api/:path*',
}
