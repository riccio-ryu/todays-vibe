# PWA (Progressive Web App) 도입 가이드

> 오늘운 프로젝트에 PWA를 도입한 이유, 구조, 각 파일의 역할을 처음 접하는 사람도 이해할 수 있도록 작성한 문서입니다.

---

## PWA가 뭔가요?

PWA는 **Progressive Web App**의 약자입니다.

쉽게 말하면 **웹사이트인데 앱처럼 동작하게 만드는 기술**입니다.

사용자가 브라우저에서 웹사이트를 열었을 때 "홈 화면에 추가"를 누르면, 앱스토어를 거치지 않고도 스마트폰 홈 화면에 아이콘이 생기고, 실행하면 앱처럼 전체화면으로 열립니다.

### 일반 웹사이트와 비교

| | 일반 웹사이트 | PWA |
|---|---|---|
| 홈 화면 아이콘 | 없음 | 있음 |
| 주소창 표시 | 항상 보임 | 숨길 수 있음 |
| 오프라인 지원 | 없음 | 있음 (캐시) |
| 앱스토어 심사 | 필요 없음 | 필요 없음 |
| 설치 비용 | 없음 | 없음 |
| 업데이트 | 웹 배포만으로 즉시 | 웹 배포만으로 즉시 |

---

## 왜 React Native 대신 PWA를 선택했나요?

오늘운은 이미 Next.js로 만들어진 웹 앱입니다.

React Native는 모바일 앱을 **처음부터 새로 만드는** 접근법입니다. 기존 웹 코드를 그대로 쓸 수 없고, 앱스토어 심사를 통과해야 하고, iOS/Android 각각 따로 관리해야 합니다.

PWA는 기존 웹 코드에 파일 몇 개를 추가하는 것만으로 모바일 앱처럼 동작하게 할 수 있습니다. 운세 앱처럼 콘텐츠 중심의 서비스에는 PWA로 충분합니다.

---

## 구현 파일 설명

이번에 추가/수정한 파일은 총 8개입니다.

### 1. `public/manifest.json` — 앱의 신분증

```json
{
  "name": "오늘운 | 오늘, 우주가 당신에게 말을 걸어요",
  "short_name": "오늘운",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0a1e",
  "theme_color": "#7c3aed",
  "icons": [...]
}
```

브라우저가 이 파일을 읽고 **"이 웹사이트는 앱으로 설치할 수 있다"** 는 것을 인식합니다.

각 필드가 하는 일:

| 필드 | 역할 | 예시 |
|---|---|---|
| `name` | 설치 화면에 표시되는 전체 이름 | "오늘운 \| 오늘, 우주가..." |
| `short_name` | 홈 화면 아이콘 아래 표시되는 짧은 이름 | "오늘운" |
| `start_url` | 앱 아이콘을 눌렀을 때 열리는 주소 | "/" (메인 페이지) |
| `display` | 화면 표시 방식 | `standalone` = 주소창 없이 앱처럼 |
| `background_color` | 앱 로딩 중 배경색 | `#0f0a1e` (어두운 남색) |
| `theme_color` | 상단 상태바 색상 | `#7c3aed` (보라색) |
| `icons` | 홈 화면/스플래시에 표시되는 아이콘 목록 | 192px, 512px |

`display: "standalone"` 이 핵심입니다. 이 값 덕분에 앱을 열었을 때 브라우저 주소창이 사라지고 네이티브 앱처럼 보입니다.

---

### 2. `public/icons/icon-192x192.png` & `icon-512x512.png` — 앱 아이콘

기존 `public/brand/appicon.png` (1024×1024)를 두 가지 크기로 리사이즈한 파일입니다.

- **192×192** : 안드로이드 홈 화면 아이콘
- **512×512** : 스플래시 화면, 앱 설치 화면, iOS 홈 화면

PWA 표준은 최소 192px와 512px 두 가지 아이콘을 요구합니다.

---

### 3. `public/sw.js` — 서비스워커 (Service Worker)

서비스워커는 **브라우저와 서버 사이에서 중간 역할을 하는 스크립트**입니다.

비유하자면 편의점 앞에 서있는 직원 같은 존재입니다. 손님(브라우저)이 뭔가를 요청하면, 직원이 먼저 "이거 저희 창고(캐시)에 있으면 바로 드릴게요" 하고 응답할 수 있습니다. 인터넷이 끊겨도 창고에 있는 건 줄 수 있습니다.

```js
// 설치 시점: 앱 실행에 필요한 핵심 파일들을 미리 캐시에 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  // API 요청, Firebase 통신 등은 캐시 안 함 → 항상 서버에서 받아옴
  // 일반 페이지는 네트워크 우선, 실패 시 캐시에서 제공
});
```

**캐시 전략을 나눈 이유:**

- **API/Firebase**: 운세 결과나 로그인 정보는 실시간 데이터여야 하므로 캐시하면 안 됩니다.
- **페이지**: 오프라인이어도 이전에 본 페이지는 볼 수 있도록 캐시합니다.
- **정적 파일(아이콘 등)**: 자주 바뀌지 않으므로 캐시-우선으로 제공합니다.

---

### 4. `src/components/common/PWARegister.tsx` — 서비스워커 등록기

```tsx
"use client";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}
```

서비스워커는 자동으로 실행되지 않습니다. 브라우저에게 "이 파일을 서비스워커로 등록해줘"라고 명령해야 합니다. 이 컴포넌트가 그 역할을 합니다.

조건을 두 가지 확인합니다:
- `"serviceWorker" in navigator` : 이 브라우저가 서비스워커를 지원하는가 (구형 브라우저 대비)
- `NODE_ENV === "production"` : 개발 중에는 끔 (개발할 때 캐시가 방해가 되기 때문)

`return null` : 화면에 아무것도 렌더링하지 않는 컴포넌트입니다. 오직 등록 동작만 합니다.

---

### 5. `src/app/layout.tsx` 수정 — 브라우저에게 manifest 위치 알려주기 (+ iOS 아이콘 등록)

```tsx
export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,                     // iOS Safari에서 홈 화면 추가 지원
    statusBarStyle: "black-translucent",
    title: "오늘운",
    startupImage: "/icons/icon-512x512.png",
  },
  icons: {
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};
```

`manifest.json`이 있어도 브라우저가 찾지 못하면 소용없습니다. `metadata.manifest`를 통해 Next.js가 `<link rel="manifest" href="/manifest.json">` 태그를 자동으로 `<head>`에 넣어줍니다.

`appleWebApp`은 iOS Safari 전용 설정입니다. Android Chrome은 `manifest.json`만 읽으면 되지만, iOS Safari는 별도의 `apple-mobile-web-app-*` 메타 태그도 필요합니다. `icons.apple`로 iOS 홈 화면 아이콘을 명시적으로 등록하고, `startupImage`로 스플래시 이미지도 지정합니다.

body에는 `PWARegister`와 `IOSInstallBanner`를 함께 배치합니다:

```tsx
<body>
  <PWARegister />
  <IOSInstallBanner />
  <AuthProvider>{children}</AuthProvider>
</body>
```

---

### 6. `src/components/common/IOSInstallBanner.tsx` — iOS 하단 설치 안내 배너

Android Chrome은 브라우저가 자동으로 "홈 화면에 추가" 배너를 띄워주지만, **iOS Safari는 그런 기능이 없습니다.** 사용자가 방법을 모르면 설치를 못합니다.

이 컴포넌트는 iOS Safari에서 접속했을 때만 하단에 안내 배너를 표시합니다.

```tsx
useEffect(() => {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
  const dismissed = sessionStorage.getItem("ios-banner-dismissed");

  if (isIOS && !isInStandaloneMode && !dismissed) {
    setShow(true);
  }
}, []);
```

세 가지 조건을 모두 만족할 때만 배너를 보여줍니다:

| 조건 | 이유 |
|---|---|
| iOS 기기 | Android에는 이 배너가 필요 없음 |
| standalone 모드가 아닐 것 | 이미 앱으로 설치한 사람에게는 표시 안 함 |
| 세션에서 닫지 않았을 것 | 닫기 버튼을 누른 사람에게 다시 표시 안 함 |

배너를 닫으면 `sessionStorage`에 기록합니다. `localStorage`가 아닌 세션 스토리지를 쓴 이유는 영구적으로 숨기지 않고 브라우저를 재시작하면 다시 보여주기 위해서입니다.

---

### 7. `src/components/common/PWAInstallButton.tsx` — 헤더용 앱 설치 버튼

헤더에 표시되는 다운로드 아이콘 버튼입니다. 플랫폼에 따라 다르게 동작합니다.

**Android Chrome (beforeinstallprompt 이벤트)**

```tsx
const handler = (e: Event) => {
  e.preventDefault();             // 브라우저 기본 설치 배너 막기
  setDeferredPrompt(e as BeforeInstallPromptEvent);
};
window.addEventListener("beforeinstallprompt", handler);
```

브라우저가 "이 사이트는 설치 가능해요"를 감지하면 `beforeinstallprompt` 이벤트를 발생시킵니다. 이 이벤트를 저장해뒀다가 사용자가 버튼을 누를 때 직접 설치 다이얼로그를 열 수 있습니다.

**iOS Safari (팝오버 가이드)**

`beforeinstallprompt`를 지원하지 않으므로, 버튼 클릭 시 공유 버튼 → "홈 화면에 추가" 순서를 안내하는 팝오버를 표시합니다.

**숨김 조건**

- 이미 standalone 모드로 실행 중인 경우 (설치 완료)
- Android이면서 `beforeinstallprompt`가 아직 발생하지 않은 경우

---

### 8. `src/components/Header.tsx` 수정 — 헤더에 설치 버튼 배치

로그인 상태와 비로그인 상태 모두에서 `PWAInstallButton`을 표시합니다.

```tsx
import PWAInstallButton from "@/components/common/PWAInstallButton";

// 로그인한 경우
<div ref={menuRef} className="relative flex items-center gap-2">
  <PWAInstallButton />
  {/* 아바타 버튼 */}
</div>

// 비로그인인 경우
<>
  <PWAInstallButton />
  <Link href="/login">로그인</Link>
  <Link href="/signup">회원가입</Link>
</>
```

설치 버튼을 로그인 여부와 무관하게 항상 보여주는 이유는, 비회원 사용자도 앱으로 설치해 재방문율을 높이기 위해서입니다.

---

## PWA가 동작하는 흐름

```
사용자가 처음 방문
    ↓
브라우저가 manifest.json 발견
    ↓
"홈 화면에 추가" 배너 또는 버튼 표시
    ↓
사용자가 추가 → 홈 화면에 아이콘 생성
    ↓
서비스워커(sw.js)가 백그라운드에서 등록
    ↓
이후 방문 시: 캐시된 리소스로 더 빠르게 로딩
    ↓
오프라인 상태에서도 이전에 방문한 페이지 접근 가능
```

---

## PWA의 장점과 한계

### 장점

- **앱스토어 불필요** : 심사 기간 없이 바로 배포
- **업데이트 즉시 반영** : 웹 배포하면 사용자가 다음 방문 시 자동 업데이트
- **기존 코드 재사용** : 웹 코드를 그대로 씁니다. 별도 앱 개발 불필요
- **저렴한 유지비** : 서버 한 개로 웹·모바일 동시 대응
- **검색엔진 노출** : 일반 웹사이트처럼 SEO 적용 가능

### 한계

- **iOS 제한** : Safari는 PWA 기능 일부를 지원 안 합니다 (푸시 알림 제한적, 캐시 용량 제한)
- **앱스토어 검색 불가** : 앱스토어에서 검색되지 않습니다
- **네이티브 기능 제한** : 카메라 고급 제어, 블루투스 등 일부 하드웨어 접근 불가
- **오프라인 완전 지원 어려움** : Firebase 실시간 데이터는 오프라인에서 불가

오늘운처럼 콘텐츠 중심 서비스는 이 한계들이 크게 문제 되지 않습니다.

---

## 테스트 방법

### 로컬에서 테스트 (서비스워커 포함)

```bash
npm run build
npm start
# http://localhost:3000 에서 확인
```

개발 모드(`npm run dev`)에서는 서비스워커가 비활성화됩니다.

### 브라우저 DevTools로 확인

Chrome → F12 → **Application 탭**
- **Manifest** : `manifest.json`이 올바르게 파싱됐는지 확인
- **Service Workers** : 서비스워커가 등록·활성화됐는지 확인
- **Cache Storage** : 어떤 파일이 캐시됐는지 확인

### 모바일에서 설치

- **Android Chrome** : 주소창 오른쪽 메뉴 → "홈 화면에 추가"
- **iOS Safari** : 하단 공유 버튼(□↑) → "홈 화면에 추가"

---

## 앞으로 개선할 수 있는 것들

- ~~**설치 유도 배너** : 직접 만든 "홈 화면에 추가하세요" UI~~ ✅ 구현 완료 (IOSInstallBanner, PWAInstallButton)
- **오프라인 페이지** : 인터넷 없을 때 전용 안내 페이지 표시
- **푸시 알림** : 오늘의 운세 알림 (Android Chrome 지원)
- **앱스토어 등록** : PWA를 Capacitor로 래핑해 앱스토어에 올리기

---

*최초 작성: 2026-06-18 / 업데이트: 2026-06-18 (IOSInstallBanner, PWAInstallButton, Header 추가)*
