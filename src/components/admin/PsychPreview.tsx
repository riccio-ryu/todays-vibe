"use client";

import type { PsychTest } from "@/data/psych";

// admin 심테 관리용 읽기전용 미리보기. 엔진별 문항·결과 구조를 요약해 보여준다.
// (편집은 코드에서 — 이 컴포넌트는 확인용)
export default function PsychPreview({ test }: { test: PsychTest }) {
  return (
    <div className="space-y-4 text-sm">
      {/* 공통: 소개 */}
      <div>
        <p className="text-white/40 text-xs mb-1">소개</p>
        <p className="text-white/70 leading-relaxed">{test.intro}</p>
      </div>

      {/* AI 자유텍스트 */}
      {test.engine === "ai" && "fields" in test && test.fields && (
        <div>
          <p className="text-white/40 text-xs mb-1.5">입력 필드 ({test.fields.length})</p>
          <ul className="space-y-1.5">
            {test.fields.map((f) => (
              <li key={f.key} className="rounded-lg bg-white/4 border border-white/8 px-3 py-2">
                <p className="text-white/75">{f.label}</p>
                <p className="text-white/35 text-xs mt-0.5">{f.placeholder}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4지선다형 (ai quiz / mbti / category) */}
      {"questions" in test && test.questions && (
        <div>
          <p className="text-white/40 text-xs mb-1.5">문항 ({test.questions.length})</p>
          <ol className="space-y-2">
            {test.questions.map((q, i) => (
              <li key={i} className="rounded-lg bg-white/4 border border-white/8 px-3 py-2">
                <p className="text-white/75">{i + 1}. {q.q}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(q.options as (string | { label: string })[]).map((opt, j) => (
                    <span key={j} className="text-[11px] text-white/45 bg-white/5 px-1.5 py-0.5 rounded">
                      {typeof opt === "string" ? opt : opt.label}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 순위형 (ranking) */}
      {test.engine === "ranking" && (
        <div>
          <p className="text-white/40 text-xs mb-1.5">순위 항목 ({test.items.length})</p>
          <ul className="space-y-1.5">
            {test.items.map((it) => (
              <li key={it.key} className="flex items-center gap-2 rounded-lg bg-white/4 border border-white/8 px-3 py-2">
                <span className="text-lg">{it.emoji}</span>
                <span className="text-white/75">{it.label}</span>
                <span className="text-white/35 text-xs">— {it.symbol}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 결과 구조 */}
      {test.engine === "category" && (
        <ResultList label="결과 유형" items={test.results.map((r) => `${r.emoji} ${r.title}`)} />
      )}
      {test.engine === "mbti" && (
        <ResultList label="결과" items={[`16유형 (예: ${Object.values(test.results)[0]?.code ?? "INFP"} 등)`]} />
      )}
      {test.engine === "score" && (
        <ResultList label="점수 구간" items={test.bands.map((b) => `${b.emoji} ${b.title} (${b.min}~${b.max})`)} />
      )}

      {/* AI 프롬프트 (코드 기본값 — override는 편집 영역에서) */}
      {test.engine === "ai" && (
        <div className="rounded-lg bg-white/4 border border-white/8 px-3 py-2 space-y-2">
          <div>
            <p className="text-white/40 text-xs mb-0.5">기본 페르소나 (코드)</p>
            <p className="text-white/55 text-xs leading-relaxed">{test.promptPersona}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-0.5">기본 가이드 (코드)</p>
            <p className="text-white/55 text-xs leading-relaxed">{test.promptGuide}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-white/40 text-xs mb-1.5">{label} ({items.length})</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="text-xs text-white/60 bg-white/5 border border-white/8 px-2 py-1 rounded-full">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
