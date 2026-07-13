// 관리자 대시보드 공용 타입 — 페이지와 대응 API 라우트가 같은 리터럴을 공유

/** AI 사용량 조회 기간 (admin/ai-usage ↔ api/admin/ai-usage) */
export type AiUsagePeriod = "today" | "7d" | "30d";

/** 통계 조회 기간 (admin/stats ↔ api/admin/stats) */
export type StatsPeriod = AiUsagePeriod | "all";
