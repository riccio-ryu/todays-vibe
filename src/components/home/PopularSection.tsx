import Link from "next/link";
import { Flame } from "lucide-react";
import type { MenuItem } from "@/types/menu";

export interface RankedItem {
  item: MenuItem;
  count: number;
  rank: number;
}

const RANK_STYLES: Record<number, { badge: string; bar: string }> = {
  1: { badge: "text-yellow-400 font-bold", bar: "bg-yellow-400/60" },
  2: { badge: "text-slate-300 font-bold", bar: "bg-slate-300/50" },
  3: { badge: "text-amber-600 font-bold", bar: "bg-amber-600/50" },
};

const DEFAULT_STYLE = { badge: "text-white/30 font-semibold", bar: "bg-white/20" };

export default function PopularSection({
  rankedItems,
}: {
  rankedItems: RankedItem[];
}) {
  if (rankedItems.length === 0) return null;

  const maxCount = rankedItems[0].count;

  return (
    <div className="mb-8">
      <p className="flex items-center gap-1.5 text-[#a8a6b7]/70 text-xs font-medium uppercase tracking-widest mb-3">
        <Flame className="w-3 h-3" /> 오늘 인기 운세
      </p>

      <div className="rounded-2xl card-glow overflow-hidden divide-y divide-white/5">
        {rankedItems.map(({ item, count, rank }) => {
          const style = RANK_STYLES[rank] ?? DEFAULT_STYLE;
          const barWidth = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;

          return (
            <Link
              key={item.id}
              href={item.path}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors relative group"
            >
              {/* 진행 바 배경 */}
              <div
                className={`absolute inset-y-0 left-0 ${style.bar} opacity-30 transition-all duration-500`}
                style={{ width: `${barWidth}%` }}
              />

              {/* 순위 */}
              <span className={`relative w-6 text-center text-sm ${style.badge} shrink-0`}>
                {rank}
              </span>

              {/* 아이콘 */}
              <span className="relative text-xl shrink-0">{item.icon}</span>

              {/* 이름 */}
              <span className="relative flex-1 text-[#f4f0ff] text-sm font-medium leading-tight">
                {item.nameKo}
              </span>

              {/* 오늘 이용 수 */}
              {count > 0 && (
                <span className="relative text-[#a8a6b7]/60 text-xs shrink-0">
                  {count.toLocaleString()}회
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
