# Seed Vault Frontend Implementation Guide
## "The Digital Permafrost" (디지털 영구 동토층)

> 이 문서는 Seed Vault의 프론트엔드 디자인 시스템과 구현 가이드를 제공합니다.

---

## 목차

1. [디자인 시스템 개요](#1-디자인-시스템-개요)
2. [Tailwind 설정](#2-tailwind-설정)
3. [글로벌 스타일](#3-글로벌-스타일)
4. [컴포넌트 구현](#4-컴포넌트-구현)
5. [페이지별 구현 가이드](#5-페이지별-구현-가이드)
6. [애니메이션 시스템](#6-애니메이션-시스템)
7. [성능 최적화](#7-성능-최적화)

---

## 1. 디자인 시스템 개요

### 컨셉: "디지털 영구 동토층"

노르웨이 스발바르 시드볼트에서 영감을 받은 디자인. 콘크리트, 얼음, 오로라의 조합.

### 컬러 팔레트

```
Base Colors:
- Concrete Gray: #2C2E31 (노이즈 텍스처 포함)
- Deep Black: #0A0A0F (그래프 배경)
- Arctic White: #E0E7FF (텍스트, 서브 컬러)

Accent Colors:
- Aurora Cyan: #00F2FF (주요 포인트 컬러)
- Frost Blue: #4FACFE (보조 포인트)
- Permafrost Violet: #667EEA → #764BA2 (그라디언트)

Glow Colors:
- Cyan Glow: rgba(0, 242, 255, 0.3)
- Violet Glow: rgba(139, 92, 246, 0.3)
- Success Green: #22C55E
```

### 타이포그래피

```
Primary: Geist Sans (Variable)
Monospace: Geist Mono (Variable)
Fallback: -apple-system, sans-serif, Pretendard
```

### 모션 원칙

```
Standard Easing: cubic-bezier(0.4, 0, 0.2, 1)
Spring: cubic-bezier(0.34, 1.56, 0.64, 1)
Duration:
  - Micro: 150ms
  - Standard: 300ms
  - Entrance: 500ms
  - Complex: 800ms
```

---

## 2. Tailwind 설정

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ===================
      // Custom Colors
      // ===================
      colors: {
        // Base Colors
        concrete: {
          DEFAULT: '#2C2E31',
          50: '#F5F5F6',
          100: '#E8E9EA',
          200: '#D1D3D5',
          300: '#A4A8AC',
          400: '#6E7378',
          500: '#4A4E52',
          600: '#3A3D40',
          700: '#2C2E31',
          800: '#1E2022',
          900: '#141517',
        },
        permafrost: {
          DEFAULT: '#0A0A0F',
          light: '#12121A',
          dark: '#050508',
        },
        arctic: {
          DEFAULT: '#E0E7FF',
          50: '#FFFFFF',
          100: '#F5F7FF',
          200: '#E0E7FF',
          300: '#C7D2FE',
          400: '#A5B4FC',
        },
        aurora: {
          cyan: '#00F2FF',
          blue: '#4FACFE',
          violet: '#667EEA',
          purple: '#764BA2',
          pink: '#F093FB',
          red: '#F5576C',
        },
        // Existing shadcn colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },

      // ===================
      // Font Family
      // ===================
      fontFamily: {
        sans: ['var(--font-geist-sans)', '-apple-system', 'BlinkMacSystemFont', 'Pretendard', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Menlo', 'Monaco', 'monospace'],
      },

      // ===================
      // Border Radius
      // ===================
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ===================
      // Box Shadow (Glow Effects)
      // ===================
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 242, 255, 0.3), 0 0 40px rgba(0, 242, 255, 0.1)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 242, 255, 0.1)',
        'monolith': '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 242, 255, 0.15)',
      },

      // ===================
      // Backdrop Blur
      // ===================
      backdropBlur: {
        xs: '2px',
        glass: '12px',
      },

      // ===================
      // Animations
      // ===================
      animation: {
        // Standard animations
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-out': 'fadeOut 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'scale-out': 'scaleOut 0.3s ease-out forwards',

        // Monolith animations
        'monolith-enter': 'monolithEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'monolith-glow': 'monolithGlow 3s ease-in-out infinite',
        'line-draw': 'lineDraw 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',

        // Graph animations
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'node-spawn': 'nodeSpawn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'edge-flow': 'edgeFlow 2s linear infinite',

        // Success animations
        'confetti': 'confetti 3s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'check-draw': 'checkDraw 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',

        // Ambient animations
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'aurora-shift': 'auroraShift 8s ease-in-out infinite',

        // Parallax
        'parallax-slow': 'parallaxSlow 20s linear infinite',
        'parallax-fast': 'parallaxFast 15s linear infinite',
      },
      keyframes: {
        // Fade
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },

        // Slide
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        // Scale
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },

        // Monolith
        monolithEnter: {
          '0%': {
            opacity: '0',
            transform: 'perspective(1000px) rotateX(45deg) rotateY(-15deg) translateZ(-100px)'
          },
          '100%': {
            opacity: '1',
            transform: 'perspective(1000px) rotateX(0deg) rotateY(-15deg) translateZ(0)'
          },
        },
        monolithGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 242, 255, 0.2), 0 0 40px rgba(0, 242, 255, 0.1)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 242, 255, 0.4), 0 0 80px rgba(0, 242, 255, 0.2)'
          },
        },
        lineDraw: {
          '0%': { strokeDashoffset: '100%', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { strokeDashoffset: '0%', opacity: '1' },
        },

        // Graph
        pulseGlow: {
          '0%, 100%': {
            opacity: '0.5',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.1)',
          },
        },
        nodeSpawn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0)'
          },
          '50%': {
            transform: 'scale(1.2)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        edgeFlow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },

        // Success
        confetti: {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        checkDraw: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },

        // Ambient
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        auroraShift: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)',
          },
          '50%': {
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(30deg)',
          },
        },

        // Parallax
        parallaxSlow: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        parallaxFast: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-30%)' },
        },
      },

      // ===================
      // Transition
      // ===================
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 3. 글로벌 스타일

### globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===========================================
   CSS Custom Properties
   =========================================== */
@layer base {
  :root {
    /* Shadcn UI Variables */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;

    /* Seed Vault Custom Variables */
    --sv-concrete: 220 4% 18%;
    --sv-permafrost: 240 33% 4%;
    --sv-arctic: 226 100% 94%;
    --sv-aurora-cyan: 182 100% 50%;
    --sv-aurora-violet: 236 74% 66%;

    /* Glow Intensities */
    --glow-intensity: 1;
    --glow-cyan-rgb: 0, 242, 255;
    --glow-violet-rgb: 139, 92, 246;
    --glow-green-rgb: 34, 197, 94;
  }

  .dark {
    --background: 240 33% 4%;
    --foreground: 226 100% 94%;
    --card: 220 4% 18%;
    --card-foreground: 226 100% 94%;
    --popover: 220 4% 18%;
    --popover-foreground: 226 100% 94%;
    --primary: 226 100% 94%;
    --primary-foreground: 0 0% 9%;
    --secondary: 220 4% 25%;
    --secondary-foreground: 226 100% 94%;
    --muted: 220 4% 25%;
    --muted-foreground: 220 4% 60%;
    --accent: 220 4% 25%;
    --accent-foreground: 226 100% 94%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 220 4% 25%;
    --input: 220 4% 25%;
    --ring: 182 100% 50%;
  }
}

/* ===========================================
   Base Styles
   =========================================== */
@layer base {
  * {
    @apply border-border;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Selection Color */
  ::selection {
    background: rgba(0, 242, 255, 0.3);
    color: #fff;
  }
}

/* ===========================================
   Noise Texture Background
   =========================================== */
@layer utilities {
  .bg-noise {
    position: relative;
  }

  .bg-noise::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  .bg-concrete-texture {
    background-color: #2C2E31;
    background-image:
      radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(0,0,0,0.1) 0%, transparent 50%);
  }

  .bg-concrete-texture::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.05;
    pointer-events: none;
  }
}

/* ===========================================
   Glassmorphism Utilities
   =========================================== */
@layer utilities {
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-dark {
    background: rgba(10, 10, 15, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .glass-card {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .glass-frost {
    background: rgba(224, 231, 255, 0.1);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(224, 231, 255, 0.2);
  }
}

/* ===========================================
   Glow Effects
   =========================================== */
@layer utilities {
  .glow-cyan {
    box-shadow:
      0 0 20px rgba(var(--glow-cyan-rgb), 0.3),
      0 0 40px rgba(var(--glow-cyan-rgb), 0.1);
  }

  .glow-violet {
    box-shadow:
      0 0 20px rgba(var(--glow-violet-rgb), 0.3),
      0 0 40px rgba(var(--glow-violet-rgb), 0.1);
  }

  .glow-green {
    box-shadow:
      0 0 20px rgba(var(--glow-green-rgb), 0.3),
      0 0 40px rgba(var(--glow-green-rgb), 0.1);
  }

  .text-glow-cyan {
    text-shadow:
      0 0 10px rgba(var(--glow-cyan-rgb), 0.5),
      0 0 20px rgba(var(--glow-cyan-rgb), 0.3);
  }

  .border-glow-cyan {
    border-color: rgba(var(--glow-cyan-rgb), 0.5);
    box-shadow:
      0 0 10px rgba(var(--glow-cyan-rgb), 0.2),
      inset 0 0 10px rgba(var(--glow-cyan-rgb), 0.1);
  }
}

/* ===========================================
   Aurora Gradient Backgrounds
   =========================================== */
@layer utilities {
  .bg-aurora {
    background: linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #00f2ff 75%,
      #667eea 100%
    );
    background-size: 400% 400%;
    animation: auroraShift 8s ease-in-out infinite;
  }

  .bg-aurora-subtle {
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.1) 0%,
      rgba(118, 75, 162, 0.1) 50%,
      rgba(0, 242, 255, 0.1) 100%
    );
  }

  .bg-permafrost-gradient {
    background: linear-gradient(
      180deg,
      #0a0a0f 0%,
      #12121a 50%,
      #0a0a0f 100%
    );
  }
}

/* ===========================================
   Monolith Card Styles
   =========================================== */
@layer utilities {
  .monolith-transform {
    transform: perspective(1000px) rotateY(-15deg);
    transform-style: preserve-3d;
  }

  .monolith-tilt-45 {
    transform: perspective(1000px) rotateX(5deg) rotateY(-15deg) rotateZ(-2deg);
    transform-style: preserve-3d;
  }
}

/* ===========================================
   Seed Box Card Styles (Industrial)
   =========================================== */
@layer utilities {
  .seed-box {
    position: relative;
    background: linear-gradient(145deg, #2C2E31 0%, #1E2022 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .seed-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #00F2FF, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .seed-box:hover::before {
    opacity: 1;
  }

  .serial-number {
    font-family: var(--font-geist-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(224, 231, 255, 0.4);
  }
}

/* ===========================================
   Ice Veil Effect (Knowledge Graph)
   =========================================== */
@layer utilities {
  .ice-veil {
    position: relative;
  }

  .ice-veil::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 30%,
      rgba(224, 231, 255, 0.05) 70%,
      rgba(224, 231, 255, 0.1) 100%
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .ice-veil.active::after {
    opacity: 1;
  }
}

/* ===========================================
   Hexagon Node Shape
   =========================================== */
@layer utilities {
  .hexagon {
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
}

/* ===========================================
   Line Animation (Auth Success)
   =========================================== */
@layer utilities {
  .line-animation {
    stroke-dasharray: 100%;
    stroke-dashoffset: 100%;
    animation: lineDraw 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes lineDraw {
    to {
      stroke-dashoffset: 0%;
    }
  }
}

/* ===========================================
   Scrollbar Styling
   =========================================== */
@layer base {
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 242, 255, 0.3);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 242, 255, 0.5);
  }
}

/* ===========================================
   Text Utilities
   =========================================== */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .text-gradient-aurora {
    background: linear-gradient(135deg, #00F2FF 0%, #667EEA 50%, #764BA2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .text-gradient-frost {
    background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* ===========================================
   Button Hover Effects
   =========================================== */
@layer utilities {
  .btn-glow-hover {
    position: relative;
    overflow: hidden;
  }

  .btn-glow-hover::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(90deg, transparent, rgba(0, 242, 255, 0.4), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .btn-glow-hover:hover::before {
    opacity: 1;
    animation: shimmer 1.5s linear infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
}

/* ===========================================
   Card Hover Effects
   =========================================== */
@layer utilities {
  .card-lift {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-lift:hover {
    transform: translateY(-4px);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.15),
      0 0 30px rgba(0, 242, 255, 0.1);
  }
}

/* ===========================================
   Reduce Motion
   =========================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. 컴포넌트 구현

### 4.1 GlassCard 컴포넌트

```typescript
// src/components/ui/GlassCard.tsx
'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'frost'
  hover?: boolean
  glow?: 'none' | 'cyan' | 'violet' | 'green'
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = true, glow = 'none', children, ...props }, ref) => {
    const variants = {
      default: 'glass-card',
      dark: 'glass-dark',
      frost: 'glass-frost',
    }

    const glowStyles = {
      none: '',
      cyan: 'glow-cyan',
      violet: 'glow-violet',
      green: 'glow-green',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6',
          variants[variant],
          glowStyles[glow],
          hover && 'card-lift',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
```

### 4.2 MonolithCard 컴포넌트

```typescript
// src/components/ui/MonolithCard.tsx
'use client'

import { useState, useEffect, forwardRef, HTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MonolithCardProps extends HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  onAuthSuccess?: () => void
}

export const MonolithCard = forwardRef<HTMLDivElement, MonolithCardProps>(
  ({ className, isActive = false, onAuthSuccess, children, ...props }, ref) => {
    const [showLines, setShowLines] = useState(false)
    const [authComplete, setAuthComplete] = useState(false)

    useEffect(() => {
      if (isActive) {
        setShowLines(true)
        const timer = setTimeout(() => {
          setAuthComplete(true)
          onAuthSuccess?.()
        }, 2000)
        return () => clearTimeout(timer)
      }
    }, [isActive, onAuthSuccess])

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, rotateX: 45, rotateY: -15, z: -100 }}
        animate={{ opacity: 1, rotateX: 0, rotateY: -15, z: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'relative w-[280px] h-[400px] monolith-transform',
          'bg-gradient-to-b from-concrete-700 to-concrete-900',
          'rounded-lg overflow-hidden',
          isActive && 'animate-monolith-glow',
          className
        )}
        style={{ transformStyle: 'preserve-3d' }}
        {...props}
      >
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-noise opacity-30" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
          {children}
        </div>

        {/* Cyan line animation on auth */}
        <AnimatePresence>
          {showLines && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 280 400"
            >
              {/* Top horizontal line */}
              <motion.line
                x1="0" y1="20" x2="280" y2="20"
                stroke="#00F2FF"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0 }}
              />

              {/* Left vertical line */}
              <motion.line
                x1="20" y1="0" x2="20" y2="400"
                stroke="#00F2FF"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              />

              {/* Bottom horizontal line */}
              <motion.line
                x1="280" y1="380" x2="0" y2="380"
                stroke="#00F2FF"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              {/* Right vertical line */}
              <motion.line
                x1="260" y1="400" x2="260" y2="0"
                stroke="#00F2FF"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
              />

              {/* Corner accents */}
              <motion.path
                d="M 0 40 L 0 0 L 40 0"
                fill="none"
                stroke="#00F2FF"
                strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              />
              <motion.path
                d="M 240 0 L 280 0 L 280 40"
                fill="none"
                stroke="#00F2FF"
                strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              />
            </svg>
          )}
        </AnimatePresence>

        {/* Auth complete flash effect */}
        <AnimatePresence>
          {authComplete && (
            <motion.div
              className="absolute inset-0 bg-aurora-cyan"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

MonolithCard.displayName = 'MonolithCard'
```

### 4.3 SeedBoxCard 컴포넌트

```typescript
// src/components/ui/SeedBoxCard.tsx
'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SeedBoxCardProps extends HTMLAttributes<HTMLDivElement> {
  serialNumber: string
  category: string
  title: string
  description: string
  nodeCount: number
  contributorCount: number
  icon: string
}

export const SeedBoxCard = forwardRef<HTMLDivElement, SeedBoxCardProps>(
  ({
    className,
    serialNumber,
    category,
    title,
    description,
    nodeCount,
    contributorCount,
    icon,
    ...props
  }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'seed-box rounded-xl overflow-hidden',
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        {/* Top accent line (appears on hover via CSS) */}

        {/* Header with serial number */}
        <div className="px-4 pt-3 pb-2 border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="serial-number">SV-{serialNumber}</span>
            <span className="text-xs text-arctic-300/60 uppercase tracking-wider">
              {category}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl shrink-0">
              {icon}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-arctic-100 text-base mb-1 truncate">
                {title}
              </h3>
              <p className="text-sm text-arctic-300/60 line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-aurora-cyan" />
              <span className="text-xs text-arctic-300/80">
                {nodeCount} 노드
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-aurora-violet" />
              <span className="text-xs text-arctic-300/80">
                {contributorCount} 기여자
              </span>
            </div>
          </div>
        </div>

        {/* Bottom glow effect on hover */}
        <div className="h-px bg-gradient-to-r from-transparent via-aurora-cyan/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    )
  }
)

SeedBoxCard.displayName = 'SeedBoxCard'
```

### 4.4 Button Variants

```typescript
// src/components/ui/Button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        // Seed Vault Custom Variants
        aurora:
          "bg-gradient-to-r from-aurora-violet to-aurora-cyan text-white hover:shadow-glow-cyan",
        frost:
          "bg-arctic-200/10 text-arctic-100 border border-arctic-200/20 hover:bg-arctic-200/20 hover:border-arctic-200/30",
        glow:
          "bg-permafrost text-aurora-cyan border border-aurora-cyan/30 hover:border-aurora-cyan hover:shadow-glow-cyan",
        concrete:
          "bg-concrete-700 text-arctic-100 hover:bg-concrete-600",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

---

## 5. 페이지별 구현 가이드

### 5.1 랜딩 페이지 (Landing)

```typescript
// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MonolithCard } from '@/components/ui/MonolithCard'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/stores/userStore'

export default function LandingPage() {
  const { isVerified } = useUserStore()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleAuth = () => {
    setIsAuthenticating(true)
  }

  const handleAuthSuccess = () => {
    // Verification logic
    useUserStore.getState().setVerified(true, '0x' + Math.random().toString(16).slice(2, 10) + '...anon')
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Parallax Background */}
      <ParallaxBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {!isVerified ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <MonolithCard
                isActive={isAuthenticating}
                onAuthSuccess={handleAuthSuccess}
              >
                <div className="text-center space-y-6">
                  {/* Logo */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-6xl"
                  >
                    🌱
                  </motion.div>

                  {/* Title */}
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-arctic-100">
                      Seed Vault
                    </h1>
                    <p className="text-sm text-arctic-300/60">
                      Human Knowledge Repository
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-arctic-300/80 max-w-[200px]">
                    Dead Internet 시대,<br />
                    검증된 인간 지식의 보존소
                  </p>

                  {/* Auth Button */}
                  <Button
                    variant="glow"
                    size="lg"
                    onClick={handleAuth}
                    disabled={isAuthenticating}
                    className="w-full"
                  >
                    {isAuthenticating ? (
                      <span className="animate-pulse">인증 중...</span>
                    ) : (
                      <>
                        <span className="text-xl">⚫</span>
                        World ID로 시작하기
                      </>
                    )}
                  </Button>
                </div>
              </MonolithCard>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 mt-8"
              >
                <StatCard label="노드" value={2847} />
                <StatCard label="기여자" value={423} />
                <StatCard label="봇" value={12} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Redirect to marketplace or render marketplace content */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

function ParallaxBackground() {
  return (
    <div className="fixed inset-0 bg-permafrost">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-aurora-violet/10 rounded-full blur-[120px] animate-parallax-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-aurora-cyan/10 rounded-full blur-[100px] animate-parallax-fast" />

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-50" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-permafrost/80" />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-frost rounded-xl px-5 py-3 text-center">
      <div className="text-xl font-bold text-arctic-100">{value.toLocaleString()}</div>
      <div className="text-xs text-arctic-300/60">{label}</div>
    </div>
  )
}
```

### 5.2 마켓플레이스 (Bot List)

```typescript
// src/app/marketplace/page.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SeedBoxCard } from '@/components/ui/SeedBoxCard'
import { expertBots } from '@/lib/mock-data'
import { BottomNav } from '@/components/BottomNav'

export default function MarketplacePage() {
  return (
    <main className="min-h-screen flex flex-col bg-permafrost">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 px-4 py-4 border-b border-white/5">
        <h1 className="text-xl font-bold text-arctic-100">전문가 봇</h1>
        <p className="text-sm text-arctic-300/60 mt-1">
          검증된 인간 지식 기반의 AI 어시스턴트
        </p>
      </header>

      {/* Bot Grid */}
      <div className="flex-1 p-4 space-y-3 overflow-auto pb-24">
        {expertBots.map((bot, index) => (
          <motion.div
            key={bot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/explore/${bot.id}`}>
              <SeedBoxCard
                serialNumber={bot.id.slice(0, 8).toUpperCase()}
                category={bot.category}
                title={bot.name}
                description={bot.description}
                nodeCount={bot.nodeCount}
                contributorCount={bot.contributorCount}
                icon={bot.icon}
                className="group cursor-pointer"
              />
            </Link>
          </motion.div>
        ))}
      </div>

      <BottomNav active="home" />
    </main>
  )
}
```

### 5.3 지식 그래프 (Knowledge Graph) - 핵심 구현

```typescript
// src/components/KnowledgeGraph.tsx
'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { ExpertBot, KnowledgeNode } from '@/lib/types'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <GraphLoader />
})

// ===========================================
// Types
// ===========================================
interface KnowledgeGraphProps {
  bot: ExpertBot
  highlightedNodes?: string[]
  onNodeClick?: (node: KnowledgeNode) => void
  recentlyCitedNodes?: string[]
}

interface GraphNode {
  id: string
  name: string
  val: number
  node: KnowledgeNode
  citationCount: number
  colorIndex: number
  x?: number
  y?: number
}

// ===========================================
// Color Configuration
// ===========================================
const GRADIENT_SETS = [
  { from: '#667eea', to: '#764ba2' }, // purple-violet
  { from: '#f093fb', to: '#f5576c' }, // pink-red
  { from: '#4facfe', to: '#00f2fe' }, // blue-cyan (Aurora)
  { from: '#43e97b', to: '#38f9d7' }, // green-teal
  { from: '#fa709a', to: '#fee140' }, // pink-yellow
  { from: '#a8edea', to: '#fed6e3' }, // teal-pink
]

const AURORA_CYAN = '#00F2FF'
const EDGE_COLOR = 'rgba(139, 92, 246, 0.15)'
const EDGE_HIGHLIGHT_COLOR = 'rgba(0, 242, 255, 0.3)'

// ===========================================
// Helper Functions
// ===========================================

// Draw hexagon shape for nodes
function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    const px = x + radius * Math.cos(angle)
    const py = y + radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

// Calculate LOD (Level of Detail) based on zoom
function getLOD(globalScale: number): 'low' | 'medium' | 'high' {
  if (globalScale < 0.5) return 'low'
  if (globalScale < 1.5) return 'medium'
  return 'high'
}

// ===========================================
// Main Component
// ===========================================
export function KnowledgeGraph({
  bot,
  highlightedNodes = [],
  onNodeClick,
  recentlyCitedNodes = []
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 360 })
  const [animationPhase, setAnimationPhase] = useState(0)
  const [hoverNode, setHoverNode] = useState<string | null>(null)
  const [currentZoom, setCurrentZoom] = useState(1)

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 360
        })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Citation animation phases
  useEffect(() => {
    if (recentlyCitedNodes.length > 0) {
      setAnimationPhase(1)
      const timers = [
        setTimeout(() => setAnimationPhase(2), 200),
        setTimeout(() => setAnimationPhase(3), 400),
        setTimeout(() => setAnimationPhase(4), 600),
        setTimeout(() => setAnimationPhase(0), 2500),
      ]
      return () => timers.forEach(clearTimeout)
    }
  }, [recentlyCitedNodes])

  // Graph data transformation
  const graphData = useMemo(() => ({
    nodes: bot.graph.nodes.map((node, index) => ({
      id: node.id,
      name: node.label,
      val: 6,
      node,
      citationCount: node.citationCount,
      colorIndex: index % GRADIENT_SETS.length
    })),
    links: bot.graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      label: edge.relationship
    }))
  }), [bot.graph])

  // Node click handler
  const handleNodeClick = useCallback((node: object) => {
    if (onNodeClick) onNodeClick((node as GraphNode).node)
  }, [onNodeClick])

  // Zoom handler for LOD
  const handleZoom = useCallback((zoom: { k: number }) => {
    setCurrentZoom(zoom.k)
  }, [])

  // ===========================================
  // Canvas Rendering: Nodes (Hexagon Shape)
  // ===========================================
  const nodeCanvasObject = useCallback((node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as GraphNode
    const x = n.x || 0
    const y = n.y || 0
    const isHighlighted = highlightedNodes.includes(n.id)
    const isRecentlyCited = recentlyCitedNodes.includes(n.id)
    const isHovered = hoverNode === n.id
    const colors = GRADIENT_SETS[n.colorIndex]
    const lod = getLOD(globalScale)

    // Calculate radius based on state
    const baseRadius = 8
    const radius = isHighlighted || isHovered ? baseRadius + 3 : baseRadius

    // ===========================================
    // 1. Outer glow rings for cited nodes (Pulse Animation)
    // ===========================================
    if (isRecentlyCited && animationPhase > 0) {
      for (let i = 3; i >= 1; i--) {
        const ringRadius = radius + (animationPhase * 4) + (i * 6)
        const alpha = Math.max(0, 0.3 - (animationPhase * 0.05) - (i * 0.08))
        ctx.beginPath()
        ctx.arc(x, y, ringRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(74, 222, 128, ${alpha})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    // ===========================================
    // 2. Glow effect (radial gradient)
    // ===========================================
    if (lod !== 'low') {
      const glowRadius = radius + (isHighlighted || isHovered ? 15 : 10)
      const glow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius)

      if (isRecentlyCited && animationPhase > 0) {
        glow.addColorStop(0, 'rgba(74, 222, 128, 0.6)')
        glow.addColorStop(0.5, 'rgba(74, 222, 128, 0.2)')
        glow.addColorStop(1, 'rgba(74, 222, 128, 0)')
      } else if (isHighlighted || isHovered) {
        glow.addColorStop(0, `${AURORA_CYAN}66`)
        glow.addColorStop(0.5, `${AURORA_CYAN}22`)
        glow.addColorStop(1, `${AURORA_CYAN}00`)
      } else {
        glow.addColorStop(0, `${colors.from}44`)
        glow.addColorStop(0.5, `${colors.from}11`)
        glow.addColorStop(1, `${colors.from}00`)
      }

      ctx.beginPath()
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
    }

    // ===========================================
    // 3. Main hexagon node with gradient
    // ===========================================
    const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius * 1.2)

    if (isRecentlyCited && animationPhase > 0) {
      gradient.addColorStop(0, '#86efac')
      gradient.addColorStop(1, '#22c55e')
    } else if (isHighlighted || isHovered) {
      gradient.addColorStop(0, AURORA_CYAN)
      gradient.addColorStop(1, '#4FACFE')
    } else {
      gradient.addColorStop(0, colors.from)
      gradient.addColorStop(1, colors.to)
    }

    // Draw hexagon
    drawHexagon(ctx, x, y, radius)
    ctx.fillStyle = gradient
    ctx.fill()

    // ===========================================
    // 4. Inner highlight (glossy effect) - Medium/High LOD only
    // ===========================================
    if (lod !== 'low') {
      const innerGlow = ctx.createRadialGradient(x - radius/2, y - radius/2, 0, x, y, radius)
      innerGlow.addColorStop(0, 'rgba(255,255,255,0.4)')
      innerGlow.addColorStop(0.5, 'rgba(255,255,255,0)')
      innerGlow.addColorStop(1, 'rgba(255,255,255,0)')

      drawHexagon(ctx, x, y, radius)
      ctx.fillStyle = innerGlow
      ctx.fill()
    }

    // ===========================================
    // 5. Node border
    // ===========================================
    if (isHighlighted || isHovered) {
      drawHexagon(ctx, x, y, radius)
      ctx.strokeStyle = AURORA_CYAN
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // ===========================================
    // 6. Label - High LOD only
    // ===========================================
    if (lod === 'high' || isHighlighted || isHovered) {
      const label = n.name.length > 12 ? n.name.slice(0, 11) + '...' : n.name
      const fontSize = isHighlighted || isHovered ? 11 : 10

      ctx.font = `500 ${fontSize}px "Pretendard", -apple-system, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // Text shadow
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 4
      ctx.fillStyle = isHighlighted || isRecentlyCited || isHovered
        ? '#ffffff'
        : 'rgba(255,255,255,0.7)'
      ctx.fillText(label, x, y + radius + 6)
      ctx.shadowBlur = 0
    }

    // ===========================================
    // 7. Citation badge
    // ===========================================
    if (n.citationCount > 0 && (isHighlighted || isRecentlyCited || isHovered)) {
      const badgeText = n.citationCount.toString()
      ctx.font = `600 8px "Pretendard", sans-serif`
      const tw = ctx.measureText(badgeText).width
      const bx = x + radius + 4
      const by = y - radius - 2
      const pad = 4

      ctx.beginPath()
      ctx.roundRect(bx - pad, by - 6 - pad, tw + pad * 2, 12 + pad, 6)
      ctx.fillStyle = isRecentlyCited && animationPhase > 0 ? '#22c55e' : AURORA_CYAN
      ctx.fill()

      ctx.fillStyle = '#000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(badgeText, bx + tw/2, by)
    }

    // ===========================================
    // 8. +1 floating animation for citations
    // ===========================================
    if (isRecentlyCited && animationPhase > 0 && animationPhase < 4) {
      const floatY = y - radius - 16 - (animationPhase * 8)
      const alpha = Math.max(0, 1 - animationPhase * 0.25)

      ctx.font = `bold 14px "Pretendard", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`
      ctx.fillText('+1', x, floatY)
    }
  }, [highlightedNodes, recentlyCitedNodes, hoverNode, animationPhase])

  // ===========================================
  // Canvas Rendering: Edges (Curved with Pulse)
  // ===========================================
  const linkCanvasObject = useCallback((link: object, ctx: CanvasRenderingContext2D) => {
    const l = link as { source: GraphNode; target: GraphNode; label?: string }
    if (!l.source.x || !l.target.x) return

    const sx = l.source.x, sy = l.source.y || 0
    const tx = l.target.x, ty = l.target.y || 0

    // Curved path
    const mx = (sx + tx) / 2
    const my = (sy + ty) / 2
    const dx = tx - sx
    const dy = ty - sy
    const curve = 0.2
    const cx = mx - dy * curve
    const cy = my + dx * curve

    // Determine if edge connects highlighted nodes
    const isHighlighted =
      highlightedNodes.includes(l.source.id) &&
      highlightedNodes.includes(l.target.id)

    // Gradient stroke
    const grad = ctx.createLinearGradient(sx, sy, tx, ty)
    if (isHighlighted) {
      grad.addColorStop(0, 'rgba(0, 242, 255, 0.5)')
      grad.addColorStop(0.5, 'rgba(0, 242, 255, 0.3)')
      grad.addColorStop(1, 'rgba(0, 242, 255, 0.5)')
    } else {
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
      grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)')
      grad.addColorStop(1, 'rgba(139, 92, 246, 0.3)')
    }

    // Draw curved line
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(cx, cy, tx, ty)
    ctx.strokeStyle = grad
    ctx.lineWidth = isHighlighted ? 2 : 1.5
    ctx.stroke()

    // Add dashed animation for highlighted edges (Pulse Effect)
    if (isHighlighted) {
      ctx.save()
      ctx.setLineDash([5, 5])
      ctx.lineDashOffset = -(Date.now() / 50) % 10
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.quadraticCurveTo(cx, cy, tx, ty)
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }

    // Arrow head
    const angle = Math.atan2(ty - cy, tx - cx)
    const aLen = 5
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    ctx.lineTo(tx - aLen * Math.cos(angle - Math.PI/6), ty - aLen * Math.sin(angle - Math.PI/6))
    ctx.lineTo(tx - aLen * Math.cos(angle + Math.PI/6), ty - aLen * Math.sin(angle + Math.PI/6))
    ctx.closePath()
    ctx.fillStyle = isHighlighted ? 'rgba(0, 242, 255, 0.7)' : 'rgba(139, 92, 246, 0.5)'
    ctx.fill()

    // Edge label (only if distance is sufficient)
    const dist = Math.sqrt(dx*dx + dy*dy)
    if (l.label && dist > 80) {
      ctx.font = '9px "Pretendard", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isHighlighted ? 'rgba(0, 242, 255, 0.8)' : 'rgba(167, 139, 250, 0.6)'
      ctx.fillText(l.label, cx, cy)
    }
  }, [highlightedNodes])

  return (
    <div ref={containerRef} className="relative w-full rounded-3xl overflow-hidden">
      {/* Animated background */}
      <GraphBackground />

      {/* Ice Veil overlay (cluster effect) */}
      <div className={`absolute inset-0 ice-veil ${highlightedNodes.length > 0 ? 'active' : ''} pointer-events-none z-30`} />

      {/* Graph */}
      <div className="relative z-10">
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="transparent"
          nodeLabel=""
          nodeRelSize={1}
          linkColor={() => EDGE_COLOR}
          linkWidth={1}
          linkCurvature={0.25}
          onNodeClick={handleNodeClick}
          onNodeHover={(node) => setHoverNode(node ? (node as GraphNode).id : null)}
          onZoom={handleZoom}
          cooldownTicks={80}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.25}
          nodeCanvasObjectMode={() => 'replace'}
          nodeCanvasObject={nodeCanvasObject}
          linkCanvasObject={linkCanvasObject}
          linkCanvasObjectMode={() => 'replace'}
        />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none z-20" />
    </div>
  )
}

// ===========================================
// Sub-components
// ===========================================
function GraphBackground() {
  return (
    <div className="absolute inset-0 bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-fuchsia-950/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 bg-noise opacity-20" />
    </div>
  )
}

function GraphLoader() {
  return (
    <div className="w-full h-[360px] bg-[#0a0a0f] rounded-3xl flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-aurora-cyan rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}
```

### 5.4 기여 페이지 (Contribute)

```typescript
// src/app/contribute/[botId]/page.tsx - Success Animation Section
'use client'

import { motion, AnimatePresence } from 'framer-motion'

// Success celebration component
function ContributionSuccess({ title, onViewGraph, onGoHome }: {
  title: string
  onViewGraph: () => void
  onGoHome: () => void
}) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-permafrost/95 z-50"
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ y: '-10%', x: `${Math.random() * 100}%`, rotate: 0 }}
            animate={{
              y: '110vh',
              rotate: 720,
              transition: {
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: 'linear'
              }
            }}
          >
            <span className="text-2xl">
              {['🎉', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 5)]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Success card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', damping: 20 }}
        className="glass-card rounded-3xl p-8 mx-4 max-w-sm w-full text-center space-y-6"
      >
        {/* Checkmark animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 10 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>

        {/* Success text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-arctic-100">
            지식이 추가되었습니다!
          </h1>
          <p className="text-arctic-300/70 text-sm">
            당신의 지식이 Seed Vault에<br />영구 보존됩니다
          </p>
        </div>

        {/* Node preview */}
        <div className="glass-frost rounded-xl p-4 text-left">
          <p className="text-xs text-arctic-300/60 mb-1">추가된 노드</p>
          <p className="font-medium text-arctic-100 truncate">{title}</p>
        </div>

        {/* Contribution Power badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold glow-green border border-green-500/30"
        >
          <span className="text-lg">⚡</span>
          <span className="text-green-400">+5 Contribution Power</span>
        </motion.div>

        {/* Action buttons */}
        <div className="space-y-2 pt-4">
          <Button variant="glow" className="w-full" onClick={onViewGraph}>
            그래프에서 보기
          </Button>
          <Button variant="frost" className="w-full" onClick={onGoHome}>
            홈으로
          </Button>
        </div>
      </motion.div>
    </motion.main>
  )
}
```

### 5.5 보상 페이지 (Rewards)

```typescript
// src/app/rewards/page.tsx - Stats and Progress Section
'use client'

import { motion } from 'framer-motion'

function ContributionPowerGauge({ value }: { value: number }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-arctic-300">
          Contribution Power
        </span>
        <span className="text-xl font-bold text-aurora-cyan">
          {value}%
        </span>
      </div>

      {/* Progress bar with glow */}
      <div className="relative h-3 bg-concrete-600 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-aurora-violet to-aurora-cyan rounded-full"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-aurora-cyan/50 to-transparent rounded-full animate-pulse-glow"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function StatsGrid({ citations, contributions }: { citations: number; contributions: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-frost rounded-xl p-4 text-center"
      >
        <div className="text-2xl font-bold text-aurora-cyan">
          {citations.toLocaleString()}
        </div>
        <div className="text-sm text-arctic-300/60">총 인용 횟수</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-frost rounded-xl p-4 text-center"
      >
        <div className="text-2xl font-bold text-aurora-violet">
          {contributions}
        </div>
        <div className="text-sm text-arctic-300/60">기여한 노드</div>
      </motion.div>
    </div>
  )
}

function RewardsCard({ pendingWLD, onClaim }: { pendingWLD: number; onClaim: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-permafrost to-concrete-800 rounded-xl p-6 border border-aurora-cyan/20 glow-cyan"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-violet flex items-center justify-center">
          <span className="text-2xl">⚫</span>
        </div>
        <span className="text-sm text-arctic-300/80">수령 가능한 보상</span>
      </div>

      <div className="text-4xl font-bold text-arctic-100 mb-6">
        {pendingWLD.toFixed(4)} <span className="text-xl text-arctic-300/60">WLD</span>
      </div>

      <Button
        variant="aurora"
        size="lg"
        className="w-full"
        onClick={onClaim}
        disabled={pendingWLD === 0}
      >
        Claim
      </Button>
    </motion.div>
  )
}
```

---

## 6. 애니메이션 시스템

### 6.1 Framer Motion 설정

```typescript
// src/lib/animations.ts
import { Variants } from 'framer-motion'

// ===========================================
// Page Transitions
// ===========================================
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// ===========================================
// Card Animations
// ===========================================
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
}

// ===========================================
// Stagger Container
// ===========================================
export const staggerContainerVariants: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// ===========================================
// Monolith Animations
// ===========================================
export const monolithVariants: Variants = {
  initial: {
    opacity: 0,
    rotateX: 45,
    rotateY: -15,
    z: -100,
  },
  enter: {
    opacity: 1,
    rotateX: 0,
    rotateY: -15,
    z: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// ===========================================
// Auth Line Animation
// ===========================================
export const lineDrawVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

// ===========================================
// Success Animations
// ===========================================
export const checkmarkVariants: Variants = {
  initial: {
    pathLength: 0,
  },
  animate: {
    pathLength: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export const confettiVariants: Variants = {
  initial: {
    y: '-10%',
    rotate: 0,
    opacity: 1,
  },
  animate: {
    y: '110vh',
    rotate: 720,
    opacity: 0,
    transition: {
      duration: 3,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}

// ===========================================
// Graph Node Animations
// ===========================================
export const nodeSpawnVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  enter: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 200,
    },
  },
}

// ===========================================
// Pulse Animation (for glow effects)
// ===========================================
export const pulseVariants: Variants = {
  initial: {
    opacity: 0.5,
    scale: 1,
  },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}

// ===========================================
// Float Animation
// ===========================================
export const floatVariants: Variants = {
  initial: {
    y: 0,
    rotate: 0,
  },
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: {
      duration: 6,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}
```

### 6.2 AnimatePresence Wrapper

```typescript
// src/components/PageTransition.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageVariants } from '@/lib/animations'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## 7. 성능 최적화

### 7.1 Dynamic Imports

```typescript
// 지식 그래프 dynamic import (이미 구현됨)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <GraphLoader />
})

// Framer Motion lazyMotion (선택적)
import { LazyMotion, domAnimation } from 'framer-motion'

// 사용법:
// <LazyMotion features={domAnimation}>
//   <m.div animate={{ opacity: 1 }} />
// </LazyMotion>
```

### 7.2 Canvas 최적화

```typescript
// src/hooks/useCanvasOptimization.ts
import { useCallback, useRef } from 'react'

export function useCanvasOptimization() {
  const frameRef = useRef<number>(0)

  // Debounced render for expensive operations
  const debouncedRender = useCallback((callback: () => void, delay = 16) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }
    frameRef.current = requestAnimationFrame(() => {
      setTimeout(callback, delay)
    })
  }, [])

  // Throttled interaction handler
  const throttledHandler = useCallback((callback: () => void, limit = 50) => {
    let inThrottle = false
    return () => {
      if (!inThrottle) {
        callback()
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }, [])

  return { debouncedRender, throttledHandler }
}
```

### 7.3 Graph 인터랙션 디바운싱

```typescript
// src/hooks/useGraphInteraction.ts
import { useState, useCallback, useRef } from 'react'
import { debounce } from '@/lib/utils'

export function useGraphInteraction() {
  const [hoverNode, setHoverNode] = useState<string | null>(null)

  // Debounced hover handler to prevent excessive re-renders
  const handleNodeHover = useCallback(
    debounce((nodeId: string | null) => {
      setHoverNode(nodeId)
    }, 50),
    []
  )

  // Throttled zoom handler
  const zoomRef = useRef<number>(1)
  const handleZoom = useCallback((zoom: { k: number }) => {
    // Only update if zoom changed significantly
    if (Math.abs(zoom.k - zoomRef.current) > 0.1) {
      zoomRef.current = zoom.k
      // Trigger LOD change
    }
  }, [])

  return { hoverNode, handleNodeHover, handleZoom }
}
```

### 7.4 LOD (Level of Detail) 구현

```typescript
// LOD 시스템 - 줌 레벨에 따른 렌더링 최적화
function getLOD(globalScale: number): 'low' | 'medium' | 'high' {
  if (globalScale < 0.5) return 'low'      // 멀리서 볼 때: 기본 형태만
  if (globalScale < 1.5) return 'medium'   // 중간: 그래디언트, 기본 라벨
  return 'high'                             // 가까이: 모든 효과
}

// LOD에 따른 렌더링 분기
const nodeCanvasObject = (node, ctx, globalScale) => {
  const lod = getLOD(globalScale)

  // Low LOD: 단순 원형만
  if (lod === 'low') {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = colors.from
    ctx.fill()
    return
  }

  // Medium LOD: 그래디언트 추가
  // High LOD: 모든 효과 (글로우, 라벨, 배지 등)
}
```

### 7.5 Zustand Store 최적화

```typescript
// src/stores/knowledgeStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Selector를 사용한 세분화된 구독
export const useKnowledgeStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    nodes: {},

    // Actions
    addNode: (botId, node) => {
      set((state) => ({
        nodes: {
          ...state.nodes,
          [botId]: [...(state.nodes[botId] || []), node]
        }
      }))
    },

    // Selectors (불필요한 리렌더링 방지)
    getNodesForBot: (botId) => get().nodes[botId] || [],
    getContributionCount: (botId) => (get().nodes[botId] || []).length,
  }))
)

// 컴포넌트에서 사용
const count = useKnowledgeStore((state) => state.getContributionCount(botId))
```

---

## 추가 참고사항

### 의존성 설치

```bash
# 필수 패키지
npm install framer-motion zustand

# 이미 설치됨 (package.json 기준)
# - react-force-graph-2d
# - tailwindcss-animate
# - @radix-ui/react-slot
# - class-variance-authority
# - clsx
# - tailwind-merge
```

### 파일 구조

```
src/
├── app/
│   ├── globals.css          # 글로벌 스타일 (수정 필요)
│   ├── page.tsx             # 랜딩 페이지
│   ├── layout.tsx           # 레이아웃
│   ├── marketplace/
│   │   └── page.tsx         # 마켓플레이스
│   ├── explore/
│   │   └── [botId]/
│   │       └── page.tsx     # 탐색 페이지
│   ├── contribute/
│   │   └── [botId]/
│   │       └── page.tsx     # 기여 페이지
│   └── rewards/
│       └── page.tsx         # 보상 페이지
├── components/
│   ├── ui/
│   │   ├── Button.tsx       # 버튼 (수정 필요)
│   │   ├── GlassCard.tsx    # 새로 추가
│   │   ├── MonolithCard.tsx # 새로 추가
│   │   └── SeedBoxCard.tsx  # 새로 추가
│   ├── KnowledgeGraph.tsx   # 지식 그래프 (수정 필요)
│   ├── PageTransition.tsx   # 새로 추가
│   └── ...
├── lib/
│   ├── animations.ts        # 새로 추가
│   └── utils.ts
├── hooks/
│   ├── useCanvasOptimization.ts  # 새로 추가
│   └── useGraphInteraction.ts    # 새로 추가
└── stores/
    └── knowledgeStore.ts    # 수정 필요
```

---

이 가이드를 기반으로 Seed Vault의 "Digital Permafrost" 디자인 컨셉을 구현할 수 있습니다. 각 컴포넌트는 독립적으로 사용 가능하며, 기존 코드베이스와 호환됩니다.
