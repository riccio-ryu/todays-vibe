// 심리 테스트 타입 — docs/psych-tests-catalog.md 기준.
// 🔢 로직형(mbti/category): 선택지를 클라이언트에서 합산해 결과를 즉시 라우팅 (AI 호출·비용 없음).
// 🤖 AI형(ai): 답변을 /api/fortune에 보내 Claude가 스트리밍 해석 (회원 전용).

/** MBTI 4축 */
export type MbtiAxis = "EI" | "SN" | "TF" | "JP";
/** MBTI 8극 */
export type MbtiPole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export interface MbtiOption {
  /** 선택지 문구 */
  label: string;
  /** 이 선택지가 가리키는 극 */
  pole: MbtiPole;
}

export interface MbtiQuestion {
  /** 문항 텍스트 */
  q: string;
  /** 이 문항이 측정하는 축 */
  axis: MbtiAxis;
  /** 양극 선택지 (보통 2개) */
  options: MbtiOption[];
}

export interface MbtiResult {
  /** 유형 코드 (예: "INFP") */
  code: string;
  /** 유형 별명 (예: "잔잔한 몽상가") */
  title: string;
  /** 대표 이모지 */
  icon: string;
  /** 한 줄 요약 */
  tagline: string;
  /** 유형 설명 (2~3문장) */
  body: string;
  /** 강점 */
  strengths: string[];
  /** 조심할 점 */
  cautions: string[];
}

/** MBTI 엔진 테스트 */
export interface MbtiTest {
  engine: "mbti";
  /** URL 슬러그 (/psych/[slug]) */
  slug: string;
  title: string;
  icon: string;
  /** 한 줄 소개 (카드·헤더) */
  summary: string;
  /** 시작 화면 안내 문단 */
  intro: string;
  questions: MbtiQuestion[];
  /** 코드 → 결과 정의 (16종) */
  results: Record<string, MbtiResult>;
  /** 페이지 하단 SEO 콘텐츠 (크롤 대상) */
  seoContent: { heading: string; body: string }[];
}

// ─── 카테고리 투표형 (category 엔진) ─────────────────────────────────────────
// 4지선다에서 각 보기가 결과 유형에 투표 → 합산 → 최다 득표 유형. (연애/동물/빌런 등)

export interface CategoryOption {
  /** 선택지 문구 */
  label: string;
  /** 이 선택지가 투표하는 결과 유형 key */
  type: string;
}

export interface CategoryQuestion {
  q: string;
  options: CategoryOption[];
}

export interface CategoryResult {
  /** 결과 유형 key (CategoryOption.type과 매칭) */
  type: string;
  /** 결과 이름 (예: "고양이형") */
  title: string;
  /** 결과 이모지 */
  emoji: string;
  /** 한 줄 헤드라인 */
  headline: string;
  /** 본문 해석 */
  description: string;
  /** 특징 키워드 (3개 내외) */
  traits: string[];
  /** 마무리 조언 */
  advice: string;
}

export interface CategoryTest {
  engine: "category";
  /** URL 슬러그 (/psych/[slug]) */
  slug: string;
  title: string;
  icon: string;
  summary: string;
  intro: string;
  questions: CategoryQuestion[];
  /** 가능한 결과 유형들 (동점 시 배열 앞쪽 우선) */
  results: CategoryResult[];
  seoContent: { heading: string; body: string }[];
}

/** 로직 계산형 테스트 유니온 */
export type LogicPsychTest = MbtiTest | CategoryTest;

// ─── AI 해석형 (ai 엔진) ──────────────────────────────────────────────────────
// 답변을 /api/fortune("psych-test")로 보내 Claude 스트리밍 해석. 회원 전용.

export interface AiQuestion {
  q: string;
  options: string[];
}

export interface AiTest {
  engine: "ai";
  slug: string;
  title: string;
  icon: string;
  summary: string;
  intro: string;
  questions: AiQuestion[];
  /** AI 해석 시 심리 상담사 페르소나 */
  promptPersona: string;
  /** AI 해석 시 결과 구성 가이드 */
  promptGuide: string;
  seoContent: { heading: string; body: string }[];
}

/** 전체 심리 테스트 유니온 (로직 + AI) */
export type PsychTest = LogicPsychTest | AiTest;
