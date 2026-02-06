-- =====================================================
-- P0 완전 스키마 보완 마이그레이션
-- 기존 init.sql에 빠진 테이블, 컬럼, 함수 추가
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- =====================================================
-- 1. 기존 테이블 컬럼 보완
-- =====================================================

-- bots 테이블에 is_active 컬럼 추가 (getAllBots에서 사용)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bots' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE bots ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- contributions 테이블에 status 컬럼 추가 (P0-4: pending 기본값)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contributions' AND column_name = 'status'
  ) THEN
    ALTER TABLE contributions ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- =====================================================
-- 2. 누락된 테이블 생성
-- =====================================================

-- Node Edges (그래프 엣지)
CREATE TABLE IF NOT EXISTS node_edges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_node_id, target_node_id)
);

CREATE INDEX IF NOT EXISTS idx_edges_source ON node_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON node_edges(target_node_id);

-- Citations (인용 기록)
CREATE TABLE IF NOT EXISTS citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  cited_at TIMESTAMPTZ DEFAULT NOW(),
  context TEXT
);

CREATE INDEX IF NOT EXISTS idx_citations_node ON citations(node_id);
CREATE INDEX IF NOT EXISTS idx_citations_session ON citations(session_id);

-- =====================================================
-- 3. RLS 정책 (누락분)
-- =====================================================

-- node_edges RLS
ALTER TABLE node_edges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'node_edges' AND policyname = 'Public read edges'
  ) THEN
    CREATE POLICY "Public read edges" ON node_edges FOR SELECT USING (true);
  END IF;
END $$;

-- citations RLS
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'citations' AND policyname = 'Insert citations'
  ) THEN
    CREATE POLICY "Insert citations" ON citations FOR INSERT WITH CHECK (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'citations' AND policyname = 'Public read citations'
  ) THEN
    CREATE POLICY "Public read citations" ON citations FOR SELECT USING (true);
  END IF;
END $$;

-- contributions 읽기 정책
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contributions' AND policyname = 'Public read contributions'
  ) THEN
    CREATE POLICY "Public read contributions" ON contributions FOR SELECT USING (true);
  END IF;
END $$;

-- =====================================================
-- 4. RPC 함수 (P0-3에서 호출하는 함수)
-- =====================================================

-- 인용 카운트 원자적 증가 함수
CREATE OR REPLACE FUNCTION increment_citation_count(node_id UUID)
RETURNS void AS $$
DECLARE
  v_contributor_id UUID;
BEGIN
  -- 노드의 citation_count 증가
  UPDATE knowledge_nodes
  SET citation_count = citation_count + 1
  WHERE id = node_id
  RETURNING contributor_id INTO v_contributor_id;

  -- 기여자의 total_citations, pending_wld 증가
  IF v_contributor_id IS NOT NULL THEN
    UPDATE users
    SET
      total_citations = total_citations + 1,
      pending_wld = pending_wld + 0.001
    WHERE id = v_contributor_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Realtime 구독 (노드 실시간 업데이트)
-- =====================================================

DO $$ BEGIN
  -- knowledge_nodes 실시간 활성화
  ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_nodes;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE citations;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- =====================================================
-- 6. 기존 봇 데이터 is_active 업데이트
-- =====================================================
UPDATE bots SET is_active = true WHERE is_active IS NULL;

-- =====================================================
-- 완료! 이제 앱에서 모든 P0 기능을 테스트할 수 있습니다.
-- =====================================================
