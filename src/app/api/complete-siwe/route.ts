import { NextResponse } from 'next/server'
import { getServiceSupabase, getSupabase } from '@/lib/supabase'
import { consumeNonce } from '@/lib/nonce-store'

interface SiweRequestBody {
  payload: {
    status: string
    message: string
    signature: string
    address: string
    version: number
  }
  nonce: string
}

function isValidBody(body: unknown): body is SiweRequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  if (typeof b.nonce !== 'string') return false
  if (!b.payload || typeof b.payload !== 'object') return false
  const p = b.payload as Record<string, unknown>
  return (
    p.status === 'success' &&
    typeof p.address === 'string' &&
    typeof p.signature === 'string' &&
    typeof p.message === 'string'
  )
}

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Get user identity from middleware
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Invalid SIWE payload' }, { status: 400 })
  }

  // 3. Validate nonce (one-time use)
  if (!consumeNonce(body.nonce)) {
    return NextResponse.json({ error: 'Invalid or expired nonce' }, { status: 400 })
  }

  // 4. Extract wallet address from the verified payload
  const walletAddress = body.payload.address.toLowerCase()

  // 5. Store wallet address in Supabase
  const supabase = getServiceSupabase() ?? getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const { error } = await supabase
    .from('users')
    .update({
      wallet_address: walletAddress,
      wallet_linked_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('[SIWE] Failed to store wallet address:', error)
    return NextResponse.json({ error: 'Failed to link wallet' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    walletAddress,
  })
}
