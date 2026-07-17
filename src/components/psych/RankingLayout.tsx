"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, RotateCcw } from "lucide-react";
import BackHomePill from "@/components/common/BackHomePill";
import AdSlot from "@/components/common/AdSlot";
import { shareOrCopyUrl } from "@/lib/utils/share";
import type { RankingTest } from "@/data/psych/types";

interface Props {
  test: RankingTest;
}

/**
 * 순위 매기기형 심리 테스트 레이아웃.
 * 항목을 소중한 순서대로 탭 → 선택 순서가 곧 순위. 1순위=끝까지 지킴, 꼴찌=먼저 포기.
 * API·로그인·별 소모 없음(로직형).
 */
export default function RankingLayout({ test }: Props) {
  const [started, setStarted] = useState(false);
  // 선택 순서대로 담긴 item key 배열 (앞 = 더 소중함)
  const [order, setOrder] = useState<string[]>([]);

  const total = test.items.length;
  const done = order.length === total;

  function pick(key: string) {
    if (order.includes(key)) return;
    setOrder((o) => [...o, key]);
  }

  function undo() {
    setOrder((o) => o.slice(0, -1));
  }

  function reset() {
    setStarted(false);
    setOrder([]);
  }

  const item = (key: string) => test.items.find((it) => it.key === key)!;

  // ── 결과 화면 ──
  if (done) {
    const kept = item(order[0]); // 1순위 = 끝까지 지킴
    const dropped = item(order[order.length - 1]); // 꼴찌 = 먼저 포기
    const shareText = `[${test.title}] 내가 끝까지 지킨 건 '${kept.symbol}' ${kept.emoji}, 가장 먼저 놓은 건 '${dropped.symbol}' ${dropped.emoji}`;

    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <BackHomePill href="/psych" label="심리 테스트" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-6">
            <p className="text-white/40 text-xs mb-2">{test.title}</p>
            <span className="text-6xl block mb-3">{kept.emoji}</span>
            <h1 className="text-white font-bold text-2xl">끝까지 지킨 건 &lsquo;{kept.symbol}&rsquo;</h1>
            <p className="text-[#9382ff]/90 text-sm mt-2">가장 먼저 내려놓은 건 &lsquo;{dropped.symbol}&rsquo; {dropped.emoji}</p>
          </div>

          {/* 끝까지 지킨 것 */}
          <div className="rounded-2xl bg-gradient-to-br from-[#5046e4]/25 to-[#2a2170]/20 border border-[#9382ff]/20 p-5 mb-3">
            <p className="text-[#c9bfff] text-xs font-semibold uppercase tracking-widest mb-2">
              🏆 당신이 가장 소중히 여기는 것
            </p>
            <p className="text-white/85 text-sm leading-relaxed">{kept.keptDesc}</p>
          </div>

          {/* 먼저 포기한 것 (반전) */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
              🌵 가장 먼저 포기한 것
            </p>
            <p className="text-white/80 text-sm leading-relaxed">{dropped.droppedDesc}</p>
          </div>

          {/* 전체 순위 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
              나의 가치 순위
            </p>
            <ol className="space-y-2">
              {order.map((key, i) => {
                const it = item(key);
                return (
                  <li key={key} className="flex items-center gap-3">
                    <span className="text-white/30 text-xs w-4 text-center tabular-nums">{i + 1}</span>
                    <span className="text-xl">{it.emoji}</span>
                    <span className="text-white/80 text-sm">{it.label}</span>
                    <span className="text-white/35 text-xs">— {it.symbol}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <AdSlot slot="5693296487" className="mt-5 rounded-xl" />

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => shareOrCopyUrl(`${test.title} 결과`, shareText)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
            >
              <Share2 className="w-4 h-4" /> 결과 공유하기
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[5px] bg-white/5 border border-white/10 text-white/70 font-medium text-sm hover:border-white/25 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 다시
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── 시작 / 선택 화면 ──
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <BackHomePill href="/psych" label="심리 테스트" />
      </div>

      {!started ? (
        <div className="text-center">
          <span className="text-5xl block mb-3">{test.icon}</span>
          <h1 className="text-white font-bold text-2xl mb-3">{test.title}</h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto mb-8">{test.intro}</p>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6 text-left">
            <p className="text-white/70 text-sm leading-relaxed">{test.scenario}</p>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
          >
            {test.icon} 시작하기
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/40 text-xs">{order.length} / {total} 선택</span>
              {order.length > 0 && (
                <button onClick={undo} className="text-[#9382ff] text-xs hover:text-[#c9bfff] transition-colors">
                  ← 되돌리기
                </button>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-[#5046e4]"
                animate={{ width: `${(order.length / total) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </div>

          <p className="text-white/85 font-semibold text-base leading-snug mb-1 text-center">
            {order.length === 0
              ? "가장 끝까지 함께하고 싶은 순서대로 골라주세요"
              : `${order.length + 1}번째로 소중한 것을 골라주세요`}
          </p>
          <p className="text-white/35 text-xs text-center mb-5">먼저 고를수록 더 소중한 것으로 기록돼요</p>

          <div className="grid grid-cols-1 gap-2.5">
            {test.items.map((it) => {
              const picked = order.includes(it.key);
              const rank = order.indexOf(it.key) + 1;
              return (
                <button
                  key={it.key}
                  onClick={() => pick(it.key)}
                  disabled={picked}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-[5px] border text-left transition-colors ${
                    picked
                      ? "bg-[#5046e4]/15 border-[#9382ff]/40 opacity-60"
                      : "bg-white/5 border-white/10 hover:bg-[#9382ff]/10 hover:border-[#9382ff]/40"
                  }`}
                >
                  <span className="text-2xl shrink-0">{it.emoji}</span>
                  <span className="flex-1 text-[#f4f0ff]/85 text-sm">{it.label}</span>
                  {picked && (
                    <span className="text-[#9382ff] text-xs font-semibold shrink-0 w-6 h-6 rounded-full bg-[#9382ff]/15 flex items-center justify-center tabular-nums">
                      {rank}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
