# Seed Vault - Production 업그레이드 계획

> Demo MVP에서 실제 GraphRAG + Smart Contract 연동 앱으로의 전환 로드맵
>
> 작성일: 2026년 2월 6일
> 리뷰 반영: 2026년 2월 6일 (6명 에이전트 팀 리뷰)

---

## 목차

1. [현재 상태 진단](#1-현재-상태-진단)
2. [P0 보안 수정 (즉시)](#p0-보안-수정-즉시)
3. [Phase 1: 데이터베이스 실체화](#phase-1-데이터베이스-실체화)
4. [Phase 1.5: 콘텐츠 모더레이션](#phase-15-콘텐츠-모더레이션)
5. [Phase 2: 인증 시스템 강화](#phase-2-인증-시스템-강화)
6. [Phase 3: GraphRAG 엔진 구현](#phase-3-graphrag-엔진-구현)
7. [Phase 4: 스마트 컨트랙트 연동](#phase-4-스마트-컨트랙트-연동)
8. [파일별 변경 매핑](#파일별-변경-매핑)
9. [의존성 다이어그램](#의존성-다이어그램)
10. [타임라인 및 공수 추정](#타임라인-및-공수-추정)
11. [에러 처리 및 폴백 전략](#에러-처리-및-폴백-전략)
12. [콜드 스타트 전략](#콜드-스타트-전략)
13. [Feature Flag 전환 전략](#feature-flag-전환-전략)

---

## 리뷰 반영 요약

본 문서는 다음 6명의 전문 리뷰어 피드백을 반영하여 업데이트되었습니다:

| 리뷰어 | 전문 분야 | 주요 피드백 |
|--------|-----------|------------|
| System Architect | 아키텍처 설계 | BFS N+1 쿼리 문제, RLS 시점 |
| Security Architect | 보안 | claimReward 접근제어, Mock 인증 격리 |
| Backend Developer | 백엔드 구현 | Race condition, 에러 처리 부재 |
| Code Reviewer | 코드 품질 | 파일 매핑 누락, Feature Flag |
| Crypto Specialist | 블록체인/Web3 | PBH, ERC-4337, 실제 컨트랙트 주소 |
| Product Manager | 제품/UX | 콜드 스타트, 콘텐츠 모더레이션 |

### 주요 변경 사항

- **P0 보안 수정** 섹션 신규 추가 (즉시 수정 필요 항목)
- **Phase 1**: RLS를 Phase 2에서 Phase 1로 이동, UUID/봇 ID 수정, Race condition 해결
- **Phase 1.5**: 콘텐츠 모더레이션 섹션 신규 추가
- **Phase 3**: BFS → SQL Recursive CTE 재설계, 임베딩 모델 업데이트
- **Phase 4**: PBH, ERC-4337 Paymaster, Treasury 모델, 실제 컨트랙트 주소 추가
- **파일 매핑**: 누락된 4개 파일 추가 (총 7개 → 16개)
- **타임라인**, **에러 처리**, **콜드 스타트**, **Feature Flag** 섹션 신규 추가

---

## 1. 현재 상태 진단

### 1.1 아키텍처 개요

```
현재 구조:

[프론트엔드 (Next.js)]
  ├── UI 컴포넌트        ✅ Production 수준
  ├── 타입 정의           ✅ Production 수준
  ├── Supabase API       ✅ 구현됨 (12개 함수)
  ├── Zustand 스토어      ⚠️ Mock 기본값 + Supabase 분기
  ├── Mock 데이터         ❌ ~650KB 하드코딩
  ├── 검색 엔진           ❌ 키워드 매칭만 (GraphRAG 아님)
  └── World ID           ⚠️ 실제 MiniKit + Mock fallback

[백엔드]
  ├── Supabase           ⚠️ 설정됨, 테이블 미확인
  ├── 서버사이드 검증      ❌ 없음
  ├── LLM 연동           ❌ 없음
  └── 스마트 컨트랙트      ❌ 없음
```

### 1.2 레이어별 Mock vs Real 상태

| 레이어 | 파일 | 상태 | 근거 |
|--------|------|------|------|
| **타입 정의** | `src/lib/types.ts` | ✅ Real | 9개 인터페이스, GraphRAG 지원 구조 |
| **DB 타입** | `src/lib/database.types.ts` | ✅ Real | 7개 테이블 스키마 정의 완료 |
| **Supabase 클라이언트** | `src/lib/supabase.ts` | ⚠️ Dual | Lazy 싱글턴 + 레거시 모듈 레벨 export 공존 |
| **API 함수** | `src/lib/api.ts` | ✅ Real | 12개 함수 (CRUD + Realtime 구독) |
| **봇/노드 데이터** | `src/lib/mock-data.ts` | ❌ Mock | 5개 봇, 89개 노드 하드코딩 (~650KB) |
| **검색 엔진** | `mock-data.ts` 내부 | ❌ Mock | TF-IDF 키워드 매칭, 그래프 탐색 없음 |
| **World ID 인증** | `src/lib/minikit.ts` | ⚠️ Hybrid | World App 내 실제 동작, 외부 Mock |
| **유저 스토어** | `src/stores/userStore.ts` | ⚠️ Hybrid | 인증=Real, 보상=Mock 기본값 |
| **인용 스토어** | `src/stores/citationStore.ts` | ❌ Mock | 로컬 카운터, 서버 동기화 없음 |
| **지식 스토어** | `src/stores/knowledgeStore.ts` | ❌ Mock | 로컬 localStorage, 서버 미연동 |
| **보상 페이지** | `src/app/rewards/page.tsx` | ❌ Mock | `STATIC_REWARDS` 상수 사용 |

### 1.3 이미 잘 되어 있는 것

백엔드 인프라는 상당 부분 준비되어 있습니다:

1. **`database.types.ts`** - 7개 테이블 스키마가 이미 정의됨
   - `users`, `bots`, `knowledge_nodes`, `node_edges`, `citations`, `user_rewards`, `contributions`
   - `embedding: number[] | null` 필드 이미 존재 (벡터 검색 대비)
   - `weight` 필드가 `node_edges`에 존재 (그래프 탐색 가중치 대비)

2. **`api.ts`** - 12개 Supabase 함수가 이미 동작 가능
   - `getAllBots()`, `getBotById()`, `getBotGraph()`
   - `getOrCreateUser()`, `getUserRewards()`, `getUserContributions()`
   - `addContribution()`, `recordCitations()`, `claimRewards()`
   - `getGlobalStats()`, `subscribeToNodeUpdates()`, `subscribeToGlobalStats()`

3. **`userStore.ts`** - Supabase 분기 로직 이미 구현
   - `isSupabaseConfigured()` 체크 후 자동 분기
   - 낙관적 업데이트 + 서버 동기화 패턴

### 1.4 핵심 문제점

```
문제 1: 데이터가 mock-data.ts에 하드코딩
  → Supabase 테이블에 실제 데이터가 없음

문제 2: 검색이 키워드 매칭 (TF-IDF)
  → 그래프 엣지를 전혀 활용하지 않음
  → LLM 답변 생성 없음 (노드 content 이어붙이기)

문제 3: 서버사이드 인증 없음
  → World ID proof를 서버에서 검증하지 않음
  → 누구나 API 호출로 기여 가능

문제 4: 보상이 프론트엔드 상수
  → 실제 인용 → 보상 계산 → 토큰 전송 파이프라인 없음

문제 5: Mock 인증이 프로덕션에서 동작 [P0 보안]
  → MiniKit.isInstalled() 기반 분기로 World App 외부에서 가짜 인증 통과
  → Math.random()으로 nullifier_hash 생성

문제 6: claimRewards() 접근제어 없음 [P0 보안]
  → 임의 userId로 호출하면 다른 사용자의 보상 탈취 가능

문제 7: recordCitations() Race Condition [P0 보안]
  → for-of + sequential await + read-then-write 패턴
  → 동시 인용 기록 시 카운트 유실
```

### 1.5 mock-data.ts 의존 파일 전수 조사

> **리뷰 피드백**: 기존 문서에서 3개 파일만 매핑되었으나, 실제 7개 파일이 import

| # | 파일 | import 대상 | Phase |
|---|------|-------------|-------|
| 1 | `src/app/explore/page.tsx` | `expertBots` | 1 |
| 2 | `src/app/explore/[botId]/page.tsx` | `getBotWithContributions`, `generateMockAnswer`, `calculateDetailedContribution` | 1, 3 |
| 3 | `src/app/rewards/page.tsx` | `expertBots` | 1 |
| 4 | `src/app/page.tsx` (JournalingHome) | `expertBots` | 1 |
| 5 | `src/components/Carousel3D.tsx` | `expertBots` 또는 봇 타입 | 1 |
| 6 | `src/app/contribute/[botId]/page.tsx` | 봇 데이터/타입 | 1 |
| 7 | `src/stores/knowledgeStore.ts` | 타입 참조 | 1 |

---

## P0 보안 수정 (즉시)

> **6명 전원 일치**: 프로덕션 배포 전 반드시 수정해야 하는 보안 취약점

### P0-1: Mock 인증 프로덕션 격리

**현재 문제** (`src/lib/minikit.ts:19`):
```typescript
// MiniKit.isInstalled()가 false면 Math.random()으로 가짜 인증
// → World App 외부의 모든 브라우저에서 인증 통과
```

**수정**:
```typescript
// 환경 변수 기반 격리
const ALLOW_MOCK = process.env.NODE_ENV === 'development'
  && process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === 'true'

if (!MiniKit.isInstalled()) {
  if (ALLOW_MOCK) {
    // 개발 환경에서만 Mock 허용
    return mockVerification()
  }
  throw new Error('World App에서만 이용 가능합니다')
}
```

### P0-2: claimRewards() 접근제어

**현재 문제** (`src/lib/api.ts`):
```typescript
// 임의 userId를 넣으면 다른 사용자의 보상을 0으로 리셋 가능
export async function claimRewards(userId: string) {
  await supabase.from('users').update({ pending_wld: 0 }).eq('id', userId)
}
```

**수정**:
```typescript
// JWT에서 userId를 추출하여 자신의 보상만 클레임 가능하도록
// Phase 2 (JWT) 이전의 임시 방어:
export async function claimRewards(userId: string, nullifierHash: string) {
  // 1. userId와 nullifierHash 일치 확인
  const { data: user } = await supabase
    .from('users')
    .select('nullifier_hash')
    .eq('id', userId)
    .single()

  if (user?.nullifier_hash !== nullifierHash) {
    throw new Error('Unauthorized: user mismatch')
  }

  // 2. pending_wld > 0 확인 후 리셋
  // ...
}
```

### P0-3: recordCitations() Race Condition

**현재 문제** (`src/lib/api.ts:272-336`):
```typescript
// for-of 루프에서 sequential await + read-then-write
for (const nodeId of nodeIds) {
  const { data } = await supabase.from('knowledge_nodes').select('citation_count').eq('id', nodeId)
  await supabase.from('knowledge_nodes').update({ citation_count: data.citation_count + 1 })
}
```

**수정**: Supabase RPC 원자적 증가 사용
```typescript
export async function recordCitations(nodeIds: string[], sessionId: string) {
  // 1. 배치로 citations 테이블에 INSERT
  const citations = nodeIds.map(nodeId => ({
    node_id: nodeId,
    session_id: sessionId,
    cited_at: new Date().toISOString()
  }))
  await supabase.from('citations').insert(citations)

  // 2. RPC로 원자적 카운트 증가 (병렬 실행)
  await Promise.all(
    nodeIds.map(nodeId =>
      supabase.rpc('increment_citation_count', { node_id: nodeId })
    )
  )
}
```

### P0-4: addContribution() 자동 승인 제거

**현재 문제** (`src/lib/api.ts:243`):
```typescript
// status: 'approved'가 기본값 → 모든 기여가 무조건 승인
```

**수정**:
```typescript
// status: 'pending'으로 변경, Phase 1.5 모더레이션 시스템과 연동
status: 'pending'
```

---

## Phase 1: 데이터베이스 실체화

> 모든 것의 기반. Mock 데이터를 Supabase 테이블로 이전.

### 1.1 목표

- Supabase 테이블 생성 (이미 정의된 스키마 활용)
- Mock 데이터를 시드 데이터로 마이그레이션
- `mock-data.ts`의 데이터 의존성을 `api.ts`로 전환 (7개 파일 모두)
- 프론트엔드 컴포넌트가 실제 DB 데이터를 표시
- **RLS (Row Level Security) 즉시 적용** (리뷰 반영: Phase 2에서 이동)

### 1.2 Supabase 테이블 생성 SQL

`database.types.ts`에 이미 정의된 스키마 기반:

```sql
-- 1. users 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nullifier_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  contribution_power INTEGER DEFAULT 0,
  total_citations INTEGER DEFAULT 0,
  pending_wld DECIMAL(18, 6) DEFAULT 0
);

-- 2. bots 테이블 (Vault)
CREATE TABLE bots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- 3. knowledge_nodes 테이블
CREATE TABLE knowledge_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id TEXT REFERENCES bots(id) NOT NULL,
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  contributor_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  citation_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small 차원
  metadata JSONB
);

-- 4. node_edges 테이블
CREATE TABLE node_edges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  weight REAL DEFAULT 1.0,
  UNIQUE(source_node_id, target_node_id, relationship)
);

-- 5. citations 테이블
CREATE TABLE citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID REFERENCES knowledge_nodes(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  cited_at TIMESTAMPTZ DEFAULT now(),
  context TEXT
);

-- 6. user_rewards 테이블
CREATE TABLE user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  node_id UUID REFERENCES knowledge_nodes(id) NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('citation', 'contribution', 'bonus')) NOT NULL,
  amount DECIMAL(18, 6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  transaction_hash TEXT
);

-- 7. contributions 테이블
CREATE TABLE contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  bot_id TEXT REFERENCES bots(id) NOT NULL,
  node_id UUID REFERENCES knowledge_nodes(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

-- 인덱스
CREATE INDEX idx_nodes_bot_id ON knowledge_nodes(bot_id);
CREATE INDEX idx_nodes_contributor ON knowledge_nodes(contributor_id);
CREATE INDEX idx_nodes_status ON knowledge_nodes(status);
CREATE INDEX idx_edges_source ON node_edges(source_node_id);
CREATE INDEX idx_edges_target ON node_edges(target_node_id);
CREATE INDEX idx_citations_node ON citations(node_id);
CREATE INDEX idx_citations_session ON citations(session_id);
CREATE INDEX idx_rewards_user ON user_rewards(user_id);
CREATE INDEX idx_rewards_unclaimed ON user_rewards(user_id) WHERE claimed = false;
CREATE INDEX idx_contributions_user ON contributions(user_id);
CREATE INDEX idx_contributions_status ON contributions(status);

-- RPC 함수: 원자적 인용 카운트 증가
CREATE OR REPLACE FUNCTION increment_citation_count(p_node_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE knowledge_nodes
  SET citation_count = citation_count + 1,
      updated_at = now()
  WHERE id = p_node_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 함수: 사용자 통계 조회
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  contribution_count BIGINT,
  total_citations BIGINT,
  pending_wld DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT c.node_id),
    COALESCE(SUM(kn.citation_count), 0),
    COALESCE(u.pending_wld, 0)
  FROM users u
  LEFT JOIN contributions c ON c.user_id = u.id AND c.status = 'approved'
  LEFT JOIN knowledge_nodes kn ON kn.id = c.node_id
  WHERE u.id = p_user_id
  GROUP BY u.pending_wld;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS (Row Level Security) - Phase 1에서 즉시 적용
-- (리뷰 반영: Phase 2에서 이동)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- bots: 모든 사용자가 읽기 가능
CREATE POLICY "bots_read" ON bots FOR SELECT USING (true);

-- knowledge_nodes: 승인된 노드만 읽기 가능, 기여자만 자신의 노드 수정 가능
CREATE POLICY "nodes_read_approved" ON knowledge_nodes
  FOR SELECT USING (status = 'approved');
CREATE POLICY "nodes_insert_auth" ON knowledge_nodes
  FOR INSERT WITH CHECK (auth.uid() = contributor_id);

-- node_edges: 읽기 공개, 쓰기는 서비스 롤만
CREATE POLICY "edges_read" ON node_edges FOR SELECT USING (true);

-- citations: 읽기 공개, 쓰기는 서비스 롤만
CREATE POLICY "citations_read" ON citations FOR SELECT USING (true);

-- user_rewards: 본인 보상만 조회/수정 가능
CREATE POLICY "rewards_own" ON user_rewards
  FOR ALL USING (auth.uid() = user_id);

-- contributions: 본인 기여만 조회, 관리자만 상태 변경
CREATE POLICY "contributions_own_read" ON contributions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contributions_insert" ON contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- users: 본인 데이터만 조회/수정 가능
CREATE POLICY "users_own" ON users
  FOR ALL USING (auth.uid() = id);
```

### 1.3 시드 데이터 마이그레이션

> **리뷰 반영**: UUID 타입 수정 (`'seed-user-01'` → `gen_random_uuid()`), 봇 ID 일치

`mock-data.ts`의 봇 ID와 시드 SQL의 봇 ID가 일치해야 합니다:

| mock-data.ts 봇 ID | 시드 SQL 봇 ID (수정 후) |
|---------------------|-------------------------|
| `worldcoin-expert` | `worldcoin-expert` |
| `seoul-guide` | `seoul-guide` |
| `doctor` | `doctor` |
| `korean-food` | `korean-food` |
| `startup-mentor` | `startup-mentor` |

```sql
-- 시드 유저 (UUID 자동 생성, 변수로 참조)
DO $$
DECLARE
  seed_user_1 UUID;
  seed_user_2 UUID;
  seed_user_3 UUID;
BEGIN
  INSERT INTO users (nullifier_hash, contribution_power, total_citations, pending_wld)
  VALUES ('0x1a2b3c4d5e6f7890abcdef1234567890', 45, 67, 3.234)
  RETURNING id INTO seed_user_1;

  INSERT INTO users (nullifier_hash, contribution_power, total_citations, pending_wld)
  VALUES ('0x4d5e6f7890abcdef1234567890abcdef', 32, 41, 1.892)
  RETURNING id INTO seed_user_2;

  INSERT INTO users (nullifier_hash, contribution_power, total_citations, pending_wld)
  VALUES ('0x7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v', 28, 35, 1.456)
  RETURNING id INTO seed_user_3;

  -- 봇 데이터 (mock-data.ts baseExpertBots 기반, ID 일치)
  INSERT INTO bots (id, name, description, icon, category) VALUES
    ('worldcoin-expert', 'World Coin 전문가', '...', '🌐', 'Crypto / Web3'),
    ('seoul-guide', '서울 로컬 가이드', '...', '🏙️', 'Travel / Local'),
    ('doctor', '산부인과 전문의', '...', '👩‍⚕️', 'Healthcare'),
    ('korean-food', '한식 레시피 마스터', '...', '🍲', 'Food / Recipe'),
    ('startup-mentor', '스타트업 멘토', '...', '🚀', 'Business / Startup');

  -- 각 봇의 knowledge_nodes INSERT (89개)
  -- → scripts/seed-data.ts 스크립트로 mock-data.ts에서 자동 변환
  -- → contributor_id에 seed_user_1~3을 랜덤 배정
END $$;
```

### 1.4 supabase.ts Dual Client 정리

> **리뷰 반영**: Lazy 싱글턴과 모듈 레벨 export이 공존하는 문제

```typescript
// 변경 전: 두 가지 export 방식 공존
export const supabase = createClient(...)  // 레거시
export function getSupabase() { ... }       // Lazy 싱글턴

// 변경 후: Lazy 싱글턴 통일
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// 하위 호환을 위한 export (deprecated 주석)
/** @deprecated getSupabase()를 사용하세요 */
export const supabase = null as unknown as SupabaseClient
```

### 1.5 작업 항목

| # | 작업 | 파일 | 설명 |
|---|------|------|------|
| 1-1 | Supabase 테이블 + RLS 생성 | `scripts/migrations/001_init.sql` | 위 SQL 실행 (RLS 포함) |
| 1-2 | 시드 데이터 스크립트 | `scripts/seed-data.ts` | mock-data에서 추출 → INSERT 생성 (UUID 준수) |
| 1-3 | ENV 변수 확인 | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 1-4 | supabase.ts 정리 | `src/lib/supabase.ts` | Dual client → Lazy 싱글턴 통일 |
| 1-5 | 탐색 페이지 연동 | `src/app/explore/page.tsx` | `expertBots` import → `fetchAllBots()` async 호출 |
| 1-6 | 봇 상세 페이지 연동 | `src/app/explore/[botId]/page.tsx` | `getBotWithContributions()` → `fetchBotById()` |
| 1-7 | 보상 페이지 연동 | `src/app/rewards/page.tsx` | `STATIC_REWARDS` → `userStore.rewards` (서버 데이터) |
| 1-8 | 홈 페이지 연동 | `src/app/page.tsx` | JournalingHome의 `expertBots` → API 호출 |
| 1-9 | 3D 카루셀 연동 | `src/components/Carousel3D.tsx` | `expertBots` → props로 전달 |
| 1-10 | 기여 페이지 연동 | `src/app/contribute/[botId]/page.tsx` | Mock 봇 데이터 → API 호출 |
| 1-11 | citationStore 서버 동기화 | `src/stores/citationStore.ts` | 로컬 카운터 → `api.recordCitations()` 호출 |
| 1-12 | knowledgeStore 서버 동기화 | `src/stores/knowledgeStore.ts` | localStorage → `api.addContribution()` 연동 |
| 1-13 | mock-data.ts 정리 | `src/lib/mock-data.ts` | 검색 함수만 남기고 데이터 제거 |

### 1.6 성공 기준

- [ ] 모든 봇 목록이 Supabase에서 로드됨
- [ ] 기여한 노드가 DB에 저장되고 새로고침 후에도 유지됨
- [ ] 인용 카운트가 서버에 기록됨 (Race condition 없음)
- [ ] 보상 페이지가 실제 유저 데이터 표시
- [ ] 7개 파일 모두에서 mock-data.ts 데이터 참조 제거됨
- [ ] RLS 정책이 모든 테이블에 적용됨

---

## Phase 1.5: 콘텐츠 모더레이션

> **리뷰 반영**: 6명 중 5명이 콘텐츠 품질 관리 부재를 지적.
> Orb 인증은 "인간임"만 보장. "정확한 정보"나 "양질의 콘텐츠"는 별도 검증 필요.

### 1.5.1 목표

- 저품질/스팸 기여 차단
- 커뮤니티 기반 콘텐츠 검증
- Rate limiting으로 남용 방지

### 1.5.2 기여 검증 파이프라인

```
기여 제출 → [자동 필터] → [AI 필터] → [커뮨니티 검증] → 승인/거절
              │               │               │
              ├ 길이 검증      ├ 스팸 감지      ├ 투표 시스템
              ├ 중복 감지      ├ 욕설 필터      └ 최소 2명 승인
              └ Rate limit    └ 관련성 점수
```

### 1.5.3 자동 필터

```typescript
// src/lib/content-filter.ts (새로 생성)

interface FilterResult {
  passed: boolean
  reason?: string
}

function autoFilter(content: string, botId: string): FilterResult {
  // 1. 길이 검증 (20자 → 50자로 상향)
  if (content.length < 50) return { passed: false, reason: 'too_short' }
  if (content.length > 2000) return { passed: false, reason: 'too_long' }

  // 2. Rate limiting: 사용자당 하루 10개 기여 제한
  // → Supabase에서 오늘 기여 수 확인

  // 3. 중복 감지: 기존 노드와 유사도 > 0.95 이면 거절
  // → Phase 3 임베딩 도입 후 활성화

  return { passed: true }
}
```

### 1.5.4 신고 시스템

```sql
-- 신고 테이블 추가
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID REFERENCES knowledge_nodes(id) NOT NULL,
  reporter_id UUID REFERENCES users(id) NOT NULL,
  reason TEXT CHECK (reason IN ('spam', 'inaccurate', 'offensive', 'duplicate', 'other')) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  UNIQUE(node_id, reporter_id)  -- 중복 신고 방지
);

-- 3회 이상 신고된 노드 자동 숨김
CREATE OR REPLACE FUNCTION check_report_threshold()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM reports WHERE node_id = NEW.node_id AND NOT resolved) >= 3 THEN
    UPDATE knowledge_nodes SET status = 'rejected' WHERE id = NEW.node_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER report_threshold_trigger
  AFTER INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION check_report_threshold();
```

### 1.5.5 작업 항목

| # | 작업 | 파일 | 설명 |
|---|------|------|------|
| 1.5-1 | 콘텐츠 자동 필터 | `src/lib/content-filter.ts` | 길이, 중복, Rate limit |
| 1.5-2 | 신고 테이블 | `scripts/migrations/002_reports.sql` | reports 테이블 + 자동 숨김 트리거 |
| 1.5-3 | 신고 API | `src/app/api/report/route.ts` | POST /api/report |
| 1.5-4 | 신고 UI | `src/components/ReportButton.tsx` | 노드 상세에서 신고 버튼 |
| 1.5-5 | Rate limit 미들웨어 | `src/middleware.ts` | 사용자당 API 호출 제한 |

---

## Phase 2: 인증 시스템 강화

> World ID proof를 서버에서 검증. 무인증 API 호출 차단.

### 2.1 목표

- Next.js API Route로 서버사이드 proof 검증
- JWT 토큰 발급 및 API 보호
- Mock fallback을 개발 환경으로 격리
- Orb vs Device 인증 레벨 구분

### 2.2 현재 인증 흐름 (문제점)

```
현재:
1. 프론트엔드에서 MiniKit.verify() 호출
2. proof를 받아서 로컬 상태에 저장
3. nullifier_hash로 Supabase 직접 호출
   → 문제: proof를 서버에서 검증하지 않음
   → 문제: 누구나 가짜 nullifier_hash로 API 호출 가능
   → 문제: Orb와 Device 인증을 구분하지 않음
```

### 2.3 목표 인증 흐름

```
개선 후:
1. 프론트엔드에서 MiniKit.verify() 호출
2. proof + merkle_root + nullifier_hash를 서버로 전송
3. 서버에서 World ID API로 proof 검증
   POST https://developer.worldcoin.org/api/v2/verify/{app_id}
4. 검증 성공 → JWT 토큰 발급 (verification_level 포함)
5. 이후 모든 API 호출에 JWT 포함
6. Supabase RLS + JWT로 데이터 보호 (Phase 1에서 이미 RLS 적용)
```

### 2.4 Orb vs Device 인증 레벨

> **리뷰 반영**: 현재 Orb/Device 구분 없이 동일 취급

| 인증 레벨 | 의미 | 허용 범위 |
|-----------|------|-----------|
| **Orb** | 홍채 인증 완료 | 기여 + 보상 클레임 + 전체 기능 |
| **Device** | 기기 인증만 | 탐색 + 질문만 가능, 기여/클레임 불가 |
| **없음** | 미인증 | 공개 Vault 탐색만 가능 |

### 2.5 구현 파일

#### `src/app/api/auth/verify/route.ts` (새로 생성)

```typescript
// World ID proof 서버사이드 검증
// POST /api/auth/verify
// Body: { proof, merkle_root, nullifier_hash, verification_level }
// Response: { token: string, userId: string, verificationLevel: 'orb' | 'device' }

// 1. World ID Developer Portal API로 proof 검증
// 2. verification_level 확인 (orb vs device)
// 3. nullifier_hash로 유저 생성/조회
// 4. JWT 토큰 발급 (verification_level 포함)
// 5. 토큰 반환

// 중요: proof의 유효 기간은 7일 (World ID 정책)
// → JWT 만료 시간도 7일 이하로 설정
```

#### `src/lib/auth.ts` (새로 생성)

```typescript
// JWT 토큰 관리
// - generateToken(userId, nullifierHash, verificationLevel)
// - verifyToken(token) → { userId, verificationLevel }
// - getAuthHeaders() - API 호출용 헤더 생성
// - requireOrb(token) - Orb 인증 필수 확인
```

#### `src/middleware.ts` (새로 생성)

```typescript
// Next.js Middleware
// - /api/* 경로 보호 (auth/verify 제외)
// - JWT 토큰 검증
// - verification_level 기반 접근 제어
// - Rate limiting (Phase 1.5)
// - 유효하지 않으면 401 반환
```

### 2.6 작업 항목

| # | 작업 | 파일 | 설명 |
|---|------|------|------|
| 2-1 | 검증 API Route | `src/app/api/auth/verify/route.ts` | World ID proof 서버사이드 검증 |
| 2-2 | JWT 유틸리티 | `src/lib/auth.ts` | 토큰 생성/검증, Orb/Device 구분 |
| 2-3 | API Middleware | `src/middleware.ts` | JWT 기반 API 보호 + Rate limit |
| 2-4 | minikit.ts 수정 | `src/lib/minikit.ts` | verify 후 서버 검증 호출 추가 |
| 2-5 | userStore 수정 | `src/stores/userStore.ts` | 토큰 저장 + verification_level 추적 |
| 2-6 | api.ts 수정 | `src/lib/api.ts` | 모든 함수에 Auth 헤더 추가 |
| 2-7 | Mock 격리 | `src/lib/minikit.ts` | `NODE_ENV + NEXT_PUBLIC_ALLOW_MOCK_AUTH` |
| 2-8 | Orb/Device UI 구분 | UI 컴포넌트 | Device 사용자에게 기여 제한 안내 |

### 2.7 성공 기준

- [ ] World ID proof가 서버에서 검증됨
- [ ] 가짜 proof로 API 호출 시 401 반환
- [ ] JWT 토큰 없이 기여 API 호출 불가
- [ ] 개발 환경에서만 Mock 인증 가능
- [ ] Device 인증 사용자는 기여/클레임 불가

---

## Phase 3: GraphRAG 엔진 구현

> 핵심 차별화. 키워드 검색 → 진짜 Graph + RAG로 전환.

### 3.1 GraphRAG란?

```
일반 검색:    질문 → 키워드 매칭 → 관련 문서 → 답변
일반 RAG:    질문 → 벡터 유사도 → 관련 청크 → LLM 생성
GraphRAG:    질문 → 벡터 유사도 → 시작 노드 → 그래프 탐색 → 서브그래프 → LLM 생성
                                              ↑ 이게 핵심
```

GraphRAG는 단순히 "관련 문서를 찾는" 게 아니라, **관계를 따라가며 맥락을 확장**합니다.

예시:
```
질문: "을지로에서 데이트 코스 추천해줘"

[일반 검색]
  "을지로" 키워드가 있는 노드 3개 반환 → 정보가 단편적

[GraphRAG]
  1. "을지로" 벡터 유사도 → "을지로3가역" 노드 발견
  2. 엣지 탐색: "을지로3가역" → (맛집) → "노가리 골목"
  3. 엣지 탐색: "을지로3가역" → (카페) → "세운상가 카페"
  4. 엣지 탐색: "노가리 골목" → (추천) → "을지OB맥주"
  5. 서브그래프 전체를 LLM에 전달
  6. LLM: "을지로3가역에서 시작해서 노가리 골목에서 저녁을 먹고,
           세운상가 카페에서 커피를 마시는 코스를 추천합니다..."
```

### 3.2 현재 검색 엔진 분석

현재 `mock-data.ts`의 `generateMockAnswer()`:

```
질문 입력
  ↓
tokenize() - 한국어/영어 토큰 분리
  ↓
각 노드의 label/content와 키워드 매칭 (TF-IDF)
  ↓
score = (라벨 매칭 × 3 + 콘텐츠 매칭 × 1) × IDF × 커버리지
  ↓
상위 3개 노드 선택
  ↓
노드의 content를 이어붙여서 "답변"으로 반환
```

**빠진 것:**
- ❌ 엣지(관계)를 전혀 보지 않음
- ❌ 벡터 임베딩 없음 (의미 유사도 불가)
- ❌ LLM 답변 생성 없음 (텍스트 이어붙이기)
- ❌ 그래프 탐색(BFS/DFS) 없음

### 3.3 목표 GraphRAG 파이프라인

```
[Stage 1: Query Understanding]
질문 → OpenAI Embedding API → 질문 벡터

[Stage 2: Seed Node Retrieval]
질문 벡터 → Supabase pgvector 유사도 검색 → 시드 노드 k개

[Stage 3: Graph Traversal (SQL Recursive CTE)]
시드 노드 → SQL CTE로 depth=2 확장 → 서브그래프 (단일 쿼리)

[Stage 4: Context Assembly]
서브그래프 노드 + 엣지 관계 → 구조화된 컨텍스트 문자열

[Stage 5: LLM Generation]
컨텍스트 + 질문 → OpenAI/Claude API → 답변 생성

[Stage 6: Attribution]
사용된 노드 → 기여 영수증 → 인용 기록 → 보상 계산
```

### 3.4 구현 상세

#### 3.4.1 벡터 임베딩 (Supabase pgvector)

`knowledge_nodes` 테이블에 이미 `embedding VECTOR(1536)` 필드가 정의되어 있습니다.

> **리뷰 반영**:
> - `text-embedding-ada-002` → `text-embedding-3-small` (최신 모델, 더 저렴)
> - `ivfflat lists=100` → 초기 데이터 규모(89개)에 맞게 조정

```sql
-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 벡터 인덱스 생성
-- 주의: ivfflat의 lists 파라미터는 sqrt(row_count) 기준
-- 89개 노드: lists = 10, 1000개 이상 시 lists = sqrt(n)으로 재조정
CREATE INDEX idx_nodes_embedding ON knowledge_nodes
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- 유사도 검색 함수
CREATE OR REPLACE FUNCTION search_similar_nodes(
  query_embedding VECTOR(1536),
  bot_id_filter TEXT,
  match_count INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  label TEXT,
  content TEXT,
  contributor_id UUID,
  citation_count INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    kn.id,
    kn.label,
    kn.content,
    kn.contributor_id,
    kn.citation_count,
    1 - (kn.embedding <=> query_embedding) AS similarity
  FROM knowledge_nodes kn
  WHERE kn.bot_id = bot_id_filter
    AND kn.status = 'approved'
    AND kn.embedding IS NOT NULL
    AND 1 - (kn.embedding <=> query_embedding) > match_threshold
  ORDER BY kn.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

> **database.types.ts 업데이트 필요**: `search_similar_nodes` RPC 타입을 `Functions` 섹션에 추가

#### 3.4.2 그래프 탐색: SQL Recursive CTE

> **리뷰 반영 (6/6 전원 일치)**: 기존 BFS를 애플리케이션 레벨에서 실행하면 N+1 쿼리 문제 발생.
> SQL Recursive CTE로 단일 쿼리에서 그래프를 확장합니다.

```sql
-- 시드 노드에서 depth=2까지 그래프를 확장하는 Recursive CTE
CREATE OR REPLACE FUNCTION expand_subgraph(
  seed_node_ids UUID[],
  max_depth INT DEFAULT 2,
  max_nodes INT DEFAULT 15
)
RETURNS TABLE (
  node_id UUID,
  node_label TEXT,
  node_content TEXT,
  contributor_id UUID,
  citation_count INTEGER,
  depth INT,
  edge_id UUID,
  edge_source UUID,
  edge_target UUID,
  edge_relationship TEXT,
  edge_weight REAL
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE graph AS (
    -- Base case: 시드 노드
    SELECT
      kn.id AS node_id,
      kn.label AS node_label,
      kn.content AS node_content,
      kn.contributor_id,
      kn.citation_count,
      0 AS depth,
      NULL::UUID AS edge_id,
      NULL::UUID AS edge_source,
      NULL::UUID AS edge_target,
      NULL::TEXT AS edge_relationship,
      NULL::REAL AS edge_weight
    FROM knowledge_nodes kn
    WHERE kn.id = ANY(seed_node_ids)
      AND kn.status = 'approved'

    UNION ALL

    -- Recursive case: 이웃 노드 확장
    SELECT
      kn.id,
      kn.label,
      kn.content,
      kn.contributor_id,
      kn.citation_count,
      g.depth + 1,
      ne.id,
      ne.source_node_id,
      ne.target_node_id,
      ne.relationship,
      ne.weight
    FROM graph g
    JOIN node_edges ne ON (ne.source_node_id = g.node_id OR ne.target_node_id = g.node_id)
    JOIN knowledge_nodes kn ON kn.id = CASE
      WHEN ne.source_node_id = g.node_id THEN ne.target_node_id
      ELSE ne.source_node_id
    END
    WHERE g.depth < max_depth
      AND kn.status = 'approved'
  )
  SELECT DISTINCT ON (graph.node_id) * FROM graph
  LIMIT max_nodes;
END;
$$;
```

#### 3.4.3 엣지 자동 생성 파이프라인

> **리뷰 반영**: 현재 엣지 데이터가 없거나 수동 생성만 있음. 기여 시 자동으로 관련 노드와 엣지를 생성해야 함.

```typescript
// src/lib/edge-generator.ts (새로 생성)

/**
 * 새 노드 기여 시 기존 노드와의 관계를 자동으로 감지하고 엣지를 생성
 *
 * 전략:
 * 1. 같은 bot_id 내 노드들과 코사인 유사도 계산
 * 2. 유사도 > 0.6인 노드와 자동으로 엣지 생성
 * 3. 관계 유형은 LLM으로 분류 (or 규칙 기반 fallback)
 */
async function generateEdgesForNode(
  newNodeId: string,
  botId: string,
  embedding: number[]
): Promise<void> {
  // 1. 유사한 기존 노드 검색
  const similarNodes = await supabase.rpc('search_similar_nodes', {
    query_embedding: embedding,
    bot_id_filter: botId,
    match_count: 5,
    match_threshold: 0.6
  })

  // 2. 각 유사 노드와 엣지 생성
  const edges = similarNodes.data?.map(node => ({
    source_node_id: newNodeId,
    target_node_id: node.id,
    relationship: 'related',  // TODO: LLM 기반 관계 분류
    weight: node.similarity
  }))

  if (edges?.length) {
    await supabase.from('node_edges').insert(edges)
  }
}
```

#### 3.4.4 API Route: 질문 처리

```
새 파일: src/app/api/query/route.ts

POST /api/query
Body: { botId, question }
Response: {
  answer: string,
  usedNodes: NodeDetail[],
  confidence: number,
  subgraph: { nodes: [], edges: [] }
}
```

처리 순서:
1. 질문을 OpenAI Embedding API로 벡터화
2. Supabase `search_similar_nodes()` RPC로 시드 노드 검색
3. `expand_subgraph()` RPC로 그래프 확장 (단일 SQL 쿼리)
4. 서브그래프를 컨텍스트로 조립
5. LLM API로 답변 생성
6. 사용된 노드 기반 기여 영수증 생성

#### 3.4.5 컨텍스트 조립

```typescript
// src/lib/context-builder.ts (새로 생성)

/**
 * 서브그래프를 LLM 프롬프트용 컨텍스트로 변환
 */
function buildContext(subgraph: SubGraph, question: string): string {
  const nodeDescriptions = subgraph.nodes.map(node =>
    `[노드: ${node.label}] ${node.content} (인용 ${node.citationCount}회)`
  ).join('\n')

  const edgeDescriptions = subgraph.edges.map(edge => {
    const source = subgraph.nodes.find(n => n.id === edge.source)
    const target = subgraph.nodes.find(n => n.id === edge.target)
    return `${source?.label} → (${edge.relationship}) → ${target?.label}`
  }).join('\n')

  return `
다음은 검증된 인간이 기여한 지식 그래프입니다.

## 지식 노드
${nodeDescriptions}

## 노드 간 관계
${edgeDescriptions}

## 질문
${question}

위 지식 그래프를 기반으로 답변해주세요.
- 실제 기여자의 정보만 사용하세요
- 어떤 노드의 정보를 사용했는지 명시하세요
- 그래프에 없는 정보는 추측하지 마세요
`
}
```

#### 3.4.6 LLM 답변 생성

```typescript
// src/lib/llm.ts (새로 생성)

// OpenAI 또는 Claude API를 통한 답변 생성
// 환경 변수: OPENAI_API_KEY 또는 ANTHROPIC_API_KEY

async function generateAnswer(
  context: string,
  model: string = 'gpt-4o-mini'
): Promise<{
  answer: string,
  usedNodeLabels: string[]
}> {
  // 1. LLM API 호출
  // 2. 답변에서 사용된 노드 라벨 추출
  // 3. 구조화된 응답 반환
}
```

#### 3.4.7 임베딩 생성 파이프라인

> **리뷰 반영**: `text-embedding-ada-002` → `text-embedding-3-small` (더 저렴, 동일 차원)

```typescript
// src/lib/embeddings.ts (새로 생성)

async function generateAndStoreEmbedding(nodeId: string): Promise<void> {
  const node = await getNodeById(nodeId)
  const text = `${node.label}: ${node.content}`

  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',  // ada-002 대비 5x 저렴
    input: text
  })

  await supabase
    .from('knowledge_nodes')
    .update({ embedding: embedding.data[0].embedding })
    .eq('id', nodeId)
}
```

### 3.5 프론트엔드 변경

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/explore/[botId]/page.tsx` | `generateMockAnswer()` → `/api/query` API 호출 |
| `src/components/KnowledgeGraph.tsx` | 서브그래프 하이라이트 (탐색된 경로 표시) |
| `src/stores/citationStore.ts` | 로컬 → 서버 기반 인용 기록 |

### 3.6 작업 항목

| # | 작업 | 파일 | 설명 |
|---|------|------|------|
| 3-1 | pgvector 활성화 | Supabase SQL | `CREATE EXTENSION vector` + 인덱스 (`lists=10`) |
| 3-2 | 유사도 검색 RPC | Supabase SQL | `search_similar_nodes()` 함수 |
| 3-3 | 그래프 확장 RPC | Supabase SQL | `expand_subgraph()` Recursive CTE 함수 |
| 3-4 | database.types.ts 업데이트 | `src/lib/database.types.ts` | `search_similar_nodes`, `expand_subgraph` RPC 타입 추가 |
| 3-5 | 임베딩 유틸리티 | `src/lib/embeddings.ts` | OpenAI `text-embedding-3-small` 호출 + 저장 |
| 3-6 | 엣지 자동 생성 | `src/lib/edge-generator.ts` | 기여 시 유사 노드와 자동 엣지 생성 |
| 3-7 | 컨텍스트 빌더 | `src/lib/context-builder.ts` | 서브그래프 → LLM 프롬프트 |
| 3-8 | LLM 유틸리티 | `src/lib/llm.ts` | OpenAI/Claude 답변 생성 |
| 3-9 | Query API Route | `src/app/api/query/route.ts` | 전체 파이프라인 통합 |
| 3-10 | 기존 시드 데이터 임베딩 | `scripts/backfill-embeddings.ts` | 기존 89개 노드 임베딩 생성 |
| 3-11 | 기여 시 임베딩 자동 생성 | `src/lib/api.ts` | `addContribution()` 후 임베딩 + 엣지 생성 |
| 3-12 | 프론트엔드 연동 | `src/app/explore/[botId]/page.tsx` | Mock → API 전환 |
| 3-13 | 그래프 탐색 경로 시각화 | `src/components/KnowledgeGraph.tsx` | 탐색된 엣지 하이라이트 |

### 3.7 성공 기준

- [ ] "을지로 맛집" 질문 시 관련 노드 + 연결된 이웃 노드 함께 검색됨
- [ ] 그래프에서 탐색된 경로(엣지)가 시각적으로 하이라이트됨
- [ ] LLM이 서브그래프 컨텍스트를 기반으로 자연스러운 답변 생성
- [ ] 답변에 사용된 노드가 기여 영수증에 정확하게 표시됨
- [ ] 벡터 유사도 검색 + CTE 그래프 확장 응답 시간 < 500ms
- [ ] 새 노드 기여 시 관련 엣지가 자동 생성됨

### 3.8 GraphRAG 전후 비교

```
[Before - 키워드 매칭]
Q: "을지로 데이트 코스"
A: "을지로는 서울의 대표적인 구도심 지역입니다. [노드1 내용] [노드2 내용]"
  → 단편적, 관계 없는 정보 나열

[After - GraphRAG]
Q: "을지로 데이트 코스"
A: "을지로3가역에서 시작해서 노가리 골목에서 저녁을 즐긴 후,
    세운상가 쪽 루프탑 카페에서 야경을 보는 코스를 추천합니다.
    특히 노가리 골목의 '을지OB맥주'는 42회 인용된 인기 장소입니다."

  사용된 지식 경로:
  을지로3가역 → (맛집거리) → 노가리 골목 → (추천) → 을지OB맥주
  을지로3가역 → (카페) → 세운상가 루프탑

  기여 영수증:
  - 기여자 0x1a2b: 45% (을지로3가역 노드)    0.00045 WLD
  - 기여자 0x4d5e: 30% (노가리 골목 노드)     0.00030 WLD
  - 기여자 0x7g8h: 25% (세운상가 카페 노드)    0.00025 WLD
```

---

## Phase 4: 스마트 컨트랙트 연동

> 보상을 실제 WLD 토큰으로 전환. 온체인 투명성 확보.

### 4.1 목표

- SeedVaultRewards 스마트 컨트랙트를 World Chain에 배포
- 기여 → 인용 → 보상 → 클레임 → WLD 전송 파이프라인
- World ID 온체인 검증으로 Sybil 공격 방지
- **PBH (Priority Blockspace for Humans) 활용** (리뷰 반영)
- **ERC-4337 Account Abstraction 지원** (리뷰 반영)

### 4.2 전제 조건

Phase 4는 Phase 1-3이 완료된 후에만 의미가 있습니다:

```
Phase 1 (DB)     → 실제 기여/인용 데이터가 서버에 존재
Phase 1.5 (Mod)  → 승인된 기여만 보상 대상
Phase 2 (Auth)   → 검증된 사용자만 기여 가능
Phase 3 (RAG)    → 실제 인용이 발생하고 기록됨
Phase 4 (SC)     → 인용 기록을 기반으로 보상 계산 및 토큰 전송
```

### 4.3 World Chain 컨트랙트 주소 (실제)

> **리뷰 반영 (Crypto Specialist)**: 실제 배포된 컨트랙트 주소

| 컨트랙트 | 네트워크 | 주소 |
|----------|----------|------|
| **World ID Router** | Mainnet (480) | `0x17B354dD2595411ff79041f930e491A4Df39A278` |
| **World ID Router** | Sepolia (4801) | `0x57f928158C3EE7CDad1e4D8642503c4D0201f611` |
| **WLD Token** | Mainnet | `0x2cFc85d8E48F8EAB294be644d9E25C3030863003` |
| **MiniKit Transfer** | Mainnet | `0x9CC547e0Ca60dC249Eea2d91Ba12F00C4ca12787` |
| **ERC-4337 EntryPoint** | v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` |

### 4.4 스마트 컨트랙트 아키텍처

> **리뷰 반영**: ReentrancyGuard, SafeERC20, 접근제어, 멀티시그 추가

```solidity
// SeedVaultRewards.sol (World Chain 배포)

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract SeedVaultRewards is ReentrancyGuard, Ownable2Step {
    using SafeERC20 for IERC20;

    IWorldID public worldId;
    IERC20 public wldToken;

    // World ID 검증 그룹 (1 = Orb)
    uint256 internal immutable groupId = 1;

    mapping(address => uint256) public pendingRewards;
    mapping(uint256 => bool) internal nullifierHashes;

    // 일일 클레임 한도
    uint256 public constant DAILY_CLAIM_LIMIT = 1e18; // 1 WLD

    function contribute(
        address contributor,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        // 1. World ID proof 온체인 검증
        // 2. nullifierHash 중복 확인
        // 3. 기여 기록
    }

    function recordCitation(bytes32 nodeId, uint256 amount) external onlyOwner {
        // 관리자만 인용 기록 가능 (배치 프로세스)
    }

    function claimReward() external nonReentrant {
        // 1. msg.sender의 pendingRewards 확인
        // 2. DAILY_CLAIM_LIMIT 체크
        // 3. SafeERC20.safeTransfer로 WLD 전송
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards");

        pendingRewards[msg.sender] = 0;
        wldToken.safeTransfer(msg.sender, amount);
    }
}
```

**보안 체크리스트**:
- [x] `ReentrancyGuard` 적용 (claimReward)
- [x] `SafeERC20` 사용 (ERC20 전송)
- [x] `Ownable2Step` 적용 (2단계 소유권 이전)
- [x] `nonReentrant` modifier on claimReward
- [x] nullifierHash 중복 방지
- [ ] Owner를 멀티시그 (Gnosis Safe)으로 설정 (배포 후)

### 4.5 PBH (Priority Blockspace for Humans)

> **리뷰 반영 (Crypto Specialist)**: World Chain의 핵심 기능. Orb 인증 사용자에게 무료 가스 제공.

```
PBH란?
- World Chain에서 Orb 인증 사용자가 우선 블록스페이스를 가스비 없이 사용
- 봇 트랜잭션보다 항상 우선 처리
- Seed Vault에 이상적: 기여/클레임 시 가스비 부담 제거

적용 방법:
1. MiniKit의 sendTransaction()은 자동으로 PBH 활용
2. 사용자가 World App 내에서 트랜잭션 서명 시 자동 적용
3. 별도 코드 변경 불필요 (MiniKit이 처리)
```

### 4.6 ERC-4337 Account Abstraction

> **리뷰 반영 (Crypto Specialist)**: World App은 Smart Contract Wallet 사용.

```
ERC-4337이란?
- 사용자가 EOA 대신 Smart Contract Wallet 사용
- World App은 기본적으로 ERC-4337 지원
- EntryPoint v0.7: 0x0000000071727De22E5E9d8BAf0edAc6f37da032

Seed Vault 적용:
1. MiniKit.commandsAsync['sendTransaction'] 활용
2. Paymaster를 통한 가스비 대납 가능
3. 배치 트랜잭션 지원 (여러 노드 인용 기록을 하나의 tx로)
```

### 4.7 Treasury 모델

> **리뷰 반영 (6/6 전원)**: "누가 WLD를 지불하는가?"에 대한 답변 필요

```
Treasury 재원 모델:

[초기 (0-6개월)]
├── World Foundation 그랜트 신청 (5,000-50,000 WLD)
├── Seed Vault 팀 자체 Treasury (1,000 WLD 초기 투입)
└── 보상 한도: 인용당 0.0001 WLD (보수적)

[성장기 (6-12개월)]
├── 프리미엄 API 수익 (B2B 지식 검색)
├── 프리미엄 봇 구독 수익
└── 보상 한도: 수익 기반 동적 조정

[성숙기 (12개월+)]
├── DAO 거버넌스로 전환
├── Treasury 투표로 보상 비율 결정
└── 자체 토큰 발행 검토 (SV 토큰)

Treasury 안전장치:
- 일일 총 지급 한도: 100 WLD
- 단일 사용자 일일 클레임 한도: 1 WLD
- Treasury 잔액 < 500 WLD 시 보상 일시 중단 + 알림
```

### 4.8 MiniKit Transfer 연동

> **리뷰 반영**: MiniKit의 내장 Transfer 기능 활용

```typescript
// MiniKit Transfer를 활용한 간편 클레임
// 컨트랙트: 0x9CC547e0Ca60dC249Eea2d91Ba12F00C4ca12787

import { MiniKit, tokenToDecimals, Tokens } from '@worldcoin/minikit-js'

async function claimViaTransfer(amount: number, recipientAddress: string) {
  const payload = {
    reference: `seed-vault-claim-${Date.now()}`,
    to: recipientAddress,
    tokens: [{
      symbol: Tokens.WLD,
      token_amount: tokenToDecimals(amount, Tokens.WLD).toString()
    }],
    description: `Seed Vault 보상 클레임: ${amount} WLD`
  }

  const result = await MiniKit.commandsAsync.pay(payload)
  return result
}
```

### 4.9 오프체인-온체인 연동

```
[오프체인 (Supabase + Next.js)]

1. 사용자가 질문
2. GraphRAG 엔진이 답변 생성
3. 사용된 노드 → citations 테이블에 기록
4. 기여자별 보상 계산
   ↓

[온체인 (World Chain)]

5. 배치 프로세스: 누적된 인용을 주기적으로 온체인 기록
   → recordCitation(nodeId, citationCount) 호출
6. 사용자가 "Claim" 버튼 클릭
   → claimReward() 호출 (PBH로 가스비 무료)
7. 스마트 컨트랙트가 WLD 토큰 전송 (SafeERC20)
```

### 4.10 작업 항목

| # | 작업 | 파일 | 설명 |
|---|------|------|------|
| 4-1 | 컨트랙트 작성 | `contracts/SeedVaultRewards.sol` | ReentrancyGuard + SafeERC20 + Ownable2Step |
| 4-2 | 컨트랙트 테스트 | `test/SeedVaultRewards.t.sol` | Foundry 단위 테스트 |
| 4-3 | 테스트넷 배포 | Foundry script | World Chain Sepolia (4801)에 배포 |
| 4-4 | 컨트랙트 ABI 추출 | `src/lib/contracts/abi.ts` | TypeScript ABI 타입 |
| 4-5 | ethers.js 연동 | `src/lib/contracts/client.ts` | 컨트랙트 호출 유틸리티 |
| 4-6 | MiniKit Transfer 연동 | `src/lib/contracts/minikit-pay.ts` | MiniKit pay 명령어 활용 |
| 4-7 | Claim API Route | `src/app/api/rewards/claim/route.ts` | 보상 클레임 처리 |
| 4-8 | Batch Citation Worker | `scripts/batch-citations.ts` | 주기적 온체인 기록 |
| 4-9 | 보상 페이지 연동 | `src/app/rewards/page.tsx` | 실제 클레임 UI |
| 4-10 | 트랜잭션 확인 UI | `src/components/TransactionStatus.tsx` | 온체인 트랜잭션 상태 표시 |
| 4-11 | Treasury 관리 | `scripts/treasury-monitor.ts` | 잔액 모니터링 + 알림 |
| 4-12 | Owner 멀티시그 설정 | 배포 후 | Gnosis Safe로 소유권 이전 |
| 4-13 | 메인넷 배포 | Foundry script | World Chain Mainnet (480) 배포 |

### 4.11 성공 기준

- [ ] 테스트넷에서 기여 → 인용 → 클레임 → WLD 수령 전체 플로우 동작
- [ ] World ID proof 없이 컨트랙트 호출 시 거부됨
- [ ] 동일 사용자 중복 기여 방지 (nullifier_hash 기반)
- [ ] PBH로 Orb 인증 사용자 가스비 무료 확인
- [ ] ReentrancyGuard로 재진입 공격 방지 확인
- [ ] 트랜잭션 해시가 UI에 표시됨
- [ ] Treasury 잔액 모니터링 동작

---

## 파일별 변경 매핑

### 기존 파일 수정

| 파일 | Phase | 변경 내용 |
|------|-------|-----------|
| `src/lib/mock-data.ts` | 1 | 데이터 제거, 검색 함수만 유지 → Phase 3에서 완전 대체 |
| `src/lib/api.ts` | P0, 1, 2 | Race condition 수정, Auth 헤더 추가, 임베딩 호출 추가 |
| `src/lib/minikit.ts` | P0, 2 | Mock 격리, 서버 검증 호출 추가 |
| `src/lib/supabase.ts` | 1 | Dual client → Lazy 싱글턴 통일 |
| `src/lib/types.ts` | 3 | `SubGraph`, `QueryResult` 타입 추가 |
| `src/lib/database.types.ts` | 1, 3 | `search_similar_nodes`, `expand_subgraph` RPC 타입 추가 |
| `src/stores/userStore.ts` | 1, 2 | JWT 토큰 관리, verification_level 추가 |
| `src/stores/citationStore.ts` | 1 | 서버 동기화 로직 추가 |
| `src/stores/knowledgeStore.ts` | 1 | 서버 동기화 로직 추가 |
| `src/app/explore/[botId]/page.tsx` | 1, 3 | Mock → API 전환 |
| `src/app/explore/page.tsx` | 1 | `expertBots` import → API 호출 |
| `src/app/page.tsx` | 1 | JournalingHome의 `expertBots` → API 호출 |
| `src/app/rewards/page.tsx` | 1, 4 | STATIC_REWARDS → 서버 데이터 → 온체인 클레임 |
| `src/components/Carousel3D.tsx` | 1 | `expertBots` → props 기반 |
| `src/components/KnowledgeGraph.tsx` | 3 | 탐색 경로 시각화 추가 |
| `src/app/contribute/[botId]/page.tsx` | 1, 1.5 | Mock → API + 콘텐츠 필터 적용 |

### 새로 생성하는 파일

| 파일 | Phase | 설명 |
|------|-------|------|
| `scripts/migrations/001_init.sql` | 1 | Supabase 테이블 + RLS 생성 |
| `scripts/migrations/002_reports.sql` | 1.5 | 신고 테이블 + 자동 숨김 트리거 |
| `scripts/seed-data.ts` | 1 | Mock 데이터 → DB 마이그레이션 (UUID 준수) |
| `src/lib/content-filter.ts` | 1.5 | 자동 콘텐츠 필터 |
| `src/app/api/report/route.ts` | 1.5 | 신고 API |
| `src/components/ReportButton.tsx` | 1.5 | 신고 UI |
| `src/app/api/auth/verify/route.ts` | 2 | 서버사이드 World ID 검증 |
| `src/lib/auth.ts` | 2 | JWT 토큰 유틸리티 |
| `src/middleware.ts` | 2 | API 보호 미들웨어 + Rate limit |
| `src/lib/embeddings.ts` | 3 | OpenAI `text-embedding-3-small` 임베딩 |
| `src/lib/edge-generator.ts` | 3 | 엣지 자동 생성 |
| `src/lib/context-builder.ts` | 3 | 서브그래프 → LLM 컨텍스트 |
| `src/lib/llm.ts` | 3 | LLM 답변 생성 |
| `src/app/api/query/route.ts` | 3 | GraphRAG 질문 처리 API |
| `scripts/backfill-embeddings.ts` | 3 | 기존 노드 임베딩 생성 |
| `contracts/SeedVaultRewards.sol` | 4 | 보상 스마트 컨트랙트 |
| `test/SeedVaultRewards.t.sol` | 4 | 컨트랙트 테스트 |
| `src/lib/contracts/abi.ts` | 4 | 컨트랙트 ABI |
| `src/lib/contracts/client.ts` | 4 | 온체인 호출 유틸리티 |
| `src/lib/contracts/minikit-pay.ts` | 4 | MiniKit Transfer 연동 |
| `src/app/api/rewards/claim/route.ts` | 4 | 보상 클레임 API |
| `scripts/batch-citations.ts` | 4 | 주기적 온체인 기록 |
| `scripts/treasury-monitor.ts` | 4 | Treasury 잔액 모니터링 |

---

## 의존성 다이어그램

```
P0: 보안 수정 (즉시)
   │
   ├──→ P0-1 Mock 인증 격리
   ├──→ P0-2 claimRewards 접근제어
   ├──→ P0-3 recordCitations Race Condition
   └──→ P0-4 addContribution 자동승인 제거
          │
          ↓
Phase 1: DB 실체화 + RLS
   │
   ├──→ 1-1 테이블 + RLS 생성
   ├──→ 1-2 시드 데이터 (UUID 준수)
   ├──→ 1-3 ENV 확인
   ├──→ 1-4 supabase.ts 정리
   │       │
   │       ↓
   ├──→ 1-5~1-12 프론트엔드 연동 (7개 파일)
   │       │
   │       ↓
   └──→ 1-13 mock-data 정리
          │
          ↓
Phase 1.5: 콘텐츠 모더레이션
   │
   ├──→ 1.5-1 자동 필터
   ├──→ 1.5-2 신고 테이블
   ├──→ 1.5-3~4 신고 API + UI
   └──→ 1.5-5 Rate limit 미들웨어
          │
          ↓
Phase 2: 인증 강화
   │
   ├──→ 2-1 검증 API Route
   ├──→ 2-2 JWT 유틸리티
   │       │
   │       ↓
   ├──→ 2-3 Middleware (Rate limit과 통합)
   ├──→ 2-4~2-6 기존 코드 수정
   │       │
   │       ↓
   └──→ 2-7~2-8 Mock 격리 + Orb/Device 구분
          │
          ↓
Phase 3: GraphRAG
   │
   ├──→ 3-1 pgvector 활성화 (lists=10)
   ├──→ 3-2 유사도 검색 RPC
   ├──→ 3-3 그래프 확장 RPC (Recursive CTE)
   ├──→ 3-4 database.types.ts 업데이트
   ├──→ 3-5 임베딩 유틸리티
   ├──→ 3-6 엣지 자동 생성
   │       │
   │       ↓
   ├──→ 3-7 컨텍스트 빌더
   ├──→ 3-8 LLM 유틸리티
   │       │
   │       ↓
   ├──→ 3-9 Query API (통합)
   ├──→ 3-10 기존 데이터 임베딩
   │       │
   │       ↓
   └──→ 3-11~3-13 프론트엔드 + 엣지 생성 + 시각화
          │
          ↓
Phase 4: 스마트 컨트랙트
   │
   ├──→ 4-1 컨트랙트 작성 (ReentrancyGuard + SafeERC20)
   ├──→ 4-2 컨트랙트 테스트
   ├──→ 4-3 Sepolia 배포
   │       │
   │       ↓
   ├──→ 4-4~4-8 연동 코드 (ABI, client, MiniKit, API, Batch)
   │       │
   │       ↓
   ├──→ 4-9~4-10 UI 연동 + Treasury 모니터링
   │       │
   │       ↓
   ├──→ 4-11~4-12 멀티시그 + 보안 감사
   │       │
   │       ↓
   └──→ 4-13 메인넷 배포
```

---

## 타임라인 및 공수 추정

> **리뷰 반영**: 구체적 타임라인과 공수 추가

### 솔로 개발자 기준 (주 40시간)

| Phase | 예상 공수 | 누적 | 비고 |
|-------|----------|------|------|
| P0: 보안 수정 | 0.5주 | 0.5주 | 즉시 시작 |
| Phase 1: DB 실체화 | 1.5주 | 2주 | RLS 포함 |
| Phase 1.5: 모더레이션 | 1주 | 3주 | 기본 필터 + 신고 |
| Phase 2: 인증 강화 | 1.5주 | 4.5주 | JWT + Middleware |
| Phase 3: GraphRAG | 3주 | 7.5주 | 가장 복잡 |
| Phase 4: 스마트 컨트랙트 | 3주 | 10.5주 | 테스트넷 → 메인넷 |
| 통합 테스트 + QA | 1주 | 11.5주 | 전체 플로우 검증 |
| **합계** | **~11.5주** | | **~3개월** |

### 2인 팀 기준 (프론트엔드 + 백엔드)

| Phase | 예상 공수 | 비고 |
|-------|----------|------|
| P0 + Phase 1 | 1주 | 병렬 작업 가능 |
| Phase 1.5 + 2 | 1.5주 | 백엔드: 인증, 프론트: 모더레이션 UI |
| Phase 3 | 2주 | 백엔드: RAG API, 프론트: 시각화 |
| Phase 4 | 2주 | 백엔드: 컨트랙트, 프론트: 클레임 UI |
| QA | 0.5주 | |
| **합계** | **~7주** | **~2개월** |

### 마일스톤

| 마일스톤 | 목표일 | 달성 기준 |
|----------|--------|-----------|
| M1: 보안 수정 완료 | Week 1 | P0 전항목 통과, Mock 격리 확인 |
| M2: DB 실체화 완료 | Week 2 | 7개 파일 mock-data 제거, 실 데이터 표시 |
| M3: 인증 완료 | Week 4.5 | 서버사이드 검증, JWT, 모더레이션 |
| M4: GraphRAG MVP | Week 7.5 | 벡터 검색 + CTE 탐색 + LLM 답변 동작 |
| M5: 테스트넷 완료 | Week 10.5 | 전체 플로우 Sepolia에서 동작 |
| M6: 메인넷 배포 | Week 12 | 보안 감사 후 메인넷 배포 |

---

## 에러 처리 및 폴백 전략

> **리뷰 반영 (5/6)**: 각 Phase에서 외부 서비스 장애 시 폴백 없음

### Supabase 장애

```typescript
// Exponential backoff + 로컬 캐시 폴백
async function fetchWithFallback<T>(
  query: () => Promise<T>,
  cacheKey: string
): Promise<T> {
  try {
    const result = await retryWithBackoff(query, { maxRetries: 3 })
    localStorage.setItem(cacheKey, JSON.stringify(result))
    return result
  } catch (error) {
    // 캐시된 데이터로 폴백
    const cached = localStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
    throw error
  }
}
```

### OpenAI API 장애 (Phase 3)

```
1차 폴백: Claude API (ANTHROPIC_API_KEY)
2차 폴백: 키워드 매칭 (기존 TF-IDF 로직 유지)
  → generateMockAnswer()를 제거하지 않고 폴백으로 보존
```

### World Chain RPC 장애 (Phase 4)

```
1차 폴백: 대체 RPC 엔드포인트 (Alchemy → Infura → 공용)
2차 폴백: 클레임 큐에 저장, 네트워크 복구 후 재시도
  → 사용자에게 "클레임 접수됨, 처리 중" 안내
```

### 에러 상태 UI

```typescript
// 각 API 호출에 일관된 에러 상태 표시
interface ApiError {
  code: 'NETWORK' | 'AUTH' | 'RATE_LIMIT' | 'SERVER'
  message: string
  retryable: boolean
}

// 사용자에게 보이는 메시지
const ERROR_MESSAGES = {
  NETWORK: '네트워크 연결을 확인해주세요',
  AUTH: 'World App에서 다시 인증해주세요',
  RATE_LIMIT: '잠시 후 다시 시도해주세요',
  SERVER: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요'
}
```

---

## 콜드 스타트 전략

> **리뷰 반영 (6/6)**: 초기 기여자 확보 전략 없음

### 문제

지식 노드가 없으면 탐색할 게 없고, 탐색자가 없으면 기여 인센티브가 없음.

### 전략

```
[Phase A: 시드 콘텐츠 (배포 전)]
├── 팀 멤버가 직접 50개 이상 고품질 노드 기여
├── 5개 Vault 각각 최소 10개 노드
├── 엣지 관계도 수동으로 생성 (초기 그래프 구조 확보)
└── 데모 시나리오에 사용되는 노드 우선 확보

[Phase B: 어리어답터 유치 (베타)]
├── World App 커뮤니티에서 초기 테스터 20명 모집
├── 초기 기여 보상 부스트 (2x 보상)
├── 네이버 지식iN 파워유저 타겟팅
└── 을지로/성수동 등 로컬 커뮤니티 타겟

[Phase C: 바이럴 루프]
├── "내 지식이 N회 인용되었습니다" 공유 카드
├── 기여자 리더보드 → 경쟁 심리
└── 인용 보상 알림 → 재방문 유도
```

---

## Feature Flag 전환 전략

> **리뷰 반영**: Mock → Real 전환 시 점진적 롤아웃 필요

### Feature Flag 설계

```typescript
// src/lib/feature-flags.ts

export const FLAGS = {
  // Phase 1
  USE_SUPABASE_DATA: process.env.NEXT_PUBLIC_FF_SUPABASE === 'true',

  // Phase 1.5
  CONTENT_MODERATION: process.env.NEXT_PUBLIC_FF_MODERATION === 'true',

  // Phase 2
  SERVER_AUTH: process.env.NEXT_PUBLIC_FF_SERVER_AUTH === 'true',

  // Phase 3
  GRAPHRAG_SEARCH: process.env.NEXT_PUBLIC_FF_GRAPHRAG === 'true',

  // Phase 4
  ONCHAIN_REWARDS: process.env.NEXT_PUBLIC_FF_ONCHAIN === 'true',
} as const
```

### 사용 예시

```typescript
// src/app/explore/[botId]/page.tsx

async function handleSearch(question: string) {
  if (FLAGS.GRAPHRAG_SEARCH) {
    // Phase 3: GraphRAG API 호출
    return await fetch('/api/query', { body: JSON.stringify({ botId, question }) })
  } else {
    // Fallback: 기존 키워드 매칭
    return generateMockAnswer(question, bot)
  }
}
```

### 롤아웃 순서

```
Week 1:  FF_SUPABASE=false (Mock 유지, DB 테스트만)
Week 2:  FF_SUPABASE=true  (DB 전환, 모니터링)
Week 3:  FF_MODERATION=true (모더레이션 활성화)
Week 5:  FF_SERVER_AUTH=true (인증 강화)
Week 8:  FF_GRAPHRAG=true   (GraphRAG 활성화)
Week 11: FF_ONCHAIN=true    (온체인 보상 활성화)
```

---

## 필요한 외부 서비스 / API 키

| 서비스 | 용도 | Phase | ENV 변수 |
|--------|------|-------|----------|
| **Supabase** | 데이터베이스, 인증 | 1 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **World ID** | 서버사이드 검증 | 2 | `WORLD_APP_ID`, `WORLD_ACTION_ID` |
| **OpenAI** | 임베딩 + 답변 생성 | 3 | `OPENAI_API_KEY` |
| **Anthropic** | LLM 폴백 | 3 | `ANTHROPIC_API_KEY` (선택) |
| **World Chain RPC** | 온체인 호출 | 4 | `WORLD_CHAIN_RPC_URL` |
| **Private Key** | 컨트랙트 배포 | 4 | `DEPLOYER_PRIVATE_KEY` (로컬만) |

---

## 예상 비용

| 항목 | Phase | 예상 비용 |
|------|-------|-----------|
| Supabase Free Tier | 1 | $0 (500MB DB, 50K 요청/월) |
| Supabase Pro (필요 시) | 1 | $25/월 |
| OpenAI `text-embedding-3-small` | 3 | ~$0.00002/1K tokens (ada-002 대비 5x 저렴) |
| OpenAI `gpt-4o-mini` | 3 | ~$0.15/1M input tokens |
| World Chain 가스비 | 4 | $0 (PBH 사용 시) ~ 매우 저렴 (L2) |
| WLD 보상 Treasury | 4 | 초기 1,000 WLD (~$2,000-5,000) |
| Foundry / Hardhat | 4 | $0 (오픈소스) |

---

## 우선순위 요약

```
[즉시 수정]
P0   ████                     보안 수정 - Mock 격리, 접근제어, Race condition
  → 프로덕션 배포 전 필수

[즉시 시작 가능]
Phase 1  ████████████████████  DB 실체화 + RLS - 모든 것의 기반
  → Supabase 테이블만 만들면 기존 api.ts가 바로 동작

[Phase 1 완료 후]
Phase 1.5 ████████            콘텐츠 모더레이션 - 품질 확보
  → 신고 시스템 + 자동 필터 + Rate limit

[Phase 1.5 완료 후]
Phase 2  ████████████████      인증 강화 - 보안 필수
  → API Route 2개 + Middleware 1개

[Phase 2 완료 후]
Phase 3  ████████████          GraphRAG - 핵심 차별화
  → 가장 복잡하지만 가장 임팩트 큼
  → SQL Recursive CTE + OpenAI API 키 필요

[Phase 3 완료 후]
Phase 4  ████████              스마트 컨트랙트 - 최종 완성
  → PBH + ERC-4337 + SafeERC20
  → 테스트넷 → 보안 감사 → 메인넷 순서
```

---

*본 문서는 Seed Vault MVP 코드베이스 전수 분석 및 6명 전문가 팀 리뷰를 기반으로 작성되었습니다.*
*각 Phase는 Feature Flag로 점진적 롤아웃되며, 이전 Phase가 완료되어야 다음 Phase를 시작할 수 있습니다.*
