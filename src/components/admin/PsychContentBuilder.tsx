"use client";

import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import type { PsychEngine } from "@/types/psych";
import type {
  MbtiQuestion, MbtiResult, MbtiPole, MbtiAxis,
  CategoryQuestion, CategoryResult,
  ScoreQuestion, ScoreBand, ScoreAxis,
  RankingItem,
  AiQuestion, AiTextField,
} from "@/data/psych/types";

// ─── 공통 스타일 ────────────────────────────────────────────────────────────────
const IN = "w-full px-2.5 py-1.5 rounded-md bg-gray-800 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors";
const LB = "text-white/40 text-[11px] mb-1 block";

const MBTI_AXES: MbtiAxis[] = ["EI", "SN", "TF", "JP"];
const MBTI_POLES: Record<MbtiAxis, [MbtiPole, MbtiPole]> = {
  EI: ["E", "I"], SN: ["S", "N"], TF: ["T", "F"], JP: ["J", "P"],
};

// ─── input atoms ───────────────────────────────────────────────────────────────

function In({ label, value, onChange, placeholder, className = "" }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      {label && <span className={LB}>{label}</span>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={IN} />
    </label>
  );
}

function Ta({ label, value, onChange, rows = 2, placeholder }: {
  label?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <label className="block">
      {label && <span className={LB}>{label}</span>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={IN + " resize-none"} />
    </label>
  );
}

function Num({ label, value, onChange, className = "" }: {
  label?: string; value: number | undefined; onChange: (v: number | undefined) => void; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      {label && <span className={LB}>{label}</span>}
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className={IN}
      />
    </label>
  );
}

// ─── 반복 리스트 (add / remove / move + per-item render) ─────────────────────────

function ListEditor<T>({ title, items, onChange, makeNew, addLabel, render, compact }: {
  title: string;
  items: T[];
  onChange: (next: T[]) => void;
  makeNew: () => T;
  addLabel: string;
  render: (item: T, patch: (p: Partial<T>) => void, idx: number) => React.ReactNode;
  compact?: boolean;
}) {
  const patchAt = (i: number, p: Partial<T>) => onChange(items.map((it, j) => (j === i ? { ...it, ...p } : it)));
  const removeAt = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/60 text-xs font-semibold">{title} <span className="text-white/25">({items.length})</span></p>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={`rounded-lg border border-white/8 bg-white/[0.02] ${compact ? "p-2" : "p-3"}`}>
            <div className="flex items-start gap-2">
              <span className="text-white/20 text-[10px] font-mono mt-1.5 w-4 text-right shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0 space-y-2">{render(item, (p) => patchAt(i, p), i)}</div>
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-white/30 hover:text-white disabled:opacity-20 p-0.5"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-white/30 hover:text-white disabled:opacity-20 p-0.5"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => removeAt(i)} className="text-red-400/50 hover:text-red-400 p-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, makeNew()])}
        className="mt-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-purple-300 border border-purple-800/50 hover:bg-purple-900/20 transition-colors"
      >
        <Plus className="w-3 h-3" /> {addLabel}
      </button>
    </div>
  );
}

// ─── 문자열 배열 편집 (traits, options[] 등) ─────────────────────────────────────

function StringList({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  return (
    <div>
      <span className={LB}>{label} <span className="text-white/20">({items.length})</span></span>
      <div className="space-y-1.5">
        {items.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={s}
              onChange={(e) => onChange(items.map((it, j) => (j === i ? e.target.value : it)))}
              placeholder={placeholder}
              className={IN}
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400/50 hover:text-red-400 p-1 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, ""])} className="mt-1.5 flex items-center gap-1 text-[11px] text-purple-300/80 hover:text-purple-300"><Plus className="w-3 h-3" /> 추가</button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-white/70 text-xs font-bold mb-3 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

// ─── 빈 콘텐츠 템플릿 ────────────────────────────────────────────────────────────

export function emptyPsychContent(engine: PsychEngine, aiMode?: "quiz" | "text"): Record<string, unknown> {
  const base = { intro: "", seoContent: [] as unknown[] };
  switch (engine) {
    case "mbti":     return { ...base, questions: [], results: {} };
    case "category": return { ...base, questions: [], results: [] };
    case "score":    return { ...base, axes: [], questions: [], bands: [] };
    case "ranking":  return { ...base, scenario: "", items: [] };
    case "ai":       return aiMode === "text" ? { ...base, fields: [] } : { ...base, questions: [] };
    default:         return base;
  }
}

// ─── 메인 빌더 ──────────────────────────────────────────────────────────────────

type Dict = Record<string, unknown>;

export default function PsychContentBuilder({ engine, aiMode, content, onChange }: {
  engine: PsychEngine;
  aiMode?: "quiz" | "text";
  content: Dict;
  onChange: (next: Dict) => void;
}) {
  const set = (patch: Dict) => onChange({ ...content, ...patch });
  const list = <T,>(key: string): T[] => (content[key] as T[]) ?? [];
  const str = (key: string): string => (content[key] as string) ?? "";

  return (
    <div className="space-y-5">
      {/* 시작 안내 (공통) */}
      <Ta label="시작 화면 안내 (intro)" value={str("intro")} onChange={(v) => set({ intro: v })} rows={2} />

      {engine === "ranking" && (
        <Ta label="시나리오·지시문 (scenario)" value={str("scenario")} onChange={(v) => set({ scenario: v })} rows={2} />
      )}

      {/* ── 엔진별 문항 ── */}
      {engine === "mbti" && <MbtiQuestions items={list<MbtiQuestion>("questions")} onChange={(v) => set({ questions: v })} />}
      {engine === "category" && <CategoryQuestions items={list<CategoryQuestion>("questions")} onChange={(v) => set({ questions: v })} />}
      {engine === "score" && (
        <>
          <Section title="측정 축 (axes · 다축일 때만)">
            <ScoreAxes items={list<ScoreAxis>("axes")} onChange={(v) => set({ axes: v })} />
          </Section>
          <ScoreQuestions items={list<ScoreQuestion>("questions")} axes={list<ScoreAxis>("axes")} onChange={(v) => set({ questions: v })} />
        </>
      )}
      {engine === "ranking" && <RankingItems items={list<RankingItem>("items")} onChange={(v) => set({ items: v })} />}
      {engine === "ai" && aiMode === "text" && <AiTextFields items={list<AiTextField>("fields")} onChange={(v) => set({ fields: v })} />}
      {engine === "ai" && aiMode !== "text" && <AiQuizQuestions items={list<AiQuestion>("questions")} onChange={(v) => set({ questions: v })} />}

      {/* ── 엔진별 결과 ── */}
      {engine === "mbti" && <MbtiResults results={(content.results as Record<string, MbtiResult>) ?? {}} onChange={(v) => set({ results: v })} />}
      {engine === "category" && <CategoryResults items={list<CategoryResult>("results")} onChange={(v) => set({ results: v })} />}
      {engine === "score" && <ScoreBands items={list<ScoreBand>("bands")} onChange={(v) => set({ bands: v })} />}

      {/* SEO 콘텐츠 (공통) */}
      <Section title="SEO 콘텐츠 (페이지 하단)">
        <ListEditor<{ heading: string; body: string }>
          title="문단" items={(content.seoContent as { heading: string; body: string }[]) ?? []}
          onChange={(v) => set({ seoContent: v })}
          makeNew={() => ({ heading: "", body: "" })}
          addLabel="문단 추가"
          render={(it, patch) => (
            <>
              <In label="제목" value={it.heading} onChange={(v) => patch({ heading: v })} />
              <Ta label="본문" value={it.body} onChange={(v) => patch({ body: v })} rows={2} />
            </>
          )}
        />
      </Section>
    </div>
  );
}

// ─── MBTI ────────────────────────────────────────────────────────────────────

function MbtiQuestions({ items, onChange }: { items: MbtiQuestion[]; onChange: (v: MbtiQuestion[]) => void }) {
  return (
    <Section title="문항 (mbti)">
      <ListEditor<MbtiQuestion>
        title="문항" items={items} onChange={onChange}
        makeNew={() => ({ q: "", axis: "EI", options: [{ label: "", pole: "E" }, { label: "", pole: "I" }] })}
        addLabel="문항 추가"
        render={(q, patch) => (
          <>
            <In label="질문" value={q.q} onChange={(v) => patch({ q: v })} />
            <label className="block">
              <span className={LB}>측정 축</span>
              <select value={q.axis} onChange={(e) => patch({ axis: e.target.value as MbtiAxis })} className={IN}>
                {MBTI_AXES.map((a) => <option key={a} value={a} className="bg-gray-800">{a} ({MBTI_POLES[a][0]}/{MBTI_POLES[a][1]})</option>)}
              </select>
            </label>
            <ListEditor
              title="선택지" items={q.options} onChange={(v) => patch({ options: v })}
              makeNew={() => ({ label: "", pole: MBTI_POLES[q.axis][0] })}
              addLabel="선택지 추가" compact
              render={(o, op) => (
                <div className="flex gap-1.5">
                  <input value={o.label} onChange={(e) => op({ label: e.target.value })} placeholder="선택지 문구" className={IN} />
                  <select value={o.pole} onChange={(e) => op({ pole: e.target.value as MbtiPole })} className={IN + " w-20 shrink-0"}>
                    {MBTI_POLES[q.axis].map((p) => <option key={p} value={p} className="bg-gray-800">{p}</option>)}
                  </select>
                </div>
              )}
            />
          </>
        )}
      />
    </Section>
  );
}

function MbtiResults({ results, onChange }: { results: Record<string, MbtiResult>; onChange: (v: Record<string, MbtiResult>) => void }) {
  const arr = Object.values(results);
  const toRecord = (list: MbtiResult[]) => Object.fromEntries(list.map((r) => [r.code, r]));
  return (
    <Section title="결과 (16유형 · code별)">
      <ListEditor<MbtiResult>
        title="유형" items={arr} onChange={(v) => onChange(toRecord(v))}
        makeNew={() => ({ code: "", title: "", icon: "", tagline: "", body: "", strengths: [], cautions: [] })}
        addLabel="유형 추가"
        render={(r, patch) => (
          <>
            <div className="flex gap-1.5">
              <In label="코드 (예: INFP)" value={r.code} onChange={(v) => patch({ code: v.toUpperCase() })} className="w-28 shrink-0" />
              <In label="이모지" value={r.icon} onChange={(v) => patch({ icon: v })} className="w-20 shrink-0" />
              <In label="유형명" value={r.title} onChange={(v) => patch({ title: v })} className="flex-1" />
            </div>
            <In label="한 줄 요약" value={r.tagline} onChange={(v) => patch({ tagline: v })} />
            <Ta label="설명" value={r.body} onChange={(v) => patch({ body: v })} rows={2} />
            <StringList label="강점" items={r.strengths} onChange={(v) => patch({ strengths: v })} />
            <StringList label="조심할 점" items={r.cautions} onChange={(v) => patch({ cautions: v })} />
          </>
        )}
      />
    </Section>
  );
}

// ─── CATEGORY ──────────────────────────────────────────────────────────────────

function CategoryQuestions({ items, onChange }: { items: CategoryQuestion[]; onChange: (v: CategoryQuestion[]) => void }) {
  return (
    <Section title="문항 (category · 4지선다 투표)">
      <ListEditor<CategoryQuestion>
        title="문항" items={items} onChange={onChange}
        makeNew={() => ({ q: "", options: [{ label: "", type: "" }] })}
        addLabel="문항 추가"
        render={(q, patch) => (
          <>
            <In label="질문" value={q.q} onChange={(v) => patch({ q: v })} />
            <ListEditor
              title="선택지" items={q.options} onChange={(v) => patch({ options: v })}
              makeNew={() => ({ label: "", type: "" })}
              addLabel="선택지 추가" compact
              render={(o, op) => (
                <div className="flex gap-1.5">
                  <input value={o.label} onChange={(e) => op({ label: e.target.value })} placeholder="선택지 문구" className={IN} />
                  <input value={o.type} onChange={(e) => op({ type: e.target.value })} placeholder="투표 유형(type)" className={IN + " w-32 shrink-0"} />
                </div>
              )}
            />
          </>
        )}
      />
    </Section>
  );
}

function CategoryResults({ items, onChange }: { items: CategoryResult[]; onChange: (v: CategoryResult[]) => void }) {
  return (
    <Section title="결과 유형 (category)">
      <ListEditor<CategoryResult>
        title="결과" items={items} onChange={onChange}
        makeNew={() => ({ type: "", title: "", emoji: "", headline: "", description: "", traits: [], advice: "" })}
        addLabel="결과 추가"
        render={(r, patch) => (
          <>
            <div className="flex gap-1.5">
              <In label="유형 key (type)" value={r.type} onChange={(v) => patch({ type: v })} className="w-32 shrink-0" />
              <In label="이모지" value={r.emoji} onChange={(v) => patch({ emoji: v })} className="w-20 shrink-0" />
              <In label="결과명" value={r.title} onChange={(v) => patch({ title: v })} className="flex-1" />
            </div>
            <In label="헤드라인" value={r.headline} onChange={(v) => patch({ headline: v })} />
            <Ta label="본문 해석" value={r.description} onChange={(v) => patch({ description: v })} rows={2} />
            <StringList label="특징 키워드" items={r.traits} onChange={(v) => patch({ traits: v })} />
            <In label="마무리 조언" value={r.advice} onChange={(v) => patch({ advice: v })} />
          </>
        )}
      />
    </Section>
  );
}

// ─── SCORE ─────────────────────────────────────────────────────────────────────

function ScoreAxes({ items, onChange }: { items: ScoreAxis[]; onChange: (v: ScoreAxis[]) => void }) {
  return (
    <ListEditor<ScoreAxis>
      title="축" items={items} onChange={onChange}
      makeNew={() => ({ key: "", label: "" })}
      addLabel="축 추가" compact
      render={(a, patch) => (
        <div className="flex gap-1.5">
          <input value={a.key} onChange={(e) => patch({ key: e.target.value })} placeholder="key" className={IN + " w-32 shrink-0"} />
          <input value={a.label} onChange={(e) => patch({ label: e.target.value })} placeholder="축 이름" className={IN} />
        </div>
      )}
    />
  );
}

function ScoreQuestions({ items, axes, onChange }: { items: ScoreQuestion[]; axes: ScoreAxis[]; onChange: (v: ScoreQuestion[]) => void }) {
  return (
    <Section title="문항 (score · 리커트)">
      <ListEditor<ScoreQuestion>
        title="문항" items={items} onChange={onChange}
        makeNew={() => ({ q: "", options: [{ label: "", value: 0 }] })}
        addLabel="문항 추가"
        render={(q, patch) => (
          <>
            <In label="질문" value={q.q} onChange={(v) => patch({ q: v })} />
            {axes.length > 0 && (
              <label className="block">
                <span className={LB}>축 (단일축이면 비움)</span>
                <select value={q.axis ?? ""} onChange={(e) => patch({ axis: e.target.value || undefined })} className={IN}>
                  <option value="" className="bg-gray-800">— (total)</option>
                  {axes.map((a) => <option key={a.key} value={a.key} className="bg-gray-800">{a.label} ({a.key})</option>)}
                </select>
              </label>
            )}
            <ListEditor
              title="선택지" items={q.options} onChange={(v) => patch({ options: v })}
              makeNew={() => ({ label: "", value: 0 })}
              addLabel="선택지 추가" compact
              render={(o, op) => (
                <div className="flex gap-1.5">
                  <input value={o.label} onChange={(e) => op({ label: e.target.value })} placeholder="선택지 문구" className={IN} />
                  <input type="number" value={o.value} onChange={(e) => op({ value: Number(e.target.value) })} className={IN + " w-20 shrink-0"} />
                </div>
              )}
            />
          </>
        )}
      />
    </Section>
  );
}

function ScoreBands({ items, onChange }: { items: ScoreBand[]; onChange: (v: ScoreBand[]) => void }) {
  return (
    <Section title="결과 구간 (bands · 총점 기준)">
      <ListEditor<ScoreBand>
        title="구간" items={items} onChange={onChange}
        makeNew={() => ({ min: 0, max: 0, title: "", emoji: "", headline: "", description: "", advice: "" })}
        addLabel="구간 추가"
        render={(b, patch) => (
          <>
            <div className="flex gap-1.5">
              <Num label="최소" value={b.min} onChange={(v) => patch({ min: v ?? 0 })} className="w-20 shrink-0" />
              <Num label="최대" value={b.max} onChange={(v) => patch({ max: v ?? 0 })} className="w-20 shrink-0" />
              <In label="이모지" value={b.emoji} onChange={(v) => patch({ emoji: v })} className="w-20 shrink-0" />
              <In label="구간명" value={b.title} onChange={(v) => patch({ title: v })} className="flex-1" />
            </div>
            <In label="헤드라인" value={b.headline} onChange={(v) => patch({ headline: v })} />
            <Ta label="설명" value={b.description} onChange={(v) => patch({ description: v })} rows={2} />
            <In label="조언" value={b.advice} onChange={(v) => patch({ advice: v })} />
          </>
        )}
      />
    </Section>
  );
}

// ─── RANKING ───────────────────────────────────────────────────────────────────

function RankingItems({ items, onChange }: { items: RankingItem[]; onChange: (v: RankingItem[]) => void }) {
  return (
    <Section title="항목 (ranking · 순위 매기기)">
      <ListEditor<RankingItem>
        title="항목" items={items} onChange={onChange}
        makeNew={() => ({ key: "", emoji: "", label: "", symbol: "", keptDesc: "", droppedDesc: "" })}
        addLabel="항목 추가"
        render={(it, patch) => (
          <>
            <div className="flex gap-1.5">
              <In label="key" value={it.key} onChange={(v) => patch({ key: v })} className="w-28 shrink-0" />
              <In label="이모지" value={it.emoji} onChange={(v) => patch({ emoji: v })} className="w-20 shrink-0" />
              <In label="이름" value={it.label} onChange={(v) => patch({ label: v })} className="flex-1" />
            </div>
            <In label="상징 가치" value={it.symbol} onChange={(v) => patch({ symbol: v })} />
            <Ta label="1순위(끝까지 지킴) 해석" value={it.keptDesc} onChange={(v) => patch({ keptDesc: v })} rows={2} />
            <Ta label="꼴찌(먼저 포기) 해석" value={it.droppedDesc} onChange={(v) => patch({ droppedDesc: v })} rows={2} />
          </>
        )}
      />
    </Section>
  );
}

// ─── AI ────────────────────────────────────────────────────────────────────────

function AiQuizQuestions({ items, onChange }: { items: AiQuestion[]; onChange: (v: AiQuestion[]) => void }) {
  return (
    <Section title="문항 (AI · 4지선다)">
      <ListEditor<AiQuestion>
        title="문항" items={items} onChange={onChange}
        makeNew={() => ({ q: "", options: [] })}
        addLabel="문항 추가"
        render={(q, patch) => (
          <>
            <In label="질문" value={q.q} onChange={(v) => patch({ q: v })} />
            <StringList label="선택지" items={q.options} onChange={(v) => patch({ options: v })} placeholder="선택지 문구" />
          </>
        )}
      />
    </Section>
  );
}

function AiTextFields({ items, onChange }: { items: AiTextField[]; onChange: (v: AiTextField[]) => void }) {
  return (
    <Section title="입력 필드 (AI · 자유텍스트)">
      <ListEditor<AiTextField>
        title="필드" items={items} onChange={onChange}
        makeNew={() => ({ key: "", label: "", placeholder: "" })}
        addLabel="필드 추가"
        render={(f, patch) => (
          <>
            <div className="flex gap-1.5">
              <In label="key" value={f.key} onChange={(v) => patch({ key: v })} className="w-28 shrink-0" />
              <In label="라벨" value={f.label} onChange={(v) => patch({ label: v })} className="flex-1" />
            </div>
            <In label="placeholder" value={f.placeholder} onChange={(v) => patch({ placeholder: v })} />
            <div className="flex gap-1.5">
              <Num label="최소 글자수" value={f.minLength} onChange={(v) => patch({ minLength: v })} className="w-28 shrink-0" />
              <Num label="줄 수(rows)" value={f.rows} onChange={(v) => patch({ rows: v })} className="w-28 shrink-0" />
            </div>
          </>
        )}
      />
    </Section>
  );
}
