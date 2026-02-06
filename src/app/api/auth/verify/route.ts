import { NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'
import { getServiceSupabase, getSupabase } from '@/lib/supabase'
import type { VerificationLevel } from '@/lib/auth'

interface VerifyRequestBody {
  proof: string
  merkle_root: string
  nullifier_hash: string
  verification_level: VerificationLevel
}

function isValidBody(body: unknown): body is VerifyRequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.proof === 'string' &&
    typeof b.merkle_root === 'string' &&
    typeof b.nullifier_hash === 'string' &&
    (b.verification_level === 'orb' || b.verification_level === 'device')
  )
}

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Parse and validate request body
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
      { error: 'Missing required fields: proof, merkle_root, nullifier_hash, verification_level' },
      { status: 400 }
    )
  }

  const { proof, merkle_root, nullifier_hash, verification_level } = body

  // 2. Check for mock auth in development mode (서버 전용, 프로덕션 차단)
  const allowMockAuth =
    process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_MOCK_AUTH === 'true'
  const isMockProof = proof.startsWith('mock_proof_')

  if (!allowMockAuth || !isMockProof) {
    // 3. Real World ID proof verification
    const appId = process.env.NEXT_PUBLIC_APP_ID
    const actionId = process.env.NEXT_PUBLIC_ACTION_ID || 'contribute'

    if (!appId) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing app ID' },
        { status: 500 }
      )
    }

    try {
      const verifyResponse = await fetch(
        `https://developer.worldcoin.org/api/v2/verify/${appId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merkle_root,
            nullifier_hash,
            proof,
            action: actionId,
            signal: '',
          }),
        }
      )

      if (!verifyResponse.ok) {
        return NextResponse.json(
          { error: 'Verification failed' },
          { status: 401 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Verification service unavailable' },
        { status: 502 }
      )
    }
  }

  // 4. Create or get user in Supabase (서비스 키 우선, fallback으로 anon 키)
  const supabase = getServiceSupabase() ?? getSupabase()

  if (!supabase) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing database config' },
      { status: 500 }
    )
  }

  let userId: string

  try {
    // Check for existing user
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('nullifier_hash', nullifier_hash)
      .single()

    if (existingUser && !selectError) {
      userId = existingUser.id
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ nullifier_hash })
        .select('id')
        .single()

      if (insertError || !newUser) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        )
      }

      userId = newUser.id
    }
  } catch {
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }

  // 5. Generate JWT
  const token = await generateToken({
    userId,
    nullifierHash: nullifier_hash,
    verificationLevel: verification_level,
  })

  // 6. Return token and user info
  return NextResponse.json({
    token,
    userId,
    verificationLevel: verification_level,
  })
}
