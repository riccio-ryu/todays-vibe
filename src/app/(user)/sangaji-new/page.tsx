"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { drawSangaji, GRADE_INFO, type SangajiEntry } from "@/data/sangaji";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import FortuneResult from "@/components/fortune/FortuneResult";
import TodayFortuneCard from "@/components/common/TodayFortuneCard";
import FavoriteButton from "@/components/common/FavoriteButton";
import type { Phase } from "@/components/sangaji/SangajiScene3D";

const SangajiScene3D = dynamic(
  () => import("@/components/sangaji/SangajiStickScene"),
  { ssr: false, loading: () => null }
);

const STICK_COUNT = 25;

const GRADE_GRADIENT: Record<SangajiEntry["grade"], string> = {
  대길: "from-yellow-600 to-amber-500",
  길: "from-green-600 to-emerald-500",
  중길: "from-lime-600 to-green-500",
  소길: "from-emerald-700 to-teal-600",
  평: "from-slate-600 to-gray-500",
  흉: "from-orange-700 to-red-600",
  대흉: "from-red-800 to-red-600",
};

function GradeTag({ grade }: { grade: SangajiEntry["grade"] }) {
  const cls: Record<SangajiEntry["grade"], string> = {
    대길: "bg-yellow-500/20 border-yellow-400/60 text-yellow-300",
    길: "bg-green-500/20 border-green-400/60 text-green-300",
    중길: "bg-lime-500/20 border-lime-400/60 text-lime-300",
    소길: "bg-emerald-500/20 border-emerald-400/60 text-emerald-300",
    평: "bg-slate-500/20 border-slate-400/60 text-slate-300",
    흉: "bg-orange-500/20 border-orange-400/60 text-orange-300",
    대흉: "bg-red-500/20 border-red-400/60 text-red-300",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full border text-sm font-medium ${cls[grade]}`}>
      {GRADE_INFO[grade].label}
    </span>
  );
}

export default function SangajiPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [drawn, setDrawn] = useState<SangajiEntry | null>(null);
  const [question, setQuestion] = useState("");
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [sceneKey, setSceneKey] = useState(0);

  const { fortuneStatus } = useFortuneStatus("sangaji");
  const { result, isLoading, error, submit, reset: resetStream } = useFortuneStream();

  const isShaking = phase === "shaking";
  const isReady = phase === "ready";
  const isIdle = phase === "idle";
  const isDrawing = phase === "drawing";
  const isDrawn = phase === "drawn";

  function handleShake() {
    if (isShaking) return;
    setPhase("shaking");
    setPickedIdx(null);
    setShakeCount((c) => c + 1);
  }

  const handleShakeComplete = useCallback(() => setPhase("ready"), []);

  const handlePick = useCallback(
    (idx: number) => {
      if (phase !== "ready") return;
      setPickedIdx(idx);
      setPhase("drawing");
      setTimeout(() => {
        setDrawn(drawSangaji());
        setPhase("drawn");
      }, 1300);
    },
    [phase]
  );

  function handleReset() {
    setPhase("idle");
    setDrawn(null);
    setPickedIdx(null);
    setShakeCount(0);
    setSceneKey((k) => k + 1);
    resetStream();
  }

  async function handleAiRead() {
    if (!drawn) return;
    setPhase("ai");
    await submit("sangaji", {
      no: drawn.no,
      grade: drawn.grade,
      title: drawn.title,
      question: question.trim() || undefined,
    });
  }

  // ── AI 풀이 화면 ──
  if (phase === "ai") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-gray-900">
        <FortuneResult
          result={result}
          isLoading={isLoading}
          onReset={handleReset}
          title="산가지 점 풀이"
        />
        {error && (
          <p className="text-center text-red-400 text-sm mt-2 px-4">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-gray-900 text-white overflow-hidden">

      {/* ── 3D 캔버스 (결과 화면에서는 언마운트) ── */}
      {!isDrawn && (
        <div className="absolute inset-0" style={{ touchAction: "none" }}>
          <SangajiScene3D
            key={sceneKey}
            phase={phase}
            pickedIdx={pickedIdx}
            onPick={handlePick}
            onShakeComplete={handleShakeComplete}
          />
        </div>
      )}

      {/* ── UI 오버레이 ── */}
      {!isDrawn && (
        <div className="relative z-10 flex flex-col min-h-screen px-4 py-8 pointer-events-none">

          {/* 헤더 */}
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-amber-700/60 hover:text-amber-400/80 text-sm transition-colors mb-4 pointer-events-auto">
              <ArrowLeft className="w-4 h-4" /> 홈
            </Link>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-amber-200 drop-shadow-lg">산가지 점</h1>
                <FavoriteButton menuId="sangaji-new" />
              </div>
              <p className="text-amber-400/70 text-sm mt-1 drop-shadow">
                마음속 질문을 품고 막대를 흔드세요
              </p>
            </div>
          </div>

          {/* 질문 입력 */}
          <AnimatePresence>
            {(isIdle || isReady) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 pointer-events-auto"
              >
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="궁금한 것을 적어보세요 (선택)"
                  className="w-full max-w-xs mx-auto block bg-black/40 backdrop-blur-sm border border-amber-700/40 rounded-xl px-4 py-3 text-sm text-amber-100 placeholder-amber-700/50 resize-none focus:outline-none focus:border-amber-500/60"
                  rows={2}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />

          {/* 하단 버튼 */}
          <div className="pb-10 flex flex-col items-center gap-3 max-w-xs mx-auto w-full pointer-events-auto">

            {shakeCount > 0 && isReady && (
              <p className="text-amber-600/60 text-xs">{shakeCount}번 흔들었습니다</p>
            )}

            {/* 흔들기 버튼 */}
            {(isIdle || isReady || isShaking) && (
              <motion.button
                whileHover={!isShaking ? { scale: 1.04 } : {}}
                whileTap={!isShaking ? { scale: 0.96 } : {}}
                onClick={handleShake}
                disabled={isShaking}
                className="w-full py-3 rounded-full font-bold text-base text-amber-100 disabled:opacity-50 shadow-xl"
                style={{ background: "linear-gradient(to right, #92400e, #c2500a)" }}
              >
                {isShaking ? "흔드는 중..." : isReady ? "한 번 더 흔들기" : "산가지 흔들기"}
              </motion.button>
            )}

            {/* 뽑기 버튼 */}
            <AnimatePresence>
              {isReady && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex flex-col gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handlePick(Math.floor(Math.random() * STICK_COUNT))}
                    className="w-full py-3 rounded-full font-bold text-base text-yellow-100 border border-yellow-600/40 shadow-xl"
                    style={{ background: "linear-gradient(to right, #b45309, #d97706)" }}
                  >
                    산가지 뽑기
                  </motion.button>
                  <p className="text-center text-amber-700/60 text-xs">
                    또는 막대를 직접 터치해서 뽑으세요
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {isIdle && (
              <p className="text-amber-800/55 text-xs text-center">
                막대를 원하는 만큼 흔든 뒤 산가지를 뽑으세요
              </p>
            )}

            {isDrawing && (
              <p className="text-amber-400/70 text-sm animate-pulse">
                산가지를 읽는 중...
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 결과 카드 ── */}
      <AnimatePresence>
        {drawn && isDrawn && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative z-20 min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-gray-900 px-4 py-8"
          >
            <div className="max-w-sm mx-auto">
              <Link href="/" className="inline-flex items-center gap-1 text-amber-700/60 hover:text-amber-400/80 text-sm transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> 홈
              </Link>
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl font-bold text-amber-200">산가지 점</h1>
                  <FavoriteButton menuId="sangaji-new" />
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-amber-700/30 shadow-2xl mb-4">
                <div className={`bg-gradient-to-r ${GRADE_GRADIENT[drawn.grade]} px-6 py-4 text-center`}>
                  <div className="text-5xl font-bold text-white/90 mb-2">{drawn.no}번</div>
                  <GradeTag grade={drawn.grade} />
                </div>
                <div className="bg-amber-950/55 px-6 py-5">
                  <h2 className="text-xl font-bold text-amber-200 mb-3 text-center">{drawn.title}</h2>
                  <p className="text-amber-100/80 text-sm leading-relaxed text-center">
                    {drawn.description}
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full mb-4 py-2 text-sm text-amber-700/60 hover:text-amber-400 transition-colors"
              >
                처음부터 다시
              </button>

              {fortuneStatus?.exhausted ? (
                <div className="text-center py-3 text-amber-600/70 text-sm rounded-xl bg-amber-950/30 border border-amber-800/20">
                  오늘의 풀이를 모두 사용했습니다. 내일 다시 이용해 주세요.
                </div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAiRead}
                  className="w-full py-3 rounded-xl text-amber-100 font-semibold text-sm shadow-lg"
                  style={{ background: "linear-gradient(to right, #7c2d0a, #c05008)" }}
                >
                  심층 풀이 보기
                  {fortuneStatus &&
                    fortuneStatus.limit !== null &&
                    fortuneStatus.limit !== -1 && (
                      <span className="ml-2 text-amber-300/60 text-xs">
                        ({fortuneStatus.used}/{fortuneStatus.limit})
                      </span>
                    )}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "idle" && fortuneStatus?.todayReading && (
        <div className="relative z-20 max-w-sm mx-auto px-4 pb-8">
          <TodayFortuneCard
            label="오늘의 산가지 심층 풀이"
            todayReading={fortuneStatus.todayReading}
            highlightColor="text-amber-300"
            exhausted={fortuneStatus.exhausted}
          />
        </div>
      )}
    </div>
  );
}
