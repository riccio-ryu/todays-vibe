"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** 현재 잔여 별 (안내 문구용) */
  remaining?: number | null;
}

// 별(⭐)이 부족할 때 안내 + 프리미엄 유도 모달. LoginRequiredModal과 톤 통일.
export default function InsufficientCreditsModal({ isOpen, onClose, remaining }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  if (!isOpen) return null;

  const isPremiumCandidate = user; // 로그인 회원 → 프리미엄 유도

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#060317] border border-white/10 rounded-[16px] p-8 max-w-sm w-full mx-4 card-glow">
        <div className="text-center mb-6">
          <span className="text-4xl mb-4 block">⭐</span>
          <h2 className="text-white font-bold text-lg mb-2">오늘의 별을 다 썼어요</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            매일 자정에 별이 다시 충전돼요.
            {remaining != null && (
              <span className="block mt-1 text-white/35 text-xs">현재 잔여 ⭐{remaining}</span>
            )}
          </p>
        </div>

        <div className="space-y-3">
          {isPremiumCandidate ? (
            <button
              onClick={() => {
                onClose();
                router.push("/mypage");
              }}
              className="w-full py-2.5 rounded-[5px] bg-gradient-to-r from-[#92400e] to-[#d97706] text-[#fef3c7] font-medium text-sm hover:opacity-90 transition-opacity"
            >
              ✨ 프리미엄으로 더 많은 별 받기
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                router.push("/login");
              }}
              className="w-full py-2.5 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
            >
              로그인하고 별 받기
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-[5px] bg-white/8 text-[#a8a6b7] font-medium text-sm hover:bg-white/12 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
