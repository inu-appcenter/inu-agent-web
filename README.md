# inu-agent-web

> **인천대학교 플래그십 AI 캠퍼스 비서 웹 프론트엔드 (gemini.google.com 모델)**

`inu-agent-web`은 구글의 `gemini.google.com`처럼 학생 누구나 PC/모바일 웹 브라우저에서 단독으로 접속하거나, **INTIP** 및 **UNIDorm** 모바일 앱 내에서 초경량 웹뷰 오버레이로 임베딩되어 사용할 수 있는 인천대학교 공식 AI 에이전트 프론트엔드입니다.

---

## 🌟 주요 특징

- **플래그십 반응형 인터페이스:** 모바일과 데스크톱 화면에 완벽히 최적화된 미니멀하고 직관적인 챗 UI.
- **W3C 표준 SSE 실시간 스트리밍:** 토큰 단위 실시간 타이핑 효과 및 카드 스트리밍.
- **4대 Universal Server-Driven UI (SDUI) 카드 지원:**
  - `MetricCard`: 평점, 장학금 등 핵심 지표형 카드
  - `StatusCard`: 열람실 좌석, 세탁기 등 진행률/잔여 시간 카드
  - `ListCard`: LMS 과제 마감 목록, 공지사항 리스트 카드
  - `ActionCard`: 기숙사 외박 신청, 좌석 연장 원터치 승인 카드
- **모바일 단말기 P2P 액션 브릿지 (쿠콘 모델):**
  - INTIP / UNIDorm 앱 내 웹뷰에서 구동 시, `window.ReactNativeWebView`를 감지하여 개인정보가 담긴 학교 포털/LMS를 단말기에서 직접 P2P 호출하도록 지휘.
- **멀티 테넌트 & 테마 자동 적응:** `?client=INTIP` (인팁 블루), `?client=UNIDORM` (기숙사 테마) 지원.

---

## 📁 프로젝트 구조

```
inu-agent-web/
├── public/
│   └── logo.svg                 # 앱센터/에이전트 로고
├── src/
│   ├── components/
│   │   ├── cards/               # 4대 SDUI 카드 컴포넌트
│   │   │   ├── ActionCard.tsx
│   │   │   ├── CardRenderer.tsx
│   │   │   ├── ListCard.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   └── StatusCard.tsx
│   │   └── chat/                # 챗 UI 컴포넌트
│   │       ├── Header.tsx
│   │       ├── MessageBubble.tsx
│   │       ├── PromptInput.tsx
│   │       └── QuickPrompts.tsx
│   ├── hooks/
│   │   └── useAgentStream.ts    # SSE 스트리밍 및 네이티브 브릿지 훅
│   ├── types/
│   │   └── agent.ts             # 카드 및 프로토콜 타입 정의
│   ├── App.tsx                  # 메인 챗 레이아웃
│   ├── index.css                # Tailwind CSS 및 스트리밍 애니메이션
│   └── main.tsx                 # 진입점
├── .env.example                 # 환경 변수 템플릿
├── .gitignore                   # Git 추적 제외 설정
├── index.html                   # HTML 템플릿 (Pretendard 폰트)
├── package.json                 # 의존성 목록
├── tailwind.config.js           # Tailwind 설정
├── tsconfig.json                # TypeScript 설정
└── vite.config.ts               # Vite 설정
```

---

## 🚀 로컬 실행 방법

### 1. 환경 변수 설정
```bash
cp .env.example .env
# VITE_AGENT_CORE_URL=http://localhost:8000
```

### 2. 패키지 설치 및 실행
```bash
npm install
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
```
