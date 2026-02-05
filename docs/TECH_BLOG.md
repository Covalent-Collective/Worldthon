# Seed Vault 개발기: AI 시대의 인간 지식 보존소 만들기

> World Build Korea Hackathon 2026 참가 프로젝트 개발 여정

**작성일**: 2026년 2월 5일
**팀**: Covalent Collective
**프로젝트**: [Seed Vault](https://github.com/Covalent-Collective/Worldthon)

---

## 목차

1. [프로젝트 배경](#1-프로젝트-배경)
2. [기술 스택 선정](#2-기술-스택-선정)
3. [개발 과정](#3-개발-과정)
4. [핵심 기술 구현](#4-핵심-기술-구현)
5. [마주친 문제들과 해결 과정](#5-마주친-문제들과-해결-과정)
6. [개발 일지](#6-개발-일지)
7. [회고 및 다음 단계](#7-회고-및-다음-단계)

---

## 1. 프로젝트 배경

### 문제 인식: Dead Internet Era

2026년, 인터넷 콘텐츠의 90%가 AI가 생성합니다. 검색 결과, 소셜 미디어, 리뷰 — 어디를 봐도 AI가 만든 콘텐츠가 넘쳐납니다.

**질문**: 진짜 인간의 경험과 지식은 어디서 찾을 수 있을까요?

### 솔루션: Seed Vault

**Seed Vault**는 World ID Orb로 인증된 인간만 기여할 수 있는 지식 저장소입니다.

핵심 가치:
- **신뢰**: Orb 인증으로 봇과 AI 콘텐츠 차단
- **보상**: 기여한 지식이 인용될 때마다 WLD 토큰 보상
- **투명성**: 답변의 출처를 지식 그래프로 시각화

---

## 2. 기술 스택 선정

### 프레임워크 & 라이브러리

| 영역 | 기술 | 선정 이유 |
|------|------|-----------|
| Framework | **Next.js 14** (App Router) | MiniKit 호환, SSR 지원, 빠른 개발 |
| UI Components | **shadcn/ui** | 일관된 디자인 시스템, Radix 기반 접근성 |
| Styling | **Tailwind CSS** | 빠른 UI 개발, 모바일 반응형 |
| Auth | **World ID MiniKit** | World App 네이티브 통합 |
| Graph Visualization | **react-force-graph-2d** | 경량, 모바일 최적화 |
| State Management | **Zustand** | 가벼운 상태 관리, persist 지원 |

### 왜 이 조합인가?

**Next.js 14 + MiniKit**: World App 내에서 실행되는 Mini App을 만들기 위해서는 MiniKit SDK와의 호환이 필수입니다. Next.js의 App Router는 서버 컴포넌트와 클라이언트 컴포넌트를 명확히 분리할 수 있어 MiniKit의 클라이언트 사이드 로직을 깔끔하게 처리할 수 있습니다.

**shadcn/ui**: 해커톤에서 시간은 금입니다. shadcn/ui는 복사-붙여넣기 방식으로 필요한 컴포넌트만 가져올 수 있고, Tailwind와 완벽히 통합됩니다. 특히 Radix UI 기반이라 접근성이 기본 내장되어 있습니다.

**Zustand**: Redux는 해커톤에서 너무 무겁습니다. Zustand는 보일러플레이트가 거의 없고, persist 미들웨어로 localStorage 연동이 한 줄이면 됩니다.

---

## 3. 개발 과정

### 3.1 프로젝트 초기화

```bash
# Next.js 프로젝트 생성
npx create-next-app@latest seed-vault-mvp --typescript --tailwind --app

# shadcn/ui 초기화
npx shadcn@latest init

# 필요한 의존성 설치
npm install zustand @worldcoin/minikit-js react-force-graph-2d
```

### 3.2 폴더 구조 설계

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # MiniKit Provider 래핑
│   ├── page.tsx            # 마켓플레이스 (홈)
│   ├── contribute/[botId]/ # 지식 기여 페이지
│   ├── explore/[botId]/    # 그래프 탐색 페이지
│   └── rewards/            # 보상 대시보드
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── BotCard.tsx         # 봇 카드 컴포넌트
│   ├── KnowledgeGraph.tsx  # 지식 그래프 시각화
│   ├── ContributionReceipt.tsx
│   ├── VerifyButton.tsx    # World ID 인증 버튼
│   └── RewardGauge.tsx     # 보상 게이지
├── lib/
│   ├── types.ts            # TypeScript 타입 정의
│   ├── minikit.ts          # MiniKit 설정
│   ├── mock-data.ts        # Mock 그래프 데이터
│   └── utils.ts            # 유틸리티 함수
├── hooks/
│   └── useWorldId.ts       # World ID 인증 훅
└── stores/
    └── userStore.ts        # Zustand 스토어
```

### 3.3 핵심 데이터 모델 설계

```typescript
// 지식 노드
interface KnowledgeNode {
  id: string
  label: string
  content: string
  contributor: string  // nullifier_hash (익명화)
  createdAt: string
  citationCount: number
}

// 전문가 봇
interface ExpertBot {
  id: string
  name: string
  description: string
  icon: string
  category: string
  graph: {
    nodes: KnowledgeNode[]
    edges: KnowledgeEdge[]
  }
}
```

---

## 4. 핵심 기술 구현

### 4.1 World ID 인증 (MiniKit)

World ID Orb 인증은 Seed Vault의 핵심입니다. 인증된 인간만이 지식을 기여할 수 있습니다.

```typescript
// hooks/useWorldId.ts
export function useWorldId() {
  const { setVerified } = useUserStore()

  const verify = async () => {
    if (!MiniKit.isInstalled()) {
      // World App 외부에서 실행 시 Mock 모드
      return { success: false, error: 'MiniKit not installed' }
    }

    const result = await MiniKit.commandsAsync.verify({
      action: 'contribute',
      verification_level: 'orb'
    })

    if (result.status === 'success') {
      setVerified(true, result.nullifier_hash)
      return { success: true }
    }

    return { success: false, error: result.error_code }
  }

  return { verify }
}
```

**핵심 포인트**: `nullifier_hash`는 사용자의 실제 신원을 알 수 없지만, 동일 사용자가 동일 액션에 대해 항상 같은 해시를 생성합니다. 이를 통해 익명성을 유지하면서도 중복 기여를 감지할 수 있습니다.

### 4.2 지식 그래프 시각화

react-force-graph-2d를 사용하여 지식 노드 간의 관계를 시각화합니다.

```typescript
// components/KnowledgeGraph.tsx
'use client'

import dynamic from 'next/dynamic'

// Critical: SSR 비활성화
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <GraphSkeleton />
})

export function KnowledgeGraph({ bot, highlightedNodes }) {
  const graphData = {
    nodes: bot.graph.nodes.map(node => ({
      id: node.id,
      name: node.label,
      // 인용 횟수에 따라 노드 크기 결정
      val: Math.log(node.citationCount + 1) * 3 + 5,
      // 하이라이트된 노드는 검정색
      color: highlightedNodes.includes(node.id) ? '#000000' : '#9CA3AF'
    })),
    links: bot.graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target
    }))
  }

  return (
    <ForceGraph2D
      graphData={graphData}
      cooldownTicks={50}  // 성능 최적화
      nodeRelSize={4}
    />
  )
}
```

**중요**: `ssr: false` 설정이 필수입니다. react-force-graph-2d는 canvas API를 사용하므로 서버 사이드에서 렌더링할 수 없습니다.

### 4.3 상태 관리 (Zustand)

```typescript
// stores/userStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      isVerified: false,
      nullifierHash: null,
      rewards: {
        contributionPower: 0,
        totalCitations: 0,
        pendingWLD: 0,
        contributions: []
      },

      setVerified: (verified, nullifierHash) => set({
        isVerified: verified,
        nullifierHash: nullifierHash || null
      }),

      addContribution: (botId, node) => set((state) => ({
        rewards: {
          ...state.rewards,
          contributionPower: Math.min(100, state.rewards.contributionPower + 5),
          contributions: [...state.rewards.contributions, {
            botId,
            nodeId: node.id,
            createdAt: new Date().toISOString()
          }]
        }
      }))
    }),
    { name: 'seed-vault-user' }  // localStorage 키
  )
)
```

**persist 미들웨어**: 한 줄로 상태가 localStorage에 자동 저장됩니다. 사용자가 앱을 닫았다 열어도 인증 상태와 기여 내역이 유지됩니다.

---

## 5. 마주친 문제들과 해결 과정

### 5.1 Git 충돌 해결

**문제**: 로컬 커밋과 원격 저장소 간 충돌 발생

```bash
! [rejected] main -> main (non-fast-forward)
```

**해결 과정**:

```bash
# 1. rebase로 원격 변경사항 가져오기
git pull origin main --rebase

# 2. 충돌 파일 확인
git diff --name-only --diff-filter=U

# 3. 충돌 해결 후 계속
git add README.md
git rebase --continue

# 4. 푸시
git push --set-upstream origin main
```

**교훈**: 협업 시에는 작업 시작 전 항상 `git pull`을 먼저 실행하는 습관이 중요합니다.

### 5.2 SSR과 Canvas 라이브러리 충돌

**문제**: react-force-graph-2d가 서버 사이드에서 크래시

```
ReferenceError: window is not defined
```

**해결**: Next.js의 dynamic import 활용

```typescript
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
})
```

### 5.3 MiniKit 외부 실행 처리

**문제**: World App 외부에서 앱 테스트 시 MiniKit API 사용 불가

**해결**: Mock 모드 폴백 구현

```typescript
if (!MiniKit.isInstalled()) {
  // 개발/테스트용 Mock 모드
  return mockVerification()
}
```

---

## 6. 개발 일지

### Day 1 (2026-02-05)

#### 오전: 프로젝트 세팅
- Next.js 14 프로젝트 생성
- Tailwind CSS 설정
- shadcn/ui 초기화 (Button, Card, Input, Textarea)

#### 오후: 핵심 구조 설계
- 폴더 구조 설계 및 생성
- TypeScript 타입 정의 (`types.ts`)
- Mock 데이터 구조 설계 (`mock-data.ts`)

#### 저녁: 컴포넌트 개발
- MiniKit Provider 설정
- BotCard 컴포넌트 구현
- KnowledgeGraph 컴포넌트 구현 (react-force-graph-2d)
- Zustand 스토어 설정

#### 마무리
- Git 초기 커밋 및 GitHub 푸시
- 충돌 해결 (README.md)
- 31개 파일, 4,253줄 추가

**커밋**: `7942d20` - Add UI components, stores, and project configuration

---

### Day 2 (예정)

- [ ] 마켓플레이스 페이지 UI 완성
- [ ] World ID 인증 플로우 구현
- [ ] 지식 기여 폼 구현

### Day 3 (예정)

- [ ] 그래프 탐색 페이지 구현
- [ ] 질문-답변 플로우 연동
- [ ] 기여 영수증 컴포넌트 완성

### Day 4 (예정)

- [ ] 보상 대시보드 구현
- [ ] 전체 플로우 통합 테스트
- [ ] 모바일 최적화

### Day 5 (예정)

- [ ] 애니메이션 추가
- [ ] 에러 핸들링 강화
- [ ] 데모 시나리오 리허설

---

## 7. 회고 및 다음 단계

### 잘된 점

1. **명확한 문서화**: PLAN.md, ARCHITECTURE.md 등 상세한 문서를 먼저 작성하여 개발 방향이 명확했음
2. **기술 스택 선정**: shadcn/ui + Zustand 조합이 해커톤에 최적화된 선택이었음
3. **타입 안전성**: TypeScript 타입을 먼저 정의하여 개발 중 버그 최소화

### 개선할 점

1. **Git 워크플로우**: 원격 저장소와 더 자주 동기화 필요
2. **테스트**: 단위 테스트 부재 — Post-MVP에서 추가 예정

### Post-Hackathon 로드맵

| Priority | Task |
|----------|------|
| P0 | 서버사이드 World ID 검증 |
| P0 | PostgreSQL + Prisma 백엔드 |
| P1 | 실제 WLD 토큰 보상 시스템 |
| P2 | AI 기반 답변 생성 |
| P2 | 커뮤니티 검증 시스템 |

---

## 부록

### A. 유용한 명령어

```bash
# 개발 서버 실행
npm run dev

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]

# 빌드
npm run build

# 린트
npm run lint
```

### B. 환경 변수 설정

```env
# .env.local
NEXT_PUBLIC_APP_ID=app_xxx
NEXT_PUBLIC_ACTION_ID=contribute
```

### C. 참고 자료

- [World ID Developer Docs](https://docs.worldcoin.org)
- [MiniKit Documentation](https://docs.worldcoin.org/minikit)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

---

*이 문서는 개발이 진행됨에 따라 계속 업데이트됩니다.*
