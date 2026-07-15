// 심리 테스트 카탈로그 타입 — 4지선다 문항 + AI 해석용 페르소나/가이드를 한 파일에 담는다.
// 요청 시 answers를 input으로 /api/fortune에 보내고, prompts.ts가 promptPersona/promptGuide로 프롬프트를 조립한다.

export interface PsychQuestion {
  /** 문항 텍스트 */
  q: string;
  /** 4지선다 선택지 (정답 개념 없음 — 성향 파악용) */
  options: string[];
}

export interface PsychTest {
  /** URL 슬러그 (/psych-test/[slug]) */
  slug: string;
  /** 테스트 이름 */
  title: string;
  /** 대표 이모지 */
  icon: string;
  /** 한 줄 소개 (카드·헤더용) */
  summary: string;
  /** 시작 화면 안내 문단 */
  intro: string;
  /** 4지선다 문항 (3~5개) */
  questions: PsychQuestion[];
  /** AI 해석 시 심리 상담사 페르소나 지정 */
  promptPersona: string;
  /** AI 해석 시 결과에 담아야 할 관점·구성 가이드 */
  promptGuide: string;
  /** 페이지 하단 SEO용 소개 콘텐츠 (문단 배열, 크롤 대상) */
  seoContent: { heading: string; body: string }[];
}
