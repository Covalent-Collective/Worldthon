import * as api from './api'
import { isSupabaseConfigured } from './supabase'
import type {
  ExpertBot,
  KnowledgeNode,
  KnowledgeEdge,
  ContributionReceipt,
  DetailedContribution,
  NodeDetail,
  AnswerResult
} from './types'

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
      const supabaseBots = await api.getAllBots()
      // Merge: use Supabase metadata but enrich graph data from mock if richer
      return supabaseBots.map(sb => {
        const mockBot = baseExpertBots.find(mb => mb.id === sb.id)
        if (mockBot && mockBot.graph.nodes.length > sb.graph.nodes.length) {
          return { ...sb, graph: mockBot.graph, nodeCount: mockBot.graph.nodes.length }
        }
        return sb
      })
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
      if (bot) {
        const mockBot = baseExpertBots.find(mb => mb.id === id)
        if (mockBot && mockBot.graph.nodes.length > bot.graph.nodes.length) {
          return { ...bot, graph: mockBot.graph, nodeCount: mockBot.graph.nodes.length }
        }
        return bot
      }
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
    icon: 'W',
    profileImage: '/profiles/worldcoin.png',
    category: 'Web3',
    nodeCount: 18,
    contributorCount: 7,
    graph: {
      nodes: [
        {
          id: 'wld-1',
          label: 'World ID란?',
          content: 'World ID는 "Proof of Personhood" 프로토콜입니다. Orb라는 생체 인식 장치로 홍채를 스캔하여 각 개인이 고유한 인간임을 증명합니다. 프라이버시를 보호하면서 Sybil 공격을 방지하는 것이 핵심 목표.',
          contributor: '0xwld1...anon',
          createdAt: '2025-11-01',
          citationCount: 48
        },
        {
          id: 'wld-2',
          label: 'Orb 인증 과정',
          content: 'Orb 인증은 약 30초 소요됩니다. 1) World App 설치 2) Orb 운영 장소 방문 3) 홍채 스캔 4) World ID 발급. 한국에는 서울 강남, 홍대, 부산 서면 등에 Orb 운영 장소가 있습니다.',
          contributor: '0xwld2...anon',
          createdAt: '2025-11-05',
          citationCount: 42
        },
        {
          id: 'wld-3',
          label: 'WLD 토큰 유틸리티',
          content: 'WLD는 Worldcoin 생태계의 거버넌스 토큰입니다. World App 내 결제, 거버넌스 투표, 개발자 인센티브 등에 사용됩니다. Orb 인증 완료 시 WLD 그랜트를 정기적으로 받을 수 있습니다.',
          contributor: '0xwld3...anon',
          createdAt: '2025-11-10',
          citationCount: 39
        },
        {
          id: 'wld-4',
          label: 'World App 기능',
          content: 'World App은 World ID 지갑이자 슈퍼앱입니다. WLD/USDC 전송, World ID로 로그인, Mini Apps 사용, P2P 결제가 가능합니다. 한국에서는 카카오페이처럼 일상 결제에 활용할 수 있습니다.',
          contributor: '0xwld4...anon',
          createdAt: '2025-11-15',
          citationCount: 35
        },
        {
          id: 'wld-5',
          label: 'Mini Apps 개발',
          content: 'World App Mini Apps는 World ID 인증이 내장된 웹앱입니다. MiniKit SDK를 사용해 개발합니다. verifyAction으로 사용자 인증, pay로 WLD 결제를 구현할 수 있습니다.',
          contributor: '0xwld5...anon',
          createdAt: '2025-12-01',
          citationCount: 28
        },
        {
          id: 'wld-6',
          label: 'IDKit vs MiniKit',
          content: 'IDKit은 일반 웹사이트용, MiniKit은 World App 내 Mini Apps용입니다. MiniKit은 지갑 연결 없이 바로 인증 가능하고, 인앱 결제를 지원합니다. 새 프로젝트는 MiniKit 권장.',
          contributor: '0xwld6...anon',
          createdAt: '2025-12-10',
          citationCount: 24
        },
        {
          id: 'wld-7',
          label: 'ZK 증명 원리',
          content: 'World ID는 영지식 증명(Zero-Knowledge Proof)을 사용합니다. 홍채 데이터 자체가 아닌 "고유한 인간임"만 증명합니다. Semaphore 프로토콜 기반으로 프라이버시를 완벽히 보호합니다.',
          contributor: '0xwld7...anon',
          createdAt: '2025-12-15',
          citationCount: 31
        },
        {
          id: 'wld-8',
          label: '인증 레벨 종류',
          content: 'World ID에는 여러 인증 레벨이 있습니다. Device(폰 번호), Orb(홍채), Face(얼굴) 순으로 신뢰도가 높아집니다. Orb 인증이 가장 강력하며, 대부분의 그랜트는 Orb 인증 필수.',
          contributor: '0xwld8...anon',
          createdAt: '2025-12-18',
          citationCount: 27
        },
        {
          id: 'wld-9',
          label: 'WLD 그랜트 수령',
          content: 'Orb 인증 후 World App에서 정기적으로 WLD 그랜트를 수령할 수 있습니다. 약 2주마다 지급되며, 국가별로 금액이 다릅니다. 수령 후 거래소로 전송하거나 앱 내 결제에 사용 가능.',
          contributor: '0xwld9...anon',
          createdAt: '2025-12-20',
          citationCount: 44
        },
        {
          id: 'wld-10',
          label: 'World Chain 소개',
          content: 'World Chain은 Worldcoin의 자체 L2 블록체인입니다. Optimism 스택 기반으로 구축되었고, World ID 인증 사용자에게 가스비 우선권을 제공합니다. 봇 없는 온체인 환경을 목표로 합니다.',
          contributor: '0xwld10...anon',
          createdAt: '2025-12-22',
          citationCount: 33
        },
        {
          id: 'wld-11',
          label: 'Developer Portal',
          content: 'Worldcoin Developer Portal(developer.worldcoin.org)에서 앱을 등록하고 API 키를 발급받습니다. Staging 환경에서 테스트 후 Production으로 배포. 문서화가 잘 되어 있어 시작하기 쉽습니다.',
          contributor: '0xwld11...anon',
          createdAt: '2025-12-25',
          citationCount: 22
        },
        {
          id: 'wld-12',
          label: 'Simulator 사용법',
          content: 'World ID Simulator는 실제 Orb 없이 개발 테스트를 할 수 있는 도구입니다. Chrome 확장 프로그램으로 설치하고, 가상의 World ID로 인증 플로우를 테스트할 수 있습니다.',
          contributor: '0xwld12...anon',
          createdAt: '2025-12-28',
          citationCount: 19
        },
        {
          id: 'wld-13',
          label: 'Sign In with World ID',
          content: 'SIWE(Sign In with Ethereum)처럼 SIWW(Sign In with World ID)로 웹사이트 로그인이 가능합니다. 소셜 로그인을 대체하면서 사용자가 인간임을 동시에 증명합니다. 스팸 계정 방지에 효과적.',
          contributor: '0xwld13...anon',
          createdAt: '2026-01-02',
          citationCount: 26
        },
        {
          id: 'wld-14',
          label: 'Actions 설정',
          content: 'World ID Actions는 특정 행동에 대한 고유 인증입니다. 예: 투표, 에어드랍 수령. Developer Portal에서 Action을 생성하고, 사용자당 1회 또는 N회 제한을 설정할 수 있습니다.',
          contributor: '0xwld14...anon',
          createdAt: '2026-01-05',
          citationCount: 21
        },
        {
          id: 'wld-15',
          label: '스마트 컨트랙트 연동',
          content: 'On-chain 검증을 위해 World ID 컨트랙트와 연동합니다. verifyProof 함수로 ZK 증명을 검증하고, 이미 사용된 nullifier_hash인지 확인합니다. Foundry나 Hardhat으로 개발 가능.',
          contributor: '0xwld15...anon',
          createdAt: '2026-01-08',
          citationCount: 18
        },
        {
          id: 'wld-16',
          label: '프라이버시 FAQ',
          content: 'Q: 홍채 데이터가 저장되나요? A: 아니요, 해시값만 저장됩니다. Q: 정부가 추적 가능한가요? A: World ID와 실제 신원은 연결되지 않습니다. ZK 증명으로 프라이버시가 수학적으로 보장됩니다.',
          contributor: '0xwld16...anon',
          createdAt: '2026-01-10',
          citationCount: 37
        },
        {
          id: 'wld-17',
          label: 'Orb 위치 찾기',
          content: 'World App 내 "Verify" 탭에서 가까운 Orb 위치를 찾을 수 있습니다. worldcoin.org/find-orb에서도 확인 가능. 운영 시간과 대기 상황을 미리 체크하세요. 예약제인 곳도 있습니다.',
          contributor: '0xwld17...anon',
          createdAt: '2026-01-12',
          citationCount: 40
        },
        {
          id: 'wld-18',
          label: 'UBI 비전',
          content: 'Worldcoin의 궁극적 비전은 Universal Basic Income(기본소득)입니다. AI 시대에 모든 인간에게 수익을 분배하는 인프라를 구축하는 것이 목표. WLD 그랜트는 그 첫 단계입니다.',
          contributor: '0xwld18...anon',
          createdAt: '2026-01-15',
          citationCount: 46
        }
      ],
      edges: [
        { source: 'wld-1', target: 'wld-2', relationship: '인증 방법' },
        { source: 'wld-2', target: 'wld-3', relationship: '보상' },
        { source: 'wld-3', target: 'wld-4', relationship: '사용처' },
        { source: 'wld-4', target: 'wld-5', relationship: '개발' },
        { source: 'wld-5', target: 'wld-6', relationship: 'SDK 선택' },
        { source: 'wld-1', target: 'wld-7', relationship: '기술 원리' },
        { source: 'wld-2', target: 'wld-8', relationship: '관련됨' },
        { source: 'wld-3', target: 'wld-9', relationship: '예시' },
        { source: 'wld-4', target: 'wld-10', relationship: '관련됨' },
        { source: 'wld-5', target: 'wld-11', relationship: '관련됨' },
        { source: 'wld-11', target: 'wld-12', relationship: '관련됨' },
        { source: 'wld-6', target: 'wld-13', relationship: '예시' },
        { source: 'wld-13', target: 'wld-14', relationship: '관련됨' },
        { source: 'wld-14', target: 'wld-15', relationship: '관련됨' },
        { source: 'wld-7', target: 'wld-16', relationship: '관련됨' },
        { source: 'wld-2', target: 'wld-17', relationship: '관련됨' },
        { source: 'wld-1', target: 'wld-18', relationship: '비전' },
        { source: 'wld-9', target: 'wld-18', relationship: '관련됨' },
        { source: 'wld-10', target: 'wld-15', relationship: '포함' },
        { source: 'wld-8', target: 'wld-17', relationship: '관련됨' }
      ]
    }
  },
  {
    id: 'seoul-local-guide',
    name: '서울 로컬 가이드',
    description: '서울의 숨은 명소와 맛집을 알려드립니다',
    icon: 'S',
    profileImage: '/profiles/seoul-guide.png',
    category: '여행',
    nodeCount: 24,
    contributorCount: 12,
    graph: {
      nodes: [
        {
          id: 'seoul-1',
          label: '을지로 노가리 골목',
          content: '을지로 3가역 근처 노가리 골목은 퇴근 후 직장인들의 성지입니다. "을지OB베어"는 40년 전통의 노가리집으로, 마른 노가리와 시원한 맥주 조합이 일품입니다. 저녁 6시 이후 웨이팅 필수.',
          contributor: '0x1a2b...anon',
          createdAt: '2025-12-15',
          citationCount: 156
        },
        {
          id: 'seoul-2',
          label: '을지로 인쇄골목',
          content: '을지로 인쇄골목은 50년 역사의 인쇄소들이 밀집한 곳입니다. 최근에는 "을지다락", "커피한약방" 같은 힙한 카페들이 인쇄소 사이에 숨어있어 보물찾기하는 재미가 있습니다.',
          contributor: '0x2b3c...anon',
          createdAt: '2025-12-18',
          citationCount: 89
        },
        {
          id: 'seoul-3',
          label: '익선동 한옥카페',
          content: '익선동 한옥마을은 100년된 한옥들이 카페와 레스토랑으로 변신한 곳입니다. "열두달"은 계절별 디저트가 인기이고, "익선다다"는 전통차와 한과 세트가 유명합니다.',
          contributor: '0x3c4d...anon',
          createdAt: '2025-12-20',
          citationCount: 134
        },
        {
          id: 'seoul-4',
          label: '익선동 빈티지샵',
          content: '익선동에는 독특한 빈티지샵들이 많습니다. "서울빈티지"는 70-80년대 한국 소품 전문, "올드웨이"는 미드센추리 가구가 특징입니다. 구경만 해도 시간 가는 줄 모릅니다.',
          contributor: '0x4d5e...anon',
          createdAt: '2025-12-22',
          citationCount: 67
        },
        {
          id: 'seoul-5',
          label: '성수동 대림창고',
          content: '대림창고는 1970년대 정미소 창고를 개조한 복합문화공간입니다. 1층 카페, 2층 전시공간으로 구성되어 있고, 높은 천장과 벽돌 인테리어가 인상적입니다. 주말 오전이 한적합니다.',
          contributor: '0x5e6f...anon',
          createdAt: '2026-01-05',
          citationCount: 203
        },
        {
          id: 'seoul-6',
          label: '성수동 어니언 카페',
          content: '어니언 성수는 폐공장을 개조한 베이커리 카페의 원조입니다. 시그니처 판도로 빵과 팥빙수가 유명하고, 2층 루프탑에서 성수동 전경을 볼 수 있습니다. 평일도 웨이팅 30분 이상.',
          contributor: '0x6f7g...anon',
          createdAt: '2026-01-07',
          citationCount: 178
        },
        {
          id: 'seoul-7',
          label: '성수동 수제화거리',
          content: '성수동은 원래 수제화 공장이 밀집한 곳이었습니다. 지금도 "성수 수제화거리"에서 맞춤 구두를 제작할 수 있고, 가격은 기성품의 70% 수준입니다. 제작 기간은 2-3주.',
          contributor: '0x7g8h...anon',
          createdAt: '2026-01-08',
          citationCount: 45
        },
        {
          id: 'seoul-8',
          label: '망리단길 맛집',
          content: '망원동 망리단길은 경의선숲길 옆 골목입니다. "타르틴"의 크루아상, "망원동티키타카"의 타코, "어글리베이커리"의 소금빵이 3대 필수 코스입니다. 주말 점심은 피하세요.',
          contributor: '0x8h9i...anon',
          createdAt: '2026-01-10',
          citationCount: 112
        },
        {
          id: 'seoul-9',
          label: '망원시장 먹거리',
          content: '망원시장은 MZ세대가 사랑하는 전통시장입니다. "박가네빈대떡", "원조누드김밥", "손만두"가 인기입니다. 시장 구경 후 근처 한강공원에서 피크닉하는 코스 추천.',
          contributor: '0x9i0j...anon',
          createdAt: '2026-01-12',
          citationCount: 89
        },
        {
          id: 'seoul-10',
          label: '연남동 경의선숲길',
          content: '경의선 폐철로가 공원으로 변신한 경의선숲길입니다. 연남동 구간은 약 1.5km로, 양옆에 카페와 맛집이 즐비합니다. 봄 벚꽃, 가을 단풍 시즌이 특히 예쁩니다.',
          contributor: '0xa1b2...anon',
          createdAt: '2026-01-15',
          citationCount: 145
        },
        {
          id: 'seoul-11',
          label: '연남동 분위기 바',
          content: '연남동에는 개성있는 바가 많습니다. "스탠드바이미"는 재즈 라이브, "더봄"은 소주 칵테일, "을밀대"는 막걸리 전문입니다. 대부분 저녁 7시 오픈, 예약 필수.',
          contributor: '0xb2c3...anon',
          createdAt: '2026-01-17',
          citationCount: 78
        },
        {
          id: 'seoul-12',
          label: '한남동 카페거리',
          content: '한남동은 서울에서 가장 세련된 카페거리입니다. "테라로사", "앤트러사이트" 같은 대형 로스터리부터 "시크릿가든" 같은 히든 카페까지 다양합니다. 이태원역에서 도보 10분.',
          contributor: '0xc3d4...anon',
          createdAt: '2026-01-20',
          citationCount: 167
        },
        {
          id: 'seoul-13',
          label: '한남동 갤러리',
          content: '한남동에는 리움미술관을 비롯해 "페이스 갤러리", "PKM갤러리" 등 세계적인 갤러리가 밀집해 있습니다. 대부분 무료 입장이고, 화-일 운영합니다. 현대미술 덕후라면 필수 코스.',
          contributor: '0xd4e5...anon',
          createdAt: '2026-01-22',
          citationCount: 95
        },
        {
          id: 'seoul-14',
          label: '한남동 맛집 골목',
          content: '한남동 뒷골목에는 숨은 맛집이 많습니다. "라미따블"은 프렌치 비스트로, "타볼로24"는 이탈리안, "진진"은 딤섬 맛집입니다. 예약 없이 가면 1시간 대기 각오하세요.',
          contributor: '0xe5f6...anon',
          createdAt: '2026-01-24',
          citationCount: 134
        },
        {
          id: 'seoul-15',
          label: '홍대 인디음악 클럽',
          content: '홍대는 한국 인디음악의 성지입니다. "클럽빵", "FF", "상상마당"에서 매주 라이브 공연이 열립니다. 공연 정보는 인디스트리트 앱에서 확인하세요. 입장료 1-2만원.',
          contributor: '0xf6g7...anon',
          createdAt: '2026-01-26',
          citationCount: 56
        },
        {
          id: 'seoul-16',
          label: '홍대 프리마켓',
          content: '매주 토요일 홍대 놀이터 앞에서 프리마켓이 열립니다. 핸드메이드 악세사리, 빈티지 옷, 그림 등을 판매합니다. 오후 1시-6시, 비오는 날은 취소됩니다.',
          contributor: '0x1122...anon',
          createdAt: '2026-01-28',
          citationCount: 43
        },
        {
          id: 'seoul-17',
          label: '북촌 한옥마을',
          content: '북촌 한옥마을은 600년 역사의 전통 한옥 주거지입니다. 북촌 8경 포토스팟을 따라 걸으면 약 2시간 소요. 아침 일찍 가야 사람 없는 사진 찍을 수 있습니다. 주민 배려 필수.',
          contributor: '0x2233...anon',
          createdAt: '2026-01-30',
          citationCount: 189
        },
        {
          id: 'seoul-18',
          label: '서촌 골목투어',
          content: '서촌은 세종마을이라고도 불리는 예술가들의 동네입니다. "대오서점"은 80년 된 헌책방, "통인시장 도시락카페"는 엽전으로 반찬을 사는 독특한 경험을 제공합니다.',
          contributor: '0x3344...anon',
          createdAt: '2026-02-01',
          citationCount: 124
        },
        {
          id: 'seoul-19',
          label: '이태원 세계음식거리',
          content: '이태원은 서울에서 가장 다양한 세계 음식을 맛볼 수 있는 곳입니다. 중동의 "팔라펠키친", 멕시코의 "비바메히코", 인도의 "타지팰리스"가 현지인 추천 맛집입니다.',
          contributor: '0x4455...anon',
          createdAt: '2026-02-03',
          citationCount: 98
        },
        {
          id: 'seoul-20',
          label: '남산 야경 스팟',
          content: 'N서울타워 외에도 남산에는 숨은 야경 스팟이 있습니다. "남산도서관 옆 전망대"는 무료이고 북악산까지 보입니다. "목멱산방"에서 전통차 마시며 야경 보는 것도 추천.',
          contributor: '0x5566...anon',
          createdAt: '2026-02-05',
          citationCount: 76
        }
      ],
      edges: [
        { source: 'seoul-1', target: 'seoul-2', relationship: '도보 5분' },
        { source: 'seoul-2', target: 'seoul-3', relationship: '도보 10분' },
        { source: 'seoul-3', target: 'seoul-4', relationship: '포함' },
        { source: 'seoul-5', target: 'seoul-6', relationship: '도보 3분' },
        { source: 'seoul-6', target: 'seoul-7', relationship: '관련됨' },
        { source: 'seoul-8', target: 'seoul-9', relationship: '도보 5분' },
        { source: 'seoul-9', target: 'seoul-10', relationship: '도보 10분' },
        { source: 'seoul-10', target: 'seoul-11', relationship: '포함' },
        { source: 'seoul-12', target: 'seoul-13', relationship: '도보 5분' },
        { source: 'seoul-13', target: 'seoul-14', relationship: '관련됨' },
        { source: 'seoul-15', target: 'seoul-16', relationship: '도보 3분' },
        { source: 'seoul-17', target: 'seoul-18', relationship: '도보 15분' },
        { source: 'seoul-1', target: 'seoul-3', relationship: '지하철 5분' },
        { source: 'seoul-5', target: 'seoul-12', relationship: '지하철 15분' },
        { source: 'seoul-10', target: 'seoul-15', relationship: '지하철 10분' },
        { source: 'seoul-17', target: 'seoul-3', relationship: '도보 10분' },
        { source: 'seoul-19', target: 'seoul-12', relationship: '도보 15분' },
        { source: 'seoul-20', target: 'seoul-17', relationship: '버스 10분' },
        { source: 'seoul-3', target: 'seoul-17', relationship: '비교' },
        { source: 'seoul-5', target: 'seoul-8', relationship: '비교' },
        { source: 'seoul-11', target: 'seoul-15', relationship: '비교' }
      ]
    }
  },
  {
    id: 'obgyn-specialist',
    name: '산부인과 전문의',
    description: '임신, 출산, 여성 건강에 대한 전문 지식',
    icon: 'M',
    profileImage: '/profiles/doctor.png',
    category: '의료',
    nodeCount: 45,
    contributorCount: 8,
    graph: {
      nodes: [
        {
          id: 'med-1',
          label: '임신 초기 증상',
          content: '임신 초기(4-8주)에는 입덧, 피로감, 유방 통증, 빈뇨 등이 나타날 수 있습니다. 생리 예정일이 1주일 이상 지났다면 임신 테스트기를 사용해보세요. 아침 첫 소변으로 검사하면 정확도가 높습니다.',
          contributor: '0xmed1...anon',
          createdAt: '2025-11-20',
          citationCount: 47
        },
        {
          id: 'med-2',
          label: '산전 검사 일정',
          content: '임신 확인 후 첫 산전검사는 8-12주에 시행합니다. 기형아 검사(15-20주), 정밀초음파(20-24주), 임신성 당뇨검사(24-28주) 등 시기별 검사가 있습니다. 병원에서 검사 일정표를 받으세요.',
          contributor: '0xmed2...anon',
          createdAt: '2025-11-25',
          citationCount: 43
        },
        {
          id: 'med-3',
          label: '출산 준비물',
          content: '출산 2주 전부터 입원 가방을 준비하세요. 산모수첩, 속옷, 수유패드, 산후대, 신생아 옷(배냇저고리, 손싸개) 등이 필요합니다. 산후조리원 예약도 미리 해두는 것이 좋습니다.',
          contributor: '0xmed3...anon',
          createdAt: '2025-12-01',
          citationCount: 38
        },
        {
          id: 'med-4',
          label: '입덧 완화 방법',
          content: '입덧은 보통 6-12주에 심하고 14주경 호전됩니다. 공복을 피하고 소량씩 자주 드세요. 생강차, 레몬수가 도움됩니다. 구토가 심해 탈수 증상이 있다면 수액 치료가 필요할 수 있습니다.',
          contributor: '0xmed4...anon',
          createdAt: '2025-12-05',
          citationCount: 35
        },
        {
          id: 'med-5',
          label: '임산부 영양제',
          content: '엽산은 임신 준비 3개월 전부터 12주까지 필수입니다. 철분제는 16주 이후 복용 시작. 칼슘, 오메가3, 비타민D도 권장됩니다. 종합비타민보다 시기별 맞춤 영양제가 효과적입니다.',
          contributor: '0xmed5...anon',
          createdAt: '2025-12-08',
          citationCount: 41
        },
        {
          id: 'med-6',
          label: '기형아 검사 종류',
          content: '1차 기형아 검사(11-13주)는 목투명대와 혈액검사를 결합합니다. 2차(15-20주)는 쿼드 검사. 고위험군은 양수검사나 NIPT(비침습적 산전검사)를 권유받습니다. NIPT는 99% 정확도.',
          contributor: '0xmed6...anon',
          createdAt: '2025-12-10',
          citationCount: 33
        },
        {
          id: 'med-7',
          label: '임신 중 운동',
          content: '가벼운 유산소 운동(걷기, 수영, 요가)은 임신 중에도 권장됩니다. 주 150분 중등도 운동이 목표. 배에 충격이 가는 운동, 누워서 하는 운동(20주 이후)은 피하세요. 의사와 상담 후 시작.',
          contributor: '0xmed7...anon',
          createdAt: '2025-12-12',
          citationCount: 28
        },
        {
          id: 'med-8',
          label: '임신 중 금기 음식',
          content: '날생선(회), 덜 익힌 고기, 생치즈는 피하세요. 카페인은 하루 200mg 이하(커피 1-2잔)로 제한. 술과 담배는 절대 금물입니다. 참치 등 대형 어류는 수은 때문에 주 1회 이하.',
          contributor: '0xmed8...anon',
          createdAt: '2025-12-15',
          citationCount: 44
        },
        {
          id: 'med-9',
          label: '태동 느끼는 시기',
          content: '첫 임신은 18-22주, 경산부는 16-18주경 태동을 느낍니다. 처음에는 장운동과 비슷해 구별이 어려울 수 있습니다. 28주 이후에는 하루 10회 이상 태동이 느껴져야 정상입니다.',
          contributor: '0xmed9...anon',
          createdAt: '2025-12-18',
          citationCount: 31
        },
        {
          id: 'med-10',
          label: '조기진통 증상',
          content: '규칙적인 배뭉침(10분에 1회 이상), 질출혈, 양수 파막 느낌이 있다면 즉시 병원에 가세요. 37주 이전 진통은 조산 위험이 있습니다. 자궁경부 길이 측정으로 위험도를 평가합니다.',
          contributor: '0xmed10...anon',
          createdAt: '2025-12-20',
          citationCount: 36
        },
        {
          id: 'med-11',
          label: '분만 방법 선택',
          content: '자연분만과 제왕절개 중 선택합니다. 자연분만이 회복이 빠르지만, 태아 위치, 산모 건강상태에 따라 제왕절개가 필요할 수 있습니다. 담당의와 충분히 상의하세요. 무통분만도 가능합니다.',
          contributor: '0xmed11...anon',
          createdAt: '2025-12-22',
          citationCount: 39
        },
        {
          id: 'med-12',
          label: '모유수유 준비',
          content: '출산 후 30분-1시간 내 첫 모유수유가 권장됩니다. 처음 나오는 초유는 면역물질이 풍부합니다. 유두 관리, 수유 자세 등을 미리 배워두면 좋습니다. 유축기도 미리 준비하세요.',
          contributor: '0xmed12...anon',
          createdAt: '2025-12-25',
          citationCount: 34
        },
        {
          id: 'med-13',
          label: '산후조리 기본',
          content: '산후 6-8주는 회복 기간입니다. 충분한 휴식, 균형 잡힌 식사, 가벼운 스트레칭이 필요합니다. 무거운 것 들기, 계단 오르기는 피하세요. 산후우울증 증상이 있다면 전문 상담을 받으세요.',
          contributor: '0xmed13...anon',
          createdAt: '2025-12-28',
          citationCount: 42
        },
        {
          id: 'med-14',
          label: '생리 주기 이해',
          content: '정상 생리 주기는 21-35일입니다. 배란은 다음 생리 14일 전에 일어납니다. 생리불순이 3개월 이상 지속되면 검사가 필요합니다. 생리앱으로 주기를 기록해두면 도움됩니다.',
          contributor: '0xmed14...anon',
          createdAt: '2026-01-02',
          citationCount: 29
        },
        {
          id: 'med-15',
          label: '자궁경부암 검진',
          content: '성경험이 있는 여성은 2년마다 자궁경부암 검진(PAP smear)을 권장합니다. 국가 무료검진 대상(20세 이상). HPV 백신은 암 예방에 효과적이며 26세 이전 접종이 권장됩니다.',
          contributor: '0xmed15...anon',
          createdAt: '2026-01-05',
          citationCount: 37
        },
        {
          id: 'med-16',
          label: '피임법 종류',
          content: '콘돔, 경구피임약, IUD(자궁내장치), 임플란트 등이 있습니다. 경구피임약은 매일 같은 시간에 복용. IUD는 5년 유지 가능. 각 방법의 장단점을 의사와 상담 후 선택하세요.',
          contributor: '0xmed16...anon',
          createdAt: '2026-01-08',
          citationCount: 32
        },
        {
          id: 'med-17',
          label: '난임 기준',
          content: '정상적인 부부관계 1년(35세 이상은 6개월) 후에도 임신이 안 되면 난임 검사를 권합니다. 여성은 호르몬, 나팔관, 자궁 검사, 남성은 정액검사를 시행합니다. 70-80%는 치료로 임신 가능.',
          contributor: '0xmed17...anon',
          createdAt: '2026-01-10',
          citationCount: 26
        },
        {
          id: 'med-18',
          label: '갱년기 증상',
          content: '보통 45-55세에 폐경이 옵니다. 안면홍조, 수면장애, 질건조감, 기분변화가 대표 증상입니다. 호르몬 대체요법(HRT)으로 증상 완화가 가능합니다. 골다공증 예방을 위해 칼슘 섭취도 중요.',
          contributor: '0xmed18...anon',
          createdAt: '2026-01-12',
          citationCount: 30
        }
      ],
      edges: [
        { source: 'med-1', target: 'med-2', relationship: '다음 단계' },
        { source: 'med-2', target: 'med-6', relationship: '포함' },
        { source: 'med-1', target: 'med-4', relationship: '관련됨' },
        { source: 'med-2', target: 'med-3', relationship: '준비사항' },
        { source: 'med-1', target: 'med-5', relationship: '관련됨' },
        { source: 'med-5', target: 'med-8', relationship: '관련됨' },
        { source: 'med-4', target: 'med-8', relationship: '관련됨' },
        { source: 'med-7', target: 'med-8', relationship: '반대' },
        { source: 'med-9', target: 'med-10', relationship: '관련됨' },
        { source: 'med-10', target: 'med-11', relationship: '관련됨' },
        { source: 'med-11', target: 'med-12', relationship: '다음 단계' },
        { source: 'med-12', target: 'med-13', relationship: '관련됨' },
        { source: 'med-3', target: 'med-11', relationship: '관련됨' },
        { source: 'med-14', target: 'med-17', relationship: '관련됨' },
        { source: 'med-15', target: 'med-16', relationship: '관련됨' },
        { source: 'med-14', target: 'med-16', relationship: '관련됨' },
        { source: 'med-17', target: 'med-1', relationship: '결과' },
        { source: 'med-14', target: 'med-18', relationship: '관련됨' },
        { source: 'med-6', target: 'med-9', relationship: '관련됨' }
      ]
    }
  },
  {
    id: 'korean-recipes',
    name: '조림 마스터',
    description: '최강록 셰프의 조림 비법과 한식 요리 노하우',
    icon: 'K',
    profileImage: '/profiles/chef.png',
    category: '요리',
    nodeCount: 67,
    contributorCount: 23,
    graph: {
      nodes: [
        {
          id: 'recipe-1',
          label: '김치찌개 황금레시피',
          content: '묵은지 200g, 돼지고기 목살 150g, 두부 반모가 기본입니다. 돼지고기를 참기름에 먼저 볶다가 김치를 넣고 5분간 같이 볶아 감칠맛을 끌어냅니다. 물 500ml를 넣고 끓이면 완성.',
          contributor: '0xchef1...anon',
          createdAt: '2025-10-15',
          citationCount: 48
        },
        {
          id: 'recipe-2',
          label: '된장찌개 기본',
          content: '된장 2큰술, 애호박, 두부, 양파, 청양고추가 필요합니다. 멸치육수 500ml에 된장을 풀고 채소를 넣어 10분 끓입니다. 마지막에 다진 마늘과 대파를 넣으면 향이 살아납니다.',
          contributor: '0xchef2...anon',
          createdAt: '2025-10-20',
          citationCount: 42
        },
        {
          id: 'recipe-3',
          label: '불고기 양념장',
          content: '간장 4큰술, 설탕 2큰술, 배즙 3큰술, 다진마늘 1큰술, 참기름 1큰술, 후추 약간. 배즙이 고기를 부드럽게 만드는 핵심입니다. 소고기는 최소 2시간, 하룻밤 재우면 더 맛있습니다.',
          contributor: '0xchef3...anon',
          createdAt: '2025-10-25',
          citationCount: 39
        },
        {
          id: 'recipe-4',
          label: '비빔밥 만들기',
          content: '밥 위에 나물 5종(시금치, 콩나물, 도라지, 고사리, 무생채), 계란 프라이, 고추장을 올립니다. 나물은 각각 간을 해서 준비하고, 참기름을 둘러 비비면 완성. 돌솥에 하면 누룽지 보너스.',
          contributor: '0xchef4...anon',
          createdAt: '2025-11-01',
          citationCount: 35
        },
        {
          id: 'recipe-5',
          label: '잡채 레시피',
          content: '당면 200g, 소고기 100g, 시금치, 당근, 양파, 표고버섯. 재료를 각각 볶은 후 마지막에 섞습니다. 당면은 8분 삶아 찬물에 헹구고, 간장 양념에 버무립니다. 통깨를 듬뿍 뿌려주세요.',
          contributor: '0xchef5...anon',
          createdAt: '2025-11-05',
          citationCount: 31
        },
        {
          id: 'recipe-6',
          label: '떡볶이 황금비율',
          content: '고추장 3큰술, 고춧가루 1큰술, 설탕 2큰술, 간장 1큰술이 황금비율입니다. 떡 300g, 어묵 2장, 대파 1대. 물 400ml에 양념을 풀고 떡을 넣어 끓이면 10분이면 완성됩니다.',
          contributor: '0xchef6...anon',
          createdAt: '2025-11-10',
          citationCount: 45
        },
        {
          id: 'recipe-7',
          label: '고추장 만들기',
          content: '고춧가루 1kg, 메주가루 200g, 엿기름물 1L, 소금 200g, 조청 500g. 모든 재료를 섞어 항아리에 담고 3개월 숙성시킵니다. 발효 과정에서 매일 저어주는 것이 중요합니다.',
          contributor: '0xchef7...anon',
          createdAt: '2025-11-15',
          citationCount: 22
        },
        {
          id: 'recipe-8',
          label: '된장 담그기',
          content: '메주 10개, 물 20L, 천일염 3kg. 소금물에 메주를 넣고 40-60일 발효시킵니다. 메주를 건져 으깨면 된장, 남은 물은 간장이 됩니다. 전통 장은 집밥의 기본입니다.',
          contributor: '0xchef8...anon',
          createdAt: '2025-11-20',
          citationCount: 18
        },
        {
          id: 'recipe-9',
          label: '참기름 활용법',
          content: '참기름은 열에 약해 조리 마무리에 넣습니다. 나물 무칠 때, 국 완성 시, 비빔밥에 필수입니다. 좋은 참기름은 황금빛에 고소한 향이 진합니다. 냉장 보관하면 6개월 유지.',
          contributor: '0xchef9...anon',
          createdAt: '2025-11-25',
          citationCount: 28
        },
        {
          id: 'recipe-10',
          label: '멸치육수 내리기',
          content: '국물용 멸치 20마리, 다시마 5x5cm 2장, 물 1.5L. 멸치 내장을 제거하고 팬에 살짝 볶습니다. 물에 멸치와 다시마를 넣고 끓기 시작하면 다시마는 건지고 멸치만 10분 더 끓입니다.',
          contributor: '0xchef10...anon',
          createdAt: '2025-12-01',
          citationCount: 38
        },
        {
          id: 'recipe-11',
          label: '마늘 손질법',
          content: '마늘은 한식의 핵심 재료입니다. 다진 마늘은 냉동 보관하면 편리합니다. 마늘 100통을 한 번에 까서 믹서에 갈아 얼음틀에 얼려두면 요리할 때 하나씩 꺼내 쓸 수 있습니다.',
          contributor: '0xchef11...anon',
          createdAt: '2025-12-05',
          citationCount: 25
        },
        {
          id: 'recipe-12',
          label: '삼겹살 굽기',
          content: '삼겹살은 두께 1cm가 적당합니다. 팬을 충분히 달군 후 고기를 올리고, 한 면이 노릇해질 때까지 뒤집지 않습니다. 쌈장, 마늘, 고추와 함께 상추에 싸먹으면 완벽한 한 끼.',
          contributor: '0xchef12...anon',
          createdAt: '2025-12-10',
          citationCount: 33
        },
        {
          id: 'recipe-13',
          label: '쌈장 만들기',
          content: '된장 3큰술, 고추장 1큰술, 다진마늘 1큰술, 참기름 1큰술, 통깨 1큰술. 모든 재료를 섞으면 끝입니다. 취향에 따라 청양고추 다진 것이나 설탕을 추가할 수 있습니다.',
          contributor: '0xchef13...anon',
          createdAt: '2025-12-15',
          citationCount: 29
        },
        {
          id: 'recipe-14',
          label: '배추김치 담그기',
          content: '배추 1포기, 천일염 1컵, 고춧가루 1컵, 젓갈 반컵. 배추를 소금에 8시간 절인 후 양념을 켜켜이 바릅니다. 실온에서 하루 익힌 후 냉장 보관. 2주 후부터 맛있게 익습니다.',
          contributor: '0xchef14...anon',
          createdAt: '2025-12-20',
          citationCount: 41
        },
        {
          id: 'recipe-15',
          label: '깍두기 만들기',
          content: '무 1개를 2cm 큐브로 썰어 소금에 30분 절입니다. 고춧가루 4큰술, 새우젓 2큰술, 설탕 1큰술, 다진마늘, 생강으로 양념장을 만들어 버무립니다. 실온 하루, 냉장 일주일 숙성.',
          contributor: '0xchef15...anon',
          createdAt: '2025-12-25',
          citationCount: 27
        },
        {
          id: 'recipe-16',
          label: '계란찜 비법',
          content: '계란 3개, 물 1컵, 소금 반작은술, 새우젓 약간. 계란을 잘 풀어 물과 섞고 뚝배기에 담습니다. 중불에서 저어가며 익히다 거품이 오르면 뚜껑 덮고 약불 5분. 폭신폭신 완성.',
          contributor: '0xchef16...anon',
          createdAt: '2026-01-01',
          citationCount: 36
        },
        {
          id: 'recipe-17',
          label: '순두부찌개',
          content: '순두부 1팩, 돼지고기 100g, 계란 1개, 고춧가루 1큰술. 돼지고기를 고춧가루와 함께 볶다가 물을 넣고 순두부를 풀어 끓입니다. 마지막에 계란을 깨넣고 바로 불을 끕니다.',
          contributor: '0xchef17...anon',
          createdAt: '2026-01-05',
          citationCount: 32
        },
        {
          id: 'recipe-18',
          label: '콩나물국',
          content: '콩나물 200g, 물 800ml, 국간장 1큰술, 다진마늘 1작은술. 물이 끓으면 콩나물을 넣고 뚜껑을 열지 않고 7분간 끓입니다. 뚜껑을 열면 비린내가 납니다. 대파와 청양고추 송송.',
          contributor: '0xchef18...anon',
          createdAt: '2026-01-10',
          citationCount: 23
        }
      ],
      edges: [
        { source: 'recipe-1', target: 'recipe-2', relationship: '함께 먹으면 좋은' },
        { source: 'recipe-1', target: 'recipe-14', relationship: '재료' },
        { source: 'recipe-2', target: 'recipe-8', relationship: '재료' },
        { source: 'recipe-3', target: 'recipe-12', relationship: '비교' },
        { source: 'recipe-4', target: 'recipe-9', relationship: '재료' },
        { source: 'recipe-5', target: 'recipe-3', relationship: '관련됨' },
        { source: 'recipe-6', target: 'recipe-7', relationship: '재료' },
        { source: 'recipe-7', target: 'recipe-8', relationship: '관련됨' },
        { source: 'recipe-9', target: 'recipe-4', relationship: '관련됨' },
        { source: 'recipe-10', target: 'recipe-2', relationship: '재료' },
        { source: 'recipe-10', target: 'recipe-18', relationship: '관련됨' },
        { source: 'recipe-11', target: 'recipe-1', relationship: '재료' },
        { source: 'recipe-11', target: 'recipe-3', relationship: '재료' },
        { source: 'recipe-12', target: 'recipe-13', relationship: '함께 먹으면 좋은' },
        { source: 'recipe-13', target: 'recipe-8', relationship: '재료' },
        { source: 'recipe-14', target: 'recipe-15', relationship: '관련됨' },
        { source: 'recipe-14', target: 'recipe-1', relationship: '예시' },
        { source: 'recipe-16', target: 'recipe-1', relationship: '함께 먹으면 좋은' },
        { source: 'recipe-17', target: 'recipe-1', relationship: '비교' },
        { source: 'recipe-17', target: 'recipe-2', relationship: '비교' },
        { source: 'recipe-18', target: 'recipe-17', relationship: '함께 먹으면 좋은' }
      ]
    }
  },
  {
    id: 'startup-mentor',
    name: '스타트업 멘토',
    description: '창업, 투자, 스케일업 경험 공유',
    icon: 'B',
    profileImage: '/profiles/startup-mentor.png',
    category: '비즈니스',
    nodeCount: 38,
    contributorCount: 15,
    graph: {
      nodes: [
        {
          id: 'startup-1',
          label: 'MVP 개발 전략',
          content: '첫 MVP는 3개월 안에 출시하세요. 핵심 기능 하나에 집중하고, 사용자 피드백으로 방향을 잡습니다. 완벽한 제품보다 빠른 학습이 중요합니다. 토스도 첫 버전은 기능 3개뿐이었습니다.',
          contributor: '0xfounder1...anon',
          createdAt: '2025-09-10',
          citationCount: 45
        },
        {
          id: 'startup-2',
          label: '시드 투자 유치',
          content: '시드 라운드는 보통 5-10억 규모입니다. 팀, 시장, 트랙션 세 가지를 명확히 보여주세요. 한국에서는 본엔젤스, 프라이머, 스파크랩이 대표적인 시드 투자자입니다.',
          contributor: '0xfounder2...anon',
          createdAt: '2025-09-15',
          citationCount: 38
        },
        {
          id: 'startup-3',
          label: '시리즈A 준비',
          content: '시리즈A는 보통 30-100억 규모이며, PMF(Product-Market Fit) 증명이 핵심입니다. MAU 성장률, 리텐션, 유닛이코노믹스 지표를 준비하세요. 대표 IR 덱은 15장 이내로.',
          contributor: '0xfounder3...anon',
          createdAt: '2025-09-20',
          citationCount: 35
        },
        {
          id: 'startup-4',
          label: 'PMF 찾기',
          content: 'Product-Market Fit은 고객이 제품을 "꼭 필요하다"고 느끼는 순간입니다. 40% 이상의 사용자가 "이 제품이 없으면 매우 실망할 것"이라고 답하면 PMF 달성. 숀 엘리스 테스트를 활용하세요.',
          contributor: '0xfounder4...anon',
          createdAt: '2025-09-25',
          citationCount: 42
        },
        {
          id: 'startup-5',
          label: 'MAU 성장 전략',
          content: 'MAU(Monthly Active Users)는 투자자가 가장 먼저 보는 지표입니다. 바이럴 계수 1 이상을 목표로 하세요. 당근마켓은 지역 커뮤니티 전략으로 MAU 1,800만을 달성했습니다.',
          contributor: '0xfounder5...anon',
          createdAt: '2025-10-01',
          citationCount: 29
        },
        {
          id: 'startup-6',
          label: '번아웃 관리',
          content: '창업자 번아웃은 스타트업 실패의 주요 원인입니다. 주 60시간 이상 근무가 3개월 이상 지속되면 위험 신호. 공동창업자와 역할 분담, 정기적인 오프 시간 확보가 필수입니다.',
          contributor: '0xfounder6...anon',
          createdAt: '2025-10-05',
          citationCount: 31
        },
        {
          id: 'startup-7',
          label: '피벗 결정 시점',
          content: '6개월간 핵심 지표가 개선되지 않으면 피벗을 고려하세요. 피벗은 실패가 아니라 학습의 결과입니다. 슬랙도 게임 회사에서 피벗했고, 인스타그램은 버번(Burbn)에서 피벗했습니다.',
          contributor: '0xfounder7...anon',
          createdAt: '2025-10-10',
          citationCount: 27
        },
        {
          id: 'startup-8',
          label: '토스 성공 사례',
          content: '토스는 공인인증서 없는 간편송금으로 시작했습니다. 초기 3년간 적자였지만 사용자 경험에 집중. 현재 기업가치 10조원 이상, 직원 2,000명 규모의 핀테크 유니콘이 되었습니다.',
          contributor: '0xfounder8...anon',
          createdAt: '2025-10-15',
          citationCount: 50
        },
        {
          id: 'startup-9',
          label: '당근마켓 성공 사례',
          content: '당근마켓은 지역 기반 중고거래로 시작해 하이퍼로컬 플랫폼으로 확장했습니다. 핵심은 "매너온도" 시스템으로 신뢰를 구축한 것. 현재 MAU 1,800만, 기업가치 3조원 이상.',
          contributor: '0xfounder9...anon',
          createdAt: '2025-10-20',
          citationCount: 47
        },
        {
          id: 'startup-10',
          label: '배민 성공 사례',
          content: '배달의민족은 전단지 대체 앱으로 시작했습니다. B마트, 배민1으로 서비스를 확장하고, 2019년 딜리버리히어로에 4조원에 인수되었습니다. 브랜딩과 마케팅의 교과서 사례.',
          contributor: '0xfounder10...anon',
          createdAt: '2025-10-25',
          citationCount: 44
        },
        {
          id: 'startup-11',
          label: '쿠팡 성공 사례',
          content: '쿠팡은 소셜커머스에서 e커머스로 피벗한 케이스입니다. 로켓배송이라는 풀필먼트 혁신으로 차별화. 2021년 NYSE 상장, 현재 매출 30조원 이상의 기업이 되었습니다.',
          contributor: '0xfounder11...anon',
          createdAt: '2025-11-01',
          citationCount: 41
        },
        {
          id: 'startup-12',
          label: '채용 전략',
          content: '초기 스타트업은 10번째 직원까지 창업자가 직접 뽑아야 합니다. 문화 적합성이 스킬보다 중요합니다. 첫 엔지니어 채용 시 "왜 대기업 대신 우리인가"에 답할 수 있어야 합니다.',
          contributor: '0xfounder12...anon',
          createdAt: '2025-11-05',
          citationCount: 33
        },
        {
          id: 'startup-13',
          label: '지분 배분',
          content: '공동창업자 지분은 기여도에 따라 배분합니다. CEO 40-50%, CTO 20-30%, 나머지 공동창업자 10-20%가 일반적. 4년 베스팅, 1년 클리프 조건을 걸어두세요.',
          contributor: '0xfounder13...anon',
          createdAt: '2025-11-10',
          citationCount: 36
        },
        {
          id: 'startup-14',
          label: 'IR 피칭 기술',
          content: '3분 엘리베이터 피치를 완성하세요. 문제-솔루션-시장-팀-요청 순서로 구성합니다. 데모 영상은 2분 이내, 실제 사용 화면을 보여주세요. 숫자로 말하고 스토리로 감동시키세요.',
          contributor: '0xfounder14...anon',
          createdAt: '2025-11-15',
          citationCount: 30
        },
        {
          id: 'startup-15',
          label: '유닛이코노믹스',
          content: 'LTV(고객 생애 가치)가 CAC(고객 획득 비용)의 3배 이상이어야 건강한 비즈니스입니다. LTV/CAC 비율과 CAC 회수 기간(12개월 이내 권장)을 투자자에게 명확히 제시하세요.',
          contributor: '0xfounder15...anon',
          createdAt: '2025-11-20',
          citationCount: 34
        },
        {
          id: 'startup-16',
          label: '정부 지원사업',
          content: '창업진흥원, 중소벤처기업부의 지원사업을 활용하세요. 예비창업패키지(최대 1억), 초기창업패키지(최대 1억)가 대표적. K-Startup 사이트에서 공고를 확인할 수 있습니다.',
          contributor: '0xfounder16...anon',
          createdAt: '2025-11-25',
          citationCount: 25
        },
        {
          id: 'startup-17',
          label: '법인 설립',
          content: '스타트업은 주식회사로 시작하세요. 자본금 1,000만원 이상 권장, 정관에 스톡옵션 조항 포함 필수. 법인 설립은 헬프미, 심플로우 같은 서비스로 1주일 내 완료 가능합니다.',
          contributor: '0xfounder17...anon',
          createdAt: '2025-12-01',
          citationCount: 22
        },
        {
          id: 'startup-18',
          label: '스톡옵션 설계',
          content: '스톡옵션 풀은 전체 지분의 10-15%로 설정합니다. 핵심 인재에게 0.5-2%, 일반 직원에게 0.05-0.2% 부여. 행사가격은 투자유치 시 주당 가격으로 정하고, 4년 베스팅이 표준.',
          contributor: '0xfounder18...anon',
          createdAt: '2025-12-05',
          citationCount: 28
        },
        {
          id: 'startup-19',
          label: '글로벌 진출 전략',
          content: '동남아 시장은 한국 스타트업의 첫 글로벌 진출지로 적합합니다. 인도네시아(인구 2.7억), 베트남(고성장) 시장을 주목하세요. 현지 파트너십 구축이 필수이며, 크로스보더 결제와 현지화가 핵심 과제입니다.',
          contributor: '0xfounder19...anon',
          createdAt: '2025-12-10',
          citationCount: 26
        },
        {
          id: 'startup-20',
          label: '그로스 해킹',
          content: 'AARRR 퍼널(Acquisition-Activation-Retention-Revenue-Referral)로 성장을 체계화하세요. 드롭오프가 가장 큰 단계를 먼저 개선합니다. 토스는 추천인 보상 시스템으로 초기 100만 유저를 확보했습니다.',
          contributor: '0xfounder20...anon',
          createdAt: '2025-12-15',
          citationCount: 37
        }
      ],
      edges: [
        { source: 'startup-1', target: 'startup-2', relationship: '다음 단계' },
        { source: 'startup-2', target: 'startup-3', relationship: '다음 단계' },
        { source: 'startup-1', target: 'startup-4', relationship: '관련됨' },
        { source: 'startup-4', target: 'startup-5', relationship: '결과' },
        { source: 'startup-3', target: 'startup-15', relationship: '근거' },
        { source: 'startup-6', target: 'startup-7', relationship: '원인' },
        { source: 'startup-8', target: 'startup-4', relationship: '예시' },
        { source: 'startup-9', target: 'startup-5', relationship: '예시' },
        { source: 'startup-10', target: 'startup-1', relationship: '예시' },
        { source: 'startup-11', target: 'startup-7', relationship: '예시' },
        { source: 'startup-12', target: 'startup-13', relationship: '관련됨' },
        { source: 'startup-13', target: 'startup-18', relationship: '관련됨' },
        { source: 'startup-2', target: 'startup-14', relationship: '관련됨' },
        { source: 'startup-3', target: 'startup-14', relationship: '관련됨' },
        { source: 'startup-16', target: 'startup-2', relationship: '반대' },
        { source: 'startup-17', target: 'startup-13', relationship: '관련됨' },
        { source: 'startup-8', target: 'startup-9', relationship: '비교' },
        { source: 'startup-9', target: 'startup-10', relationship: '비교' },
        { source: 'startup-10', target: 'startup-11', relationship: '비교' },
        { source: 'startup-5', target: 'startup-15', relationship: '관련됨' },
        { source: 'startup-19', target: 'startup-3', relationship: '다음 단계' },
        { source: 'startup-19', target: 'startup-11', relationship: '예시' },
        { source: 'startup-20', target: 'startup-5', relationship: '관련됨' },
        { source: 'startup-20', target: 'startup-4', relationship: '근거' },
        { source: 'startup-20', target: 'startup-8', relationship: '예시' }
      ]
    }
  },
  {
    id: 'crypto-expert',
    name: '크립토 전문가',
    description: '비트코인, 이더리움, DeFi에 대한 심층 분석',
    icon: 'C',
    profileImage: '/profiles/crypto-expert.png',
    category: 'Web3',
    nodeCount: 20,
    contributorCount: 9,
    graph: {
      nodes: [
        {
          id: 'crypto-1',
          label: '비트코인 기초',
          content: '비트코인은 2009년 사토시 나카모토가 만든 최초의 암호화폐입니다. 총 발행량 2,100만 개로 제한되어 있으며, 약 4년마다 반감기를 통해 신규 발행량이 절반으로 줄어듭니다.',
          contributor: '0xcrypto1...anon',
          createdAt: '2025-10-01',
          citationCount: 45
        },
        {
          id: 'crypto-2',
          label: '비트코인 반감기',
          content: '반감기(Halving)는 비트코인 채굴 보상이 절반으로 줄어드는 이벤트입니다. 2024년 4월에 4번째 반감기가 있었고, 보상이 6.25 BTC에서 3.125 BTC로 감소했습니다. 희소성 증가로 가격 상승 요인.',
          contributor: '0xcrypto2...anon',
          createdAt: '2025-10-05',
          citationCount: 38
        },
        {
          id: 'crypto-3',
          label: '이더리움 기초',
          content: '이더리움은 스마트 컨트랙트 플랫폼입니다. 비탈릭 부테린이 2015년 창시했으며, 디앱(DApp), DeFi, NFT의 기반이 됩니다. ETH는 가스비로 사용되며, 네트워크 이용료 역할을 합니다.',
          contributor: '0xcrypto3...anon',
          createdAt: '2025-10-10',
          citationCount: 42
        },
        {
          id: 'crypto-4',
          label: '이더리움 스테이킹',
          content: '이더리움 2.0 전환 후 PoS(지분증명) 방식으로 변경되었습니다. 32 ETH를 스테이킹하면 검증자가 될 수 있고, 연 4-5% 수익을 얻습니다. 리도(Lido)를 통해 소액 스테이킹도 가능.',
          contributor: '0xcrypto4...anon',
          createdAt: '2025-10-15',
          citationCount: 35
        },
        {
          id: 'crypto-5',
          label: '가스비 이해',
          content: '가스비는 이더리움 트랜잭션 수수료입니다. Gwei 단위로 측정되며, 네트워크 혼잡도에 따라 변동합니다. 가스비가 높을 때는 트랜잭션을 미루거나 레이어2를 이용하는 것이 경제적.',
          contributor: '0xcrypto5...anon',
          createdAt: '2025-10-20',
          citationCount: 28
        },
        {
          id: 'crypto-6',
          label: '레이어2 솔루션',
          content: '레이어2는 이더리움의 확장성 문제를 해결합니다. Arbitrum, Optimism, Base가 대표적. 가스비가 이더리움의 1/10 수준이고, 처리 속도도 빠릅니다. 2024년 이후 TVL이 급성장.',
          contributor: '0xcrypto6...anon',
          createdAt: '2025-10-25',
          citationCount: 33
        },
        {
          id: 'crypto-7',
          label: '솔라나 특징',
          content: '솔라나는 초당 65,000건 처리 가능한 고성능 블록체인입니다. 가스비가 $0.001 미만으로 저렴하고, NFT와 DeFi 생태계가 활발합니다. 다만 네트워크 중단 이력이 있어 안정성 이슈 존재.',
          contributor: '0xcrypto7...anon',
          createdAt: '2025-11-01',
          citationCount: 31
        },
        {
          id: 'crypto-8',
          label: 'DeFi 기초',
          content: 'DeFi(탈중앙화 금융)는 중개자 없이 금융 서비스를 이용하는 것입니다. 대출, 예치, 스왑, 파생상품 등이 가능합니다. Uniswap, Aave, Compound가 대표적인 DeFi 프로토콜입니다.',
          contributor: '0xcrypto8...anon',
          createdAt: '2025-11-05',
          citationCount: 39
        },
        {
          id: 'crypto-9',
          label: 'Uniswap V3',
          content: 'Uniswap V3는 집중 유동성(Concentrated Liquidity) 기능을 도입했습니다. LP가 가격 범위를 지정하여 자본 효율을 높일 수 있습니다. 전체 DEX 거래량의 60% 이상을 차지합니다.',
          contributor: '0xcrypto9...anon',
          createdAt: '2025-11-10',
          citationCount: 29
        },
        {
          id: 'crypto-10',
          label: 'TVL 이해',
          content: 'TVL(Total Value Locked)은 DeFi 프로토콜에 예치된 총 자산 가치입니다. 프로토콜의 인기와 신뢰도를 나타내는 핵심 지표. DeFiLlama 사이트에서 실시간 확인 가능합니다.',
          contributor: '0xcrypto10...anon',
          createdAt: '2025-11-15',
          citationCount: 26
        },
        {
          id: 'crypto-11',
          label: 'APY vs APR',
          content: 'APR은 단리, APY는 복리 수익률입니다. DeFi에서 "100% APY"는 복리 계산된 수치. 실제 수익을 계산하려면 APR로 환산하거나 복리 주기를 확인해야 합니다. 높은 APY일수록 리스크도 큼.',
          contributor: '0xcrypto11...anon',
          createdAt: '2025-11-20',
          citationCount: 24
        },
        {
          id: 'crypto-12',
          label: 'NFT 기초',
          content: 'NFT(대체불가토큰)는 고유한 디지털 자산의 소유권을 증명합니다. 이미지, 음악, 영상 등이 NFT로 발행됩니다. OpenSea, Blur가 주요 거래소이며, 2024년 이후 시장이 크게 위축되었습니다.',
          contributor: '0xcrypto12...anon',
          createdAt: '2025-11-25',
          citationCount: 21
        },
        {
          id: 'crypto-13',
          label: '메타마스크 사용법',
          content: '메타마스크는 가장 인기있는 웹3 지갑입니다. 크롬 확장 프로그램으로 설치하고, 시드 구문 12단어를 안전하게 보관하세요. 절대 시드 구문을 온라인에 입력하지 마세요. 피싱 주의.',
          contributor: '0xcrypto13...anon',
          createdAt: '2025-12-01',
          citationCount: 36
        },
        {
          id: 'crypto-14',
          label: '하드웨어 지갑',
          content: '레저(Ledger), 트레저(Trezor)가 대표적인 하드웨어 지갑입니다. 프라이빗 키가 오프라인에 저장되어 해킹에 안전합니다. $100 이상 보유 시 하드웨어 지갑 사용을 권장합니다.',
          contributor: '0xcrypto14...anon',
          createdAt: '2025-12-05',
          citationCount: 32
        },
        {
          id: 'crypto-15',
          label: '에어드랍 전략',
          content: '에어드랍은 프로토콜이 초기 사용자에게 토큰을 무료 배포하는 것입니다. 테스트넷 참여, 프로토콜 사용 기록을 쌓으면 에어드랍 대상이 될 수 있습니다. Arbitrum, Optimism이 대표적 성공 사례.',
          contributor: '0xcrypto15...anon',
          createdAt: '2025-12-10',
          citationCount: 43
        },
        {
          id: 'crypto-16',
          label: '스캠 구별법',
          content: '크립토 스캠을 피하려면: 1) 팀이 익명이면 주의 2) 보장된 수익 약속은 100% 스캠 3) 컨트랙트 감사(Audit) 여부 확인 4) 급하게 결정하라고 하면 의심. DYOR(Do Your Own Research) 필수.',
          contributor: '0xcrypto16...anon',
          createdAt: '2025-12-15',
          citationCount: 47
        },
        {
          id: 'crypto-17',
          label: '세금 처리',
          content: '한국에서 2025년부터 가상자산 소득세가 시행됩니다. 연 250만원 초과 수익에 대해 22% 과세. 거래소에서 거래 내역을 다운로드하고, 코인리(Koinly) 같은 서비스로 세금 계산 가능.',
          contributor: '0xcrypto17...anon',
          createdAt: '2025-12-20',
          citationCount: 34
        },
        {
          id: 'crypto-18',
          label: 'CEX vs DEX',
          content: 'CEX(중앙화 거래소)는 업비트, 빗썸처럼 회사가 운영합니다. DEX(탈중앙화 거래소)는 Uniswap처럼 스마트 컨트랙트로 운영. CEX는 편리하지만 해킹 위험, DEX는 자산 통제권이 있지만 복잡합니다.',
          contributor: '0xcrypto18...anon',
          createdAt: '2025-12-25',
          citationCount: 27
        }
      ],
      edges: [
        { source: 'crypto-1', target: 'crypto-2', relationship: '관련됨' },
        { source: 'crypto-3', target: 'crypto-4', relationship: '관련됨' },
        { source: 'crypto-3', target: 'crypto-5', relationship: '포함' },
        { source: 'crypto-5', target: 'crypto-6', relationship: '결과' },
        { source: 'crypto-3', target: 'crypto-7', relationship: '비교' },
        { source: 'crypto-8', target: 'crypto-9', relationship: '예시' },
        { source: 'crypto-8', target: 'crypto-10', relationship: '포함' },
        { source: 'crypto-8', target: 'crypto-11', relationship: '포함' },
        { source: 'crypto-9', target: 'crypto-10', relationship: '관련됨' },
        { source: 'crypto-3', target: 'crypto-12', relationship: '관련됨' },
        { source: 'crypto-13', target: 'crypto-14', relationship: '비교' },
        { source: 'crypto-13', target: 'crypto-8', relationship: '관련됨' },
        { source: 'crypto-15', target: 'crypto-6', relationship: '예시' },
        { source: 'crypto-16', target: 'crypto-13', relationship: '관련됨' },
        { source: 'crypto-17', target: 'crypto-18', relationship: '관련됨' },
        { source: 'crypto-18', target: 'crypto-9', relationship: '예시' },
        { source: 'crypto-1', target: 'crypto-3', relationship: '비교' },
        { source: 'crypto-4', target: 'crypto-11', relationship: '관련됨' },
        { source: 'crypto-6', target: 'crypto-7', relationship: '비교' }
      ]
    }
  },
  {
    id: 'kpop-insider',
    name: 'K-POP 인사이더',
    description: 'K-POP 아이돌, 음원차트, 팬덤 문화 전문가',
    icon: 'P',
    profileImage: '/profiles/kpop-insider.png',
    category: '엔터테인먼트',
    nodeCount: 18,
    contributorCount: 11,
    graph: {
      nodes: [
        {
          id: 'kpop-1',
          label: 'BTS 소개',
          content: 'BTS(방탄소년단)는 2013년 빅히트에서 데뷔한 7인조 보이그룹입니다. RM, 진, 슈가, 제이홉, 지민, 뷔, 정국으로 구성. 빌보드 핫100 1위, 그래미 노미네이트 등 K-POP 역사를 새로 썼습니다.',
          contributor: '0xkpop1...anon',
          createdAt: '2025-10-01',
          citationCount: 50
        },
        {
          id: 'kpop-2',
          label: 'BLACKPINK 소개',
          content: 'BLACKPINK는 2016년 YG에서 데뷔한 4인조 걸그룹입니다. 지수, 제니, 로제, 리사로 구성. 코첼라 헤드라이너, 유튜브 구독자 9,000만 이상. "Pink Venom", "Kill This Love"가 대표곡.',
          contributor: '0xkpop2...anon',
          createdAt: '2025-10-05',
          citationCount: 47
        },
        {
          id: 'kpop-3',
          label: 'NewJeans 소개',
          content: 'NewJeans는 2022년 어도어에서 데뷔한 5인조 걸그룹입니다. 민지, 하니, 다니엘, 해린, 혜인으로 구성. Y2K 컨셉과 독특한 바이럴 마케팅으로 데뷔와 동시에 대중적 인기를 얻었습니다.',
          contributor: '0xkpop3...anon',
          createdAt: '2025-10-10',
          citationCount: 43
        },
        {
          id: 'kpop-4',
          label: 'aespa 소개',
          content: 'aespa는 2020년 SM에서 데뷔한 4인조 걸그룹입니다. 카리나, 지젤, 윈터, 닝닝으로 구성. 메타버스 컨셉의 "ae" 아바타가 특징. "Next Level", "Supernova"가 대표곡으로 독특한 세계관이 강점.',
          contributor: '0xkpop4...anon',
          createdAt: '2025-10-15',
          citationCount: 39
        },
        {
          id: 'kpop-5',
          label: '멜론 차트 공략',
          content: '멜론은 한국 최대 음원 플랫폼입니다. TOP100 차트는 실시간 스트리밍 60% + 다운로드 40%로 계산. 컴백 첫 날 0시-2시 집중 스트리밍이 "차트인"에 중요합니다. 이용권 종류에 따라 가중치 다름.',
          contributor: '0xkpop5...anon',
          createdAt: '2025-10-20',
          citationCount: 35
        },
        {
          id: 'kpop-6',
          label: '빌보드 차트 공략',
          content: '빌보드 핫100은 스트리밍 50% + 라디오 30% + 판매 20%로 계산합니다. 미국 스트리밍 플랫폼(스포티파이, 애플뮤직)에서의 재생수가 핵심. 한국 팬들이 미국 VPN으로 스트리밍하기도.',
          contributor: '0xkpop6...anon',
          createdAt: '2025-10-25',
          citationCount: 32
        },
        {
          id: 'kpop-7',
          label: '팬덤 문화',
          content: 'K-POP 팬덤은 체계적인 조직력이 특징입니다. 총공(조직적 스트리밍), 광고 서포트, 앨범 대량구매 등을 진행합니다. 팬클럽 가입비, 콘서트, MD 구매로 아티스트를 지원하는 문화가 발달.',
          contributor: '0xkpop7...anon',
          createdAt: '2025-11-01',
          citationCount: 38
        },
        {
          id: 'kpop-8',
          label: '컴백 일정 추적',
          content: '컴백은 신곡 발표를 의미합니다. 보통 티저 2주 전 공개, 하이라이트 메들리 1주 전, 뮤비 0시 공개 순서. 네이버 스타차트, 위버스에서 공식 일정을 확인하세요.',
          contributor: '0xkpop8...anon',
          createdAt: '2025-11-05',
          citationCount: 29
        },
        {
          id: 'kpop-9',
          label: '뮤비 조회수 경쟁',
          content: '24시간 뮤비 조회수는 K-POP의 주요 기록입니다. BTS "Butter"가 1억 800만으로 역대 1위. 팬들은 컴백 당일 집중 스트리밍으로 기록을 세웁니다. 유튜브 프리미엄 계정이 카운트에 유리.',
          contributor: '0xkpop9...anon',
          createdAt: '2025-11-10',
          citationCount: 33
        },
        {
          id: 'kpop-10',
          label: '월드투어 티켓팅',
          content: 'K-POP 월드투어 티켓은 예스24, 인터파크에서 예매합니다. 팬클럽 선예매 후 일반 예매 순서. 서버 대기열이 길어 대기 번호 받는 것이 핵심. 매크로 사용은 금지이며 적발 시 예매 취소.',
          contributor: '0xkpop10...anon',
          createdAt: '2025-11-15',
          citationCount: 41
        },
        {
          id: 'kpop-11',
          label: 'HYBE 레이블',
          content: 'HYBE는 방시혁이 설립한 K-POP 최대 기획사입니다. 빅히트(BTS), 플레디스(세븐틴), 어도어(NewJeans), KOZ(지코) 등 산하 레이블 보유. 위버스 플랫폼으로 팬 커뮤니티도 운영.',
          contributor: '0xkpop11...anon',
          createdAt: '2025-11-20',
          citationCount: 36
        },
        {
          id: 'kpop-12',
          label: 'SM 엔터테인먼트',
          content: 'SM은 이수만이 설립한 K-POP 명가입니다. EXO, NCT, aespa, Red Velvet 소속. "SMP(SM Music Performance)"라는 독특한 음악 스타일과 칼군무가 특징. 2023년 경영권 분쟁 이슈.',
          contributor: '0xkpop12...anon',
          createdAt: '2025-11-25',
          citationCount: 31
        },
        {
          id: 'kpop-13',
          label: 'YG 엔터테인먼트',
          content: 'YG는 양현석이 설립한 기획사입니다. BLACKPINK, TREASURE, WINNER 소속. 힙합 기반의 음악과 개성있는 스타일이 특징. 데뷔까지 오래 걸리지만 완성도 높은 아티스트를 배출합니다.',
          contributor: '0xkpop13...anon',
          createdAt: '2025-12-01',
          citationCount: 28
        },
        {
          id: 'kpop-14',
          label: 'JYP 엔터테인먼트',
          content: 'JYP는 박진영이 설립한 기획사입니다. TWICE, Stray Kids, ITZY, NiziU 소속. 친근한 이미지와 대중적인 음악이 강점. 일본 시장 공략에 특히 성공적.',
          contributor: '0xkpop14...anon',
          createdAt: '2025-12-05',
          citationCount: 30
        },
        {
          id: 'kpop-15',
          label: '음악방송 1위',
          content: '인기가요, 뮤직뱅크, 엠카, 쇼챔, 더쇼가 주요 음악방송입니다. 음원 + 앨범 + SNS + 사전투표 + 방청투표 등이 합산. 1위 트로피는 팬덤의 영예이며, 앵콜 무대에서 생방으로 실력을 확인.',
          contributor: '0xkpop15...anon',
          createdAt: '2025-12-10',
          citationCount: 34
        },
        {
          id: 'kpop-16',
          label: '포토카드 문화',
          content: '포토카드(포카)는 앨범에 랜덤 포함된 멤버별 카드입니다. 최애 멤버 포카를 위해 앨범을 여러 장 사거나 교환합니다. 레어 포카는 수십만원에 거래되기도. 트위터, 번개장터에서 교환 활발.',
          contributor: '0xkpop16...anon',
          createdAt: '2025-12-15',
          citationCount: 37
        },
        {
          id: 'kpop-17',
          label: '위버스 활용',
          content: '위버스는 HYBE의 팬 플랫폼이지만 타사 아티스트도 입점. 실시간 소통, 독점 콘텐츠, 라이브 방송, 공식 MD 구매가 가능합니다. 글로벌 팬들과 번역 기능으로 소통할 수 있어 인기.',
          contributor: '0xkpop17...anon',
          createdAt: '2025-12-20',
          citationCount: 26
        },
        {
          id: 'kpop-18',
          label: '아이돌 데뷔 과정',
          content: '연습생 기간은 평균 3-5년입니다. 보컬, 댄스, 랩, 연기, 외국어를 훈련. 월말 평가로 탈락 가능성 있음. 서바이벌 프로그램(프듀, 아이랜드)으로 데뷔하는 경우도 많습니다. 경쟁률 수백 대 1.',
          contributor: '0xkpop18...anon',
          createdAt: '2025-12-25',
          citationCount: 40
        }
      ],
      edges: [
        { source: 'kpop-1', target: 'kpop-11', relationship: '포함' },
        { source: 'kpop-2', target: 'kpop-13', relationship: '포함' },
        { source: 'kpop-3', target: 'kpop-11', relationship: '포함' },
        { source: 'kpop-4', target: 'kpop-12', relationship: '포함' },
        { source: 'kpop-5', target: 'kpop-6', relationship: '비교' },
        { source: 'kpop-7', target: 'kpop-5', relationship: '관련됨' },
        { source: 'kpop-7', target: 'kpop-9', relationship: '관련됨' },
        { source: 'kpop-8', target: 'kpop-9', relationship: '관련됨' },
        { source: 'kpop-10', target: 'kpop-7', relationship: '관련됨' },
        { source: 'kpop-11', target: 'kpop-12', relationship: '비교' },
        { source: 'kpop-12', target: 'kpop-13', relationship: '비교' },
        { source: 'kpop-13', target: 'kpop-14', relationship: '비교' },
        { source: 'kpop-15', target: 'kpop-5', relationship: '관련됨' },
        { source: 'kpop-16', target: 'kpop-7', relationship: '포함' },
        { source: 'kpop-17', target: 'kpop-11', relationship: '관련됨' },
        { source: 'kpop-18', target: 'kpop-11', relationship: '관련됨' },
        { source: 'kpop-18', target: 'kpop-12', relationship: '관련됨' },
        { source: 'kpop-1', target: 'kpop-2', relationship: '비교' },
        { source: 'kpop-3', target: 'kpop-4', relationship: '비교' }
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

/**
 * Legacy contribution calculation - equal distribution
 * @deprecated Use calculateDetailedContribution for proportional distribution
 */
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

/**
 * Calculate detailed contribution with relevance-based proportional distribution
 * Distributes rewards based on each node's relevance score rather than equal distribution
 *
 * @param nodeDetails - Array of node details with relevance scores
 * @param nodes - All knowledge nodes for contributor lookup
 * @param totalWLD - Total WLD amount to distribute (default: 0.001)
 * @returns Array of detailed contributions with proportional percentages and estimated WLD
 */
export const calculateDetailedContribution = (
  nodeDetails: NodeDetail[],
  nodes: KnowledgeNode[],
  totalWLD: number = 0.001
): DetailedContribution[] => {
  if (nodeDetails.length === 0) {
    return []
  }

  // Calculate total relevance score for proportional distribution
  const totalRelevanceScore = nodeDetails.reduce(
    (sum, detail) => sum + detail.relevanceScore,
    0
  )

  // Handle edge case where all scores are 0
  if (totalRelevanceScore === 0) {
    // Fall back to equal distribution
    const equalPercentage = Math.round(100 / nodeDetails.length)
    const equalWLD = totalWLD / nodeDetails.length

    return nodeDetails.map(detail => {
      const node = nodes.find(n => n.id === detail.nodeId)
      return {
        nodeId: detail.nodeId,
        nodeLabel: detail.label,
        contributor: node?.contributor || 'unknown',
        percentage: equalPercentage,
        relevanceScore: detail.relevanceScore,
        matchedTerms: detail.matchedTerms,
        estimatedWLD: equalWLD
      }
    })
  }

  // Calculate proportional distribution based on relevance scores
  return nodeDetails.map(detail => {
    const node = nodes.find(n => n.id === detail.nodeId)
    const proportion = detail.relevanceScore / totalRelevanceScore
    const percentage = Math.round(proportion * 100)
    const estimatedWLD = proportion * totalWLD

    return {
      nodeId: detail.nodeId,
      nodeLabel: detail.label,
      contributor: node?.contributor || 'unknown',
      percentage,
      relevanceScore: detail.relevanceScore,
      matchedTerms: detail.matchedTerms,
      estimatedWLD
    }
  })
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

// Re-export AnswerResult type from types.ts for backward compatibility
export type { AnswerResult } from './types'

export const generateMockAnswer = (question: string, bot: ExpertBot): AnswerResult => {
  const questionTokens = tokenize(question)
  const nodes = bot.graph.nodes

  // Pre-tokenize all nodes for IDF calculation
  const allNodeTokens = nodes.map(n => [
    ...tokenize(n.label),
    ...tokenize(n.content)
  ])

  // Score all nodes with relevance calculation
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
      matchedTerms: [],
      nodeDetails: []
    }
  }

  // Take top 3 relevant nodes
  const topRelevantNodes = relevantNodes.slice(0, 3)
  const usedNodes = topRelevantNodes.map(rn => rn.node)

  // Build nodeDetails array with relevance scores and matched terms
  const nodeDetails: NodeDetail[] = topRelevantNodes.map(rn => ({
    nodeId: rn.node.id,
    label: rn.node.label,
    relevanceScore: rn.score,
    matchedTerms: rn.matchedTerms
  }))

  // Format answer with relevance indication
  const answerParts = usedNodes.map((node, idx) => {
    const relevanceLabel = idx === 0 ? '[가장 관련성 높음]' : ''
    return `${relevanceLabel}\n${node.content}`
  })

  return {
    answer: answerParts.join('\n\n').trim(),
    usedNodes: usedNodes.map(n => n.id),
    confidence,
    matchedTerms: allMatchedTerms,
    nodeDetails
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
