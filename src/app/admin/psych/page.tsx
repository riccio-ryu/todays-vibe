"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronUp, ChevronDown, Loader2, Pencil, X } from "lucide-react";
import { allPsychTests, type PsychTest } from "@/data/psych";
import { getPsychConfig, savePsychConfig } from "./actions";
import { PSYCH_ENABLED } from "@/lib/psych/config";
import type { PsychTestConfig } from "@/lib/psych/settings";
import PsychPreview from "@/components/admin/PsychPreview";

// settings.ts는 서버 전용(firebase-admin)이라 값 import 금지 → 상수만 로컬 복제
const DEFAULT_PSYCH_COST = 1;

const ENGINE_LABEL: Record<string, string> = {
  mbti: "🔢 MBTI 엔진",
  category: "🔢 카테고리",
  score: "🔢 점수 척도",
  ranking: "🔢 순위 매기기",
  ai: "🤖 AI 해석 (회원)",
};

type Cfg = { enabled: boolean; cost?: number; promptPersona?: string; promptGuide?: string };

export default function AdminPsychPage() {
  const [list, setList] = useState<string[]>(allPsychTests.map((t) => t.slug));
  const [cfg, setCfg] = useState<Record<string, Cfg>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPsychConfig().then((stored) => {
      const sorted = [...allPsychTests]
        .map((t, i) => ({ slug: t.slug, order: stored[t.slug]?.order ?? i }))
        .sort((a, b) => a.order - b.order)
        .map((x) => x.slug);
      setList(sorted);
      const next: Record<string, Cfg> = {};
      allPsychTests.forEach((t) => {
        const c = stored[t.slug];
        next[t.slug] = {
          enabled: c?.enabled !== false,
          cost: c?.cost,
          promptPersona: c?.promptPersona,
          promptGuide: c?.promptGuide,
        };
      });
      setCfg(next);
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

  function patch(slug: string, p: Partial<Cfg>) {
    setCfg((c) => ({ ...c, [slug]: { ...c[slug], ...p } }));
    setSaved(false);
  }

  function handleSave() {
    const tests: Record<string, PsychTestConfig> = {};
    list.forEach((slug, i) => {
      const c = cfg[slug] ?? { enabled: true };
      tests[slug] = {
        enabled: c.enabled !== false,
        order: i,
        ...(c.cost !== undefined ? { cost: c.cost } : {}),
        ...(c.promptPersona ? { promptPersona: c.promptPersona } : {}),
        ...(c.promptGuide ? { promptGuide: c.promptGuide } : {}),
      };
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
        <p className="text-white/40 text-sm">노출·순서·별 소모(cost)·AI 프롬프트를 관리합니다. 문항·결과 본문은 코드에서 관리합니다.</p>
        <p className="text-white/30 text-xs mt-2">
          운영 노출: {PSYCH_ENABLED ? "✅ 켜짐" : "⛔ 꺼짐 (env NEXT_PUBLIC_PSYCH_ENABLED)"} · 총 {allPsychTests.length}종
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-white/40 animate-spin" /></div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 mb-5">
            {list.map((slug, i) => {
              const t = meta(slug);
              const c = cfg[slug] ?? { enabled: true };
              const on = c.enabled !== false;
              const isAI = t.engine === "ai";
              const cost = isAI ? (c.cost ?? DEFAULT_PSYCH_COST) : 0;
              return (
                <div key={slug} className={`flex items-center gap-3 px-4 py-3 ${on ? "bg-white/3" : "bg-white/[0.01]"}`}>
                  <span className="text-white/25 text-xs w-5 text-center tabular-nums">{i + 1}</span>
                  <span className="text-2xl shrink-0">{t.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${on ? "text-white/85" : "text-white/35"}`}>{t.title}</p>
                    <p className="text-white/25 text-[11px]">
                      {ENGINE_LABEL[t.engine]} · {cost === 0 ? "무료" : `⭐${cost}`} · {slug}
                    </p>
                  </div>
                  <button onClick={() => setEditing(slug)} title="편집" className="text-white/40 hover:text-white p-1">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-white/40 hover:text-white disabled:opacity-20 p-0.5"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === list.length - 1} className="text-white/40 hover:text-white disabled:opacity-20 p-0.5"><ChevronDown className="w-4 h-4" /></button>
                  </div>
                  <button
                    onClick={() => patch(slug, { enabled: !on })}
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

      {editing && (
        <EditModal
          test={meta(editing)}
          cfg={cfg[editing] ?? { enabled: true }}
          onChange={(p) => patch(editing, p)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EditModal({
  test,
  cfg,
  onChange,
  onClose,
}: {
  test: PsychTest;
  cfg: Cfg;
  onChange: (p: Partial<Cfg>) => void;
  onClose: () => void;
}) {
  const isAI = test.engine === "ai";
  const CLS = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#9382ff]/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="text-xl">{test.icon}</span> {test.title}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          <p className="text-white/30 text-xs">{ENGINE_LABEL[test.engine]} · {test.slug}</p>

          {/* 소모 별 (AI 심테만) */}
          {isAI ? (
            <div>
              <label className="block text-white/60 text-xs mb-1.5">별 소모량 (⭐ 크레딧)</label>
              <input
                type="number"
                min={0}
                value={cfg.cost ?? ""}
                onChange={(e) => onChange({ cost: e.target.value === "" ? undefined : Math.max(0, parseInt(e.target.value) || 0) })}
                placeholder={`비우면 기본값 ${DEFAULT_PSYCH_COST} · 0 = 무료`}
                className={CLS}
              />
            </div>
          ) : (
            <p className="text-white/40 text-xs rounded-lg bg-white/4 border border-white/8 px-3 py-2">
              로직 심테는 API를 타지 않아 항상 무료(별 소모 없음)입니다.
            </p>
          )}

          {/* AI 프롬프트 override */}
          {isAI && (
            <>
              <div>
                <label className="block text-white/60 text-xs mb-1.5">
                  AI 페르소나 override <span className="text-white/25">(비우면 코드 기본값)</span>
                </label>
                <textarea
                  value={cfg.promptPersona ?? ""}
                  onChange={(e) => onChange({ promptPersona: e.target.value || undefined })}
                  rows={3}
                  placeholder={test.engine === "ai" ? test.promptPersona : ""}
                  className={CLS + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs mb-1.5">
                  AI 해석 가이드 override <span className="text-white/25">(비우면 코드 기본값)</span>
                </label>
                <textarea
                  value={cfg.promptGuide ?? ""}
                  onChange={(e) => onChange({ promptGuide: e.target.value || undefined })}
                  rows={4}
                  placeholder={test.engine === "ai" ? test.promptGuide : ""}
                  className={CLS + " resize-none"}
                />
              </div>
            </>
          )}

          {/* 미리보기 */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-white/50 text-xs font-semibold mb-3">📋 문항·결과 미리보기 (읽기전용)</p>
            <PsychPreview test={test} />
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors"
          >
            확인 (목록에서 저장)
          </button>
        </div>
      </div>
    </div>
  );
}
