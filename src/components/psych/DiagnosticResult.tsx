"use client";

import Link from "next/link";
import { Share2, RotateCcw } from "lucide-react";
import type { PsychResult } from "@/types/psych";
import { axisPercent } from "@/lib/psych/scoring";

interface AxisScores {
  E: number; I: number;
  S: number; N: number;
  T: number; F: number;
  J: number; P: number;
}

interface Props {
  slug: string;
  typeCode: string;
  result: PsychResult;
  scores: AxisScores;
}

const AXES: { left: keyof AxisScores; right: keyof AxisScores }[] = [
  { left: "E", right: "I" },
  { left: "S", right: "N" },
  { left: "T", right: "F" },
  { left: "J", right: "P" },
];

const ACCENT_COLORS = ["#4fbeff", "#9552e0", "#f26110", "#bb9915"] as const;

function AxisBar({
  left, right, scores, accent,
}: {
  left: keyof AxisScores;
  right: keyof AxisScores;
  scores: AxisScores;
  accent: string;
}) {
  const leftPct = axisPercent(scores[left], scores[right]);
  const rightPct = 100 - leftPct;
  const dominant = leftPct >= rightPct ? left : right;
  const dominantPct = leftPct >= rightPct ? leftPct : rightPct;

  return (
    <div className="flex items-center gap-3">
      <span className="w-4 text-xs font-semibold text-right" style={{ color: "#535862" }}>
        {left}
      </span>
      <div className="psych-axis-bar-track relative">
        <div
          className="psych-axis-bar-fill"
          style={{ width: `${leftPct}%`, background: leftPct > rightPct ? "#181d27" : "#cce7ff" }}
        />
      </div>
      <span className="w-4 text-xs font-semibold" style={{ color: "#535862" }}>
        {right}
      </span>
      <span className="w-20 text-xs font-medium" style={{ color: accent }}>
        {dominant} {dominantPct}%
      </span>
    </div>
  );
}

export default function DiagnosticResult({ slug, typeCode, result, scores }: Props) {
  async function handleShare() {
    const url = window.location.href;
    const text = `나의 MBTI는 ${typeCode} — ${result.title}`;
    if (navigator.share) {
      await navigator.share({ title: text, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사됐어요!");
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* 유형 헤더 카드 */}
      <div className="psych-card p-8 mb-4">
        <p className="text-xs font-medium mb-2" style={{ color: "#93979f" }}>
          나의 유형은
        </p>
        <div className="flex items-baseline gap-3 mb-1">
          <span
            className="text-5xl font-bold tracking-tight"
            style={{ color: "#181d27", letterSpacing: "-0.03em" }}
          >
            {typeCode}
          </span>
        </div>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: "#0a0d12", letterSpacing: "-0.02em" }}
        >
          {result.title}
        </h2>
        <p className="text-sm" style={{ color: "#535862" }}>
          {result.subtitle}
        </p>
      </div>

      {/* 축 분석 카드 */}
      <div className="psych-card p-6 mb-4">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "#0a0d12" }}>
          축 분석
        </h3>
        <div className="space-y-4">
          {AXES.map((axis, i) => (
            <AxisBar
              key={axis.left}
              left={axis.left}
              right={axis.right}
              scores={scores}
              accent={ACCENT_COLORS[i]}
            />
          ))}
        </div>
      </div>

      {/* 상세 해석 카드 */}
      <div className="psych-card p-6 mb-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: "#0a0d12" }}>
          상세 해석
        </h3>
        <p className="text-sm leading-relaxed mb-5" style={{ color: "#535862" }}>
          {result.description}
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#4fbeff" }}>
              강점
            </p>
            <ul className="space-y-1.5">
              {result.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm" style={{ color: "#535862" }}>
                  <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: "#9552e0" }}>
              조심할 것
            </p>
            <ul className="space-y-1.5">
              {result.watchOut.map((w) => (
                <li key={w} className="flex items-start gap-2 text-sm" style={{ color: "#535862" }}>
                  <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#181d27", color: "#ffffff" }}
        >
          <Share2 className="w-4 h-4" />
          공유하기
        </button>
        <Link
          href={`/psych/${slug}/quiz`}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold transition-colors hover:bg-black/5"
          style={{ border: "1px solid rgba(83,88,98,0.2)", color: "#535862" }}
        >
          <RotateCcw className="w-4 h-4" />
          다시하기
        </Link>
      </div>

      {/* 연관 테스트 */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: "#93979f" }}>
          이어서 해보세요
        </p>
        <div className="flex gap-2 flex-wrap">
          {["연애 MBTI", "직장 MBTI", "번아웃 위험도"].map((name) => (
            <span
              key={name}
              className="px-3 py-1.5 rounded-full text-xs font-medium cursor-not-allowed opacity-50"
              style={{ background: "#cce7ff", color: "#0a5a8a" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-center mt-8" style={{ color: "#93979f" }}>
        이 결과는 참고용이며 전문 심리 진단을 대체하지 않습니다
      </p>
    </div>
  );
}
