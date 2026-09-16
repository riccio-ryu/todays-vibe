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
import { useCredits } from "@/components/credits/CreditsProvider";
import type { AiTest } from "@/data/psych";

const MENU_ID = "psych-test";

interface Props {
  test: AiTest;
}

/**
 * AI 해석형 심리 테스트 레이아웃.
 * quiz 모드(4지선다) / text 모드(자유 텍스트 입력) → /api/fortune("psych-test") 스트리밍. 회원 전용.
 */
export default function AiQuizLayout({ test }: Props) {
  if ("fields" in test && test.fields) {
    return <AiTextLayout test={test} />;
  }
  return <AiQuizInner test={test} />;
}

// ── 4지선다형 ──
function AiQuizInner({ test }: { test: Extract<AiTest, { questions: unknown[] }> }) {
  const { user, loading } = useAuth();
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus(MENU_ID, test.slug);
  const { refresh: refreshCredits, openInsufficient } = useCredits();

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showLogin, setShowLogin] = useState(false);

  const total = test.questions.length;
  const exhausted = fortuneStatus?.exhausted === true;

  function restart() {
    setStarted(false);
    setStep(0);
    setAnswers([]);
    reset();
  }

  // 결과/로딩/에러 → 기존 FortuneResult 재사용
  if (result || isLoading || error) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        error={error}
        onReset={restart}
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

  async function handleSelect(optionIndex: number) {
    const next = [...answers, optionIndex];
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    await submit(MENU_ID, {
      testSlug: test.slug,
      testTitle: test.title,
      answers: test.questions.map((q, i) => ({
        question: q.q,
        answer: q.options[next[i]],
      })),
    });
    refreshCredits(); // 별 소모 후 헤더 잔량 갱신
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <LoginRequiredModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        redirectPath={`/psych/${test.slug}`}
      />

      <div className="flex items-center justify-between mb-6">
        <BackHomePill href="/psych" label="심리 테스트" />
        <FavoriteButton menuId={MENU_ID} />
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
              <span>⚡ 1분 이내</span>
              <span>✦ AI 해석{fortuneStatus?.cost ? ` ⭐${fortuneStatus.cost}` : ""}</span>
            </div>
          </div>

          {exhausted ? (
            <button
              onClick={openInsufficient}
              className="w-full py-3 rounded-[5px] bg-amber-500/15 border border-amber-400/30 text-amber-200 text-sm font-medium hover:bg-amber-500/25 transition-colors"
            >
              ⭐ 오늘의 별이 부족해요 · 자세히
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
            >
              {test.icon} 테스트 시작하기
            </button>
          )}
          {!user && !loading && (
            <p className="text-white/35 text-xs mt-3">AI 해석은 로그인하면 이용할 수 있어요</p>
          )}
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
                {test.questions[step].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
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

// ── 자유 텍스트 입력형 ──
function AiTextLayout({ test }: { test: Extract<AiTest, { fields: unknown[] }> }) {
  const { user, loading } = useAuth();
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus(MENU_ID, test.slug);
  const { refresh: refreshCredits, openInsufficient } = useCredits();

  const [values, setValues] = useState<Record<string, string>>({});
  const [showLogin, setShowLogin] = useState(false);

  const exhausted = fortuneStatus?.exhausted === true;
  const canSubmit = test.fields.every(
    (f) => (values[f.key]?.trim().length ?? 0) >= (f.minLength ?? 1)
  );

  if (result || isLoading || error) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        error={error}
        onReset={() => { reset(); setValues({}); }}
        title={`${test.title} 결과`}
        icon={test.icon}
      />
    );
  }

  async function handleSubmit() {
    if (loading) return;
    if (!user) { setShowLogin(true); return; }
    if (!canSubmit || exhausted) return;
    await submit(MENU_ID, {
      testSlug: test.slug,
      testTitle: test.title,
      answers: test.fields.map((f) => ({
        question: f.label,
        answer: values[f.key]?.trim() ?? "",
      })),
    });
    refreshCredits();
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <LoginRequiredModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        redirectPath={`/psych/${test.slug}`}
      />

      <div className="flex items-center justify-between mb-6">
        <BackHomePill href="/psych" label="심리 테스트" />
        <FavoriteButton menuId={MENU_ID} />
      </div>

      <div className="text-center mb-6">
        <span className="text-5xl block mb-3">{test.icon}</span>
        <h1 className="text-white font-bold text-2xl mb-3">{test.title}</h1>
        <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">{test.intro}</p>
      </div>

      <div className="space-y-5">
        {test.fields.map((f) => {
          const len = values[f.key]?.trim().length ?? 0;
          const min = f.minLength ?? 1;
          return (
            <div key={f.key}>
              <label className="block text-white/70 text-sm font-medium mb-2">{f.label}</label>
              <textarea
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                rows={f.rows ?? 5}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm placeholder-white/25 focus:outline-none focus:border-[#9382ff]/50 transition-colors resize-none"
              />
              {min > 1 && (
                <p className={`text-xs mt-1 text-right ${len >= min ? "text-white/30" : "text-white/40"}`}>
                  {len} / 최소 {min}자
                </p>
              )}
            </div>
          );
        })}

        {exhausted ? (
          <button
            onClick={openInsufficient}
            className="w-full py-3 rounded-[5px] bg-amber-500/15 border border-amber-400/30 text-amber-200 text-sm font-medium hover:bg-amber-500/25 transition-colors"
          >
            ⭐ 오늘의 별이 부족해요 · 자세히
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 rounded-[5px] font-medium text-sm transition-colors ${
              canSubmit
                ? "bg-[#5046e4] text-[#f4f0ff] hover:bg-[#3d36c4]"
                : "bg-white/8 text-[#a8a6b7]/40 cursor-not-allowed"
            }`}
          >
            {test.icon} AI 분석받기{fortuneStatus?.cost ? ` (⭐${fortuneStatus.cost})` : ""}
          </button>
        )}
        {!user && !loading && (
          <p className="text-white/35 text-xs text-center">AI 분석은 로그인하면 이용할 수 있어요</p>
        )}
      </div>
    </div>
  );
}
