"use client";

import { motion } from "framer-motion";

interface Props {
  onInterpret: () => void;
  onReset: () => void;
}

export default function TarotActionButtons({ onInterpret, onReset }: Props) {
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
