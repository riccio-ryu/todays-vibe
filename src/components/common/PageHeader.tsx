import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  badge?: string;
  menuId?: string;
}

export default function PageHeader({
  title,
  backHref = "/",
  backLabel = "홈",
  badge = "✦",
  menuId,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <Link
          href={backHref}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel === "홈" ? <Home className="w-3.5 h-3.5" /> : backLabel}
        </Link>
        <div className="flex items-center gap-2">
          {menuId && <FavoriteButton menuId={menuId} />}
          {badge && (
            <span className="text-[10px] text-[#9382ff] bg-[#9382ff]/10 px-2 py-0.5 rounded-[32px] border border-[#9382ff]/20">
              {badge}
            </span>
          )}
        </div>
      </div>
      <h1 className="text-white font-semibold text-lg">{title}</h1>
    </div>
  );
}
