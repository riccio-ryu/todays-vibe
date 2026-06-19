import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import type { MenuItem } from "@/types/menu";

export default function PopularSection({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="flex items-center gap-1.5 text-[#a8a6b7]/70 text-xs font-medium uppercase tracking-widest mb-3">
        <TrendingUp className="w-3 h-3" /> 많이 보는 운세
      </p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className="group relative flex flex-col rounded-2xl overflow-hidden card-glow hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="relative flex flex-col flex-1 p-4">
              <span className="text-3xl mb-2">{item.icon}</span>
              <h3 className="text-[#f4f0ff] font-medium text-sm mb-1 leading-tight">
                {item.nameKo}
              </h3>
              <p className="text-[#a8a6b7] text-xs leading-snug line-clamp-2 flex-1">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1">
                  {item.isAI && (
                    <span className="text-[10px] font-medium text-[#9382ff] bg-[#9382ff]/10 px-1.5 py-0.5 rounded-full">
                      AI
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-0.5 text-[#a8a6b7]/60 text-xs group-hover:text-[#9382ff] transition-colors">
                  시작하기 <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
