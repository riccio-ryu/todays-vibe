# 운세 해석 자동 스크롤 제거 설계

**날짜:** 2026-06-24  
**상태:** 승인됨

---

## 문제

타로 스프레드 페이지에서 "해석 받기" 버튼을 누르면 `useTarotSpread.ts`의 `interpret()` 함수가 `interpretRef.current?.scrollIntoView()`를 호출해 해석 영역으로 강제 스크롤한다. 스트리밍 텍스트를 위에서부터 읽으려는 사용자에게 불편함을 준다.

---

## 설계

### 변경

**`src/lib/hooks/useTarotSpread.ts`** — `interpret()` 함수 내 아래 한 줄 제거:

```ts
// 제거
setTimeout(() => interpretRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
```

### 유지

**`src/components/fortune/FortuneResult.tsx`** — 마운트 시 상단 스크롤(`useEffect` + `scrollIntoView`)은 그대로 유지. 이건 폼 화면 → 결과 화면 전환 시 페이지 상단으로 이동시키는 역할로, 별개의 UX다.

---

## 영향 범위

`useTarotSpread` 훅을 사용하는 타로 스프레드 페이지 6개:
- `tarot-3cards`
- `tarot-celtic`
- `tarot-horseshoe`
- `tarot-full-moon`
- `tarot-tree-of-life`

사주·꿈해몽 등 `FortuneResult`만 쓰는 페이지는 변경 없음.

---

## 결과

해석 시작 후 사용자 스크롤 위치가 강제 이동하지 않는다. 스트리밍 텍스트는 화면 아래로 쌓이고, 사용자가 직접 스크롤해서 읽는다. "아래로 내려가기" 안내 UI는 추가하지 않는다.
