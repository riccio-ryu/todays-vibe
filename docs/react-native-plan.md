# todays-vibe — React Native 앱 개발 계획

## 1. 왜 만드는가

todays-vibe는 AI 기반 운세 플랫폼으로, 현재 Next.js 웹 앱으로 운영 중이다.
모바일 사용자가 주 타겟인 서비스 특성상, 앱스토어/플레이스토어에 올릴 수 있는 네이티브 앱이 필요하다.

- 홈화면 아이콘에서 바로 실행 → 웹보다 접근성 높음
- 푸시 알림 → "오늘의 운세" 아침 알림 등 가능
- 앱스토어 노출 → 새로운 유입 채널

---

## 2. 전체 아키텍처

```
todays-vibe (Next.js 웹 — 이미 완성)
├── 웹 프론트엔드: src/app/
├── API 백엔드: src/app/api/
│   ├── /api/fortune          # 운세 생성 (Claude/Gemini AI)
│   ├── /api/fortune/saju     # 사주
│   ├── /api/fortune/tarot    # 타로
│   └── ...
└── Firebase: 인증, Firestore DB

todays-vibe-rn (React Native 앱 — 새로 만들 것)
└── 위 API를 fetch로 호출해서 사용
    → API 키는 서버에만 있으므로 앱에 노출 안 됨
```

**핵심 원칙: 백엔드는 공유, UI만 새로 작성**

웹 API를 그대로 재사용하기 때문에 AI 로직, 데이터베이스, 인증 서버를 중복으로 만들 필요가 없다.

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | React Native + Expo | 빠른 세팅, iOS/Android 동시 개발 |
| 언어 | TypeScript | 웹과 타입 공유 가능 |
| 네비게이션 | Expo Router | Next.js App Router와 유사한 파일 기반 라우팅 |
| 스타일링 | NativeWind | Tailwind 문법 그대로 사용 가능 |
| 인증 | Firebase Auth (웹과 동일) | 웹과 계정 공유 |
| API 통신 | fetch / axios | 웹 API 호출 |
| 상태관리 | Zustand 또는 Context API | 가볍게 시작 |
| 애니메이션 | React Native Reanimated | 부드러운 카드 뒤집기 등 |

---

## 4. 프로젝트 구조 (예정)

```
todays-vibe-rn/
├── app/                        # Expo Router 기반 화면
│   ├── (tabs)/
│   │   ├── index.tsx           # 홈 (운세 목록)
│   │   ├── tarot.tsx           # 타로
│   │   ├── saju.tsx            # 사주
│   │   └── mypage.tsx          # 마이페이지
│   ├── fortune/
│   │   └── [type].tsx          # 각 운세 결과 화면
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── _layout.tsx
├── components/
│   ├── cards/                  # 타로 카드, 운세 카드 컴포넌트
│   ├── ui/                     # 공통 UI (버튼, 인풋 등)
│   └── fortune/                # 운세별 전용 컴포넌트
├── lib/
│   ├── api.ts                  # API 호출 함수 모음
│   ├── firebase.ts             # Firebase 초기화
│   └── auth.ts                 # 인증 관련
├── types/                      # TypeScript 타입 (웹과 공유 가능)
├── constants/
│   └── api.ts                  # API_BASE_URL 등
├── app.json                    # Expo 앱 설정
└── package.json
```

---

## 5. 개발 단계

### Phase 1 — 환경 세팅 및 기본 구조
- [ ] Expo 프로젝트 생성
- [ ] TypeScript, NativeWind, Expo Router 설정
- [ ] Firebase 연동 (웹과 동일한 프로젝트 사용)
- [ ] API_BASE_URL 환경변수 설정
- [ ] 탭 네비게이션 기본 구조 완성

### Phase 2 — 인증
- [ ] 로그인 화면
- [ ] 회원가입 화면
- [ ] Firebase Auth 연동 (Google 소셜 로그인 포함)
- [ ] 로그인 상태에 따른 화면 분기

### Phase 3 — 핵심 운세 기능 (웹 API 연동)
- [ ] 홈 화면 (운세 메뉴 그리드)
- [ ] 오늘의 운세 (타로 원카드)
- [ ] 사주 풀이
- [ ] 타로 3장 스프레드
- [ ] 꿈해몽
- [ ] AI 응답 스트리밍 UI

### Phase 4 — 추가 기능
- [ ] 결과 저장 / 히스토리
- [ ] 마이페이지
- [ ] 푸시 알림 (오늘의 운세 아침 알림)
- [ ] 공유 기능

### Phase 5 — 배포
- [ ] EAS Build 설정
- [ ] 아이콘, 스플래시 스크린 제작
- [ ] App Store 심사 제출
- [ ] Google Play Store 심사 제출

---

## 6. 시작하는 방법

### 사전 준비
- Node.js 18 이상
- npm 또는 yarn
- Expo Go 앱 (스마트폰에 설치 — 개발 중 실시간 확인용)
- iOS 시뮬레이터 또는 Android 에뮬레이터 (선택)

### 프로젝트 생성
```bash
# 새 Expo 프로젝트 생성
npx create-expo-app todays-vibe-rn --template

# 프로젝트 이동
cd todays-vibe-rn

# 개발 서버 실행
npx expo start
```

### 환경변수 설정
프로젝트 루트에 `.env.local` 파일 생성:
```env
EXPO_PUBLIC_API_BASE_URL=https://todays-vibe.vercel.app
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

> `EXPO_PUBLIC_` 접두사가 붙은 변수만 앱 클라이언트에서 접근 가능.  
> API 키(Claude, Gemini)는 웹 서버에만 있으므로 여기에 넣지 않음.

### API 호출 예시
```typescript
// lib/api.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function getFortune(type: string, payload: object) {
  const res = await fetch(`${BASE_URL}/api/fortune/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
```

---

## 7. 웹과 앱의 역할 분담

| 역할 | 웹 (Next.js) | 앱 (React Native) |
|------|-------------|-------------------|
| AI API 호출 | O (서버에서) | X (웹 API 통해 간접 호출) |
| Firebase Auth | O | O (동일 프로젝트) |
| Firestore DB | O | O (동일 프로젝트) |
| UI | 브라우저용 | 모바일 네이티브용 |
| 푸시 알림 | X | O (Expo Notifications) |
| 앱스토어 배포 | X | O (EAS Build) |

---

## 8. 참고

- 웹 프로젝트 위치: `todays-vibe/` (이 저장소 루트)
- RN 앱 위치: `todays-vibe-rn/` (별도 디렉토리로 생성 예정)
- 현재 웹 API 엔드포인트 목록: `todays-vibe/src/app/api/` 참고
- Expo 공식 문서: https://docs.expo.dev
- Expo Router 문서: https://expo.github.io/router
