# Web3 모르는 개발자의 해커톤 생존기

> 파트너는 사라지고, 남은 건 녹음 파일과 스케치뿐

---

## 서론: 그래서 내가 왜 여기 있지?

나는 Web3에 대해 아무것도 모르는 그냥 개발자다.

블록체인? 들어는 봤다. 토큰? 비트코인 말고는 잘 모른다. World ID? 그게 뭔데?

그런데 파트너가 어느 날 말했다.

> "야, World Build Korea 해커톤 나가자."

뭔 소린가 했다. 월드코인? 그 눈알 스캔하는 거? 내가?

파트너는 이미 아이디어로 가득 차 있었다. Dead Internet이 어쩌고, AI가 인터넷을 점령했고, 인간의 지식을 보존해야 하고... 열정적으로 설명하는데 솔직히 반 정도는 무슨 말인지 모르겠었다.

근데 듣다 보니까 생각이 났다. *"아, 이거 내가 아는 기술 좀 붙이면 되겠는데?"*

Next.js로 프론트 만들고, 상태 관리 붙이고, 그래프 시각화 라이브러리 쓰면 뭔가 나오겠지. World ID 연동은... 뭐 문서 보면 되겠지.

그래서 말했다. "그래, 해보자."

---

## 파트너는 사라졌다

그리고 파트너는 사라졌다.

아니, 사라진 건 아니고 각자 역할이 나뉜 거다. 파트너는 피치덱이랑 비즈니스 쪽 준비하고, 나는 뭔가 돌아가는 걸 만들어야 한다.

내 손에 남은 건 이것들이었다:
- 1시간 40분짜리 녹음 파일
- 카페에서 급하게 스케치한 메모
- "대충 이런 느낌?" 이라고 보내온 레퍼런스 링크 몇 개

좋다. 이것만으로 MVP를 만들어야 한다. 해커톤까지 남은 시간은 5일.

---

## AI 파이프라인: 혼자서 팀플하기

혼자 모든 걸 할 순 없다. 근데 2026년이다. AI한테 시키면 된다.

나만의 워크플로우가 만들어졌다:

### Step 1: ChatGPT — 녹음 파일 정리

녹음 파일을 ChatGPT에 던졌다. "우리가 뭔 얘기했는지 정리해줘."

1시간 40분의 브레인스토밍이 깔끔한 요약으로 변했다. 핵심 아이디어, 유저 플로우, 기술적으로 필요한 것들. 스케치한 메모랑 합쳐서 초안이 나왔다.

### Step 2: Gemini — 자료 수집 머신

초안을 Gemini한테 던졌다.

> "World ID가 뭔지, MiniKit이 뭔지, 해커톤에서 뭘 심사하는지 다 찾아줘."

Gemini가 미쳤다. 공식 문서, 예제 코드, 다른 해커톤 우승작 분석까지. 내가 모르는 Web3 세계의 컨텍스트가 쏟아졌다.

### Step 3: NotebookLM — 1,000개의 참고 자료

여기서부터가 진짜다.

Gemini가 찾아준 자료들, World ID 공식 문서, MiniKit 레포지토리, 비슷한 프로젝트들... 다 NotebookLM에 넣었다. 한 **1,000개 정도**의 소스가 쌓였다.

NotebookLM한테 물어봤다:

> "World ID 인증 구현하려면 뭘 알아야 해?"
> "MiniKit이랑 Next.js 연동 어떻게 해?"
> "nullifier_hash가 뭔데?"

모르는 거 있을 때마다 물어보고, 대화하고, 이해하고. 마치 Web3 전문가 친구가 옆에 있는 것 같았다.

### Step 4: Claude Code + NotebookLM MCP — 지식 연결

이제 진짜 코딩이다.

Claude Code Max를 켰다. 근데 여기서 핵심은 **NotebookLM MCP**다. NotebookLM에 쌓아둔 1,000개의 지식을 Claude Code가 직접 참조할 수 있다.

> "이 프로젝트에서 World ID 인증 어떻게 구현해?"

라고 물으면 Claude Code가 NotebookLM에서 관련 내용을 찾아서 답한다. 내가 일일이 복붙할 필요가 없다.

### Step 5: Claude Code Opus 4.5 + Plan Mode — MVP 설계

마지막 단계.

Claude Code한테 플랜 모드로 말했다:

> "우리 5일 안에 해커톤용 MVP 만들어야 해. 계획 세워봐."

Opus 4.5가 생각하더니 몇 가지 옵션을 제시했다:

1. 풀스택으로 가는 방법 (시간 부족)
2. 프론트만 만들고 Mock 데이터 쓰는 방법 (현실적)
3. 핵심 플로우 하나만 완성하는 방법 (안전하지만 밋밋함)

2번을 선택했다. 데모에서 "돌아가는 것처럼 보이기"가 중요하니까.

---

## 그래서 뭘 만들기로 했나

**Seed Vault** — Dead Internet 시대의 인간 지식 보존소

컨셉은 이렇다:
- 2026년, 인터넷의 90%가 AI가 만든 콘텐츠다
- 진짜 인간의 경험과 지식은 어디서 찾지?
- World ID Orb로 인증된 인간만 지식을 기여할 수 있는 플랫폼

파트너의 비전이 드디어 이해됐다. 괜찮은 아이디어네.

---

## Day 1: 일단 뭐라도 만들자

### 아침: 프로젝트 세팅

```bash
npx create-next-app@latest seed-vault-mvp
npx shadcn@latest init
npm install zustand @worldcoin/minikit-js react-force-graph-2d
```

여기까지는 익숙하다. Next.js에 Tailwind, 컴포넌트는 shadcn/ui. 이건 내 영역이야.

### 오후: 폴더 구조 잡기

Claude Code한테 물어봤다:

> "해커톤 MVP용 Next.js 프로젝트 구조 어떻게 잡을까?"

답이 왔다. 심플하게 가자고.

```
src/
├── app/           # 페이지들
├── components/    # UI 컴포넌트
├── lib/           # 유틸, 타입, Mock 데이터
├── hooks/         # 커스텀 훅
└── stores/        # 상태 관리
```

깔끔하다. 이 정도면 5일 안에 관리 가능하다.

### 저녁: 핵심 컴포넌트들

**KnowledgeGraph.tsx** — 지식 그래프 시각화

react-force-graph-2d를 써서 노드들이 둥둥 떠다니는 그래프를 만들었다. 처음에 SSR 에러가 났다.

```
ReferenceError: window is not defined
```

아, canvas 라이브러리는 서버사이드에서 안 되지. Next.js의 dynamic import로 해결.

```typescript
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
})
```

**userStore.ts** — Zustand로 상태 관리

```typescript
export const useUserStore = create(
  persist(
    (set) => ({
      isVerified: false,
      nullifierHash: null,
      rewards: { ... },
      setVerified: (verified, hash) => set({ ... }),
      addContribution: (botId, node) => set({ ... })
    }),
    { name: 'seed-vault-user' }
  )
)
```

persist 미들웨어 한 줄이면 localStorage에 자동 저장. Zustand 진짜 좋아.

### 밤: Git 푸시... 그리고 충돌

커밋하고 푸시하려는데:

```
! [rejected] main -> main (non-fast-forward)
```

아. 원격에 누가 뭔가 올렸나? 아 맞다, 처음에 GitHub에서 README 만들었지.

```bash
git pull origin main --rebase
# 충돌 발생: README.md
# 수동으로 해결
git add README.md
git rebase --continue
git push
```

혼자 작업하는데도 충돌이 난다. 이게 개발이지.

**Day 1 결과**: 31개 파일, 4,253줄 추가. 뭔가 생기긴 했다.

---

## 기술적으로 배운 것들

### World ID가 뭔지 이제 안다

World ID는 "Proof of Personhood" 시스템이다. 간단히 말하면:

1. 사용자가 Orb라는 기계로 홍채 스캔
2. 고유한 신원 증명 생성 (실제 신원은 모름)
3. 앱에서 이 증명으로 "이 사람은 진짜 인간" 확인 가능

핵심은 **nullifier_hash**다:
- 사용자의 실제 신원을 알 수 없음 (익명)
- 근데 같은 사람이 같은 액션을 하면 같은 해시 생성
- 중복 방지는 되면서 프라이버시 보장

영리하다. Web3 사람들 머리 좋네.

### MiniKit은 생각보다 쉬웠다

World App 안에서 돌아가는 Mini App 만드는 SDK인데, 문서 보니까 React 훅처럼 쓰면 됐다:

```typescript
const result = await MiniKit.commandsAsync.verify({
  action: 'contribute',
  verification_level: 'orb'
})
```

한 줄이면 Orb 인증 창이 뜬다. 생각보다 별 거 없네?

### 그래프 시각화가 데모에서 먹힌다

react-force-graph-2d로 노드들이 물리 엔진으로 움직이는 그래프를 만들었는데, 이게 데모에서 "와 뭔가 있어 보인다" 효과가 크다.

기술적으로 복잡한 건 아닌데 시각적 임팩트가 있다. 해커톤에서 중요한 포인트.

---

## Day 2: PWA, 테스트 자동화, 그리고 404 지옥

### 아침: PWA 설정

데모할 때 "앱처럼 보이게" 하고 싶었다. next-pwa 설치.

```bash
npm install next-pwa
```

next.config.mjs 수정:

```javascript
import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

export default pwaConfig({})
```

manifest.json도 만들었다. 이제 홈 화면에 추가하면 진짜 앱처럼 보인다.

### 오전: 모바일 전용 뷰

해커톤 심사할 때 폰으로 보여줄 거다. 근데 개발은 PC로 하니까... PC에서도 모바일처럼 보이게 하자.

```tsx
// layout.tsx
<div className="min-h-screen flex justify-center bg-gray-100">
  <div className="w-full max-w-[390px] bg-white min-h-screen shadow-xl">
    {children}
  </div>
</div>
```

390px 고정. iPhone 14 기준이다. 이제 PC에서 봐도 폰 화면처럼 가운데에 뜬다.

### 오후: 404 지옥

첫 번째 문제: 로그인 버튼 누르면 404

```tsx
// 문제의 코드
<Link href="/marketplace">World ID로 시작하기</Link>
```

아, /marketplace 페이지가 없지. 로그인하면 같은 페이지에서 마켓플레이스가 렌더링되는 구조인데 Link를 썼네.

```tsx
// 수정
<button onClick={() => {
  useUserStore.getState().setVerified(true, '0x...')
}}>
  World ID로 시작하기
</button>
```

두 번째 문제: 하단 탐색 메뉴에서 "탐색" 누르면 404

/explore/[botId] 페이지는 있는데 /explore 페이지가 없었다. 새로 만들었다.

```tsx
// src/app/explore/page.tsx
export default function ExplorePage() {
  return (
    <main>
      <h1>지식 탐색</h1>
      <p>전문가 봇의 지식 그래프를 탐색하세요</p>
      {expertBots.map(bot => (
        <Link href={`/explore/${bot.id}`}>
          {bot.name}
        </Link>
      ))}
    </main>
  )
}
```

### 저녁: Playwright로 E2E 테스트 자동화

수동으로 테스트하다 지쳤다. Playwright 설치하고 자동화했다.

```typescript
// scripts/e2e-test.ts
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

// 1. 랜딩 페이지
await page.goto('http://localhost:3000')
await page.screenshot({ path: 'screenshots/01-landing.png' })

// 2. 로그인
await page.click('button:has-text("World ID로 시작하기")')
await page.screenshot({ path: 'screenshots/02-marketplace.png' })

// 3. 탐색 페이지
await page.click('text=탐색하기')
// ... 계속
```

이제 `npx tsx scripts/e2e-test.ts` 한 줄이면 전체 플로우 스크린샷이 자동으로 찍힌다.

처음엔 테스트가 자꾸 실패했다:
- 타임아웃 → waitForTimeout 늘림
- 잘못된 botId → mock 데이터 확인해서 수정
- 뒤로가기 후 요소 못 찾음 → 직접 URL 이동으로 변경

**최종 결과: 7개 테스트 시나리오 전부 통과**

```
1️⃣ 랜딩 페이지 ✅
2️⃣ 마켓플레이스 ✅ (봇 4개 확인)
3️⃣ 지식 그래프 ✅ (캔버스 렌더링 확인)
4️⃣ 기여 페이지 ✅ (인증 완료 + 입력 폼)
5️⃣ 보상 페이지 ✅ (WLD 클레임 UI)
6️⃣ 탐색 목록 ✅ (봇 4개 링크)
7️⃣ 네비게이션 ✅ (홈으로 이동)
```

### 밤: 로그아웃 기능

랜딩 페이지가 안 보인다고? 이미 인증된 상태로 localStorage에 저장돼서 그렇다.

```typescript
// userStore.ts에 추가
logout: () => set({
  isVerified: false,
  nullifierHash: null,
  rewards: { ... 초기값 }
})
```

마켓플레이스 헤더에 로그아웃 버튼도 추가했다. 이제 테스트하기 편하다.

**Day 2 결과**: PWA 설정, 모바일 전용 뷰, 404 수정 2건, E2E 테스트 자동화, 로그아웃 기능

---

## 앞으로 해야 할 것들

### Day 3 (예정)
- [ ] World ID 실제 연동 (Mock → Real)
- [ ] 질문하면 답변 나오는 플로우 개선
- [ ] 기여 영수증 UI 다듬기

### Day 4 (예정)
- [ ] 애니메이션 추가 (성공/실패 피드백)
- [ ] 전체 플로우 최종 점검
- [ ] 엣지 케이스 처리

### Day 5 (예정)
- [ ] 데모 시나리오 연습
- [ ] 발표 준비
- [ ] 최종 버그 수정

---

## 중간 회고

### 잘한 것
- **AI 파이프라인 구축**: ChatGPT → Gemini → NotebookLM → Claude Code. 혼자서 3명 몫은 한 것 같다.
- **기술 스택 선택**: 익숙한 것 위주로 가니까 속도가 난다. Web3 부분만 새로 배우면 됨.
- **문서 먼저 작성**: Claude Code한테 계획부터 세우게 하니까 삽질이 줄었다.

### 아쉬운 것
- **테스트 없음**: 해커톤이니까 넘어가지만, 프로덕션이었으면 큰일.
- **혼자 작업**: 파트너랑 같이 코딩했으면 더 빨랐을 텐데.

### 배운 것
- Web3가 생각보다 어렵지 않다. 문서만 잘 읽으면 된다.
- AI 도구들 조합하면 진짜 생산성이 미친다.
- 해커톤은 "완벽한 것"보다 "돌아가는 것"이 중요하다.

---

## 다음 글에서

Day 2-5의 여정을 계속 기록할 예정이다.

- 실제로 World ID 인증이 되는 순간
- 데모하다 앱 터지면 어떡하지
- 발표 3분 전 버그 발견하면?

해커톤 끝나면 회고도 쓸 거다. 우승하면 좋겠지만, 못 해도 배운 게 많으니까.

일단 오늘은 여기까지. 내일도 코딩해야 한다.

---

*계속 업데이트됩니다.*

---

## 부록: 실제 사용한 도구들

| 도구 | 용도 | 한줄 평 |
|------|------|---------|
| ChatGPT | 녹음 파일 정리, 초안 작성 | 브레인스토밍 정리에 최고 |
| Gemini | 자료 수집, 리서치 | 검색 능력이 미쳤다 |
| NotebookLM | 심층 리서치, Q&A | 1,000개 문서도 거뜬히 소화 |
| Claude Code | 실제 코딩, 설계 | Plan 모드가 진짜 유용 |
| Next.js 14 | 프레임워크 | App Router 이제 익숙해짐 |
| shadcn/ui | UI 컴포넌트 | 해커톤 필수템 |
| Zustand | 상태 관리 | Redux 지옥에서 해방 |
| react-force-graph-2d | 그래프 시각화 | 데모 임팩트용 |

---

**GitHub**: [Covalent-Collective/Worldthon](https://github.com/Covalent-Collective/Worldthon)

---

## Day 3: 프로덕션을 향해 — Supabase, 66days 스타일, 그리고 World Coin 봇

### 아침: Supabase 통합의 악몽

Mock 데이터로만 돌아가던 앱에 진짜 백엔드를 붙이기로 했다. Supabase 선택.

근데 문제가 생겼다. 빌드할 때 에러가 난다:

```
Error: supabaseUrl is required
```

환경 변수가 없으면 빌드 자체가 안 되는 거다. Vercel에 배포할 때도, 로컬에서 처음 클론할 때도 문제.

해결책: **Lazy-Loading 패턴**

```typescript
// src/lib/supabase.ts
let _supabase: SupabaseClient<Database> | null = null

export const getSupabase = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) return null  // 환경변수 없으면 null
  if (!_supabase) {
    _supabase = createClient<Database>(...)  // 첫 호출 시에만 생성
  }
  return _supabase
}
```

이제 환경 변수 없이도 빌드 가능. 로컬 모드로 자동 폴백된다.

### 오전: 실시간 인용 추적

기여한 지식이 AI에게 인용되면 실시간으로 보여주고 싶었다.

**citationStore** 만들었다:

```typescript
// src/stores/citationStore.ts
incrementCitation: (nodeId) => {
  set(state => ({
    citationCounts: {
      ...state.citationCounts,
      [nodeId]: (state.citationCounts[nodeId] || 0) + 1
    }
  }))
}
```

낙관적 업데이트 — 서버 응답 기다리지 않고 바로 UI 반영. 사용자 경험이 훨씬 좋아졌다.

### 오후: 66days 스타일 그래프 리디자인

파트너가 말했다.

> "야, 노드가 너무 못생겼어. 66days 때처럼 이쁘게 만들어."

66days는 예전에 같이 작업한 이벤트 웹인데, 그때 그래프 시각화가 꽤 잘 나왔었다.

**변경 사항:**

1. **다크 배경** — #0a0a0f + 바이올렛/푸시아 그라디언트 오버레이
2. **그라디언트 노드** — 6가지 색상 세트 (퍼플-바이올렛, 핑크-레드, 블루-시안...)
3. **글로우 이펙트** — radialGradient로 노드마다 발광
4. **글로시 하이라이트** — 노드 상단에 흰색 반사광
5. **곡선 링크** — quadraticCurveTo + 화살표
6. **인용 애니메이션** — 녹색 링 확장 + "+1" 플로팅

```typescript
// 글로우 이펙트
const glow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius)
glow.addColorStop(0, `${colors.from}66`)
glow.addColorStop(0.5, `${colors.from}22`)
glow.addColorStop(1, `${colors.from}00`)
```

Canvas 2D API로 직접 그리니까 자유도가 높다. 노드 5px로 작게, 대신 글로우로 존재감 살림.

### 저녁: World Coin 전문가 봇 추가

해커톤 당일 생각이 났다. 거기 오는 사람들 다 월드코인 전문가들인데, 월드코인 봇이 없으면 뭘 기여하겠어?

**worldcoin-expert** 봇 추가:

```typescript
{
  id: 'worldcoin-expert',
  name: 'World Coin 전문가',
  description: 'World ID, WLD 토큰, Orb 인증에 대한 모든 것',
  icon: '🌐',
  graph: {
    nodes: [
      { id: 'wld-1', label: 'World ID란?', citationCount: 892 },
      { id: 'wld-2', label: 'Orb 인증 과정', citationCount: 567 },
      { id: 'wld-3', label: 'WLD 토큰 유틸리티', citationCount: 423 },
      // ...
    ]
  }
}
```

시드 데이터로 기본 지식 노드 6개 넣어둠. 참석자들이 여기에 자기 지식을 더 기여할 수 있다.

### 밤: 500 에러의 습격

다 됐다 싶었는데 localhost:3000 들어가니까 500 에러.

원인: .next 캐시 꼬임. 동시에 여러 빌드가 돌아서 그런 듯.

```bash
rm -rf .next && npm run dev
```

캐시 날리니까 바로 해결. 이런 건 경험으로 아는 거다.

### Day 3 결과

- Supabase 백엔드 통합 (lazy-loading)
- 실시간 인용 추적 시스템
- 66days 스타일 그래프 리디자인
- World Coin 전문가 봇 추가
- citationStore, knowledgeStore 신규 생성

**변경 파일**: 20개  
**코드 변경**: +4,883 / -673 lines

---

## Day 3 기술 정리

### 새로 추가된 파일들

| 파일 | 용도 |
|------|------|
| `src/lib/supabase.ts` | Supabase 클라이언트 (lazy-loading) |
| `src/lib/api.ts` | 백엔드 API 함수들 |
| `src/lib/database.types.ts` | Supabase 타입 정의 |
| `src/stores/citationStore.ts` | 인용 카운트 실시간 추적 |
| `src/stores/knowledgeStore.ts` | 로컬 그래프 상태 관리 |

### 주요 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `KnowledgeGraph.tsx` | 66days 스타일 완전 리디자인 |
| `mock-data.ts` | World Coin 전문가 봇 추가 |
| `userStore.ts` | Supabase 연동 로직 |
| `contribute/[botId]/page.tsx` | 새 API 시그니처 적용 |

---

## 남은 것들

### Day 4 (예정)
- [ ] Vercel 배포
- [ ] Supabase 프로덕션 설정
- [ ] World ID 실제 연동 테스트

### Day 5 (예정)
- [ ] 최종 버그 수정
- [ ] 데모 시나리오 리허설
- [ ] 발표 준비

---

*Day 3 완료. 내일은 배포다.*
