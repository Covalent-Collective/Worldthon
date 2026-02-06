import { getSupabase, isSupabaseConfigured } from './supabase'
import type { ExpertBot, KnowledgeNode, KnowledgeEdge } from './types'

// Helper to get supabase client with null check
const getClient = () => {
  const client = getSupabase()
  if (!client) {
    throw new Error('Supabase not configured')
  }
  return client
}

// Helper to read JWT token from persisted zustand store in localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('seed-vault-user')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed?.state?.token || null
  } catch {
    return null
  }
}

// ==========================================
// Bot 관련 API
// ==========================================

export async function getAllBots(): Promise<ExpertBot[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }

  const { data: bots, error } = await getClient()
    .from('bots')
    .select('*')
    .eq('is_active', true)

  if (error) throw error
  if (!bots) return []

  // 각 봇의 그래프 데이터 가져오기
  const botsWithGraphs = await Promise.all(
    bots.map(async (bot) => {
      const graph = await getBotGraph(bot.id)

      // contributor 수 계산
      const uniqueContributors = new Set(
        graph.nodes.map(n => n.contributor)
      ).size

      return {
        id: bot.id,
        name: bot.name,
        description: bot.description,
        icon: bot.icon,
        profileImage: (bot as Record<string, unknown>).profile_image as string || undefined,
        category: bot.category,
        nodeCount: graph.nodes.length,
        contributorCount: uniqueContributors,
        graph
      }
    })
  )

  return botsWithGraphs
}

export async function getBotById(botId: string): Promise<ExpertBot | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }

  const { data: bot, error } = await getClient()
    .from('bots')
    .select('*')
    .eq('id', botId)
    .eq('is_active', true)
    .single()

  if (error || !bot) return null

  const graph = await getBotGraph(botId)

  const uniqueContributors = new Set(
    graph.nodes.map(n => n.contributor)
  ).size

  return {
    id: bot.id,
    name: bot.name,
    description: bot.description,
    icon: bot.icon,
    profileImage: (bot as Record<string, unknown>).profile_image as string || undefined,
    category: bot.category,
    nodeCount: graph.nodes.length,
    contributorCount: uniqueContributors,
    graph
  }
}

export async function getBotGraph(botId: string): Promise<{
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}> {
  // 노드 가져오기 (contributor 정보 포함)
  const { data: nodes, error: nodesError } = await getClient()
    .from('knowledge_nodes')
    .select(`
      *,
      users:contributor_id (nullifier_hash)
    `)
    .eq('bot_id', botId)
    .order('created_at', { ascending: true })

  if (nodesError) throw nodesError

  // 해당 봇의 노드 ID들
  const nodeIds = nodes?.map(n => n.id) || []

  if (nodeIds.length === 0) {
    return { nodes: [], edges: [] }
  }

  // 엣지 가져오기
  const { data: edges, error: edgesError } = await getClient()
    .from('node_edges')
    .select('*')
    .in('source_node_id', nodeIds)

  if (edgesError) throw edgesError

  return {
    nodes: (nodes || []).map(n => {
      // nullifier_hash에서 익명화된 표시명 생성
      const userHash = (n.users as { nullifier_hash: string } | null)?.nullifier_hash || ''
      const displayName = userHash
        ? `${userHash.slice(0, 6)}...anon`
        : '0xanon...anon'

      return {
        id: n.id,
        label: n.label,
        content: n.content,
        contributor: displayName,
        createdAt: n.created_at.split('T')[0],
        citationCount: n.citation_count
      }
    }),
    edges: (edges || []).map(e => ({
      source: e.source_node_id,
      target: e.target_node_id,
      relationship: e.relationship
    }))
  }
}

// ==========================================
// 사용자 관련 API
// ==========================================

export async function getOrCreateUser(nullifierHash: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }

  // 기존 사용자 찾기
  const { data: existing } = await getClient()
    .from('users')
    .select('*')
    .eq('nullifier_hash', nullifierHash)
    .single()

  if (existing) return existing

  // 새 사용자 생성
  const { data: newUser, error } = await getClient()
    .from('users')
    .insert({ nullifier_hash: nullifierHash })
    .select()
    .single()

  if (error) throw error
  return newUser
}

export async function getUserRewards(userId: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }

  const { data: user, error } = await getClient()
    .from('users')
    .select('contribution_power, total_citations, pending_wld')
    .eq('id', userId)
    .single()

  if (error) throw error
  return user
}

export async function getUserContributions(userId: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await getClient()
    .from('contributions')
    .select(`
      *,
      knowledge_nodes (label, citation_count),
      bots (name, icon)
    `)
    .eq('user_id', userId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ==========================================
// 기여 관련 API
// ==========================================

export async function addContribution(
  botId: string,
  userId: string,
  label: string,
  content: string
): Promise<string> {
  const token = getToken()
  if (!token) throw new Error('Authentication required')

  const response = await fetch('/api/contribute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ botId, label, content })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to contribute')
  }

  const data = await response.json()
  return data.nodeId
}

// ==========================================
// 인용 관련 API
// ==========================================

export async function recordCitations(
  nodeIds: string[],
  sessionId: string,
  context: string | null
) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping citation recording')
    return
  }

  try {
    // 1. 배치로 citations 테이블에 INSERT
    const citations = nodeIds.map(nodeId => ({
      node_id: nodeId,
      session_id: sessionId,
      context
    }))

    const { error: insertError } = await getClient()
      .from('citations')
      .insert(citations)

    if (insertError) {
      console.error('Failed to insert citations:', insertError)
    }

    // 2. RPC로 원자적 카운트 증가 (병렬 실행)
    const rpcResults = await Promise.allSettled(
      nodeIds.map(nodeId =>
        getClient().rpc('increment_citation_count', { node_id: nodeId })
      )
    )

    // 3. RPC 실패 건 로깅
    rpcResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to increment citation for node ${nodeIds[index]}:`, result.reason)
      } else if (result.value?.error) {
        console.error(`RPC error for node ${nodeIds[index]}:`, result.value.error)
      }
    })

    // 4. 기여자 보상 원자적 업데이트 - RPC로 race condition 방지
    const { data: nodes } = await getClient()
      .from('knowledge_nodes')
      .select('contributor_id')
      .in('id', nodeIds)

    if (nodes) {
      const contributorIds = [...new Set(nodes.map(n => n.contributor_id).filter(Boolean))]

      const rewardResults = await Promise.allSettled(
        contributorIds.map((contributorId) => {
          const citationCount = nodes.filter(n => n.contributor_id === contributorId).length
          return getClient().rpc('increment_contributor_rewards', {
            p_contributor_id: contributorId,
            p_citation_count: citationCount
          })
        })
      )

      // RPC 실패 건 로깅
      rewardResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to update rewards for contributor ${contributorIds[index]}:`, result.reason)
        } else if (result.value?.error) {
          console.error(`RPC error for contributor ${contributorIds[index]}:`, result.value.error)
        }
      })
    }
  } catch (err) {
    console.error('Failed to record citations:', err)
  }
}

// ==========================================
// 보상 관련 API
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function claimRewards(_userId: string, _nullifierHash: string): Promise<number> {
  const token = getToken()
  if (!token) throw new Error('Authentication required')

  const response = await fetch('/api/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to claim rewards')
  }

  const data = await response.json()
  return data.amount
}

// ==========================================
// 통계 관련 API
// ==========================================

export async function getGlobalStats() {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    const client = getClient()
    const [nodesResult, botsResult] = await Promise.all([
      client
        .from('knowledge_nodes')
        .select('id, contributor_id', { count: 'exact' }),
      client
        .from('bots')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
    ])

    // 고유 기여자 수 계산
    const uniqueContributors = new Set(
      nodesResult.data?.map(n => n.contributor_id).filter(Boolean)
    ).size

    return {
      total_nodes: nodesResult.count || 0,
      total_contributors: uniqueContributors,
      total_bots: botsResult.count || 0
    }
  } catch (err) {
    console.error('Failed to get global stats:', err)
    return null
  }
}

// ==========================================
// Realtime 구독
// ==========================================

export function subscribeToNodeUpdates(
  botId: string,
  callback: (node: KnowledgeNode) => void
) {
  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {} }
  }

  const client = getClient()
  const channel = client
    .channel(`nodes:${botId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'knowledge_nodes',
        filter: `bot_id=eq.${botId}`
      },
      async (payload) => {
        const n = payload.new as {
          id: string
          label: string
          content: string
          contributor_id: string
          created_at: string
          citation_count: number
        }

        // contributor 정보 가져오기
        let displayName = '0xanon...anon'
        if (n.contributor_id) {
          const { data: user } = await getClient()
            .from('users')
            .select('nullifier_hash')
            .eq('id', n.contributor_id)
            .single()

          if (user?.nullifier_hash) {
            displayName = `${user.nullifier_hash.slice(0, 6)}...anon`
          }
        }

        callback({
          id: n.id,
          label: n.label,
          content: n.content,
          contributor: displayName,
          createdAt: n.created_at.split('T')[0],
          citationCount: n.citation_count
        })
      }
    )
    .subscribe()

  return {
    unsubscribe: () => {
      client.removeChannel(channel)
    }
  }
}

export function subscribeToGlobalStats(
  callback: (stats: { total_nodes: number; total_contributors: number; total_bots: number }) => void
) {
  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {} }
  }

  // 10초마다 글로벌 통계 폴링
  const interval = setInterval(async () => {
    const stats = await getGlobalStats()
    if (stats) callback(stats)
  }, 10000)

  // 초기 로드
  getGlobalStats().then(stats => {
    if (stats) callback(stats)
  })

  return { unsubscribe: () => clearInterval(interval) }
}
