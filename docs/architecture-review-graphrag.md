# Seed Vault GraphRAG 시스템 아키텍처 검토 보고서

**작성일**: 2026-02-06
**검토자**: System Architecture Designer
**버전**: 1.0

---

## 1. 개요

### 1.1 검토 목적
Seed Vault MVP의 GraphRAG 시스템이 핵심 가치인 "기여도 측정 → 보상 환원" 흐름을 일관성 있게 구현하고 있는지 분석하고, 해커톤 데모 및 실제 GraphRAG 전환을 위한 개선 방향을 제시합니다.

### 1.2 검토 범위
- `/src/lib/types.ts` - 데이터 타입 정의
- `/src/lib/mock-data.ts` - Mock 데이터 및 검색 로직
- `/src/lib/api.ts` - Supabase API 레이어
- `/src/lib/database.types.ts` - 데이터베이스 스키마
- `/src/stores/citationStore.ts` - 인용 추적 상태 관리
- `/src/stores/knowledgeStore.ts` - 지식 노드 상태 관리
- `/src/stores/userStore.ts` - 사용자/보상 상태 관리
- `/src/components/ContributionReceipt.tsx` - 기여 영수증 UI

---

## 2. 현재 아키텍처 분석

### 2.1 데이터 흐름 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Seed Vault GraphRAG Flow                        │
└─────────────────────────────────────────────────────────────────────────────┘

[사용자 질문]
     │
     ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  mock-data.ts   │     │  knowledgeStore │     │     api.ts      │
│  tokenize()     │◄────│  userContrib    │◄────│  Supabase DB    │
│  TF-IDF 검색    │     │  userEdges      │     │  knowledge_nodes│
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        generateMockAnswer()                                  │
│  - calculateRelevance() per node                                            │
│  - Sort by score                                                            │
│  - Return top 3 nodes + confidence                                          │
│  - Output: { answer, usedNodes[], confidence, matchedTerms[] }              │
└────────┬────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ citationStore   │────►│    api.ts       │────►│    users.       │
│ recordCitation()│     │ recordCitations │     │ pending_wld += │
│ citations[id]++ │     │ (DB 기록)       │     │ 0.001           │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ContributionReceipt 컴포넌트                            │
│  - calculateContribution(usedNodeIds, nodes)                                │
│  - percentage = 100 / usedNodes.length (균등 배분)                           │
│  - 기여자 표시: contributor hash (truncated)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 핵심 컴포넌트 분석

#### A. 지식 그래프 구조 (`types.ts`)

```typescript
// 현재 구현
interface KnowledgeNode {
  id: string
  label: string
  content: string
  contributor: string      // nullifier_hash (anonymous)
  createdAt: string
  citationCount: number
}

interface KnowledgeEdge {
  source: string
  target: string
  relationship: string
}
```

**문제점**:
1. `embedding` 필드가 types.ts에 없음 (database.types.ts에만 존재)
2. 노드 품질/신뢰도 메트릭 부재
3. 버전 관리 없음
4. 엣지 가중치(`weight`)가 types.ts에 노출되지 않음

#### B. 검색 로직 (`mock-data.ts`)

```typescript
// TF-IDF 기반 검색 (현재)
function calculateRelevance(questionTokens, node, allNodeTokens): number {
  // Label match: 3x weight
  // Content match: 1x weight
  // Citation bonus: log(citationCount + 1) * 0.1
  // Coverage bonus: (1 + coverage * 0.5)
}
```

**문제점**:
1. 순수 키워드 매칭 - 의미적 유사성 없음
2. 그래프 구조(엣지) 활용하지 않음
3. 한국어 형태소 분석 미흡 (단순 음절 bigram)

#### C. 기여도 계산 (`mock-data.ts`)

```typescript
// 현재 구현 - 균등 배분
export const calculateContribution = (usedNodeIds, nodes): ContributionReceipt[] => {
  const total = usedNodeIds.length
  return usedNodeIds.map(id => ({
    nodeId: id,
    contributor: nodes.find(n => n.id === id)?.contributor || 'unknown',
    percentage: Math.round(100 / total)  // 단순 균등 분배
  }))
}
```

**문제점**:
1. 관련성 점수(score)를 기여도에 반영하지 않음
2. 노드 간 중복 콘텐츠 고려 없음
3. 엣지를 통한 간접 기여 미반영

#### D. 보상 로직 (`api.ts`, `userStore.ts`)

```typescript
// 인용 시 보상 (api.ts)
pending_wld: Number(user.pending_wld) + 0.001  // 인용당 0.001 WLD

// 기여 시 보상 (userStore.ts)
contributionPower: Math.min(state.rewards.contributionPower + 5, 100)
```

**문제점**:
1. 보상 공식이 하드코딩됨 (0.001 WLD/citation)
2. 기여도 비율에 따른 차등 보상 없음
3. 시간 가중치(decay) 없음

---

## 3. 핵심 질문에 대한 분석

### 3.1 "기여도 측정 → 보상 환원" 연결성

**현재 상태**: 부분적 연결

```
[기여] ──┬── knowledgeStore.addNode() ──► 노드 저장
         │
         └── userStore.addContribution() ──► contribution_power += 5
                                               (보상과 직접 연결 X)

[인용] ──┬── citationStore.recordCitation() ──► 로컬 카운트++
         │
         └── api.recordCitations() ──► citation_count++
                                   ──► pending_wld += 0.001
```

**끊어진 연결**:
1. `contribution_power`가 실제 보상과 무관
2. `calculateContribution()`의 percentage가 보상 계산에 사용되지 않음
3. 영수증에 표시된 기여도가 실제 WLD 배분과 일치하지 않음

### 3.2 실제 GraphRAG 전환 시 필요한 인터페이스

```typescript
// 필요한 인터페이스 정의

interface GraphRAGService {
  // 임베딩 기반 검색
  semanticSearch(query: string, options: SearchOptions): Promise<SearchResult[]>

  // 그래프 탐색
  traverseGraph(startNodeIds: string[], depth: number): Promise<GraphContext>

  // 컨텍스트 집계
  aggregateContext(nodes: KnowledgeNode[], query: string): Promise<AggregatedContext>
}

interface SearchOptions {
  topK: number
  threshold: number
  includeEdges: boolean
  maxHops: number
}

interface SearchResult {
  node: KnowledgeNode
  score: number           // 0-1 정규화
  matchType: 'semantic' | 'keyword' | 'graph'
  pathFromQuery?: string[]  // 그래프 경로
}

interface AggregatedContext {
  primaryNodes: SearchResult[]
  supportingNodes: SearchResult[]
  totalScore: number
  contributionBreakdown: ContributionBreakdown[]
}

interface ContributionBreakdown {
  nodeId: string
  contributor: string
  score: number
  percentage: number      // 정규화된 기여도
  wldAmount: number       // 예상 보상액
}
```

### 3.3 인용 추적 → 기여도 계산 → WLD 보상 투명성

**현재 투명성 수준**: 낮음

| 단계 | 현재 구현 | 투명성 |
|------|----------|--------|
| 인용 추적 | `citationStore.recordCitation()` | O - 어떤 노드가 사용됐는지 보임 |
| 기여도 계산 | `100 / usedNodes.length` | X - 관련성 무시, 단순 균등분배 |
| WLD 배분 | `0.001 * citationCount` | X - 기여도와 무관, 인용 횟수만 반영 |

**필요한 투명성 레이어**:
```typescript
interface TransparentRewardCalculation {
  // 입력
  questionId: string
  usedNodes: string[]

  // 계산 과정
  relevanceScores: Map<string, number>
  normalizedContributions: Map<string, number>

  // 결과
  rewardDistribution: {
    nodeId: string
    contributorId: string
    percentage: number
    wldAmount: number
    calculationProof: string  // 계산 과정 해시
  }[]

  // 검증
  totalPercentage: 100
  totalWLD: number
  timestamp: string
}
```

### 3.4 해커톤 데모용 "진짜 GraphRAG" 효과

**현재 부족한 요소**:
1. **그래프 시각화에서 검색 경로 표시 안됨**
2. **노드 간 관계가 답변 생성에 활용되지 않음**
3. **신뢰도/품질 지표 없음**

**데모 효과를 위한 필수 데이터**:
```typescript
interface DemoGraphRAGResponse {
  // 기본 답변
  answer: string

  // 그래프 시각화용
  traversalPath: {
    nodes: string[]
    edges: { from: string; to: string; label: string }[]
    highlightedNodes: string[]
  }

  // 신뢰도 표시
  confidence: {
    overall: number
    breakdown: {
      sourceQuality: number
      relevance: number
      coverage: number
    }
  }

  // 실시간 기여 추적
  liveContributions: {
    nodeId: string
    contributor: string
    citationCount: number
    recentCitation: boolean  // 애니메이션용
  }[]
}
```

---

## 4. 개선 제안

### 4.1 데이터 모델 개선안

#### A. KnowledgeNode 확장

```typescript
interface EnhancedKnowledgeNode {
  // 기존 필드
  id: string
  label: string
  content: string
  contributor: string
  createdAt: string
  citationCount: number

  // 추가 필드
  embedding: number[]           // 벡터 임베딩 (1536차원)
  qualityScore: number          // 0-100, 커뮤니티 평가
  trustScore: number            // 0-100, 기여자 신뢰도 기반
  version: number               // 수정 버전
  parentNodeId?: string         // 원본 노드 (수정 시)
  tags: string[]                // 분류 태그
  metadata: {
    sourceType: 'user' | 'verified' | 'official'
    language: string
    lastVerifiedAt?: string
  }
}
```

#### B. ContributionReceipt 확장

```typescript
interface EnhancedContributionReceipt {
  nodeId: string
  contributor: string

  // 기여도 상세
  relevanceScore: number        // 0-1, 질문과의 관련성
  contentWeight: number         // 0-1, 답변 내 비중
  qualityMultiplier: number     // 0.5-2.0, 노드 품질 반영

  // 계산된 기여도
  rawPercentage: number
  adjustedPercentage: number    // 품질 가중치 적용 후

  // 보상 정보
  estimatedWLD: number
  calculationMethod: string     // 'proportional' | 'equal' | 'weighted'
}
```

#### C. Citation 이벤트 확장

```typescript
interface EnhancedCitation {
  id: string
  nodeId: string
  sessionId: string
  questionHash: string          // 질문 익명화 해시
  citedAt: string

  // 컨텍스트
  relevanceScore: number        // 이 인용의 관련성
  position: 'primary' | 'supporting' | 'reference'

  // 보상 추적
  rewardAllocated: number       // 이 인용으로 배분된 WLD
  rewardClaimed: boolean
  rewardClaimedAt?: string
  transactionHash?: string      // 온체인 증명
}
```

### 4.2 상태 관리 흐름 개선안

#### A. 통합 GraphRAG Store

```typescript
// stores/graphRAGStore.ts
interface GraphRAGState {
  // 검색 상태
  currentQuery: string | null
  searchResults: SearchResult[]
  traversalPath: TraversalPath | null

  // 기여 추적 (세션별)
  sessionContributions: Map<string, ContributionBreakdown[]>

  // 실시간 업데이트
  realtimeCitations: CitationEvent[]
  pendingRewards: PendingReward[]

  // 액션
  search: (query: string, botId: string) => Promise<GraphRAGResponse>
  recordContributions: (breakdown: ContributionBreakdown[]) => void
  calculateRewards: () => RewardSummary
}
```

#### B. 보상 계산 파이프라인

```
[질문 입력]
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. 의미 검색 (Semantic Search)                                  │
│     - 질문 임베딩 생성                                           │
│     - 코사인 유사도 계산                                         │
│     - Top-K 노드 선택                                            │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. 그래프 확장 (Graph Expansion)                                │
│     - 선택된 노드의 인접 노드 탐색                               │
│     - 엣지 가중치 기반 필터링                                    │
│     - 서브그래프 구성                                            │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. 기여도 계산 (Contribution Calculation)                       │
│     - 각 노드의 관련성 점수 정규화                               │
│     - 품질/신뢰도 가중치 적용                                    │
│     - 비례 배분 계산                                             │
│     - 결과: ContributionBreakdown[]                              │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. 보상 배분 (Reward Distribution)                              │
│     - 세션 보상 풀 계산 (기본: 0.01 WLD/query)                   │
│     - 기여도 비율에 따라 배분                                    │
│     - pending_wld 업데이트                                       │
│     - user_rewards 테이블에 상세 기록                            │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. 영수증 생성 (Receipt Generation)                             │
│     - 모든 계산 과정 직렬화                                      │
│     - 검증 가능한 해시 생성                                      │
│     - UI 렌더링                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 UI에 노출해야 할 핵심 데이터 포인트

#### A. 답변 화면

| 데이터 | 현재 | 추가 필요 |
|--------|------|----------|
| 답변 텍스트 | O | - |
| 사용된 노드 ID | O | - |
| 신뢰도 점수 | O (confidence) | 세부 breakdown |
| 기여자 목록 | O | 관련성 점수 |
| 기여 비율 | O (균등) | **가중치 적용 비율** |
| 예상 보상액 | X | **각 기여자별 WLD** |
| 그래프 경로 | X | **탐색 시각화** |

#### B. 보상 페이지

| 데이터 | 현재 | 추가 필요 |
|--------|------|----------|
| 총 인용 횟수 | O | - |
| 대기 중 WLD | O | - |
| 기여한 노드 수 | O | - |
| 기여별 인용 | X | **노드별 인용 통계** |
| 보상 히스토리 | X | **일별/주별 추이** |
| 노드별 수익 | X | **어떤 노드가 얼마 벌었나** |
| Claim 트랜잭션 | X | **온체인 증명 링크** |

#### C. 그래프 시각화

| 데이터 | 현재 | 추가 필요 |
|--------|------|----------|
| 노드 기본 정보 | O | - |
| 엣지 관계 | O | - |
| 인용 횟수 | O | - |
| 최근 인용 애니메이션 | O | - |
| 검색 하이라이트 | X | **사용된 노드 강조** |
| 탐색 경로 | X | **그래프 탐색 시각화** |
| 노드 품질 표시 | X | **신뢰도 뱃지** |
| 실시간 보상 흐름 | X | **WLD 플로우 애니메이션** |

### 4.4 영수증에 포함되어야 할 정보 목록

#### A. 현재 ContributionReceipt

```typescript
// 현재 (최소한의 정보)
{
  nodeId: string
  contributor: string   // 익명화 해시
  percentage: number    // 균등 배분
}
```

#### B. 개선된 TransactionReceipt

```typescript
interface TransactionReceipt {
  // === 헤더 ===
  receiptId: string              // 고유 영수증 ID
  timestamp: string              // ISO 8601
  sessionId: string              // 질문 세션

  // === 질문 정보 (익명화) ===
  questionHash: string           // 질문 해시 (프라이버시)
  botId: string
  botName: string

  // === 검색 결과 ===
  searchMetrics: {
    totalNodesSearched: number
    nodesMatched: number
    averageRelevance: number
    searchLatencyMs: number
  }

  // === 기여 상세 ===
  contributions: {
    rank: number                 // 1, 2, 3...
    nodeId: string
    nodeLabel: string            // 노드 제목
    contributor: string          // 0x1a2b...anon

    // 점수 breakdown
    relevanceScore: number       // 0-1
    qualityScore: number         // 0-1
    trustScore: number           // 0-1
    combinedScore: number        // 가중 합계

    // 기여도
    rawPercentage: number        // 단순 비율
    adjustedPercentage: number   // 가중치 적용

    // 보상
    wldAllocated: number         // 배분된 WLD
    wldRate: string              // "0.001 WLD/citation"
  }[]

  // === 보상 요약 ===
  rewardSummary: {
    totalWLD: number             // 이 질문에 배분된 총 WLD
    rewardPool: string           // "base" | "bonus"
    formula: string              // "score_i / sum(scores) * pool"
  }

  // === 검증 정보 ===
  verification: {
    calculationHash: string      // 계산 과정 해시
    merkleRoot?: string          // 머클 루트 (배치 증명용)
    verifiableAt: string         // 검증 URL
  }

  // === 메타데이터 ===
  metadata: {
    version: string              // 영수증 포맷 버전
    generatedBy: string          // "seed-vault-v1"
  }
}
```

#### C. 영수증 UI 레이아웃 제안

```
┌─────────────────────────────────────────────────────────────┐
│  기여 영수증                                    #RCP-20260206-001 │
│  ─────────────────────────────────────────────────────────  │
│  2026-02-06 14:32:15 KST                                    │
│  Bot: World Coin 전문가                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  검색 결과: 18개 노드 중 3개 사용                              │
│  평균 관련성: 87%                                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  #1  "World ID란?"                                          │
│      0x1a2b...anon                                          │
│      ├─ 관련성: 95%  품질: 88%  신뢰도: 92%                   │
│      ├─ 기여도: 52% (조정 후)                                │
│      └─ 보상: 0.0052 WLD                                    │
│                                                             │
│  #2  "Orb 인증 과정"                                         │
│      0x3c4d...anon                                          │
│      ├─ 관련성: 78%  품질: 85%  신뢰도: 90%                   │
│      ├─ 기여도: 31% (조정 후)                                │
│      └─ 보상: 0.0031 WLD                                    │
│                                                             │
│  #3  "WLD 토큰 유틸리티"                                      │
│      0x5e6f...anon                                          │
│      ├─ 관련성: 62%  품질: 82%  신뢰도: 88%                   │
│      ├─ 기여도: 17% (조정 후)                                │
│      └─ 보상: 0.0017 WLD                                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  총 보상: 0.0100 WLD                                        │
│  계산식: relevance × quality × trust / total × pool         │
├─────────────────────────────────────────────────────────────┤
│  검증: sha256:7f3a...d91c                                   │
│  [검증하기] [공유하기]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 구현 우선순위 (해커톤 데모 기준)

### 5.1 Phase 1: 필수 (데모 임팩트)

| 항목 | 설명 | 예상 공수 |
|------|------|----------|
| 가중 기여도 계산 | relevanceScore 기반 비례 배분 | 2h |
| 영수증 UI 개선 | 점수 breakdown, 예상 WLD 표시 | 3h |
| 그래프 하이라이트 | 사용된 노드 강조 애니메이션 | 2h |
| 실시간 인용 표시 | 답변 시 노드 pulse 효과 | 1h |

### 5.2 Phase 2: 권장 (완성도)

| 항목 | 설명 | 예상 공수 |
|------|------|----------|
| 보상 히스토리 | 노드별 수익 통계 | 4h |
| 품질 점수 도입 | qualityScore 필드 + 계산 로직 | 4h |
| 탐색 경로 시각화 | 그래프 traversal 애니메이션 | 6h |

### 5.3 Phase 3: 실제 GraphRAG 전환

| 항목 | 설명 | 예상 공수 |
|------|------|----------|
| 임베딩 생성 | OpenAI/Cohere 연동 | 8h |
| 벡터 검색 | pgvector + 코사인 유사도 | 8h |
| 그래프 탐색 알고리즘 | BFS/DFS with edge weight | 12h |
| 온체인 보상 | World Chain 트랜잭션 | 16h |

---

## 6. 결론

### 6.1 현재 시스템 평가

| 평가 항목 | 점수 | 비고 |
|----------|------|------|
| 데이터 모델 완성도 | 6/10 | 기본 구조 존재, 확장 필요 |
| 기여→보상 연결성 | 4/10 | 로직 분리, 일관성 부족 |
| UI 투명성 | 5/10 | 기본 표시, 상세 부족 |
| GraphRAG 유사성 | 3/10 | 키워드 검색 수준 |
| 해커톤 데모 준비도 | 6/10 | 기능 동작, 임팩트 부족 |

### 6.2 핵심 개선 권고사항

1. **즉시 개선**: `calculateContribution()`을 relevanceScore 기반으로 수정
2. **영수증 강화**: 예상 WLD, 점수 breakdown 추가
3. **시각적 피드백**: 그래프에서 사용 노드 하이라이트
4. **데이터 흐름 통합**: graphRAGStore로 상태 관리 일원화

### 6.3 장기 로드맵

```
MVP (현재)          해커톤 데모          Production
    │                    │                    │
    ├── TF-IDF 검색 ──────┼── 가중 기여도 ─────┼── 벡터 검색
    │                    │                    │
    ├── 균등 배분 ────────┼── 비례 배분 ───────┼── 온체인 배분
    │                    │                    │
    └── 기본 영수증 ──────┴── 상세 영수증 ─────┴── 검증가능 영수증
```

---

**문서 끝**
