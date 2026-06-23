import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  badge?: string;
}

export default function PageHeader({
  title,
  backHref = "/",
  backLabel = "홈",
  badge = "✦",
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <Link
        href={backHref}
        className="text-white/40 hover:text-white/70 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4 inline mr-1" />
        {backLabel}
      </Link>
      <span className="text-white/20">|</span>
      <h1 className="text-white font-semibold text-lg">{title}</h1>
      {badge && (
        <span className="ml-auto text-[10px] text-[#9382ff] bg-[#9382ff]/10 px-2 py-0.5 rounded-[32px] border border-[#9382ff]/20">
          {badge}
        </span>
      )}
    </div>
  );
}
