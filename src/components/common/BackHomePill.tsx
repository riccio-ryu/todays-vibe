import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

interface Props {
  /** 이동 경로 (기본: 홈) */
  href?: string;
  /** 텍스트 라벨 — 없으면 Home 아이콘 표시 */
  label?: string;
  /** ArrowLeft 아이콘 표시 여부 */
  arrow?: boolean;
  className?: string;
}

/** 페이지 상단 뒤로가기/홈 pill 링크 */
export default function BackHomePill({ href = "/", label, arrow = true, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-xs transition-all ${className}`}
    >
      {arrow && <ArrowLeft className="w-3.5 h-3.5" />}
      {label ?? <Home className="w-3.5 h-3.5" />}
    </Link>
  );
}
