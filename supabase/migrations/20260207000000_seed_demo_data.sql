-- =====================================================
-- SEED VAULT MVP - Demo Seed Data
-- 10 users, 7 bots, ~45 knowledge nodes, edges,
-- contributions, citations
-- Idempotent: safe to run multiple times
-- =====================================================

-- =====================================================
-- 1. USERS (10명)
-- User 0001: system/admin
-- User 0002: demo user (로그인 데모용)
-- Users 0003-0010: community contributors
-- =====================================================

INSERT INTO users (id, nullifier_hash, contribution_power, total_citations, pending_wld, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '0x1a2b3c4d5e6f7890abcdef_seed_admin', 100, 350, 0, NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000002', '0xd4e5f6a7b8c9d0e1f2a3b4_demo_user', 45, 128, 6.667, NOW() - INTERVAL '14 days'),
  ('00000000-0000-0000-0000-000000000003', '0xa1b2c3d4e5f60718293a4b_blockchain_dev', 72, 245, 2.340, NOW() - INTERVAL '28 days'),
  ('00000000-0000-0000-0000-000000000004', '0xf0e1d2c3b4a596870f1e2d_foodie_mom', 38, 89, 1.200, NOW() - INTERVAL '21 days'),
  ('00000000-0000-0000-0000-000000000005', '0x112233445566778899aabb_med_student', 55, 167, 0.890, NOW() - INTERVAL '25 days'),
  ('00000000-0000-0000-0000-000000000006', '0xccddee00112233445566_seoul_native', 62, 198, 3.450, NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000007', '0x778899aabbccddeeff0011_startup_ceo', 80, 310, 0, NOW() - INTERVAL '27 days'),
  ('00000000-0000-0000-0000-000000000008', '0x2233445566778899aabbcc_kpop_army', 28, 56, 0.450, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000009', '0xddeeff00112233445566_crypto_whale', 90, 280, 5.120, NOW() - INTERVAL '26 days'),
  ('00000000-0000-0000-0000-000000000010', '0x8899aabbccddeeff001122_recipe_queen', 35, 72, 0.670, NOW() - INTERVAL '18 days')
ON CONFLICT (id) DO UPDATE SET
  nullifier_hash = EXCLUDED.nullifier_hash,
  contribution_power = EXCLUDED.contribution_power,
  total_citations = EXCLUDED.total_citations,
  pending_wld = EXCLUDED.pending_wld,
  created_at = EXCLUDED.created_at;


-- =====================================================
-- 2. BOTS (7개) - ON CONFLICT DO UPDATE
-- =====================================================

INSERT INTO bots (id, name, description, icon, category, is_active) VALUES
  ('worldcoin-expert', 'World Coin 전문가', 'World ID, WLD 토큰, Orb 인증에 대한 모든 것', '🌐', 'Web3', true),
  ('seoul-local-guide', '서울 로컬 가이드', '서울의 숨은 명소와 맛집을 알려드립니다', '🗺️', '여행', true),
  ('obgyn-specialist', '산부인과 전문의', '임신, 출산, 여성 건강에 대한 전문 지식', '👩‍⚕️', '의료', true),
  ('korean-recipes', '조림 마스터', '최강록 셰프의 조림 비법과 한식 요리 노하우', '🍲', '요리', true),
  ('startup-mentor', '스타트업 멘토', '창업, 투자, 스케일업 경험 공유', '🚀', '비즈니스', true),
  ('crypto-expert', '크립토 전문가', '비트코인, 이더리움, DeFi에 대한 심층 분석', '₿', 'Web3', true),
  ('kpop-insider', 'K-POP 인사이더', 'K-POP 아이돌, 음원차트, 팬덤 문화 전문가', '🎤', '엔터테인먼트', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;


-- =====================================================
-- 3. KNOWLEDGE NODES (~45개)
-- Fixed UUIDs for predictable edges/contributions
-- =====================================================

-- ----- worldcoin-expert (6 nodes) -----
INSERT INTO knowledge_nodes (id, bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'worldcoin-expert', '00000000-0000-0000-0000-000000000001',
   'World ID란?',
   'World ID는 "Proof of Personhood" 프로토콜입니다. Orb라는 생체 인식 장치로 홍채를 스캔하여 각 개인이 고유한 인간임을 증명합니다. 프라이버시를 보호하면서 Sybil 공격을 방지하는 것이 핵심 목표.',
   48, NOW() - INTERVAL '29 days'),
  ('10000000-0000-0000-0000-000000000002', 'worldcoin-expert', '00000000-0000-0000-0000-000000000003',
   'Orb 인증 과정',
   'Orb 인증은 약 30초 소요됩니다. 1) World App 설치 2) Orb 운영 장소 방문 3) 홍채 스캔 4) World ID 발급. 한국에는 서울 강남, 홍대, 부산 서면 등에 Orb 운영 장소가 있습니다.',
   42, NOW() - INTERVAL '27 days'),
  ('10000000-0000-0000-0000-000000000003', 'worldcoin-expert', '00000000-0000-0000-0000-000000000003',
   'WLD 토큰 유틸리티',
   'WLD는 Worldcoin 생태계의 거버넌스 토큰입니다. World App 내 결제, 거버넌스 투표, 개발자 인센티브 등에 사용됩니다. Orb 인증 완료 시 WLD 그랜트를 정기적으로 받을 수 있습니다.',
   39, NOW() - INTERVAL '25 days'),
  ('10000000-0000-0000-0000-000000000004', 'worldcoin-expert', '00000000-0000-0000-0000-000000000002',
   'Mini Apps 개발',
   'World App Mini Apps는 World ID 인증이 내장된 웹앱입니다. MiniKit SDK를 사용해 개발합니다. verifyAction으로 사용자 인증, pay로 WLD 결제를 구현할 수 있습니다.',
   28, NOW() - INTERVAL '20 days'),
  ('10000000-0000-0000-0000-000000000005', 'worldcoin-expert', '00000000-0000-0000-0000-000000000009',
   'ZK 증명 원리',
   'World ID는 영지식 증명(Zero-Knowledge Proof)을 사용합니다. 홍채 데이터 자체가 아닌 "고유한 인간임"만 증명합니다. Semaphore 프로토콜 기반으로 프라이버시를 완벽히 보호합니다.',
   31, NOW() - INTERVAL '18 days'),
  ('10000000-0000-0000-0000-000000000006', 'worldcoin-expert', '00000000-0000-0000-0000-000000000001',
   'World Chain 소개',
   'World Chain은 Worldcoin의 자체 L2 블록체인입니다. Optimism 스택 기반으로 구축되었고, World ID 인증 사용자에게 가스비 우선권을 제공합니다. 봇 없는 온체인 환경을 목표로 합니다.',
   33, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO UPDATE SET
  bot_id = EXCLUDED.bot_id,
  contributor_id = EXCLUDED.contributor_id,
  label = EXCLUDED.label,
  content = EXCLUDED.content,
  citation_count = EXCLUDED.citation_count,
  created_at = EXCLUDED.created_at;

-- ----- seoul-local-guide (7 nodes) -----
INSERT INTO knowledge_nodes (id, bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('10000000-0000-0000-0000-000000000101', 'seoul-local-guide', '00000000-0000-0000-0000-000000000006',
   '을지로 노가리 골목',
   '을지로 3가역 근처 노가리 골목은 퇴근 후 직장인들의 성지입니다. "을지OB베어"는 40년 전통의 노가리집으로, 마른 노가리와 시원한 맥주 조합이 일품입니다. 저녁 6시 이후 웨이팅 필수.',
   50, NOW() - INTERVAL '28 days'),
  ('10000000-0000-0000-0000-000000000102', 'seoul-local-guide', '00000000-0000-0000-0000-000000000006',
   '익선동 한옥카페',
   '익선동 한옥마을은 100년된 한옥들이 카페와 레스토랑으로 변신한 곳입니다. "열두달"은 계절별 디저트가 인기이고, "익선다다"는 전통차와 한과 세트가 유명합니다.',
   45, NOW() - INTERVAL '26 days'),
  ('10000000-0000-0000-0000-000000000103', 'seoul-local-guide', '00000000-0000-0000-0000-000000000002',
   '성수동 대림창고',
   '대림창고는 1970년대 정미소 창고를 개조한 복합문화공간입니다. 1층 카페, 2층 전시공간으로 구성되어 있고, 높은 천장과 벽돌 인테리어가 인상적입니다. 주말 오전이 한적합니다.',
   38, NOW() - INTERVAL '22 days'),
  ('10000000-0000-0000-0000-000000000104', 'seoul-local-guide', '00000000-0000-0000-0000-000000000004',
   '망원시장 먹거리',
   '망원시장은 MZ세대가 사랑하는 전통시장입니다. "박가네빈대떡", "원조누드김밥", "손만두"가 인기입니다. 시장 구경 후 근처 한강공원에서 피크닉하는 코스 추천.',
   30, NOW() - INTERVAL '19 days'),
  ('10000000-0000-0000-0000-000000000105', 'seoul-local-guide', '00000000-0000-0000-0000-000000000006',
   '연남동 경의선숲길',
   '경의선 폐철로가 공원으로 변신한 경의선숲길입니다. 연남동 구간은 약 1.5km로, 양옆에 카페와 맛집이 즐비합니다. 봄 벚꽃, 가을 단풍 시즌이 특히 예쁩니다.',
   42, NOW() - INTERVAL '16 days'),
  ('10000000-0000-0000-0000-000000000106', 'seoul-local-guide', '00000000-0000-0000-0000-000000000002',
   '한남동 카페거리',
   '한남동은 서울에서 가장 세련된 카페거리입니다. "테라로사", "앤트러사이트" 같은 대형 로스터리부터 "시크릿가든" 같은 히든 카페까지 다양합니다. 이태원역에서 도보 10분.',
   35, NOW() - INTERVAL '12 days'),
  ('10000000-0000-0000-0000-000000000107', 'seoul-local-guide', '00000000-0000-0000-0000-000000000004',
   '북촌 한옥마을',
   '북촌 한옥마을은 600년 역사의 전통 한옥 주거지입니다. 북촌 8경 포토스팟을 따라 걸으면 약 2시간 소요. 아침 일찍 가야 사람 없는 사진 찍을 수 있습니다. 주민 배려 필수.',
   27, NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO UPDATE SET
  bot_id = EXCLUDED.bot_id,
  contributor_id = EXCLUDED.contributor_id,
  label = EXCLUDED.label,
  content = EXCLUDED.content,
  citation_count = EXCLUDED.citation_count,
  created_at = EXCLUDED.created_at;

-- ----- obgyn-specialist (7 nodes) -----
INSERT INTO knowledge_nodes (id, bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('10000000-0000-0000-0000-000000000201', 'obgyn-specialist', '00000000-0000-0000-0000-000000000005',
   '임신 초기 증상',
   '임신 초기(4-8주)에는 입덧, 피로감, 유방 통증, 빈뇨 등이 나타날 수 있습니다. 생리 예정일이 1주일 이상 지났다면 임신 테스트기를 사용해보세요. 아침 첫 소변으로 검사하면 정확도가 높습니다.',
   47, NOW() - INTERVAL '29 days'),
  ('10000000-0000-0000-0000-000000000202', 'obgyn-specialist', '00000000-0000-0000-0000-000000000005',
   '산전 검사 일정',
   '임신 확인 후 첫 산전검사는 8-12주에 시행합니다. 기형아 검사(15-20주), 정밀초음파(20-24주), 임신성 당뇨검사(24-28주) 등 시기별 검사가 있습니다. 병원에서 검사 일정표를 받으세요.',
   43, NOW() - INTERVAL '27 days'),
  ('10000000-0000-0000-0000-000000000203', 'obgyn-specialist', '00000000-0000-0000-0000-000000000004',
   '입덧 완화 방법',
   '입덧은 보통 6-12주에 심하고 14주경 호전됩니다. 공복을 피하고 소량씩 자주 드세요. 생강차, 레몬수가 도움됩니다. 구토가 심해 탈수 증상이 있다면 수액 치료가 필요할 수 있습니다.',
   35, NOW() - INTERVAL '24 days'),
  ('10000000-0000-0000-0000-000000000204', 'obgyn-specialist', '00000000-0000-0000-0000-000000000005',
   '임산부 영양제',
   '엽산은 임신 준비 3개월 전부터 12주까지 필수입니다. 철분제는 16주 이후 복용 시작. 칼슘, 오메가3, 비타민D도 권장됩니다. 종합비타민보다 시기별 맞춤 영양제가 효과적입니다.',
   41, NOW() - INTERVAL '22 days'),
  ('10000000-0000-0000-0000-000000000205', 'obgyn-specialist', '00000000-0000-0000-0000-000000000001',
   '모유수유 준비',
   '출산 후 30분-1시간 내 첫 모유수유가 권장됩니다. 처음 나오는 초유는 면역물질이 풍부합니다. 유두 관리, 수유 자세 등을 미리 배워두면 좋습니다. 유축기도 미리 준비하세요.',
   34, NOW() - INTERVAL '18 days'),
  ('10000000-0000-0000-0000-000000000206', 'obgyn-specialist', '00000000-0000-0000-0000-000000000005',
   '자궁경부암 검진',
   '성경험이 있는 여성은 2년마다 자궁경부암 검진(PAP smear)을 권장합니다. 국가 무료검진 대상(20세 이상). HPV 백신은 암 예방에 효과적이며 26세 이전 접종이 권장됩니다.',
   37, NOW() - INTERVAL '14 days'),
  ('10000000-0000-0000-0000-000000000207', 'obgyn-specialist', '00000000-0000-0000-0000-000000000004',
   '피임법 종류',
   '콘돔, 경구피임약, IUD(자궁내장치), 임플란트 등이 있습니다. 경구피임약은 매일 같은 시간에 복용. IUD는 5년 유지 가능. 각 방법의 장단점을 의사와 상담 후 선택하세요.',
   32, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO UPDATE SET
  bot_id = EXCLUDED.bot_id,
  contributor_id = EXCLUDED.contributor_id,
  label = EXCLUDED.label,
  content = EXCLUDED.content,
  citation_count = EXCLUDED.citation_count,
  created_at = EXCLUDED.created_at;

-- ----- korean-recipes (7 nodes) -----
INSERT INTO knowledge_nodes (id, bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('10000000-0000-0000-0000-000000000301', 'korean-recipes', '00000000-0000-0000-0000-000000000010',
   '김치찌개 황금레시피',
   '묵은지 200g, 돼지고기 목살 150g, 두부 반모가 기본입니다. 돼지고기를 참기름에 먼저 볶다가 김치를 넣고 5분간 같이 볶아 감칠맛을 끌어냅니다. 물 500ml를 넣고 끓이면 완성.',
   48, NOW() - INTERVAL '28 days'),
  ('10000000-0000-0000-0000-000000000302', 'korean-recipes', '00000000-0000-0000-0000-000000000010',
   '불고기 양념장',
   '간장 4큰술, 설탕 2큰술, 배즙 3큰술, 다진마늘 1큰술, 참기름 1큰술, 후추 약간. 배즙이 고기를 부드럽게 만드는 핵심입니다. 소고기는 최소 2시간, 하룻밤 재우면 더 맛있습니다.',
   39, NOW() - INTERVAL '25 days'),
  ('10000000-0000-0000-0000-000000000303', 'korean-recipes', '00000000-0000-0000-0000-000000000004',
   '비빔밥 만들기',
   '밥 위에 나물 5종(시금치, 콩나물, 도라지, 고사리, 무생채), 계란 프라이, 고추장을 올립니다. 나물은 각각 간을 해서 준비하고, 참기름을 둘러 비비면 완성. 돌솥에 하면 누룽지 보너스.',
   35, NOW() - INTERVAL '22 days'),
  ('10000000-0000-0000-0000-000000000304', 'korean-recipes', '00000000-0000-0000-0000-000000000002',
   '떡볶이 황금비율',
   '고추장 3큰술, 고춧가루 1큰술, 설탕 2큰술, 간장 1큰술이 황금비율입니다. 떡 300g, 어묵 2장, 대파 1대. 물 400ml에 양념을 풀고 떡을 넣어 끓이면 10분이면 완성됩니다.',
   45, NOW() - INTERVAL '19 days'),
  ('10000000-0000-0000-0000-000000000305', 'korean-recipes', '00000000-0000-0000-0000-000000000010',
   '배추김치 담그기',
   '배추 1포기, 천일염 1컵, 고춧가루 1컵, 젓갈 반컵. 배추를 소금에 8시간 절인 후 양념을 켜켜이 바릅니다. 실온에서 하루 익힌 후 냉장 보관. 2주 후부터 맛있게 익습니다.',
   41, NOW() - INTERVAL '15 days'),
  ('10000000-0000-0000-0000-000000000306', 'korean-recipes', '00000000-0000-0000-0000-000000000004',
   '멸치육수 내리기',
   '국물용 멸치 20마리, 다시마 5x5cm 2장, 물 1.5L. 멸치 내장을 제거하고 팬에 살짝 볶습니다. 물에 멸치와 다시마를 넣고 끓기 시작하면 다시마는 건지고 멸치만 10분 더 끓입니다.',
   38, NOW() - INTERVAL '12 days'),
  ('10000000-0000-0000-0000-000000000307', 'korean-recipes', '00000000-0000-0000-0000-000000000006',
   '삼겹살 굽기',
   '삼겹살은 두께 1cm가 적당합니다. 팬을 충분히 달군 후 고기를 올리고, 한 면이 노릇해질 때까지 뒤집지 않습니다. 쌈장, 마늘, 고추와 함께 상추에 싸먹으면 완벽한 한 끼.',
   33, NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO UPDATE SET
  bot_id = EXCLUDED.bot_id,
  contributor_id = EXCLUDED.contributor_id,
  label = EXCLUDED.label,
  content = EXCLUDED.content,
  citation_count = EXCLUDED.citation_count,
  created_at = EXCLUDED.created_at;

-- ----- startup-mentor (6 nodes) -----
INSERT INTO knowledge_nodes (id, bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('10000000-0000-0000-0000-000000000401', 'startup-mentor', '00000000-0000-0000-0000-000000000007',
   'MVP 개발 전략',
   '첫 MVP는 3개월 안에 출시하세요. 핵심 기능 하나에 집중하고, 사용자 피드백으로 방향을 잡습니다. 완벽한 제품보다 빠른 학습이 중요합니다. 토스도 첫 버전은 기능 3개뿐이었습니다.',
   45, NOW() - INTERVAL '29 days'),
  ('10000000-0000-0000-0000-000000000402', 'startup-mentor', '00000000-0000-0000-0000-000000000007',
   '시드 투자 유치',
   '시드 라운드는 보통 5-10억 규모입니다. 팀, 시장, 트랙션 세 가지를 명확히 보여주세요. 한국에서는 본엔젤스, 프라이머, 스파크랩이 대표적인 시드 투자자입니다.',
   38, NOW() - INTERVAL '26 days'),
  ('10000000-0000-0000-0000-000000000403', 'startup-mentor', '00000000-0000-0000-0000-000000000001',
   'PMF 찾기',
   'Product-Market Fit은 고객이 제품을 "꼭 필요하다"고 느끼는 순간입니다. 40% 이상의 사용자가 "이 제품이 없으면 매우 실망할 것"이라고 답하면 PMF 달성. 숀 엘리스 테스트를 활용하세요.',
   42, NOW() - INTERVAL '23 days'),
  ('10000000-0000-0000-0000-000000000404', 'startup-mentor', '00000000-0000-0000-0000-000000000007',
   '토스 성공 사례',
   '토스는 공인인증서 없는 간편송금으로 시작했습니다. 초기 3년간 적자였지만 사용자 경험에 집중. 현재 기업가치 10조원 이상, 직원 2,000명 규모의 핀테크 유니콘이 되었습니다.',
   50, NOW() - INTERVAL '20 days'),
  ('10000000-0000-0000-0000-000000000405', 'startup-mentor', '00000000-0000-0000-0000-000000000002',
   '번아웃 관리',
   '창업자 번아웃은 스타트업 실패의 주요 원인입니다. 주 60시간 이상 근무가 3개월 이상 지속되면 위험 신호. 공동창업자와 역할 분담, 정기적인 오프 시간 확보가 필수입니다.',
   31, NOW() - INTERVAL '17 days'),
  ('10000000-0000-0000-0000-000000000406', 'startup-mentor', '00000000-0000-0000-0000-000000000003',
   '지분 배분',
   '공동창업자 지분은 기여도에 따라 배분합니다. CEO 40-50%, CTO 20-30%, 나머지 공동창업자 10-20%가 일반적. 4년 베스팅, 1년 클리프 조건을 걸어두세요.',
   36, NOW() - INTERVAL '13 days')
ON CONFLICT (id) DO UPDATE SET
  bot_id = EXCLUDED.bot_id,
  contributor_id = EXCLUDED.contributor_id,
  label = EXCLUDED.label,
  content = EXCLUDED.content,
  citation_count = EXCLUDED.citation_count,
  created_at = EXCLUDED.created_at;

-- ----- crypto-expert (7 nodes) -----
INSERT INTO knowledge_nodes (id, bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('10000000-0000-0000-0000-000000000501', 'crypto-expert', '00000000-0000-0000-0000-000000000009',
   '비트코인 기초',
   '비트코인은 2009년 사토시 나카모토가 만든 최초의 암호화폐입니다. 총 발행량 2,100만 개로 제한되어 있으며, 약 4년마다 반감기를 통해 신규 발행량이 절반으로 줄어듭니다.',
   45, NOW() - INTERVAL '28 days'),
  ('10000000-0000-0000-0000-000000000502', 'crypto-expert', '00000000-0000-0000-0000-000000000009',
   '이더리움 스테이킹',
   '이더리움 2.0 전환 후 PoS(지분증명) 방식으로 변경되었습니다. 32 ETH를 스테이킹하면 검증자가 될 수 있고, 연 4-5% 수익을 얻습니다. 리도(Lido)를 통해 소액 스테이킹도 가능.',
   35, NOW() - INTERVAL '25 days'),
  ('10000000-0000-0000-0000-000000000503', 'crypto-expert', '00000000-0000-0000-0000-000000000003',
   'DeFi 기초',
   'DeFi(탈중앙화 금융)는 중개자 없이 금융 서비스를 이용하는 것입니다. 대출, 예치, 스왑, 파생상품 등이 가능합니다. Uniswap, Aave, Compound가 대표적인 DeFi 프로토콜입니다.',
   39, NOW() - INTERVAL '23 days'),
  ('10000000-0000-0000-0000-000000000504', 'crypto-expert', '00000000-0000-0000-0000-000000000003',
   '레이어2 솔루션',
   '레이어2는 이더리움의 확장성 문제를 해결합니다. Arbitrum, Optimism, Base가 대표적. 가스비가 이더리움의 1/10 수준이고, 처리 속도도 빠릅니다. 2024년 이후 TVL이 급성장.',
   33, NOW() - INTERVAL '20 days'),
  ('10000000-0000-0000-0000-000000000505', 'crypto-expert', '00000000-0000-0000-0000-000000000009',
   '에어드랍 전략',
   '에어드랍은 프로토콜이 초기 사용자에게 토큰을 무료 배포하는 것입니다. 테스트넷 참여, 프로토콜 사용 기록을 쌓으면 에어드랍 대상이 될 수 있습니다. Arbitrum, Optimism이 대표적 성공 사례.',
   43, NOW() - INTERVAL '17 days'),
  ('10000000-0000-0000-0000-000000000506', 'crypto-expert', '00000000-0000-0000-0000-000000000001',
   '스캠 구별법',
   '크립토 스캠을 피하려면: 1) 팀이 익명이면 주의 2) 보장된 수익 약속은 100% 스캠 3) 컨트랙트 감사(Audit) 여부 확인 4) 급하게 결정하라고 하면 의심. DYOR(Do Your Own Research) 필수.',
   47, NOW() - INTERVAL '13 days'),
  ('10000000-0000-0000-0000-000000000507', 'crypto-expert', '00000000-0000-0000-0000-000000000002',
   '메타마스크 사용법',
   '메타마스크는 가장 인기있는 웹3 지갑입니다. 크롬 확장 프로그램으로 설치하고, 시드 구문 12단어를 안전하게 보관하세요. 절대 시드 구문을 온라인에 입력하지 마세요. 피싱 주의.',
   36, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO UPDATE SET
  bot_id = EXCLUDED.bot_id,
  contributor_id = EXCLUDED.contributor_id,
  label = EXCLUDED.label,
  content = EXCLUDED.content,
  citation_count = EXCLUDED.citation_count,
  created_at = EXCLUDED.created_at;

-- ----- kpop-insider (6 nodes) -----
INSERT INTO knowledge_nodes (id, bot_id, contributor_id, label, content, citation_count, created_at) VALUES
  ('10000000-0000-0000-0000-000000000601', 'kpop-insider', '00000000-0000-0000-0000-000000000008',
   'BTS 소개',
   'BTS(방탄소년단)는 2013년 빅히트에서 데뷔한 7인조 보이그룹입니다. RM, 진, 슈가, 제이홉, 지민, 뷔, 정국으로 구성. 빌보드 핫100 1위, 그래미 노미네이트 등 K-POP 역사를 새로 썼습니다.',
   50, NOW() - INTERVAL '29 days'),
  ('10000000-0000-0000-0000-000000000602', 'kpop-insider', '00000000-0000-0000-0000-000000000008',
   'BLACKPINK 소개',
   'BLACKPINK는 2016년 YG에서 데뷔한 4인조 걸그룹입니다. 지수, 제니, 로제, 리사로 구성. 코첼라 헤드라이너, 유튜브 구독자 9,000만 이상. "Pink Venom", "Kill This Love"가 대표곡.',
   47, NOW() - INTERVAL '26 days'),
  ('10000000-0000-0000-0000-000000000603', 'kpop-insider', '00000000-0000-0000-0000-000000000008',
   'NewJeans 소개',
   'NewJeans는 2022년 어도어에서 데뷔한 5인조 걸그룹입니다. 민지, 하니, 다니엘, 해린, 혜인으로 구성. Y2K 컨셉과 독특한 바이럴 마케팅으로 데뷔와 동시에 대중적 인기를 얻었습니다.',
   43, NOW() - INTERVAL '23 days'),
  ('10000000-0000-0000-0000-000000000604', 'kpop-insider', '00000000-0000-0000-0000-000000000002',
   '팬덤 문화',
   'K-POP 팬덤은 체계적인 조직력이 특징입니다. 총공(조직적 스트리밍), 광고 서포트, 앨범 대량구매 등을 진행합니다. 팬클럽 가입비, 콘서트, MD 구매로 아티스트를 지원하는 문화가 발달.',
   38, NOW() - INTERVAL '19 days'),
  ('10000000-0000-0000-0000-000000000605', 'kpop-insider', '00000000-0000-0000-0000-000000000006',
   '음악방송 1위',
   '인기가요, 뮤직뱅크, 엠카, 쇼챔, 더쇼가 주요 음악방송입니다. 음원 + 앨범 + SNS + 사전투표 + 방청투표 등이 합산. 1위 트로피는 팬덤의 영예이며, 앵콜 무대에서 생방으로 실력을 확인.',
   34, NOW() - INTERVAL '14 days'),
  ('10000000-0000-0000-0000-000000000606', 'kpop-insider', '00000000-0000-0000-0000-000000000008',
   '아이돌 데뷔 과정',
   '연습생 기간은 평균 3-5년입니다. 보컬, 댄스, 랩, 연기, 외국어를 훈련. 월말 평가로 탈락 가능성 있음. 서바이벌 프로그램(프듀, 아이랜드)으로 데뷔하는 경우도 많습니다. 경쟁률 수백 대 1.',
   40, NOW() - INTERVAL '9 days')
ON CONFLICT (id) DO UPDATE SET
  bot_id = EXCLUDED.bot_id,
  contributor_id = EXCLUDED.contributor_id,
  label = EXCLUDED.label,
  content = EXCLUDED.content,
  citation_count = EXCLUDED.citation_count,
  created_at = EXCLUDED.created_at;


-- =====================================================
-- 4. NODE EDGES (노드 간 연결 18개)
-- =====================================================

-- Delete existing seed edges to avoid duplicates on re-run
DELETE FROM node_edges WHERE source_node_id IN (
  SELECT id FROM knowledge_nodes WHERE id::text LIKE '10000000-0000-0000-0000-%'
);

-- worldcoin-expert edges
INSERT INTO node_edges (source_node_id, target_node_id, relationship) VALUES
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '인증 방법'),
  ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '보상'),
  ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', '개발'),
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '기술 원리'),
  ('10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', '참조')
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;

-- seoul-local-guide edges
INSERT INTO node_edges (source_node_id, target_node_id, relationship) VALUES
  ('10000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000102', '도보 10분'),
  ('10000000-0000-0000-0000-000000000103', '10000000-0000-0000-0000-000000000106', '비교'),
  ('10000000-0000-0000-0000-000000000104', '10000000-0000-0000-0000-000000000105', '도보 10분'),
  ('10000000-0000-0000-0000-000000000102', '10000000-0000-0000-0000-000000000107', '비교')
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;

-- obgyn-specialist edges
INSERT INTO node_edges (source_node_id, target_node_id, relationship) VALUES
  ('10000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000202', '다음 단계'),
  ('10000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000203', '관련'),
  ('10000000-0000-0000-0000-000000000204', '10000000-0000-0000-0000-000000000205', '상세')
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;

-- korean-recipes edges
INSERT INTO node_edges (source_node_id, target_node_id, relationship) VALUES
  ('10000000-0000-0000-0000-000000000301', '10000000-0000-0000-0000-000000000305', '재료'),
  ('10000000-0000-0000-0000-000000000302', '10000000-0000-0000-0000-000000000307', '비교'),
  ('10000000-0000-0000-0000-000000000306', '10000000-0000-0000-0000-000000000301', '관련')
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;

-- startup-mentor edges
INSERT INTO node_edges (source_node_id, target_node_id, relationship) VALUES
  ('10000000-0000-0000-0000-000000000401', '10000000-0000-0000-0000-000000000402', '다음 단계'),
  ('10000000-0000-0000-0000-000000000401', '10000000-0000-0000-0000-000000000403', '관련')
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;

-- crypto-expert edges
INSERT INTO node_edges (source_node_id, target_node_id, relationship) VALUES
  ('10000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000502', '관련'),
  ('10000000-0000-0000-0000-000000000503', '10000000-0000-0000-0000-000000000504', '상세'),
  ('10000000-0000-0000-0000-000000000505', '10000000-0000-0000-0000-000000000504', '참조')
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;

-- kpop-insider edges
INSERT INTO node_edges (source_node_id, target_node_id, relationship) VALUES
  ('10000000-0000-0000-0000-000000000601', '10000000-0000-0000-0000-000000000602', '비교'),
  ('10000000-0000-0000-0000-000000000603', '10000000-0000-0000-0000-000000000604', '관련'),
  ('10000000-0000-0000-0000-000000000605', '10000000-0000-0000-0000-000000000606', '참조')
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;


-- =====================================================
-- 5. CONTRIBUTIONS (기여 기록 26개)
-- =====================================================

-- Delete existing seed contributions to allow re-run
DELETE FROM contributions WHERE id IN (
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000005',
  'c0000000-0000-0000-0000-000000000006',
  'c0000000-0000-0000-0000-000000000007',
  'c0000000-0000-0000-0000-000000000008',
  'c0000000-0000-0000-0000-000000000009',
  'c0000000-0000-0000-0000-000000000010',
  'c0000000-0000-0000-0000-000000000011',
  'c0000000-0000-0000-0000-000000000012',
  'c0000000-0000-0000-0000-000000000013',
  'c0000000-0000-0000-0000-000000000014',
  'c0000000-0000-0000-0000-000000000015',
  'c0000000-0000-0000-0000-000000000016',
  'c0000000-0000-0000-0000-000000000017',
  'c0000000-0000-0000-0000-000000000018',
  'c0000000-0000-0000-0000-000000000019',
  'c0000000-0000-0000-0000-000000000020',
  'c0000000-0000-0000-0000-000000000021',
  'c0000000-0000-0000-0000-000000000022',
  'c0000000-0000-0000-0000-000000000023',
  'c0000000-0000-0000-0000-000000000024',
  'c0000000-0000-0000-0000-000000000025',
  'c0000000-0000-0000-0000-000000000026'
);

INSERT INTO contributions (id, user_id, bot_id, node_id, status, created_at) VALUES
  -- Demo user (0002) contributions: 5 across 4 different bots
  ('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'worldcoin-expert', '10000000-0000-0000-0000-000000000004', 'approved', NOW() - INTERVAL '20 days'),
  ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'seoul-local-guide', '10000000-0000-0000-0000-000000000103', 'approved', NOW() - INTERVAL '22 days'),
  ('c0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'seoul-local-guide', '10000000-0000-0000-0000-000000000106', 'approved', NOW() - INTERVAL '12 days'),
  ('c0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'crypto-expert', '10000000-0000-0000-0000-000000000507', 'approved', NOW() - INTERVAL '10 days'),

  ('c0000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000002', 'kpop-insider', '10000000-0000-0000-0000-000000000604', 'approved', NOW() - INTERVAL '19 days'),

  -- System admin (0001)
  ('c0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'worldcoin-expert', '10000000-0000-0000-0000-000000000001', 'approved', NOW() - INTERVAL '29 days'),
  ('c0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'worldcoin-expert', '10000000-0000-0000-0000-000000000006', 'approved', NOW() - INTERVAL '15 days'),
  ('c0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'obgyn-specialist', '10000000-0000-0000-0000-000000000205', 'approved', NOW() - INTERVAL '18 days'),
  ('c0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'startup-mentor', '10000000-0000-0000-0000-000000000403', 'approved', NOW() - INTERVAL '23 days'),
  ('c0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'crypto-expert', '10000000-0000-0000-0000-000000000506', 'approved', NOW() - INTERVAL '13 days'),

  -- Blockchain dev (0003)
  ('c0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', 'worldcoin-expert', '10000000-0000-0000-0000-000000000002', 'approved', NOW() - INTERVAL '27 days'),
  ('c0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', 'worldcoin-expert', '10000000-0000-0000-0000-000000000003', 'approved', NOW() - INTERVAL '25 days'),
  ('c0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000003', 'crypto-expert', '10000000-0000-0000-0000-000000000503', 'approved', NOW() - INTERVAL '23 days'),
  ('c0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000003', 'crypto-expert', '10000000-0000-0000-0000-000000000504', 'approved', NOW() - INTERVAL '20 days'),
  ('c0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000003', 'startup-mentor', '10000000-0000-0000-0000-000000000406', 'pending', NOW() - INTERVAL '5 days'),

  -- Foodie mom (0004)
  ('c0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000004', 'seoul-local-guide', '10000000-0000-0000-0000-000000000104', 'approved', NOW() - INTERVAL '19 days'),
  ('c0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000004', 'korean-recipes', '10000000-0000-0000-0000-000000000303', 'approved', NOW() - INTERVAL '22 days'),
  ('c0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000004', 'obgyn-specialist', '10000000-0000-0000-0000-000000000203', 'approved', NOW() - INTERVAL '24 days'),
  ('c0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000004', 'obgyn-specialist', '10000000-0000-0000-0000-000000000207', 'pending', NOW() - INTERVAL '3 days'),

  -- Med student (0005)
  ('c0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000005', 'obgyn-specialist', '10000000-0000-0000-0000-000000000201', 'approved', NOW() - INTERVAL '29 days'),
  ('c0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000005', 'obgyn-specialist', '10000000-0000-0000-0000-000000000202', 'approved', NOW() - INTERVAL '27 days'),
  ('c0000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000005', 'obgyn-specialist', '10000000-0000-0000-0000-000000000204', 'approved', NOW() - INTERVAL '22 days'),

  -- Seoul native (0006)
  ('c0000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000006', 'seoul-local-guide', '10000000-0000-0000-0000-000000000101', 'approved', NOW() - INTERVAL '28 days'),

  -- Startup CEO (0007)
  ('c0000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000007', 'startup-mentor', '10000000-0000-0000-0000-000000000401', 'approved', NOW() - INTERVAL '29 days'),

  -- KPOP army (0008)
  ('c0000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000008', 'kpop-insider', '10000000-0000-0000-0000-000000000601', 'approved', NOW() - INTERVAL '29 days'),

  -- Crypto whale (0009)
  ('c0000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000009', 'crypto-expert', '10000000-0000-0000-0000-000000000501', 'approved', NOW() - INTERVAL '28 days');


-- =====================================================
-- 6. CITATIONS (인용 기록 40개)
-- Spread across nodes; demo user's nodes get enough
-- citations to justify total_citations = 128
-- =====================================================

-- Delete existing seed citations to allow re-run
DELETE FROM citations WHERE session_id LIKE 'demo-session-%';

INSERT INTO citations (node_id, session_id, context, cited_at) VALUES
  -- Citations for demo user's nodes (total ~128 across all 4 nodes)
  -- Node 10..0004 (Mini Apps 개발, citation_count=28): 28 citations
  ('10000000-0000-0000-0000-000000000004', 'demo-session-001', 'MiniKit 개발 방법이 궁금합니다', NOW() - INTERVAL '19 days'),
  ('10000000-0000-0000-0000-000000000004', 'demo-session-002', 'World App에서 미니앱 만드는 방법', NOW() - INTERVAL '18 days'),
  ('10000000-0000-0000-0000-000000000004', 'demo-session-003', 'MiniKit SDK 사용법 알려주세요', NOW() - INTERVAL '17 days'),
  ('10000000-0000-0000-0000-000000000004', 'demo-session-004', 'Mini Apps 결제 구현', NOW() - INTERVAL '16 days'),
  ('10000000-0000-0000-0000-000000000004', 'demo-session-005', 'verifyAction 함수 사용법', NOW() - INTERVAL '15 days'),
  ('10000000-0000-0000-0000-000000000004', 'demo-session-006', 'World App 인증 구현하기', NOW() - INTERVAL '14 days'),
  ('10000000-0000-0000-0000-000000000004', 'demo-session-007', 'Mini App 개발 환경 세팅', NOW() - INTERVAL '13 days'),

  -- Node 10..0103 (성수동 대림창고, citation_count=38): additional citations
  ('10000000-0000-0000-0000-000000000103', 'demo-session-008', '성수동 가볼만한 곳', NOW() - INTERVAL '21 days'),
  ('10000000-0000-0000-0000-000000000103', 'demo-session-009', '성수동 카페 추천', NOW() - INTERVAL '20 days'),
  ('10000000-0000-0000-0000-000000000103', 'demo-session-010', '대림창고 위치', NOW() - INTERVAL '19 days'),
  ('10000000-0000-0000-0000-000000000103', 'demo-session-011', '성수동 데이트 코스', NOW() - INTERVAL '17 days'),
  ('10000000-0000-0000-0000-000000000103', 'demo-session-012', '성수동 전시 관람', NOW() - INTERVAL '15 days'),

  -- Node 10..0106 (한남동 카페거리, citation_count=35): additional citations
  ('10000000-0000-0000-0000-000000000106', 'demo-session-013', '한남동 카페 추천', NOW() - INTERVAL '11 days'),
  ('10000000-0000-0000-0000-000000000106', 'demo-session-014', '한남동 로스터리 카페', NOW() - INTERVAL '10 days'),
  ('10000000-0000-0000-0000-000000000106', 'demo-session-015', '이태원 근처 카페', NOW() - INTERVAL '9 days'),
  ('10000000-0000-0000-0000-000000000106', 'demo-session-016', '서울 세련된 카페거리', NOW() - INTERVAL '8 days'),

  -- Node 10..0507 (메타마스크 사용법, citation_count=36): additional citations
  ('10000000-0000-0000-0000-000000000507', 'demo-session-017', '메타마스크 설치 방법', NOW() - INTERVAL '9 days'),
  ('10000000-0000-0000-0000-000000000507', 'demo-session-018', '지갑 시드구문 관리', NOW() - INTERVAL '8 days'),
  ('10000000-0000-0000-0000-000000000507', 'demo-session-019', '웹3 지갑 추천', NOW() - INTERVAL '7 days'),
  ('10000000-0000-0000-0000-000000000507', 'demo-session-020', '메타마스크 피싱 주의사항', NOW() - INTERVAL '6 days'),

  -- Node 10..0604 (팬덤 문화 - contributed by demo user for kpop): additional citations
  ('10000000-0000-0000-0000-000000000604', 'demo-session-040', '팬덤 문화가 궁금합니다', NOW() - INTERVAL '18 days'),

  -- Citations for other popular nodes
  ('10000000-0000-0000-0000-000000000001', 'demo-session-021', 'World ID가 뭔가요?', NOW() - INTERVAL '28 days'),
  ('10000000-0000-0000-0000-000000000001', 'demo-session-022', 'Proof of Personhood 설명', NOW() - INTERVAL '25 days'),
  ('10000000-0000-0000-0000-000000000001', 'demo-session-023', '월드코인 소개', NOW() - INTERVAL '20 days'),

  ('10000000-0000-0000-0000-000000000101', 'demo-session-024', '을지로 맛집 추천', NOW() - INTERVAL '27 days'),
  ('10000000-0000-0000-0000-000000000101', 'demo-session-025', '서울 직장인 회식 장소', NOW() - INTERVAL '22 days'),

  ('10000000-0000-0000-0000-000000000201', 'demo-session-026', '임신 초기 증상이 궁금해요', NOW() - INTERVAL '28 days'),
  ('10000000-0000-0000-0000-000000000201', 'demo-session-027', '임신 테스트 시기', NOW() - INTERVAL '24 days'),

  ('10000000-0000-0000-0000-000000000301', 'demo-session-028', '김치찌개 레시피 알려주세요', NOW() - INTERVAL '27 days'),
  ('10000000-0000-0000-0000-000000000301', 'demo-session-029', '묵은지찌개 만드는 법', NOW() - INTERVAL '23 days'),

  ('10000000-0000-0000-0000-000000000304', 'demo-session-030', '떡볶이 양념 비율', NOW() - INTERVAL '18 days'),
  ('10000000-0000-0000-0000-000000000304', 'demo-session-031', '떡볶이 레시피', NOW() - INTERVAL '14 days'),

  ('10000000-0000-0000-0000-000000000401', 'demo-session-032', 'MVP 어떻게 만드나요', NOW() - INTERVAL '28 days'),
  ('10000000-0000-0000-0000-000000000404', 'demo-session-033', '토스 성공 스토리', NOW() - INTERVAL '19 days'),

  ('10000000-0000-0000-0000-000000000501', 'demo-session-034', '비트코인 입문 가이드', NOW() - INTERVAL '27 days'),
  ('10000000-0000-0000-0000-000000000505', 'demo-session-035', '에어드랍 받는 방법', NOW() - INTERVAL '16 days'),
  ('10000000-0000-0000-0000-000000000506', 'demo-session-036', '크립토 사기 구별법', NOW() - INTERVAL '12 days'),

  ('10000000-0000-0000-0000-000000000601', 'demo-session-037', 'BTS 소개해주세요', NOW() - INTERVAL '28 days'),
  ('10000000-0000-0000-0000-000000000601', 'demo-session-038', '방탄소년단 멤버 소개', NOW() - INTERVAL '24 days'),
  ('10000000-0000-0000-0000-000000000603', 'demo-session-039', 'NewJeans 데뷔 스토리', NOW() - INTERVAL '22 days');


-- =====================================================
-- 7. DEMO USER (0002) 데이터 정합성 보장
-- contribution_power=45, total_citations=128, pending_wld=6.667
-- =====================================================

UPDATE users SET
  contribution_power = 45,
  total_citations = 128,
  pending_wld = 6.667
WHERE id = '00000000-0000-0000-0000-000000000002';


-- =====================================================
-- VERIFICATION QUERIES (주석 처리 - 디버깅 시 사용)
-- =====================================================

-- SELECT 'users' AS tbl, COUNT(*) FROM users
-- UNION ALL SELECT 'bots', COUNT(*) FROM bots
-- UNION ALL SELECT 'knowledge_nodes', COUNT(*) FROM knowledge_nodes WHERE id::text LIKE '10000000-%'
-- UNION ALL SELECT 'node_edges', COUNT(*) FROM node_edges
-- UNION ALL SELECT 'contributions', COUNT(*) FROM contributions WHERE id LIKE 'c0000000-%'
-- UNION ALL SELECT 'citations', COUNT(*) FROM citations WHERE session_id LIKE 'demo-session-%';

-- Demo user check:
-- SELECT id, nullifier_hash, contribution_power, total_citations, pending_wld
-- FROM users WHERE id = '00000000-0000-0000-0000-000000000002';
