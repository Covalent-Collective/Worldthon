import { NextResponse } from 'next/server'
import { getServiceSupabase, getSupabase } from '@/lib/supabase'
import { SEED_VAULT_ADDRESS } from '@/lib/contract'

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

  // 2. Require Orb verification for claims
  if (verificationLevel !== 'orb') {
    return NextResponse.json(
      { error: 'Orb verification required for claims' },
      { status: 403 }
    )
  }

  // 3. Initialize Supabase client
  const supabase = getServiceSupabase() ?? getSupabase()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing database config' },
      { status: 500 }
    )
  }

  try {
    // 4. Get user and verify pending_wld > 0
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

    const amount = Number(user.pending_wld)

    if (amount <= 0) {
      return NextResponse.json({ amount: 0 })
    }

    // 5. Return the claimable amount and contract address so the client can
    //    send the on-chain claim transaction via MiniKit.sendTransaction.
    //    The client must then call POST /api/claim/confirm with the txHash
    //    to finalize the claim (reset pending_wld in Supabase).
    return NextResponse.json({
      amount,
      contractAddress: SEED_VAULT_ADDRESS,
      action: 'claimReward',
      message: 'Send the claimReward transaction via MiniKit, then POST /api/claim/confirm with the txHash.',
    })
  } catch (err) {
    console.error('Claim error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
