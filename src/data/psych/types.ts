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

// ─── 점수 척도형 (score 엔진) ─────────────────────────────────────────────────
// 리커트 척도(각 보기에 점수)를 합산 → 총점 구간(band)으로 결과. (스트레스 PSS·번아웃 MBI 등)
// 다축 지원: 문항마다 axis를 지정하면 축별 점수도 계산해 결과에 함께 표시한다.
// 역채점 문항은 데이터에서 value를 뒤집어 넣는다(항상 "높을수록 강함"으로 통일).

export interface ScoreAxis {
  /** 축 key (문항 axis와 매칭) */
  key: string;
  /** 축 이름 (예: "소진") */
  label: string;
}

export interface ScoreOption {
  label: string;
  /** 이 보기의 점수 */
  value: number;
}

export interface ScoreQuestion {
  q: string;
  /** 축 key (단일축 테스트는 생략 가능 → "total") */
  axis?: string;
  options: ScoreOption[];
}

export interface ScoreBand {
  /** 총점 구간 [min, max] (양끝 포함) */
  min: number;
  max: number;
  title: string;
  emoji: string;
  headline: string;
  description: string;
  advice: string;
}

export interface ScoreTest {
  engine: "score";
  slug: string;
  title: string;
  icon: string;
  summary: string;
  intro: string;
  /** 다축이면 나열(축별 점수 표시). 단일축이면 생략 */
  axes?: ScoreAxis[];
  questions: ScoreQuestion[];
  /** 총점 기준 결과 구간 (겹치지 않게, 오름차순) */
  bands: ScoreBand[];
  seoContent: { heading: string; body: string }[];
}

/** 로직 계산형 테스트 유니온 */
export type LogicPsychTest = MbtiTest | CategoryTest | ScoreTest;

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
