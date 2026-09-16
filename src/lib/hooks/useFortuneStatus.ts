"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { FortuneStatus } from "@/types/fortune";

export function useFortuneStatus(menuId: string, subKey?: string) {
  const { user } = useAuth();
  const [fortuneStatus, setFortuneStatus] = useState<FortuneStatus | null>(null);

  const refresh = useCallback(() => {
    if (!user) return;
    const q = subKey ? `&slug=${encodeURIComponent(subKey)}` : "";
    fetch(`/api/user/fortune-status?menuId=${menuId}${q}`)
      .then((r) => r.json())
      .then((d) => setFortuneStatus(d))
      .catch(() => {});
  }, [user, menuId, subKey]);

  useEffect(() => { refresh(); }, [refresh]);

  return { fortuneStatus, refreshFortuneStatus: refresh };
}
