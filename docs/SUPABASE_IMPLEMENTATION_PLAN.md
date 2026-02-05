# Seed Vault - Supabase 프로덕션 구현 계획서

> "우리가 시간이 없지, 실력이 없냐? 데모 수준이 아니라 진짜 돌아가게 만들어."

**작성일**: 2026-02-05
**예상 소요 시간**: 2-3시간
**대상**: 강한 실행력을 가진 개발팀
**상태**: 코드 준비 완료 - Supabase 프로젝트 설정 및 환경 변수만 필요

---

## 0. 실행 요약 (TL;DR)

### 완료된 것 (코드 레벨)
- `/src/lib/supabase.ts` - Lazy-loading Supabase 클라이언트 (환경 변수 없어도 빌드 가능)
- `/src/lib/database.types.ts` - 전체 DB 타입 정의
- `/src/lib/api.ts` - Supabase API 래퍼 함수
- `/src/lib/mock-data.ts` - async API 래퍼 추가 (Supabase 연동 + 폴백)
- `/src/stores/userStore.ts` - Supabase/로컬 하이브리드 모드
- `/src/app/contribute/[botId]/page.tsx` - 실제 저장 로직

### 즉시 실행 필요 (15-20분)
1. Supabase 프로젝트 생성
2. `/docs/supabase-schema.sql` 실행
3. `.env.local`에 환경 변수 설정

### 동작 방식
- **환경 변수 없음**: Mock 데이터로 완전 동작 (현재 상태)
- **환경 변수 있음**: Supabase에 실제 저장, 실시간 동기화

---

## 1. 현재 상태 분석

### Mock으로 처리되고 있는 것들
| 기능 | 현재 구현 | 문제점 |
|------|----------|--------|
| 사용자 인증 | `localStorage` (Zustand persist) | 브라우저별 격리, 서버 동기화 없음 |
| 지식 노드 | `mock-data.ts` 하드코딩 | 새 기여가 실제로 저장 안됨 |
| 인용 카운트 | 정적 숫자 | 실시간 업데이트 없음 |
| 기여 기록 | 로컬 스토리지 | 디바이스 변경 시 유실 |
| 글로벌 통계 | 하드코딩 (174, 58, 4) | 실제 집계 아님 |

### 핵심 파일 구조
```
src/
├── stores/userStore.ts      # Zustand + localStorage (교체 대상)
├── lib/mock-data.ts         # 정적 데이터 (교체 대상)
├── lib/types.ts             # 타입 정의 (유지, 확장)
├── app/
│   ├── contribute/[botId]/  # 기여 페이지 (Supabase 연동)
│   ├── explore/[botId]/     # 탐색 페이지 (Supabase 연동)
│   └── rewards/             # 보상 페이지 (Supabase 연동)
```

---

## 2. Supabase 데이터베이스 스키마

### 2.1 ERD 개요
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │   expert_bots   │     │ knowledge_nodes │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ nullifier_hash  │◄────│ name            │◄────│ bot_id (FK)     │
│ created_at      │     │ description     │     │ contributor_id  │
│ contribution_   │     │ icon            │     │ label           │
│   power         │     │ category        │     │ content         │
│ total_citations │     │ created_at      │     │ citation_count  │
│ pending_wld     │     └─────────────────┘     │ created_at      │
└─────────────────┘                             └─────────────────┘
                                                        │
                               ┌────────────────────────┘
                               ▼
                        ┌─────────────────┐
                        │ knowledge_edges │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ source_id (FK)  │
                        │ target_id (FK)  │
                        │ relationship    │
                        └─────────────────┘

                        ┌─────────────────┐
                        │    citations    │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ node_id (FK)    │
                        │ user_id (FK)    │
                        │ created_at      │
                        └─────────────────┘
```

### 2.2 SQL 스키마 (Supabase SQL Editor에서 실행)

```sql
-- =====================================================
-- SEED VAULT DATABASE SCHEMA
-- 실행 순서대로 복사해서 Supabase SQL Editor에서 실행
-- =====================================================

-- 1. Users 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nullifier_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  contribution_power INTEGER DEFAULT 0 CHECK (contribution_power >= 0 AND contribution_power <= 100),
  total_citations INTEGER DEFAULT 0,
  pending_wld DECIMAL(18, 8) DEFAULT 0
);

-- nullifier_hash 검색을 위한 인덱스
CREATE INDEX idx_users_nullifier ON users(nullifier_hash);

-- 2. Expert Bots 테이블
CREATE TABLE expert_bots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Knowledge Nodes 테이블
CREATE TABLE knowledge_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES expert_bots(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contributor_display TEXT NOT NULL, -- 익명화된 표시명 (0x1a2b...anon)
  label TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 20 AND char_length(content) <= 2000),
  citation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스: bot_id로 노드 조회
CREATE INDEX idx_nodes_bot ON knowledge_nodes(bot_id);
-- 인덱스: contributor로 본인 기여 조회
CREATE INDEX idx_nodes_contributor ON knowledge_nodes(contributor_id);

-- 4. Knowledge Edges 테이블 (노드 간 관계)
CREATE TABLE knowledge_edges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, target_id)
);

CREATE INDEX idx_edges_source ON knowledge_edges(source_id);
CREATE INDEX idx_edges_target ON knowledge_edges(target_id);

-- 5. Citations 테이블 (인용 기록)
CREATE TABLE citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  cited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  question_text TEXT, -- 어떤 질문에서 인용되었는지
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citations_node ON citations(node_id);
CREATE INDEX idx_citations_user ON citations(cited_by_user_id);

-- 6. User Contributions 테이블 (사용자별 기여 기록)
CREATE TABLE user_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  bot_id TEXT NOT NULL REFERENCES expert_bots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, node_id)
);

CREATE INDEX idx_contributions_user ON user_contributions(user_id);

-- =====================================================
-- VIEWS (집계 쿼리 최적화)
-- =====================================================

-- 봇별 통계 뷰
CREATE VIEW bot_stats AS
SELECT
  eb.id,
  eb.name,
  eb.description,
  eb.icon,
  eb.category,
  COUNT(DISTINCT kn.id) as node_count,
  COUNT(DISTINCT kn.contributor_id) as contributor_count
FROM expert_bots eb
LEFT JOIN knowledge_nodes kn ON eb.id = kn.bot_id
GROUP BY eb.id;

-- 글로벌 통계 뷰
CREATE VIEW global_stats AS
SELECT
  (SELECT COUNT(*) FROM knowledge_nodes) as total_nodes,
  (SELECT COUNT(DISTINCT contributor_id) FROM knowledge_nodes WHERE contributor_id IS NOT NULL) as total_contributors,
  (SELECT COUNT(*) FROM expert_bots) as total_bots;

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contributions ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (모든 사용자가 노드 읽기 가능)
CREATE POLICY "Public read for nodes" ON knowledge_nodes
  FOR SELECT USING (true);

CREATE POLICY "Public read for bots" ON expert_bots
  FOR SELECT USING (true);

CREATE POLICY "Public read for edges" ON knowledge_edges
  FOR SELECT USING (true);

-- 익명 키로 노드 생성 허용 (service role 사용)
CREATE POLICY "Service role insert nodes" ON knowledge_nodes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role insert citations" ON citations
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNCTIONS (비즈니스 로직)
-- =====================================================

-- 인용 시 citation_count 자동 증가 + 기여자 보상 업데이트
CREATE OR REPLACE FUNCTION increment_citation(
  p_node_id UUID,
  p_cited_by_user_id UUID,
  p_question_text TEXT
) RETURNS void AS $$
DECLARE
  v_contributor_id UUID;
BEGIN
  -- 1. 인용 기록 추가
  INSERT INTO citations (node_id, cited_by_user_id, question_text)
  VALUES (p_node_id, p_cited_by_user_id, p_question_text);

  -- 2. 노드의 citation_count 증가
  UPDATE knowledge_nodes
  SET citation_count = citation_count + 1
  WHERE id = p_node_id
  RETURNING contributor_id INTO v_contributor_id;

  -- 3. 기여자의 total_citations, pending_wld 증가
  IF v_contributor_id IS NOT NULL THEN
    UPDATE users
    SET
      total_citations = total_citations + 1,
      pending_wld = pending_wld + 0.001 -- 인용당 0.001 WLD
    WHERE id = v_contributor_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 보상 수령 함수
CREATE OR REPLACE FUNCTION claim_rewards(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_amount DECIMAL;
BEGIN
  SELECT pending_wld INTO v_amount FROM users WHERE id = p_user_id;

  UPDATE users SET pending_wld = 0 WHERE id = p_user_id;

  RETURN v_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 노드 추가 시 contribution_power 증가
CREATE OR REPLACE FUNCTION add_contribution(
  p_bot_id TEXT,
  p_contributor_id UUID,
  p_contributor_display TEXT,
  p_label TEXT,
  p_content TEXT
) RETURNS UUID AS $$
DECLARE
  v_node_id UUID;
BEGIN
  -- 1. 노드 생성
  INSERT INTO knowledge_nodes (bot_id, contributor_id, contributor_display, label, content)
  VALUES (p_bot_id, p_contributor_id, p_contributor_display, p_label, p_content)
  RETURNING id INTO v_node_id;

  -- 2. 사용자 contribution_power 증가 (최대 100)
  UPDATE users
  SET contribution_power = LEAST(contribution_power + 5, 100)
  WHERE id = p_contributor_id;

  -- 3. user_contributions에 기록
  INSERT INTO user_contributions (user_id, node_id, bot_id)
  VALUES (p_contributor_id, v_node_id, p_bot_id);

  RETURN v_node_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA (기존 mock 데이터 마이그레이션)
-- =====================================================

-- Expert Bots 초기 데이터
INSERT INTO expert_bots (id, name, description, icon, category) VALUES
  ('seoul-local-guide', '서울 로컬 가이드', '서울의 숨은 명소와 맛집을 알려드립니다', '🗺️', '여행'),
  ('obgyn-specialist', '산부인과 전문의', '임신, 출산, 여성 건강에 대한 전문 지식', '👩‍⚕️', '의료'),
  ('korean-recipes', '한식 레시피 마스터', '전통 한식부터 현대적 퓨전까지', '🍲', '요리'),
  ('startup-mentor', '스타트업 멘토', '창업, 투자, 스케일업 경험 공유', '🚀', '비즈니스');

-- 초기 지식 노드 (서울 로컬 가이드)
INSERT INTO knowledge_nodes (id, bot_id, contributor_display, label, content, citation_count, created_at) VALUES
  ('11111111-1111-1111-1111-111111111101', 'seoul-local-guide', '0x1a2b...anon', '을지로 골목 맛집', '을지로 3가역 근처 노가리 골목은 퇴근 후 직장인들의 성지입니다. 특히 "을지OB베어"는 40년 전통의 노가리집으로 유명합니다.', 156, '2025-12-15'),
  ('11111111-1111-1111-1111-111111111102', 'seoul-local-guide', '0x3c4d...anon', '익선동 한옥 카페', '익선동 한옥마을은 100년된 한옥들이 카페와 레스토랑으로 변신한 곳입니다. "열두달"은 계절별 디저트가 인기입니다.', 89, '2025-12-20'),
  ('11111111-1111-1111-1111-111111111103', 'seoul-local-guide', '0x5e6f...anon', '성수동 카페거리', '성수동은 폐공장들이 힙한 카페로 변신한 곳입니다. "대림창고"와 "어니언" 카페가 대표적입니다.', 203, '2026-01-05'),
  ('11111111-1111-1111-1111-111111111104', 'seoul-local-guide', '0x7g8h...anon', '망원동 로컬 마켓', '망원시장은 젊은 감성의 로컬 마켓입니다. 망원역 2번 출구에서 도보 5분, 떡볶이와 순대가 유명합니다.', 67, '2026-01-10'),
  ('11111111-1111-1111-1111-111111111105', 'seoul-local-guide', '0x9i0j...anon', '연남동 경의선숲길', '경의선 폐철로가 공원으로 변신한 경의선숲길. 연남동 구간은 카페와 맛집이 밀집해 있어 산책하기 좋습니다.', 145, '2026-01-15');

-- 서울 로컬 가이드 엣지
INSERT INTO knowledge_edges (source_id, target_id, relationship) VALUES
  ('11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111102', '도보 15분'),
  ('11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111103', '지하철 20분'),
  ('11111111-1111-1111-1111-111111111103', '11111111-1111-1111-1111-111111111104', '버스 25분'),
  ('11111111-1111-1111-1111-111111111104', '11111111-1111-1111-1111-111111111105', '도보 10분'),
  ('11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111105', '지하철 15분');

-- 산부인과 전문의 노드
INSERT INTO knowledge_nodes (id, bot_id, contributor_display, label, content, citation_count, created_at) VALUES
  ('22222222-2222-2222-2222-222222222201', 'obgyn-specialist', '0xmed1...anon', '임신 초기 증상', '임신 초기(4-8주)에는 입덧, 피로감, 유방 통증 등이 나타날 수 있습니다. 생리 예정일이 지났다면 임신 테스트를 권장합니다.', 892, '2025-11-20'),
  ('22222222-2222-2222-2222-222222222202', 'obgyn-specialist', '0xmed2...anon', '산전 검사 일정', '임신 확인 후 첫 산전검사는 8-12주에 시행합니다. 기형아 검사(15-20주), 정밀초음파(20-24주) 등을 계획합니다.', 567, '2025-11-25'),
  ('22222222-2222-2222-2222-222222222203', 'obgyn-specialist', '0xmed3...anon', '출산 준비물', '출산 2주 전부터 입원 가방을 준비하세요. 산모수첩, 속옷, 수유패드, 산후대, 신생아 옷 등이 필요합니다.', 423, '2025-12-01');

INSERT INTO knowledge_edges (source_id, target_id, relationship) VALUES
  ('22222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222202', '다음 단계'),
  ('22222222-2222-2222-2222-222222222202', '22222222-2222-2222-2222-222222222203', '준비사항');

-- 한식 레시피 마스터 노드
INSERT INTO knowledge_nodes (id, bot_id, contributor_display, label, content, citation_count, created_at) VALUES
  ('33333333-3333-3333-3333-333333333301', 'korean-recipes', '0xchef1...anon', '김치찌개 황금레시피', '묵은지 200g, 돼지고기 150g, 두부 반모. 돼지고기를 먼저 볶다가 김치를 넣고 5분 볶은 후 물 500ml를 넣고 끓입니다.', 1234, '2025-10-15'),
  ('33333333-3333-3333-3333-333333333302', 'korean-recipes', '0xchef2...anon', '된장찌개 기본', '된장 2큰술, 애호박, 두부, 양파, 청양고추. 멸치육수에 된장을 풀고 채소를 넣어 10분 끓입니다.', 987, '2025-10-20');

INSERT INTO knowledge_edges (source_id, target_id, relationship) VALUES
  ('33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333302', '함께 먹으면 좋은');

-- 스타트업 멘토 노드
INSERT INTO knowledge_nodes (id, bot_id, contributor_display, label, content, citation_count, created_at) VALUES
  ('44444444-4444-4444-4444-444444444401', 'startup-mentor', '0xfounder1...anon', 'MVP 개발 전략', '첫 MVP는 3개월 안에 출시하세요. 핵심 기능 하나에 집중하고, 사용자 피드백으로 방향을 잡습니다.', 456, '2025-09-10'),
  ('44444444-4444-4444-4444-444444444402', 'startup-mentor', '0xfounder2...anon', '시드 투자 유치', '시드 라운드는 보통 5-10억 규모입니다. 팀, 시장, 트랙션 세 가지를 명확히 보여주세요.', 321, '2025-09-15');

INSERT INTO knowledge_edges (source_id, target_id, relationship) VALUES
  ('44444444-4444-4444-4444-444444444401', '44444444-4444-4444-4444-444444444402', '다음 단계');

-- Realtime 구독 활성화 (Supabase Dashboard에서도 가능)
-- ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_nodes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE citations;
```

---

## 3. 파일 수정 계획

### 3.1 신규 파일 생성

#### `/src/lib/supabase.ts` - Supabase 클라이언트

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side용 service role client (API Routes에서 사용)
export const createServiceClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, serviceKey)
}
```

#### `/src/lib/database.types.ts` - TypeScript 타입 정의

```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nullifier_hash: string
          created_at: string
          contribution_power: number
          total_citations: number
          pending_wld: number
        }
        Insert: {
          id?: string
          nullifier_hash: string
          created_at?: string
          contribution_power?: number
          total_citations?: number
          pending_wld?: number
        }
        Update: {
          contribution_power?: number
          total_citations?: number
          pending_wld?: number
        }
      }
      expert_bots: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['expert_bots']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['expert_bots']['Insert']>
      }
      knowledge_nodes: {
        Row: {
          id: string
          bot_id: string
          contributor_id: string | null
          contributor_display: string
          label: string
          content: string
          citation_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_nodes']['Row'], 'id' | 'created_at' | 'citation_count'>
        Update: Partial<Database['public']['Tables']['knowledge_nodes']['Insert']>
      }
      knowledge_edges: {
        Row: {
          id: string
          source_id: string
          target_id: string
          relationship: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_edges']['Row'], 'id' | 'created_at'>
        Update: never
      }
      citations: {
        Row: {
          id: string
          node_id: string
          cited_by_user_id: string | null
          question_text: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['citations']['Row'], 'id' | 'created_at'>
        Update: never
      }
      user_contributions: {
        Row: {
          id: string
          user_id: string
          node_id: string
          bot_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_contributions']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: {
      bot_stats: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          node_count: number
          contributor_count: number
        }
      }
      global_stats: {
        Row: {
          total_nodes: number
          total_contributors: number
          total_bots: number
        }
      }
    }
    Functions: {
      increment_citation: {
        Args: {
          p_node_id: string
          p_cited_by_user_id: string | null
          p_question_text: string | null
        }
        Returns: void
      }
      claim_rewards: {
        Args: { p_user_id: string }
        Returns: number
      }
      add_contribution: {
        Args: {
          p_bot_id: string
          p_contributor_id: string
          p_contributor_display: string
          p_label: string
          p_content: string
        }
        Returns: string
      }
    }
  }
}
```

#### `/src/lib/api.ts` - 데이터베이스 API 래퍼

```typescript
import { supabase } from './supabase'
import type { ExpertBot, KnowledgeNode, KnowledgeEdge } from './types'

// ==========================================
// Bot 관련 API
// ==========================================

export async function getAllBots(): Promise<ExpertBot[]> {
  const { data, error } = await supabase
    .from('bot_stats')
    .select('*')

  if (error) throw error

  // 각 봇의 그래프 데이터 가져오기
  const botsWithGraphs = await Promise.all(
    data.map(async (bot) => {
      const graph = await getBotGraph(bot.id)
      return {
        id: bot.id,
        name: bot.name,
        description: bot.description,
        icon: bot.icon,
        category: bot.category,
        nodeCount: bot.node_count || 0,
        contributorCount: bot.contributor_count || 0,
        graph
      }
    })
  )

  return botsWithGraphs
}

export async function getBotById(botId: string): Promise<ExpertBot | null> {
  const { data: bot, error } = await supabase
    .from('bot_stats')
    .select('*')
    .eq('id', botId)
    .single()

  if (error || !bot) return null

  const graph = await getBotGraph(botId)

  return {
    id: bot.id,
    name: bot.name,
    description: bot.description,
    icon: bot.icon,
    category: bot.category,
    nodeCount: bot.node_count || 0,
    contributorCount: bot.contributor_count || 0,
    graph
  }
}

export async function getBotGraph(botId: string): Promise<{
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}> {
  // 노드 가져오기
  const { data: nodes, error: nodesError } = await supabase
    .from('knowledge_nodes')
    .select('*')
    .eq('bot_id', botId)
    .order('created_at', { ascending: true })

  if (nodesError) throw nodesError

  // 해당 봇의 노드 ID들
  const nodeIds = nodes?.map(n => n.id) || []

  // 엣지 가져오기
  const { data: edges, error: edgesError } = await supabase
    .from('knowledge_edges')
    .select('*')
    .in('source_id', nodeIds)

  if (edgesError) throw edgesError

  return {
    nodes: (nodes || []).map(n => ({
      id: n.id,
      label: n.label,
      content: n.content,
      contributor: n.contributor_display,
      createdAt: n.created_at.split('T')[0],
      citationCount: n.citation_count
    })),
    edges: (edges || []).map(e => ({
      source: e.source_id,
      target: e.target_id,
      relationship: e.relationship
    }))
  }
}

// ==========================================
// 사용자 관련 API
// ==========================================

export async function getOrCreateUser(nullifierHash: string) {
  // 기존 사용자 찾기
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('nullifier_hash', nullifierHash)
    .single()

  if (existing) return existing

  // 새 사용자 생성
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ nullifier_hash: nullifierHash })
    .select()
    .single()

  if (error) throw error
  return newUser
}

export async function getUserRewards(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('contribution_power, total_citations, pending_wld')
    .eq('id', userId)
    .single()

  if (error) throw error
  return user
}

export async function getUserContributions(userId: string) {
  const { data, error } = await supabase
    .from('user_contributions')
    .select(`
      *,
      knowledge_nodes (label, citation_count),
      expert_bots (name, icon)
    `)
    .eq('user_id', userId)
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
  contributorDisplay: string,
  label: string,
  content: string
): Promise<string> {
  const { data, error } = await supabase.rpc('add_contribution', {
    p_bot_id: botId,
    p_contributor_id: userId,
    p_contributor_display: contributorDisplay,
    p_label: label,
    p_content: content
  })

  if (error) throw error
  return data as string
}

// ==========================================
// 인용 관련 API
// ==========================================

export async function recordCitations(
  nodeIds: string[],
  userId: string | null,
  questionText: string
) {
  // 각 노드에 대해 인용 기록
  for (const nodeId of nodeIds) {
    await supabase.rpc('increment_citation', {
      p_node_id: nodeId,
      p_cited_by_user_id: userId,
      p_question_text: questionText
    })
  }
}

// ==========================================
// 보상 관련 API
// ==========================================

export async function claimRewards(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('claim_rewards', {
    p_user_id: userId
  })

  if (error) throw error
  return data as number
}

// ==========================================
// 통계 관련 API
// ==========================================

export async function getGlobalStats() {
  const { data, error } = await supabase
    .from('global_stats')
    .select('*')
    .single()

  if (error) throw error
  return data
}

// ==========================================
// Realtime 구독
// ==========================================

export function subscribeToNodeUpdates(
  botId: string,
  callback: (node: KnowledgeNode) => void
) {
  return supabase
    .channel(`nodes:${botId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'knowledge_nodes',
        filter: `bot_id=eq.${botId}`
      },
      (payload) => {
        const n = payload.new as any
        callback({
          id: n.id,
          label: n.label,
          content: n.content,
          contributor: n.contributor_display,
          createdAt: n.created_at.split('T')[0],
          citationCount: n.citation_count
        })
      }
    )
    .subscribe()
}

export function subscribeToGlobalStats(
  callback: (stats: { total_nodes: number; total_contributors: number; total_bots: number }) => void
) {
  // 10초마다 글로벌 통계 폴링 (Realtime보다 효율적)
  const interval = setInterval(async () => {
    const stats = await getGlobalStats()
    if (stats) callback(stats)
  }, 10000)

  return { unsubscribe: () => clearInterval(interval) }
}
```

### 3.2 기존 파일 수정

#### `/src/stores/userStore.ts` - 전면 리팩토링

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as api from '@/lib/api'
import type { UserRewards, KnowledgeNode } from '@/lib/types'

interface GlobalStats {
  totalNodes: number
  totalContributors: number
  totalBots: number
}

interface UserState {
  // 인증 상태 (로컬 캐시)
  isVerified: boolean
  nullifierHash: string | null
  userId: string | null

  // 보상 데이터 (서버에서 로드)
  rewards: UserRewards
  globalStats: GlobalStats
  isLoading: boolean

  // Actions
  setVerified: (verified: boolean, nullifierHash?: string) => Promise<void>
  loadUserData: () => Promise<void>
  addContribution: (botId: string, label: string, content: string) => Promise<string>
  claimRewards: () => Promise<number>
  loadGlobalStats: () => Promise<void>
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isVerified: false,
      nullifierHash: null,
      userId: null,
      rewards: {
        contributionPower: 0,
        totalCitations: 0,
        pendingWLD: 0,
        contributions: []
      },
      globalStats: {
        totalNodes: 0,
        totalContributors: 0,
        totalBots: 0
      },
      isLoading: false,

      setVerified: async (verified, nullifierHash) => {
        if (!verified || !nullifierHash) {
          set({ isVerified: false, nullifierHash: null, userId: null })
          return
        }

        try {
          // Supabase에서 사용자 생성/조회
          const user = await api.getOrCreateUser(nullifierHash)

          set({
            isVerified: true,
            nullifierHash,
            userId: user.id
          })

          // 사용자 데이터 로드
          await get().loadUserData()
        } catch (error) {
          console.error('Failed to verify user:', error)
          set({ isVerified: false, nullifierHash: null, userId: null })
        }
      },

      loadUserData: async () => {
        const { userId } = get()
        if (!userId) return

        set({ isLoading: true })

        try {
          const [rewards, contributions] = await Promise.all([
            api.getUserRewards(userId),
            api.getUserContributions(userId)
          ])

          set({
            rewards: {
              contributionPower: rewards.contribution_power,
              totalCitations: rewards.total_citations,
              pendingWLD: Number(rewards.pending_wld),
              contributions: contributions.map(c => ({
                botId: c.bot_id,
                nodeId: c.node_id,
                createdAt: c.created_at,
                label: c.knowledge_nodes?.label,
                citationCount: c.knowledge_nodes?.citation_count || 0,
                botName: c.expert_bots?.name,
                botIcon: c.expert_bots?.icon
              }))
            }
          })
        } catch (error) {
          console.error('Failed to load user data:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      addContribution: async (botId, label, content) => {
        const { userId, nullifierHash } = get()
        if (!userId || !nullifierHash) throw new Error('Not authenticated')

        const contributorDisplay = nullifierHash.slice(0, 6) + '...' + 'anon'

        const nodeId = await api.addContribution(
          botId,
          userId,
          contributorDisplay,
          label,
          content
        )

        // 로컬 상태 즉시 업데이트
        set(state => ({
          rewards: {
            ...state.rewards,
            contributionPower: Math.min(state.rewards.contributionPower + 5, 100),
            contributions: [
              {
                botId,
                nodeId,
                createdAt: new Date().toISOString(),
                label
              },
              ...state.rewards.contributions
            ]
          }
        }))

        // 글로벌 통계 리프레시
        get().loadGlobalStats()

        return nodeId
      },

      claimRewards: async () => {
        const { userId } = get()
        if (!userId) return 0

        const amount = await api.claimRewards(userId)

        set(state => ({
          rewards: {
            ...state.rewards,
            pendingWLD: 0
          }
        }))

        return amount
      },

      loadGlobalStats: async () => {
        try {
          const stats = await api.getGlobalStats()
          if (stats) {
            set({
              globalStats: {
                totalNodes: stats.total_nodes,
                totalContributors: stats.total_contributors,
                totalBots: stats.total_bots
              }
            })
          }
        } catch (error) {
          console.error('Failed to load global stats:', error)
        }
      },

      logout: () => {
        set({
          isVerified: false,
          nullifierHash: null,
          userId: null,
          rewards: {
            contributionPower: 0,
            totalCitations: 0,
            pendingWLD: 0,
            contributions: []
          }
        })
      }
    }),
    {
      name: 'seed-vault-user',
      // 서버 데이터는 persist하지 않음 (인증 정보만)
      partialize: (state) => ({
        isVerified: state.isVerified,
        nullifierHash: state.nullifierHash,
        userId: state.userId
      })
    }
  )
)
```

#### `/src/lib/mock-data.ts` - API 래퍼로 교체

```typescript
// 이 파일은 점진적 마이그레이션을 위해 유지
// 실제 API 호출과 fallback 로직 포함

import * as api from './api'
import type { ExpertBot, KnowledgeNode, ContributionReceipt } from './types'

// 캐시된 봇 데이터 (SSR/초기 로딩용)
let cachedBots: ExpertBot[] | null = null

export async function getExpertBots(): Promise<ExpertBot[]> {
  if (cachedBots) return cachedBots

  try {
    cachedBots = await api.getAllBots()
    return cachedBots
  } catch (error) {
    console.error('Failed to fetch bots:', error)
    return [] // fallback
  }
}

export async function getBotById(id: string): Promise<ExpertBot | undefined> {
  try {
    const bot = await api.getBotById(id)
    return bot || undefined
  } catch (error) {
    console.error('Failed to fetch bot:', error)
    return undefined
  }
}

// 인용 기여도 계산 (변경 없음)
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

// Mock 답변 생성 (나중에 실제 AI로 교체 가능)
export const generateMockAnswer = (question: string, bot: ExpertBot): {
  answer: string
  usedNodes: string[]
} => {
  const keywords = question.toLowerCase()
  const nodes = bot.graph.nodes

  const matchedNodes = nodes.filter(node =>
    keywords.includes(node.label.slice(0, 3).toLowerCase()) ||
    node.content.toLowerCase().includes(keywords.slice(0, 5))
  )

  const usedNodes = matchedNodes.length > 0
    ? matchedNodes.slice(0, 3)
    : nodes.slice(0, 2)

  const answer = usedNodes.map(n => n.content).join('\n\n')

  return {
    answer: answer || '죄송합니다. 해당 질문에 대한 정보를 찾지 못했습니다.',
    usedNodes: usedNodes.map(n => n.id)
  }
}
```

#### `/src/app/contribute/[botId]/page.tsx` - 실제 저장 로직

**수정 사항:**
1. `getBotById`를 async로 변경
2. `addContribution`에 실제 API 호출
3. 에러 핸들링 추가

```typescript
// 주요 변경점만 표시

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBotById } from '@/lib/mock-data'
import { useUserStore } from '@/stores/userStore'
import { VerifyButton } from '@/components/VerifyButton'
import type { ExpertBot } from '@/lib/types'

export default function ContributePage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.botId as string

  const [bot, setBot] = useState<ExpertBot | null>(null)
  const [isLoadingBot, setIsLoadingBot] = useState(true)

  const { isVerified, addContribution } = useUserStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 봇 데이터 로드
  useEffect(() => {
    async function loadBot() {
      const botData = await getBotById(botId)
      setBot(botData || null)
      setIsLoadingBot(false)
    }
    loadBot()
  }, [botId])

  if (isLoadingBot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">봇을 찾을 수 없습니다</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || content.length < 20) return

    setIsSubmitting(true)
    setError(null)

    try {
      // 실제 Supabase에 저장
      await addContribution(botId, title, content)
      setShowSuccess(true)
    } catch (err) {
      console.error('Failed to submit:', err)
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ... 나머지 JSX는 동일, error 표시 추가
}
```

#### `/src/app/explore/[botId]/page.tsx` - 인용 기록 저장

**수정 사항:**
1. 질문 시 `recordCitations` 호출
2. Realtime 구독으로 새 노드 실시간 표시

```typescript
// 주요 변경점

import { recordCitations } from '@/lib/api'
import { subscribeToNodeUpdates } from '@/lib/api'

// handleSubmit 내부에서:
const handleSubmit = async (e: React.FormEvent) => {
  // ... 기존 로직 ...

  // 인용 기록 저장 (비동기, 에러 무시)
  recordCitations(result.usedNodes, userId, question).catch(console.error)
}

// useEffect에서 realtime 구독:
useEffect(() => {
  if (!bot) return

  const subscription = subscribeToNodeUpdates(bot.id, (newNode) => {
    // 새 노드가 추가되면 그래프 업데이트
    setBot(prev => prev ? {
      ...prev,
      graph: {
        ...prev.graph,
        nodes: [...prev.graph.nodes, newNode]
      }
    } : null)
  })

  return () => {
    subscription.unsubscribe()
  }
}, [bot?.id])
```

### 3.3 환경 변수 설정

#### `.env.local` 추가 (`.env.example` 참고)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # 서버 사이드 전용

# World ID (기존)
NEXT_PUBLIC_WLD_APP_ID=app_...
```

---

## 4. 구현 우선순위 및 시간 추정

### Phase 1: 기반 설정 (30분)
| 작업 | 예상 시간 |
|------|----------|
| Supabase 프로젝트 생성 | 5분 |
| SQL 스키마 실행 | 10분 |
| 초기 데이터 삽입 | 5분 |
| 환경 변수 설정 | 5분 |
| `@supabase/supabase-js` 설치 | 5분 |

```bash
npm install @supabase/supabase-js
```

### Phase 2: 핵심 파일 생성 (45분)
| 작업 | 예상 시간 |
|------|----------|
| `/src/lib/supabase.ts` 생성 | 5분 |
| `/src/lib/database.types.ts` 생성 | 10분 |
| `/src/lib/api.ts` 생성 | 20분 |
| `/src/stores/userStore.ts` 리팩토링 | 10분 |

### Phase 3: 페이지 연동 (45분)
| 작업 | 예상 시간 |
|------|----------|
| `/src/lib/mock-data.ts` async 래퍼 | 10분 |
| `/src/app/page.tsx` 수정 | 10분 |
| `/src/app/contribute/[botId]/page.tsx` 수정 | 15분 |
| `/src/app/explore/[botId]/page.tsx` 수정 | 10분 |

### Phase 4: 테스트 및 디버깅 (30분)
| 작업 | 예상 시간 |
|------|----------|
| 로컬 테스트 | 15분 |
| 에러 수정 | 10분 |
| 최종 확인 | 5분 |

### 총 예상 시간: **2시간 30분**

---

## 5. 체크리스트

### 완료 기준
- [ ] Supabase 프로젝트 생성 및 스키마 적용
- [ ] 환경 변수 설정 완료
- [ ] 사용자 인증 시 DB에 레코드 생성됨
- [ ] 지식 기여 시 `knowledge_nodes`에 저장됨
- [ ] 질문 시 `citations` 테이블에 기록됨
- [ ] 보상 페이지에서 실제 `pending_wld` 표시
- [ ] Claim 버튼 클릭 시 DB 업데이트
- [ ] 글로벌 통계가 실제 데이터 반영
- [ ] 새 노드 추가 시 다른 사용자에게 실시간 표시

### 테스트 시나리오
1. **신규 사용자 플로우**
   - World ID 인증 -> `users` 테이블에 레코드 생성 확인

2. **지식 기여 플로우**
   - 봇 선택 -> 지식 입력 -> 저장
   - Supabase 대시보드에서 `knowledge_nodes` 확인

3. **인용 플로우**
   - 질문 입력 -> 답변 생성
   - `citations` 테이블에 기록 확인
   - 해당 노드의 `citation_count` 증가 확인

4. **보상 플로우**
   - 보상 페이지에서 `pending_wld` 확인
   - Claim 버튼 -> `pending_wld` 0으로 리셋 확인

---

## 6. 다음 단계 (MVP 이후)

1. **실제 World ID 연동**
   - Mock에서 실제 World ID SDK로 전환
   - Nullifier hash 검증 로직

2. **AI 답변 통합**
   - OpenAI API 연동
   - RAG (Retrieval Augmented Generation) 구현

3. **WLD 토큰 통합**
   - 실제 블록체인 트랜잭션
   - 스마트 컨트랙트 연동

4. **성능 최적화**
   - Edge Functions 활용
   - 캐싱 전략

---

**문서 작성 완료. 실행만 남았습니다.**
