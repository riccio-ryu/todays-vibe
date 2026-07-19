"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import InsufficientCreditsModal from "./InsufficientCreditsModal";

interface CreditsState {
  /** 전역 잔여 별 (null = 무제한 / 비로그인) */
  remaining: number | null;
  /** 하루 지급 별 (-1 = 무제한) */
  grant: number;
  loading: boolean;
  /** 소모 후 재조회 (헤더 즉시 갱신) */
  refresh: () => void;
  /** 별 부족 안내 모달 열기 (폼·429 응답에서 호출) */
  openInsufficient: () => void;
}

const CreditsContext = createContext<CreditsState>({
  remaining: null,
  grant: 0,
  loading: true,
  refresh: () => {},
  openInsufficient: () => {},
});

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [grant, setGrant] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInsufficient, setShowInsufficient] = useState(false);

  const refresh = useCallback(() => {
    if (!user) {
      setRemaining(null);
      setGrant(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/user/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setRemaining(d.remaining);
          setGrant(d.grant);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // 로그인 상태 변경 시 + 페이지 이동 시(어떤 폼에서 소모했든) 재조회
  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  const openInsufficient = useCallback(() => setShowInsufficient(true), []);

  return (
    <CreditsContext.Provider value={{ remaining, grant, loading, refresh, openInsufficient }}>
      {children}
      <InsufficientCreditsModal
        isOpen={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        remaining={remaining}
      />
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
