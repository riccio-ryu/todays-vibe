"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import FortuneResult from "@/components/fortune/FortuneResult";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import BackHomePill from "@/components/common/BackHomePill";
import FavoriteButton from "@/components/common/FavoriteButton";
import type { PsychTest } from "@/data/psych-tests";

const MENU_ID = "psych-test";

interface Props {
  test: PsychTest;
}

export default function PsychTestQuiz({ test }: Props) {
  const { user, loading } = useAuth();
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus(MENU_ID);

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showLogin, setShowLogin] = useState(false);

  const total = test.questions.length;
  const exhausted = fortuneStatus?.exhausted === true;

  // 결과/로딩/에러 → 기존 FortuneResult 재사용
  if (result || isLoading || error) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        error={error}
        onReset={() => {
          reset();
          setStarted(false);
          setStep(0);
          setAnswers([]);
        }}
        title={`${test.title} 결과`}
        icon={test.icon}
      />
    );
  }

  function handleStart() {
    if (loading) return;
    if (!user) {
      setShowLogin(true);
      return;
    }
    setStarted(true);
  }

  async function handleSelect(option: string) {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);

    if (step < total - 1) {
      setStep(step + 1);
      return;
    }

    // 마지막 문항 → 제출
    const payload = {
      testSlug: test.slug,
      testTitle: test.title,
      answers: test.questions.map((q, i) => ({
        question: q.q,
        answer: nextAnswers[i],
      })),
    };
    await submit(MENU_ID, payload);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <LoginRequiredModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        redirectPath={`/psych-test/${test.slug}`}
      />

      <div className="flex items-center justify-between mb-6">
        <BackHomePill href="/psych-test" label="심리 테스트" />
        <FavoriteButton menuId={MENU_ID} />
      </div>

      {/* 시작 화면 */}
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
              <span>⚡ 1분 이내</span>
              <span>✦ AI 해석</span>
            </div>
          </div>

          {exhausted ? (
            <div className="w-full py-3 rounded-[5px] bg-white/8 text-[#a8a6b7]/50 text-sm font-medium">
              오늘 심리 테스트를 이미 이용했어요
            </div>
          ) : (
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
            >
              {test.icon} 테스트 시작하기
            </button>
          )}
          {!user && !loading && (
            <p className="text-white/35 text-xs mt-3">로그인하면 이용할 수 있어요</p>
          )}
        </div>
      ) : (
        /* 문항 화면 */
        <div>
          {/* 진행 바 */}
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
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className="w-full text-left px-4 py-3.5 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff]/85 text-sm hover:bg-[#9382ff]/10 hover:border-[#9382ff]/40 transition-colors"
                  >
                    {opt}
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
