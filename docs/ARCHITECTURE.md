# Seed Vault - 기술 아키텍처

## 기술 스택

| 영역 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| Framework | Next.js | 14 (App Router) | MiniKit 호환, SSR 지원 |
| UI Components | Custom Glassmorphism | - | glass-card, glass-btn-wrap 3-layer 시스템 |
| Styling | Tailwind CSS | 3.x | 빠른 UI 개발, 모바일 반응형 |
| Animation | framer-motion | 11.x | 애니메이션, 페이지 전환 |
| World ID | MiniKit JS SDK | latest | World App 네이티브 통합 |
| Graph | Custom KnowledgeGraph | - | Canvas 기반 2D 그래프, 자체 구현 |
| State | Zustand | 4.x | 가벼운 상태 관리, persist 지원 |
| Font | Orbitron (Google Fonts) | - | 디지털 숫자 표시용 font-digital |
| Data | Mock JSON | - | MVP용, 실제 DB 없음 |

---

## Glassmorphism Design System

### Glass Components
| Component | Class | Usage |
|-----------|-------|-------|
| Glass Card | `glass-card` | 카드, 정보 패널 |
| Glass Button (3-layer) | `glass-btn-wrap > glass-btn > glass-btn-text + glass-btn-shadow` | CTA, 액션 버튼 |
| Glass Navigation | `glass-nav` | 하단 네비게이션 |
| Aurora Background | `AuroraBackground` | 모든 페이지 배경 (그라디언트 + 오로라 orb) |

### Key Gradients
| Name | CSS | Usage |
|------|-----|-------|
| Main Gradient | `linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)` | 주요 CTA, 성공 표시, 진행바 |
| Aurora Background | `repeating-linear-gradient(-45deg, violet->cyan->blue->purple)` | 페이지 배경 |

### 기본 UI 컴포넌트
| Component | Path | Usage |
|-----------|------|-------|
| Button | `@/components/ui/Button` | 기본 버튼 |
| Card | `@/components/ui/Card` | 기본 카드 |
| Input | `@/components/ui/input` | 지식 제목 입력 |
| Textarea | `@/components/ui/textarea` | 지식 내용 입력 |

---

## 폴더 구조

```
seed-vault-mvp/
├── docs/                       # 문서
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 전역 레이아웃 (Orbitron 폰트)
│   │   ├── page.tsx            # 랜딩 / 저널링 홈
│   │   ├── globals.css         # 글로벌 스타일 + glass utilities
│   │   ├── explore/
│   │   │   ├── page.tsx        # Vault 탐색 (봇 목록)
│   │   │   └── [botId]/page.tsx # 봇 상세 (그래프 + 질문)
│   │   └── rewards/
│   │       └── page.tsx        # 보상 대시보드
│   ├── components/
│   │   ├── ui/                 # 기본 UI (Button, Card, Input, Textarea)
│   │   ├── AuroraBackground.tsx    # 오로라 배경 (전 페이지)
│   │   ├── BottomNav.tsx           # 하단 고정 네비 (Journal/Explore/Reward)
│   │   ├── Carousel3D.tsx          # 3D CSS 회전 카루셀
│   │   ├── DetailedContributionReceipt.tsx  # 기여 영수증
│   │   ├── EtherealShadow.tsx      # 이더리얼 그림자 효과
│   │   ├── GlassButton.tsx         # 글래스 버튼 컴포넌트
│   │   ├── GraphStatsOverlay.tsx   # 그래프 통계 오버레이
│   │   ├── JournalingHome.tsx      # 저널링 홈 (음성 녹음 + 기여 플로우)
│   │   ├── KnowledgeGraph.tsx      # 지식 그래프 시각화
│   │   ├── VoiceOrb.tsx            # 3D 음성 오브 (가짜 오디오)
│   │   ├── BotCard.tsx
│   │   ├── ContributionReceipt.tsx
│   │   ├── VerifyButton.tsx
│   │   └── RewardGauge.tsx
│   ├── lib/
│   │   ├── types.ts            # TypeScript 타입 정의
│   │   ├── minikit.ts          # MiniKit 설정
│   │   ├── mock-data.ts        # Mock 그래프 데이터
│   │   └── utils.ts            # 유틸리티 함수
│   ├── hooks/
│   │   └── useWorldId.ts       # World ID 인증 훅
│   └── stores/
│       ├── userStore.ts        # Zustand 사용자 스토어
│       ├── citationStore.ts    # 인용 추적 스토어
│       └── knowledgeStore.ts   # 지식 노드 관리 스토어
├── public/
│   ├── worldcoin-logo.svg      # Worldcoin 로고
│   ├── profiles/               # 봇 프로필 이미지
│   └── fonts/                  # 커스텀 폰트
└── package.json
```

---

## 디자인 시스템

### 색상 체계 (Digital Permafrost Theme)

| Name | Hex | Usage |
|------|-----|-------|
| Night | `#0a0a0f` | 페이지 배경 |
| Permafrost | `#12121a` | 카드 배경, 중간 레이어 |
| Arctic | `#e0e7ff` | 주 텍스트 |
| Aurora Cyan | `#00f2ff` | 주요 CTA, 활성 상태 |
| Aurora Violet | `#667eea` | 보조 포인트 |
| Success | `#4ADE80` | 성공, Contribution Power |
| Warning | `#FBBF24` | Pending 상태 |
| Error | `#EF4444` | 검증 에러 |

### 타이포그래피

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page Title | 24px | 700 | 1.2 |
| Section Header | 18px | 600 | 1.3 |
| Card Title | 16px | 600 | 1.4 |
| Body Text | 14px | 400 | 1.5 |
| Caption | 12px | 500 | 1.4 |
| Small | 10px | 400 | 1.3 |

### 간격 체계

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | 인라인 간격, 아이콘 패딩 |
| `space-2` | 8px | 컴포넌트 내부 패딩 |
| `space-3` | 12px | 카드 패딩, 리스트 간격 |
| `space-4` | 16px | 섹션 패딩 |
| `space-5` | 24px | 페이지 마진 |
| `space-6` | 32px | 섹션 구분 |

### 반응형 브레이크포인트

| Breakpoint | Width | Target |
|------------|-------|--------|
| Default | < 640px | 모바일 (World App) |
| sm | >= 640px | 큰 휴대폰 |
| md | >= 768px | 태블릿 (선택적) |

**참고**: World App WebView 기준, 375px 너비 최적화

---

## 데이터 모델

### KnowledgeNode (지식 노드)
```typescript
interface KnowledgeNode {
  id: string              // 고유 ID
  label: string           // 노드 제목
  content: string         // 지식 내용
  contributor: string     // nullifier_hash (익명화)
  createdAt: string       // 생성일
  citationCount: number   // 인용 횟수
}
```

### KnowledgeEdge (노드 연결)
```typescript
interface KnowledgeEdge {
  source: string          // 출발 노드 ID
  target: string          // 도착 노드 ID
  relationship: string    // 관계 설명
}
```

### ExpertBot (전문가 봇)
```typescript
interface ExpertBot {
  id: string
  name: string
  description: string
  icon: string            // 이모지
  category: string
  nodeCount: number
  contributorCount: number
  graph: {
    nodes: KnowledgeNode[]
    edges: KnowledgeEdge[]
  }
}
```

---

## nullifier_hash 보안 모델

### 정의
`nullifier_hash`는 다음 조합으로 생성되는 고유 식별자입니다:
- 사용자의 World ID 아이덴티티
- Action ID (예: "contribute")
- Signal (선택적 추가 컨텍스트)

### 주요 특성

| Property | Description | Backend 활용 |
|----------|-------------|-------------|
| **액션별 고유** | 동일 사용자 = 동일 액션에 동일 해시 | 멱등성 키로 사용 |
| **익명** | 실제 신원 역추적 불가 | DB 저장 안전 |
| **결정론적** | 동일 입력 = 동일 출력 | 중복 감지 가능 |

### 저장 스키마 (Production)
```typescript
interface ContributorRecord {
  nullifier_hash: string      // PRIMARY KEY
  first_contribution_at: Date
  total_contributions: number
  is_banned: boolean          // 악용 방지
}
```

### 중복 방지 로직
```typescript
// 동일 액션에 대한 중복 검사
// "contribute" 액션은 다중 기여 허용
// 일회성 액션은 중복 거부
```

---

## World ID 인증 플로우

### 1. 클라이언트 사이드 (MVP)
```
사용자 → VerifyButton 클릭
       → MiniKit.commandsAsync.verify()
       → World App에서 Orb 인증
       → nullifier_hash 반환
       → Zustand에 인증 상태 저장
```

### 2. 서버 사이드 검증 (Production 필수)

```
Client                    Backend                 World ID API
  |                          |                          |
  |--- proof + signal ------>|                          |
  |                          |--- POST /v1/verify ----->|
  |                          |<-- verification result --|
  |                          |                          |
  |                          |-- store nullifier_hash -->|
  |<-- JWT token ------------|                          |
```

**CRITICAL**: 클라이언트 검증만으로는 보안이 불충분합니다. Production에서는 반드시 World ID API (`https://developer.worldcoin.org/api/v1/verify/{app_id}`)로 서버사이드 검증이 필요합니다.

### 3. 지식 기여 플로우
```
사용자 → Orb 인증 완료
       → 지식 입력 (제목 + 내용)
       → 제출
       → Mock 데이터에 노드 추가
       → Zustand에 기여 기록
       → 성공 애니메이션
```

### 4. 질문-답변 플로우
```
사용자 → 질문 입력
       → generateMockAnswer() 호출
       → 키워드 매칭으로 관련 노드 선택
       → 답변 생성 + 사용된 노드 ID 반환
       → 그래프에서 해당 노드 하이라이트
       → 기여 영수증 표시
```

---

## 상태 관리 (Zustand)

```typescript
interface UserState {
  // State
  isVerified: boolean           // Orb 인증 여부
  nullifierHash: string | null  // 익명 식별자
  rewards: {
    contributionPower: number   // 0-100
    totalCitations: number      // 총 인용 횟수
    pendingWLD: number          // 수령 가능한 WLD
    contributions: []           // 기여 목록
  }

  // Actions
  setVerified: (verified: boolean, nullifierHash?: string) => void
  addContribution: (botId: string, node: KnowledgeNode) => void
  incrementCitations: (count: number) => void
  claimRewards: () => void
}
```

### citationStore (인용 추적)
```typescript
// 노드별 인용 횟수 추적, 기여자별 인용 집계
// 질문-답변 플로우에서 참조된 노드의 인용 횟수 자동 증가
```

### knowledgeStore (지식 노드 관리)
```typescript
// 그래프 노드/엣지 CRUD 관리
// 새 기여 노드 추가 시 기존 그래프에 병합
// 노드 하이라이트 상태 관리
```

### Persistence
- Storage key: `seed-vault-user`
- Middleware: `zustand/middleware/persist`
- Storage: localStorage

---

## Custom KnowledgeGraph (Canvas 기반)

자체 구현한 Canvas 2D 기반 지식 그래프 시각화 컴포넌트.

### 렌더링 방식
- **Canvas 2D Context**: HTML5 Canvas API 직접 사용
- **물리 시뮬레이션**: 자체 force-directed 레이아웃
- **애니메이션**: requestAnimationFrame 기반 렌더 루프

### 노드 렌더링
```
원형 노드 + 글로우 효과
- 기본 노드: 원(circle) + 라벨
- 하이라이트 노드: 확대 + 글로우(glow) 이펙트
- 크기: 인용 횟수에 비례
```

### 엣지 렌더링
```
곡선 베지어 연결
- 노드 간 연결선: quadratic bezier curve
- 방향 표시: 반투명 그라디언트
```

### GraphStatsOverlay
그래프 위에 오버레이되는 통계 패널:
- 총 노드 수, 엣지 수
- 기여자 수, 인용 횟수

### 성능 설정

| Setting | Value | Reason |
|---------|-------|--------|
| Canvas 해상도 | devicePixelRatio 대응 | 레티나 디스플레이 지원 |
| Node limit | 30 max | 모바일 WebView 성능 |
| 애니메이션 | requestAnimationFrame | 부드러운 60fps 렌더링 |

---

## 접근성 (Accessibility)

### WCAG 2.1 AA 준수

#### 색상 대비 (Dark Theme)
| Element | Foreground | Background | Ratio | Status |
|---------|------------|------------|-------|--------|
| Body text (Arctic) | #e0e7ff | #0a0a0f | 14.2:1 | Pass |
| CTA (Aurora Cyan) | #00f2ff | #0a0a0f | 12.1:1 | Pass |
| Card text (Arctic) | #e0e7ff | #12121a | 12.8:1 | Pass |
| Accent (Aurora Violet) | #667eea | #0a0a0f | 5.3:1 | Pass |

#### 스크린 리더 지원
| Component | Aria Label | Role |
|-----------|------------|------|
| VerifyButton | "World ID Orb로 인증하기" | button |
| BotCard | "{name}, {nodeCount}개 노드, {contributorCount}명 기여자" | article |
| KnowledgeGraph | "{count}개 노드의 지식 그래프" | img |
| RewardGauge | "Contribution Power: {value}%" | progressbar |

#### 키보드 네비게이션
| Key | Action |
|-----|--------|
| Tab | 인터랙티브 요소 순차 이동 |
| Shift+Tab | 역순 이동 |
| Enter | 버튼/링크 활성화 |
| Escape | 모달 닫기 |

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 환경 변수

```env
# 클라이언트 (public)
NEXT_PUBLIC_APP_ID=app_xxx        # World Developer Portal
NEXT_PUBLIC_ACTION_ID=contribute  # Incognito Action ID

# 서버 (future)
WORLD_ID_API_KEY=sk_xxx           # 서버사이드 검증용
DATABASE_URL=postgresql://...     # DB 연결
```

---

## 성능 고려사항

1. **그래프 렌더링**
   - 노드 30개 이하 유지
   - Canvas 2D 자체 구현 (외부 라이브러리 의존 제거)
   - requestAnimationFrame 기반 렌더 루프

2. **번들 사이즈**
   - 자체 Canvas 그래프로 react-force-graph-2d 의존성 제거
   - framer-motion 트리 셰이킹 적용

3. **모바일 최적화**
   - viewport 설정으로 확대/축소 방지
   - safe-area-inset 적용
   - 터치 영역 최소 44px

---

## 화면 구성

| 화면 | 경로 | 설명 |
|------|------|------|
| 랜딩 / 저널링 홈 | `/` | World ID 로그인 / 음성 저널링 |
| Vault 탐색 | `/explore` | 전문가 봇 목록 |
| 봇 상세 | `/explore/[botId]` | 지식 그래프 + 질문/답변 |
| 보상 대시보드 | `/rewards` | 파워 레벨, WLD 보상 |

### 공통 UI 요소
- **AuroraBackground**: 모든 페이지에 적용되는 오로라 그라디언트 배경
- **BottomNav**: 하단 고정 네비게이션 (Journal / Explore / Reward)
- **GlassButton**: 3-layer 글래스모피즘 버튼

---

## 보안 고려사항

### 인증 & 권한

| Threat | Mitigation |
|--------|------------|
| 위조된 World ID proof | 서버사이드 World ID API 검증 |
| 세션 하이재킹 | 짧은 JWT 만료 (15분) + refresh token |
| 리플레이 공격 | signal에 nonce 포함, 사용된 proof 추적 |

### 입력 검증
- 모든 사용자 콘텐츠 sanitize (XSS 방지)
- 콘텐츠 길이 제한 (10,000자)
- 중복 콘텐츠 체크 (해시 비교)

### 데이터 프라이버시
- nullifier_hash 외 개인정보 저장하지 않음
- 모든 기여자 식별은 익명
- GDPR 삭제권 대응 가능

---

*Last Updated: 2026-02-06*
