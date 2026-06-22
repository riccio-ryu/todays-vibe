"use client";

import { useState, useTransition, useRef } from "react";
import { Check, RotateCcw, Save, ChevronDown, ChevronUp, Database } from "lucide-react";
import { savePromptAction, resetPromptAction, seedAllPromptsAction } from "./actions";
import type { VarDoc } from "@/lib/claude/promptTemplates";

type PromptEntry = {
  type: string;
  labelKo: string;
  emoji: string;
  template: string;
  isCustom: boolean;
  charCount: number;
};

type Props = {
  prompts: PromptEntry[];
  varDocs: Record<string, VarDoc[]>;
};

export default function PromptsEditor({ prompts, varDocs }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [seedDone, setSeedDone] = useState(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function handleToggle(type: string) {
    const opening = expanded !== type;
    setExpanded(opening ? type : null);
    if (opening) {
      // 다음 프레임에 스크롤 — 열린 항목 상단을 뷰포트 상단에 고정
      requestAnimationFrame(() => {
        itemRefs.current[type]?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function getDraft(type: string, original: string) {
    return drafts[type] ?? original;
  }

  function isDirty(type: string, original: string) {
    return drafts[type] !== undefined && drafts[type] !== original;
  }

  function handleSave(type: string) {
    const template = drafts[type];
    if (!template) return;
    startTransition(async () => {
      await savePromptAction(type, template);
      setSaved(type);
      setTimeout(() => setSaved(null), 2500);
    });
  }

  function handleReset(type: string) {
    if (!confirm(`"${type}" 프롬프트를 기본값으로 초기화하시겠습니까?`)) return;
    startTransition(async () => {
      await resetPromptAction(type);
      setDrafts(prev => { const next = { ...prev }; delete next[type]; return next; });
    });
  }

  function handleSeedAll() {
    if (!confirm("모든 프롬프트를 현재 기본값으로 Firestore에 저장하시겠습니까?\n기존에 수정된 프롬프트는 덮어씌워집니다.")) return;
    startTransition(async () => {
      await seedAllPromptsAction();
      setDrafts({});
      setSeedDone(true);
      setTimeout(() => setSeedDone(false), 3000);
    });
  }

  function insertVar(type: string, key: string, original: string) {
    const current = getDraft(type, original);
    setDrafts(prev => ({ ...prev, [type]: current + `{{${key}}}` }));
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">AI 프롬프트 관리</h2>
          <p className="text-white/40 text-sm mt-1">
            각 운세 메뉴의 Claude 프롬프트를 편집하고 저장합니다.
            <span className="text-white/25 ml-1">변수는 {"{{변수명}}"} 형태로 삽입하세요.</span>
          </p>
        </div>
        <button
          onClick={handleSeedAll}
          disabled={isPending}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-xs transition-colors disabled:opacity-50"
        >
          {seedDone ? (
            <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">완료</span></>
          ) : (
            <><Database className="w-3.5 h-3.5" /><span>전체 시드</span></>
          )}
        </button>
      </div>

      {/* 목록 */}
      <div className="space-y-2">
        {prompts.map((entry) => {
          const isOpen = expanded === entry.type;
          const draft = getDraft(entry.type, entry.template);
          const dirty = isDirty(entry.type, entry.template);
          const vars = varDocs[entry.type] ?? [];

          return (
            <div
              key={entry.type}
              ref={el => { itemRefs.current[entry.type] = el; }}
              className={`rounded-xl border overflow-hidden transition-all duration-150 ${
                entry.isCustom
                  ? "bg-[#9382ff]/5 border-[#9382ff]/20"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {/* 헤더 행 */}
              <button
                onClick={() => handleToggle(entry.type)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center">{entry.emoji}</span>
                  <div>
                    <span className="text-white/90 text-sm font-medium">{entry.labelKo}</span>
                    <span className="text-white/25 text-xs ml-2 font-mono">{entry.type}</span>
                    {entry.isCustom && (
                      <span className="ml-2 text-[10px] text-[#9382ff] bg-[#9382ff]/15 px-1.5 py-0.5 rounded-full">수정됨</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white/25 text-xs tabular-nums hidden sm:block">{entry.charCount.toLocaleString()}자</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </div>
              </button>

              {/* 에디터 영역 */}
              {isOpen && (
                <div className="border-t border-white/10">
                  {/* 변수 칩 */}
                  {vars.length > 0 && (
                    <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
                      <span className="text-white/25 text-[11px] self-center mr-1">변수:</span>
                      {vars.map(v => (
                        <button
                          key={v.key}
                          onClick={() => insertVar(entry.type, v.key, entry.template)}
                          title={v.desc}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#9382ff]/10 text-[#9382ff]/80 border border-[#9382ff]/20 hover:bg-[#9382ff]/20 transition-colors"
                        >
                          {`{{${v.key}}}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* textarea */}
                  <div className="px-4 pb-3">
                    <textarea
                      value={draft}
                      onChange={e => setDrafts(prev => ({ ...prev, [entry.type]: e.target.value }))}
                      className="w-full h-[420px] bg-black/30 border border-white/10 rounded-lg px-3 py-3 text-xs text-white/75 font-mono leading-relaxed resize-y focus:outline-none focus:border-[#9382ff]/40 transition-colors"
                      spellCheck={false}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/20 text-[11px] tabular-nums">{draft.length.toLocaleString()}자</span>
                      <div className="flex items-center gap-2">
                        {entry.isCustom && (
                          <button
                            onClick={() => handleReset(entry.type)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            기본값 복원
                          </button>
                        )}
                        <button
                          onClick={() => handleSave(entry.type)}
                          disabled={!dirty || isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-40
                            bg-[#9382ff]/20 border border-[#9382ff]/30 text-[#9382ff] hover:bg-[#9382ff]/30 disabled:cursor-not-allowed"
                        >
                          {saved === entry.type ? (
                            <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">저장됨</span></>
                          ) : (
                            <><Save className="w-3 h-3" />저장</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
