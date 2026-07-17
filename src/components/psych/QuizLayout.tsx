"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, RotateCcw } from "lucide-react";
import BackHomePill from "@/components/common/BackHomePill";
import AdSlot from "@/components/common/AdSlot";
import { shareOrCopyUrl } from "@/lib/utils/share";
import { scoreMbti, scoreCategory, scoreScale, type ScoreOutcome } from "@/lib/psych/engine";
import type {
  LogicPsychTest,
  MbtiTest,
  MbtiPole,
  MbtiResult,
  CategoryTest,
  CategoryResult,
  ScoreTest,
} from "@/data/psych/types";

interface Props {
  test: LogicPsychTest;
}

/**
 * 로직 계산형 심리 테스트 공통 레이아웃.
 * 선택지를 클라이언트에서 합산 → 결과 즉시 표시. AI 호출·로그인·사용 제한 없음.
 * engine("mbti" | "category" | "score")에 따라 채점·결과 렌더가 갈린다.
 */
export default function QuizLayout({ test }: Props) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const total = test.questions.length;

  function handleSelect(optionIndex: number) {
    const next = [...answers, optionIndex];
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    setDone(true);
  }

  function handleReset() {
    setStarted(false);
    setStep(0);
    setAnswers([]);
    setDone(false);
  }

  // ── 결과 화면 ──
  if (done) {
    if (test.engine === "mbti") {
      const poles = answers.map(
        (idx, qi) => test.questions[qi].options[idx].pole
      ) as MbtiPole[];
      const result = test.results[scoreMbti(poles)];
      return <MbtiResultView test={test} result={result} onReset={handleReset} />;
    }
    if (test.engine === "score") {
      const outcome = scoreScale(test, answers);
      return <ScoreResultView test={test} outcome={outcome} onReset={handleReset} />;
    }
    const result = scoreCategory(test, answers);
    return <CategoryResultView test={test} result={result} onReset={handleReset} />;
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
              <span>⚡ {total >= 15 ? "3분" : "1분"} 이내</span>
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
                {(test.questions[step].options as { label: string }[]).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
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

// ── MBTI 결과 뷰 ──
function MbtiResultView({
  test,
  result,
  onReset,
}: {
  test: MbtiTest;
  result: MbtiResult;
  onReset: () => void;
}) {
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

        <ResultButtons
          shareTitle={`나의 MBTI는 ${result.code} ${result.title}`}
          shareText={test.summary}
          onReset={onReset}
        />
      </motion.div>
    </div>
  );
}

// ── 카테고리 결과 뷰 ──
function CategoryResultView({
  test,
  result,
  onReset,
}: {
  test: CategoryTest;
  result: CategoryResult;
  onReset: () => void;
}) {
  const shareText = `[${test.title}] 내 결과는 '${result.title}' ${result.emoji}\n${result.headline}`;
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
          <span className="text-6xl block mb-3">{result.emoji}</span>
          <h1 className="text-white font-bold text-2xl">{result.title}</h1>
          <p className="text-[#9382ff]/90 text-sm mt-2">{result.headline}</p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-5">
          <p className="text-white/80 text-sm leading-relaxed">{result.description}</p>

          <div>
            <p className="text-[#9382ff] text-xs font-semibold uppercase tracking-widest mb-2">
              이런 매력이 있어요
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.traits.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full bg-[#9382ff]/15 border border-[#9382ff]/25 text-[#c9bfff] text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-[#5046e4]/25 to-[#2a2170]/20 border border-[#9382ff]/20 p-4">
            <p className="text-[#c9bfff] text-xs font-semibold uppercase tracking-widest mb-1.5">
              한 뼘 조언
            </p>
            <p className="text-white/85 text-sm leading-relaxed">{result.advice}</p>
          </div>
        </div>

        <AdSlot slot="5693296487" className="mt-5 rounded-xl" />

        <div className="mt-4">
          <ResultButtons
            shareTitle={`${test.title} 결과`}
            shareText={shareText}
            onReset={onReset}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ── 점수 척도 결과 뷰 ──
function ScoreResultView({
  test,
  outcome,
  onReset,
}: {
  test: ScoreTest;
  outcome: ScoreOutcome;
  onReset: () => void;
}) {
  const { band, total, maxTotal, axisScores } = outcome;
  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  const shareText = `[${test.title}] 내 결과는 '${band.title}' ${band.emoji}\n${total}/${maxTotal}점 · ${band.headline}`;

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
          <span className="text-6xl block mb-3">{band.emoji}</span>
          <h1 className="text-white font-bold text-2xl">{band.title}</h1>
          <p className="text-[#9382ff]/90 text-sm mt-2">{band.headline}</p>
        </div>

        {/* 총점 게이지 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">종합 점수</span>
            <span className="text-white font-bold text-lg tabular-nums">
              {total}<span className="text-white/30 text-sm font-normal"> / {maxTotal}</span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#5046e4] to-[#9382ff]"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* 축별 점수 (다축 테스트만) */}
          {axisScores.length > 1 && (
            <div className="mt-4 space-y-2.5">
              {axisScores.map((a) => {
                const apct = a.max > 0 ? Math.round((a.score / a.max) * 100) : 0;
                return (
                  <div key={a.key}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-white/55">{a.label}</span>
                      <span className="text-white/40 tabular-nums">{a.score}/{a.max}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        className="h-full bg-[#9382ff]/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${apct}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4">
          <p className="text-white/80 text-sm leading-relaxed">{band.description}</p>
          <div className="rounded-xl bg-gradient-to-br from-[#5046e4]/25 to-[#2a2170]/20 border border-[#9382ff]/20 p-4">
            <p className="text-[#c9bfff] text-xs font-semibold uppercase tracking-widest mb-1.5">이럴 땐 이렇게</p>
            <p className="text-white/85 text-sm leading-relaxed">{band.advice}</p>
          </div>
        </div>

        <AdSlot slot="5693296487" className="mt-5 rounded-xl" />

        <div className="mt-4">
          <ResultButtons
            shareTitle={`${test.title} 결과`}
            shareText={shareText}
            onReset={onReset}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ── 공통 버튼 ──
function ResultButtons({
  shareTitle,
  shareText,
  onReset,
}: {
  shareTitle: string;
  shareText: string;
  onReset: () => void;
}) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => shareOrCopyUrl(shareTitle, shareText)}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[5px] bg-[#5046e4] text-[#f4f0ff] font-medium text-sm hover:bg-[#3d36c4] transition-colors"
      >
        <Share2 className="w-4 h-4" /> 결과 공유하기
      </button>
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-[5px] bg-white/5 border border-white/10 text-white/70 font-medium text-sm hover:border-white/25 transition-colors"
      >
        <RotateCcw className="w-4 h-4" /> 다시
      </button>
    </div>
  );
}
