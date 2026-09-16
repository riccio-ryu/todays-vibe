// 꿈해몽 길몽/흉몽/양면적 표시 뱃지

const SIGN_STYLE: Record<string, string> = {
  길몽: "text-emerald-300 bg-emerald-900/20 border-emerald-400/20",
  흉몽: "text-rose-300 bg-rose-900/20 border-rose-400/20",
  양면적: "text-amber-300 bg-amber-900/20 border-amber-400/20",
};

interface Props {
  sign: string;
  /** 목록용 작은 크기 여부 */
  size?: "sm" | "md";
  className?: string;
}

export default function SignBadge({ sign, size = "md", className = "" }: Props) {
  const sizeCls = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";
  return (
    <span className={`rounded-full border ${sizeCls} ${SIGN_STYLE[sign]} ${className}`}>
      {sign}
    </span>
  );
}
