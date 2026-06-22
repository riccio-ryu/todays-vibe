"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FortuneGrid from "./FortuneGrid";
import FavoritesSection from "@/components/home/FavoritesSection";
import type { MenuItem } from "@/types/menu";

interface Category {
  id: string;
  name: string;
  icon: string;
  order?: number;
}

interface Props {
  categories: Category[];
  fortunes: MenuItem[];
}

export default function HomeInteractive({ categories, fortunes }: Props) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    fetch("/api/user/favorites")
      .then((r) => r.json())
      .then((d) => setFavorites(d.favorites ?? []))
      .catch(() => {});
  }, [user]);

  const toggleFavorite = useCallback(async (menuId: string) => {
    const isFav = favorites.includes(menuId);

    // 낙관적 업데이트
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== menuId) : [...prev, menuId].slice(0, 8)
    );

    try {
      await fetch("/api/user/favorites", {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId }),
      });
    } catch {
      // 실패 시 롤백
      setFavorites((prev) =>
        isFav ? [...prev, menuId] : prev.filter((id) => id !== menuId)
      );
    }
  }, [favorites]);

  const favoriteItems = favorites
    .map((id) => fortunes.find((f) => f.id === id && f.ready))
    .filter(Boolean) as MenuItem[];

  return (
    <>
      <FavoritesSection items={favoriteItems} onRemove={toggleFavorite} />
      <FortuneGrid
        categories={categories}
        fortunes={fortunes}
        favorites={favorites}
        onFavoriteToggle={user ? toggleFavorite : undefined}
      />
    </>
  );
}
