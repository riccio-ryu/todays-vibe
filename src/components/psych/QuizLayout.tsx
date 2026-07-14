"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, RotateCcw } from "lucide-react";
import BackHomePill from "@/components/common/BackHomePill";
import { shareOrCopyUrl } from "@/lib/utils/share";
import { scoreMbti } from "@/lib/psych/engine";
import type { MbtiPole, MbtiTest } from "@/data/psych/types";

interface Props {
  test: MbtiTest;
}

/**
 * 로직 계산형 심리 테스트 공통 레이아웃 (MBTI 엔진).
 * 선택지를 클라이언트에서 합산 → 결과 즉시 표시. AI 호출·로그인·사용 제한 없음.
 */
export default function QuizLayout({ test }: Props) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [poles, setPoles] = useState<MbtiPole[]>([]);
  const [code, setCode] = useState<string | null>(null);

  const total = test.questions.length;
  const result = code ? test.results[code] : null;

  function handleSelect(pole: MbtiPole) {
    const next = [...poles, pole];
    setPoles(next);
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    setCode(scoreMbti(next));
  }

  function handleReset() {
    setStarted(false);
    setStep(0);
    setPoles([]);
    setCode(null);
  }

  // ── 결과 화면 ──
  if (result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <BackHomePill href="/psych" label="심리 테스트" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <span className="text-6xl block mb-3">{result.icon}</span>
          <p className="text-[#9382ff] text-sm font-semibold tracking-widest mb-1">
            {result.code}
          </p>
          <h1 className="text-white font-bold text-2xl mb-2">{result.title}</h1>
          <p className="text-white/60 text-sm mb-6">{result.tagline}</p>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-left mb-4">
            <p className="text-white/80 text-sm leading-relaxed">{result.body}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-[#9382ff] text-xs font-semibold mb-2">💪 강점</p>
              <ul className="space-y-1.5">
                {result.strengths.map((s) => (
                  <li key={s} className="text-white/70 text-sm">· {s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-[#e4a446] text-xs font-semibold mb-2">🍃 조심할 점</p>
              <ul className="space-y-1.5">
                {result.cautions.map((c) => (
                  <li key={c} className="text-white/70 text-sm">· {c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => shareOrCopyUrl(`나의 MBTI는 ${result.code} ${result.title}`, test.summary)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
            >
              <Share2 className="w-4 h-4" /> 결과 공유하기
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[5px] bg-white/5 border border-white/10 text-white/70 font-medium text-sm hover:border-white/25 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 다시
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── 시작 / 문항 화면 ──
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <BackHomePill href="/psych" label="심리 테스트" />
      </div>

      {!started ? (
        <div className="text-center">
          <span className="text-5xl block mb-3">{test.icon}</span>
          <h1 className="text-white font-bold text-2xl mb-3">{test.title}</h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto mb-8">
            {test.intro}
          </p>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6 text-left">
            <p className="text-white/40 text-xs mb-2">이 테스트는</p>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <span>📝 {total}문항</span>
              <span>⚡ 3분 이내</span>
              <span>🔢 즉시 결과</span>
            </div>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
          >
            {test.icon} 테스트 시작하기
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/40 text-xs">
                {step + 1} / {total}
              </span>
              <span className="text-[#9382ff] text-xs">{test.title}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-[#5046e4]"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / total) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              <h2 className="text-white font-semibold text-lg leading-snug mb-6">
                {test.questions[step].q}
              </h2>
              <div className="space-y-3">
                {test.questions[step].options.map((opt) => (
                  <button
                    key={opt.pole + opt.label}
                    onClick={() => handleSelect(opt.pole)}
                    className="w-full text-left px-4 py-3.5 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff]/85 text-sm hover:bg-[#9382ff]/10 hover:border-[#9382ff]/40 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
