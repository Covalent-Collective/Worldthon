# Seed Vault - 기술 아키텍처

## 기술 스택

| 영역 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| Framework | Next.js | 14 (App Router) | MiniKit 호환, SSR 지원 |
| UI Components | shadcn/ui | latest | 일관된 디자인 시스템, Radix 기반 |
| Styling | Tailwind CSS | 3.x | 빠른 UI 개발, 모바일 반응형 |
| World ID | MiniKit JS SDK | latest | World App 네이티브 통합 |
| Graph | react-force-graph-2d | 1.x | 경량, 모바일 최적화 |
| State | Zustand | 4.x | 가벼운 상태 관리, persist 지원 |
| Data | Mock JSON | - | MVP용, 실제 DB 없음 |

---

## shadcn/ui 설정

### Configuration
- **Style**: new-york
- **Base Color**: neutral
- **CSS Variables**: Enabled

### 설치된 컴포넌트

| Component | Path | Usage |
|-----------|------|-------|
| Button | `@/components/ui/button` | CTA, 액션 버튼 |
| Card | `@/components/ui/card` | 봇 카드, 대시보드 섹션 |
| Input | `@/components/ui/input` | 지식 제목 입력 |
| Textarea | `@/components/ui/textarea` | 지식 내용 입력 |

### 컴포넌트 추가 방법
```bash
npx shadcn@latest add [component-name]
```

---

## 폴더 구조

```
seed-vault-mvp/
├── docs/                       # 문서
│   ├── PLAN.md                 # 구현 계획
│   ├── ARCHITECTURE.md         # 기술 아키텍처
│   ├── USER_FLOW.md            # 사용자 플로우
│   ├── DEMO_SCENARIO.md        # 데모 시나리오
│   ├── SETUP.md                # 개발 환경 설정
│   ├── PITCH.md                # 피치 개요
│   └── API_CONTRACTS.md        # API 계약
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # MiniKit Provider 래핑
│   │   ├── page.tsx            # 마켓플레이스 (홈)
│   │   ├── contribute/
│   │   │   └── [botId]/page.tsx
│   │   ├── explore/
│   │   │   └── [botId]/page.tsx
│   │   └── rewards/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── BotCard.tsx
│   │   ├── KnowledgeGraph.tsx
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
│       └── userStore.ts        # Zustand 스토어
├── public/
├── .env.local                  # 환경 변수
└── package.json
```

---

## 디자인 시스템

### 색상 체계

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#000000` | World ID 연동, CTA |
| Primary Light | `#333333` | Hover 상태 |
| Success | `#4ADE80` | 성공, Contribution Power |
| Warning | `#FBBF24` | Pending 상태 |
| Error | `#EF4444` | 검증 에러 |
| Background | `#FFFFFF` | 페이지 배경 |
| Surface | `#F9FAFB` | 카드, 상승 표면 |
| Border | `#E5E7EB` | 구분선, 입력 테두리 |
| Muted | `#6B7280` | 보조 텍스트 |

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

### Persistence
- Storage key: `seed-vault-user`
- Middleware: `zustand/middleware/persist`
- Storage: localStorage

---

## react-force-graph-2d 통합

### SSR 처리 (Critical)
```typescript
// 반드시 dynamic import + ssr: false 사용
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <GraphSkeleton />
})
```

### 그래프 데이터 변환
```typescript
// Input: ExpertBot.graph
{ nodes: KnowledgeNode[], edges: KnowledgeEdge[] }

// Output: ForceGraph format
{
  nodes: { id, name, val, color, node }[],
  links: { source, target, label }[]
}

// Node size 계산: Math.log(citationCount + 1) * 3 + 5
```

### 성능 설정

| Setting | Value | Reason |
|---------|-------|--------|
| `cooldownTicks` | 50 | 50회 반복 후 물리엔진 정지 |
| `nodeRelSize` | 4 | 기본 노드 크기 배수 |
| Node limit | 30 max | 모바일 WebView 성능 |

---

## 접근성 (Accessibility)

### WCAG 2.1 AA 준수

#### 색상 대비
| Element | Foreground | Background | Ratio | Status |
|---------|------------|------------|-------|--------|
| Body text | #000000 | #FFFFFF | 21:1 | Pass |
| Primary button | #FFFFFF | #000000 | 21:1 | Pass |
| Muted text | #6B7280 | #FFFFFF | 4.6:1 | Pass |

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
   - 2D만 사용 (3D 제외)
   - cooldownTicks로 초기 레이아웃 시간 제한

2. **번들 사이즈**
   - react-force-graph-2d dynamic import
   - SSR 비활성화로 hydration 문제 방지

3. **모바일 최적화**
   - viewport 설정으로 확대/축소 방지
   - safe-area-inset 적용
   - 터치 영역 최소 44px

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
