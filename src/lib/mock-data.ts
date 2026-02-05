import type { ExpertBot, KnowledgeNode, ContributionReceipt } from './types'

export const expertBots: ExpertBot[] = [
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

export const getBotById = (id: string): ExpertBot | undefined => {
  return expertBots.find(bot => bot.id === id)
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

export const generateMockAnswer = (question: string, bot: ExpertBot): {
  answer: string
  usedNodes: string[]
} => {
  const keywords = question.toLowerCase()
  const nodes = bot.graph.nodes

  // Simple keyword matching for demo
  const matchedNodes = nodes.filter(node =>
    keywords.includes(node.label.slice(0, 3).toLowerCase()) ||
    node.content.toLowerCase().includes(keywords.slice(0, 5))
  )

  // If no matches, use first 2 nodes
  const usedNodes = matchedNodes.length > 0
    ? matchedNodes.slice(0, 3)
    : nodes.slice(0, 2)

  const answer = usedNodes.map(n => n.content).join('\n\n')

  return {
    answer: answer || '죄송합니다. 해당 질문에 대한 정보를 찾지 못했습니다.',
    usedNodes: usedNodes.map(n => n.id)
  }
}
