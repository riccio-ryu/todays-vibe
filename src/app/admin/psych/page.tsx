"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { allPsychTests } from "@/data/psych";
import { getPsychConfig, savePsychConfig } from "./actions";
import { PSYCH_ENABLED } from "@/lib/psych/config";

const ENGINE_LABEL: Record<string, string> = {
  mbti: "🔢 MBTI 엔진",
  category: "🔢 카테고리",
  score: "🔢 점수 척도",
  ranking: "🔢 순위 매기기",
  ai: "🤖 AI 해석 (회원)",
};

export default function AdminPsychPage() {
  // 정렬된 slug 목록 + 활성 맵
  const [list, setList] = useState<string[]>(allPsychTests.map((t) => t.slug));
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPsychConfig().then((cfg) => {
      // order 순 정렬 (미설정 시 코드 순서), 활성 기본 true
      const sorted = [...allPsychTests]
        .map((t, i) => ({ slug: t.slug, order: cfg[t.slug]?.order ?? i }))
        .sort((a, b) => a.order - b.order)
        .map((x) => x.slug);
      setList(sorted);
      const en: Record<string, boolean> = {};
      allPsychTests.forEach((t) => {
        en[t.slug] = cfg[t.slug]?.enabled !== false;
      });
      setEnabled(en);
      setLoading(false);
    });
  }, []);

  const meta = (slug: string) => allPsychTests.find((t) => t.slug === slug)!;

  function move(idx: number, dir: -1 | 1) {
    const next = [...list];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setList(next);
    setSaved(false);
  }

  function toggle(slug: string) {
    setEnabled((e) => ({ ...e, [slug]: !e[slug] }));
    setSaved(false);
  }

  function handleSave() {
    const tests: Record<string, { enabled: boolean; order: number }> = {};
    list.forEach((slug, i) => {
      tests[slug] = { enabled: enabled[slug] !== false, order: i };
    });
    startTransition(async () => {
      await savePsychConfig(tests);
      setSaved(true);
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> 관리자 홈
      </Link>

      <div className="mb-6">
        <h1 className="text-white font-bold text-xl mb-1">🧠 심리 테스트 관리</h1>
        <p className="text-white/40 text-sm">
          노출/순서를 조정합니다. 문항·결과 본문은 코드에서 관리합니다.
        </p>
        <p className="text-white/30 text-xs mt-2">
          현재 운영 노출: {PSYCH_ENABLED ? "✅ 켜짐" : "⛔ 꺼짐 (env NEXT_PUBLIC_PSYCH_ENABLED)"} · 총 {allPsychTests.length}종
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-white/40 animate-spin" /></div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 mb-5">
            {list.map((slug, i) => {
              const t = meta(slug);
              const on = enabled[slug] !== false;
              return (
                <div key={slug} className={`flex items-center gap-3 px-4 py-3 ${on ? "bg-white/3" : "bg-white/[0.01]"}`}>
                  <span className="text-white/25 text-xs w-5 text-center tabular-nums">{i + 1}</span>
                  <span className="text-2xl shrink-0">{t.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${on ? "text-white/85" : "text-white/35"}`}>{t.title}</p>
                    <p className="text-white/25 text-[11px]">
                      {ENGINE_LABEL[t.engine]} · {slug}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-white/40 hover:text-white disabled:opacity-20 p-0.5"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="text-white/40 hover:text-white disabled:opacity-20 p-0.5"><ChevronDown className="w-4 h-4" /></button>
                  </div>
                  <button
                    onClick={() => toggle(slug)}
                    role="switch"
                    aria-checked={on}
                    className={`relative inline-flex w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-[#5046e4]" : "bg-white/15"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              {isPending ? "저장 중…" : "저장"}
            </button>
            {saved && <span className="text-emerald-400 text-sm">✓ 저장됨</span>}
          </div>
        </>
      )}
    </div>
  );
}
