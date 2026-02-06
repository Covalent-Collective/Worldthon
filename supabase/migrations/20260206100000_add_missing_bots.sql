-- 누락된 봇 2개 + 시드 노드 추가

-- 1. crypto-expert 봇
INSERT INTO bots (id, name, description, icon, category, is_active) VALUES
  ('crypto-expert', '크립토 전문가', '비트코인, 이더리움, DeFi에 대한 심층 분석', '₿', 'Web3', true)
ON CONFLICT (id) DO NOTHING;

-- 2. kpop-insider 봇
INSERT INTO bots (id, name, description, icon, category, is_active) VALUES
  ('kpop-insider', 'K-POP 인사이더', 'K-POP 아이돌, 음원차트, 팬덤 문화 전문가', '🎤', '엔터테인먼트', true)
ON CONFLICT (id) DO NOTHING;

-- crypto-expert 시드 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count) VALUES
  ('crypto-expert', '00000000-0000-0000-0000-000000000001', '비트코인 기초', '비트코인은 2009년 사토시 나카모토가 만든 최초의 암호화폐입니다. 총 발행량 2,100만 개로 제한되어 있으며, 약 4년마다 반감기를 통해 신규 발행량이 절반으로 줄어듭니다.', 45),
  ('crypto-expert', '00000000-0000-0000-0000-000000000001', '이더리움 기초', '이더리움은 스마트 컨트랙트 플랫폼입니다. 비탈릭 부테린이 2015년 창시했으며, 디앱(DApp), DeFi, NFT의 기반이 됩니다. ETH는 가스비로 사용됩니다.', 42),
  ('crypto-expert', '00000000-0000-0000-0000-000000000001', 'DeFi 기초', 'DeFi(탈중앙화 금융)는 중개자 없이 금융 서비스를 이용하는 것입니다. 대출, 예치, 스왑이 가능합니다. Uniswap, Aave, Compound가 대표적입니다.', 39),
  ('crypto-expert', '00000000-0000-0000-0000-000000000001', '레이어2 솔루션', '레이어2는 이더리움의 확장성 문제를 해결합니다. Arbitrum, Optimism, Base가 대표적. 가스비가 이더리움의 1/10 수준이고 처리 속도도 빠릅니다.', 33),
  ('crypto-expert', '00000000-0000-0000-0000-000000000001', '메타마스크 사용법', '메타마스크는 가장 인기있는 웹3 지갑입니다. 크롬 확장 프로그램으로 설치하고, 시드 구문 12단어를 안전하게 보관하세요. 절대 시드 구문을 온라인에 입력하지 마세요.', 36)
ON CONFLICT DO NOTHING;

-- kpop-insider 시드 노드
INSERT INTO knowledge_nodes (bot_id, contributor_id, label, content, citation_count) VALUES
  ('kpop-insider', '00000000-0000-0000-0000-000000000001', 'BTS 소개', 'BTS(방탄소년단)는 2013년 빅히트에서 데뷔한 7인조 보이그룹입니다. RM, 진, 슈가, 제이홉, 지민, 뷔, 정국으로 구성. 빌보드 핫100 1위를 기록했습니다.', 50),
  ('kpop-insider', '00000000-0000-0000-0000-000000000001', 'BLACKPINK 소개', 'BLACKPINK는 2016년 YG에서 데뷔한 4인조 걸그룹입니다. 지수, 제니, 로제, 리사로 구성. 코첼라 헤드라이너를 역임했습니다.', 47),
  ('kpop-insider', '00000000-0000-0000-0000-000000000001', 'NewJeans 소개', 'NewJeans는 2022년 어도어에서 데뷔한 5인조 걸그룹입니다. Y2K 컨셉과 독특한 바이럴 마케팅으로 데뷔와 동시에 대중적 인기를 얻었습니다.', 43),
  ('kpop-insider', '00000000-0000-0000-0000-000000000001', '팬덤 문화', 'K-POP 팬덤은 체계적인 조직력이 특징입니다. 총공(조직적 스트리밍), 광고 서포트, 앨범 대량구매 등을 진행합니다.', 38),
  ('kpop-insider', '00000000-0000-0000-0000-000000000001', '월드투어 티켓팅', 'K-POP 월드투어 티켓은 예스24, 인터파크에서 예매합니다. 팬클럽 선예매 후 일반 예매 순서. 서버 대기열 받는 것이 핵심.', 41)
ON CONFLICT DO NOTHING;
