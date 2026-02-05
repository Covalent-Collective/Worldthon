import * as api from './api'
import { isSupabaseConfigured } from './supabase'
import type { ExpertBot, KnowledgeNode, KnowledgeEdge, ContributionReceipt } from './types'

// ==========================================
// Supabase 연동 API (async 버전)
// Supabase 연결 시 실제 DB에서 데이터 조회
// 미연결 시 아래 Mock 데이터 사용
// ==========================================

/**
 * 모든 봇 목록 조회 (Supabase 연동)
 * Supabase 미연결 시 Mock 데이터 반환
 */
export async function fetchAllBots(): Promise<ExpertBot[]> {
  if (isSupabaseConfigured()) {
    try {
      return await api.getAllBots()
    } catch (error) {
      console.error('Failed to fetch bots from Supabase:', error)
    }
  }
  return baseExpertBots
}

/**
 * 특정 봇 조회 (Supabase 연동)
 * Supabase 미연결 시 Mock 데이터 반환
 */
export async function fetchBotById(id: string): Promise<ExpertBot | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const bot = await api.getBotById(id)
      return bot || undefined
    } catch (error) {
      console.error('Failed to fetch bot from Supabase:', error)
    }
  }
  return baseExpertBots.find(bot => bot.id === id)
}

/**
 * 인용 기록 (Supabase 연동)
 */
export async function recordCitationsForAnswer(
  nodeIds: string[],
  sessionId: string,
  question: string
): Promise<void> {
  if (isSupabaseConfigured() && nodeIds.length > 0) {
    try {
      await api.recordCitations(nodeIds, sessionId, question)
    } catch (error) {
      console.error('Failed to record citations:', error)
    }
  }
}

// ==========================================
// Fallback Mock Data (Supabase 미연결 시 사용)
// ==========================================

// Base mock data - the starting point before user contributions
const baseExpertBots: ExpertBot[] = [
  {
    id: 'worldcoin-expert',
    name: 'World Coin 전문가',
    description: 'World ID, WLD 토큰, Orb 인증에 대한 모든 것',
    icon: '🌐',
    category: 'Web3',
    nodeCount: 18,
    contributorCount: 7,
    graph: {
      nodes: [
        {
          id: 'wld-1',
          label: 'World ID란?',
          content: 'World ID는 "Proof of Personhood" 프로토콜입니다. Orb라는 생체 인식 장치로 홍채를 스캔하여 각 개인이 고유한 인간임을 증명합니다. 프라이버시를 보호하면서 Sybil 공격을 방지합니다.',
          contributor: '0xwld1...anon',
          createdAt: '2025-11-01',
          citationCount: 892
        },
        {
          id: 'wld-2',
          label: 'Orb 인증 과정',
          content: 'Orb 인증은 약 30초 소요됩니다. 1) World App 설치 2) Orb 운영 장소 방문 3) 홍채 스캔 4) World ID 발급. 한국에는 서울, 부산 등에 Orb 운영 장소가 있습니다.',
          contributor: '0xwld2...anon',
          createdAt: '2025-11-05',
          citationCount: 567
        },
        {
          id: 'wld-3',
          label: 'WLD 토큰 유틸리티',
          content: 'WLD는 Worldcoin 생태계의 거버넌스 토큰입니다. World App 내 결제, 거버넌스 투표, 개발자 인센티브 등에 사용됩니다. Orb 인증 완료 시 WLD 그랜트를 받을 수 있습니다.',
          contributor: '0xwld3...anon',
          createdAt: '2025-11-10',
          citationCount: 423
        },
        {
          id: 'wld-4',
          label: 'World App 기능',
          content: 'World App은 World ID 지갑이자 슈퍼앱입니다. WLD/USDC 전송, World ID로 로그인, Mini Apps 사용, P2P 결제가 가능합니다. 한국에서는 카카오페이처럼 일상 결제에 활용 가능합니다.',
          contributor: '0xwld4...anon',
          createdAt: '2025-11-15',
          citationCount: 345
        },
        {
          id: 'wld-5',
          label: 'Mini Apps 개발',
          content: 'World App Mini Apps는 World ID 인증이 내장된 웹앱입니다. MiniKit SDK를 사용해 개발합니다. verifyAction으로 사용자 인증, pay로 WLD 결제를 구현할 수 있습니다.',
          contributor: '0xwld5...anon',
          createdAt: '2025-12-01',
          citationCount: 234
        },
        {
          id: 'wld-6',
          label: 'IDKit vs MiniKit',
          content: 'IDKit은 일반 웹사이트용, MiniKit은 World App 내 Mini Apps용입니다. MiniKit은 지갑 연결 없이 바로 인증 가능하고, 인앱 결제를 지원합니다. 새 프로젝트는 MiniKit 권장.',
          contributor: '0xwld6...anon',
          createdAt: '2025-12-10',
          citationCount: 189
        }
      ],
      edges: [
        { source: 'wld-1', target: 'wld-2', relationship: '인증 방법' },
        { source: 'wld-2', target: 'wld-3', relationship: '보상' },
        { source: 'wld-3', target: 'wld-4', relationship: '사용처' },
        { source: 'wld-4', target: 'wld-5', relationship: '개발' },
        { source: 'wld-5', target: 'wld-6', relationship: 'SDK 선택' },
        { source: 'wld-1', target: 'wld-6', relationship: '통합 방법' }
      ]
    }
  },
  {
    id: 'seoul-local-guide',
    name: '서울 로컬 가이드',
    description: '서울의 숨은 명소와 맛집을 알려드립니다',
    icon: '🗺️',
    category: '여행',
    nodeCount: 24,
    contributorCount: 12,
    graph: {
      nodes: [
        {
          id: 'node-1',
          label: '을지로 골목 맛집',
          content: '을지로 3가역 근처 노가리 골목은 퇴근 후 직장인들의 성지입니다. 특히 "을지OB베어"는 40년 전통의 노가리집으로 유명합니다.',
          contributor: '0x1a2b...anon',
          createdAt: '2025-12-15',
          citationCount: 156
        },
        {
          id: 'node-2',
          label: '익선동 한옥 카페',
          content: '익선동 한옥마을은 100년된 한옥들이 카페와 레스토랑으로 변신한 곳입니다. "열두달"은 계절별 디저트가 인기입니다.',
          contributor: '0x3c4d...anon',
          createdAt: '2025-12-20',
          citationCount: 89
        },
        {
          id: 'node-3',
          label: '성수동 카페거리',
          content: '성수동은 폐공장들이 힙한 카페로 변신한 곳입니다. "대림창고"와 "어니언" 카페가 대표적입니다.',
          contributor: '0x5e6f...anon',
          createdAt: '2026-01-05',
          citationCount: 203
        },
        {
          id: 'node-4',
          label: '망원동 로컬 마켓',
          content: '망원시장은 젊은 감성의 로컬 마켓입니다. 망원역 2번 출구에서 도보 5분, 떡볶이와 순대가 유명합니다.',
          contributor: '0x7g8h...anon',
          createdAt: '2026-01-10',
          citationCount: 67
        },
        {
          id: 'node-5',
          label: '연남동 경의선숲길',
          content: '경의선 폐철로가 공원으로 변신한 경의선숲길. 연남동 구간은 카페와 맛집이 밀집해 있어 산책하기 좋습니다.',
          contributor: '0x9i0j...anon',
          createdAt: '2026-01-15',
          citationCount: 145
        }
      ],
      edges: [
        { source: 'node-1', target: 'node-2', relationship: '도보 15분' },
        { source: 'node-2', target: 'node-3', relationship: '지하철 20분' },
        { source: 'node-3', target: 'node-4', relationship: '버스 25분' },
        { source: 'node-4', target: 'node-5', relationship: '도보 10분' },
        { source: 'node-1', target: 'node-5', relationship: '지하철 15분' }
      ]
    }
  },
  {
    id: 'obgyn-specialist',
    name: '산부인과 전문의',
    description: '임신, 출산, 여성 건강에 대한 전문 지식',
    icon: '👩‍⚕️',
    category: '의료',
    nodeCount: 45,
    contributorCount: 8,
    graph: {
      nodes: [
        {
          id: 'med-1',
          label: '임신 초기 증상',
          content: '임신 초기(4-8주)에는 입덧, 피로감, 유방 통증 등이 나타날 수 있습니다. 생리 예정일이 지났다면 임신 테스트를 권장합니다.',
          contributor: '0xmed1...anon',
          createdAt: '2025-11-20',
          citationCount: 892
        },
        {
          id: 'med-2',
          label: '산전 검사 일정',
          content: '임신 확인 후 첫 산전검사는 8-12주에 시행합니다. 기형아 검사(15-20주), 정밀초음파(20-24주) 등을 계획합니다.',
          contributor: '0xmed2...anon',
          createdAt: '2025-11-25',
          citationCount: 567
        },
        {
          id: 'med-3',
          label: '출산 준비물',
          content: '출산 2주 전부터 입원 가방을 준비하세요. 산모수첩, 속옷, 수유패드, 산후대, 신생아 옷 등이 필요합니다.',
          contributor: '0xmed3...anon',
          createdAt: '2025-12-01',
          citationCount: 423
        }
      ],
      edges: [
        { source: 'med-1', target: 'med-2', relationship: '다음 단계' },
        { source: 'med-2', target: 'med-3', relationship: '준비사항' }
      ]
    }
  },
  {
    id: 'korean-recipes',
    name: '한식 레시피 마스터',
    description: '전통 한식부터 현대적 퓨전까지',
    icon: '🍲',
    category: '요리',
    nodeCount: 67,
    contributorCount: 23,
    graph: {
      nodes: [
        {
          id: 'recipe-1',
          label: '김치찌개 황금레시피',
          content: '묵은지 200g, 돼지고기 150g, 두부 반모. 돼지고기를 먼저 볶다가 김치를 넣고 5분 볶은 후 물 500ml를 넣고 끓입니다.',
          contributor: '0xchef1...anon',
          createdAt: '2025-10-15',
          citationCount: 1234
        },
        {
          id: 'recipe-2',
          label: '된장찌개 기본',
          content: '된장 2큰술, 애호박, 두부, 양파, 청양고추. 멸치육수에 된장을 풀고 채소를 넣어 10분 끓입니다.',
          contributor: '0xchef2...anon',
          createdAt: '2025-10-20',
          citationCount: 987
        }
      ],
      edges: [
        { source: 'recipe-1', target: 'recipe-2', relationship: '함께 먹으면 좋은' }
      ]
    }
  },
  {
    id: 'startup-mentor',
    name: '스타트업 멘토',
    description: '창업, 투자, 스케일업 경험 공유',
    icon: '🚀',
    category: '비즈니스',
    nodeCount: 38,
    contributorCount: 15,
    graph: {
      nodes: [
        {
          id: 'startup-1',
          label: 'MVP 개발 전략',
          content: '첫 MVP는 3개월 안에 출시하세요. 핵심 기능 하나에 집중하고, 사용자 피드백으로 방향을 잡습니다.',
          contributor: '0xfounder1...anon',
          createdAt: '2025-09-10',
          citationCount: 456
        },
        {
          id: 'startup-2',
          label: '시드 투자 유치',
          content: '시드 라운드는 보통 5-10억 규모입니다. 팀, 시장, 트랙션 세 가지를 명확히 보여주세요.',
          contributor: '0xfounder2...anon',
          createdAt: '2025-09-15',
          citationCount: 321
        }
      ],
      edges: [
        { source: 'startup-1', target: 'startup-2', relationship: '다음 단계' }
      ]
    }
  }
]

// Export the base bots for listing purposes
export const expertBots = baseExpertBots

// Get a bot with merged user contributions
// This function requires the contributed nodes/edges to be passed in
// to avoid importing zustand store directly (which would cause hydration issues)
export const getBotById = (id: string): ExpertBot | undefined => {
  return baseExpertBots.find(bot => bot.id === id)
}

// Get a bot merged with user contributions
export const getBotWithContributions = (
  id: string,
  contributedNodes: KnowledgeNode[],
  contributedEdges: KnowledgeEdge[] = []
): ExpertBot | undefined => {
  const baseBot = baseExpertBots.find(bot => bot.id === id)
  if (!baseBot) return undefined

  // Merge base nodes with contributed nodes
  const mergedNodes = [...baseBot.graph.nodes, ...contributedNodes]
  const mergedEdges = [...baseBot.graph.edges, ...contributedEdges]

  // Auto-create edges from new nodes to existing nodes if none provided
  // Connect new nodes to a random existing node for visual continuity
  const autoEdges: KnowledgeEdge[] = []
  if (contributedEdges.length === 0 && contributedNodes.length > 0) {
    contributedNodes.forEach((newNode, idx) => {
      // Connect to a random base node or the previous contributed node
      const existingNodes = [...baseBot.graph.nodes, ...contributedNodes.slice(0, idx)]
      if (existingNodes.length > 0) {
        const targetNode = existingNodes[Math.floor(Math.random() * existingNodes.length)]
        autoEdges.push({
          source: newNode.id,
          target: targetNode.id,
          relationship: '관련'
        })
      }
    })
  }

  return {
    ...baseBot,
    nodeCount: mergedNodes.length,
    graph: {
      nodes: mergedNodes,
      edges: [...mergedEdges, ...autoEdges]
    }
  }
}

// Get the count of base nodes for a bot
export const getBaseNodeCount = (id: string): number => {
  const bot = baseExpertBots.find(b => b.id === id)
  return bot?.graph.nodes.length || 0
}

export const calculateContribution = (
  usedNodeIds: string[],
  nodes: KnowledgeNode[]
): ContributionReceipt[] => {
  const total = usedNodeIds.length
  return usedNodeIds.map(id => ({
    nodeId: id,
    contributor: nodes.find(n => n.id === id)?.contributor || 'unknown',
    percentage: Math.round(100 / total)
  }))
}

// Tokenize text for Korean + English
function tokenize(text: string): string[] {
  const normalized = text.toLowerCase()

  // Split on whitespace and punctuation, keep Korean characters together
  const tokens: string[] = []

  // Match Korean word sequences or English word sequences
  const koreanPattern = /[\uAC00-\uD7AF]+/g
  const englishPattern = /[a-z0-9]+/g

  const koreanMatches = normalized.match(koreanPattern) || []
  const englishMatches = normalized.match(englishPattern) || []

  tokens.push(...koreanMatches, ...englishMatches)

  // Also extract Korean syllable bigrams for partial matching
  // This helps match "을지로" when user types "을지"
  koreanMatches.forEach(word => {
    if (word.length >= 2) {
      for (let i = 0; i < word.length - 1; i++) {
        tokens.push(word.slice(i, i + 2))
      }
    }
  })

  return tokens.filter(t => t.length >= 2)
}

// Calculate document frequency for IDF
function calculateIDF(term: string, documents: string[][]): number {
  const docsWithTerm = documents.filter(doc => doc.includes(term)).length
  if (docsWithTerm === 0) return 0
  return Math.log(documents.length / docsWithTerm) + 1
}

// Score a node based on query relevance
function calculateRelevance(
  questionTokens: string[],
  node: KnowledgeNode,
  allNodeTokens: string[][]
): number {
  const labelTokens = tokenize(node.label)
  const contentTokens = tokenize(node.content)

  let score = 0
  const matchedTerms = new Set<string>()

  for (const queryToken of questionTokens) {
    // Label matches (3x weight) - more important
    const labelMatch = labelTokens.some(lt =>
      lt.includes(queryToken) || queryToken.includes(lt)
    )
    if (labelMatch) {
      const idf = calculateIDF(queryToken, allNodeTokens)
      score += 3 * idf
      matchedTerms.add(queryToken)
    }

    // Content matches (1x weight)
    const contentMatch = contentTokens.some(ct =>
      ct.includes(queryToken) || queryToken.includes(ct)
    )
    if (contentMatch && !labelMatch) {
      const idf = calculateIDF(queryToken, allNodeTokens)
      score += 1 * idf
      matchedTerms.add(queryToken)
    }
  }

  // Citation count bonus (trust signal, normalized)
  // log scale to prevent citation count from dominating
  if (score > 0) {
    const citationBonus = Math.log(node.citationCount + 1) * 0.1
    score += citationBonus
  }

  // Coverage bonus: reward matching more query terms
  const coverage = matchedTerms.size / questionTokens.length
  score *= (1 + coverage * 0.5)

  return score
}

export interface AnswerResult {
  answer: string
  usedNodes: string[]
  confidence: number // 0-100
  matchedTerms: string[]
}

export const generateMockAnswer = (question: string, bot: ExpertBot): AnswerResult => {
  const questionTokens = tokenize(question)
  const nodes = bot.graph.nodes

  // Pre-tokenize all nodes for IDF calculation
  const allNodeTokens = nodes.map(n => [
    ...tokenize(n.label),
    ...tokenize(n.content)
  ])

  // Score all nodes
  const scoredNodes = nodes.map((node) => ({
    node,
    score: calculateRelevance(questionTokens, node, allNodeTokens),
    matchedTerms: getMatchedTerms(questionTokens, node)
  }))

  // Sort by score descending
  scoredNodes.sort((a, b) => b.score - a.score)

  // Filter to nodes with positive scores
  const relevantNodes = scoredNodes.filter(sn => sn.score > 0)

  // Calculate confidence based on top score and coverage
  const maxPossibleScore = questionTokens.length * 3 * 2 // rough estimate
  const topScore = relevantNodes[0]?.score || 0
  const confidence = Math.min(100, Math.round((topScore / Math.max(maxPossibleScore, 1)) * 100 * 2))

  // Collect all matched terms
  const allMatchedTerms = Array.from(new Set(relevantNodes.flatMap(rn => rn.matchedTerms)))

  if (relevantNodes.length === 0) {
    // No matches found - provide helpful fallback
    return {
      answer: `죄송합니다. "${question}"에 대한 관련 정보를 찾지 못했습니다.\n\n이 봇에서 다룰 수 있는 주제: ${nodes.map(n => n.label).join(', ')}`,
      usedNodes: [],
      confidence: 0,
      matchedTerms: []
    }
  }

  // Take top 3 relevant nodes
  const usedNodes = relevantNodes.slice(0, 3).map(rn => rn.node)

  // Format answer with relevance indication
  const answerParts = usedNodes.map((node, idx) => {
    const relevanceLabel = idx === 0 ? '[가장 관련성 높음]' : ''
    return `${relevanceLabel}\n${node.content}`
  })

  return {
    answer: answerParts.join('\n\n').trim(),
    usedNodes: usedNodes.map(n => n.id),
    confidence,
    matchedTerms: allMatchedTerms
  }
}

// Helper to get matched terms for display
function getMatchedTerms(questionTokens: string[], node: KnowledgeNode): string[] {
  const labelTokens = tokenize(node.label)
  const contentTokens = tokenize(node.content)
  const nodeTokens = [...labelTokens, ...contentTokens]

  return questionTokens.filter(qt =>
    nodeTokens.some(nt => nt.includes(qt) || qt.includes(nt))
  )
}
