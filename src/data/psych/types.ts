// 심리 테스트 (로직 계산형) 타입 — docs/psych-tests-catalog.md 기준.
// 🔢 로직형: 선택지 가중치를 클라이언트에서 합산해 결과를 즉시 라우팅한다 (AI 호출·비용 없음).
// 🤖 AI형은 기존 /psych-test 경로(추후 이관)에서 별도 처리.

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

/** 로직 계산형 테스트 유니온 — 추후 score/category 엔진 추가 시 확장 */
export type LogicPsychTest = MbtiTest;
