import { NextResponse } from 'next/server'
import { getServiceSupabase, getSupabase } from '@/lib/supabase'
import { verifyTransactionReceipt } from '@/lib/relayer'
import type { Hash } from 'viem'

interface ConfirmRequestBody {
  txHash: string
}

function isValidBody(body: unknown): body is ConfirmRequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return typeof b.txHash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(b.txHash)
}

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Extract user identity from middleware-injected headers
  const userId = request.headers.get('x-user-id')
  const verificationLevel = request.headers.get('x-verification-level')

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (verificationLevel !== 'orb') {
    return NextResponse.json(
      { error: 'Orb verification required for claim confirmation' },
      { status: 403 }
    )
  }

  // 2. Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: 'Invalid request: txHash must be a valid 0x-prefixed 32-byte hex string' },
      { status: 400 }
    )
  }

  const { txHash } = body

  // 3. Initialize Supabase client
  const supabase = getServiceSupabase() ?? getSupabase()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing database config' },
      { status: 500 }
    )
  }

  try {
    // 4. Verify the transaction on-chain
    const { confirmed, blockNumber } = await verifyTransactionReceipt(txHash as Hash)

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Transaction not confirmed or reverted on-chain' },
        { status: 400 }
      )
    }

    // 5. Reset pending_wld in Supabase now that we have on-chain confirmation
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('pending_wld')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const claimedAmount = Number(user.pending_wld)

    const { error: updateError } = await supabase
      .from('users')
      .update({ pending_wld: 0 })
      .eq('id', userId)

    if (updateError) {
      console.error('[CLAIM/CONFIRM] Failed to reset pending_wld:', updateError)
      return NextResponse.json(
        { error: 'Failed to update claim status' },
        { status: 500 }
      )
    }

    console.log(
      `[CLAIM/CONFIRM] User ${userId} claimed ${claimedAmount} WLD, ` +
      `tx: ${txHash}, block: ${blockNumber}`
    )

    return NextResponse.json({
      success: true,
      claimedAmount,
      txHash,
      blockNumber: blockNumber?.toString() ?? null,
    })
  } catch (err) {
    console.error('[CLAIM/CONFIRM] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
