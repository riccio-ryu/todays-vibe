"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { MenuItem } from "@/types/menu";

interface Props {
  items: MenuItem[];
  onRemove: (menuId: string) => void;
}

export default function FavoritesSection({ items, onRemove }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="flex items-center gap-1.5 text-[#a8a6b7]/70 text-xs font-medium uppercase tracking-widest mb-3">
        <Star className="w-3 h-3 fill-current" /> 즐겨찾기
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)` }}
      >
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <Link
              href={item.path}
              className="flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl card-glow hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[#a8a6b7] group-hover:text-[#f4f0ff] text-xs font-medium text-center leading-tight transition-colors">
                {item.nameKo}
              </span>
            </Link>
            {/* 제거 버튼 */}
            <button
              onClick={(e) => { e.preventDefault(); onRemove(item.id); }}
              className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-white/0 hover:bg-white/15 text-yellow-400/60 hover:text-yellow-400 transition-all opacity-0 group-hover:opacity-100"
              title="즐겨찾기 해제"
            >
              <Star className="w-3 h-3 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
