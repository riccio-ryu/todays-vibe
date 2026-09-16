import type { AccessLevel } from "./menu";

/** 심리 테스트 채점 엔진 (= 운세의 '카테고리' 대응) */
export type PsychEngine = "mbti" | "category" | "score" | "ranking" | "ai";

export const PSYCH_ENGINES: PsychEngine[] = ["mbti", "category", "score", "ranking", "ai"];

/** 엔진 라벨 (카테고리 컬럼·필터 표시용) */
export const PSYCH_ENGINE_LABEL: Record<PsychEngine, string> = {
  mbti: "🔢 MBTI",
  category: "🔢 카테고리",
  score: "🔢 점수 척도",
  ranking: "🔢 순위 매기기",
  ai: "🤖 AI 해석",
};

/**
 * 심테 관리용 메타데이터 (Firestore `psych_tests` 문서에서 content 제외).
 * 문항·결과 원본(content)은 관리 테이블에서 다루지 않으므로 클라이언트로 보내지 않는다(Phase 2 빌더).
 */
export interface PsychTestMeta {
  /** URL 슬러그 = 문서 id (/psych/[slug]) */
  slug: string;
  icon: string;
  title: string;
  /** 한 줄 소개 (이름 아래 설명) */
  summary: string;
  engine: PsychEngine;
  /** 표시용 카테고리 — 기본값은 engine */
  category: string;
  /** 노출 여부 */
  ready: boolean;
  accessLevel: AccessLevel;
  /** 소모 별 (AI 심테만 유효, 미설정 시 기본값). 로직 심테는 항상 무료 */
  cost?: number;
  order: number;
  /** AI 테스트 입력 방식 (4지선다 / 자유텍스트) */
  aiMode?: "quiz" | "text";
  /** AI 해석 페르소나 (engine=ai) */
  promptPersona?: string;
  /** AI 해석 가이드 (engine=ai) */
  promptGuide?: string;
}
