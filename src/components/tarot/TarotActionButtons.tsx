"use client";

import { motion } from "framer-motion";

interface Props {
  onInterpret: () => void;
  onReset: () => void;
  exhausted?: boolean;
}

export default function TarotActionButtons({ onInterpret, onReset, exhausted }: Props) {
  if (exhausted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full space-y-3"
      >
        <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 px-4 py-3 text-center">
          <p className="text-amber-300 text-sm font-medium">오늘 해석을 이미 이용했어요</p>
          <p className="text-white/40 text-xs mt-1">내일 다시 해석받거나 플랜을 업그레이드하세요</p>
        </div>
        <button
          onClick={onReset}
          className="w-full py-3 rounded-[5px] border border-white/10 text-[#a8a6b7]/50 hover:text-[#a8a6b7] hover:border-white/20 text-sm transition-colors"
        >
          다시 섞기
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex gap-3 w-full"
    >
      <button
        onClick={onInterpret}
        className="flex-1 py-3 rounded-[5px] bg-[#5046e4] hover:bg-[#3d36c4] text-[#f4f0ff] font-medium text-sm transition-colors"
      >
        ✨ 해석 받기
      </button>
      <button
        onClick={onReset}
        className="px-4 py-3 rounded-[5px] border border-white/10 text-[#a8a6b7]/50 hover:text-[#a8a6b7] text-sm transition-colors"
      >
        다시
      </button>
    </motion.div>
  );
}
