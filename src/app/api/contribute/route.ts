import { NextResponse } from 'next/server'
import { getServiceSupabase, getSupabase } from '@/lib/supabase'
import { isRelayerConfigured, relayRecordContribution, hashContent } from '@/lib/relayer'
import type { Address } from 'viem'

const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000'

interface ContributeRequestBody {
  botId: string
  label: string
  content: string
  /** Optional World ID proof fields for on-chain verification */
  merkleRoot?: string
  proof?: string[]
}

function isValidBody(body: unknown): body is ContributeRequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.botId === 'string' &&
    typeof b.label === 'string' &&
    b.label.toString().trim().length > 0 &&
    typeof b.content === 'string' &&
    b.content.toString().length >= 20
  )
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

  // 2. Require Orb verification for contributions
  if (verificationLevel !== 'orb') {
    return NextResponse.json(
      { error: 'Orb verification required for contributions' },
      { status: 403 }
    )
  }

  // 3. Parse and validate request body
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
      { error: 'Invalid request: botId and label are required, content must be at least 20 characters' },
      { status: 400 }
    )
  }

  const { botId, label, content } = body

  // 4. Initialize Supabase client (서비스 키 우선, fallback으로 anon 키)
  const supabase = getServiceSupabase() ?? getSupabase()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing database config' },
      { status: 500 }
    )
  }

  try {
    // 5. Create knowledge node
    const { data: node, error: nodeError } = await supabase
      .from('knowledge_nodes')
      .insert({
        bot_id: botId,
        contributor_id: userId,
        label,
        content
      })
      .select()
      .single()

    if (nodeError || !node) {
      console.error('Failed to create node:', nodeError)
      return NextResponse.json(
        { error: 'Failed to create knowledge node' },
        { status: 500 }
      )
    }

    // 6. Record contribution with pending status
    const { error: contribError } = await supabase
      .from('contributions')
      .insert({
        user_id: userId,
        bot_id: botId,
        node_id: node.id,
        status: 'pending'
      })

    if (contribError) {
      console.error('Failed to record contribution:', contribError)
      // Non-fatal: node was created, log but continue
    }

    // 7. Update user contribution_power
    const { data: user } = await supabase
      .from('users')
      .select('contribution_power')
      .eq('id', userId)
      .single()

    if (user) {
      const newPower = Math.min((user.contribution_power || 0) + 5, 100)
      await supabase
        .from('users')
        .update({ contribution_power: newPower })
        .eq('id', userId)
    }

    // 8. Relay to smart contract (graceful degradation: failure is non-fatal)
    let txHash: string | null = null

    if (isRelayerConfigured()) {
      try {
        const contentHash = hashContent(content)
        const nullifierHash = request.headers.get('x-nullifier-hash') || ''

        // Convert string botId to a numeric value for the contract
        const botIdNumeric = /^\d+$/.test(botId)
          ? Number(botId)
          : parseInt(
              Array.from(new TextEncoder().encode(botId))
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('')
                .slice(0, 8),
              16
            )

        // Use proof data from request body if provided, otherwise use placeholders.
        // Real World ID verification was already done server-side via /api/auth/verify.
        // The on-chain contract may have proof verification disabled for relayer pattern.
        const proofBigInts: bigint[] = body.proof?.length === 8
          ? body.proof.map((p: string) => BigInt(p))
          : Array(8).fill(BigInt(0))

        const hash = await relayRecordContribution({
          contentHash,
          botId: botIdNumeric,
          signal: ZERO_ADDRESS,
          root: body.merkleRoot ? BigInt(body.merkleRoot) : BigInt(0),
          nullifierHash: nullifierHash ? BigInt(nullifierHash) : BigInt(0),
          proof: proofBigInts,
        })

        txHash = hash

        // Store tx_hash on the contribution record if available
        if (txHash) {
          await supabase
            .from('contributions')
            .update({ tx_hash: txHash })
            .eq('node_id', node.id)
            .eq('user_id', userId)
        }
      } catch (relayError) {
        // Non-fatal: log and continue. The Supabase record is the source of truth.
        console.error('[CONTRIBUTE] Relayer submission failed (non-fatal):', relayError)
      }
    }

    return NextResponse.json({
      nodeId: node.id,
      ...(txHash ? { txHash } : {}),
    })
  } catch (err) {
    console.error('Contribution error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
