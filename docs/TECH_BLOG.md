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

---

## Day 4: 태양계를 만들다 — 궤도 애니메이션과 UI 대수술

### 아침: "네트워크가 좀 밋밋해"

파트너가 홈 화면을 보더니 말했다.

> "이거 그냥 점들 떠있는 거잖아. 뭔가 움직이는 느낌이 없어."

맞는 말이다. 노드들이 정적으로 배치되어 있으니까 "살아있는 네트워크" 느낌이 안 났다.

아이디어가 떠올랐다. **태양계**. 내가 중심이고, 전문가 봇들이 주위를 공전하는 거다.

### 오전: CSS 궤도 역학

물리 엔진 쓸까 하다가 그냥 CSS로 하기로 했다. 해커톤이니까 심플하게.

**3개의 궤도 링 설계:**

```typescript
const orbits = [
  { radius: 90, duration: 30, bots: [] },   // 내부 궤도: 30초
  { radius: 140, duration: 45, bots: [] },  // 중간 궤도: 45초
  { radius: 185, duration: 60, bots: [] },  // 외부 궤도: 60초
]

// 봇들을 궤도에 분배
expertBots.forEach((bot, index) => {
  orbits[index % 3].bots.push(bot)
})
```

각 궤도마다 속도가 다르다. 케플러 법칙처럼 바깥 궤도가 더 느리게.

**핵심 CSS 애니메이션:**

```css
@keyframes orbit {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes counter-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}
```

여기서 중요한 게 `counter-orbit`이다.

### 오전: 회전하는 노드 문제

처음 만들었을 때 노드들이 공전하면서 **자기도 같이 회전**했다. 아이콘이 빙글빙글 돌아가니까 어지럽다.

해결책: **counter-rotation**

```tsx
<div style={{ animation: `orbit ${duration}s linear infinite` }}>
  {bots.map(bot => (
    <div style={{
      left: Math.cos(angle) * radius,
      top: Math.sin(angle) * radius
    }}>
      {/* 부모가 시계방향 회전하면, 자식은 반시계방향으로 상쇄 */}
      <div style={{ animation: `counter-orbit ${duration}s linear infinite` }}>
        {bot.icon}
      </div>
    </div>
  ))}
</div>
```

부모 컨테이너가 회전하면 자식도 따라 회전하는데, 자식한테 반대 방향 회전을 줘서 상쇄시키는 거다. 결과적으로 노드는 **공전은 하지만 자전은 안 한다**.

처음엔 `rotate(angleOffset)deg`로 위치를 잡았는데 이것도 회전값이 들어가서 문제였다. 결국 `cos/sin`으로 x/y 좌표를 직접 계산해서 **회전값 완전 제거**.

### 오후: 클릭이 안 돼요

태양계 완성! 했는데 내부 궤도 노드들이 클릭이 안 된다.

원인: 중앙 노드의 **코로나 이펙트**가 너무 컸다.

```tsx
{/* 이게 문제 */}
<div className="scale-[3] blur-3xl" />  // 3배 확대 = 240px 직경
```

80px 노드에 `scale-[3]`이면 240px가 된다. 내부 궤도가 90px인데 코로나가 120px까지 뻗으니까 클릭을 막는 거다.

해결:

```tsx
{/* 글로우 레이어에 pointer-events-none 추가 */}
<div className="scale-[3] blur-3xl pointer-events-none" />
```

그리고 z-index도 조정. 중앙 노드는 `z-10`, 봇 노드들은 `z-20`.

### 저녁: 점선 링이 삐뚤어요

중앙 노드 주변에 점선으로 회전하는 링을 넣었는데, 영점이 안 맞았다.

원인: `orbit` 애니메이션에 `translate(-50%, -50%)`가 들어있는데, 이미 위치가 잡힌 요소한테 또 translate를 주니까 이중으로 밀리는 거다.

해결: Tailwind 기본 제공 `spin` 애니메이션 사용. 이건 순수 회전만 한다.

```tsx
{/* orbit 대신 spin 사용 */}
<div
  className="absolute -inset-3 border-dashed"
  style={{ animation: 'spin 10s linear infinite' }}
/>
```

### 밤: 탐색 페이지 리뉴얼

홈이 이뻐지니까 탐색 페이지가 초라해 보였다. 카드 UI로 전면 개편.

**변경 사항:**
- 리스트 뷰 → 카드 캐러셀
- 트렌딩 봇 피처드 섹션 추가
- VAULT-XXX 시리얼 넘버 (Svalbard 감성)
- 카테고리별 가로 스크롤

```tsx
function ExplorerCard({ bot, featured }) {
  return (
    <div className={featured ? 'w-full' : 'w-[280px]'}>
      {/* 시리얼 넘버 */}
      <span className="font-mono text-[9px]">
        VAULT-{bot.id.slice(0, 3).toUpperCase()}
      </span>
      {/* 프로필 */}
      <div className="w-20 h-20 rounded-full bg-white/10">
        {bot.icon}
      </div>
      {/* 스탯 */}
      <div>{bot.nodeCount} nodes • {bot.contributorCount} contributors</div>
    </div>
  )
}
```

### Day 4 결과

- 태양계 스타일 홈 화면 완성
- 3단 궤도 시스템 (30s/45s/60s)
- counter-rotation으로 노드 회전 제거
- 클릭 영역 버그 수정 (pointer-events-none)
- 탐색 페이지 카드 캐러셀 UI
- 보상 페이지 터미널 스타일 로그

**변경**: 11개 파일, +2,812 / -393 lines

---

## Day 4 기술 정리

### CSS 애니메이션 키프레임

| 애니메이션 | 용도 |
|-----------|------|
| `orbit` | 공전 (translate + rotate) |
| `counter-orbit` | 역회전 (노드 똑바로 유지) |
| `twinkle` | 별 반짝임 |
| `float` | 부유 효과 |
| `shooting-star` | 유성 |

### 태양계 구조

```
[중앙 노드]
    ├── 코로나 레이어 (pointer-events-none)
    │   ├── blur-3xl scale-[3]
    │   ├── blur-2xl scale-[2]
    │   └── blur-xl scale-150
    ├── 코어 (w-10 h-10)
    └── 점선 링 (spin 10s)

[궤도 컨테이너] × 3
    └── 봇 노드들
        └── counter-orbit 래퍼
            └── 실제 노드 UI
```

### 배운 것들

1. **CSS 회전의 상속**: 부모가 회전하면 자식도 같이 돈다. 상쇄하려면 역방향 회전 필요.
2. **pointer-events-none**: 글로우/블러 이펙트는 시각적으로만 존재해야 할 때 필수.
3. **z-index 관리**: 레이어가 많아지면 명시적으로 관리 안 하면 클릭 버그 생긴다.
4. **translate vs position**: 이미 위치 잡힌 요소에 translate 애니메이션 쓰면 이중 이동 주의.

---

## 남은 것들

### Day 5 (최종)
- [ ] World ID 실제 연동 테스트
- [ ] Vercel 프로덕션 배포
- [ ] 데모 시나리오 최종 점검
- [ ] 발표 리허설

---

## Day 4 (심야): 디자인 통일의 미학

### 자정: Knowledge Graph 대수술

태양계 홈 화면이 완성되고 나니까, 탐색 페이지의 Knowledge Graph가 눈에 거슬렸다.

> "이거 왜 혼자 다른 세계에서 온 것 같지?"

맞다. 홈 화면은 어두운 우주 테마인데, 그래프는 밝은 하늘색 배경이었다. 디자인 언어가 안 맞았다.

### 새벽 1시: 브루탈리스트 실험

처음엔 브루탈리스트 디자인을 시도했다. 나눔명조 폰트에 다크 브라운 배경, 라임/크림/골드 색상 팔레트.

```css
--graph-bg: #3D2B1F;      /* 다크 브라운 */
--graph-lime: #D4E157;    /* 라임 */
--graph-cream: #FFFDE7;   /* 크림 */
--graph-gold: #C9A227;    /* 골드 */
```

폰트 파일까지 다운받아서 적용했는데...

> "야, 나눔명조는 진짜 별로다."

바로 롤백. 해커톤에서 디자인 논쟁할 시간이 없다.

### 새벽 2시: 통일된 우주 테마

결국 답은 간단했다. **홈 화면 스타일을 그대로 가져오자.**

**배경 통일:**
```tsx
// Before: 밝은 하늘색
<div className="bg-gradient-to-br from-white via-sky-50 to-cyan-50">

// After: 홈 화면과 동일
<div className="bg-gradient-to-b from-night via-permafrost to-night">
```

**노드 색상 통일:**
```typescript
// Before: 66days 스타일 파스텔
const GRADIENT_SETS = [
  { from: '#667eea', to: '#764ba2' },
  { from: '#f093fb', to: '#f5576c' },
  // ...
]

// After: Aurora 테마
const NODE_COLORS = {
  cyan: { from: '#00F2FF', to: '#00D4E0' },
  violet: { from: '#667EEA', to: '#5A6FD1' },
  purple: { from: '#8B5CF6', to: '#7C4FE0' },
  pink: { from: '#EC4899', to: '#D43D89' },
  blue: { from: '#3B82F6', to: '#2970E0' },
}
```

**Border Radius 통일:**
```tsx
// Before: 브루탈리스트 (각진 모서리)
style={{ borderRadius: 0 }}

// After: 다른 카드와 동일
className="rounded-2xl"
```

### 새벽 2시 30분: 줌 레벨 최적화

그래프가 처음에 너무 확대되어 있어서 전체 노드가 안 보였다.

```typescript
// 초기 줌아웃
useEffect(() => {
  if (graphRef.current) {
    setTimeout(() => {
      graphRef.current?.zoomToFit(200, 80)
    }, 100)
  }
}, [graphData])
```

`zoomToFit`의 두 번째 파라미터가 패딩이다. 80으로 설정하니까 여유 있게 전체가 보인다.

### 쉘이 죽었다

중간에 웃픈 일이 있었다. fonts 폴더를 삭제했는데, 그 폴더 안에서 작업 중이었다.

```bash
rm -rf /Users/jyong/seed-vault-mvp/public/fonts/*.ttf
# 이후 모든 bash 명령어 실패
# Exit code 1, 출력 없음
```

현재 작업 디렉토리가 삭제되면 쉘 세션이 죽는다. 해결책:

```typescript
// 폴더 다시 생성
Write({ file_path: '/Users/jyong/.../fonts/.gitkeep', content: '' })
// 쉘 복구됨
```

`.gitkeep` 파일 하나 만들어서 폴더 복구하니까 쉘이 다시 살아났다. 삽질 10분.

---

## Day 4 심야 결과

- Knowledge Graph 배경: 홈 화면과 통일
- 노드 색상: Aurora 테마 (cyan, violet, purple, pink, blue)
- 링크 색상: Arctic 색상 계열
- Border radius: `rounded-2xl` 통일
- 초기 줌: 전체 노드 보이도록 축소

**커밋**: `style: Unify KnowledgeGraph with home screen design`

---

## 디자인 시스템 정리

### 색상 팔레트 (최종)

| 용도 | 색상 | Hex |
|------|------|-----|
| 배경 (night) | 검정에 가까운 남색 | `#0A0A0F` |
| 배경 (permafrost) | 약간 밝은 검정 | `#12121A` |
| 텍스트 (arctic) | 밝은 라벤더 | `#E0E7FF` |
| 강조 (aurora-cyan) | 네온 시안 | `#00F2FF` |
| 강조 (aurora-violet) | 바이올렛 | `#667EEA` |

### 컴포넌트 스타일

| 요소 | 스타일 |
|------|--------|
| 카드 | `glass-card rounded-2xl` |
| 버튼 (Primary) | `bg-gradient-to-r from-aurora-cyan to-aurora-violet` |
| 버튼 (Secondary) | `glass rounded-xl` |
| 입력 필드 | `bg-white/5 border-white/10 rounded-xl` |

### 애니메이션

| 이름 | 용도 | 속도 |
|------|------|------|
| `orbit` | 공전 | 30-60s |
| `spin` | 단순 회전 | 10s |
| `pulse` | 글로우 효과 | 2-4s |
| `twinkle` | 별 반짝임 | 2-5s |

---

## 남은 것들

### Day 5 (D-day)
- [ ] World ID 실제 연동 테스트
- [ ] Vercel 프로덕션 배포
- [ ] 데모 시나리오 최종 점검
- [ ] 발표 리허설
- [ ] 최종 버그 픽스

---

*Day 4 심야 세션 완료. 이제 진짜 자야겠다.*

---

## Day 5: 해커톤 당일 — 글래스모피즘, 3D 구체, 그리고 디테일의 전쟁

### 아침: 전면 리디자인의 시작

해커톤 당일 아침. 데모까지 몇 시간 남았는데, 화면을 보니까 뭔가 부족했다.

> "이거 해커톤 프로젝트처럼 생겼어. 진짜 앱처럼은 안 보여."

결심했다. **오늘 남은 시간 전부를 UI 폴리싱에 쓰자.**

---

### Aurora Background: 살아 숨쉬는 배경

첫 번째 문제는 배경이었다. 그냥 검은 화면에 컴포넌트만 올려놓은 느낌.

[aceternity의 aurora-background](https://ui.aceternity.com)를 참고해서 AuroraBackground 컴포넌트를 만들었다. 21st.dev의 MCP를 통해 레퍼런스 코드를 가져왔다.

```tsx
// AuroraBackground.tsx 핵심
<div style={{
  backgroundImage: `repeating-linear-gradient(...)`,
  backgroundSize: '300%, 200%',
}}>
  <motion.div // floating orbs
    animate={{
      x: [0, 20, -10, 15, 0],
      y: [0, -15, 10, -5, 0],
    }}
    transition={{ duration: 20, repeat: Infinity }}
  />
</div>
```

CSS `repeating-linear-gradient`에 `animate-aurora` 키프레임을 걸어서 배경이 천천히 흐르고, framer-motion floating orb들이 둥둥 떠다닌다.

**이걸 모든 페이지에 적용했다**: Home, Explore, Reward, Explore Detail.

한 가지 삽질이 있었다. 처음에 Explore 페이지에 그라데이션 오브를 직접 넣었는데, `overflow-hidden`이랑 충돌하면서 이상한 직사각형 두 개가 화면에 나타났다. 스크린샷 찍어보니까 끔찍했다.

> 교훈: 배경 이펙트는 전용 컴포넌트로 분리하자. 페이지 레이아웃이랑 섞으면 반드시 문제가 생긴다.

---

### 3D Voice Orb: CSS로 구체 만들기

Home 화면의 녹음 버튼을 완전히 새로 만들었다. 기존 단순한 원형 버튼 대신 **3D 구체**를 CSS만으로 구현했다.

```
구체 레이어 구조:
├── Base gradient (linear-gradient -20deg, #ddd6f3 → #faaca8)
├── Diffuse light (radial-gradient, 상단 하이라이트)
├── Specular highlight (흰색 반사광, blur 처리)
├── Rim light (하단 바이올렛 반사)
├── Ambient occlusion (하단 그림자)
├── Volume-reactive color shift (음성 강도에 반응)
└── Surface shimmer (conic-gradient 회전)
```

5개의 radial gradient를 겹쳐서 3D 느낌을 낸다. 핵심은 **specular highlight**(상단 밝은 반사)와 **ambient occlusion**(하단 어두운 그림자)의 조합이다.

#### Web Audio API 연동 (... 인 척)

원래 Web Audio API로 실제 마이크 입력을 받아서 구체가 반응하도록 만들었다.

```typescript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
const analyser = ctx.createAnalyser()
analyser.fftSize = 256
// 8개 주파수 밴드로 분리 → border-radius 변형
```

8개 주파수 밴드를 `border-radius` 8개 값에 매핑해서 구체가 음성에 따라 출렁이는 blob morphing을 구현했다.

**근데 데모에서 마이크 권한 팝업이 뜨면 어색하잖아.**

결국 `getUserMedia` 호출을 제거하고 fake 애니메이션만 남겼다. sin/cos 조합으로 자연스럽게 출렁이는 척.

```typescript
const startAudio = useCallback(() => {
  const tick = () => {
    const t = Date.now() / 1000
    const fakeVol = 0.25 + Math.sin(t * 2) * 0.15 + Math.random() * 0.1
    setVolume(fakeVol)
    setFreqBands(Array(8).fill(0).map((_, i) =>
      0.2 + Math.sin(t * 3 + i * 0.8) * 0.2 + Math.random() * 0.15
    ))
    rafRef.current = requestAnimationFrame(tick)
  }
  tick()
}, [])
```

> 해커톤 팁: "기술적으로 가능하다"를 보여주되, 데모에서는 friction을 최소화하자. 권한 요청 같은 건 실제 유저 테스트 때 붙이면 된다.

---

### 글래스모피즘 디자인 시스템

모든 버튼과 카드를 통일된 글래스모피즘 스타일로 교체했다.

**Glass Button (3-layer 구조):**

```
glass-btn-wrap (컨테이너)
├── glass-btn (backdrop-blur + 반투명 배경 + inset shadow)
│   └── glass-btn-text (콘텐츠)
└── glass-btn-shadow (하단 그림자)
```

**Glass Card:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

여기서 하나 배운 게 있다. 처음에 키워드/커뮤니티 카드에도 `glass-btn-wrap`을 썼더니 파트너가 바로 지적했다.

> "카드랑 버튼이 같은 radius면 안 되지. 위계가 구분이 안 돼."

맞는 말이다. **카드는 `rounded-3xl`**, **버튼은 `rounded-xl`**로 분리했다. 작은 차이인데 UI 위계가 확 살아났다.

---

### 헤더 통일성 점검

3개 메인 화면의 헤더를 비교해보니 다 달랐다:

| 화면 | 제목 크기 | 패딩 | 서브텍스트 |
|------|----------|------|----------|
| Home | `text-xl` | `px-5 pt-5 pb-2` | `text-[10px]` |
| Explore | `text-2xl` | `px-5 pt-6 pb-4` | `text-sm` |
| Reward | `text-2xl` | `px-5 pt-6 pb-4` | `text-sm` |

Home만 혼자 달랐다. 전부 `text-2xl`, `px-5 pt-6 pb-4`, `text-sm text-arctic/50 font-mono`로 통일.

---

### Bottom Nav 개선

하단 네비게이션도 문제가 많았다:

1. `sticky` → `fixed`로 변경 (스크롤해도 항상 하단 고정)
2. 아이콘 교체: Home→마이크, Explore→지구본, Reward→선물상자
3. 라벨 통일: "Explorer"→"Explore", "Home"→"Journal"
4. `max-w-[390px]`로 모바일 폭 제한 + 중앙 정렬
5. 모든 페이지에 `pb-20` 추가 (fixed nav 영역 확보)

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb flex justify-center">
  <div className="mx-3 mb-2 rounded-2xl glass-nav w-full max-w-[390px]">
```

---

### Reward 페이지 테마 통일

Reward 페이지가 가장 불일치가 심했다. 보라색 단색 카드, 터미널 스타일 트래픽 라이트, 흰색 버튼...

**전면 개편:**

| 항목 | Before | After |
|------|--------|-------|
| WLD 카드 배경 | `from-aurora-violet/80` 보라색 | 메인 그라데이션 `#ddd6f3→#faaca8` 반투명 |
| WLD 아이콘 | 흰색 원 2개 (가짜) | 공식 Worldcoin 로고 SVG |
| Claim 버튼 | `bg-white` plain | `glass-btn-wrap` 통일 |
| 숫자 폰트 | 기본 | Orbitron (`font-digital`) |
| Transaction 로그 | 터미널 스타일 ($, 트래픽 라이트) | 깔끔한 glass-card 리스트 |
| Progress bar | `bg-aurora-violet` 단색 | 메인 그라데이션 적용 |

그리고 **데이터를 static으로 고정**했다. 데모에서 빈 화면이 뜨면 최악이니까.

```typescript
const STATIC_REWARDS = {
  contributionPower: 37,  // LV.4
  totalCitations: 128,
  pendingWLD: 6.666666,
  contributions: [
    { botId: 'world-coin', nodeId: 'node-wc-001', createdAt: '2025-01-15T09:30:00Z' },
    { botId: 'seoul-guide', nodeId: 'node-sg-001', createdAt: '2025-01-22T14:20:00Z' },
    { botId: 'doctor', nodeId: 'node-dc-001', createdAt: '2025-02-01T11:45:00Z' },
  ],
}
```

---

### 기여 플로우 단순화

기존: 녹음 → 분석 → 커뮤니티 추천 → **페이지 이동** → 기여

이게 데모에서 너무 길었다. 클릭 3번에 끝나도록 줄였다.

변경: 녹음 → 분석 → Vault 선택 → **기여 완료** (페이지 이동 없음)

```
idle → recording → processing → complete → contributed
                                   ↓
                          Vault 복수 선택 가능
                          (Set<string> 토글)
                                   ↓
                         "N개 Vault에 기여되었습니다"
                         "+0.003 WLD earned"
```

"RECOMMENDED COMMUNITIES"도 "RECOMMENDED VAULT"로 변경. 프로젝트 컨셉에 맞게.

---

### 탐색 상세 페이지 개선

Explore Detail 페이지도 전면 개편:

- AuroraBackground 적용
- 헤더: `glass-dark` → 다른 페이지와 동일 스타일
- 검색바: `glass rounded-full` → `glass-card rounded-2xl` + 돋보기 아이콘
- 뒤로가기: `/` → `/explore`
- Stats: `font-digital` 적용
- Top Contributors: 텍스트 나열 → **영수증 스타일 가로 바 그래프**

Top Contributors는 영수증 컴포넌트와 비슷한 느낌으로 만들었다:

```tsx
{contributorData.map(([id, citations], index) => {
  const percentage = Math.round((citations / maxCitations) * 100)
  return (
    <div>
      <div className="flex items-center justify-between">
        <span>{index + 1}. {truncateHash(id)}</span>
        <span>{citations} citations</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full">
        <div style={{
          width: `${percentage}%`,
          background: index === 0
            ? 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)'
            : `rgba(102,126,234,${0.6 - index * 0.1})`,
        }} />
      </div>
    </div>
  )
})}
```

1등은 메인 그라데이션, 나머지는 점점 연해지는 바이올렛. 하단에 "총 인용 N회 | 기여도 기반 정렬" 푸터.

---

### 로그인 화면 개선

마지막으로 로그인 화면. 첫인상이 중요하니까.

- AuroraBackground 적용
- 로고: `aurora-cyan→violet` 그라데이션 → 메인 그라데이션 `#ddd6f3→#faaca8`, 크기 `w-20→w-24`
- 로그인 버튼: `btn-primary rounded-full` → `glass-btn-wrap rounded-2xl`
- Worldcoin 아이콘: 흰색 원 2개 → **공식 Worldcoin SVG 로고**
- StatCard 숫자: `font-digital` (Orbitron) 적용
- "봇" → "Vault" (컨셉 통일)

---

## Day 5 기술 정리

### 새로 만든 컴포넌트

| 컴포넌트 | 역할 |
|---------|------|
| `AuroraBackground.tsx` | 모든 페이지 공통 배경 (aurora 애니메이션 + floating orbs) |
| `VoiceOrb.tsx` | 3D 구체 음성 입력 UI (CSS gradient 레이어링 + blob morph) |

### 주요 변경 파일

| 파일 | 변경 |
|------|------|
| `JournalingHome.tsx` | VoiceOrb 통합, 기여 플로우 단순화 (5단계 state machine), Vault 복수 선택 |
| `BottomNav.tsx` | sticky→fixed, 아이콘/라벨 교체, max-width 제한 |
| `rewards/page.tsx` | 전면 테마 통일, static 데이터, Worldcoin 로고 |
| `explore/[botId]/page.tsx` | AuroraBackground, glass-card 통일, Top Contributors 바 그래프 |
| `page.tsx` | 로그인 화면 Aurora + glass-btn + Worldcoin 로고 |
| `DetailedContributionReceipt.tsx` | glass-card 스타일, 메인 그라데이션 progress bar |
| `tailwind.config.ts` | aurora 키프레임, font-digital 추가 |
| `layout.tsx` | Orbitron Google Font 추가 |

### 디자인 시스템 (최종)

| 요소 | 스타일 |
|------|--------|
| 메인 카드 | `glass-card rounded-3xl` |
| 서브 카드 | `glass-card rounded-2xl` |
| 버튼 | `glass-btn-wrap rounded-xl` (3-layer) |
| 메인 그라데이션 | `linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)` |
| 숫자 폰트 | Orbitron (`font-digital`) |
| 라벨 폰트 | Geist Mono (`font-mono`) |
| 헤더 | `text-2xl font-bold text-arctic tracking-tight` + `text-sm text-arctic/50 font-mono` |
| 페이지 패딩 | `px-5 pt-6 pb-4` (헤더) / `pb-20` (nav 영역) |

### 색상 팔레트 (최종 업데이트)

| 용도 | 색상 | 적용 |
|------|------|------|
| 메인 액센트 | `#ddd6f3 → #faaca8` | 구체, progress bar, 1등 기여자, 로고 |
| 보조 액센트 | `rgba(102,126,234)` | 2등 이하 bar, 서브 강조 |
| 네온 포인트 | `#00F2FF` (aurora-cyan) | 활성 탭, 수치 강조, 선택 링 |
| 텍스트 | `#E0E7FF` (arctic) | 메인 텍스트 |
| 서브 텍스트 | `arctic/50` | 라벨, 설명 |

---

## Day 5 회고

### 잘한 것
- **UI 일관성에 투자한 시간**: 하나하나 맞추니까 "진짜 앱" 느낌이 났다. 심사위원한테 첫인상이 중요하다.
- **Static 데이터 전략**: 빈 화면 리스크 제거. 데모에서 항상 보기 좋은 상태 유지.
- **기여 플로우 단순화**: 페이지 이동 제거로 데모 시간 절약. 3탭이면 끝.
- **MCP 활용**: 21st.dev magic MCP로 레퍼런스 컴포넌트 빠르게 참조, nano-banana MCP로 프로필 이미지 생성.

### 아쉬운 것
- **프로필 이미지 3개 미완**: OpenRouter 크레딧 한도로 7개 중 4개만 생성. 나머지는 이모지 fallback.
- **World ID 실제 연동 못함**: UI 데모에 시간을 다 써버렸다. Mock 인증으로 대체.

### 배운 것
- **CSS로 3D는 생각보다 된다**: radial-gradient 5개 겹치면 구체가 나온다.
- **디자인 토큰 통일이 개발 속도를 높인다**: 한번 정해놓으면 고민 없이 적용 가능.
- **해커톤 UI는 "느낌"이 90%다**: 기능이 10개보다 잘 만든 화면 3개가 낫다.

---

## 최종 앱 구조

```
Seed Vault MVP
├── 로그인 (AuroraBackground + Worldcoin 로고 + glass-btn)
├── Journal (3D VoiceOrb + blob morph + 5단계 flow)
│   ├── idle → TAP TO START
│   ├── recording → fake audio visualization
│   ├── processing → 구체 회전
│   ├── complete → 키워드 추출 + Vault 복수 선택
│   └── contributed → 기여 완료 + WLD earned
├── Explore (3D 캐러셀 + 프로필 이미지)
│   └── Detail (Knowledge Graph + 검색 + 기여 영수증 + Top Contributors 바 그래프)
└── Reward (Power Level + WLD counter + Transaction log)
```

---

*Day 5 완료. 해커톤 제출 준비 끝.*
