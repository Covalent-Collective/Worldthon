-- =====================================================
-- SEED VAULT 간단 스키마 (해커톤용)
-- =====================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nullifier_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  contribution_power INTEGER DEFAULT 0,
  total_citations INTEGER DEFAULT 0,
  pending_wld DECIMAL(18, 8) DEFAULT 0
);

-- 2. Bots
CREATE TABLE IF NOT EXISTS bots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Knowledge Nodes
CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  contributor_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  citation_count INTEGER DEFAULT 0
);

-- 4. Contributions
CREATE TABLE IF NOT EXISTS contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  bot_id TEXT NOT NULL REFERENCES bots(id),
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- 공개 읽기
CREATE POLICY "Public read bots" ON bots FOR SELECT USING (true);
CREATE POLICY "Public read nodes" ON knowledge_nodes FOR SELECT USING (true);
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);

-- 쓰기 허용
CREATE POLICY "Insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert nodes" ON knowledge_nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert contributions" ON contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Update nodes" ON knowledge_nodes FOR UPDATE USING (true);

-- 초기 봇 데이터
INSERT INTO bots (id, name, description, icon, category) VALUES
  ('worldcoin-expert', 'World Coin 전문가', 'World ID, WLD 토큰, Orb 인증에 대한 모든 것', '🌐', 'Web3'),
  ('seoul-local-guide', '서울 로컬 가이드', '서울의 숨은 명소와 맛집', '🗺️', '여행'),
  ('obgyn-specialist', '산부인과 전문의', '임신, 출산, 여성 건강 전문 지식', '👩‍⚕️', '의료'),
  ('korean-recipes', '한식 레시피 마스터', '전통 한식부터 현대적 퓨전까지', '🍲', '요리'),
  ('startup-mentor', '스타트업 멘토', '창업, 투자, 스케일업 경험 공유', '🚀', '비즈니스')
ON CONFLICT (id) DO NOTHING;

-- 시스템 유저
INSERT INTO users (id, nullifier_hash) VALUES 
  ('00000000-0000-0000-0000-000000000001', '0xsystem_seed')
ON CONFLICT DO NOTHING;

-- World Coin 봇 초기 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count) VALUES
  ('worldcoin-expert', '00000000-0000-0000-0000-000000000001', 'World ID란?', 'World ID는 "Proof of Personhood" 프로토콜입니다. Orb라는 생체인식 장치로 홍채를 스캔하여 고유한 신원 증명을 생성합니다apply. 실제 신원은 노출되지 않으면서 "이 사람은 고유한 인간"임을 증명할 수 있습니다.', 892),
  ('worldcoin-expert', '00000000-0000-0000-0000-000000000001', 'Orb 인증 과정', 'Orb 인증은 약 30초 소요됩니다. 1) World App 설치 2) Orb 위치 방문 3) 홍채 스캔 4) World ID 발급. 한 번 인증하면 평생 유효합니다.', 567),
  ('worldcoin-expert', '00000000-0000-0000-0000-000000000001', 'WLD 토큰 유틸리티', 'WLD는 Worldcoin 생태계의 거버넌스 토큰입니다. 프로토콜 의사결정 투표, 네트워크 수수료 지불, 생태계 인센티브 등에 사용됩니다.', 423)
ON CONFLICT DO NOTHING;

-- 서울 가이드 초기 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count) VALUES
  ('seoul-local-guide', '00000000-0000-0000-0000-000000000001', '을지로 골목 맛집', '을지로 3가역 근처 노가리 골목은 퇴근 후 직장인들의 성지입니다. 특히 을지OB베어는 40년 전통의 노가리집으로 유명합니다.', 156),
  ('seoul-local-guide', '00000000-0000-0000-0000-000000000001', '성수동 카페거리', '성수동은 폐공장들이 힙한 카페로 변신한 곳입니다. 대림창고와 어니언 카페가 대표적입니다.', 203)
ON CONFLICT DO NOTHING;

-- 산부인과 초기 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count) VALUES
  ('obgyn-specialist', '00000000-0000-0000-0000-000000000001', '임신 초기 증상', '임신 초기(4-8주)에는 입덧, 피로감, 유방 통증 등이 나타날 수 있습니다. 생리 예정일이 지났다면 임신 테스트를 권장합니다.', 892)
ON CONFLICT DO NOTHING;
