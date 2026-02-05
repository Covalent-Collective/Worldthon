# Seed Vault - 개발 환경 설정

## 0. Quick Verification

설정 완료 후 동작 확인:

```bash
# 1. Node 버전 확인 (18+)
node -v

# 2. 의존성 설치
npm install

# 3. 환경 변수 복사
cp .env.example .env.local

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 확인
open http://localhost:3000
```

Seed Vault 홈페이지가 보이면 설정 완료!

---

## Prerequisites

| 항목 | 버전 | 필수 |
|------|------|------|
| Node.js | 18.x 이상 | ✅ |
| npm | 9.x 이상 | ✅ |
| World App | 최신 버전 | ✅ (테스트용) |
| World Developer Portal 계정 | - | ✅ |

---

## 1. World Developer Portal 설정

### 1.1 앱 등록

1. [World Developer Portal](https://developer.worldcoin.org) 접속
2. 로그인 후 "Create App" 클릭
3. 앱 정보 입력:
   - **App Name**: Seed Vault
   - **App Description**: Human Knowledge Repository
   - **App URL**: `http://localhost:3000` (개발용)

### 1.2 Action 생성

1. 앱 대시보드에서 "Incognito Actions" 탭 선택
2. "Create Action" 클릭
3. Action 정보 입력:
   - **Action Name**: contribute
   - **Description**: Verify human to contribute knowledge
   - **Max Verifications**: Unlimited

### 1.3 키 확인

- `App ID`: `app_xxx...` 형태
- `Action ID`: `contribute` (직접 설정한 이름)

---

## 2. 프로젝트 설정

### 2.1 Clone & Install

```bash
git clone https://github.com/Covalent-Collective/Worldthon.git
cd Worldthon
npm install
```

### 2.2 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
NEXT_PUBLIC_APP_ID=app_staging_xxx    # World Developer Portal에서 복사
NEXT_PUBLIC_ACTION_ID=contribute       # 생성한 Action 이름
```

### 2.3 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

---

## 3. 테스트 환경

### 3.1 브라우저 테스트 (Mock 모드)

World App 외부에서 실행 시 자동으로 Mock 모드로 동작합니다.
- Orb 인증 → Mock 결과 반환
- 모든 UI 기능 테스트 가능

### 3.2 World App Simulator

1. [World App Simulator](https://simulator.worldcoin.org) 접속
2. "Add Mini App" 클릭
3. URL 입력: `http://localhost:3000`
4. 시뮬레이터에서 앱 테스트

### 3.3 실제 World App 테스트 (ngrok)

#### 설치

**macOS:**
```bash
brew install ngrok
```

**Windows:**
```bash
choco install ngrok
```

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

#### 설정 (최초 1회)

1. [ngrok.com](https://ngrok.com) 계정 생성
2. 대시보드에서 auth token 복사
3. ngrok 설정:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 터널링 실행

```bash
# 개발 서버 먼저 실행
npm run dev

# 다른 터미널에서 ngrok 실행
ngrok http 3000
```

#### World Developer Portal 업데이트

1. ngrok URL 복사 (예: `https://abc123.ngrok.io`)
2. [developer.worldcoin.org](https://developer.worldcoin.org) 이동
3. 앱의 URL을 ngrok URL로 업데이트
4. World App에서 테스트

**참고:** 무료 ngrok URL은 세션마다 변경됩니다. 안정적인 URL이 필요하면 Vercel 배포를 권장합니다.

---

## 4. 빌드 & 배포

### 4.1 프로덕션 빌드

```bash
npm run build
npm start
```

### 4.2 Vercel 배포 (Recommended)

#### Step 1: Repository 연결

1. [vercel.com](https://vercel.com) 접속
2. "Add New Project" 클릭
3. GitHub repository import
4. Framework preset: "Next.js" 선택

#### Step 2: 환경 변수 설정

Vercel Dashboard > Project > Settings > Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_ID` | `app_xxx` (Developer Portal에서) | Production |
| `NEXT_PUBLIC_ACTION_ID` | `contribute` | Production |

#### Step 3: 빌드 설정 확인

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

#### Step 4: 배포

"Deploy" 클릭 후 빌드 완료 대기

#### Step 5: World Developer Portal 업데이트

1. [developer.worldcoin.org](https://developer.worldcoin.org) 이동
2. 앱 선택
3. App URL을 Vercel production URL로 업데이트
4. 저장

#### Vercel 배포 트러블슈팅

| Error | Solution |
|-------|----------|
| Build fails | Node 버전 확인 (18+), 로컬에서 `npm run build` 먼저 테스트 |
| 환경 변수 안 됨 | `NEXT_PUBLIC_` prefix 확인 |
| 404 on routes | `next.config.mjs` 설정 확인 |

---

## 5. 트러블슈팅

### 일반 에러

| 에러 | 원인 | 해결 |
|------|------|------|
| `MiniKit is not installed` | World App 외부 | Mock 모드로 자동 전환 |
| `Verification failed` | Action 비활성화 | Developer Portal 확인 |
| `Hydration failed` | SSR 불일치 | useEffect로 클라이언트 로직 분리 |

### npm install 실패

```bash
# npm 캐시 클리어
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 사용 중

```bash
# 프로세스 찾아서 종료
lsof -ti:3000 | xargs kill -9

# 또는 다른 포트 사용
npm run dev -- -p 3001
```

### TypeScript 에러

```bash
# 타입 재생성
rm -rf .next
npm run build
```

### World App 빈 화면

1. World App 캐시 클리어
2. World App 강제 종료 후 재시작
3. Developer Portal에 URL이 올바르게 등록되었는지 확인

---

## 6. 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (hot reload) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 |

### 개발 워크플로우

```bash
# 1. 개발 서버 시작
npm run dev

# 2. 변경사항 작업 (hot reload 자동)

# 3. 커밋 전 lint
npm run lint

# 4. 프로덕션 빌드 로컬 테스트
npm run build && npm run start
```

---

## 7. shadcn/ui 컴포넌트 추가

### 사용 가능한 컴포넌트 확인
```bash
npx shadcn@latest add --help
```

### 컴포넌트 추가
```bash
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add tabs
```

### 현재 설치된 컴포넌트
- Button
- Card
- Input
- Textarea

---

## 8. 체크리스트

### 개발 시작 전
- [ ] Node.js 18+ 설치
- [ ] World Developer Portal 앱 등록
- [ ] `.env.local` 설정
- [ ] `npm install` 완료

### 테스트 전
- [ ] 개발 서버 실행
- [ ] Mock 모드 기본 플로우 테스트
- [ ] World App Simulator 인증 테스트

### 배포 전
- [ ] `npm run build` 성공
- [ ] `npm run lint` 에러 없음
- [ ] Vercel 환경 변수 설정
- [ ] Developer Portal에 프로덕션 URL 등록
