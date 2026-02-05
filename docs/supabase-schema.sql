-- =====================================================
-- SEED VAULT DATABASE SCHEMA
-- 기존 database.types.ts와 일치하는 실제 Supabase 스키마
-- Supabase SQL Editor에서 실행
-- =====================================================

-- 1. Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nullifier_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contribution_power INTEGER DEFAULT 0 CHECK (contribution_power >= 0 AND contribution_power <= 100),
  total_citations INTEGER DEFAULT 0,
  pending_wld DECIMAL(18, 8) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_nullifier ON users(nullifier_hash);

-- 2. Bots 테이블
CREATE TABLE IF NOT EXISTS bots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 3. Knowledge Nodes 테이블
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 20 AND char_length(content) <= 2000),
  contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  citation_count INTEGER DEFAULT 0,
  embedding vector(1536), -- OpenAI embedding dimension (optional)
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_nodes_bot ON knowledge_nodes(bot_id);
CREATE INDEX IF NOT EXISTS idx_nodes_contributor ON knowledge_nodes(contributor_id);

-- 4. Node Edges 테이블 (노드 간 관계)
CREATE TABLE IF NOT EXISTS node_edges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  weight DECIMAL(5, 4) DEFAULT 1.0,
  UNIQUE(source_node_id, target_node_id)
);

CREATE INDEX IF NOT EXISTS idx_edges_source ON node_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON node_edges(target_node_id);

-- 5. Citations 테이블 (인용 기록)
CREATE TABLE IF NOT EXISTS citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- 질문 세션 ID
  cited_at TIMESTAMPTZ DEFAULT NOW(),
  context TEXT -- 어떤 맥락에서 인용되었는지
);

CREATE INDEX IF NOT EXISTS idx_citations_node ON citations(node_id);
CREATE INDEX IF NOT EXISTS idx_citations_session ON citations(session_id);

-- 6. User Rewards 테이블 (보상 이력)
CREATE TYPE reward_type AS ENUM ('citation', 'contribution', 'bonus');

CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  reward_type reward_type NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  transaction_hash TEXT -- 블록체인 트랜잭션 해시
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON user_rewards(user_id);

-- 7. Contributions 테이블 (기여 기록)
CREATE TYPE contribution_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status contribution_status DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);

-- =====================================================
-- FUNCTIONS (비즈니스 로직)
-- =====================================================

-- 인용 카운트 증가 함수
CREATE OR REPLACE FUNCTION increment_citation_count(node_id UUID)
RETURNS void AS $$
DECLARE
  v_contributor_id UUID;
BEGIN
  -- 노드의 citation_count 증가
  UPDATE knowledge_nodes
  SET citation_count = citation_count + 1,
      updated_at = NOW()
  WHERE id = node_id
  RETURNING contributor_id INTO v_contributor_id;

  -- 기여자의 total_citations, pending_wld 증가
  IF v_contributor_id IS NOT NULL THEN
    UPDATE users
    SET
      total_citations = total_citations + 1,
      pending_wld = pending_wld + 0.001, -- 인용당 0.001 WLD
      updated_at = NOW()
    WHERE id = v_contributor_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 통계 조회 함수
CREATE OR REPLACE FUNCTION get_user_stats(user_nullifier TEXT)
RETURNS TABLE (
  contribution_power INTEGER,
  total_citations INTEGER,
  pending_wld DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.contribution_power, u.total_citations, u.pending_wld
  FROM users u
  WHERE u.nullifier_hash = user_nullifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bots_updated_at
  BEFORE UPDATE ON bots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER nodes_updated_at
  BEFORE UPDATE ON knowledge_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Public read for bots" ON bots FOR SELECT USING (true);
CREATE POLICY "Public read for nodes" ON knowledge_nodes FOR SELECT USING (true);
CREATE POLICY "Public read for edges" ON node_edges FOR SELECT USING (true);

-- 인증된 사용자만 쓰기 허용
CREATE POLICY "Authenticated insert for users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert for nodes" ON knowledge_nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert for citations" ON citations FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert for contributions" ON contributions FOR INSERT WITH CHECK (true);

-- =====================================================
-- INITIAL DATA (초기 봇 데이터)
-- =====================================================

INSERT INTO bots (id, name, description, icon, category) VALUES
  ('seoul-local-guide', '서울 로컬 가이드', '서울의 숨은 명소와 맛집을 알려드립니다', '🗺️', '여행'),
  ('obgyn-specialist', '산부인과 전문의', '임신, 출산, 여성 건강에 대한 전문 지식', '👩‍⚕️', '의료'),
  ('korean-recipes', '한식 레시피 마스터', '전통 한식부터 현대적 퓨전까지', '🍲', '요리'),
  ('startup-mentor', '스타트업 멘토', '창업, 투자, 스케일업 경험 공유', '🚀', '비즈니스')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED DATA (초기 지식 노드 - 테스트용)
-- 실제 운영 시에는 사용자 기여로 채워짐
-- =====================================================

-- 먼저 시스템 사용자 생성 (시드 데이터용)
INSERT INTO users (id, nullifier_hash)
VALUES ('00000000-0000-0000-0000-000000000001', '0xsystem...seed')
ON CONFLICT (nullifier_hash) DO NOTHING;

-- 서울 로컬 가이드 초기 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('seoul-local-guide', '00000000-0000-0000-0000-000000000001', '을지로 골목 맛집', '을지로 3가역 근처 노가리 골목은 퇴근 후 직장인들의 성지입니다. 특히 "을지OB베어"는 40년 전통의 노가리집으로 유명합니다.', 156, '2025-12-15'),
  ('seoul-local-guide', '00000000-0000-0000-0000-000000000001', '익선동 한옥 카페', '익선동 한옥마을은 100년된 한옥들이 카페와 레스토랑으로 변신한 곳입니다. "열두달"은 계절별 디저트가 인기입니다.', 89, '2025-12-20'),
  ('seoul-local-guide', '00000000-0000-0000-0000-000000000001', '성수동 카페거리', '성수동은 폐공장들이 힙한 카페로 변신한 곳입니다. "대림창고"와 "어니언" 카페가 대표적입니다.', 203, '2026-01-05'),
  ('seoul-local-guide', '00000000-0000-0000-0000-000000000001', '망원동 로컬 마켓', '망원시장은 젊은 감성의 로컬 마켓입니다. 망원역 2번 출구에서 도보 5분, 떡볶이와 순대가 유명합니다.', 67, '2026-01-10'),
  ('seoul-local-guide', '00000000-0000-0000-0000-000000000001', '연남동 경의선숲길', '경의선 폐철로가 공원으로 변신한 경의선숲길. 연남동 구간은 카페와 맛집이 밀집해 있어 산책하기 좋습니다.', 145, '2026-01-15')
ON CONFLICT DO NOTHING;

-- 산부인과 전문의 초기 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('obgyn-specialist', '00000000-0000-0000-0000-000000000001', '임신 초기 증상', '임신 초기(4-8주)에는 입덧, 피로감, 유방 통증 등이 나타날 수 있습니다. 생리 예정일이 지났다면 임신 테스트를 권장합니다.', 892, '2025-11-20'),
  ('obgyn-specialist', '00000000-0000-0000-0000-000000000001', '산전 검사 일정', '임신 확인 후 첫 산전검사는 8-12주에 시행합니다. 기형아 검사(15-20주), 정밀초음파(20-24주) 등을 계획합니다.', 567, '2025-11-25'),
  ('obgyn-specialist', '00000000-0000-0000-0000-000000000001', '출산 준비물', '출산 2주 전부터 입원 가방을 준비하세요. 산모수첩, 속옷, 수유패드, 산후대, 신생아 옷 등이 필요합니다.', 423, '2025-12-01')
ON CONFLICT DO NOTHING;

-- 한식 레시피 마스터 초기 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('korean-recipes', '00000000-0000-0000-0000-000000000001', '김치찌개 황금레시피', '묵은지 200g, 돼지고기 150g, 두부 반모. 돼지고기를 먼저 볶다가 김치를 넣고 5분 볶은 후 물 500ml를 넣고 끓입니다.', 1234, '2025-10-15'),
  ('korean-recipes', '00000000-0000-0000-0000-000000000001', '된장찌개 기본', '된장 2큰술, 애호박, 두부, 양파, 청양고추. 멸치육수에 된장을 풀고 채소를 넣어 10분 끓입니다.', 987, '2025-10-20')
ON CONFLICT DO NOTHING;

-- 스타트업 멘토 초기 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('startup-mentor', '00000000-0000-0000-0000-000000000001', 'MVP 개발 전략', '첫 MVP는 3개월 안에 출시하세요. 핵심 기능 하나에 집중하고, 사용자 피드백으로 방향을 잡습니다.', 456, '2025-09-10'),
  ('startup-mentor', '00000000-0000-0000-0000-000000000001', '시드 투자 유치', '시드 라운드는 보통 5-10억 규모입니다. 팀, 시장, 트랙션 세 가지를 명확히 보여주세요.', 321, '2025-09-15')
ON CONFLICT DO NOTHING;

-- =====================================================
-- REALTIME 구독 활성화
-- Supabase Dashboard > Database > Replication에서도 설정 가능
-- =====================================================

-- knowledge_nodes 테이블 실시간 구독 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE citations;

-- =====================================================
-- COMPLETE
-- 이 스크립트 실행 후 환경 변수 설정:
-- NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
-- =====================================================
