import Link from "next/link";
import { Zap } from "lucide-react";
import type { MenuItem } from "@/types/menu";

export default function QuickMenu({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="flex items-center gap-1.5 text-[#a8a6b7]/70 text-xs font-medium uppercase tracking-widest mb-3">
        <Zap className="w-3 h-3" /> 빠른 메뉴
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)` }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className="group flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl card-glow hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[#a8a6b7] group-hover:text-[#f4f0ff] text-xs font-medium text-center leading-tight transition-colors">
              {item.nameKo}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
