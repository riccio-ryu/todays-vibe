# Google AdSense 승인 대응 기록

> 2026-07 애드센스 심사 거절("저가치 콘텐츠" 추정)에 대응해 수행한 작업의 전체 기록.
> 재심사 준비, 재거절 대응, 승인 후 할 일까지 이 문서 하나로 파악할 수 있게 정리함.

---

## 1. 배경 — 왜 거절됐나

2026-07-12 기준 진단 결과, 기술 설정(ads.txt, robots.txt, sitemap, 소유권 확인 파일, 개인정보처리방침, 이용약관, 문의 이메일)은 모두 정상이었음. **문제는 콘텐츠 구조**:

- 홈 화면의 크롤링 가능한 텍스트가 **404자** — 사실상 메뉴 링크 목록뿐
- 운세 페이지들이 전부 "도구"형 — 진짜 콘텐츠(운세 해석)는 **사용자가 버튼을 누른 뒤 AI가 생성**하므로 크롤러에게는 보이지 않음
- 크롤러 관점에서 이 사이트 = "짧은 안내문 + 입력 폼 + 광고 자리"가 반복되는 사이트 → 애드센스 **저가치 콘텐츠(Low value content)** 판정의 전형적 패턴
- 사이트맵 등록 페이지가 24개뿐이라 색인될 페이지 풀 자체가 작았음

**대응 방향**: 도구 사이트를 "읽을거리가 있는 사이트"로 바꾼다 — 크롤러가 볼 수 있는 정적 콘텐츠를 대량으로 만든다.

## 2. 수행한 작업

### 2-1. 광고 정책 정리 (2026-07-12, `920ecde`)

- 콘텐츠 없는 홈 화면에 무조건 노출되던 `AdSlot` **제거** — "콘텐츠 없는 화면의 광고" 정책 위반 소지 차단
- 타로/운세/사주 **결과 화면**의 광고는 기존에 이미 `!isLoading && result` 조건이 걸려 있어 문제없음 (유지)
- 현재 광고 위치: AI 해석 결과 화면 + 사전(tarot-cards, dream-dictionary) 상세 페이지 하단만

### 2-2. 타로 카드 78장 의미 사전 (2026-07-12, `920ecde`)

- `/tarot-cards` (목록) + `/tarot-cards/[slug]` (상세 78개, SSG)
- SEO 슬러그: 영문 카드명 기반 (`the-fool`, `three-of-cups` 등)
- 카드별 콘텐츠 전량 신규 집필: 상징 해설 / 정방향·역방향 상세 / 연애·직업·금전운(마이너 56장은 기존 데이터에 없어 신규 작성) / 조언
- 데이터: `src/data/tarot-card-content/{major,wands,cups,swords,pentacles}.ts`
- 페이지별 metadata(title/description/canonical/OG) + JSON-LD + 이전·다음 카드/같은 수트 내부 링크
- 페이지당 크롤링 텍스트 약 1,100자

### 2-3. 꿈해몽 사전 1차 50개 (2026-07-12, `7868b7f`)

- `/dream-dictionary` (목록) + `/dream-dictionary/[slug]` (상세, SSG)
- 6개 카테고리: 동물 / 자연 / 사람·관계 / 신체 / 상황·행동 / 재물·사물
- 항목별 구성: 한 줄 요약 + 길몽·흉몽·양면적 표기 + 전통 해몽 + 심리학 해석 + 상황별 풀이 4종
- 데이터: `src/data/dream-dictionary/*.ts` — **배열에 객체만 추가하면 페이지·사이트맵 자동 생성**
- AI 꿈해몽(`/dream`)과 상호 링크

### 2-4. 별자리·띠 상세 페이지 보강 (2026-07-12, `631014a`)

- `/zodiac/[sign]` 12개 + `/chinese-zodiac/[animal]` 12개에 성격·연애·직업(·띠 궁합 삼합/상충) 서술형 해설 추가
- 데이터: `src/data/zodiac-content.ts`, `src/data/chinese-zodiac-content.ts`
- 클라이언트 페이지라 metadata를 못 쓰던 문제 → **서버 `layout.tsx` 추가**로 `generateMetadata` + `generateStaticParams`(SSG 전환) 해결

### 2-5. 홈 화면 콘텐츠 보강 (2026-07-12, `6158d35`)

- 운세 사전 링크 카드(타로/꿈해몽) + 서비스 소개 텍스트 섹션 추가
- 홈 크롤링 텍스트 404자 → **1,052자**

### 2-6. 꿈해몽 사전 2차 확장 50 → 100개 (2026-07-13, `79e97b8`)

- 동물 15 / 자연 8 / 사람·관계 9 / 신체 6 / 상황·행동 7 / 재물·사물 5 추가
- 전 페이지 크롤링 텍스트 900자 이상(최소 906자) 검증

### 결과 수치

| 항목 | 이전 | 이후 |
|---|---|---|
| 사이트맵 등록 URL | 24개 | **228개** |
| 홈 크롤링 텍스트 | 404자 | 1,052자 |
| 정적 콘텐츠 페이지 | 0개 | 타로 79 + 꿈해몽 101 + 별자리·띠 24 |

## 3. 진행 로그

- **2026-07-12**: 위 코드 작업 전체 완료, PR #21 머지·배포. 라이브 검증 통과 (대표 URL 전부 200, 본문 텍스트 정상 서빙)
- **2026-07-13**: 꿈해몽 2차 확장 머지·배포 (사이트맵 228 URL 라이브 확인). Search Console에서 `sitemap.xml` 제출 + `/tarot-cards`, `/dream-dictionary` 색인 요청 완료

### 사이트맵 "가져올 수 없음" 상태에 대해 (2026-07-13)

제출 직후 상태가 `가져올 수 없음 / 발견된 페이지 0`으로 표시됨. **사이트 쪽 문제 아님** — 아래 항목 전부 정상 확인:

- `https://www.todays-vibe.com/sitemap.xml` → HTTP 200, `content-type: application/xml`
- Googlebot User-Agent로 접근해도 200
- robots.txt에서 차단 없음 + `Sitemap:` 선언 존재
- XML 파싱 정상, URL 228개

이는 **제출 직후 구글봇이 아직 실제로 안 가져간 상태를 GSC가 "가져올 수 없음"으로 표시하는 잘 알려진 현상**. 대응:

1. **24~72시간 기다린다** — 대부분 자동으로 "성공"으로 바뀜
2. 3일 지나도 그대로면: 사이트맵 삭제 → 재제출 1회 (반복 재제출은 금물)
3. 그래도 안 되면: URL 검사에 `https://www.todays-vibe.com/sitemap.xml` 넣고 "실시간 테스트"로 구글의 실제 fetch 결과 확인

## 4. 남은 절차 (체크리스트)

- [x] 콘텐츠 확장 1·2차 배포 (228 URL)
- [x] Search Console sitemap 제출 + 대표 페이지 색인 요청
- [ ] 사이트맵 상태 "성공" 전환 확인 (1~3일 내)
- [ ] **2주 운영 대기** (재심사 신청은 **2026-07-27 이후**)
- [ ] 색인 확인: GSC "색인 생성 → 페이지"에서 색인 페이지 **50개 이상** (또는 구글에서 `site:todays-vibe.com/tarot-cards` 검색)
- [ ] AdSense → 사이트 → **검토 요청**
- [ ] (승인 시) 홈 광고 복원 — `src/app/(user)/page.tsx`의 `PopularSection`과 `HomeInteractive` 사이에 `<AdSlot slot="1099445352" className="mb-8 rounded-xl" />` + import 복원 (`920ecde`에서 제거한 자리)
- [ ] (재거절 시) 거절 메시지 원문 확보 → 사유 분석 → 저가치 재거절이면 `/zodiac`, `/chinese-zodiac` 목록 페이지 소개 텍스트 보강 + 콘텐츠 추가 확장 후 **4주 뒤** 재신청

## 5. 참고 — 재현 가능한 검증 방법

배포 후 페이지가 정상 서빙되는지:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.todays-vibe.com/tarot-cards
curl -s https://www.todays-vibe.com/sitemap.xml | grep -c "<loc>"   # 228
```

페이지의 크롤링 가능 텍스트 분량 측정 (900자 이상이 목표):

```bash
curl -s https://www.todays-vibe.com/dream-dictionary/snake | python3 -c "
import re, html, sys
h = sys.stdin.read()
h = re.sub(r'<script.*?</script>', ' ', h, flags=re.S)
t = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', h))).strip()
print(len(t))"
```
