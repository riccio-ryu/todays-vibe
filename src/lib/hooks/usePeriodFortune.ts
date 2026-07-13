"use client";

import { useEffect, useState } from "react";
import type { WeeklyFortune, MonthlyFortune, YearlyFortune } from "@/types/scheduled-fortune";

export type PeriodFortuneFetchers = {
  weekly: (id: string) => Promise<WeeklyFortune | null>;
  monthly: (id: string) => Promise<MonthlyFortune | null>;
  yearly: (id: string) => Promise<YearlyFortune | null>;
};

/**
 * 별자리/띠 상세 페이지의 주간·월간·연간 운세 로딩 훅.
 * id가 바뀌면 이전 데이터를 비우고 다시 로딩한다.
 * fetchers는 모듈 레벨 상수로 정의해 넘길 것 (렌더마다 재생성 금지).
 */
export function usePeriodFortune(id: string, enabled: boolean, fetchers: PeriodFortuneFetchers) {
  const [weekly, setWeekly] = useState<WeeklyFortune | null>(null);
  const [monthly, setMonthly] = useState<MonthlyFortune | null>(null);
  const [yearly, setYearly] = useState<YearlyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevId, setPrevId] = useState(id);

  // 렌더 중 상태 리셋 — id 전환 시 이전 별자리/띠 데이터가 잠깐 보이는 것 방지
  if (prevId !== id) {
    setPrevId(id);
    setLoading(true);
    setWeekly(null);
    setMonthly(null);
    setYearly(null);
  }

  useEffect(() => {
    if (!enabled) return;
    Promise.all([fetchers.weekly(id), fetchers.monthly(id), fetchers.yearly(id)])
      .then(([w, m, y]) => {
        setWeekly(w);
        setMonthly(m);
        setYearly(y);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, enabled, fetchers]);

  return { weekly, monthly, yearly, loading };
}
