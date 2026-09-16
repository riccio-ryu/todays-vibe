"use client";

import { UserCircle } from "lucide-react";
import type { SavedBirthInfo } from "@/lib/hooks/useBirthInfo";

interface Props {
  savedInfo: SavedBirthInfo;
  isOtherMode: boolean;
  onOtherMode: () => void;
  onRestoreMyInfo: () => void;
}

export default function SavedBirthBanner({
  savedInfo,
  isOtherMode,
  onOtherMode,
  onRestoreMyInfo,
}: Props) {
  const genderLabel = savedInfo.gender === "male" ? "남성" : "여성";
  const lunarLabel = savedInfo.isLunar ? " (음력)" : "";
  const infoText = `${savedInfo.year}년 ${savedInfo.month}월 ${savedInfo.day}일${lunarLabel} · ${genderLabel}`;

  if (isOtherMode) {
    return (
      <button
        type="button"
        onClick={onRestoreMyInfo}
        className="w-full mb-4 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/70 text-sm transition-all flex items-center gap-2"
      >
        <UserCircle className="w-4 h-4 shrink-0" />
        내 정보로 돌아가기
      </button>
    );
  }

  return (
    <div className="mb-4 px-4 py-3 rounded-xl bg-[#5046e4]/10 border border-[#9382ff]/20 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <UserCircle className="w-4 h-4 text-[#9382ff] shrink-0" />
        <div className="min-w-0">
          <p className="text-[#9382ff] text-xs font-medium">저장된 내 정보</p>
          <p className="text-white/70 text-sm truncate">{infoText}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOtherMode}
        className="shrink-0 text-xs text-white/40 hover:text-white/70 transition-colors whitespace-nowrap"
      >
        다른 사람
      </button>
    </div>
  );
}
