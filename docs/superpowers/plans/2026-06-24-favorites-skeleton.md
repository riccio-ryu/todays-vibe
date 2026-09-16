# 즐겨찾기 로딩 스켈레톤 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 재방문 시 FavoritesSection이 null → 등장하며 발생하는 레이아웃 이동(CLS)을 favorites 로딩 중 스켈레톤 placeholder로 해결한다.

**Architecture:** `HomeInteractive.tsx`의 favorites 상태를 `string[] | null`로 변경해 로딩 중(`null`)·완료(`[]` or `string[]`)를 구분하고, `null`일 때 동일한 높이의 스켈레톤을 렌더한다. `FavoritesSection.tsx`는 변경하지 않는다.

**Tech Stack:** React, Next.js App Router, TypeScript, Tailwind CSS

## Global Constraints

- Next.js App Router 패턴 유지
- TypeScript strict 모드
- `FavoritesSection.tsx` 변경 금지
- 커밋은 사용자가 직접 처리 — 플랜에 commit 단계 없음

---

### Task 1: HomeInteractive favorites 상태 → 스켈레톤 구현

**Files:**
- Modify: `src/app/(user)/HomeInteractive.tsx`

**Interfaces:**
- Produces: favorites가 `null`일 때 스켈레톤, `[]`일 때 아무것도 없음, `string[]`일 때 FavoritesSection

- [ ] **Step 1: 현재 코드 확인**

`src/app/(user)/HomeInteractive.tsx` 전체를 읽고 아래 세 위치를 확인:
1. `useState<string[]>([])` — favorites 초기값
2. `useEffect` 내 `setFavorites` 호출부
3. `favoriteItems` 계산부 및 `<FavoritesSection>` 렌더부

- [ ] **Step 2: favorites 타입 변경**

```ts
// Before
const [favorites, setFavorites] = useState<string[]>([]);

// After
const [favorites, setFavorites] = useState<string[] | null>(null);
```

- [ ] **Step 3: useEffect 수정 — 비로그인 시 즉시 [] 설정**

```ts
useEffect(() => {
  if (!user) { setFavorites([]); return; }
  fetch("/api/user/favorites")
    .then((r) => r.json())
    .then((d) => setFavorites(d.favorites ?? []))
    .catch(() => { setFavorites([]); });
}, [user]);
```

기존 코드와 차이: catch에서 `setFavorites([])`를 호출해 에러 시 스켈레톤이 무한 표시되지 않도록 처리.

- [ ] **Step 4: favoriteItems 계산 — null 안전 처리**

```ts
// Before
const favoriteItems = favorites
  .map((id) => fortunes.find((f) => f.id === id && f.ready))
  .filter(Boolean) as MenuItem[];

// After
const favoriteItems = (favorites ?? [])
  .map((id) => fortunes.find((f) => f.id === id && f.ready))
  .filter(Boolean) as MenuItem[];
```

- [ ] **Step 5: 스켈레톤 JSX 추가**

`<FavoritesSection .../>` 바로 위에 추가:

```tsx
return (
  <>
    {favorites === null && (
      <div className="mb-8">
        <div className="h-3.5 w-16 bg-white/5 rounded animate-pulse mb-3" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    )}
    <FavoritesSection items={favoriteItems} onRemove={toggleFavorite} />
    <FortuneGrid
      categories={categories}
      fortunes={fortunes}
      favorites={favorites ?? []}
      onFavoriteToggle={user ? toggleFavorite : undefined}
    />
  </>
);
```

`FortuneGrid`의 `favorites` prop도 `favorites ?? []`로 전달 (null 방지).

- [ ] **Step 6: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 7: 동작 확인**

개발 서버 실행 후 아래 시나리오 검증:

1. **로그인 상태** → 홈 접속 → 즐겨찾기 로딩 중 스켈레톤 4칸 표시 → 완료 후 즐겨찾기 섹션 또는 아무것도 없음으로 교체 확인
2. **비로그인 상태** → 홈 접속 → 스켈레톤 즉시 사라짐 확인 (flash 없음)
3. **운세 페이지 이동 후 뒤로가기** → 홈 레이아웃 간격 벌어짐 없는지 확인
