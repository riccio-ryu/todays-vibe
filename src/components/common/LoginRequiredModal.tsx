"use client";

import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  redirectPath: string;
}

export default function LoginRequiredModal({ isOpen, onClose, redirectPath }: Props) {
  const router = useRouter();

  if (!isOpen) return null;

  function handleLogin() {
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#060317] border border-white/10 rounded-[16px] p-8 max-w-sm w-full mx-4 card-glow">
        <div className="text-center mb-6">
          <span className="text-4xl mb-4 block">🔒</span>
          <h2 className="text-white font-bold text-lg mb-2">로그인이 필요합니다</h2>
          <p className="text-white/50 text-sm">이 운세는 회원만 이용할 수 있어요</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-2.5 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
          >
            로그인하기
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-[5px] bg-white/8 text-[#a8a6b7] font-medium text-sm hover:bg-white/12 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
