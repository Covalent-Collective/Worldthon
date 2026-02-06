# GraphRAG 시각화 애니메이션 설계서

## 개요

이 문서는 Seed Vault의 지식 그래프에서 GraphRAG(Graph-based Retrieval-Augmented Generation) 시스템의 동작을 시각적으로 표현하기 위한 5가지 핵심 애니메이션을 정의합니다.

### 현재 구현 분석

**파일**: `/src/components/KnowledgeGraph.tsx`

현재 구현된 기능:
- `react-force-graph-2d` 기반 노드/엣지 렌더링
- 4단계 `animationPhase` 상태를 통한 인용 애니메이션
- 노드별 gradient 색상 (GRADIENT_SETS 6종)
- hover 및 highlight 상태 처리
- Citation badge 및 +1 플로팅 효과

---

## 1. Query Flow Animation (쿼리 탐색 애니메이션)

### 목적
사용자 질문이 입력되면 그래프가 "탐색"하는 것처럼 보이는 애니메이션으로, GraphRAG의 검색 과정을 시각화합니다.

### 애니메이션 시퀀스

```
Phase 0 (0ms): 질문 입력 감지
    |
Phase 1 (0-300ms): 중앙 펄스 발생
    - 그래프 중앙에서 원형 웨이브 시작
    - 색상: rgba(0, 242, 255, 0.4) → 투명
    |
Phase 2 (300-800ms): 탐색 웨이브 확산
    - 펄스가 노드들을 통과하며 확산
    - 노드 통과 시 순간적으로 밝아짐
    |
Phase 3 (800-1200ms): 관련 노드 활성화
    - 관련성 높은 노드들이 순차적으로 "점화"
    - 엣지를 따라 에너지 흐름 애니메이션
    |
Phase 4 (1200-1800ms): 수렴
    - 선택된 노드들로 에너지 집중
    - 비선택 노드 dimming
```

### Canvas 구현

```typescript
interface QueryFlowState {
  phase: 'idle' | 'pulse' | 'explore' | 'activate' | 'converge'
  waveRadius: number
  waveOpacity: number
  activatedNodes: string[]
  explorationPath: string[][]  // BFS 탐색 레벨별 노드
}

// 중앙 펄스 렌더링
const renderQueryPulse = (ctx: CanvasRenderingContext2D, state: QueryFlowState) => {
  if (state.phase === 'idle') return

  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2

  // 다중 링 웨이브
  for (let i = 0; i < 3; i++) {
    const ringRadius = state.waveRadius - (i * 40)
    if (ringRadius < 0) continue

    const alpha = Math.max(0, state.waveOpacity - (i * 0.15))

    ctx.beginPath()
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0, 242, 255, ${alpha})`
    ctx.lineWidth = 3 - i
    ctx.stroke()
  }
}

// 엣지 에너지 흐름
const renderEdgeFlow = (
  ctx: CanvasRenderingContext2D,
  source: GraphNode,
  target: GraphNode,
  progress: number  // 0-1
) => {
  const sx = source.x!, sy = source.y!
  const tx = target.x!, ty = target.y!

  // 에너지 입자 위치 계산 (cubic easing)
  const t = easeOutCubic(progress)
  const px = sx + (tx - sx) * t
  const py = sy + (ty - sy) * t

  // 입자 렌더링
  const particleGrad = ctx.createRadialGradient(px, py, 0, px, py, 8)
  particleGrad.addColorStop(0, 'rgba(0, 242, 255, 0.9)')
  particleGrad.addColorStop(0.5, 'rgba(102, 126, 234, 0.5)')
  particleGrad.addColorStop(1, 'rgba(102, 126, 234, 0)')

  ctx.beginPath()
  ctx.arc(px, py, 6, 0, Math.PI * 2)
  ctx.fillStyle = particleGrad
  ctx.fill()

  // 꼬리 효과
  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.lineTo(px - (tx - sx) * 0.15, py - (ty - sy) * 0.15)
  ctx.strokeStyle = 'rgba(0, 242, 255, 0.4)'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.stroke()
}
```

### 타이밍 및 이징

| Phase | Duration | Easing |
|-------|----------|--------|
| pulse | 300ms | `ease-out-cubic` |
| explore | 500ms | `ease-in-out-sine` |
| activate | 400ms | `ease-out-back` |
| converge | 600ms | `ease-in-out-cubic` |

```typescript
// 이징 함수
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const easeOutBack = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
```

---

## 2. Node Relevance Heatmap (노드 관련도 히트맵)

### 목적
질문과의 관련도에 따라 노드의 색상과 크기가 동적으로 변화하여 "뜨거운" 노드와 "차가운" 노드를 직관적으로 구분합니다.

### 관련도 시각화 스펙

```
관련도 0.0 (차가움) → 관련도 1.0 (뜨거움)

크기:   5px → 12px
색상:   #6B7280 (gray) → #F97316 (orange) → #EF4444 (red)
glow:   없음 → 20px 반경 → 40px 반경
투명도: 0.4 → 1.0
```

### 구현

```typescript
interface NodeRelevance {
  nodeId: string
  score: number      // 0-1
  rank: number       // 전체 순위
  contributing: boolean  // 답변에 기여 여부
}

const getRelevanceColor = (score: number): string => {
  // 색상 보간 (gray → orange → red)
  if (score < 0.3) {
    // Gray zone
    const t = score / 0.3
    return lerpColor('#4B5563', '#9CA3AF', t)
  } else if (score < 0.7) {
    // Orange zone
    const t = (score - 0.3) / 0.4
    return lerpColor('#F59E0B', '#F97316', t)
  } else {
    // Red hot zone
    const t = (score - 0.7) / 0.3
    return lerpColor('#F97316', '#EF4444', t)
  }
}

const getRelevanceRadius = (score: number, baseRadius: number): number => {
  // 비선형 스케일링 (낮은 점수는 최소 유지, 높은 점수는 급격히 증가)
  const scaledScore = Math.pow(score, 0.7)
  return baseRadius + scaledScore * 7
}

// Canvas 노드 렌더링
const renderHeatmapNode = (
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  relevance: NodeRelevance
) => {
  const x = node.x!, y = node.y!
  const score = relevance.score

  const radius = getRelevanceRadius(score, 5)
  const color = getRelevanceColor(score)

  // 히트 글로우 (고관련도만)
  if (score > 0.5) {
    const glowRadius = radius + score * 30
    const glow = ctx.createRadialGradient(x, y, radius, x, y, glowRadius)
    glow.addColorStop(0, withAlpha(color, 0.6))
    glow.addColorStop(0.5, withAlpha(color, 0.2))
    glow.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()
  }

  // 열파동 링 (최상위 노드만)
  if (score > 0.8) {
    const pulseRadius = radius + 8 + Math.sin(Date.now() / 200) * 4
    ctx.beginPath()
    ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
    ctx.strokeStyle = withAlpha(color, 0.3 + Math.sin(Date.now() / 300) * 0.1)
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // 메인 노드
  const gradient = ctx.createRadialGradient(
    x - radius/4, y - radius/4, 0,
    x, y, radius * 1.2
  )
  gradient.addColorStop(0, lighten(color, 20))
  gradient.addColorStop(1, color)

  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  // 내부 하이라이트
  ctx.beginPath()
  ctx.arc(x - radius/3, y - radius/3, radius/3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fill()

  // 관련도 라벨 (상위 5개 노드만)
  if (relevance.rank <= 5) {
    ctx.font = 'bold 9px "Pretendard", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    ctx.fillText(`#${relevance.rank}`, x, y + radius + 18)
  }
}
```

### CSS 보조 스타일

```css
/* globals.css에 추가 */
@layer utilities {
  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: rgba(224, 231, 255, 0.6);
  }

  .heatmap-gradient-bar {
    width: 80px;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(
      90deg,
      #4B5563 0%,
      #F59E0B 50%,
      #EF4444 100%
    );
  }
}
```

---

## 3. Citation Pulse Effect (인용 파동 효과)

### 목적
노드가 답변에서 인용될 때 파동이 퍼지는 효과로, 지식이 "활성화"되는 순간을 극적으로 표현합니다.

### 애니메이션 시퀀스

```
Trigger: 노드 인용 이벤트

Phase 1 (0-150ms): 임팩트
    - 노드가 1.3x 확대 후 원래 크기로
    - 밝은 플래시 효과
    |
Phase 2 (150-600ms): 파동 확산
    - 3개의 동심원이 순차적으로 확산
    - 각 링은 점점 투명해짐
    |
Phase 3 (600-1200ms): 여파
    - 인접 노드들에 미세한 "떨림" 전파
    - 연결된 엣지 밝아짐
    |
Phase 4 (1200-2000ms): 안정화
    - 인용 카운트 배지 업데이트
    - "+1" 플로팅 텍스트 상승
```

### 구현 (현재 구현 확장)

```typescript
interface CitationPulseState {
  nodeId: string
  startTime: number
  phase: 'impact' | 'ripple' | 'aftermath' | 'settle'
  ripples: Array<{
    radius: number
    opacity: number
    startDelay: number
  }>
}

const CITATION_PULSE_DURATION = 2000
const RIPPLE_COUNT = 3
const RIPPLE_MAX_RADIUS = 80
const RIPPLE_DELAY_BETWEEN = 100

const renderCitationPulse = (
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  elapsed: number  // ms since trigger
) => {
  const x = node.x!, y = node.y!
  const baseRadius = 5

  // Phase 1: Impact (0-150ms)
  if (elapsed < 150) {
    const t = elapsed / 150
    const scaleT = easeOutBack(t)
    const scale = 1 + 0.3 * (1 - scaleT)
    const flashOpacity = 1 - easeOutCubic(t)

    // 확대된 노드
    const impactRadius = baseRadius * scale
    ctx.beginPath()
    ctx.arc(x, y, impactRadius, 0, Math.PI * 2)
    ctx.fillStyle = '#22c55e'
    ctx.fill()

    // 플래시
    const flashGrad = ctx.createRadialGradient(x, y, 0, x, y, impactRadius + 20)
    flashGrad.addColorStop(0, `rgba(134, 239, 172, ${flashOpacity * 0.8})`)
    flashGrad.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(x, y, impactRadius + 20, 0, Math.PI * 2)
    ctx.fillStyle = flashGrad
    ctx.fill()

    return
  }

  // Phase 2: Ripples (150-600ms)
  if (elapsed < 600) {
    const rippleElapsed = elapsed - 150

    for (let i = 0; i < RIPPLE_COUNT; i++) {
      const rippleStart = i * RIPPLE_DELAY_BETWEEN
      const rippleProgress = (rippleElapsed - rippleStart) / 450

      if (rippleProgress < 0 || rippleProgress > 1) continue

      const t = easeOutCubic(rippleProgress)
      const radius = baseRadius + t * RIPPLE_MAX_RADIUS
      const opacity = 0.5 * (1 - t)
      const lineWidth = 3 * (1 - t * 0.7)

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(74, 222, 128, ${opacity})`
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }
  }

  // Phase 3: Aftermath - 인접 노드 떨림 (600-1200ms)
  // 별도 함수에서 인접 노드들에 적용

  // Phase 4: +1 플로팅 (600-2000ms)
  if (elapsed >= 600 && elapsed < 2000) {
    const floatProgress = (elapsed - 600) / 1400
    const floatY = y - baseRadius - 20 - floatProgress * 30
    const floatOpacity = 1 - easeInCubic(floatProgress)

    ctx.font = 'bold 16px "Pretendard", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillStyle = `rgba(74, 222, 128, ${floatOpacity})`
    ctx.fillText('+1', x, floatY)
  }
}

// 인접 노드 떨림 효과
const renderAftershock = (
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  intensity: number  // 0-1, 거리에 반비례
) => {
  const x = node.x! + Math.sin(Date.now() / 50) * intensity * 3
  const y = node.y! + Math.cos(Date.now() / 50) * intensity * 3

  // 일시적 하이라이트
  const glowOpacity = intensity * 0.3
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 15)
  glow.addColorStop(0, `rgba(74, 222, 128, ${glowOpacity})`)
  glow.addColorStop(1, 'transparent')

  ctx.beginPath()
  ctx.arc(x, y, 15, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.fill()
}
```

### 연결된 엣지 하이라이트

```typescript
const renderActiveEdge = (
  ctx: CanvasRenderingContext2D,
  source: GraphNode,
  target: GraphNode,
  activeProgress: number  // 0-1
) => {
  const sx = source.x!, sy = source.y!
  const tx = target.x!, ty = target.y!

  // 곡선 제어점
  const mx = (sx + tx) / 2
  const my = (sy + ty) / 2
  const dx = tx - sx, dy = ty - sy
  const cx = mx - dy * 0.2
  const cy = my + dx * 0.2

  // 기본 라인
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.quadraticCurveTo(cx, cy, tx, ty)
  ctx.strokeStyle = `rgba(74, 222, 128, ${0.3 + activeProgress * 0.4})`
  ctx.lineWidth = 1.5 + activeProgress * 1.5
  ctx.stroke()

  // 에너지 흐름 입자들
  const particleCount = 3
  for (let i = 0; i < particleCount; i++) {
    const particleT = (activeProgress + i / particleCount) % 1
    const pt = easeInOutSine(particleT)

    // 베지어 곡선 위의 점 계산
    const px = Math.pow(1-pt, 2) * sx + 2 * (1-pt) * pt * cx + Math.pow(pt, 2) * tx
    const py = Math.pow(1-pt, 2) * sy + 2 * (1-pt) * pt * cy + Math.pow(pt, 2) * ty

    ctx.beginPath()
    ctx.arc(px, py, 3, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(134, 239, 172, ${0.8 - Math.abs(pt - 0.5)})`
    ctx.fill()
  }
}
```

---

## 4. Contribution Trail (기여 경로 시각화)

### 목적
답변 생성에 사용된 노드들을 순서대로 연결하여, 지식이 어떻게 조합되었는지를 보여줍니다.

### 시각화 컨셉

```
[ 시작 ]
    │
    ▼ (1)
  [Node A] ─────┐
    │           │
    ▼ (2)       │ (연관)
  [Node B] ◄────┘
    │
    ▼ (3)
  [Node C]
    │
    ▼
[ 답변 ]

범례:
  (숫자) = 기여 순서
  실선 화살표 = 주요 정보 흐름
  점선 = 보조 연관관계
```

### 구현

```typescript
interface ContributionNode {
  nodeId: string
  order: number          // 기여 순서 (1-based)
  weight: number         // 기여도 (0-1)
  type: 'primary' | 'supporting'
  excerptStart?: number  // 답변에서의 시작 위치
}

interface ContributionTrail {
  nodes: ContributionNode[]
  connections: Array<{
    from: string
    to: string
    type: 'sequential' | 'reference' | 'synthesis'
  }>
}

const TRAIL_COLORS = {
  primary: '#00F2FF',      // aurora-cyan
  supporting: '#667EEA',   // aurora-violet
  sequential: '#A78BFA',   // purple
  reference: '#F472B6',    // pink
  synthesis: '#34D399'     // green
}

// 기여 순서 배지 렌더링
const renderContributionBadge = (
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  contribution: ContributionNode
) => {
  const x = node.x!, y = node.y!
  const radius = 5 + contribution.weight * 5

  // 순서 배지 (노드 좌상단)
  const badgeX = x - radius - 4
  const badgeY = y - radius - 4
  const badgeRadius = 10

  // 배지 배경
  const isPrimary = contribution.type === 'primary'
  ctx.beginPath()
  ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2)
  ctx.fillStyle = isPrimary ? TRAIL_COLORS.primary : TRAIL_COLORS.supporting
  ctx.fill()

  // 순서 번호
  ctx.font = 'bold 10px "Pretendard", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#0a0a0f'
  ctx.fillText(contribution.order.toString(), badgeX, badgeY)

  // 기여도 링 (weight 기반)
  const weightRingRadius = radius + 4
  ctx.beginPath()
  ctx.arc(x, y, weightRingRadius, 0, Math.PI * 2 * contribution.weight)
  ctx.strokeStyle = isPrimary ? TRAIL_COLORS.primary : TRAIL_COLORS.supporting
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.stroke()
}

// 기여 연결선 렌더링
const renderContributionConnection = (
  ctx: CanvasRenderingContext2D,
  fromNode: GraphNode,
  toNode: GraphNode,
  connectionType: 'sequential' | 'reference' | 'synthesis',
  animationProgress: number  // 0-1, 연결이 그려지는 애니메이션
) => {
  const fx = fromNode.x!, fy = fromNode.y!
  const tx = toNode.x!, ty = toNode.y!

  const color = TRAIL_COLORS[connectionType]
  const isDashed = connectionType === 'reference'

  // 애니메이션된 경로 길이
  const totalLength = Math.sqrt(Math.pow(tx - fx, 2) + Math.pow(ty - fy, 2))
  const currentLength = totalLength * easeOutCubic(animationProgress)

  // 방향 벡터
  const dx = (tx - fx) / totalLength
  const dy = (ty - fy) / totalLength

  const endX = fx + dx * currentLength
  const endY = fy + dy * currentLength

  ctx.beginPath()
  ctx.moveTo(fx, fy)
  ctx.lineTo(endX, endY)

  if (isDashed) {
    ctx.setLineDash([5, 5])
  }

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.setLineDash([])

  // 화살표 (완료 시)
  if (animationProgress > 0.9) {
    const arrowSize = 8
    const angle = Math.atan2(ty - fy, tx - fx)

    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - Math.PI/6),
      endY - arrowSize * Math.sin(angle - Math.PI/6)
    )
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle + Math.PI/6),
      endY - arrowSize * Math.sin(angle + Math.PI/6)
    )
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  // 흐름 입자 (sequential만)
  if (connectionType === 'sequential' && animationProgress === 1) {
    const particleT = (Date.now() % 2000) / 2000
    const px = fx + (tx - fx) * particleT
    const py = fy + (ty - fy) * particleT

    ctx.beginPath()
    ctx.arc(px, py, 4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0, 242, 255, ${0.8})`
    ctx.fill()
  }
}

// 전체 트레일 애니메이션 오케스트레이션
const animateContributionTrail = (
  trail: ContributionTrail,
  startTime: number,
  currentTime: number
) => {
  const elapsed = currentTime - startTime
  const nodeDelay = 300  // 각 노드 간 딜레이
  const connectionDuration = 400  // 연결 애니메이션 시간

  const animationStates: Array<{
    type: 'node' | 'connection'
    id: string
    progress: number
  }> = []

  // 노드 애니메이션 상태
  trail.nodes.forEach((node, index) => {
    const nodeStart = index * nodeDelay
    const progress = Math.min(1, Math.max(0, (elapsed - nodeStart) / 200))
    animationStates.push({
      type: 'node',
      id: node.nodeId,
      progress: easeOutBack(progress)
    })
  })

  // 연결 애니메이션 상태
  trail.connections.forEach((conn, index) => {
    const connStart = (index + 1) * nodeDelay + 100
    const progress = Math.min(1, Math.max(0, (elapsed - connStart) / connectionDuration))
    animationStates.push({
      type: 'connection',
      id: `${conn.from}-${conn.to}`,
      progress
    })
  })

  return animationStates
}
```

---

## 5. Real-time Stats Overlay (실시간 통계 오버레이)

### 목적
그래프 위에 떠있는 HUD 형태로 GraphRAG 동작의 실시간 메트릭을 표시합니다.

### 오버레이 구성요소

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  [📊 Graph Stats]          [🔍 Query Analytics] │
│  ├─ Nodes: 24              ├─ Latency: 145ms   │
│  ├─ Edges: 38              ├─ Nodes hit: 8     │
│  └─ Active: 6              └─ Depth: 3         │
│                                                  │
│                    [GRAPH]                       │
│                                                  │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ Top Contributors                        │    │
│  │ ■■■■■■■■░░ Node A (78%)                │    │
│  │ ■■■■■░░░░░ Node B (52%)                │    │
│  │ ■■■░░░░░░░ Node C (31%)                │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  Query: "React hooks의 장단점은?"    [Live] ●   │
└──────────────────────────────────────────────────┘
```

### React 컴포넌트 구현

```typescript
interface GraphStats {
  totalNodes: number
  totalEdges: number
  activeNodes: number
  avgCitations: number
}

interface QueryAnalytics {
  latency: number
  nodesSearched: number
  nodesUsed: number
  traversalDepth: number
  similarityThreshold: number
}

interface TopContributor {
  nodeId: string
  nodeName: string
  contribution: number  // 0-100
  citationCount: number
}

interface StatsOverlayProps {
  stats: GraphStats
  analytics: QueryAnalytics | null
  contributors: TopContributor[]
  currentQuery: string | null
  isProcessing: boolean
}

export function GraphStatsOverlay({
  stats,
  analytics,
  contributors,
  currentQuery,
  isProcessing
}: StatsOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* 상단 통계 바 */}
      <div className="flex justify-between items-start">
        {/* 그래프 통계 */}
        <div className="glass-dark rounded-xl px-4 py-3 pointer-events-auto">
          <div className="flex items-center gap-2 text-xs text-arctic/60 mb-2">
            <svg className="w-3.5 h-3.5" /* chart icon */ />
            <span>Graph Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <StatItem label="Nodes" value={stats.totalNodes} />
            <StatItem label="Edges" value={stats.totalEdges} />
            <StatItem
              label="Active"
              value={stats.activeNodes}
              highlight={stats.activeNodes > 0}
            />
            <StatItem
              label="Avg Cite"
              value={stats.avgCitations.toFixed(1)}
            />
          </div>
        </div>

        {/* 쿼리 분석 */}
        {analytics && (
          <div className="glass-dark rounded-xl px-4 py-3 pointer-events-auto">
            <div className="flex items-center gap-2 text-xs text-arctic/60 mb-2">
              <svg className="w-3.5 h-3.5" /* search icon */ />
              <span>Query Analytics</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <StatItem
                label="Latency"
                value={`${analytics.latency}ms`}
                highlight={analytics.latency < 200}
              />
              <StatItem label="Searched" value={analytics.nodesSearched} />
              <StatItem label="Used" value={analytics.nodesUsed} />
              <StatItem label="Depth" value={analytics.traversalDepth} />
            </div>
          </div>
        )}
      </div>

      {/* 하단: 기여자 + 현재 쿼리 */}
      <div className="space-y-3">
        {/* Top Contributors */}
        {contributors.length > 0 && (
          <div className="glass-dark rounded-xl px-4 py-3 pointer-events-auto max-w-xs">
            <div className="text-xs text-arctic/60 mb-2">Top Contributors</div>
            <div className="space-y-2">
              {contributors.slice(0, 3).map((c, i) => (
                <ContributorBar
                  key={c.nodeId}
                  rank={i + 1}
                  name={c.nodeName}
                  contribution={c.contribution}
                  citations={c.citationCount}
                />
              ))}
            </div>
          </div>
        )}

        {/* 현재 쿼리 표시 */}
        {currentQuery && (
          <div className="glass-dark rounded-xl px-4 py-2 flex items-center gap-3 pointer-events-auto">
            <span className="text-sm text-arctic/70 truncate max-w-[300px]">
              "{currentQuery}"
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-arctic/50">
                {isProcessing ? 'Processing' : 'Complete'}
              </span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isProcessing
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500"
              )} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 개별 통계 항목
function StatItem({
  label,
  value,
  highlight = false
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-arctic/50">{label}</span>
      <span className={cn(
        "font-mono",
        highlight ? "text-aurora-cyan" : "text-arctic"
      )}>
        {value}
      </span>
    </div>
  )
}

// 기여자 바 차트
function ContributorBar({
  rank,
  name,
  contribution,
  citations
}: {
  rank: number
  name: string
  contribution: number
  citations: number
}) {
  const barColors = [
    'bg-gradient-to-r from-aurora-cyan to-aurora-violet',
    'bg-gradient-to-r from-violet-500 to-fuchsia-500',
    'bg-gradient-to-r from-fuchsia-500 to-pink-500'
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-arctic/40 w-4">#{rank}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-arctic/80 truncate max-w-[120px]">
            {name}
          </span>
          <span className="text-xs text-arctic/50">{contribution}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColors[rank - 1])}
            style={{ width: `${contribution}%` }}
          />
        </div>
      </div>
      {citations > 0 && (
        <span className="text-[10px] text-emerald-400/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">
          x{citations}
        </span>
      )}
    </div>
  )
}
```

### CSS 애니메이션

```css
/* globals.css에 추가 */

/* 통계 카운터 애니메이션 */
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-value-animate {
  animation: countUp 0.3s ease-out;
}

/* 기여도 바 애니메이션 */
@keyframes barGrow {
  from {
    width: 0;
  }
}

.contributor-bar {
  animation: barGrow 0.6s ease-out;
}

/* Live 인디케이터 펄스 */
@keyframes livePulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.live-indicator {
  animation: livePulse 1.5s ease-in-out infinite;
}

/* 슬라이드 인 */
@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-top {
  animation: slideInFromTop 0.4s ease-out;
}

.stats-bottom {
  animation: slideInFromBottom 0.4s ease-out 0.1s both;
}
```

---

## 통합 구현 가이드

### 상태 관리 구조

```typescript
// stores/graphAnimationStore.ts
import { create } from 'zustand'

interface GraphAnimationState {
  // Query Flow
  queryFlowPhase: 'idle' | 'pulse' | 'explore' | 'activate' | 'converge'
  queryFlowStartTime: number | null
  explorationPath: string[][]

  // Relevance Heatmap
  nodeRelevances: Map<string, number>
  isHeatmapActive: boolean

  // Citation Pulse
  activeCitations: Array<{
    nodeId: string
    startTime: number
  }>

  // Contribution Trail
  contributionTrail: ContributionTrail | null
  trailAnimationStart: number | null

  // Stats
  stats: GraphStats
  queryAnalytics: QueryAnalytics | null
  topContributors: TopContributor[]

  // Actions
  startQueryFlow: (query: string) => void
  updateRelevances: (relevances: Map<string, number>) => void
  triggerCitation: (nodeId: string) => void
  setContributionTrail: (trail: ContributionTrail) => void
  updateStats: (stats: Partial<GraphStats>) => void
}

export const useGraphAnimationStore = create<GraphAnimationState>((set, get) => ({
  // ... 초기 상태 및 액션 구현
}))
```

### KnowledgeGraph 컴포넌트 확장

```typescript
// 기존 KnowledgeGraph.tsx에 통합

export function KnowledgeGraph({
  bot,
  highlightedNodes = [],
  onNodeClick,
  recentlyCitedNodes = [],
  // 새로운 props
  showStats = true,
  enableQueryFlow = true,
  enableHeatmap = true,
  enableContributionTrail = true,
}: KnowledgeGraphProps) {
  // ... 기존 코드

  // 애니메이션 상태 가져오기
  const {
    queryFlowPhase,
    nodeRelevances,
    activeCitations,
    contributionTrail,
    stats,
    queryAnalytics,
    topContributors
  } = useGraphAnimationStore()

  // 애니메이션 루프
  useEffect(() => {
    let animationFrame: number

    const animate = () => {
      // 진행 중인 애니메이션들 업데이트
      setAnimationTick(Date.now())
      animationFrame = requestAnimationFrame(animate)
    }

    if (hasActiveAnimations) {
      animationFrame = requestAnimationFrame(animate)
    }

    return () => cancelAnimationFrame(animationFrame)
  }, [hasActiveAnimations])

  return (
    <div ref={containerRef} className="relative w-full rounded-3xl overflow-hidden">
      {/* 배경 */}
      {/* ... 기존 코드 */}

      {/* 그래프 */}
      <ForceGraph2D
        // ... 기존 props
        nodeCanvasObject={(node, ctx, globalScale) => {
          // 1. 기본 노드 렌더링
          // 2. Query Flow 효과 적용
          // 3. Heatmap 색상 적용
          // 4. Citation Pulse 적용
          // 5. Contribution Badge 적용
        }}
      />

      {/* Stats Overlay */}
      {showStats && (
        <GraphStatsOverlay
          stats={stats}
          analytics={queryAnalytics}
          contributors={topContributors}
          currentQuery={currentQuery}
          isProcessing={queryFlowPhase !== 'idle'}
        />
      )}
    </div>
  )
}
```

---

## 성능 최적화 권장사항

### 1. Canvas 렌더링 최적화

```typescript
// 오프스크린 캔버스 사용
const offscreenCanvas = new OffscreenCanvas(width, height)
const offscreenCtx = offscreenCanvas.getContext('2d')!

// 정적 요소 캐싱
const staticElementsCache = new Map<string, ImageBitmap>()

// requestAnimationFrame 스로틀링
const throttledAnimate = throttle(animate, 16) // ~60fps
```

### 2. 상태 업데이트 배칭

```typescript
// 여러 상태 업데이트를 하나로 묶기
const batchedUpdate = () => {
  set({
    nodeRelevances: newRelevances,
    topContributors: newContributors,
    stats: newStats
  })
}
```

### 3. 메모이제이션

```typescript
// 노드 렌더링 함수 메모이제이션
const memoizedNodeRenderer = useMemo(() => {
  return (node: GraphNode, ctx: CanvasRenderingContext2D) => {
    // ...
  }
}, [nodeRelevances, activeCitations])
```

---

## 참고 자료

- react-force-graph-2d: https://github.com/vasturiano/react-force-graph
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Easing Functions: https://easings.net/
- Zustand: https://github.com/pmndrs/zustand
