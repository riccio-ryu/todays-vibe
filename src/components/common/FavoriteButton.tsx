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
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-90 ${
        isFav
          ? "text-yellow-400"
          : "text-white/50 hover:text-yellow-400"
      } ${className}`}
    >
      <Star className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
    </button>
  );
}
