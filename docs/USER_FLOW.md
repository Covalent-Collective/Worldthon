# Seed Vault - User Flow

## 사용자 페르소나

### Persona 1: 지혜로운 민수 (검색자)

**Demographics:**
- 32세, 서울 거주 직장인
- World App 사용자 (Orb 인증 완료)
- 주 5회 이상 온라인 정보 검색

**Goals:**
- 신뢰할 수 있는 로컬 정보 (맛집, 병원 등)
- AI가 아닌 실제 경험담
- 빠르고 정확한 답변

**Pain Points:**
- "블로그 후기가 다 광고 같아요"
- "ChatGPT는 서울 골목을 몰라요"
- "누가 쓴 건지 알 수 없어서 불안해요"

**Behavior:**
- 정보 검색 시 출처를 중요시함
- 커뮤니티 후기 선호
- 프리미엄 정보에 월 1-2만원 지불 의향

---

### Persona 2: 공유하는 지영 (기여자)

**Demographics:**
- 45세, 서울 토박이 자영업자
- World App 얼리어답터
- SNS에 로컬 정보 공유 활발

**Goals:**
- 자신의 지식/경험 가치 인정받기
- 부수입 창출
- 커뮤니티 기여

**Pain Points:**
- "블로그 써봤자 광고에 묻혀요"
- "내 정보가 AI 학습에 쓰이는 게 싫어요"
- "기여해도 보상이 없어요"

**Behavior:**
- 주 2-3회 정보 공유
- 본인 정보의 인용/공유에 민감
- 투명한 보상 체계 선호

---

### Persona 3: 전문가 영진 (고급 기여자)

**Demographics:**
- 38세, 산부인과 전문의
- Orb 인증 완료
- 의료 정보 공유에 관심

**Goals:**
- 정확한 의료 정보 전파
- 전문가로서의 평판 구축
- 환자 교육 기여

**Pain Points:**
- "인터넷 의료 정보가 너무 부정확해요"
- "익명 커뮤니티는 책임감이 없어요"
- "전문 지식 공유할 신뢰 플랫폼이 없어요"

**Behavior:**
- 주 1회 전문 정보 공유
- 높은 품질 기준
- 출처 명시 중요시

---

## Flow 1: 첫 방문 (Landing)

```
┌─────────────────────────────────┐
│  Seed Vault Landing             │
│  AuroraBackground               │
│                                 │
│  [Gradient Sphere Logo]         │
│  Seed Vault                     │
│  HUMAN KNOWLEDGE REPOSITORY     │
│                                 │
│  Dead Internet 시대,            │
│  검증된 인간 지식의 보존소       │
│                                 │
│  [World ID로 시작하기]          │  <- glass-btn-wrap
│                                 │
│  [N 노드] [N 기여자] [N Vault]  │
└─────────────────────────────────┘
         │ Click login
         ▼
     Mock auth -> isVerified = true
         │
         ▼
     음성 저널링 홈 (Flow 2)
```

**Landing 핵심 요소:**
- AuroraBackground: 전체 화면 오로라 배경 애니메이션
- Gradient Sphere: CSS 그라데이션 구형 로고
- glass-btn-wrap: 글래스모피즘 스타일 로그인 버튼
- 실시간 통계 배지: 노드 수, 기여자 수, Vault 수

---

## Flow 2: 음성 저널링 및 기여 (HOME `/`)

상태 머신: `idle` -> `recording` -> `processing` -> `complete` -> `contributed`

### 상태: idle

```
┌─────────────────────────────────┐
│  Journal          0xABCD...     │
│  RECORD YOUR TRUTH    [logout]  │
│                                 │
│  오늘의 이야기를 들려주세요.     │
│  당신의 경험이 집단지성이 됩니다 │
│                                 │
│         [VoiceOrb 3D]           │  <- CSS 3D sphere
│                                 │
│         TAP TO START            │
└─────────────────────────────────┘
```

**idle 핵심 요소:**
- 상단 헤더: "Journal" 타이틀 + 지갑 주소 (0xABCD...) + 로그아웃
- VoiceOrb: CSS 3D 구형 오브, 대기 상태에서 부드러운 호흡 애니메이션
- 안내 텍스트: 한국어 문구로 사용자 유도

### 상태: recording

```
┌─────────────────────────────────┐
│  (빨간 점) 01:23                │  <- 빨간 녹음 인디케이터 + 디지털 타이머
│                                 │
│     [VoiceOrb morphing]         │  <- blob 변형 애니메이션
│                                 │
│       TAP TO STOP               │
└─────────────────────────────────┘
         │ Tap orb
         ▼
```

**recording 핵심 요소:**
- 빨간 점 깜빡임: 녹음 중 표시
- 디지털 타이머: MM:SS 포맷, font-digital 스타일
- VoiceOrb blob: 음성 입력에 반응하는 유기체적 변형 애니메이션

### 상태: processing

```
┌─────────────────────────────────┐
│  AI가 분석 중입니다...           │
│                                 │
│     [VoiceOrb processing]       │
│                                 │
│  키워드 추출 및 커뮤니티 매칭    │
└─────────────────────────────────┘
         │ 2초 후
         ▼
```

**processing 핵심 요소:**
- 분석 상태 텍스트: "AI가 분석 중입니다..."
- VoiceOrb: 처리 중 펄싱 애니메이션
- 하단 설명: "키워드 추출 및 커뮤니티 매칭"

### 상태: complete

```
┌─────────────────────────────────┐
│  [체크 gradient circle]         │
│  분석 완료                      │
│  01:23 녹음됨                   │
│                                 │
│  ┌ EXTRACTED KEYWORDS ────────┐ │
│  │ 도전 창업 실패 배움 성장   │ │  <- emotion/topic 색 분류
│  └────────────────────────────┘ │
│                                 │
│  ┌ RECOMMENDED VAULT ─────────┐ │
│  │ [ ] 서울 로컬 가이드  95%  │ │
│  │ [v] 산부인과 전문의   85%  │ │  <- multi-select checkboxes
│  │ [ ] 한식 레시피       75%  │ │
│  └────────────────────────────┘ │
│                                 │
│  [다시 녹음]  [기여하기]        │  <- glass buttons
└─────────────────────────────────┘
```

**complete 핵심 요소:**
- 완료 인디케이터: 그라데이션 원 + 체크 마크
- 녹음 시간 표시: "01:23 녹음됨"
- EXTRACTED KEYWORDS: AI가 추출한 키워드, 감정/주제별 색상 분류
- RECOMMENDED VAULT: 매칭률(%) 기반 추천 Vault 목록, 체크박스 복수 선택
- 하단 액션: "다시 녹음" (리셋) / "기여하기" (제출)

### 상태: contributed

```
┌─────────────────────────────────┐
│     [체크 large gradient circle]│
│                                 │
│        기여 완료!                │
│  2개 Vault에 기여되었습니다.    │
│    +0.002 WLD earned            │
│                                 │
│    [새로운 기록 시작]            │
└─────────────────────────────────┘
```

**contributed 핵심 요소:**
- 큰 성공 원형 애니메이션: 그라데이션 원 확대
- 기여 요약: N개 Vault에 기여 + WLD 보상 표시
- "새로운 기록 시작" 버튼: idle 상태로 리셋

---

## Flow 3: 지식 탐색 (EXPLORE)

### Explore 리스트 (`/explore`)

```
┌─────────────────────────────────┐
│  Explore                        │
│  KNOWLEDGE VAULTS               │
│                                 │
│  ┌ [3D Carousel] ──────────────┐│
│  │                              ││
│  │  [Card1] [Card2] [Card3]    ││  <- CSS 3D rotation
│  │                              ││
│  └──────────────────────────────┘│
│                                 │
│  각 카드: 아이콘, 이름, 통계    │
│  [탐색하기] 버튼                │
└─────────────────────────────────┘
         │ 탐색하기 click
         ▼
```

**Explore 리스트 핵심 요소:**
- 3D Carousel: CSS 3D transform 기반 카드 회전 UI
- 각 카드: Vault 아이콘, 이름, 노드/기여자 통계
- "탐색하기" 버튼: 해당 Vault 상세 페이지로 이동

### Bot 상세 (`/explore/[botId]`)

```
┌─────────────────────────────────┐
│  <- 서울 로컬 가이드             │
│       local                     │
│                                 │
│  ┌ 질문을 입력하세요...    [->] ┐│
│  └──────────────────────────────┘│
│                                 │
│  ┌ [Knowledge Graph Canvas] ───┐│
│  │   o--o                      ││
│  │  / \   \                    ││
│  │ o   o---o                   ││
│  └──────────────────────────────┘│
│                                 │
│  [노드 24] [연결 15] [인용 128] │  <- font-digital
│                                 │
│  ┌ TOP CONTRIBUTORS ──────────┐ │
│  │ 1. 0x1a2b... --------- 45  │ │
│  │ 2. 0x5e6f... ------    32  │ │  <- horizontal bars
│  │ 3. 0xab12... ----      20  │ │
│  └──────────────────────────────┘│
└─────────────────────────────────┘
```

**Bot 상세 핵심 요소:**
- 뒤로가기 + Vault 이름 + 카테고리 라벨
- 검색 입력: 질문 입력 필드 + 전송 버튼
- Knowledge Graph Canvas: 노드-엣지 시각화 (인터랙티브)
- 통계 배지: 노드 수, 연결 수, 인용 수 (font-digital 스타일)
- TOP CONTRIBUTORS: 수평 막대 그래프, 지갑 주소 + 기여 수

### 질문 응답 + 영수증

```
질문 제출 후 시퀀스:

1. 검색 애니메이션 (바운싱 점)
   "Searching..."

2. 노드 발견 확인 (체크마크)
   "Found N nodes"

3. 타이핑 답변 표시
   - 신뢰도 미터 (confidence meter)
   - 매칭된 키워드 하이라이트

4. Contribution Receipt (기여 영수증)
   ┌─────────────────────────────────┐
   │  기여 영수증                    │
   │                                 │
   │  1. 0x1a2b... ========== 60%   │
   │     +0.0012 WLD                │
   │                                 │
   │  2. 0x5e6f... ======    40%    │
   │     +0.0008 WLD                │
   │                                 │
   │  이 답변은 위 기여자들의 지식을  │
   │  기반으로 생성되었습니다         │
   └─────────────────────────────────┘
```

**응답 시퀀스 핵심 요소:**
- 단계적 로딩: 검색 -> 발견 -> 답변 타이핑 -> 영수증
- 신뢰도 미터: 답변 정확도 시각 표시
- 매칭 키워드: 답변 내 관련 키워드 하이라이트
- 기여 영수증: 기여자별 비율 막대 + WLD 보상 금액

---

## Flow 4: 보상 (REWARDS `/rewards`)

```
┌─────────────────────────────────┐
│  Reward                         │
│  GEOTHERMAL POWER STATION       │
│                                 │
│  ┌ POWER LEVEL ───────────────┐ │
│  │ LV.4      CONTRIBUTION 37% │ │
│  │ ||||______                 │ │  <- power meter bars
│  │ PROGRESS TO LV.5  7/10     │ │
│  └──────────────────────────────┘│
│                                 │
│  ┌ PENDING REWARD (gradient) ──┐│
│  │ PENDING REWARD               ││
│  │ (dot) Accumulating           ││
│  │                              ││
│  │ 6.666666 WLD                ││  <- font-digital
│  │                              ││
│  │ [CLAIM REWARD]              ││  <- glass button
│  └──────────────────────────────┘│
│                                 │
│  ┌────────┐  ┌────────┐        │
│  │CITATIONS│  │ NODES  │        │
│  │  128    │  │   3    │        │
│  └────────┘  └────────┘        │
│                                 │
│  ┌ TRANSACTION LOG ───────────┐ │
│  │ + 산부인과 전문의 2025-02-01││
│  │ + 서울 로컬 가이드 2025-01-22││
│  │ + Worldcoin 2025-01-15      ││
│  └──────────────────────────────┘│
└─────────────────────────────────┘
```

**Rewards 핵심 요소:**
- 타이틀: "GEOTHERMAL POWER STATION" 메타포
- POWER LEVEL: 레벨 표시 (LV.N) + 기여도 퍼센트 + 파워 미터 바
- 레벨업 진행도: "PROGRESS TO LV.N  M/10"
- PENDING REWARD: 그라데이션 카드, "Accumulating" 상태 표시
- WLD 금액: font-digital 스타일, 소수점 6자리
- CLAIM REWARD: 글래스 스타일 수령 버튼
- 통계 카드: CITATIONS 수, NODES 수
- TRANSACTION LOG: 최근 기여/보상 이력, 날짜 포함

---

## 하단 네비게이션 (Bottom Navigation)

인증 완료(isVerified) 후 모든 화면에 표시:

```
┌─────────────────────────────────┐
│  Fixed bottom, max-width 390px  │
│  glass-nav 스타일               │
│                                 │
│  [Journal]  [Explore]  [Reward] │
│   마이크     지구      선물      │
│                                 │
│  Active: aurora-cyan glow       │
└─────────────────────────────────┘
```

**네비게이션 핵심 요소:**
- 고정 위치: 화면 하단 고정, max-width 390px (모바일 최적화)
- glass-nav: 글래스모피즘 반투명 배경
- 3개 탭: Journal (마이크 아이콘), Explore (지구 아이콘), Reward (선물 아이콘)
- 활성 상태: aurora-cyan 글로우 효과

---

## 사용자 여정 요약

```
┌──────────────┐
│  Landing     │
│  (첫 방문)    │
└──────┬───────┘
       │ World ID 로그인
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Journal     │<───>│  Explore     │<───>│  Reward      │
│  (음성 저널링)│     │  (지식 탐색)  │     │  (보상 확인)  │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│  녹음        │     │  Vault 선택   │
│  (VoiceOrb)  │     │  (3D Carousel)│
└──────┬───────┘     └──────┬───────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│  AI 분석     │     │  질문 입력    │
│  (키워드추출) │     │  (검색 바)    │
└──────┬───────┘     └──────┬───────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│  Vault 선택  │     │  답변 + 영수증│
│  (추천 매칭)  │     │  (기여자 추적) │
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  기여 완료   │
│  (+WLD 보상)  │
└──────────────┘
```

**여정 핵심 포인트:**
- 단일 진입점: Landing 페이지에서 World ID 인증
- 3개 주요 탭: Journal / Explore / Reward (하단 네비게이션으로 자유 이동)
- Journal 흐름: 녹음 -> AI 분석 -> Vault 매칭 -> 기여 완료
- Explore 흐름: Vault 카드 탐색 -> 상세 -> 질문 -> 답변 + 영수증
- Reward 흐름: 파워 레벨 확인 + WLD 수령

---

## 에러 상태

### 인증 에러

| Error Code | Trigger | User Message | UI Behavior |
|------------|---------|--------------|-------------|
| AUTH_TIMEOUT | 30초 응답 없음 | "연결 시간 초과. 다시 시도해주세요." | 재시도 버튼 표시 |
| AUTH_REJECTED | World App에서 거부 | "인증이 취소되었습니다." | Landing 초기 상태로 리셋 |
| AUTH_EXPIRED | 세션 24시간 초과 | "다시 인증해주세요." | isVerified = false, Landing으로 리다이렉트 |
| APP_NOT_FOUND | World App 미설치 | "World App이 필요합니다." | App Store 링크 표시 |

### 음성 녹음 에러

| Error Code | Trigger | User Message | UI Behavior |
|------------|---------|--------------|-------------|
| MIC_DENIED | 마이크 권한 거부 | "마이크 접근 권한이 필요합니다." | 설정 안내 링크 표시 |
| MIC_NOT_FOUND | 마이크 장치 없음 | "마이크를 찾을 수 없습니다." | VoiceOrb 비활성 상태 |
| RECORDING_FAILED | 녹음 중 오류 | "녹음 중 문제가 발생했습니다." | idle 상태로 리셋 + 재시도 안내 |
| RECORDING_TOO_SHORT | 3초 미만 녹음 | "조금 더 길게 녹음해주세요." | idle 상태로 리셋 |
| RECORDING_TOO_LONG | 5분 초과 | 자동 중단, "최대 녹음 시간 초과" | processing 상태로 전환 |

### AI 분석 에러

| Error Code | Trigger | User Message | UI Behavior |
|------------|---------|--------------|-------------|
| ANALYSIS_FAILED | AI 분석 실패 | "분석 중 문제가 발생했습니다." | "다시 녹음" 버튼 표시 |
| NO_KEYWORDS | 키워드 추출 불가 | "키워드를 추출할 수 없습니다. 다시 시도해주세요." | idle 상태로 리셋 |
| NO_VAULT_MATCH | 매칭 Vault 없음 | "적합한 Vault를 찾지 못했습니다." | 수동 Vault 선택 UI 표시 |

### 기여 에러

| Error Code | Trigger | User Message | UI Behavior |
|------------|---------|--------------|-------------|
| NO_VAULT_SELECTED | Vault 미선택 후 기여하기 | "기여할 Vault를 선택해주세요." | 체크박스 영역 강조 |
| CONTRIBUTE_FAILED | 제출 실패 | "기여에 실패했습니다. 다시 시도해주세요." | 재시도 버튼 표시, 녹음 데이터 유지 |

### 네트워크 상태

| State | Detection | UI Feedback |
|-------|-----------|-------------|
| 오프라인 | navigator.onLine === false | 배너: "연결 없음. 일부 기능이 제한됩니다." |
| 느린 연결 | API > 3초 | 스켈레톤 로더 + "로딩 중..." 텍스트 |
| 서버 에러 (5xx) | API response | "문제가 발생했습니다. 다시 시도해주세요." |

### 기타 에러

| 상황 | 화면 표시 | 다음 액션 |
|------|----------|----------|
| World App 외부 실행 | "World App에서 열어주세요" 배너 | Mock 모드로 기능 체험 가능 |
| 보상 수령 실패 | "수령에 실패했습니다." | 재시도 버튼 |

---

## 로딩 상태

### 스켈레톤 패턴

| Component | Skeleton Design |
|-----------|-----------------|
| VoiceOrb | 중앙 펄싱 구형 애니메이션 (저밝기) |
| 3D Carousel | 회색 카드 플레이스홀더 3장 + 쉬머 효과 |
| KnowledgeGraph | 중앙 펄싱 원형 + 점선 연결 애니메이션 |
| ContributionReceipt | 2개 수평 바 (60% + 40% 너비) + 쉬머 |
| RewardGauge | 빈 파워 미터 바 + 쉬머 효과 |
| KeywordChips | 둥근 회색 칩 3-5개 + 쉬머 |

### 로딩 시간

| Action | 예상 시간 | 스피너 표시 시점 |
|--------|----------|-----------------|
| 페이지 로드 | <1초 | 즉시 스켈레톤 |
| 음성 녹음 시작 | <500ms | 즉시 (마이크 권한 확인) |
| AI 분석 (processing) | 2초 | 즉시 (VoiceOrb 펄싱) |
| Vault 매칭 | 1-2초 | 분석 중 통합 표시 |
| 기여 제출 | 1-2초 | 즉시 (버튼 로딩 상태) |
| 그래프 렌더링 | 1-3초 | 500ms 후 |
| 질문 응답 | 2-5초 | 즉시 (바운싱 점 애니메이션) |
| 보상 수령 (Claim) | 1-3초 | 즉시 (버튼 로딩 상태) |

---

## 마이크로 인터랙션

### 버튼 상태

| State | Visual Change | Duration |
|-------|---------------|----------|
| Default | 100% 투명도, glass 스타일 | - |
| Hover | Scale 1.02, 밝기 +5%, glass 하이라이트 | 150ms |
| Active/Pressed | Scale 0.98, 밝기 -5% | 100ms |
| Disabled | 투명도 50% | - |
| Loading | 펄스 애니메이션, 스피너 | 무한 |

### VoiceOrb 인터랙션

| State | Animation | Description |
|-------|-----------|-------------|
| idle | 호흡 (breathe) | 느린 스케일 변화, 부드러운 그라데이션 회전 |
| recording | blob 변형 | 음성 입력에 반응하는 유기체적 변형, 빨간 글로우 |
| processing | 펄싱 (pulse) | 규칙적 확대/축소, aurora 색상 변화 |
| complete | 체크 원형 | 그라데이션 원 + 체크마크 드로잉 애니메이션 |
| contributed | 확장 체크 | 큰 그라데이션 원 + 성공 파티클 |

### 성공 피드백

```
┌─────────────────────────────────┐
│                                 │
│         [체크마크]              │  <- Scale in (300ms spring)
│      (gradient circle           │     원형 확장 (200ms)
│        확장)                    │     체크마크 그리기 (300ms)
│                                 │
│     "기여 완료!"                │  <- Fade in + slide up (200ms)
│  "N개 Vault에 기여되었습니다."  │
│     "+0.002 WLD earned"         │  <- 숫자 카운트업 (500ms)
│                                 │
└─────────────────────────────────┘
```

### 3D Carousel 인터랙션

| Action | Animation | Duration |
|--------|-----------|----------|
| 스와이프 | 카드 3D 회전, perspective 유지 | 300ms ease-out |
| 카드 포커스 | Scale 1.1, z-index 상승, 그림자 강화 | 200ms |
| 카드 블러 | Scale 0.9, 투명도 70% | 200ms |

### 검색 응답 시퀀스

| Stage | Animation | Duration |
|-------|-----------|----------|
| 검색 시작 | 바운싱 점 3개 (Searching...) | 반복 |
| 노드 발견 | 체크마크 + "Found N nodes" | 500ms |
| 답변 타이핑 | 글자 단위 타이핑 효과 | 가변 (50ms/글자) |
| 신뢰도 미터 | 좌->우 바 채우기 | 800ms |
| 영수증 표시 | Slide up + fade in | 300ms |

### 토스트 알림

| Type | Icon | Duration | Position |
|------|------|----------|----------|
| Success | 체크마크 | 3초 | 하단 중앙 |
| Error | X 마크 | 5초 (또는 탭하여 닫기) | 하단 중앙 |
| Info | 정보 아이콘 | 4초 | 하단 중앙 |
| Reward | WLD 아이콘 | 4초 | 하단 중앙 |
