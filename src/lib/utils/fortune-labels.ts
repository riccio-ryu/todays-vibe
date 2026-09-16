// 기간별 운세(오늘/주간/월간/연간) 공용 라벨 — 별자리·띠 상세 페이지에서 사용

export type FortunePeriodTab = "today" | "weekly" | "monthly" | "yearly";

export const PERIOD_TABS: { id: FortunePeriodTab; label: string }[] = [
  { id: "today",   label: "오늘" },
  { id: "weekly",  label: "이번 주" },
  { id: "monthly", label: "이번 달" },
  { id: "yearly",  label: "올해" },
];

export const DAY_KO: Record<string, string> = {
  mon: "월요일", tue: "화요일", wed: "수요일",
  thu: "목요일", fri: "금요일", sat: "토요일", sun: "일요일",
};

export const QUARTER_KO: Record<string, string> = {
  q1: "1분기 (1~3월)", q2: "2분기 (4~6월)",
  q3: "3분기 (7~9월)", q4: "4분기 (10~12월)",
};
