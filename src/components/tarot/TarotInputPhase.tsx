"use client";

import { motion } from "framer-motion";
import type { FortuneStatus } from "@/types/fortune";

interface Props {
  subtitle: string;
  placeholder: string;
  question: string;
  setQuestion: (v: string) => void;
  fortuneStatus: FortuneStatus | null;
  handleStartShuffle: () => void;
}

export default function TarotInputPhase({
  subtitle,
  placeholder,
  question,
  setQuestion,
  fortuneStatus,
  handleStartShuffle,
}: Props) {
  return (
    <motion.div
      key="input"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-6"
    >
      <p className="text-white/50 text-sm text-center">{subtitle}</p>
      <div className="w-full">
        <label className="block text-white/40 text-xs mb-2">질문 (선택)</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) =>
            !fortuneStatus?.exhausted && e.key === "Enter" && handleStartShuffle()
          }
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] placeholder-white/20 text-sm focus:outline-none focus:border-[#9382ff]/50 focus:bg-white/10 transition-colors"
        />
      </div>
      <button
        onClick={!fortuneStatus?.exhausted ? handleStartShuffle : undefined}
        disabled={fortuneStatus?.exhausted === true}
        className={`px-8 py-3 rounded-[5px] font-medium text-sm transition-colors ${
          fortuneStatus?.exhausted
            ? "bg-white/8 text-[#a8a6b7]/40 cursor-not-allowed"
            : "bg-[#5046e4] hover:bg-[#3d36c4] text-[#f4f0ff]"
        }`}
      >
        {fortuneStatus?.exhausted ? "오늘 타로를 이미 이용했어요" : "🃏 카드 섞기"}
      </button>
    </motion.div>
  );
}
