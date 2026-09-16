"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  menuId: string;
  className?: string;
}

export default function FavoriteButton({ menuId, className = "" }: Props) {
  const { user, loading } = useAuth();
  const [isFav, setIsFav] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setIsFav(false); return; }
    fetch("/api/user/favorites")
      .then((r) => r.json())
      .then((d) => setIsFav((d.favorites ?? []).includes(menuId)))
      .catch(() => setIsFav(false));
  }, [user, loading, menuId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || busy || isFav === null) return;
    const next = !isFav;
    setIsFav(next);
    setBusy(true);
    try {
      await fetch("/api/user/favorites", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId }),
      });
    } catch {
      setIsFav(!next);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) return null;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={isFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 select-none ${
        isFav
          ? "bg-[#9382ff]/20 border border-[#9382ff]/40 text-[#c4b8ff]"
          : "bg-white/5 border border-white/15 text-white/50 hover:text-white/80 hover:border-white/25"
      } ${className}`}
    >
      <Star className={`w-3.5 h-3.5 ${isFav ? "fill-[#c4b8ff] text-[#c4b8ff]" : ""}`} />
      즐겨찾기
    </button>
  );
}
