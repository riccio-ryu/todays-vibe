type Props = { label: string; value: string };

export default function LuckyBadge({ label, value }: Props) {
  return (
    <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-center">
      <p className="text-[#918ea0] text-xs mb-0.5">{label}</p>
      <p className="text-[#f4f0ff] text-sm font-medium">{value}</p>
    </div>
  );
}
