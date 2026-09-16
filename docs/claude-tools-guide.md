# Claude Code 도구 가이드: Context7 & Superpowers

Claude Code를 더 똑똑하게 쓸 수 있는 두 가지 도구 설치 및 활용 가이드.

---

## Context7

### 뭔가요?

Context7는 **최신 공식 문서를 실시간으로 가져오는 MCP 서버**입니다.

Claude는 학습 데이터 기준일(cutoff)이 있어서, 최신 라이브러리 API나 변경된 설정 방법을 모를 수 있습니다. Context7를 쓰면 Claude가 공식 문서를 직접 조회해서 답해줍니다.

**예시:**
- "Next.js 15의 새로운 캐싱 방식이 뭐야?" → 예전 방식으로 답할 수 있음
- "Next.js 15의 새로운 캐싱 방식이 뭐야? use context7" → 공식 문서 기반으로 정확하게 답함

---

### 설치 방법

**설치 위치: 터미널**

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

Claude Code CLI가 설치되어 있으면 위 명령어 한 줄로 끝입니다.

설치 확인:
```bash
claude mcp list
# context7 가 목록에 보이면 성공
```

---

### 사용 방법

프롬프트 끝에 `use context7` 를 붙이면 됩니다.

```
Firebase Authentication 설정하는 방법 알려줘 use context7

Tailwind v4 새로운 설정 방식 use context7

Next.js App Router에서 서버 액션 쓰는 법 use context7
```

별도 명령어 없이 자연어 프롬프트에 붙이면 자동으로 동작합니다.

---

### 언제 써야 하나요?

| 상황 | Context7 필요 여부 |
|------|-------------------|
| 라이브러리 공식 API 사용법 | ✅ 필수 |
| 버전 업그레이드 후 바뀐 문법 | ✅ 필수 |
| 설정 파일 작성 (Firebase, Next.js, Tailwind 등) | ✅ 권장 |
| 일반 TypeScript/JavaScript 로직 | ❌ 불필요 |
| UI 컴포넌트 구조 설계 | ❌ 불필요 |
| 비즈니스 로직 구현 | ❌ 불필요 |

**이 프로젝트에서 유용한 경우:**
- Firebase v10+ 문법 확인
- Anthropic SDK 최신 스트리밍 API
- Next.js 16 App Router 패턴
- shadcn/ui 컴포넌트 사용법
- TanStack Query v5 API

---

## Superpowers

### 뭔가요?

Superpowers는 **Claude Code에 체계적인 개발 워크플로우를 추가하는 플러그인 묶음**입니다.

기능 구현 전에 아이디어를 검증하고, 계획을 세우고, 단계별로 실행하는 흐름을 슬래시 명령어로 제공합니다. "그냥 만들어줘" 대신 "먼저 설계하고, 확인받고, 만들자"는 방식으로 바뀝니다.

---

### 설치 방법

**설치 위치: Claude Code 채팅창 (슬래시 명령어)**

아래 순서대로 입력합니다.

**1단계 — 마켓플레이스 등록:**
```
/plugin marketplace add obra/superpowers-marketplace
```

**2단계 — 플러그인 설치:**
```
/plugin install superpowers@superpowers-marketplace
```

**3단계 — 설치 확인:**
```
/help
```

아래 명령어가 목록에 보이면 성공:
- `/superpowers:brainstorm`
- `/superpowers:write-plan`
- `/superpowers:execute-plan`

> 터미널이 아닌 **Claude Code 앱 또는 IDE 채팅창** 안에서 입력해야 합니다.

---

### 핵심 명령어 3개

#### `/superpowers:brainstorm`
구현 전 아이디어 검증·설계 단계.

Claude가 "이 기능 왜 만들어요?", "어떻게 써요?", "엣지 케이스 있어요?" 등을 물어보며 요구사항을 정리해줍니다.

```
/superpowers:brainstorm 사용자가 타로 카드를 즐겨찾기할 수 있는 기능 만들고 싶어
```

#### `/superpowers:write-plan`
구현 계획서 작성.

Brainstorm 결과를 바탕으로 어떤 파일을 어떻게 수정할지 단계별 계획을 문서로 만들어줍니다.

```
/superpowers:write-plan
```

#### `/superpowers:execute-plan`
계획 배치 실행.

작성된 계획을 실제 코드로 구현합니다. 계획이 있으니 실수나 방향 이탈 없이 진행됩니다.

```
/superpowers:execute-plan
```

---

### 권장 사용 흐름

```
1. /superpowers:brainstorm  →  요구사항 정리
2. /superpowers:write-plan  →  구현 계획 확인
3. /superpowers:execute-plan  →  코드 생성
```

---

### 언제 써야 하나요?

| 상황 | 유용 여부 |
|------|-----------|
| 새 기능 구현 전 설계 검토 | ✅ 강력 권장 |
| 복잡한 여러 파일 수정이 필요할 때 | ✅ 강력 권장 |
| 방향이 명확하지 않을 때 | ✅ 강력 권장 |
| 간단한 버그 수정 | ❌ 굳이 불필요 |
| 텍스트 수정, 스타일 변경 | ❌ 굳이 불필요 |

**이 프로젝트에서 유용한 경우:**
- 사주/타로/꿈해몽 새 기능 추가 전
- Firebase Auth + Firestore 연동 설계
- AI 스트리밍 UI 구조 설계
- 공유 피드, 마이페이지 같은 복잡한 페이지 구현 전

---

## 정리

| 도구 | 설치 위치 | 사용 시점 |
|------|-----------|-----------|
| **Context7** | 터미널 (CLI 명령어) | 라이브러리 공식 문법이 필요할 때, 프롬프트에 `use context7` 추가 |
| **Superpowers** | Claude Code 채팅창 (슬래시 명령어) | 새 기능 개발 시작 전, `/superpowers:brainstorm` 부터 시작 |
