-- =====================================================
-- 원자적 보상 업데이트 마이그레이션
-- Race condition 방지를 위한 RPC 함수 추가
-- =====================================================

-- =====================================================
-- 1. increment_citation_count 재정의
-- 노드 카운트만 증가하도록 변경 (기여자 보상은 별도 RPC로 분리)
-- 이전 버전은 노드 카운트 + 기여자 보상을 동시 처리하여
-- step 4의 보상 업데이트와 이중 계산 발생
-- =====================================================

CREATE OR REPLACE FUNCTION increment_citation_count(node_id UUID)
RETURNS void AS $$
BEGIN
  -- 노드의 citation_count만 증가 (기여자 보상은 increment_contributor_rewards에서 처리)
  UPDATE knowledge_nodes
  SET citation_count = citation_count + 1
  WHERE id = node_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. 기여자 보상 원자적 증가 함수
-- recordCitations에서 read-then-write 대신 사용
-- =====================================================

CREATE OR REPLACE FUNCTION increment_contributor_rewards(
  p_contributor_id UUID,
  p_citation_count INT
)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET
    total_citations = total_citations + p_citation_count,
    pending_wld = pending_wld + (p_citation_count * 0.001)
  WHERE id = p_contributor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. 보상 청구 원자적 함수
-- claim/route.ts에서 read-then-zero 대신 사용
-- pending_wld를 원자적으로 읽고 0으로 초기화
-- =====================================================

CREATE OR REPLACE FUNCTION claim_pending_wld(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_amount NUMERIC;
BEGIN
  -- SELECT FOR UPDATE로 행 잠금 후 원자적으로 읽고 초기화
  SELECT pending_wld INTO v_amount
  FROM users
  WHERE id = p_user_id AND pending_wld > 0
  FOR UPDATE;

  IF v_amount IS NOT NULL AND v_amount > 0 THEN
    UPDATE users
    SET pending_wld = 0
    WHERE id = p_user_id;
  END IF;

  RETURN COALESCE(v_amount, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
