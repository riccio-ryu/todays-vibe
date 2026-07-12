// 꿈해몽 사전 데이터 타입

export type DreamCategory =
  | "동물"
  | "자연"
  | "사람·관계"
  | "신체"
  | "상황·행동"
  | "재물·사물";

export type DreamSymbol = {
  /** URL slug (영문 kebab-case) */
  slug: string;
  /** 표제어 — 예: "뱀꿈" */
  title: string;
  emoji: string;
  category: DreamCategory;
  /** 전통적으로 보는 길흉 */
  sign: "길몽" | "흉몽" | "양면적";
  /** 검색 키워드 (메타 description 등에 활용) */
  keywords: string[];
  /** 한 줄 요약 */
  summary: string;
  /** 전통 해몽 관점 */
  traditional: string;
  /** 심리학적 해석 관점 */
  psychological: string;
  /** 상황별 풀이 */
  variations: { title: string; meaning: string }[];
};
