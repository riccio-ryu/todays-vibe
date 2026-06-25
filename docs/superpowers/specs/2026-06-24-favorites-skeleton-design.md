# 즐겨찾기 로딩 스켈레톤 설계

**날짜:** 2026-06-24  
**상태:** 승인됨

---

## 문제

메인 홈 재방문 / 뒤로가기 시 레이아웃 간격이 가끔 벌어지는 현상. 원인은 `FavoritesSection`이 favorites API 응답 전에 `null`을 반환하다가, 응답 후 `mb-8` 높이의 섹션이 갑자기 나타나며 아래 `FortuneGrid`를 밀어내는 CLS(Cumulative Layout Shift).

---

## 설계

### 상태 모델

`HomeInteractive`의 favorites 상태를 세 단계로 구분:

```ts
const [favorites, setFavorites] = useState<string[] | null>(null);
// null  = 로딩 중 (스켈레톤 표시)
// []    = 완료, 즐겨찾기 없음 (아무것도 없음)
// [...] = 완료, 즐겨찾기 있음 (FavoritesSection 표시)
```

### 렌더 분기

| favorites 값 | user | 렌더 |
|---|---|---|
| `null` | any | 스켈레톤 placeholder |
| `[]` | any | 없음 |
| `string[]` | 로그인 | FavoritesSection |

비로그인 사용자는 API 호출 자체를 하지 않으므로 즉시 `[]`로 설정.

### 스켈레톤 UI

`FavoritesSection`과 동일한 `mb-8` 영역. 카드 4개 자리의 pulse 애니메이션.

```tsx
// HomeInteractive.tsx 내 인라인
{favorites === null && (
  <div className="mb-8">
    <div className="h-4 w-16 bg-white/5 rounded animate-pulse mb-3" />
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[72px] rounded-2xl bg-white/5 animate-pulse" />
      ))}
    </div>
  </div>
)}
```

### 변경 파일

- **`src/app/(user)/HomeInteractive.tsx`**
  - `useState<string[]>([])` → `useState<string[] | null>(null)`
  - user 없을 때: `setFavorites([])` (스켈레톤 즉시 제거)
  - API 성공: `setFavorites(d.favorites ?? [])`
  - 스켈레톤 JSX 추가 (`favorites === null` 조건)
  - `favoriteItems` 계산: `favorites ?? []` 사용

- **`src/components/home/FavoritesSection.tsx`**: 변경 없음

---

## 결과

로딩 중 스켈레톤이 `mb-8` 공간을 선점 → API 완료 후 섹션이 같은 자리에 등장 → 레이아웃 이동 없음. 즐겨찾기가 없는 사용자는 로딩 완료 즉시 스켈레톤 제거.
