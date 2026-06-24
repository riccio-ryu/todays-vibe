"use client";

import { motion } from "framer-motion";

type TodayReading = { result: string; createdAt: string | null } | null;

type Props = {
  todayReading: TodayReading;
  onReshuffle?: () => void;
};

export default function TarotTodayResult({ todayReading, onReshuffle }: Props) {
  if (!todayReading) return null;

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: "타로 해석 결과 | 오늘운", url: window.location.href })
        .catch((e) => { if (e?.name !== "AbortError") throw e; });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사됐어요!");
    }
  }

  return (
    <motion.div
      key="today-result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs">오늘의 타로 결과</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/40 text-xs">카드 해석</p>
          {todayReading.createdAt && (
            <span className="text-white/30 text-xs">
              {new Date(todayReading.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 열람
            </span>
          )}
        </div>
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
          {todayReading.result}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 py-3 rounded-[5px] bg-[#5046e4]/30 border border-[#9382ff]/25 text-[#9382ff] text-sm font-medium hover:bg-[#5046e4]/50 transition-colors"
        >
          📤 공유하기
        </button>
        {onReshuffle && (
          <button
            onClick={onReshuffle}
            className="flex-1 py-3 rounded-[5px] border border-white/15 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
          >
            🃏 카드 다시 섞기
          </button>
        )}
      </div>
    </motion.div>
  );
}
