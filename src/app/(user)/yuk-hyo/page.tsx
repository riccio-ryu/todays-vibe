"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { getHexagramByLines, HEXAGRAMS } from "@/data/iching";
import { type YukHyoInput } from "@/types/fortune";
import FortuneResult from "@/components/fortune/FortuneResult";
import TodayFortuneCard from "@/components/common/TodayFortuneCard";

// 효 값별 이름
const LINE_NAMES: Record<number, { ko: string; type: "yang" | "yin"; changing: boolean }> = {
  9: { ko: "노양(老陽)", type: "yang", changing: true },
  7: { ko: "소양(少陽)", type: "yang", changing: false },
  8: { ko: "소음(少陰)", type: "yin", changing: false },
  6: { ko: "노음(老陰)", type: "yin", changing: true },
};

function isYang(v: number) { return v === 7 || v === 9; }
function isChanging(v: number) { return v === 6 || v === 9; }

// 복희 선천 64괘도 위치 계산
function getFuxiPos(linesStr: string): number {
  const u = +linesStr[5] * 4 + +linesStr[4] * 2 + +linesStr[3];
  const l = +linesStr[2] * 4 + +linesStr[1] * 2 + +linesStr[0];
  return (7 - u) * 8 + (7 - l);
}
function posToXY(pos: number): [number, number] {
  const rad = (pos * 5.625 - 90) * (Math.PI / 180);
  return [400 + 170 * Math.cos(rad), 400 + 170 * Math.sin(rad)];
}

function DiagramOverlay({ matchingPositions, changedPos, done, linesLen }: {
  matchingPositions: number[];
  changedPos: number | null;
  done: boolean;
  linesLen: number;
}) {
  return (
    <svg viewBox="0 0 800 800" className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ transform: "scale(1.46)", transformOrigin: "center" }}>
      {done
        ? matchingPositions.map(pos => {
            const [x, y] = posToXY(pos);
            return (
              <g key={pos}>
                <motion.circle cx={x} cy={y} r={36} fill="none" stroke="#f59e0b" strokeWidth={1.2}
                  initial={{ opacity: 0 }} animate={{ opacity: [0.6, 0.15, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                <motion.circle cx={x} cy={y} r={26} fill="#f59e0b" fillOpacity={0.18} stroke="#fbbf24" strokeWidth={2}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.2, 0, 0.2, 1] }} />
                <motion.circle cx={x} cy={y} r={3.5} fill="#fbbf24"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.15 }} />
              </g>
            );
          })
        : matchingPositions.map(pos => {
            const [x, y] = posToXY(pos);
            return (
              <motion.circle key={`${pos}-${linesLen}`} cx={x} cy={y} r={4} fill="#f59e0b"
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.7, scale: 1 }}
                transition={{ duration: 0.25 }} />
            );
          })
      }
      {/* 지괘 하이라이트 (파란색) */}
      {done && changedPos !== null && (
        <g>
          <motion.circle cx={posToXY(changedPos)[0]} cy={posToXY(changedPos)[1]} r={36}
            fill="none" stroke="#60a5fa" strokeWidth={1.2}
            initial={{ opacity: 0 }} animate={{ opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
          <motion.circle cx={posToXY(changedPos)[0]} cy={posToXY(changedPos)[1]} r={26}
            fill="#3b82f6" fillOpacity={0.15} stroke="#60a5fa" strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }} />
          <motion.circle cx={posToXY(changedPos)[0]} cy={posToXY(changedPos)[1]} r={3.5}
            fill="#93c5fd" initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.45 }} />
        </g>
      )}
    </svg>
  );
}

// 효 표시 — 변효는 색상 강조
function HexLine({ value, isNew }: { value: number | null; isNew: boolean }) {
  if (value === null) {
    return (
      <div className="flex items-center justify-center gap-1.5 h-5">
        <div className="h-px w-full bg-white/10 rounded-full" />
      </div>
    );
  }
  const yang = isYang(value);
  const changing = isChanging(value);
  const lineColor = changing
    ? isNew ? "bg-red-400" : "bg-red-300/60"
    : isNew ? "bg-amber-400" : "bg-amber-300/70";

  return (
    <motion.div initial={{ opacity: 0, scaleX: 0.4 }} animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.35 }}
      className={`relative flex items-center justify-center gap-1.5 h-5 ${isNew ? "opacity-100" : "opacity-70"}`}>
      {yang ? (
        <div className={`h-1.5 w-full rounded-full ${lineColor}`} />
      ) : (
        <>
          <div className={`h-1.5 w-[45%] rounded-full ${lineColor}`} />
          <div className="w-[10%]" />
          <div className={`h-1.5 w-[45%] rounded-full ${lineColor}`} />
        </>
      )}
      {changing && (
        <span className={`absolute right-0 text-[9px] font-bold ${isNew ? "text-red-400" : "text-red-300/60"}`}>
          {value === 9 ? "○" : "×"}
        </span>
      )}
    </motion.div>
  );
}

function Coin({ face, spinning, delay }: { face: "H" | "T" | null; spinning: boolean; delay: number }) {
  return (
    <div style={{ perspective: "500px" }} className="w-12 h-12 flex-shrink-0">
      <motion.div
        className={`w-full h-full rounded-full flex flex-col items-center justify-center gap-0.5 border-2 ${
          face === "H" ? "bg-amber-500/30 border-amber-400/60"
          : face === "T" ? "bg-slate-600/40 border-slate-400/40"
          : spinning ? "bg-white/10 border-white/20"
          : "bg-white/5 border-white/10"
        }`}
        animate={{ rotateY: spinning ? 360 : 0 }}
        transition={spinning ? { duration: 0.22, ease: "linear", repeat: Infinity, delay } : { duration: 0.05 }}
      >
        {face === "H" ? (
          <><span className="text-amber-200 text-[11px] font-bold leading-none">앞</span>
          <span className="text-amber-400/70 text-[9px] leading-none">☯</span></>
        ) : face === "T" ? (
          <span className="text-slate-300 text-[11px] font-bold leading-none">뒤</span>
        ) : (
          <span className="text-white/20 text-[11px] font-bold leading-none">?</span>
        )}
      </motion.div>
    </div>
  );
}

export default function YukHyoPage() {
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("yuk-hyo");

  const [question, setQuestion] = useState("");
  const [lineValues, setLineValues] = useState<number[]>([]); // 6/7/8/9
  const [coins, setCoins] = useState<("H" | "T")[]>([]);
  const [throwing, setThrowing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const done = lineValues.length === 6;
  const yangLines = lineValues.map(v => isYang(v));
  const hexagram = done ? getHexagramByLines(yangLines) : null;

  // 지괘: 변효를 뒤집은 괘
  const changedYangLines = done
    ? yangLines.map((yang, i) => isChanging(lineValues[i]) ? !yang : yang)
    : [];
  const hasChanging = done && lineValues.some(v => isChanging(v));
  const changedHexagram = (done && hasChanging) ? getHexagramByLines(changedYangLines) : null;

  // 괘도 하이라이트
  const matchingLines = lineValues.length > 0
    ? yangLines.slice(0, lineValues.length)
    : [];
  const matchingPositions = matchingLines.length > 0
    ? HEXAGRAMS
        .filter(h => matchingLines.every((yang, i) => (h.lines[i] === "1") === yang))
        .map(h => getFuxiPos(h.lines))
    : [];
  const changedPos = (done && changedHexagram)
    ? getFuxiPos(changedHexagram.lines)
    : null;

  function handleThrow() {
    if (throwing || done) return;
    const newCoins: ("H" | "T")[] = [
      Math.random() < 0.5 ? "H" : "T",
      Math.random() < 0.5 ? "H" : "T",
      Math.random() < 0.5 ? "H" : "T",
    ];
    setThrowing(true);
    setSpinning(true);
    setCoins([]);
    setTimeout(() => { setCoins(newCoins); setSpinning(false); }, 900);
    setTimeout(() => {
      // H=3, T=2 → 합산으로 효 값 결정
      const sum = newCoins.reduce((acc, c) => acc + (c === "H" ? 3 : 2), 0);
      setLineValues(prev => [...prev, sum]);
      setThrowing(false);
    }, 1250);
  }

  function handleReset() {
    reset();
    setLineValues([]);
    setCoins([]);
    setSpinning(false);
    setQuestion("");
  }

  function getCurrentLineSum(): number | null {
    if (coins.length === 0 || throwing) return null;
    return coins.reduce((acc, c) => acc + (c === "H" ? 3 : 2), 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hexagram) return;
    const changingLinePositions = lineValues
      .map((v, i) => isChanging(v) ? i + 1 : null)
      .filter((v): v is number => v !== null);

    const input: YukHyoInput = {
      hexagramNo: hexagram.no,
      hexagramName: hexagram.nameKo,
      hexagramNameZh: hexagram.nameZh,
      upperTrigram: hexagram.upper,
      lowerTrigram: hexagram.lower,
      keyword: hexagram.keyword,
      changingLines: changingLinePositions,
      lineValues,
      changedHexagramNo: changedHexagram?.no,
      changedHexagramName: changedHexagram?.nameKo,
      changedHexagramNameZh: changedHexagram?.nameZh,
      changedUpperTrigram: changedHexagram?.upper,
      changedLowerTrigram: changedHexagram?.lower,
      changedKeyword: changedHexagram?.keyword,
      question: question.trim() || undefined,
    };
    await submit("yuk-hyo", input);
  }

  const DiagramCircle = ({ size }: { size: number }) => (
    <div className="relative rounded-full overflow-hidden ring-1 ring-amber-400/20 shadow-[0_0_48px_rgba(200,164,85,0.18)] flex-shrink-0"
      style={{ width: size, height: size }}>
      <img src="/images/hexagramsData/복희육십사괘도.svg" alt="복희 64괘도"
        className="absolute inset-0 w-full h-full"
        style={{ transform: "scale(1.46)", transformOrigin: "center" }} />
      <DiagramOverlay matchingPositions={matchingPositions} changedPos={changedPos}
        done={done} linesLen={lineValues.length} />
    </div>
  );

  const currentSum = getCurrentLineSum();
  const currentLineInfo = currentSum !== null ? LINE_NAMES[currentSum] : null;

  if (result || isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        {hexagram && (
          <div className="text-center mb-6 space-y-1">
            <p className="text-amber-300/70 text-sm">본괘 — 제{hexagram.no}괘 {hexagram.nameZh} {hexagram.nameKo}괘</p>
            {changedHexagram && (
              <p className="text-blue-300/60 text-xs">지괘 — 제{changedHexagram.no}괘 {changedHexagram.nameZh} {changedHexagram.nameKo}괘</p>
            )}
          </div>
        )}
        <FortuneResult result={result} isLoading={isLoading} onReset={handleReset} title="육효점 풀이" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-white font-bold text-2xl">육효점</h1>
        <p className="text-white/50 text-sm mt-2">동전을 6번 던져 본괘와 지괘로 현재와 미래를 읽습니다</p>
        <p className="text-white/25 text-xs mt-1">앞(3점) · 뒤(2점) → 합산 6·7·8·9로 효 결정</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 질문 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <label className="block text-white/50 text-xs mb-2">
            질문 <span className="text-white/25">(선택)</span>
          </label>
          <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="예: 이 선택이 옳은 것인지 알고 싶습니다"
            className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors" />
        </div>

        {/* 동전 던지기 */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
          <div>
            <p className="text-white/40 text-xs text-center mb-4">
              {done ? "6효 완성" : `${lineValues.length + 1}번째 효 — 동전 3개를 던지세요`}
            </p>
            <div className="flex justify-center gap-3">
              <Coin face={coins[0] ?? null} spinning={spinning} delay={0} />
              <Coin face={coins[1] ?? null} spinning={spinning} delay={0.07} />
              <Coin face={coins[2] ?? null} spinning={spinning} delay={0.14} />
            </div>
            {currentSum !== null && currentLineInfo && (
              <div className="text-center mt-3 space-y-1">
                <p className={`text-xs font-semibold ${currentLineInfo.changing ? "text-red-400" : "text-amber-300/70"}`}>
                  합 {currentSum}점 → {currentLineInfo.ko}
                  {currentLineInfo.changing && " (변효)"}
                </p>
                <p className="text-white/40 text-[11px]">
                  {currentLineInfo.type === "yang" ? "양효 ——————" : "음효 ——  ——"}
                </p>
              </div>
            )}
          </div>

          {/* 효 시각화 */}
          <div className="w-40 mx-auto space-y-2">
            {[5, 4, 3, 2, 1, 0].map(idx => {
              const filled = idx < lineValues.length;
              const isNew = idx === lineValues.length - 1;
              return (
                <HexLine key={idx} value={filled ? lineValues[idx] : null} isNew={isNew} />
              );
            })}
          </div>

          <AnimatePresence>
            {hexagram && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="text-center space-y-1">
                  <p className="text-amber-300 font-bold text-xl">
                    {hexagram.nameZh} <span className="text-lg">{hexagram.nameKo}괘</span>
                  </p>
                  <p className="text-white/40 text-xs">본괘 제{hexagram.no}괘 · {hexagram.upper}위 {hexagram.lower}아래</p>
                  <p className="text-amber-200/60 text-xs">{hexagram.keyword}</p>
                </div>
                {changedHexagram && (
                  <div className="text-center space-y-0.5 pt-1 border-t border-blue-400/15">
                    <p className="text-blue-300 font-semibold text-base">
                      → {changedHexagram.nameZh} <span className="text-sm">{changedHexagram.nameKo}괘</span>
                    </p>
                    <p className="text-blue-200/40 text-xs">지괘 제{changedHexagram.no}괘 · {changedHexagram.keyword}</p>
                  </div>
                )}
                {hasChanging && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {lineValues.map((v, i) => isChanging(v) ? (
                      <span key={i} className="text-[10px] text-red-300/70 bg-red-900/20 px-1.5 py-0.5 rounded-full border border-red-400/15">
                        {i + 1}효 변 {v === 9 ? "○" : "×"}
                      </span>
                    ) : null)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!done && (
            <button type="button" onClick={handleThrow} disabled={throwing}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                throwing ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-amber-700/40 border border-amber-600/30 text-amber-200 hover:bg-amber-700/60"
              }`}>
              {throwing ? "동전 던지는 중..." : `🪙 ${lineValues.length + 1}번째 효 던지기`}
            </button>
          )}

          {lineValues.length > 0 && !done && (
            <button type="button" onClick={() => { setLineValues([]); setCoins([]); setSpinning(false); }}
              className="w-full py-2 rounded-xl text-xs text-white/30 hover:text-white/50 border border-white/10 transition-colors">
              처음부터 다시
            </button>
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* 괘도 */}
        <AnimatePresence>
          {lineValues.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }} transition={{ duration: 0.5, ease: [0.2, 0, 0.2, 1] }}
              className="flex flex-col items-center gap-2">
              <motion.button type="button" onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="rounded-full cursor-pointer focus:outline-none" aria-label="괘도 크게 보기">
                <DiagramCircle size={288} />
              </motion.button>
              <p className="text-white/25 text-[10px] tracking-[0.2em]">
                {done
                  ? `본괘 제${hexagram?.no}괘${changedHexagram ? ` → 지괘 제${changedHexagram.no}괘` : ""}`
                  : `후보 ${matchingPositions.length}개`}
                {" · "}
                <span className="text-amber-400/40">눌러서 크게 보기</span>
              </p>
              {done && hasChanging && (
                <p className="text-[10px] text-blue-300/40">
                  ● 노란점: 본괘 &nbsp;·&nbsp; 파란점: 지괘
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {done && hexagram && (
          <div className="space-y-3">
            {/* 본괘 기본 풀이 */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-white/5 border border-amber-400/15 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/70 text-xs font-semibold tracking-wider">본괘 풀이</span>
                <div className="flex-1 h-px bg-amber-400/10" />
                <span className="text-white/20 text-[10px]">무료</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{hexagram.description}</p>
              {changedHexagram && (
                <div className="pt-3 border-t border-blue-400/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300/60 text-xs font-semibold tracking-wider">지괘</span>
                    <span className="text-blue-200/50 text-xs">{changedHexagram.nameZh} {changedHexagram.nameKo}괘</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{changedHexagram.description}</p>
                </div>
              )}
            </motion.div>

            <button type="submit" disabled={fortuneStatus?.exhausted === true}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-opacity ${
                fortuneStatus?.exhausted
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-700 to-yellow-700 text-white hover:opacity-90"
              }`}>
              {fortuneStatus?.exhausted
                ? "오늘 풀이를 이미 이용했어요"
                : `${hexagram.nameKo}괘${changedHexagram ? ` → ${changedHexagram.nameKo}괘` : ""} 풀이 받기`}
            </button>

            <button type="button" onClick={() => { setLineValues([]); setCoins([]); setSpinning(false); }}
              className="w-full py-2 rounded-xl text-xs text-white/30 hover:text-white/50 border border-white/10 transition-colors">
              다시 뽑기
            </button>
          </div>
        )}
      </form>

      {fortuneStatus?.todayReading && (
        <TodayFortuneCard
          label="오늘의 육효점 풀이"
          todayReading={fortuneStatus.todayReading}
          highlightColor="text-amber-300"
          exhausted={fortuneStatus.exhausted}
        />
      )}

      {/* 풀스크린 팝업 */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-lg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div>
                <p className="text-amber-300/80 text-sm font-semibold">복희 64괘도</p>
                <p className="text-white/30 text-xs mt-0.5">
                  {done
                    ? `본괘 제${hexagram?.no}괘 ${hexagram?.nameZh}${changedHexagram ? ` → 지괘 제${changedHexagram.no}괘 ${changedHexagram.nameZh}` : ""}`
                    : `후보 ${matchingPositions.length}개 · ${lineValues.length}/6효`}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/12 transition-colors text-sm">
                ✕
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0 px-4">
              <DiagramCircle size={Math.min(typeof window !== "undefined" ? window.innerWidth * 0.88 : 340, 400)} />
            </div>
            <div className="flex-shrink-0 px-4 pb-8 pt-3 space-y-4">
              <div className="h-px bg-white/8" />
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Coin face={coins[0] ?? null} spinning={spinning} delay={0} />
                  <Coin face={coins[1] ?? null} spinning={spinning} delay={0.07} />
                  <Coin face={coins[2] ?? null} spinning={spinning} delay={0.14} />
                </div>
                <div className="w-20 space-y-1.5">
                  {[5, 4, 3, 2, 1, 0].map(idx => {
                    const filled = idx < lineValues.length;
                    const isNew = idx === lineValues.length - 1;
                    const v = filled ? lineValues[idx] : null;
                    if (v === null) return (
                      <div key={idx} className="flex items-center gap-1 h-3.5">
                        <div className="h-px w-full bg-white/10 rounded-full" />
                      </div>
                    );
                    const yang = isYang(v);
                    const changing = isChanging(v);
                    const color = changing ? (isNew ? "bg-red-400" : "bg-red-300/60") : (isNew ? "bg-amber-400" : "bg-amber-300/70");
                    return (
                      <div key={idx} className={`flex items-center gap-1 h-3.5 ${isNew ? "opacity-100" : "opacity-60"}`}>
                        {yang ? (
                          <div className={`h-1 w-full rounded-full ${color}`} />
                        ) : (
                          <>
                            <div className={`h-1 w-[45%] rounded-full ${color}`} />
                            <div className="w-[10%]" />
                            <div className={`h-1 w-[45%] rounded-full ${color}`} />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-right min-w-0">
                  {hexagram ? (
                    <>
                      <p className="text-amber-300 font-bold text-base leading-tight">{hexagram.nameZh}</p>
                      <p className="text-amber-200/70 text-xs">{hexagram.nameKo}괘</p>
                      {changedHexagram && (
                        <p className="text-blue-300/60 text-xs mt-0.5">→ {changedHexagram.nameZh}</p>
                      )}
                    </>
                  ) : currentSum !== null ? (
                    <p className="text-amber-300/70 text-xs font-semibold">
                      {currentSum}점 {currentLineInfo?.ko}
                    </p>
                  ) : (
                    <p className="text-white/25 text-xs">{lineValues.length}/6효</p>
                  )}
                </div>
              </div>
              {!done ? (
                <button type="button" onClick={handleThrow} disabled={throwing}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    throwing ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-amber-700/40 border border-amber-600/30 text-amber-200 hover:bg-amber-700/60"
                  }`}>
                  {throwing ? "동전 던지는 중..." : `🪙 ${lineValues.length + 1}번째 효 던지기`}
                </button>
              ) : (
                <button type="button" onClick={() => setShowModal(false)}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-amber-700/40 border border-amber-600/30 text-amber-200 hover:bg-amber-700/60 transition-all">
                  돌아가서 풀이 보기
                </button>
              )}
              {lineValues.length > 0 && !done && (
                <button type="button" onClick={() => { setLineValues([]); setCoins([]); setSpinning(false); }}
                  className="w-full py-2 rounded-xl text-xs text-white/30 hover:text-white/50 border border-white/10 transition-colors">
                  처음부터 다시
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
