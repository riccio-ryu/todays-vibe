# TODO — 오늘운 다음 작업 목록

> 이 파일은 riccio-ryu × Claude가 함께 관리하는 작업 백로그입니다.
> 새 세션을 시작할 때 Claude에게 "TODO 확인해줘"라고 하면 이 파일을 읽고 이어서 작업합니다.

---

## 🔜 다음 작업 (우선순위 순)

### 6. 금일 운세 알림 설정
- **내용**: 사용자가 매일 운세 확인을 잊지 않도록 푸시 알림 설정 기능 추가 → 원하는 시간에 "오늘의 운세를 확인해보세요" 알림 발송
- **목적**: 리텐션 향상, 매일 방문 유도
- **구현 힌트**: Web Push API + `public/sw.js` 알림 핸들러 / Firebase Cloud Messaging(FCM) 연동 또는 브라우저 Notification API / 알림 시간 설정 UI (마이페이지 또는 별도 설정 화면)

---

### 7. 오늘난 — 심리 테스트 플랫폼 신규 구축

> 설계 문서: `docs/superpowers/specs/2026-06-29-psych-world-design.md`  
> 카탈로그: `docs/psych-tests-catalog.md` (총 97개, MVP 22개)

**개요**
- **서비스명**: 오늘난 (오늘운의 자매 서비스)
- **테마**: 낮·해·명료 — 배경 `#ebf5ff` (Sky Wash), 카드 `#fafdff`
- **진입**: 메인 홈에서 좌우 스와이프로 오늘운(밤) ↔ 오늘난(낮) 전환 (Framer Motion 수평 슬라이드)
- **마지막 선택 세계**: `localStorage`에 기억

**MVP 구성 (22개)**
- 심리 진단 탭 12개 (MBTI·에니어그램·애착 유형·번아웃·스트레스 등 비AI 8개 + AI 4개)
- 심리 스낵 탭 10개 (동물 유형·조선시대 직업·스낵 유형·꽃 유형 등)
- 오늘의 스낵 위젯 (탭 상단 고정, 매일 1개 로테이션)

**라우트 구조**
```
src/app/(psych)/
├── layout.tsx          # 낮 테마 레이아웃
├── page.tsx            # 심리 테스트 메인 (진단/스낵 토글)
└── [slug]/
    ├── page.tsx        # 테스트 소개 + 시작
    ├── quiz/page.tsx   # 진행 화면
    └── result/page.tsx # 결과 화면
```

**구현 4단계**

- **Phase 1 — 기반 (비AI 진단형)**
  - `(psych)` 라우트 그룹 + 낮 테마 레이아웃
  - 공통 `<QuizLayout />` (질문 1장씩 + 진행률 바, 선택 즉시 자동 전환, 뒤로가기 수정 가능)
  - MBTI JSON (`src/data/psych-tests/mbti.json`) + 스코어링 엔진 (축별 가중치 합산 → 유형 라우팅)
  - 공통 `<DiagnosticResult />` (축 차트 + 유형 요약 + 상세 해석 + 연관 테스트)
  - 번아웃(MBI 척도) · 자존감(Rosenberg 척도) JSON 추가

- **Phase 2 — 스낵형 + 메인 토글**
  - `<SnackResult />` (1섹션, Morning Tint/Lilac Mist 배경, 공유 버튼 최우선)
  - 동물 유형 · 조선시대 직업 · 스낵 유형 JSON
  - 심리 테스트 메인 페이지 (진단/스낵 pill 토글 + 오늘의 스낵 위젯)
  - 홈 화면 스와이프 전환 (오늘운 ↔ 오늘난)

- **Phase 3 — AI 연동**
  - AI 입력형 테스트 UI (자유 입력 최소 30자 + 스트리밍 결과)
  - 기존 `FortuneResult` 스트리밍 컴포넌트 재사용
  - AI 고민 분석 · 감정 일기 · 연애 상담 · 성격 분석 4종

- **Phase 4 — 완성도**
  - 결과 공유 이미지 생성 (OG 이미지 또는 Canvas — Phase 4에서 결정)
  - 즐겨찾기 (오늘운 구조 동일하게)
  - 결과 저장 → 마이페이지 연동

**데이터**
- Firestore: `psych_readings/{id}` 컬렉션 (ai_readings와 분리)
- 비AI 테스트: `src/data/psych-tests/[slug].json` (문항·선택지·가중치·결과 포함)

**디자인 원칙 (설계 문서 §3)**
- 이모지 사용 금지 — 아이콘은 라인 SVG만
- 강조색 4종(Cornflower·Amethyst·Tangerine·Mustard)은 장식·아이콘 전용, 버튼/텍스트 사용 금지
- 카드 반경 32px, 버튼 pill형, 그림자 `rgba(4,69,144,0.08) 0px 14px 20px 4px`

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
