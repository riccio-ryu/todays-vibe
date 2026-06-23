"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import AILoadingIndicator from "@/components/common/AILoadingIndicator";
import AdSlot from "@/components/common/AdSlot";

type Props = {
  interpretRef: RefObject<HTMLDivElement | null>;
  interpretation: string;
  isLoading: boolean;
  onReset: () => void;
};

export default function TarotReadingResult({ interpretRef, interpretation, isLoading, onReset }: Props) {
  return (
    <motion.div
      ref={interpretRef}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 min-h-[120px]">
        <p className="text-white/40 text-xs mb-3">카드 해석</p>
        {isLoading && !interpretation && (
          <AILoadingIndicator type="tarot" />
        )}
        {interpretation && (
          <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
            {interpretation}
            {isLoading && <span className="animate-pulse text-purple-400">▌</span>}
          </p>
        )}
      </div>

      {/* 광고 — 해석 완료 후 노출 */}
      {!isLoading && interpretation && (
        <AdSlot slot="5693296487" className="rounded-xl" />
      )}

      {!isLoading && (
        <button
          onClick={onReset}
          className="w-full py-3 rounded-[5px] border border-white/10 text-[#a8a6b7]/50 hover:text-[#a8a6b7] hover:border-white/20 text-sm transition-colors"
        >
          새로운 배치로 다시 보기
        </button>
      )}
    </motion.div>
  );
}
