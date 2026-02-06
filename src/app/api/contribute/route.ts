import { NextResponse } from 'next/server'
import { getServiceSupabase, getSupabase } from '@/lib/supabase'

interface ContributeRequestBody {
  botId: string
  label: string
  content: string
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

    return NextResponse.json({ nodeId: node.id })
  } catch (err) {
    console.error('Contribution error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
