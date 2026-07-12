# TODO — 오늘운 다음 작업 목록

> 이 파일은 riccio-ryu × Claude가 함께 관리하는 작업 백로그입니다.
> 새 세션을 시작할 때 Claude에게 "TODO 확인해줘"라고 하면 이 파일을 읽고 이어서 작업합니다.

---

## 🔜 다음 작업 (우선순위 순)

> **[애드센스 재심사 대응] 공통 배경 (9~11번)**
> 2026-07-12에 애드센스 "저가치 콘텐츠" 거절 대응으로 아래 작업을 완료함 (브랜치 `feature/tv-20260712-01`, 커밋 4개):
> - `920ecde` 타로 카드 78장 의미 사전 (`/tarot-cards`, `/tarot-cards/[slug]`) + 홈 광고 제거
> - `7868b7f` 꿈해몽 사전 50개 (`/dream-dictionary`, `/dream-dictionary/[slug]`)
> - `631014a` 별자리 12궁·띠 12지 상세 페이지 해설 + 메타데이터 (`layout.tsx` 추가)
> - `6158d35` 홈 화면 콘텐츠 섹션 (크롤링 텍스트 404자 → 1,052자)
>
> 결과: 색인 가능 페이지 24개 → **177개** (sitemap.ts에 전부 등록됨). 남은 것이 9~11번.

### 9. [애드센스 1/3] 배포 + 라이브 검증 + Search Console 색인 요청
- **내용**: 완료된 브랜치를 master에 머지·배포하고, 새 페이지 177개가 실제로 서빙되는지 검증한 뒤 구글에 색인을 요청한다. **코드 작업 없음. 절차만 정확히 따르면 됨.**
- **목적**: 콘텐츠를 만들어도 배포·색인이 안 되면 애드센스 심사관과 크롤러는 볼 수 없음. 재심사의 전제 조건.
- **절차 (Claude가 실행)**:
  1. `git push -u origin feature/tv-20260712-01`
  2. `gh pr create --base master --title "애드센스 대응: 운세 사전 콘텐츠 177페이지 추가"` — 본문에 위 커밋 4개 요약 포함
  3. 사용자가 PR 머지 후 (또는 머지 허락받고 `gh pr merge`) → Vercel이 master 자동 배포 (`.vercel/project.json` 연결됨. 확인: Vercel 대시보드 또는 `npx vercel ls`)
  4. **라이브 검증 (배포 후 필수)** — 아래 URL이 전부 200이고 본문 텍스트가 보여야 함:
     ```bash
     curl -s -o /dev/null -w "%{http_code} " https://www.todays-vibe.com/tarot-cards
     curl -s -o /dev/null -w "%{http_code} " https://www.todays-vibe.com/tarot-cards/the-fool
     curl -s -o /dev/null -w "%{http_code} " https://www.todays-vibe.com/dream-dictionary
     curl -s -o /dev/null -w "%{http_code} " https://www.todays-vibe.com/dream-dictionary/snake
     curl -s https://www.todays-vibe.com/sitemap.xml | grep -c "<loc>"   # 177 이상이어야 함
     ```
  5. 검증 실패 시: 빌드 로그 확인 (`npx vercel logs`), 로컬 `npm run build`는 이미 통과한 상태이므로 대부분 배포/캐시 문제
- **절차 (사용자가 직접, Claude는 안내만)**:
  - [Search Console](https://search.google.com/search-console) → Sitemaps → `sitemap.xml` 재제출
  - URL 검사 도구로 대표 페이지 5~10개 (`/tarot-cards`, `/dream-dictionary`, `/tarot-cards/the-fool`, `/dream-dictionary/snake`, `/zodiac/aries` 등) "색인 생성 요청" (하루 할당량 있으니 목록 페이지 우선)
- **주의**: 사용자가 받은 애드센스 거절 메시지 원문을 아직 확인 못 함. 거절 사유가 "저가치 콘텐츠"가 아니라 다른 것(정책 위반, 사이트 접근 불가 등)이면 대응이 달라지므로, **세션 시작 시 사용자에게 거절 메시지 원문을 텍스트로 붙여넣어 달라고 요청할 것.**

---

### 10. [애드센스 2/3] 꿈해몽 사전 2차 확장 (50개 → 100개)
- **내용**: `src/data/dream-dictionary/` 에 꿈 상징 50개를 추가로 집필한다. 라우트·사이트맵·인덱스는 **이미 자동 연결되어 있어 데이터 파일에 객체만 추가하면 페이지가 생긴다.**
- **목적**: 꿈해몽은 검색 유입이 가장 큰 카테고리. 재심사 전에 콘텐츠 볼륨을 더 쌓을수록 유리함.
- **구현 힌트 (이대로만 하면 1차분과 같은 품질이 나옴)**:
  - **파일 구조**: `src/data/dream-dictionary/{animals,nature,people,body,situations,objects}.ts` — 각 파일의 배열에 `DreamSymbol` 객체 추가. `index.ts`와 `sitemap.ts`는 배열을 자동으로 읽으므로 **수정 불필요**. 타입 정의는 `types.ts` 참고.
  - **필드 규칙** (기존 항목 2~3개를 먼저 읽고 톤을 맞출 것, 예: `animals.ts`의 snake):
    - `slug`: 영문 kebab-case, **기존 slug와 중복 금지** (기존: snake, pig, dog, cat, tiger, dragon, fish, bird, mouse, horse, cow, spider, water, fire, sea, mountain, rain, snow, flood, lightning, dead-person, ex-lover, celebrity, baby, pregnancy, wedding, fight, thief, friend, president, teeth, hair, blood, poop, urine, naked, falling, being-chased, flying, dying, exam, lost-way, late, crying, money, gold, shoes, house, car-accident, fruit)
    - `sign`: "길몽" | "흉몽" | "양면적" 중 하나
    - `summary`: 1문장. `traditional`: 2~3문장(150~200자, "전통 해몽에서 ~로 풀이합니다" 톤). `psychological`: 2~3문장(심리학 관점). `variations`: **정확히 4개** (title + 1~2문장 meaning)
    - 문체: 존댓말, 단정 대신 "~로 봅니다/풀이합니다/암시합니다". 미신 조장 금지, 흉몽도 "점검 신호"로 마무리.
  - **2차분 후보 50개** (카테고리별 배분):
    - 동물(15): 고래, 상어, 곰, 사자, 코끼리, 원숭이, 토끼, 닭, 까마귀, 독수리, 나비, 벌, 개구리, 거북이, 벌레
    - 자연(8): 태양(해), 달, 별, 무지개, 지진, 태풍, 절벽, 강
    - 사람·관계(9): 부모님, 형제자매, 자녀, 스님·성직자, 군인, 경찰, 귀신, 사람을 죽이는 꿈, 키스하는 꿈
    - 신체(6): 눈(眼), 손, 발, 수염, 목욕하는 꿈, 토하는 꿈
    - 상황·행동(7): 수영하는 꿈, 운전하는 꿈, 이사하는 꿈, 바람피우는 꿈, 감옥에 갇히는 꿈, 전쟁 꿈, 계단 오르는 꿈
    - 재물·사물(5): 시계, 칼, 우산, 옷, 반지
  - **검증 (완료 기준)**: ① `npm run build` 통과 + `/dream-dictionary/[slug]` 정적 경로가 100개로 늘었는지 확인 ② `npx eslint "src/data/dream-dictionary/*.ts"` 클린 ③ 아래 스크립트로 새 페이지가 **900자 이상**인지 샘플 확인:
    ```bash
    python3 -c "
    import re, html
    h = open('.next/server/app/dream-dictionary/whale.html').read()  # 새 slug로 교체
    h = re.sub(r'<script.*?</script>', ' ', h, flags=re.S)
    t = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h))).strip()
    print(len(t))"
    ```
  - **커밋**: `꿈해몽 사전 2차 확장 (50개 → 100개)` + `Co-Authored-By: Claude <noreply@anthropic.com>` 푸터. 새 feature 브랜치(`feature/tv-YYYYMMDD-01` 형식)에서 작업.

---

### 11. [애드센스 3/3] 재심사 신청 + 승인 후 홈 광고 복원
- **내용**: 배포 후 2주 이상 운영하고 색인을 확인한 뒤 애드센스 재심사를 신청한다. 승인되면 홈 화면 광고를 복원한다.
- **목적**: 거절 직후 반복 신청은 심사 이력에 불리함. 색인·트래픽이 쌓인 상태로 신청해야 통과 확률이 올라감.
- **재심사 신청 전 체크리스트 (전부 충족 후 신청, 사용자가 직접)**:
  - [ ] 배포일로부터 **2주 이상 경과** (9번 배포일 기준. 예: 7/14 배포 → 7/28 이후 신청)
  - [ ] Search Console 색인 보고서에서 새 페이지가 **최소 50개 이상 색인됨** (또는 구글에서 `site:todays-vibe.com/tarot-cards` 검색 시 결과 다수 확인)
  - [ ] 라이브 사이트에서 콘텐츠 없는 화면에 광고가 안 나오는지 재확인 (현재 광고는 타로/운세/사주 **결과 화면**과 사전 상세 페이지에만 있음 — 정상)
  - [ ] [AdSense](https://adsense.google.com) → 사이트 → 검토 요청
- **승인 후 (Claude가 실행)**: 홈 광고 복원 — `src/app/(user)/page.tsx`에서:
  1. import 복원: `import AdSlot from "@/components/common/AdSlot";`
  2. `<PopularSection rankedItems={rankedItems} />` 와 `{/* 즐겨찾기 + 카테고리 */}` 사이에 `<AdSlot slot="1099445352" className="mb-8 rounded-xl" />` 삽입 (커밋 `920ecde`에서 제거한 그 자리·그 슬롯 ID)
- **재거절 시**: 거절 메시지 원문을 받아서 사유 확인 → "저가치 콘텐츠" 재거절이면 10번(콘텐츠 확장)을 먼저 완료하고 + 별자리/띠 목록 페이지(`/zodiac`, `/chinese-zodiac`)에도 소개 텍스트 보강 후 4주 뒤 재신청.

---

### 6. 금일 운세 알림 설정
- **내용**: 사용자가 매일 운세 확인을 잊지 않도록 푸시 알림 설정 기능 추가 → 원하는 시간에 "오늘의 운세를 확인해보세요" 알림 발송
- **목적**: 리텐션 향상, 매일 방문 유도
- **구현 힌트**: Web Push API + `public/sw.js` 알림 핸들러 / Firebase Cloud Messaging(FCM) 연동 또는 브라우저 Notification API / 알림 시간 설정 UI (마이페이지 또는 별도 설정 화면)

---

### 7. 심테 (심리 테스트) 카테고리 추가
- **내용**: 운세보다 가벼운 상황형 선택지 콘텐츠. "이런 상황이면 당신은 어떻게 하나요?" → A/B/C/D 선택 → 현재 심리 상태 / 조심해야 할 것 / 오늘의 조언 출력
- **형태**: 4지선다 3~5문항 → Claude API로 결과 해석 (스트리밍)
- **예시 테마**: 관계 유형, 오늘의 에너지, 결정 스타일, 숨겨진 감정
- **라우트**: `/(user)/psych-test/` 또는 새 카테고리로 FortuneGrid에 추가
- **참고**: 기존 FortuneResult 스트리밍 컴포넌트 재사용 가능

---

### 8. 베일 쓴 점술가 배경 연출
- **내용**: 메인 홈 또는 운세 결과 화면 배경에 반투명하게 베일 쓴 점술가 이미지/일러스트 노출 → 점술 받는 분위기 연출
- **방법 후보**:
  - A) 기존 `fortune_teller` 이미지 활용 (public/fortune_teller/)
  - B) CSS 애니메이션으로 천천히 숨/쉬는 효과
  - C) Framer Motion으로 등장 연출
- **위치 후보**: Hero 카드 뒤 배경 / 결과 페이지 배경

---

## ✅ 완료된 항목

| 날짜 | 내용 |
| ---- | ---- |
| 2026-06-19 | 카드 테두리 구분선 (card-glow border 추가) |
| 2026-06-19 | AI 문구 브랜딩 제거 (✦ 뱃지, "풀이" 등으로 교체) |
| 2026-06-19 | 관리자 AI 프롬프트 편집기 (Firestore 저장, {{변수}} 템플릿) |
| 2026-06-19 | 메인 운세 카드 사용 횟수 표시 (N/N회 사용하기, 오늘완료 뱃지) |
| 2026-06-19 | 파비콘 수정 (SVG + PNG 명시적 등록) |
| 2026-06-19 | 푸터 GitHub 링크 추가 |
| 2026-06-19 | README 버전별 적용 내역 테이블 추가 |
| 2026-06-20 | 500 에러 처리 개선 (usage 롤백 + FortuneResult 에러 UI) |
| 2026-06-20 | 오늘 인기 운세 순위 (daily_usage 집계, 1시간 캐시, 순위 바 UI) |
| 2026-06-20 | 즐겨찾기 메뉴 설정 (카드 ☆ 버튼, Firestore 저장, 홈 상단 섹션) |
| 2026-06-24 | 운세 해석 결과 공유하기 버튼 (Web Share API + URL, 6개 페이지 추가) |
| 2026-06-24 | 운세 해석 중 자동 스크롤 제거 (useTarotSpread scrollIntoView 제거) |
| 2026-06-25 | 메인 재방문 시 즐겨찾기 스켈레톤 로딩 (HomeInteractive favorites null 상태 도입, CLS 해결) |
| 2026-06-25 | 마이페이지 출생정보 저장/삭제 에러 처리 (try-catch, res.ok 체크, birthSaving 로딩 상태) |
| 2026-06-25 | 앱으로 이용하기 말풍선 X 버튼 (하루 동안 안보이기, localStorage 저장) |
| 2026-06-25 | 마이페이지 닉네임 편집 모바일 레이아웃 수정 (sm: 반응형, 버튼 두 줄 → 한 줄) |
| 2026-06-25 | 마이페이지 출생정보 셀렉트 커스텀 드롭다운 교체 (src/components/ui/Select.tsx 신규) |
| 2026-06-25 | Firestore 보안 규칙 생성 (zodiac/chinese_zodiac 공개 읽기, 나머지 차단) |
