"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import {
  Eye, EyeOff, Settings, Loader2, Plus, ArrowUpDown,
} from "lucide-react";
import type { AccessLevel } from "@/types/menu";
import {
  type PsychTestMeta,
  type PsychEngine,
  PSYCH_ENGINES,
  PSYCH_ENGINE_LABEL,
} from "@/types/psych";
import PsychContentBuilder, { emptyPsychContent } from "@/components/admin/PsychContentBuilder";
import {
  getPsychTests,
  savePsychTest,
  deletePsychTests,
  patchPsychTests,
  savePsychOrders,
  getPsychTestContent,
  savePsychTestContent,
} from "./actions";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PSYCH_COST = 1;

const ACCESS_LABEL: Record<AccessLevel, string> = {
  public: "비회원",
  member: "회원",
  premium: "프리미엄",
  admin: "관리자",
};

const ACCESS_COLOR: Record<AccessLevel, string> = {
  public: "text-white/40 bg-white/5",
  member: "text-blue-300 bg-blue-900/30",
  premium: "text-amber-300 bg-amber-900/40",
  admin: "text-red-300 bg-red-900/40",
};

type SortKey = "title" | "engine" | "ready" | "isAI" | "accessLevel";

interface ColDef {
  key: string;
  label: string;
  sortKey?: SortKey;
  defaultVisible: boolean;
}

const COL_DEFS: ColDef[] = [
  { key: "icon",        label: "아이콘",    defaultVisible: true },
  { key: "title",       label: "이름/설명", sortKey: "title",       defaultVisible: true },
  { key: "engine",      label: "카테고리",  sortKey: "engine",      defaultVisible: true },
  { key: "ready",       label: "노출",      sortKey: "ready",       defaultVisible: true },
  { key: "isAI",        label: "AI",        sortKey: "isAI",        defaultVisible: true },
  { key: "accessLevel", label: "회원등급",  sortKey: "accessLevel", defaultVisible: true },
  { key: "cost",        label: "⭐크레딧",                          defaultVisible: true },
  { key: "slug",        label: "슬러그",                            defaultVisible: false },
];

const CLS_INPUT =
  "w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors";
const CLS_SELECT =
  "w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors";

function psychCost(t: PsychTestMeta): number {
  if (t.engine !== "ai") return 0;
  return t.cost ?? DEFAULT_PSYCH_COST;
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function Field({
  label, children, className = "",
}: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-white/40 text-xs mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Toggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChange(!checked)}>
      <div className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-purple-600" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <span className="text-white/60 text-sm select-none">{label}</span>
    </div>
  );
}

// ─── Test modal (add & edit) ──────────────────────────────────────────────────

function PsychModal({
  initial, maxOrder, onSave, onClose,
}: {
  initial: PsychTestMeta | null;
  maxOrder: number;
  onSave: (meta: PsychTestMeta, content: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const isNew = !initial;
  const [form, setForm] = useState<PsychTestMeta>(
    initial ?? {
      slug: "",
      icon: "🧠",
      title: "",
      summary: "",
      engine: "category",
      category: "category",
      ready: false,
      accessLevel: "public",
      order: maxOrder + 1,
    }
  );
  // 문항·결과 콘텐츠 (null = 로딩 중)
  const [content, setContent] = useState<Record<string, unknown> | null>(
    isNew ? emptyPsychContent("category") : null
  );

  // 편집 시 content 로드
  useEffect(() => {
    if (isNew || !initial) return;
    let alive = true;
    getPsychTestContent(initial.slug).then((c) => {
      if (!alive) return;
      setContent(Object.keys(c).length ? c : emptyPsychContent(initial.engine, initial.aiMode));
    });
    return () => { alive = false; };
  }, [isNew, initial]);

  function set<K extends keyof PsychTestMeta>(k: K, v: PsychTestMeta[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // 엔진 변경 시: 카테고리=엔진 동기화 + 회원등급 기본값 보정. 신규는 콘텐츠 템플릿 초기화
  function setEngine(engine: PsychEngine) {
    setForm((f) => ({
      ...f,
      engine,
      category: engine,
      aiMode: engine === "ai" ? (f.aiMode ?? "quiz") : undefined,
      accessLevel: engine === "ai" ? "member" : f.accessLevel === "member" ? "public" : f.accessLevel,
    }));
    if (isNew) setContent(emptyPsychContent(engine, engine === "ai" ? (form.aiMode ?? "quiz") : undefined));
  }

  function setAiMode(mode: "quiz" | "text") {
    setForm((f) => ({ ...f, aiMode: mode }));
    if (isNew) setContent(emptyPsychContent("ai", mode));
  }

  const isAI = form.engine === "ai";
  const canSave = form.title.trim() && (!isNew || /^[a-z0-9-]+$/.test(form.slug)) && content !== null;

  function handleSave() {
    if (!canSave || !content) return;
    onSave({ ...form, category: form.engine }, content);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-white font-semibold">
            {isNew ? "심테 추가" : `편집 — ${form.title}`}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {isNew ? (
            <Field label="슬러그 (영문, 하이픈 · URL /psych/[슬러그])">
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.replace(/[^a-z0-9-]/g, ""))}
                placeholder="예: love-style"
                className={CLS_INPUT}
              />
            </Field>
          ) : (
            <p className="text-white/20 text-xs font-mono">slug: {form.slug}</p>
          )}

          <div className="flex gap-3">
            <Field label="엔진 (= 카테고리)" className="flex-1">
              <select
                value={form.engine}
                onChange={(e) => setEngine(e.target.value as PsychEngine)}
                className={CLS_SELECT}
              >
                {PSYCH_ENGINES.map((e) => (
                  <option key={e} value={e} className="bg-gray-800">{PSYCH_ENGINE_LABEL[e]}</option>
                ))}
              </select>
            </Field>
            {form.engine === "ai" && (
              <Field label="AI 입력 방식" className="w-40 shrink-0">
                <select
                  value={form.aiMode ?? "quiz"}
                  onChange={(e) => setAiMode(e.target.value as "quiz" | "text")}
                  className={CLS_SELECT}
                >
                  <option value="quiz" className="bg-gray-800">4지선다 (quiz)</option>
                  <option value="text" className="bg-gray-800">자유텍스트 (text)</option>
                </select>
              </Field>
            )}
          </div>

          <div className="flex gap-3">
            <Field label="아이콘" className="w-20 shrink-0">
              <input value={form.icon} onChange={(e) => set("icon", e.target.value)} className={CLS_INPUT + " text-center text-xl"} />
            </Field>
            <Field label="이름" className="flex-1">
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="심테 이름" className={CLS_INPUT} />
            </Field>
          </div>

          <Field label="설명 (한 줄 소개)">
            <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={2} className={CLS_INPUT + " resize-none"} />
          </Field>

          <Field label="회원등급">
            <select
              value={form.accessLevel}
              onChange={(e) => set("accessLevel", e.target.value as AccessLevel)}
              className={CLS_SELECT}
            >
              <option value="public"  className="bg-gray-800">비회원 (누구나)</option>
              <option value="member"  className="bg-gray-800">회원 (로그인 필요)</option>
              <option value="premium" className="bg-gray-800">프리미엄</option>
              <option value="admin"   className="bg-gray-800">관리자 전용</option>
            </select>
          </Field>

          <div className="pt-1">
            <Toggle label="노출" checked={form.ready} onChange={(v) => set("ready", v)} />
          </div>

          {/* 소모 별 (AI 심테만) */}
          {isAI ? (
            <Field label="별 소모량 (⭐ 크레딧)">
              <input
                type="number"
                min={0}
                value={form.cost ?? ""}
                onChange={(e) => set("cost", e.target.value === "" ? undefined : Math.max(0, parseInt(e.target.value) || 0))}
                placeholder={`비우면 기본값 ${DEFAULT_PSYCH_COST} · 0 = 무료`}
                className={CLS_INPUT}
              />
            </Field>
          ) : (
            <p className="text-white/40 text-xs rounded-lg bg-white/4 border border-white/8 px-3 py-2">
              로직 심테는 API를 타지 않아 항상 무료(별 소모 없음)입니다.
            </p>
          )}

          {/* AI 프롬프트 override */}
          {isAI && (
            <>
              <Field label="AI 페르소나 (비우면 코드 기본값)">
                <textarea
                  value={form.promptPersona ?? ""}
                  onChange={(e) => set("promptPersona", e.target.value || undefined)}
                  rows={3}
                  className={CLS_INPUT + " resize-none"}
                />
              </Field>
              <Field label="AI 해석 가이드 (비우면 코드 기본값)">
                <textarea
                  value={form.promptGuide ?? ""}
                  onChange={(e) => set("promptGuide", e.target.value || undefined)}
                  rows={4}
                  className={CLS_INPUT + " resize-none"}
                />
              </Field>
            </>
          )}

          {/* 문항·결과 빌더 */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-white/60 text-xs font-bold mb-3">📋 문항 · 결과 편집</p>
            {content === null ? (
              <div className="flex items-center gap-2 text-white/30 text-xs py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> 문항을 불러오는 중...
              </div>
            ) : (
              <PsychContentBuilder
                engine={form.engine}
                aiMode={form.aiMode}
                content={content}
                onChange={setContent}
              />
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-white/10 flex gap-2 justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-colors">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white font-semibold hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isNew ? "추가" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Column options modal ─────────────────────────────────────────────────────

function ColModal({
  visibleCols, onToggle, onClose,
}: { visibleCols: Set<string>; onToggle: (key: string) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-72 shadow-2xl">
        <h3 className="text-white font-semibold mb-4">컬럼 표시 설정</h3>
        <div className="space-y-3">
          {COL_DEFS.map((col) => (
            <label key={col.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={visibleCols.has(col.key)} onChange={() => onToggle(col.key)} className="accent-purple-500 w-4 h-4" />
              <span className="text-white/70 text-sm flex-1">{col.label}</span>
              {col.sortKey && <span className="text-white/25 text-[10px]">정렬↕</span>}
            </label>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors">
          확인
        </button>
      </div>
    </div>
  );
}

// ─── Reorder modal ────────────────────────────────────────────────────────────

function ReorderModal({
  initTests, onSave, onClose,
}: {
  initTests: PsychTestMeta[];
  onSave: (tests: PsychTestMeta[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<PsychTestMeta[]>([...initTests].sort((a, b) => a.order - b.order));
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  function moveItem(from: number, to: number) {
    if (from === to || to < 0 || to >= draft.length) return;
    const next = [...draft];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDraft(next);
  }

  const origIds = [...initTests].sort((a, b) => a.order - b.order).map((t) => t.slug);
  const hasChanges = origIds.some((id, i) => id !== draft[i]?.slug);

  function handleSave() {
    onSave(draft.map((t, i) => ({ ...t, order: i })));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[88vh]">
        <div className="px-6 pt-5 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-white font-semibold">순서 변경</h3>
            <p className="text-white/30 text-xs mt-0.5">드래그하거나 ▲▼로 순서 조정 후 저장하세요.</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {draft.map((item, idx) => {
            const isDragging = dragIdx === idx;
            const isOver = dragOverIdx === idx && dragIdx !== null && dragIdx !== idx;
            return (
              <div
                key={item.slug}
                draggable
                onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDragIdx(idx); }}
                onDragOver={(e) => { e.preventDefault(); if (idx !== dragOverIdx) setDragOverIdx(idx); }}
                onDrop={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) moveItem(dragIdx, idx); setDragIdx(null); setDragOverIdx(null); }}
                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-100 select-none ${
                  isDragging
                    ? "opacity-30 bg-white/5 border-white/5 cursor-grabbing"
                    : isOver
                    ? "bg-purple-900/30 border-purple-500/50"
                    : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10 cursor-grab"
                }`}
              >
                <span className="text-white/20 text-xs w-5 text-right shrink-0 font-mono">{idx + 1}</span>
                <span className="text-white/15 text-sm shrink-0 tracking-[-3px]">⠿⠿</span>
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-tight">{item.title}</p>
                  <p className="text-white/30 text-xs truncate mt-0.5">{PSYCH_ENGINE_LABEL[item.engine]}</p>
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveItem(idx, idx - 1)} disabled={idx === 0} className="w-6 h-5 flex items-center justify-center rounded text-white/25 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-colors text-xs cursor-pointer">▲</button>
                  <button onClick={() => moveItem(idx, idx + 1)} disabled={idx === draft.length - 1} className="w-6 h-5 flex items-center justify-center rounded text-white/25 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-colors text-xs cursor-pointer">▼</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-white/25 text-xs">{hasChanges ? "변경 사항이 있습니다." : "변경 없음"}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-colors">취소</button>
            <button onClick={handleSave} disabled={!hasChanges} className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white font-semibold hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">순서 저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPsychPage() {
  const [rows, setRows] = useState<PsychTestMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    new Set(COL_DEFS.filter((c) => c.defaultVisible).map((c) => c.key))
  );
  const [editRow, setEditRow] = useState<PsychTestMeta | "new" | null>(null);
  const [showColModal, setShowColModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);

  useEffect(() => {
    getPsychTests()
      .then(setRows)
      .catch(() => setError("심테 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    if (!sortKey) return [...rows].sort((a, b) => a.order - b.order);
    const key = sortKey;
    return [...rows].sort((a, b) => {
      let av: string | boolean, bv: string | boolean;
      if (key === "isAI") { av = a.engine === "ai"; bv = b.engine === "ai"; }
      else if (key === "title") { av = a.title; bv = b.title; }
      else if (key === "engine") { av = a.engine; bv = b.engine; }
      else if (key === "ready") { av = a.ready; bv = b.ready; }
      else { av = a.accessLevel; bv = b.accessLevel; }
      const cmp = typeof av === "boolean"
        ? (av === bv ? 0 : av ? -1 : 1)
        : String(av).localeCompare(String(bv), "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else setSortKey(null);
  }

  function toggleAll() {
    setSelected(selected.size === rows.length ? new Set() : new Set(rows.map((r) => r.slug)));
  }
  function toggleOne(slug: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(slug) ? s.delete(slug) : s.add(slug);
      return s;
    });
  }

  // 로컬 즉시 갱신 + Firestore 동기화
  function patch(slugs: Set<string> | null, data: Partial<PsychTestMeta>) {
    setRows((prev) => prev.map((r) => (!slugs || slugs.has(r.slug) ? { ...r, ...data } : r)));
    startTransition(async () => {
      try {
        await patchPsychTests(slugs ? [...slugs] : null, data);
      } catch {
        setError("저장에 실패했습니다. 새로고침해 주세요.");
      }
    });
  }

  function handleDelete() {
    if (!selected.size || !confirm(`${selected.size}개를 삭제하시겠습니까?`)) return;
    const slugs = [...selected];
    setRows((prev) => prev.filter((r) => !slugs.includes(r.slug)));
    setSelected(new Set());
    startTransition(async () => {
      try {
        await deletePsychTests(slugs);
      } catch {
        setError("삭제에 실패했습니다. 새로고침해 주세요.");
      }
    });
  }

  function toggleCol(key: string) {
    setVisibleCols((prev) => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
  }

  function handleSave(item: PsychTestMeta, content: Record<string, unknown>) {
    setRows((prev) => (prev.some((r) => r.slug === item.slug)
      ? prev.map((r) => (r.slug === item.slug ? item : r))
      : [...prev, item]));
    setEditRow(null);
    startTransition(async () => {
      try {
        await savePsychTest(item);
        await savePsychTestContent(item.slug, content);
      } catch {
        setError("저장에 실패했습니다. 새로고침해 주세요.");
      }
    });
  }

  function handleSaveReorder(next: PsychTestMeta[]) {
    setRows(next);
    setShowReorderModal(false);
    startTransition(async () => {
      try {
        await savePsychOrders(next.map((t) => ({ slug: t.slug, order: t.order })));
      } catch {
        setError("순서 저장에 실패했습니다. 새로고침해 주세요.");
      }
    });
  }

  const hasSelection = selected.size > 0;
  const shownCols = COL_DEFS.filter((c) => visibleCols.has(c.key));
  const maxOrder = rows.reduce((m, r) => Math.max(m, r.order), 0);

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center gap-3 text-white/40">
        <Loader2 className="w-4 h-4 animate-spin" /> 심테를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">심테 관리</h2>
          <p className="text-white/40 text-sm mt-1">
            심리 테스트의 노출 여부, 순서, 엔진(카테고리), 별 소모, AI 프롬프트를 관리합니다.
          </p>
        </div>
        {isPending && <span className="text-xs text-white/30 animate-pulse mt-1">저장 중...</span>}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => patch(null, { ready: true })}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/20 transition-colors"
        >
          <Eye className="w-3 h-3" /> 전체 노출
        </button>
        <button
          onClick={() => patch(null, { ready: false })}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
        >
          <EyeOff className="w-3 h-3" /> 전체 미노출
        </button>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        <button
          onClick={() => setEditRow("new")}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-purple-300 border border-purple-800/60 hover:bg-purple-900/20 transition-colors"
        >
          <Plus className="w-3 h-3" /> 심테 추가
        </button>

        {hasSelection && (
          <>
            <div className="w-px h-5 bg-white/10 mx-0.5" />
            <span className="text-white/30 text-xs">{selected.size}개 선택</span>
            <button onClick={() => patch(selected, { ready: true })} className="px-2.5 py-1.5 rounded-lg text-xs text-emerald-300/70 border border-white/10 hover:bg-white/5 transition-colors">선택 노출</button>
            <button onClick={() => patch(selected, { ready: false })} className="px-2.5 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 hover:bg-white/5 transition-colors">선택 미노출</button>
            <button onClick={handleDelete} className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 border border-red-900/50 hover:bg-red-900/20 transition-colors">선택 삭제</button>
          </>
        )}

        <div className="flex-1" />

        <button onClick={() => setShowReorderModal(true)} className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3" /> 순서 변경
        </button>
        <button onClick={() => setShowColModal(true)} className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-1">
          <Settings className="w-3 h-3" /> 옵션
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} className="accent-purple-500" />
                </th>
                {shownCols.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortKey && handleSort(col.sortKey)}
                    className={`text-left px-4 py-3 text-white/40 font-medium whitespace-nowrap ${col.sortKey ? "cursor-pointer hover:text-white/70 select-none" : ""}`}
                  >
                    {col.label}
                    {col.sortKey && (
                      <span className="ml-1 text-xs">
                        {sortKey === col.sortKey
                          ? (sortDir === "asc" ? <span className="text-purple-400">▲</span> : <span className="text-purple-400">▼</span>)
                          : <span className="text-white/15">⇅</span>}
                      </span>
                    )}
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-white/40 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((row) => {
                const isAI = row.engine === "ai";
                const cost = psychCost(row);
                return (
                  <tr key={row.slug} className={`hover:bg-white/5 transition-colors ${selected.has(row.slug) ? "bg-purple-900/10" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(row.slug)} onChange={() => toggleOne(row.slug)} className="accent-purple-500" />
                    </td>
                    {visibleCols.has("icon") && <td className="px-4 py-3 text-xl">{row.icon}</td>}
                    {visibleCols.has("title") && (
                      <td className="px-4 py-3 min-w-[180px]">
                        <p className="text-white font-medium">{row.title}</p>
                        <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{row.summary}</p>
                      </td>
                    )}
                    {visibleCols.has("engine") && (
                      <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{PSYCH_ENGINE_LABEL[row.engine]}</td>
                    )}
                    {visibleCols.has("ready") && (
                      <td className="px-4 py-3">
                        {row.ready
                          ? <span className="text-[10px] text-emerald-300 bg-emerald-900/50 px-1.5 py-0.5 rounded-full">노출</span>
                          : <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">미노출</span>}
                      </td>
                    )}
                    {visibleCols.has("isAI") && (
                      <td className="px-4 py-3">
                        {isAI
                          ? <span className="text-[10px] text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">AI</span>
                          : <span className="text-white/20 text-xs">—</span>}
                      </td>
                    )}
                    {visibleCols.has("accessLevel") && (
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ACCESS_COLOR[row.accessLevel]}`}>{ACCESS_LABEL[row.accessLevel]}</span>
                      </td>
                    )}
                    {visibleCols.has("cost") && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {cost === 0
                          ? <span className="text-[10px] text-white/40">무료</span>
                          : <span className="text-xs text-amber-300 tabular-nums">⭐{cost}{row.cost === undefined && <span className="text-white/30 text-[10px] ml-0.5">(기본)</span>}</span>}
                      </td>
                    )}
                    {visibleCols.has("slug") && <td className="px-4 py-3 text-white/30 font-mono text-xs">{row.slug}</td>}
                    <td className="px-4 py-3">
                      <button onClick={() => setEditRow(row)} className="text-xs text-white/60 border border-white/15 rounded px-2 py-1 hover:bg-white/10 hover:text-white transition-colors">편집</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-white/20 text-xs mt-3">
        총 {rows.length}개 · {rows.filter((r) => r.ready).length}개 노출 중
      </p>

      {/* Modals */}
      {showColModal && <ColModal visibleCols={visibleCols} onToggle={toggleCol} onClose={() => setShowColModal(false)} />}
      {showReorderModal && <ReorderModal initTests={rows} onSave={handleSaveReorder} onClose={() => setShowReorderModal(false)} />}
      {editRow !== null && (
        <PsychModal
          initial={editRow === "new" ? null : editRow}
          maxOrder={maxOrder}
          onSave={handleSave}
          onClose={() => setEditRow(null)}
        />
      )}
    </div>
  );
}
