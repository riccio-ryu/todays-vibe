import FavoriteButton from "@/components/common/FavoriteButton";
import BackHomePill from "@/components/common/BackHomePill";

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
        <BackHomePill href={backHref} label={backLabel === "홈" ? undefined : backLabel} />
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
