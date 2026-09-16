# 별(⭐) 크레딧 실동작 검증 체크리스트

> 런칭·재검증 시 참고. 실제 클릭 검증은 `npm run dev` 또는 배포 환경에서(Firestore·로그인 필요). 최종 갱신: 2026-07-19.

## 현재 크레딧 설정 (기준값)

| 구분 | 값 |
| ---- | ---- |
| 지급량(grant) | 비회원 0 / 회원 **10** / 프리미엄 **30** / admin ∞ (`DEFAULT_GRANTS`, admin은 `settings/credits`로 조정) |
| 소모량(cost) | 일반·AI 운세 **1⭐** / 프리미엄 메뉴 **2⭐** / AI 심테 **1⭐**(`settings/psych`) / 로직 심테 **0**(무료·API 미호출) |
| 충전 | 매일 자정(KST), 이월 없음 (`daily_credits/{date}_{uid}`) |

**핵심 구조**
- 운세·심테 **공용 지갑** 하나(`daily_credits`) — 어느 항목이든 같은 잔량에서 cost만큼 차감
- 운세 cost·권한: `menus` 컬렉션 문서 / 심테 cost: `settings/psych`(자립), 권한: 회원 전용 고정
- `daily_usage`는 크레딧과 별개로 유지(인기 순위·통계용)

---

## 🧪 검증 체크리스트

### 0. 전제 (admin 계정)
- [ ] `/admin/menus` — 운세 메뉴들이 목록에 있음(accessLevel·cost 소스). **psych-test는 여기 없어야 정상**
- [ ] `/admin/menus` → ⭐크레딧 → 지급량 회원 10 확인
- [ ] `/admin/psych` — 심테 목록에 cost 표시(AI 심테 ⭐1, 로직 무료)

### 1. 회원 계정 (하루 10⭐) — 핵심 흐름
- [ ] 헤더에 **⭐10** 표시
- [ ] AI 운세(사주 등) 1회 → 결과 후 헤더 **⭐9** (1 차감)
- [ ] AI 심테(고민 상담 등) 1회 → **⭐8** (1 차감)
- [ ] **로직 심테(MBTI·동물 등)** → **⭐8 유지** (무료, API 미호출)
- [ ] 오늘 본 운세 **다시보기**(저장 결과 재열람) → **⭐8 유지** (재열람 무료)
- [ ] 프리미엄 스프레드 있으면 → **2 차감** 확인

### 2. 소진 시 (계속 써서 별 0으로)
- [ ] 헤더 ⭐가 **0이면 호박색 강조**
- [ ] 운세/심테 카드에 **"⭐ 부족"** 뱃지
- [ ] 시작 버튼이 **"⭐ 별이 부족해요 · 자세히"** (호박색)
- [ ] 그 버튼 클릭 → **부족 안내 모달** + "✨ 프리미엄으로 더 많은 별 받기"(마이페이지 유도)

### 3. admin 계정
- [ ] 헤더 **⭐∞**, 모든 항목 무제한 (차감 없음)

### 4. 비회원 (로그아웃)
- [ ] AI 운세/심테 시도 → **로그인 유도** (별 0이라 이용 불가)
- [ ] 로직 심테는 로그인 없이 이용 가능(무료·API 미호출)

### 5. admin 설정 → 즉시 반영
- [ ] `/admin/menus` ⭐크레딧에서 회원 10→5 저장 → 회원 계정 헤더 **5** 반영
- [ ] 특정 운세 편집 → cost 2 저장 → 그 카드 뱃지·차감 **2** 반영
- [ ] `/admin/psych` 심테 cost 편집(예: 2) → 그 심테 시작화면 표시·차감 **2** 반영

### 6. 데이터 보존 (크레딧과 별개)
- [ ] 홈 **인기 운세 순위** 정상 노출 (daily_usage 보존)
- [ ] `/admin/stats` 사용 통계 정상

---

## 관련 파일

- 코어: `src/lib/usage-check.ts`(차감·롤백), `src/lib/credits/config.ts`(지급·cost 기본)
- 심테 cost: `src/lib/psych/settings.ts` `getPsychCost`
- 상태 API: `src/app/api/user/credits/route.ts`, `.../fortune-status/route.ts`
- UI: `src/components/credits/CreditsProvider.tsx`·`InsufficientCreditsModal.tsx`, `src/components/Header.tsx`
- admin: `/admin/menus`(지급·운세 cost), `/admin/psych`(심테 cost)
