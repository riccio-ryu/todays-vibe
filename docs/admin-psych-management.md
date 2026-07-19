# 관리자 심리테스트 관리 — 현황 조사 및 방향 보고서

> 작성: 2026-07-19 · 목적: 운영 노출(런칭) 전, "운세처럼 심리테스트도 admin에서 관리"하려면 무엇이 필요한지 조사·분석하고 권장안을 제시한다.

---

## 1. 배경

현재 admin은 **운세는 거의 완전하게 관리**되지만, **심리테스트는 노출/순서만** 관리된다. 사용자 판단: "운세도 관리하고 심테도 관리할 수 있어야 운영에 내보낼 수 있다." 이 문서는 그 갭을 구체화한다.

---

## 2. 현행 admin 전수 조사

| 페이지 | 관리 대상 | 데이터 소스 | CRUD 수준 |
|--------|-----------|-------------|-----------|
| `/admin` | 대시보드(요약) | 집계 | 조회 |
| `/admin/batch` | 운세 배치(별자리·띠 일괄 생성) | `/api/admin/fortune-docs` | 실행·현황 |
| `/admin/users` | 회원·**등급(plan)** | `/api/admin/users`, `/api/admin/plans` | 조회·등급변경 |
| `/admin/menus` | **운세 메뉴 전체** + 카테고리·퀵메뉴·Hero·**크레딧 지급량** | `menus`·`categories`·`settings/*` | **완전 CRUD** |
| `/admin/readings` | 운세 해석 기록 | `/api/admin/readings` | 조회 |
| `/admin/stats` | 사용 통계 | `/api/admin/stats` | 조회 |
| `/admin/ai-usage` | AI 토큰·비용 | `/api/admin/ai-usage`·`gcp-usage` | 조회 |
| `/admin/prompts` | **운세 AI 프롬프트 편집** | `ai_prompts` 컬렉션 | 편집·초기화 |
| `/admin/psych` | **심테 노출·순서만** | `settings/psych` | 부분 |

**핵심:** 운세는 (1) 메뉴 CRUD(`menus`), (2) 프롬프트 편집(`ai_prompts`), (3) 배치, (4) 통계까지 4각 관리. 심테는 (1) 노출/순서 플래그(`settings/psych`)만 있고 나머지가 비어 있다.

---

## 3. 운세 관리 방식 (레퍼런스)

- **메뉴 자체**가 Firestore `menus` 컬렉션 문서 → `/admin/menus`에서 추가·편집·삭제·순서·노출·회원등급·**cost(⭐)**·카테고리·태그 전부 편집. 코드 배포 없이 즉시 반영.
- **AI 프롬프트**는 `ai_prompts` 컬렉션 → `/admin/prompts`에서 `{{변수}}` 템플릿 편집. `promptStore.ts`가 DB 우선, 없으면 코드 폴백(`PROMPT_META`).
- 즉 운세는 **콘텐츠·프롬프트·과금이 전부 Firestore**라 admin이 런타임에 통제.

---

## 4. 심테 현황 & 운세와의 결정적 차이

### 현재 심테 관리 상태
- **데이터**: `src/data/psych/*.ts` **코드 20개 파일** (mbti·category·score·ranking·ai 각 테스트). admin에서 못 만짐.
- **엔진**: 4종(mbti·category·score·ranking) + AI 2모드(quiz·text) — 운세(단일 프롬프트)보다 구조가 다양.
- **렌더**: `/psych/[slug]`가 **SSG**(`generateStaticParams`) — 빌드 타임 정적 생성.
- **AI 프롬프트**: `buildPsychTestPrompt`가 코드 카탈로그의 `promptPersona`/`promptGuide`를 읽음 → **`/admin/prompts` 편집기와 무관**.
- **과금/권한**: `menuId "psych-test"` 하나로 통합 과금. 단, `menus/psych-test` 문서가 Firestore에 있어야 cost·accessLevel이 먹음(현재 `fortunes.json`에만 존재 → **런타임 시드 필요**).
- **admin/psych**: 노출 on/off + 순서만.

### 운세 ↔ 심테 3대 차이

| | 운세 | 심테 |
|---|---|---|
| 콘텐츠 저장 | Firestore(`menus`) | **코드(.ts)** |
| admin 편집 | 완전 CRUD | 노출/순서만 |
| 프롬프트 | `ai_prompts`(DB, 편집기 O) | **코드 카탈로그(편집기 X)** |
| 렌더 | 동적 | **SSG(정적)** |
| 구조 | 단일형 | **4엔진 × 결과 구조 상이** |

**이것이 핵심 난점:** 심테 콘텐츠를 admin에서 편집 가능하게 하려면 코드(.ts) → Firestore 이관이 필요한데, 이는 SSG(정적 생성)와 충돌한다. 또 4엔진의 문항·결과 구조가 제각각(pole/type/value/순위)이라 운세처럼 단일 폼으로 못 담는다.

---

## 5. 심테 관리 방안 (3단계 옵션)

### 옵션 A — 운영 플래그 관리 (경량, 현재+α) ★ 런칭용 권장
코드 데이터는 그대로 두고, **admin은 "운영 통제"만** 담당.
- `/admin/psych` 확장: 노출/순서(있음) + **항목별 cost** + **활성/비활성** + **전역 노출 토글**(현 `PSYCH_ENABLED` env → Firestore로)
- AI 심테 프롬프트: `promptPersona`/`promptGuide`를 `settings/psych` 또는 `ai_prompts`로 빼서 편집 가능하게 (선택)
- **장점**: SSG 유지, 작업량 작음, 런칭에 충분. **단점**: 문항·결과 본문은 여전히 코드(배포 필요).

### 옵션 B — 하이브리드 (콘텐츠 코드 + 메타 DB)
- 문항·결과 **본문은 코드**(품질·버전관리 유리), **메타(노출·순서·cost·프롬프트·미리보기)만 DB**.
- admin에서 테스트별 상세 페이지(`/admin/psych/[slug]`)로 메타 편집 + 문항 미리보기(읽기전용).
- **장점**: 관리 체감 크게 향상, SSG 유지. **단점**: 옵션 A보다 작업 큼.

### 옵션 C — 완전 CRUD (콘텐츠까지 DB, 운세 수준)
- 문항·결과·프롬프트를 전부 Firestore로 이관 → admin에서 신규 테스트 생성/편집/삭제.
- **장점**: 운세와 동일한 관리. **단점**: (1) SSG 포기(동적/ISR 전환) → SEO·성능 재설계, (2) 4엔진 각각의 편집 UI 필요(큰 작업), (3) 정적 콘텐츠 이점 상실. **런칭 목적엔 과함.**

---

## 6. 권장안 & 로드맵

**런칭 목표라면 옵션 A로 충분하다.** "운세도 관리·심테도 관리"의 실질은 *운영 통제(노출·순서·과금·활성)*이지, 심테 문항을 admin에서 쓰는 것까지는 아니다. 문항·결과는 코드에서 품질 관리하는 편이 오히려 안전하다.

### 단계별
1. **1단계 (런칭 필수)** — `/admin/psych`에 **항목별 cost + 전역 노출 토글(Firestore화)** 추가. `menus/psych-test` 시드 보장(과금 실동작 전제). → 이걸로 "심테도 admin에서 관리" 성립.
2. **2단계 (런칭 후)** — AI 심테 프롬프트(`promptPersona`/`promptGuide`) admin 편집. `/admin/psych/[slug]` 상세 + 문항 미리보기(옵션 B 일부).
3. **3단계 (장기·필요 시)** — 콘텐츠 CRUD(옵션 C). SSG↔DB 트레이드오프 재검토 후에만.

### 통합 뷰 관점
- 운세(`/admin/menus`)와 심테(`/admin/psych`)는 **데이터 성격이 달라 분리 유지**가 자연스럽다(운세=DB CRUD, 심테=코드+플래그). admin 대시보드에서 두 입구를 나란히 두는 정도면 충분.

---

## 7. 사용자 판단이 필요한 결정

- **Q1. 심테 문항·결과를 admin에서 직접 편집해야 하나?** (예 → 옵션 B/C, 큰 작업 / 아니오 → 옵션 A로 런칭)
- **Q2. 전역 노출을 env(`PSYCH_ENABLED`) 대신 admin 토글로 바꿀까?** (런칭엔 admin 토글이 편리)
- **Q3. AI 심테 프롬프트를 admin에서 편집할 필요가 있나?** (2단계 포함 여부)
- **Q4. cost를 admin 심테 화면에서 설정할까, 기존 `/admin/menus`(psych-test 항목)에서 할까?**

→ 위 4개만 정해지면 1단계 구현에 착수 가능.
