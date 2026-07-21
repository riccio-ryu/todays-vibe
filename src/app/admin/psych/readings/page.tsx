"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { formatDateTime } from "@/lib/utils/format";
import { allPsychTests, allAiPsychTests } from "@/data/psych";
import AdminStatCards from "@/components/admin/AdminStatCards";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";

type PsychReading = {
  id: string;
  userId: string | null;
  testSlug: string;
  testTitle: string;
  date: string;
  result: string;
  createdAt: string | null;
};

// slug → {icon, title} 매핑 (코드 데이터 우선, 없으면 기록에 저장된 title)
const TEST_META: Record<string, { icon: string; title: string }> = Object.fromEntries(
  allPsychTests.map((t) => [t.slug, { icon: t.icon, title: t.title }])
);

// AI 심테만 필터 옵션으로 (기록이 남는 건 AI 심테뿐)
const SLUG_OPTIONS = [
  { value: "", label: "전체 심테" },
  ...allAiPsychTests.map((t) => ({ value: t.slug, label: `${t.icon} ${t.title}` })),
];

export default function AdminPsychReadingsPage() {
  const [readings, setReadings] = useState<PsychReading[]>([]);
  const [total, setTotal]       = useState(0);
  const [slugCounts, setSlugCounts] = useState<Record<string, number>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [slugFilter, setSlugFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [userInput, setUserInput]   = useState("");

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (slugFilter) params.set("slug", slugFilter);
      if (userFilter) params.set("userId", userFilter);

      const res = await fetch(`/api/admin/psych/readings?${params}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReadings(data.readings ?? []);
      setTotal(data.total ?? 0);
      setSlugCounts(data.slugCounts ?? {});
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [slugFilter, userFilter]);

  useEffect(() => { fetchReadings(); }, [fetchReadings]);

  // 최다 심테 (전체 기준 slugCounts)
  const topSlug = Object.entries(slugCounts).sort((a, b) => b[1] - a[1])[0];
  const topMeta = topSlug ? (TEST_META[topSlug[0]] ?? { icon: "🧠", title: topSlug[0] }) : null;

  return (
    <div className="p-4 md:p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">심테 기록</h2>
        <p className="text-white/40 text-sm mt-1">
          저장된 AI 심리 테스트 결과를 조회합니다. 로직 심테(MBTI·동물 등)는 서버를 거치지 않아 기록이 남지 않습니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <AdminStatCards cards={[
        { label: "전체 기록",   value: loading ? "-" : total },
        { label: "심테 종류",   value: loading ? "-" : Object.keys(slugCounts).length },
        { label: "최다 심테",   value: loading ? "-" : topMeta ? `${topMeta.icon} ${topMeta.title}` : "—" },
        { label: "AI 심테 수",  value: allAiPsychTests.length },
      ]} />

      {/* 필터 바 */}
      <div className="flex flex-wrap gap-2 mb-5">
        <select
          value={slugFilter}
          onChange={(e) => setSlugFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm outline-none focus:border-purple-400/60"
        >
          {SLUG_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-gray-900">
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setUserFilter(userInput); }}
          placeholder="userId로 검색..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none focus:border-purple-400/60"
        />
        <button
          onClick={() => setUserFilter(userInput)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
        >
          검색
        </button>
        {(slugFilter || userFilter) && (
          <button
            onClick={() => { setSlugFilter(""); setUserFilter(""); setUserInput(""); }}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 text-sm rounded-lg border border-white/10 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {/* 테이블 */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["심테", "userId", "일시", "결과 미리보기"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <AdminTableSkeleton rows={6} cols={4} />
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-red-400 text-sm">
                  {error}
                </td>
              </tr>
            ) : readings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-white/20 text-sm">
                  기록이 없습니다.
                </td>
              </tr>
            ) : (
              readings.map((r) => {
                const meta = TEST_META[r.testSlug] ?? { icon: "🧠", title: r.testTitle };
                const isExpanded = expandedId === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                    >
                      {/* 심테 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{meta.icon}</span>
                          <span className="text-white/80 font-medium">{meta.title}</span>
                        </span>
                      </td>
                      {/* userId */}
                      <td className="px-4 py-3">
                        {r.userId ? (
                          <span className="text-white/50 font-mono text-xs bg-white/5 px-2 py-0.5 rounded">
                            {r.userId.slice(0, 12)}…
                          </span>
                        ) : (
                          <span className="text-white/20 text-xs">비로그인</span>
                        )}
                      </td>
                      {/* 일시 */}
                      <td className="px-4 py-3 text-white/40 whitespace-nowrap">
                        {formatDateTime(r.createdAt)}
                      </td>
                      {/* 결과 미리보기 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-xs truncate max-w-xs">
                            {r.result.slice(0, 60)}…
                          </span>
                          <span className={`text-white/20 text-xs shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                            ▼
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="mb-2 flex flex-wrap gap-3 text-xs text-white/30">
                            <span>ID: <span className="font-mono text-white/40">{r.id}</span></span>
                            <span>slug: <span className="font-mono text-white/40">{r.testSlug}</span></span>
                            <span>userId: <span className="font-mono text-white/40">{r.userId ?? "없음"}</span></span>
                            <span>date: <span className="font-mono text-white/40">{r.date}</span></span>
                          </div>
                          <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap border-t border-white/5 pt-3">
                            {r.result}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {!loading && !error && readings.length > 0 && (
        <p className="text-white/20 text-xs mt-3 text-right">
          {total}건 중 {readings.length}건 표시
        </p>
      )}
    </div>
  );
}
