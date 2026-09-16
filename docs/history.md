# 📋 개발 일지
---

## 2026-07-21

- 심리테스트 정의를 코드(`src/data/psych`) → **Firestore(`psych_tests`)로 이관** — admin 첫 진입 시 코드 20종 자동 시드(레거시 `settings/psych` 노출·순서·cost·프롬프트 이월), 완전 CRUD화 (`src/lib/psych/tests-store.ts`, `src/types/psych.ts`, `src/app/admin/psych/actions.ts`)
- `/admin/psych`를 **운세 메뉴관리형 테이블로 재작성** (`src/app/admin/psych/page.tsx`) — 정렬 컬럼(아이콘·이름/설명·엔진(=카테고리)·노출·AI·회원등급·⭐크레딧·슬러그)·전체/선택 노출토글·순서변경(드래그+▲▼)·추가/삭제·컬럼 표시설정. 엔진을 카테고리로 매핑
- **엔진별 문항·결과 빌더 신설** (`src/components/admin/PsychContentBuilder.tsx`) — mbti/category/score/ranking + AI(quiz·text)의 문항·선택지·결과·구간·항목·SEO를 add/remove/순서변경으로 편집, 신규 심테는 엔진 선택 시 빈 템플릿 자동 생성 (`getPsychTestContent`·`savePsychTestContent`)
- **심테 기록·통계 페이지 신설** (`src/app/admin/psych/readings`·`stats` + API 2종) — 운세 기록·통계와 대칭. AI 심테(`ai_readings` type `psych-test`) 조회·기간별 집계·심테별 순위 드릴다운 (`src/lib/firebase/psych-readings.ts`), 사이드바 심리 그룹에 메뉴 추가 (`AdminSidebar`)
- **런타임 Firestore 전환** — `/psych`·`/psych/[slug]`·홈 스와이프가 Firestore content로 렌더(`getRuntimePsychTest`·`getVisiblePsychTests` 재구성, `docToPsychTest`), 편집·신규 심테 반영. `revalidate=60` ISR로 재배포 없이 반영(홈 포함)·신규 slug on-demand (`src/lib/psych/settings.ts`, `src/app/(psych)/**`, `src/app/(user)/page.tsx`)
- 비용·프롬프트·노출 런타임 getter를 `psych_tests` 우선으로 전환(레거시 `settings/psych`·코드 폴백), dev 실페이지에서 편집→반영 end-to-end 검증
- 크레딧 실동작 검증 완료 처리(`TODO.md`), 색인 3순위(띠 4종) 완료 체크(`docs/indexing-checklist.md`)

---

## 2026-07-19

- 크레딧 UX 보강 — 별 부족 시 **안내 모달**(프리미엄/로그인 유도, `InsufficientCreditsModal` + `CreditsProvider` 전역 `openInsufficient`), 헤더 ⭐잔량 0이면 강조, 폼 부족 버튼을 "⭐ 별이 부족해요 · 자세히"로 통일(GeneralFortuneForm·AiQuizLayout·TarotInputPhase·CompatibilityBirthForm·TodayFortuneCard의 구 "이미 이용" 문구 정리)
- 로그인 풀림 버그 수정 — `/api/auth/me`·`AuthContext` fetch에 `no-store`(인증 상태 API 캐시로 로그아웃처럼 보이던 문제). `/admin/menus` 리스트에 **⭐크레딧 컬럼** 추가. 소모량 기본값 0/1/2(프리미엄 2·그 외 1·무료 0)로 조정
- admin 심리테스트 **운세형 관리** (`/admin/psych`) — 노출·순서에 더해 **별 소모(cost)·AI 프롬프트 override·문항/결과 미리보기** 편집 모달. 심테별 cost 과금(`usage-check` subKey·`getPsychCost`)·프롬프트 override(`buildPromptFromDB`) 연동, 문항 미리보기(`PsychPreview`, 엔진별)
- admin **3그룹 재편** — 사이드바·홈을 공통(대시보드·회원·AI사용량) / 운세(배치·메뉴관리·기록·통계·프롬프트) / 심리(메뉴관리)로 분리 (`AdminSidebar`·`admin/page.tsx`)
- **운세·심리 완전 분리** — `fortunes.json`에서 심테 카드·카테고리 제거, 운세 메뉴관리·홈 운세 그리드에서 심테 제외. 심테 과금·권한 자립화(cost=`settings/psych`, 권한=회원 전용 고정) → `menus/psych-test` 문서 불필요. 심리 그룹 라벨을 "메뉴 관리"로 통일
- 문서 — admin 관리 방향 조사 보고서(`docs/admin-psych-management.md`), 크레딧 실동작 검증 체크리스트(`docs/credit-verification-checklist.md`)

---

## 2026-07-17

- 심테 `score` 엔진 신설 (`src/lib/psych/engine.ts` `scoreScale`) — 리커트 점수 합산 → 총점 밴드 + 축별 점수. 스트레스 지수(#17, PSS 10문항)·번아웃 위험도(#18, MBI 3축 15문항) 2종 추가, `QuizLayout`에 score 결과 뷰(게이지·축별 바)
- AI 자유텍스트 심테 4종 추가 — 고민 상담(A-1)·감정 일기(A-2)·카톡 호감도(A-3)·성격 분석(A-5). `AiTest`를 `AiQuizTest`(4지선다) \| `AiTextTest`(자유텍스트) 유니온으로 확장(`AiTextField`), `AiQuizLayout`에 텍스트 입력 분기(최소 글자 검증). 기존 `answers` 형식 재사용해 프롬프트 빌더 무변경
- 심테 `ranking` 엔진 + 사막 동물(#72) — 5동물을 소중한 순서대로 탭 → 순위, 1순위(지킴)·꼴찌(포기) 반전 해석. `RankingLayout` 신규, `[slug]` 3-way 분기(ai/ranking/quiz)
- **🎉 카탈로그 MVP 15개 전부 완료** — 심테 총 20종(로직 14 + AI 6), 엔진 4종(mbti·category·score·ranking) + AI 2모드(quiz·text). `docs/psych-tests-catalog.md`·`TODO.md` 갱신

---

## 2026-07-16

- 별(⭐) 크레딧 시스템 신설 — 항목별 "하루 N회"를 권한별 일일 별 지급(회원 10·프리미엄 30·admin 무제한)으로 전환, 운세·AI 심테 공용 소모·항목별 cost 차등·자정 충전. `src/lib/credits/config.ts`, `usage-check.ts` 재작성(`daily_credits` 풀 원자 차감, `daily_usage` 카운트는 순위·통계용 유지), `/api/user/credits`, `CreditsProvider`+헤더 ⭐잔량, 카드·폼 cost 게이팅
- 로직 심테 무료(별 0)·AI만 소모, 재열람 무료·새로 뽑기만 소모(tojeong·life-fortune 캐시 히트 무과금) 정책 반영
- admin 크레딧 설정 (`/admin/menus`) — 권한별 지급량(`settings/credits`) + 메뉴별 소모 별(`MenuItem.cost`) 편집 모달
- admin 심리 테스트 관리 (`/admin/psych`, `settings/psych`) — 노출 on/off·순서 조정, 목록·상세·스와이프가 설정 반영. AI 심테 프롬프트 편집·본문 CRUD는 후속
- category 심테 5종 추가 — 색깔 심리·소비 성향·여행 스타일·친구들이 보는 나·음식으로 보는 성격 (기존 `category` 엔진 재사용, 데이터 파일만 추가)

---

## 2026-07-15

- 심리 테스트를 카탈로그 정본 `(psych)` 구조로 **일원화** — 지난 세션의 `(user)/psych-test` + `src/data/psych-tests/*.ts`(중복 구현) 폐기, 테스트 7종을 `src/data/psych/`로 이관·통합 (`docs/psych-tests-catalog.md` SSOT 준수)
- 로직 엔진에 `category`(4지선다 투표형) 추가 — 기존 MBTI(`mbti`) 엔진과 함께 `QuizLayout`이 engine별 분기, `src/lib/psych/engine.ts` `scoreCategory` 신설. 로직 5종(연애 스타일·동물·직장 빌런·결정·관계)을 이 방식으로 이관
- AI 해석형 2종(에너지·감정)은 `AiQuizLayout`(스트리밍·회원 전용)으로 `(psych)`에 편입, `/psych/[slug]`가 engine으로 로직/AI 분기. 홈 메뉴 카드 path·사이트맵을 `/psych`로 갱신, `buildPsychTestPrompt`를 `@/data/psych`로 연결
- **낮/밤 스와이프 캐러셀** 신설 (`src/components/home/HomeSwipe.tsx`) — 메인에서 좌우 드래그로 운세(밤)↔심테(낮) 전환, 상단 토글·도트 지원 (`PsychHomeBody` 낮 패널 신규, `src/app/(user)/page.tsx`를 캐러셀로 래핑)
- 스와이프 배경을 콘텐츠와 분리된 별도 `fixed` 레이어로 구현하고 콘텐츠 트랙과 같은 x로 이동 — 심테(낮)에서 세로로 스크롤하면 고정 야간 배경이 새어 나오던 문제 해결 (transform 트랙 안의 `fixed`가 뷰포트 기준으로 동작 안 하는 이슈 우회, 왼쪽=투명·오른쪽=불투명 낮 그라데이션)
- 캐러셀 컨테이너 높이를 활성 패널 실제 콘텐츠 높이에 맞춰 동적 지정(`ResizeObserver`) — 짧은 심테 패널이 긴 운세 패널만큼 늘어나던 문제 해결
- 패널별 낮/밤 푸터 — `Footer`에 `variant`(day/night) 추가, 홈에서만 레이아웃 공유 푸터를 숨기는 `FooterGate` 신설(운세=밤·심테=낮 푸터를 각 패널이 자체 노출)
- 심리 테스트 노출 토글 신설 (`src/lib/psych/config.ts` `PSYCH_ENABLED`) — 로컬 dev만 노출·운영 미노출(환경변수 `NEXT_PUBLIC_PSYCH_ENABLED=true`로 운영 노출 가능). 홈 스와이프·심테 메뉴 카드(`src/app/(user)/page.tsx`)·`/psych`·`/psych/[slug]`(`notFound` + `generateStaticParams` 빈 배열)·`FooterGate`·`sitemap.ts`를 이 스위치 하나로 일괄 게이팅 (운영 빌드에서 `/psych/[slug]` 미생성·`/psych` 404 확인)
- 문서 갱신 — `README.md`(심리 테스트 7종·낮/밤 스와이프), `docs/psych-tests-catalog.md`(구현 현황·MVP 상태표·기술 메모를 실구현 기준으로 반영), `TODO.md`(일원화 완료·MVP 체크리스트·운영 노출(런칭) 방법)

---

## 2026-07-14

> ⚠️ 이날 만든 `(user)/psych-test` 경로·`src/data/psych-tests/` 구조는 카탈로그 SSOT와 어긋나, **7/15에 `(psych)` 정본으로 일원화되며 폐기됨**. 아래는 당시 기록.

- 심리 테스트(심테) 카테고리 신설 (TODO 2번) — 기존 운세 인프라(`/api/fortune` 스트리밍·사용량 체크·결과 저장) 재사용, `/psych-test` 목록 + `/psych-test/[slug]` 상세 SSG, 정적 카탈로그(`src/data/psych-tests/`) 구조 설계
- 심테 MVP 4종 신설 — 오늘의 에너지 진단·숨겨진 감정 찾기·결정 스타일·관계 유형 (4지선다 3~5문항 → Claude 스트리밍 해석), 각 테스트 SEO 소개 콘텐츠 3블록 집필 (애드센스 대응)
- `psych-test` 타입·프롬프트 연동 (`src/types/fortune.ts`, `src/lib/claude/prompts.ts` `buildPsychTestPrompt`), 퀴즈 컴포넌트(`src/components/psych/PsychTestQuiz.tsx`, 진행바 + Framer Motion 전환), 홈 메뉴 카드·`psych` 카테고리 추가(`src/data/fortunes.json`), 사이트맵 연동(`src/app/sitemap.ts`)
- Search Console 색인 요청 2순위 진행 — 주요 서비스 페이지 11개(취업·건강·재물운, 연애·사업 궁합, 성명학·수비학·룬·주역·오라클·이사 방위) 완료 처리 (`docs/indexing-checklist.md`)

---

## 2026-07-13

- 꿈해몽 사전 2차 확장 50개 → 100개 (`src/data/dream-dictionary/`) — 동물 15·자연 8·사람관계 9·신체 6·상황행동 7·재물사물 5 추가, 전 페이지 크롤링 텍스트 900자 이상, 사이트맵 228 URL
- Search Console 사이트맵 제출·대표 페이지 색인 요청, "가져올 수 없음" 상태 진단 — 사이트 측 정상(200/application/xml/Googlebot 접근 OK), GSC 제출 직후 표시 문제로 판단, 7/16까지 관찰
- 애드센스 대응 전체 기록 문서 작성 (`docs/google-adsense.md`) — 거절 원인 진단, 조치 내역, 재심사 체크리스트, 검증 방법
- `TODO.md` 정리 — 애드센스 9번(배포+색인)·10번(꿈해몽 확장) 완료 처리, 11번(재심사, 7/27 이후) 현황 갱신
- 전체 코드 리팩토링 7건 (41개 파일, +119/−369줄, 동작 변경 없음)
  - 공유하기 로직 8곳 → `src/lib/utils/share.ts` `shareOrCopyUrl()` 통합
  - BASE_URL 상수 9곳 → `src/lib/utils/site.ts` 통합
  - `HeroCardSettings` 타입 3곳 + 기본값 2곳 → `src/types/hero.ts` 통합
  - 별자리/띠 상세 페이지 공통 로직 → `src/lib/utils/fortune-labels.ts` 상수 + `src/lib/hooks/usePeriodFortune.ts` 훅 (fetch 에러 처리·페이지 전환 잔상 제거 개선 포함)
  - 뒤로가기 pill 링크 인라인 21곳 + `PageHeader` → `src/components/common/BackHomePill.tsx` 통합
  - 길몽/흉몽 뱃지 스타일 2곳 → `src/components/dream/SignBadge.tsx` 통합
  - admin `Period` 타입 4곳 → `src/types/admin.ts` 통합
  - 부수 정리: 미사용 `Home`/`Link`/`ArrowLeft` import 20여 곳 제거

---

## 2026-07-12

- 애드센스 "저가치 콘텐츠" 거절 대응 착수 — 원인 진단: 기술 설정은 정상이나 크롤러가 볼 정적 콘텐츠 부재 (홈 404자, 도구형 페이지 구조, 사이트맵 24 URL)
- 타로 카드 78장 의미 사전 신설 (`/tarot-cards`, `/tarot-cards/[slug]`, SSG) — 카드별 상징 해설·정/역방향 상세·연애/직업/금전운·조언 전량 신규 집필 (`src/data/tarot-card-content/`), 메타데이터·JSON-LD·내부 링크 포함
- 꿈해몽 사전 1차 50개 신설 (`/dream-dictionary`, `/dream-dictionary/[slug]`, SSG) — 6개 카테고리, 전통 해몽 + 심리학 해석 + 상황별 풀이 4종 + 길몽/흉몽 표기 (`src/data/dream-dictionary/`)
- 별자리 12궁·띠 12지 상세 페이지 보강 — 성격·연애·직업(·띠 궁합) 서술형 해설 (`src/data/zodiac-content.ts`, `src/data/chinese-zodiac-content.ts`), 서버 `layout.tsx` 추가로 `generateMetadata` + SSG 전환
- 홈 화면 콘텐츠 보강 — 운세 사전 링크 카드 + 서비스 소개 텍스트 (크롤링 텍스트 404자 → 1,052자)
- 콘텐츠 없는 홈 화면의 `AdSlot` 제거 (애드센스 정책 대응), 사이트맵 24 → 178 URL 확장
- PR #21 머지·배포, 라이브 검증 (대표 URL 200, 본문 텍스트 서빙 확인)

---

## 2026-06-26

- 인증 상태 즉시 반영 버그 수정 (`src/contexts/AuthContext.tsx`, `src/app/auth/complete/page.tsx`) — 관리자 로그인 후 서비스 페이지 이동 시 헤더에 로그인/회원가입이 잠깐 보이는 문제 해결; `AuthContext`에 `refreshAuth` 콜백 추가, 로그인 완료 직후 auth 상태 즉시 재조회
- 헤더 모바일 회원가입 버튼 숨김 (`src/components/Header.tsx`) — 모바일 sm 미만에서 회원가입 링크 `hidden sm:block` 처리 (로그인 페이지에서 가입 가능)
- 생년월일 저장 버튼 → 슬라이드 토글로 전환 — 기존 조건부 표시 버튼 제거, 로그인+자신 정보 모드일 때 항상 표시되는 ON/OFF 토글 스위치로 교체; 저장된 정보 있으면 ON 상태, 토글 OFF 시 저장 해제 (`saju/page.tsx`, `GeneralFortuneForm.tsx`, `life-fortune`, `moving-fortune`, `tojeong`, `numerology` 6개 페이지 동일 패턴 적용)
- 배경 하단 검은 영역 버그 수정 (`src/components/TimeBackground.tsx`) — 콘텐츠가 100vh를 초과할 때 `min-h-screen` div 밖으로 넘쳐 body 배경(검은색)이 노출되던 문제; 배경색 div를 `fixed inset-0 z-0`으로 분리해 스크롤/높이와 무관하게 항상 뷰포트를 채우도록 변경, `document.body.style.backgroundColor` JS 조작 전부 제거
- `globals.css` body 배경 원복 — 강제로 넣었던 `background: #06000d` → `background: var(--background)` 원복
- 별·구름 배치 범위 확장 (`src/components/SkyLayer.tsx`) — 별 y좌표 최대 72% → 95%, 구름 top 최대 54% → 84%로 확장해 화면 하단까지 sky 요소가 분포하도록 수정

---

## 2026-06-24

- 운세 결과 공유하기 버튼 추가 — `navigator.share({ title, text, url })` 적용, 미지원 브라우저는 URL 클립보드 복사 fallback; `FortuneResult.tsx`, `TarotReadingResult.tsx`, `saju`, `zodiac/[sign]`, `chinese-zodiac/[animal]`, `tarot-daily` 페이지에 공유 버튼 추가
- 재방문 시 오늘 운세 결과 자동 노출 — 33개 전 운세 메뉴 대상으로, 오늘 이미 해석을 받은 경우 해당 페이지 재방문 시 이전 결과 표시
  - `src/app/api/user/fortune-status/route.ts` 수정 — `exhausted` 여부와 무관하게 `used > 0`이면 `ai_readings` Firestore 조회, 별도 try-catch로 쿼리 실패 시 전체 응답 유지
  - `TodayFortuneCard.tsx` 개선 — 공유 버튼·"새로 해석받기" 버튼 포함, `exhausted` prop으로 소진 메시지 표시
  - `TarotTodayResult.tsx` / `TarotActionButtons.tsx` 재작성 — 소진 시 "오늘 해석을 이미 이용했어요" amber 안내, `onReshuffle` prop 추가
  - 타로 스프레드 6개 페이지(`tarot-3cards`, `tarot-celtic`, `tarot-horseshoe`, `tarot-full-moon`, `tarot-tree-of-life`) — `useTarotSpread` menuId 불일치 버그 수정 (`"tarot"` → `"tarot-3cards"` 등), `fortuneStatus?.todayReading` 조건으로 변경
  - `GeneralFortuneForm.tsx` / `CompatibilityBirthForm.tsx` — `showForm` 상태 추가, todayReading 표시 후 "새로 해석받기" 버튼으로 폼 전환 가능
  - `saju/page.tsx` — `exhausted && todayReading` → `todayReading` 조건 수정, `TodayFortuneCard`에 `exhausted` / `onNewReading` prop 연결
  - 8개 커스텀 페이지(`numerology`, `name-fortune`, `moving-fortune`, `rune`, `name-compatibility`, `zodiac-compatibility`, `iching`, `yuk-hyo`) — 동일 조건 수정; 인라인 HTML 표시 5개(`rune`, `name-compatibility`, `zodiac-compatibility`, `iching`, `yuk-hyo`)는 `TodayFortuneCard`로 교체
  - `sangaji/page.tsx` / `sangaji-new/page.tsx` — idle 단계에서 `fortuneStatus.todayReading` 있으면 `TodayFortuneCard` 노출
  - `DreamForm.tsx` — `useFortuneStatus("dream")` + `TodayFortuneCard` + `showForm` 상태 추가
- Naver 로그인 콜백 버그 수정 (`src/app/api/auth/naver/callback/route.ts`)

---

## 2026-06-23

- 디자인 시스템 정립 (`docs/reflect-notes-style.md` 신규 생성) — "Reflect Notes" 스타일 가이드 문서화, 어두운 천문대 테마 컬러 토큰·타이포그래피·그림자·border-radius 토큰 정의
- `src/app/globals.css` CSS 변수 확장 — Extended palette 변수(fog, steel, iris, mercury, dusk), 그라데이션(cosmic/aurora), inset rim-light 그림자 변수, border-radius 변수(btn 5px, card 16px, badge 32px) 추가; drop shadow 전부 제거 → inset 방식으로 통일
- `FortuneGrid.tsx` 카드 UI 개선 — 16가지 그라데이션 팔레트 + djb2 해시(`cardColor()`)로 카드별 고유 배경 오버레이 적용, 카드 `rounded-xl` → `rounded-2xl`, hover 효과 drop shadow → inset shadow
- `HeroCard.tsx` 럭키 정보 개선 — 럭키 번호·색상·방향·키워드를 날짜 단독 seed → 날짜+uid 조합(`hashUserDate()`) 기반으로 변경해 사용자별 다른 값 생성, 비로그인 사용자 localStorage `anon-id` 자동 발급
- 전체 border-radius 통일 — 다수 컴포넌트(`Header`, `Footer`, `LoginRequiredModal`, `TarotActionButtons` 등 30+파일)에서 `rounded-full` → `rounded-[5px]`(버튼) / `rounded-[32px]`(뱃지) 디자인 토큰에 맞게 일괄 적용

---

## 2026-06-20

- 500 에러 처리 개선 — AI 호출 실패 시 `daily_usage` 카운트 롤백 (`src/lib/usage-check.ts`에 `rollback` 함수 반환, `src/lib/gemini/stream-response.ts`에서 `onRollback` 호출), `FortuneResult.tsx`에 `error` prop 추가해 ⚠️ 전용 에러 화면 표시, `GeneralFortuneForm` / `DreamForm` / `CompatibilityBirthForm`에 에러 상태 연결
- 오늘 인기 운세 순위 섹션 추가 — `src/lib/firebase/daily-rank.ts` 신규 생성 (`daily_usage` 컬렉션 날짜 기준 집계, 1시간 캐시), `PopularSection.tsx` UI 전면 개편 (1~5위 순위 뱃지·배경 바·이용 수 표시), 실시간 데이터 없을 시 `fortunes.json` popular 항목으로 폴백
- 즐겨찾기 메뉴 설정 구현 — `src/app/api/user/favorites/route.ts` 신규 생성 (GET/POST/DELETE, 최대 8개, Firestore `arrayUnion`/`arrayRemove`), `FortuneGrid.tsx` 카드 좌상단 ☆ 버튼 추가 (로그인 유저만, 낙관적 업데이트), `FavoritesSection.tsx` 신규 생성 (홈 상단 즐겨찾기 슬롯), `HomeInteractive.tsx` 신규 생성 (즐겨찾기 상태 공유 Client wrapper)
---

## 2026-06-19

- Google AdSense 정책 위반 수정 — `src/app/layout.tsx`에서 AdSense `<Script>` 제거, `src/app/(user)/layout.tsx`로 이동하여 운세 콘텐츠 페이지에서만 광고 실행 (로그인·관리자·인증 페이지 광고 제거)
- `src/components/home/AboutSection.tsx` 신규 생성 — 오늘운 서비스 소개(별자리·타로·사주·꿈해몽·주역·기타 6종 상세 설명), 자주 묻는 질문 4개 포함
- 홈 페이지(`src/app/(user)/page.tsx`) 하단에 `AboutSection` 추가 — 구글 "가치가 별로 없는 콘텐츠" 위반 대응
- 별자리 목록 페이지(`src/app/(user)/zodiac/page.tsx`) 하단에 점성술 역사·4원소(불/흙/바람/물) 설명 섹션 추가
- 별자리 상세 페이지(`src/app/(user)/zodiac/[sign]/page.tsx`) 하단에 강점·약점·주요 특성·행운의 색·궁합 별자리 정적 데이터 섹션 추가
- 타로 원카드 페이지(`src/app/(user)/tarot-daily/page.tsx`) 하단에 타로 역사·메이저/마이너 아르카나 설명 섹션 추가
- `PWAInstallButton.tsx` iOS 가이드 팝오버 위치 버그 수정 — `absolute right-0` → `fixed` + `getBoundingClientRect()` 계산으로 변경, 뷰포트 좌우 12px 여백 클램핑으로 화면 잘림 해결, 꼬리 위치 버튼 중심 기준 동적 계산
- 육효점 추가 (`src/app/(user)/yuk-hyo/page.tsx`) — 본괘·지괘(변효 시스템) 6효 동전 던지기 UI, 효별 색상 표시, 변효 위치 강조, 심층 풀이 연동
- UI 전면 개편 Phase A/B/C — `TimeBackground.tsx`(시간대별 배경 그라데이션), `OracleHeader.tsx`(오라클 메시지 로테이션), `QuickMenu.tsx`(빠른 메뉴), `HeroCard.tsx` 모바일 개선 등 홈 UI 다수 파일 정비
- 관리자 AI 프롬프트 편집기 구현 (`src/app/admin/prompts/`) — 20가지 운세 프롬프트 템플릿을 Firestore `ai_prompts/{type}`에 저장·수정·초기화, `{{변수}}` 플레이스홀더 지원, 5분 인메모리 캐시, 변수 칩 클릭으로 편집기에 삽입
  - `src/lib/claude/promptTemplates.ts` 신규 생성 — 20종 운세의 `defaultTemplate`, `labelKo`, `vars` 메타데이터 정의
  - `src/lib/claude/promptStore.ts` 신규 생성 — Firestore 읽기/쓰기/초기화/일괄 시드 + `buildPromptFromDB()` (DB 템플릿 우선, fallback 하드코딩)
  - `src/app/api/fortune/route.ts` 수정 — `buildPrompt()` → `buildPromptFromDB()` 교체
  - `src/app/admin/prompts/PromptsEditor.tsx` 신규 생성 — 아코디언 편집기 UI, 저장/초기화/전체 시드 버튼
- AI 브랜딩 문구 사용자 노출 제거 — 18개 파일에서 "AI" 뱃지·버튼·레이블을 `✦` 심볼 및 "풀이"/"심층 풀이"/"풍수 분석" 등 중립 용어로 교체 (`AILoadingIndicator`, `PageHeader`, `TarotActionButtons`, `FortuneGrid`, `HeroCard`, `PopularSection` 등)
- 메인 운세 카드 사용 횟수 표시 (`src/app/(user)/FortuneGrid.tsx`) — 로그인 사용자에게 카드마다 `N/N회 사용하기` 표시, 한도 소진 시 카드 dim + `오늘완료` 뱃지
  - `src/app/api/user/fortune-status-bulk/route.ts` 신규 생성 — 활성 운세 전체 menuId를 한 번에 Firestore 조회해 `{used, limit, exhausted}` 맵 반환 (개별 N회 API 호출 대신 1회 bulk)
- `card-glow` / `card-mini` 테두리 추가 (`src/app/globals.css`) — `border: 1px solid rgba(255,255,255,0.08)` 추가로 다크 배경과 카드 경계 구분 개선
- 파비콘 수정 (`src/app/layout.tsx`) — `metadata.icons`에 `icon` (SVG + PNG) 및 `shortcut` 명시적 등록, 브라우저 탭 파비콘 미표시 문제 해결
- 푸터 GitHub 링크 추가 (`src/components/Footer.tsx`) — 이용약관·개인정보·문의하기 링크 행에 GitHub 저장소 링크 추가
- README 버전별 적용 내역 테이블 추가 (`README.md`) — v0.1(2026-05-02) ~ v0.9(2026-06-19) 9버전 이력, 라이브 링크 강조
- TODO.md 생성 및 `/todo` 스킬 추가 — 프로젝트 작업 백로그 파일(`TODO.md`) 신규 생성, Claude가 항목 추가·완료처리·수정을 수행하는 `/todo` 슬래시 커맨드 스킬 등록 (`.claude/commands/todo.md`)

---

## 2026-06-18

- PWA 도입 — `public/manifest.json`, `public/sw.js`, `public/icons/` (192×512px) 추가, 오프라인 캐시 전략 적용 (API/Firebase 제외, 정적 파일·페이지 캐시)
- `src/app/layout.tsx` PWA 설정 추가 — `manifest`, `appleWebApp`(iOS 홈 화면 지원), `icons.apple`, `viewport.themeColor` 메타 반영
- `src/components/common/IOSInstallBanner.tsx` 신규 생성 — iOS Safari 전용 하단 설치 안내 배너, 조건부 표시 (iOS + non-standalone + 세션 미해제), 닫기 시 `sessionStorage` 기록
- `src/components/common/PWAInstallButton.tsx` 신규 생성 — 헤더용 다운로드 버튼, Android(`beforeinstallprompt`)·iOS(팝오버 가이드) 분기, standalone 모드 자동 숨김
- `src/components/Header.tsx` 수정 — 로그인·비로그인 상태 모두에 `PWAInstallButton` 배치
- `docs/pwa-guide.md` 작성 — PWA 도입 배경, 구현 파일 8개 상세 설명, 동작 흐름도, 장단점, 테스트 방법 포함
- `src/app/layout.tsx` PWA 설정 추가 — `manifest`, `appleWebApp`(iOS Safari 홈 화면 추가 지원), `icons.apple`, `viewport.themeColor`, `mobile-web-app-capable` 메타 반영
- `src/components/common/IOSInstallBanner.tsx` 신규 생성 — iOS Safari 전용 하단 설치 안내 배너, 조건부 표시(iOS 기기 + non-standalone + 세션 미해제), 닫기 시 `sessionStorage` 기록
- `src/components/common/PWAInstallButton.tsx` 신규 생성 — 헤더용 다운로드 버튼, Android(`beforeinstallprompt` 이벤트 캡처)·iOS(팝오버 가이드) 분기 처리, standalone 모드 시 자동 숨김
- `src/components/Header.tsx` 수정 — 로그인·비로그인 상태 모두에 `PWAInstallButton` 배치
- `docs/pwa-guide.md` 작성 — PWA 도입 배경, 구현 파일 8개 상세 설명(manifest·sw.js·icons·PWARegister·layout·IOSInstallBanner·PWAInstallButton·Header), 동작 흐름도, 장단점, 테스트 방법 포함

---

## 2026-06-17

- 산가지 씬 실험 — Three.js 3D(`SangajiScene3D.tsx`), 이미지 CSS 방식(`SangajiImageScene.tsx`), Canvas 이미지 방식(`SangajiStickScene.tsx`) 세 가지 구현 시도
- `SangajiStickScene.tsx` 신규 생성 — `sangaji-stick.png` 실제 이미지 50개를 Canvas API로 개별 렌더링, 흰 배경 픽셀 제거(brightness+saturation 임계값), 막대별 독립 흔들기 애니메이션(5단계 setTimeout pulse), 캔버스 클릭 기반 단일 막대 선택 구현
- 산가지 이미지 추가 (`public/sangaji.jpeg`, `public/sangaji-stick.png`, `public/sangaji-sticks.png`)
- `/sangaji` 라우트 원상복구 — 기존 CSS 기반 산가지 페이지 유지, 캔버스 실험 버전은 `/sangaji-new`로 분리 (`src/app/(user)/sangaji-new/page.tsx`)

---

## 2026-06-14

- 전체 코드 리팩토링 — 타로 5개 페이지 공통 UI 컴포넌트 추출 (`src/components/tarot/`)
  - `TarotInputPhase.tsx` 신규 생성 — 질문 입력 + 카드 섞기 버튼 (subtitle·placeholder props로 주입)
  - `TarotSpreadHeader.tsx` 신규 생성 — "카드 N장 선택" 헤더 + 다시 섞기 버튼 + 카운터
  - `TarotCardSlot.tsx` 신규 생성 — 빈/채워진 카드 슬롯 (AnimatePresence 포함, label 선택)
  - `TarotConfirmButton.tsx` 신규 생성 — "선택 완료" 애니메이션 버튼
  - `TarotActionButtons.tsx` 신규 생성 — "✨ AI 해석 받기" + "다시" 버튼 쌍
  - 타로 5개 페이지(`tarot-3cards`, `tarot-celtic`, `tarot-full-moon`, `tarot-horseshoe`, `tarot-tree-of-life`) 전면 교체 적용, 약 300줄 중복 제거
- Admin 페이지 공통 UI 컴포넌트 추출 (`src/components/admin/`)
  - `AdminStatCards.tsx` 신규 생성 — `{ label, value }` 배열 주입형 통계 카드 그리드
  - `AdminTableSkeleton.tsx` 신규 생성 — rows·cols 파라미터화된 테이블 로딩 스켈레톤
  - `admin/readings/page.tsx`, `admin/users/page.tsx` 두 페이지에 적용
- `TodayFortuneCard` 컴포넌트 추출 (`src/components/common/TodayFortuneCard.tsx`) — 사용량 소진 시 "오늘의 결과" 섹션을 `label`·`highlightColor` props로 파라미터화, `GeneralFortuneForm`·`numerology`·`moving-fortune`·`name-fortune` 4곳 통합
- `boldHighlight()` 유틸 함수 추가 (`src/lib/utils/format.ts`) — `**text**` → `<strong class="{color}">` 변환 regex를 함수로 추출, 5개 파일의 인라인 regex 제거 (`saju`, `numerology`, `moving-fortune`, `name-fortune`, `GeneralFortuneForm`)

---

## 2026-06-12

- Hero 운세 seed 버그 2종 수정 (`src/app/api/user/daily-hero/route.ts`) — ① `uidDateSeed` djb2 해시의 연속 날짜 seed+1 문제 → splitmix32 finalizer 추가로 avalanche 효과 적용, ② `lcg(seed+k)` 방식 별점 계산 시 k=1,2,3이 LCG step 0.0004 차이로 동일값 출력 → `subRand(seed, slot)` 독립 해시 함수로 교체
- Hero 운세 점수 분포 개선 — 범위 60~95 균등 → 60~100 가중 분포 (80점대 23%로 집중, 100점 1%), `weightedScore()` 함수 신규
- Hero 별점 분포 개선 — 균등(20%) → 3·4★ 28%, 2★ 20%, 5★ 16%, 1★ 8% 가중 분포, `weightedStar()` 함수 신규
- Hero 운세 메시지 12개 → 100개 확장 + 월별 중복 방지 — Fisher-Yates 셔플 기반 `monthlyMsgIndex()` 도입, uid+YYYYMM 시드로 매월 순열 생성 → 한 달 30일 내 중복 0건 보장
- 로그아웃 후 Hero 이전 로그인 데이터 잔존 버그 수정 (`src/components/Header.tsx`) — `router.push("/")` 클라이언트 이동 시 HeroCard 언마운트 없이 state 유지되는 문제 → `window.location.href = "/"` 풀 리로드로 교체, 미사용 `useRouter` 제거
- HeroCard 생년월일 등록 버튼 딥링크 연동 (`src/components/home/HeroCard.tsx`, `src/app/(user)/mypage/page.tsx`) — 링크 `/mypage` → `/mypage?focus=birth` 변경, mypage에서 `focus=birth` 쿼리 감지 시 출생정보 섹션 자동 스크롤·편집 모드 오픈·보라색 glow 하이라이트 2초 표시
- `auth/complete` 로딩 UI 개선 (`src/app/auth/complete/page.tsx`) — 수정구 이모지 `🔮 animate-spin` → `loading.svg` (w-40 h-40, SVG 자체 애니메이션 사용)
- lucide-react 도입 및 전체 UI 텍스트 심볼 아이콘 교체 — `←` → `ArrowLeft`, `→` → `ArrowRight`, `▼` → `ChevronDown`, `→` 리스트 항목 → `ChevronRight`, `✏️` → `Pencil`, `▶` 토글 → `ChevronRight` (13개 파일 전면 적용)
- `mypage` 빌드 오류 수정 (`src/app/(user)/mypage/page.tsx`) — `useSearchParams` 사용 시 Suspense 래핑 필요 → `MyPageInner` 분리 후 `<Suspense>` 감싸기
- 카카오 로그인 활성화 (`src/app/(auth)/login/page.tsx`) — `disabled` 제거, `handleKakao()` 핸들러 연결, `.env.local` 및 `.env.prd`에 `KAKAO_CLIENT_ID` / `KAKAO_CLIENT_SECRET` 추가
- 네이버 로그인 활성화 — `handleNaver()` 핸들러 연결, `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` 환경변수 추가, 네이버 개발자 센터 OAuth 앱 등록 및 Redirect URI 설정
- `.env.prd` 신규 생성 — 로컬(`.env.local`)과 운영(`.env.prd`) 환경변수 파일 분리, 두 파일의 유일한 차이는 `NEXT_PUBLIC_BASE_URL` (localhost vs todays-vibe.com)
- Hero 운세 카드 상태별 UI 개선 — ① 생년월일 미등록(`no_birth_info`) 시 점수·메시지·별점 블러 처리로 통일, ② 생년월일 있어도 AI 실패 시 `state: "no_birth_info"` 반환하던 버그 → `"ready"` 로 수정, ③ 메인 타이틀 `text-4xl` → `text-2xl sm:text-4xl` 모바일 줄바꿈 수정, ④ HeroCard 패딩/간격 반응형 조정
- 비밀번호 찾기 기능 구현 (`src/lib/firebase/auth.ts`, `src/app/(auth)/login/page.tsx`) — `sendPasswordReset()` 함수 추가, 로그인 폼 하단 "비밀번호를 잊으셨나요?" 링크 → 이메일 입력 → Firebase 재설정 메일 발송 → 성공/실패 피드백 UI

---

## 2026-06-11

- `admin/menus` 초기 로드 버그 수정 (`src/app/admin/menus/page.tsx`) — `Promise.all` → `Promise.allSettled`로 변경, 개별 서버 액션 실패 시 전체 로드 중단 방지
- admin AI 사용량 관리 페이지 구현 (`src/app/admin/ai-usage/page.tsx`) — 기간 필터(오늘/7일/30일), 요약 카드, StatBar/TokenBar 시각화 컴포넌트, 기능별 한도 편집 모달, 유저별 상세 펼침(요청 수·토큰 입력/출력 분리 바)
- AI 사용량 API 신규 생성 (`src/app/api/admin/ai-usage/route.ts`) — `daily_usage` + `token_usage` 병렬 집계, 유저별 토큰 합산, 메뉴 한도 PATCH 저장
- Gemini 토큰 자동 추적 (`src/lib/gemini/stream-response.ts`, `src/lib/firebase/token-usage.ts`) — 스트림 완료 시 `usageMetadata`에서 입력/출력 토큰 캡처, `token_usage` Firestore 컬렉션에 원자적 누적 저장
- GCP Cloud Monitoring 연동 (`src/lib/gcp/monitoring.ts`, `src/app/api/admin/gcp-usage/route.ts`) — Firebase 서비스 계정으로 Monitoring API 인증, Gemini 메트릭 후보 순차 시도, 미발견 시 실제 사용 가능 메트릭 목록 안내

---

## 2026-06-10

- 산가지 점 페이지 구현 (`src/app/(user)/sangaji/page.tsx`) — 50개 산가지 Framer Motion 개별 스틱 애니메이션, 2단계(흔들기→뽑기) 플로우, 상하 움직임 + 통 경계 벗어남 방지, 흔들 때마다 다른 배열(layoutOffsets 상태), 마우스 hover 스틱 들림 + 클릭 뽑기 UI, AI 해석 스트리밍 연동
- `src/data/sangaji.ts` 신규 생성 — 50가지 산가지 데이터(no, grade, title, description), GRADE_INFO 색상 맵, drawSangaji() 랜덤 추출 함수
- `src/lib/claude/prompts.ts` — `buildSangajiPrompt()` 추가
- `src/types/fortune.ts`, `src/lib/firebase/readings.ts` — `"sangaji"` 타입 추가
- `src/data/fortunes.json` — sangaji, iching, moving-fortune `ready: true` 활성화
- `README.md` 메뉴 목록 업데이트 — 완료 24종 → 27종, 주역 괘·산가지 점·이사/방위 길흉 ✅ 처리, 준비 중 9종 → 6종

---

## 2026-06-09

- `src/lib/gemini/stream-response.ts` 스트림 에러 처리 수정 — `controller.error(err)` → `controller.close()`로 변경, 룬 문자 페이지 `ERR_INCOMPLETE_CHUNKED_ENCODING` 오류 해결
- 공유 취소 시 `AbortError` 콘솔 에러 무시 (`src/components/fortune/FortuneResult.tsx`) — Web Share API 다이얼로그 닫을 때 발생하던 에러 무시 처리
- 생일 숫자 운세(수비학) 페이지 추가 (`src/app/(user)/numerology/page.tsx`) — 생년월일 입력, 클라이언트 사이드 생명경로 수 계산, 숫자별 색상 원형 UI, AI 해석 스트리밍
- 궁합 4종 추가 — 연애 궁합(`love-compatibility`), 이름 궁합(`name-compatibility`), 띠 궁합(`zodiac-compatibility`), 사업 파트너 궁합(`business-compatibility`), `CompatibilityBirthForm.tsx` 공용 컴포넌트 생성
- 오라클 카드 페이지 추가 (`src/app/(user)/oracle/page.tsx`) — AI 없이 정적 30장 카드 덱, Framer Motion 플립 애니메이션, 확언·메시지 표시
- 룬 문자 페이지 추가 (`src/app/(user)/rune/page.tsx`) — Elder Futhark 24룬 데이터(`src/data/runes.ts`), 3장 랜덤 뽑기, AI 해석 스트리밍
- 성명학 페이지 추가 (`src/app/(user)/name-fortune/page.tsx`) — 이름 입력, 생년월일 선택(토글), 저장된 생년월일 자동 불러오기
- `fortunes.json` ready 상태 업데이트 — 신규 8개 운세 `ready: true` 처리
- Vercel 환경변수 누락으로 인한 Google/GitHub OAuth 로그인 실패 수정 — `NEXT_PUBLIC_BASE_URL` 미설정으로 redirect_uri_mismatch 발생, Vercel에 환경변수 추가 가이드
- GitHub OAuth 콜백 이메일 조회 버그 수정 (`src/app/api/auth/github/callback/route.ts`) — `/user/emails` API 에러 응답을 배열로 잘못 처리하던 문제, `Array.isArray` 체크 추가
- Google/GitHub OAuth 로그인 시 Firebase Auth 프로필 미저장 문제 수정 — `upsertOAuthUser()` 추가(`src/lib/firebase/admin.ts`), 콜백에서 이메일·닉네임·프로필사진 Firebase Auth에 저장
- 마이페이지 소셜 로그인 provider 뱃지 표시 수정 (`src/app/(user)/mypage/page.tsx`) — Custom Token 로그인은 `providerData`가 비어 뱃지 미표시 문제, UID prefix(`google:`, `github:`)로 provider 추론
- 로그인 버튼 로딩 상태를 텍스트("로그인 중...")에서 `loading.svg` 애니메이션으로 교체 (`src/app/(auth)/login/page.tsx`)
- Google OAuth 콜백 디버그 코드 제거 및 에러 메시지 정리 (`src/app/api/auth/google/callback/route.ts`)
- Google AdSense 연동 — `layout.tsx`에 AdSense 스크립트 삽입, `public/ads.txt` 추가 (게시자 ID: ca-pub-2343737818437914)
- 커스텀 도메인 `todays-vibe.com` 연결 — Cloudflare DNS + Vercel 도메인 설정

---

## 2026-06-08

- 공용 AI 로딩 컴포넌트 추가 (`src/components/common/AILoadingIndicator.tsx`) — 운세 타입별 메시지 로테이션(2.5초 간격 페이드), 보라색 3-dot 바운스 애니메이션, 사주·타로·꿈해몽 전 페이지에 동일 로딩 화면 적용
- 메인 화면 준비중 항목 필터 추가 (`src/app/(user)/FortuneGrid.tsx`) — 토글 버튼으로 `ready: false` 항목 노출/숨김, 빈 카테고리 자동 숨김
- 브랜드 에셋 정리 및 적용 — `public/brand/` 디렉토리 신규 생성, logo/favicon/appicon 이동, Next.js 기본 SVG 삭제, 헤더 로고 이미지 교체(emoji → `logo.svg`), 브라우저 탭 아이콘 `src/app/icon.png` 등록
- 폰트 변경 (`src/app/layout.tsx`, `src/app/globals.css`) — Geist → Noto Sans KR(한글) + Roboto(영문) 적용, Google Fonts `next/font` 연동
- `logo.svg` 텍스트 색상 수정 — 어두운 배경에서 보이도록 `#15204A` → 흰색, `Today's Vibe` → 연보라(`#C4B5FD`), 폰트 사이즈 및 y 위치 조정
- 푸터 추가 (`src/components/Footer.tsx`) — 접힘/펼침 토글 구조, 면책조항·이용약관·개인정보처리방침·문의하기 포함
- 이용약관·개인정보처리방침 팝업 모달 (`src/components/common/LegalModal.tsx`) — 모바일 하단 시트 / PC 가운데 팝업, ESC 및 배경 클릭 닫기 지원

---

## 2026-06-06 ~ 2026-06-07

- 사주 페이지 오늘 사용량 소진 시 버튼 비활성화 + 결과 표시 기능 완성 (`src/app/(user)/saju/page.tsx`) — `fortune-status` API 연동, 제출 버튼 `cursor-not-allowed` 비활성화, 오늘의 사주 결과 섹션 표시, finally 블록에서 상태 갱신
- 타로 5개 페이지에 오늘 사용 현황 패턴 동일 적용 (`tarot`, `tarot-celtic`, `tarot-full-moon`, `tarot-horseshoe`, `tarot-tree-of-life`) — 섞기 버튼 비활성화, `TarotTodayResult` 컴포넌트로 오늘 결과 표시
- **전체 코드 리팩토링 — 높은 우선순위**
  - `src/lib/utils/date.ts` 신규 생성 — `todayKST()` 중앙화, 5개 파일의 중복 인라인 정의 제거
  - `src/lib/gemini/stream-response.ts` 신규 생성 — `createFortuneStreamResponse()` 스트리밍 boilerplate 추출, 7개 fortune API 라우트에 일괄 적용
  - `src/types/fortune.ts` — `FortuneStatus` 인터페이스 추가, 6개 페이지의 인라인 타입 정의 제거
- **전체 코드 리팩토링 — 중간 우선순위**
  - `src/lib/hooks/useTarotSpread.ts` 신규 생성 — 5개 타로 페이지의 공통 상태·로직 훅으로 추출 (phase, spreadCards, fortuneStatus, interpret 등)
  - `src/components/tarot/TarotFanSpread.tsx`, `TarotShufflingAnimation.tsx`, `TarotReadingResult.tsx`, `TarotTodayResult.tsx` 신규 생성 — 반복 UI 컴포넌트화
  - 타로 5개 페이지 전면 재작성 — 각 400~500줄 → 150~260줄로 축소, 훅·공통 컴포넌트 사용
- **전체 코드 리팩토링 — 낮은 우선순위**
  - `src/lib/utils/date.ts` — `kstNow(): Date`, `kstDateOffset(daysAgo): string` 함수 추가
  - 어드민/크론 라우트 3종 (`admin/users/[uid]`, `admin/stats`, `cron/fortune/force`) — 인라인 KST 날짜 계산 제거, 공유 유틸 사용으로 통일
  - `src/components/common/FortuneCard.tsx`, `LuckyBadge.tsx` 신규 생성 — `zodiac/[sign]`, `chinese-zodiac/[animal]` 두 페이지에 중복된 서브 컴포넌트 추출
  - `src/lib/hooks/useFortuneStatus.ts` 신규 생성 — fortune-status fetch 패턴 훅으로 추출, `saju/page.tsx`에 적용
- `/refactor` 커스텀 스킬 저장 (`.claude/commands/refactor.md`) — 코드 탐색 → 우선순위 분류 → 단계별 리팩토링 실행 워크플로우

---
## 2026-06-05

- 어드민 회원 관리 페이지 전면 개편 (`src/app/admin/users/page.tsx`) — 상단 통계 카드 고정(검색/필터와 무관), 검색 결과 건수 "N건 / 전체 M건" 표시, 컬럼 정렬 3단계(내림차순→오름차순→해제), 플랜 필터에 admin 추가, 가입 경로(provider) 필터 추가
- 플랜 관리 기능 추가 (`src/app/api/admin/plans/route.ts`) — 커스텀 플랜 CRUD API, 플랜 생성 팝업(이름·ID·설명·할당 계정) 구현
- 회원 상세 드로어 구현 (`src/app/admin/users/UserDetailDrawer.tsx`, `src/app/api/admin/users/[uid]/route.ts`) — 우측 슬라이드 패널, 프로필 카드, 이용 히스토리 탭(최근 50건), 오늘 사용량 탭
- `admins` Firestore 컬렉션 제거 → `users.plan === "admin"` 단일 소스로 통합 — 플랜 변경 시 Firestore 즉시 반영, 로그인 시 plan 값 그대로 세션에 유지
- provider 감지 로직 강화 (`src/app/api/auth/session/route.ts`) — UID 프리픽스(`kakao:`, `naver:`, `google:`, `github:`) 및 `sign_in_provider` 필드 기반 자동 감지, 신규 로그인마다 Firestore에 업데이트
- `scripts/migrate-provider.mjs` 신규 생성 — 기존 회원 `provider` 필드 일괄 마이그레이션 (Firebase Auth `getUsers` 100명 배치)
- `scripts/add-admin.mjs` 신규 생성 — 이메일로 `users.plan = "admin"` 설정하는 관리자 지정 스크립트
- `src/types/user.ts` 타입 확장 — `UserProvider`, `BuiltinPlan`, `PlanConfig`, `AllStats` 추가, `UserPlan`을 `string`으로 확장
- Google/GitHub 소셜 로그인을 서버사이드 OAuth로 전환 (`src/app/api/auth/google/`, `src/app/api/auth/github/`) — popup/redirect 방식 모두 Vercel 환경에서 동작 불가, Kakao/Naver와 동일한 Authorization Code Flow + Firebase Custom Token 방식으로 변경

## 2026-06-04

- 어드민 사용 통계 페이지 실데이터 연동 (`src/app/admin/stats/page.tsx`, `src/app/api/admin/stats/route.ts`) — `daily_usage` 기간별 집계, 통계 카드 4종(총 이용 횟수·인기 운세·총 가입자·신규 가입), 일별 바 차트(CSS, 호버 툴팁)
- 운세별 이용 순위 드릴다운 구현 — 테이블 행 클릭 시 해당 메뉴의 기간 내 총 이용·이용 유저 수·일별 추이 미니 차트 인라인 펼침
- 커스텀 날짜 범위 필터 추가 — 시작일~종료일 직접 입력, 기간 버튼과 독립 동작, 역방향 입력 방지

---

## 2026-06-02

- Firestore `undefined` 저장 오류 수정 (`src/lib/firebase/readings.ts`) — `saveAiReading()` 신규 생성, `input` 객체에서 `undefined` 필드를 `cleanInput`으로 필터링 후 저장, 모든 fortune API 라우트 6종에 연결
- 운세 기록 조회 API 추가 (`src/app/api/user/readings/route.ts`) — 세션 인증 후 `ai_readings` 컬렉션에서 본인 기록 최대 20건 조회, 복합 인덱스 없이 동작하도록 JS 정렬 처리
- 오늘 AI 사용 현황 API 추가 (`src/app/api/user/usage/route.ts`) — `daily_usage` 컬렉션에서 오늘 메뉴별 사용 횟수 조회
- 마이페이지 운세 기록·사용 현황 섹션 구현 (`src/app/(user)/mypage/page.tsx`) — "내 운세 기록" 섹션 추가(최근 5개 표시 → 더보기로 5개씩 추가, 클릭 시 전체 결과 펼치기), 오늘 AI 사용 현황 실제 Firestore 데이터 연동 (한도 초과 시 빨간 막대)
- 어드민 운세 기록 페이지 신규 추가 (`src/app/admin/readings/page.tsx`, `src/app/api/admin/readings/route.ts`) — 전체 `ai_readings` 조회, 타입 드롭다운·userId 검색 필터, 행 클릭 시 결과 전문·docId·userId 펼쳐보기, 사이드바 및 대시보드 카드에 항목 추가
- `lunisolar` 패키지 설치 — 빌드 오류 수정 (`package.json`)

---

## 2026-06-01

- 타로 카드 이미지 스프라이트 시트 → 개별 PNG 파일로 전환 (`src/lib/tarot/utils.ts`) — `tarot_majors/`, `tarot_cups/`, `tarot_wands/`, `tarot_swords/`, `tarot_pentacles/` 서브폴더 구조 대응
- 비회원 로그인 유도 모달 구현 (`src/components/common/LoginRequiredModal.tsx`, `src/app/(user)/FortuneGrid.tsx`) — 비회원이 회원 전용 운세 클릭 시 모달 표시 → 로그인 페이지 이동 후 원래 페이지로 복귀
- 관리자 계정 일반/어드민 페이지 자유 이동 구현 (`src/components/Header.tsx`, `src/contexts/AuthContext.tsx`) — `isAdmin` 상태 추가, 헤더 드롭다운에 관리자 페이지 링크 표시
- 사주팔자 기능 구현 (`src/app/(user)/saju/page.tsx`, `src/lib/saju/calculator.ts`, `src/app/api/fortune/saju/route.ts`) — lunisolar 기반 만세력 계산, 사주 원국 테이블 UI, 출생 정보 저장 옵션, Gemini AI 스트리밍 해석
- 출생 정보 API 구현 (`src/app/api/user/birth-info/route.ts`) — GET/POST/DELETE, Firestore `users/{uid}.birthInfo` 저장
- 마이페이지 출생 정보 섹션 추가 (`src/app/(user)/mypage/page.tsx`) — 등록·수정·삭제 UI, 사주팔자 바로가기 퀵링크 추가

---

## 2026-05-31

- 어드민 메뉴 관리(`src/app/admin/menus/page.tsx`) 전면 개편 — Firestore 기반 CRUD, 툴바(전체노출/미노출·메뉴추가·선택삭제·선택카테고리변환), 컬럼 표시 설정 모달, 3단계 정렬(오름차순→내림차순→해제)
- 카테고리 관리 기능 추가 — 카테고리 추가·수정·삭제, 기본 카테고리는 삭제 불가 처리
- 순서 변경 모달 구현 — 카테고리 순서 및 카테고리별 메뉴 순서를 드래그 앤 드롭 + ▲▼ 버튼으로 조정, 로컬 드래프트 후 "순서 저장" 클릭 시 일괄 반영
- `src/types/menu.ts` 신규 생성 — `MenuItem`, `Category`, `AccessLevel`, `UsageLimits` 타입 정의
- `src/app/admin/menus/actions.ts` 신규 생성 — Firestore Admin SDK 기반 메뉴/카테고리 Server Actions (`getMenus`, `saveMenu`, `deleteMenusByIds`, `patchMenusByIds`, `batchUpdateOrders` 등)
- `scripts/migrate-menus.ts` 신규 생성 — `fortunes.json` → Firestore `menus` 컬렉션 1회성 마이그레이션 스크립트 (33개 항목)
- 메인 페이지(`src/app/(user)/page.tsx`) Firestore 연동 — Firestore 우선 조회, 없으면 JSON 폴백
- 회원등급별 일일 사용량 제한 기능 추가 — `MenuItem.usageLimits` 필드 (비회원/회원/프리미엄/관리자별 하루 횟수, -1=무제한, 0=차단), FortuneModal에 등급별 설정 UI
- `src/lib/firebase/usage.ts` 신규 생성 — KST 기준 일별 사용량 Firestore 트랜잭션 추적 (`checkAndIncrementUsage`, `getUsageCount`, `getBulkUsage`)
- `src/lib/usage-check.ts` 신규 생성 — 운세 API 라우트용 공통 미들웨어 (`accessLevel` 체크 → `usageLimits` 원자적 체크+증가, 401/403/429 반환)
- 운세 API 라우트 6종에 사용량 체크 연결 — `fortune`, `tarot`, `tarot-celtic`, `tarot-full-moon`, `tarot-horseshoe`, `tarot-tree-of-life`
- 배치 강제 실행 KST 버그 수정 (`src/app/api/cron/fortune/force/route.ts`) — `new Date()` UTC 그대로 사용해 자정 이후 이전 달/주차로 생성되던 문제 해결, `Date.now() + 9h` KST 변환 적용

---

## 2026-05-29

- 켈틱 크로스 타로 페이지 구현 (`src/app/(user)/tarot-celtic/page.tsx`) — 78장 팬 스프레드에서 10장 선택, Celtic Cross 배열(카드 2 교차 90° 회전), 포지션 리스트, AI 해석 (PRO 뱃지)
- 생명의 나무 타로 페이지 구현 (`src/app/(user)/tarot-tree-of-life/page.tsx`) — 카발라 세피로트 10위치 배열, 세피로트명·의미 이중 표시, PRO 뱃지
- 말발굽 타로 페이지 구현 (`src/app/(user)/tarot-horseshoe/page.tsx`) — 5장 호 형태 배열(현재·방향·장애물·지략·결과), AI 해석
- 보름달 타로 페이지 구현 (`src/app/(user)/tarot-full-moon/page.tsx`) — 7장 마름모 배열, 중심 카드(7번 예상 결과)를 보름달 에너지로 강조(하늘색 뱃지), AI 해석
- 타로 API 라우트 4종 추가 (`tarot-celtic`, `tarot-tree-of-life`, `tarot-horseshoe`, `tarot-full-moon`) — Gemini 스트리밍, 스프레드별 포지션 프롬프트
- 타로 스프레드 카드 선택 UX 개선 — 선택 시 팬에서 사라지고 하단 슬롯에 순서대로 배치, 슬롯 클릭 시 해제 및 팬 재등장 (`spreadReady` 플래그로 cascade 딜레이 스킵)
- 스프레드 단계 🔀 다시 섞기 버튼 추가 — 타로 3장·켈틱·생명의 나무·말발굽·보름달 전 페이지 공통 적용
- `TarotCard` xs 사이즈 추가 (54×92px) — 팬 스프레드 및 하단 슬롯용
- `fortunes.json` 켈틱·생명의 나무·말발굽·보름달 타로 `ready: true` 활성화, 생명의 나무 `isPremium: true` 추가
- 소셜 로그인(Google/GitHub) 운영 환경 팝업 차단 버그 수정 (`next.config.ts`) — Vercel 프로덕션에서 `Cross-Origin-Opener-Policy` 헤더가 Firebase `signInWithPopup` 팝업을 차단하는 문제 확인, `same-origin-allow-popups` 헤더 추가로 해결
- Google/GitHub 로그인 `catch` 에러 로깅 추가 (`src/app/(auth)/login/page.tsx`) — `auth/popup-blocked` 에러 진단을 위한 `console.error` 추가
- Google/GitHub 소셜 로그인 email 미저장 원인 분석 — Firebase Email Enumeration Protection 비활성화, Google Cloud Console OAuth 동의 화면 범위(`userinfo.email`, `userinfo.profile`) 추가, Firebase 승인 도메인에 운영 서버(`todays-vibe.vercel.app`) 추가
- OAuth 설정 트러블슈팅 문서 작성 (`docs/oauth-setup.md`) — 원인 분석·해결 방법·코드 수정 내역·체크리스트 정리

---

## 2026-05-28

- Google/GitHub 소셜 로그인 email 필드 미저장 원인 분석 및 트러블슈팅 — Firebase Email Enumeration Protection 비활성화, Google Cloud Console OAuth 동의 화면 범위(`userinfo.email`, `userinfo.profile`) 추가, Firebase 승인 도메인에 운영 서버(`todays-vibe.vercel.app`) 추가
- COOP 헤더 이슈 확인 — `Cross-Origin-Opener-Policy` 가 Firebase `signInWithPopup` 팝업 통신 차단, `next.config.ts`에 `same-origin-allow-popups` 설정
- Firestore cold start 타임아웃 버그 수정 — 5초 → 10초 증가, 타임아웃 시 `users` 문서 생성 백그라운드 재시도 로직 추가
- GitHub OAuth `user:email` scope 추가 — `providerData[0].email` 에서 이메일 추출하도록 Admin SDK 폴백 개선
- OAuth 설정 트러블슈팅 문서 작성 (`docs/oauth-setup.md`) — 원인 분석·해결 방법·코드 수정 내역·체크리스트 정리

- `.env.local` 로컬 환경 변수 구성 — Firebase, Gemini API, GitHub OAuth, `CRON_SECRET`, `SESSION_SECRET` 설정
- 로그인 버그 수정 — `SESSION_SECRET` 빈 문자열로 인한 `DataError: Zero-length key is not supported` 해결 (`openssl rand -hex 32`로 재생성)
- `annual` → `yearly` 네이밍 전체 통일 — 타입·함수·컴포넌트 전반 혼용 제거
- 어드민 배치 버튼 분리 (`src/app/admin/batch/page.tsx`) — 주간/월간/연간 × 별자리/띠 6개 개별 버튼 + 전체 생성 버튼으로 재편
- 강제 배치 API 개선 (`src/app/api/cron/fortune/force/route.ts`) — `period` 파라미터 세분화(`weekly-zodiac`, `monthly-chinese` 등), `forceCurrentPeriod` 플래그 추가로 강제 실행 시 현재 기간 데이터 생성
- 띠별 출생년도 8개로 확장 (`src/data/chinese-zodiac.json`) — 기존 5개에서 1936~2031 범위 8사이클로 확장
- 띠별 배치 프롬프트에 출생년도별 맞춤 운세 추가 (`src/lib/fortune/schedule-prompts.ts`) — `byBirthYear` 필드, 연령대별(유소년~80대+) 특별 노트 생성
- `byBirthYear` 타입 정의 추가 (`src/types/scheduled-fortune.ts`) — `WeeklyFortune`, `MonthlyFortune`, `YearlyFortune` 모두 적용
- 띠 상세 페이지 출생년도 선택 UI 구현 (`src/app/(user)/chinese-zodiac/[animal]/page.tsx`) — 미래 연도 필터링, 토글 버튼, 오늘 탭 포함 전 탭에서 년생별 특별 운세 노출
- 분기 표시 순서 버그 수정 — `Object.entries()` 순서 미보장 문제 해결, 명시적 배열 `["q1","q2","q3","q4"]`로 q1→q4 순서 고정 (별자리·띠 상세 페이지 공통)
- 홈 메뉴 카드 UI 개선 (`src/app/(user)/page.tsx`) — 카드 높이 통일(`h-full`, `items-stretch`), 설명 텍스트 2줄 초과 말줄임 처리(`line-clamp-2`)
- SkyLayer 달 개선 (`src/components/SkyLayer.tsx`) — SVG 달을 `moon.png` 기반으로 교체, SVG `clipPath`로 위상(초승달~보름달) 모양 유지, 어두운 오버레이(0.60) 적용으로 배경 자연스럽게 처리, `public/moon.png` → `public/images/moon.png` 이동

---

## 2026-05-27

- Firestore 스키마 재설계 — 기간별 단일 문서(모든 별자리/띠 필드 포함) 구조로 전환, 컬렉션명 체계화 (`zodiac_weekly`, `zodiac_monthly`, `zodiac_yearly`, `chinese_zodiac_weekly` 등)
- 배치 생성 최적화 — 별자리/띠 각각 1회 API 호출로 12개 동시 생성 (기존 72회 → 6회로 감축)
- 신규 문서 저장 후 이전 기간 문서 자동 삭제 로직 추가 (`src/lib/fortune/generator.ts`)
- Gemini 모델 트러블슈팅 — `gemini-1.5-flash` 미지원(404) → `gemini-2.0-flash` 쿼터 0 → `gemini-2.5-flash`로 최종 변경 (`src/lib/gemini/client.ts`)
- 날짜 키 헬퍼 함수 추가 (`src/lib/fortune/date-utils.ts`) — `toWeekDocKey`, `toMonthDocKey`, `getPrevWeekDocKey` 등
- `fortune-reader.ts` 신규 스키마 대응 업데이트 — 컬렉션/문서 경로 변경, 별자리/띠 분리 조회 헬퍼 추가
- 띠별 운세 목록 페이지 구현 (`src/app/(user)/chinese-zodiac/page.tsx`) — 12띠 그리드, 현재 연도 띠 금색 하이라이트 + "올해" 뱃지
- 띠별 운세 상세 페이지 구현 (`src/app/(user)/chinese-zodiac/[animal]/page.tsx`) — 오늘/이번 주/이번 달/올해 탭, 럭키 아이템 카드, 띠별 테마 색상
- SpriteCard 컴포넌트 생성 (`src/components/common/SpriteCard.tsx`) — CSS 스프라이트 기법으로 6×2 시트에서 개별 카드 추출 (`background-size: 600% 200%`)
- 별자리/띠 상세 페이지에 SpriteCard 적용 — 헤더 영역 카드 이미지 표시
- `public/images/` 폴더 구조 재편 — `zodiac/`, `chinese-zodiac/`, `tarot/`, `icons/` 하위 디렉토리로 분리
- 홈 메뉴 "준비중" 처리 (`src/app/(user)/page.tsx`) — `fortunes.json` `ready` 필드 기반으로 미구현 항목 불투명 처리 + 뱃지 표시, 클릭 불가

---

## 2026-05-26

- 어드민 접근 권한 제어 구현 — Firestore `admins/{email}` 컬렉션 기반, Firebase Console에서 문서 추가/삭제로 권한 관리
- HMAC 세션 토큰 시스템 구축 — `src/lib/session.ts` 생성 (Edge+Node.js 양쪽 호환, Web Crypto API 기반 서명/검증)
- 세션 API 라우트 생성 (`src/app/api/auth/session/route.ts`) — Firebase ID 토큰 검증 후 HMAC 서명 쿠키 발급, Firestore 연결 실패 시 env 폴백 처리
- `src/proxy.ts` 완성 — Firebase Admin 제거 (Edge 런타임 충돌 해소), HMAC 세션 검증 방식으로 교체
- 로그인 흐름 완성 (`src/app/(auth)/login/page.tsx`, `src/lib/firebase/auth.ts`) — 로그인 후 `isAdmin` 반환값에 따라 `/admin` 또는 `/` 분기 이동
- 어드민 레이아웃 사이드바에 ⚡ 운세 배치 메뉴 추가 (`src/app/admin/layout.tsx`)
- 별자리 운세 선택 페이지 구현 (`src/app/(user)/zodiac/page.tsx`) — 12별자리 그리드, 원소별 색상 구분
- 별자리 운세 상세 페이지 구현 (`src/app/(user)/zodiac/[sign]/page.tsx`) — 오늘/이번 주/이번 달/올해 탭, 럭키 아이템 카드
- Firestore 클라이언트 운세 조회 유틸 생성 (`src/lib/firebase/fortune-reader.ts`) — `fortune_weekly` / `fortune_monthly` / `fortune_annual` 컬렉션 조회 헬퍼

---

## 2026-05-25

- GitHub 소셜 로그인 추가 (`src/app/(auth)/login/page.tsx`)
- `src/app/auth/complete/page.tsx` Suspense 래핑 — `useSearchParams()` 빌드 오류 수정
- 중첩 git 저장소(`todays-vibe/.git`) 제거 및 잘못 커밋된 `todays-vibe/todays-vibe/` 중첩 디렉토리 삭제
- toy_project remote origin 연결 및 master 브랜치 동기화
- Vercel 배포 연동 — https://toy-project-ruby.vercel.app/

---

## 2026-05-24

- Firebase 프로젝트 연동 — `firebase`, `firebase-admin` 패키지 설치, `.env.local` Firebase 설정값 입력
- Firebase Auth 설정 — 이메일/비밀번호, Google 로그인 활성화
- 인증 인프라 구축 — `src/lib/firebase/config.ts` (lazy 초기화), `src/lib/firebase/auth.ts`, `src/lib/firebase/admin.ts`, `src/contexts/AuthContext.tsx` 생성
- 로그인 페이지 구현 (`src/app/(auth)/login/page.tsx`) — 이메일/비밀번호, 네이버, 카카오, Google, GitHub 소셜 로그인 버튼
- 회원가입 페이지 구현 (`src/app/(auth)/signup/page.tsx`) — 닉네임, 이메일, 비밀번호 입력 및 유효성 검사
- Naver/Kakao OAuth API 라우트 구현 — 리다이렉트 플로우, Firebase 커스텀 토큰 발급, `/auth/complete` 처리 페이지
- 헤더 컴포넌트 구현 (`src/components/Header.tsx`) — 비로그인 시 로그인/회원가입 버튼, 로그인 시 아바타(이니셜/프로필 사진) + 드롭다운 메뉴
- `src/app/(user)/layout.tsx` 에 Header 추가, `next.config.ts` 외부 이미지 도메인 허용 (Google, GitHub)
- 루트 `src/app/page.tsx` 제거 — `(user)` 레이아웃 우회 문제 해결

---

## 2026-05-21

- 시간대별 동적 배경 컴포넌트 구현 — `src/components/TimeBackground.tsx`, `src/components/SkyLayer.tsx` 생성
- `src/app/(user)/layout.tsx` 에 TimeBackground 적용 — 사용자 레이아웃 배경 통합
- `src/app/globals.css` 배경 관련 전역 스타일 추가

---

## 2026-05-01 (2)

- `src/data/fortunes.json` 운세 목록 18개 → 30개로 확장
- 카테고리 5개로 재편 — 기존 4개 + `appearance` (관상/신체) 신규 추가
- 전 운세에 `difficulty` 필드 추가 (easy / medium / hard / expert)
- 신규 운세 12개 추가: 자미두수, 출생차트, 육효점, 기문둔갑, 주역괘, 산가지점, 건강운, 이사/방위, 사업파트너궁합, AI관상, AI수상, 성명학
- README 구현 현황 테이블 30행 + 난이도 컬럼으로 업데이트

---

## 2026-05-01

- 프로젝트 구조 전면 재설계 — 사용자/어드민/미들웨어 3-레이어 구조로 변경
- `src/app/(user)/` 라우트 그룹 생성 — 사용자 레이아웃 및 홈 페이지
- `src/app/admin/` 어드민 섹션 생성 — 대시보드, 회원 관리, 메뉴 관리, 사용 통계, AI 사용량
- `src/middleware.ts` 생성 — 어드민 접근 제한, AI API 토큰 한도 체크 (Firebase 연동 후 실 동작)
- `src/lib/claude/client.ts` 재생성 — Anthropic 클라이언트 싱글턴
- `src/lib/auth/index.ts` 생성 — 세션 유저 헬퍼 (Firebase 연동 대비)
