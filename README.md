# 🌱 Seed Vault

> **Human Knowledge Repository for the Dead Internet Era**
> World ID Orb 인증 기반 지식 기여 및 보상 플랫폼

[![World ID](https://img.shields.io/badge/World%20ID-Orb%20Verified-black)](https://worldcoin.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Hackathon](https://img.shields.io/badge/World%20Build-Korea%202026-blue)](https://worldcoin.org)

---

## 🎯 Problem

2026년, 인터넷 콘텐츠의 90%가 AI가 생성합니다.
**진짜 인간의 경험과 지식은 어디서 찾을 수 있을까요?**

## 💡 Solution

**Seed Vault**는 World ID Orb로 인증된 인간만 기여할 수 있는 지식 저장소입니다.

- ✅ **신뢰**: Orb 인증으로 봇과 AI 콘텐츠 차단
- 💰 **보상**: 기여한 지식이 인용될 때마다 WLD 토큰 보상
- 🔍 **투명성**: 답변의 출처를 지식 그래프로 시각화

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Covalent-Collective/Worldthon.git
cd Worldthon

# Install
npm install

# Environment
cp .env.example .env.local

# Run
npm run dev
```

http://localhost:3000 에서 확인

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | World ID MiniKit |
| Graph | react-force-graph-2d |
| State | Zustand |

---

## 📁 Structure

```
src/
├── app/           # Pages
├── components/    # UI Components
├── lib/           # Utils, Types, Mock Data
├── hooks/         # useWorldId
└── stores/        # Zustand
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [PLAN.md](docs/PLAN.md) | 구현 계획 |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 기술 구조 |
| [USER_FLOW.md](docs/USER_FLOW.md) | 사용자 플로우 |
| [DEMO_SCENARIO.md](docs/DEMO_SCENARIO.md) | 데모 시나리오 |
| [SETUP.md](docs/SETUP.md) | 개발 환경 설정 |
| [PITCH.md](docs/PITCH.md) | 피치 개요 |

---

## 👥 Team

**Covalent Collective**

---

## 📄 License

MIT

---

<p align="center">
  Built with ❤️ for <strong>World Build Korea Hackathon 2026</strong>
</p>
