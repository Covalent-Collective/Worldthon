# Seed Vault Design System
## "The Digital Permafrost" (디지털 영구 동토층)

> 노르웨이 스발바르 시드볼트에서 영감을 받은 디자인 시스템
> 콘크리트, 얼음, 오로라의 조합

---

## 1. Color Palette (컬러 팔레트)

### Base Colors (기본 컬러)

| Name | HEX | RGB | 용도 |
|------|-----|-----|------|
| **Concrete Gray** | `#2C2E31` | `44, 46, 49` | 카드 배경, 노이즈 텍스처 |
| **Deep Black** | `#0A0A0F` | `10, 10, 15` | 그래프 배경, 최상위 배경 |
| **Permafrost Light** | `#12121A` | `18, 18, 26` | 중간 배경 |
| **Arctic White** | `#E0E7FF` | `224, 231, 255` | 텍스트, 서브 컬러 |

### Accent Colors (포인트 컬러)

| Name | HEX | 용도 |
|------|-----|------|
| **Aurora Cyan** | `#00F2FF` | 주요 CTA, 하이라이트, 글로우 |
| **Frost Blue** | `#4FACFE` | 보조 포인트, 링크 |
| **Aurora Violet** | `#667EEA` | 그라디언트 시작점 |
| **Aurora Purple** | `#764BA2` | 그라디언트 중간점 |
| **Aurora Pink** | `#F093FB` | 그라디언트 악센트 |

### Semantic Colors (시맨틱 컬러)

| Name | HEX | 용도 |
|------|-----|------|
| **Success Green** | `#22C55E` | 성공 상태, 활성 노드 |
| **Warning Amber** | `#F59E0B` | 경고 상태 |
| **Error Red** | `#EF4444` | 에러 상태 |

### Glow Colors (글로우 컬러)

```css
--glow-cyan: rgba(0, 242, 255, 0.3)
--glow-violet: rgba(139, 92, 246, 0.3)
--glow-green: rgba(34, 197, 94, 0.3)
```

### Gradients (그라디언트)

**Aurora Gradient**
```css
background: linear-gradient(135deg, #667EEA 0%, #764BA2 25%, #F093FB 50%, #00F2FF 75%, #667EEA 100%);
```

**Permafrost Gradient**
```css
background: linear-gradient(180deg, #0A0A0F 0%, #12121A 50%, #0A0A0F 100%);
```

**Card Gradient (Subtle)**
```css
background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
```

---

## 2. Typography (타이포그래피)

### Font Family

| 용도 | Font | Fallback |
|------|------|----------|
| **Primary** | Geist Sans | -apple-system, Pretendard, sans-serif |
| **Monospace** | Geist Mono | Menlo, Monaco, monospace |

### Font Sizes

| Name | Size | Line Height | 용도 |
|------|------|-------------|------|
| `xs` | 12px | 16px | 캡션, 라벨 |
| `sm` | 14px | 20px | 보조 텍스트 |
| `base` | 16px | 24px | 본문 |
| `lg` | 18px | 28px | 강조 텍스트 |
| `xl` | 20px | 28px | 소제목 |
| `2xl` | 24px | 32px | 제목 |
| `3xl` | 30px | 36px | 대제목 |
| `4xl` | 36px | 40px | 히어로 텍스트 |

### Font Weight

| Name | Weight | 용도 |
|------|--------|------|
| `normal` | 400 | 본문 |
| `medium` | 500 | 강조 |
| `semibold` | 600 | 버튼, 라벨 |
| `bold` | 700 | 제목 |

---

## 3. Spacing & Layout (간격 & 레이아웃)

### Base Unit
**4px** 기반 스페이싱 시스템

### Spacing Scale

| Name | Value | 용도 |
|------|-------|------|
| `1` | 4px | 최소 간격 |
| `2` | 8px | 아이콘-텍스트 간격 |
| `3` | 12px | 컴팩트 패딩 |
| `4` | 16px | 기본 패딩 |
| `5` | 20px | 카드 내부 패딩 |
| `6` | 24px | 섹션 내 간격 |
| `8` | 32px | 섹션 간 간격 |
| `10` | 40px | 큰 섹션 간격 |
| `12` | 48px | 페이지 섹션 |
| `16` | 64px | 주요 섹션 구분 |

### Border Radius

| Name | Value | 용도 |
|------|-------|------|
| `sm` | 4px | 작은 요소 |
| `md` | 8px | 버튼, 인풋 |
| `lg` | 12px | 카드 |
| `xl` | 16px | 모달 |
| `2xl` | 20px | 대형 카드 |
| `full` | 9999px | 원형, 필 |

### Screen Breakpoints

| Name | Value | 용도 |
|------|-------|------|
| `sm` | 640px | 소형 태블릿 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 작은 데스크탑 |
| `xl` | 1280px | 데스크탑 |

**Primary Target: 390px (iPhone 기준 모바일 퍼스트)**

---

## 4. Effects & Shadows (효과 & 그림자)

### Glassmorphism (글래스모피즘)

**Ice Sheet (기본 글래스)**
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

**Frost Glass (서리 글래스)**
```css
background: rgba(224, 231, 255, 0.1);
backdrop-filter: blur(16px) saturate(180%);
border: 1px solid rgba(224, 231, 255, 0.2);
```

**Dark Glass**
```css
background: rgba(10, 10, 15, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.05);
```

### Box Shadows

**Glow Cyan**
```css
box-shadow: 0 0 20px rgba(0, 242, 255, 0.3), 0 0 40px rgba(0, 242, 255, 0.1);
```

**Card Hover**
```css
box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 242, 255, 0.1);
```

**Monolith**
```css
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 242, 255, 0.15);
```

### Text Shadows

**Glow Text**
```css
text-shadow: 0 0 10px rgba(0, 242, 255, 0.5), 0 0 20px rgba(0, 242, 255, 0.3);
```

---

## 5. Animation (애니메이션)

### Timing Functions

| Name | Value | 용도 |
|------|-------|------|
| `smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | 기본 트랜지션 |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 바운스 효과 |
| `bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | 강한 바운스 |

### Duration

| Name | Value | 용도 |
|------|-------|------|
| `micro` | 150ms | 호버, 토글 |
| `standard` | 300ms | 기본 트랜지션 |
| `entrance` | 500ms | 요소 진입 |
| `complex` | 800ms | 복잡한 애니메이션 |

### Key Animations

**Fade In**
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

**Slide Up**
```css
@keyframes slideUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

**Scale In (Spring)**
```css
@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
```

**Pulse Glow**
```css
@keyframes pulseGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
```

**Aurora Shift (Background)**
```css
@keyframes auroraShift {
  0%, 100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
  50% { background-position: 100% 50%; filter: hue-rotate(30deg); }
}
```

**Float**
```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}
```

---

## 6. Components (컴포넌트)

### Buttons

**Primary (Aurora Cyan)**
```
Background: #00F2FF
Text: #0A0A0F
Border Radius: 12px
Padding: 12px 24px
Hover: Glow effect + scale(1.02)
```

**Secondary (Glass)**
```
Background: rgba(255, 255, 255, 0.1)
Border: 1px solid rgba(255, 255, 255, 0.2)
Text: #E0E7FF
Hover: Background rgba(255, 255, 255, 0.15)
```

**Ghost**
```
Background: transparent
Text: #E0E7FF
Hover: Background rgba(255, 255, 255, 0.05)
```

### Cards

**Monolith Card (3D 기울기)**
```
Transform: perspective(1000px) rotateY(-15deg)
Background: Concrete texture with gradient
Border: 1px solid rgba(255, 255, 255, 0.05)
Shadow: Monolith shadow
```

**Glass Card**
```
Background: Glass gradient
Backdrop-filter: blur(12px)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border Radius: 16px
```

**Seed Box Card (산업적)**
```
Background: #2C2E31 with subtle gradient
Top accent line: #00F2FF (hover시 표시)
Serial number: Monospace 10px uppercase
```

### Input Fields

```
Background: rgba(255, 255, 255, 0.05)
Border: 1px solid rgba(255, 255, 255, 0.1)
Focus Border: #00F2FF
Border Radius: 8px
Padding: 12px 16px
Placeholder: rgba(224, 231, 255, 0.4)
```

### Navigation

**Bottom Tab Bar**
```
Background: rgba(10, 10, 15, 0.9)
Backdrop-filter: blur(20px)
Height: 64px (Safe area 추가)
Active: #00F2FF with glow
Inactive: rgba(224, 231, 255, 0.5)
```

### Modals

```
Background: Glass dark
Border Radius: 24px (top)
Overlay: rgba(0, 0, 0, 0.6) with blur(4px)
Entry: Slide up + fade
```

---

## 7. Knowledge Graph (지식 그래프)

### Node Styles

**Bot Node (육각형)**
```
Shape: Hexagon
Size: 40-60px
Fill: Gradient (#667EEA → #764BA2)
Stroke: 2px #00F2FF
Glow: Pulse animation
```

**Knowledge Node (다이아몬드)**
```
Shape: Diamond (rotated square)
Size: 20-30px
Fill: rgba(0, 242, 255, 0.2)
Stroke: 1px #00F2FF
```

**Active/Highlighted**
```
Scale: 1.2x
Glow: Strong cyan glow
```

### Edge Styles

**Default**
```
Stroke: rgba(224, 231, 255, 0.2)
Width: 1px
```

**Active/Flow**
```
Stroke: #00F2FF
Width: 2px
Animation: Dashed flow
```

### Graph Background

```
Color: #0A0A0F
Vignette: Radial gradient (dark edges)
Ice Veil: Subtle frost overlay
```

---

## 8. Quick Reference (빠른 참조)

### CSS Variables

```css
:root {
  /* Base */
  --sv-concrete: #2C2E31;
  --sv-permafrost: #0A0A0F;
  --sv-arctic: #E0E7FF;

  /* Accent */
  --sv-aurora-cyan: #00F2FF;
  --sv-aurora-violet: #667EEA;
  --sv-aurora-purple: #764BA2;

  /* Glow RGB */
  --glow-cyan-rgb: 0, 242, 255;
  --glow-violet-rgb: 139, 92, 246;
  --glow-green-rgb: 34, 197, 94;
}
```

### Tailwind Classes

```
/* Colors */
bg-concrete, bg-permafrost, text-arctic
text-aurora-cyan, bg-aurora-violet

/* Glass */
glass, glass-dark, glass-card, glass-frost

/* Glow */
glow-cyan, glow-violet, glow-green
text-glow-cyan, border-glow-cyan

/* Texture */
bg-noise, bg-concrete-texture

/* Animation */
animate-fade-in, animate-slide-up
animate-pulse-glow, animate-float
animate-monolith-glow, animate-aurora-shift
```

---

## 9. Accessibility (접근성)

### Color Contrast

- 본문 텍스트: 최소 4.5:1 비율
- 대형 텍스트: 최소 3:1 비율
- Arctic White (#E0E7FF) on Deep Black (#0A0A0F): 15.8:1 ✓

### Focus States

```css
outline: 2px solid #00F2FF;
outline-offset: 2px;
```

### Motion

- `prefers-reduced-motion` 미디어 쿼리 지원
- 필수 애니메이션만 유지, 장식적 애니메이션 비활성화

---

## 10. Design Principles (디자인 원칙)

1. **Cold & Preserved** - 차갑고 보존된 느낌. 노이즈 텍스처로 콘크리트 질감 표현
2. **Depth Through Glass** - 글래스모피즘으로 깊이감 표현
3. **Aurora Highlights** - 시안/바이올렛 글로우로 생동감 부여
4. **Industrial Minimal** - 불필요한 장식 제거, 기능에 집중
5. **Progressive Enhancement** - 기본 기능 우선, 애니메이션은 보조적

---

*Last Updated: 2026-02-05*
*Version: 1.0*
