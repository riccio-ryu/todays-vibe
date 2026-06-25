# 자동 스크롤 제거 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 타로 스프레드 해석 시작 시 강제 발생하는 자동 스크롤을 제거해 사용자가 원하는 위치에서 텍스트를 읽을 수 있게 한다.

**Architecture:** `useTarotSpread.ts`의 `interpret()` 함수에서 `scrollIntoView` 호출 한 줄만 제거. `FortuneResult.tsx`의 마운트 스크롤은 폼→결과 전환용으로 유지.

**Tech Stack:** React, Next.js App Router, TypeScript

## Global Constraints

- Next.js App Router 패턴 유지
- TypeScript strict 모드
- 기존 `FortuneResult.tsx` 마운트 스크롤(`useEffect` + `scrollIntoView`) 변경 금지

---

### Task 1: useTarotSpread에서 scrollIntoView 제거

**Files:**
- Modify: `src/lib/hooks/useTarotSpread.ts:75`

**Interfaces:**
- Produces: `interpret()` 함수가 `interpretRef.current?.scrollIntoView` 호출 없이 동작

- [ ] **Step 1: 현재 코드 확인**

`src/lib/hooks/useTarotSpread.ts` 71~76번 줄:

```ts
async function interpret(apiPath: string, body: Record<string, unknown>) {
  setIsLoading(true);
  setPhase("reading");
  setInterpretation("");
  setTimeout(() => interpretRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  try {
```

- [ ] **Step 2: scrollIntoView 한 줄 제거**

변경 후:

```ts
async function interpret(apiPath: string, body: Record<string, unknown>) {
  setIsLoading(true);
  setPhase("reading");
  setInterpretation("");
  try {
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: 오류 없음

- [ ] **Step 4: 동작 확인**

개발 서버 실행 후 `/tarot-3cards` 접속:
1. 카드 3장 선택
2. "해석 받기" 클릭
3. 스크롤이 강제 이동하지 않는지 확인
4. 스트리밍 텍스트가 아래로 쌓이는 동안 스크롤 위치 유지 확인

- [ ] **Step 5: Commit**

```bash
git add src/lib/hooks/useTarotSpread.ts
git commit -m "fix: 타로 해석 시작 시 강제 스크롤 제거"
```
