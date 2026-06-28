"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { calculateSaju, HOUR_OPTIONS, type BirthInput, type SajuResult } from "@/lib/saju/calculator";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import AILoadingIndicator from "@/components/common/AILoadingIndicator";
import AdSlot from "@/components/common/AdSlot";
import { boldHighlight } from "@/lib/utils/format";
import TodayFortuneCard from "@/components/common/TodayFortuneCard";
import FavoriteButton from "@/components/common/FavoriteButton";

// ─── 사주 원국 테이블 ──────────────────────────────────────────────────
function SajuTable({ result }: { result: SajuResult }) {
  const pillars = [
    { label: "시주", pillar: result.hour, sub: "시간" },
    { label: "일주", pillar: result.day, sub: "나 자신", highlight: true },
    { label: "월주", pillar: result.month, sub: "부모·형제" },
    { label: "년주", pillar: result.year, sub: "조상·사회" },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-1 text-center mb-1">
        {pillars.map(({ label, sub }) => (
          <div key={label}>
            <p className="text-white/40 text-[10px]">{label}</p>
            <p className="text-white/25 text-[9px]">{sub}</p>
          </div>
        ))}
      </div>
      {/* 천간 행 */}
      <div className="grid grid-cols-4 gap-1 mb-1">
        {pillars.map(({ label, pillar, highlight }) => (
          <div
            key={label + "-stem"}
            className={`flex flex-col items-center justify-center rounded-lg py-3 ${
              highlight
                ? "bg-amber-500/20 border border-amber-400/40"
                : "bg-white/8 border border-white/10"
            }`}
          >
            {pillar ? (
              <>
                <span className="text-white text-2xl font-bold leading-none">{pillar.stem}</span>
                <span className="text-white/50 text-xs mt-1">{pillar.stemKo}</span>
                <span className="text-white/30 text-[10px]">{pillar.element}</span>
              </>
            ) : (
              <span className="text-white/20 text-sm">미상</span>
            )}
          </div>
        ))}
      </div>
      {/* 지지 행 */}
      <div className="grid grid-cols-4 gap-1">
        {pillars.map(({ label, pillar }) => (
          <div
            key={label + "-branch"}
            className="flex flex-col items-center justify-center rounded-lg py-3 bg-white/5 border border-white/8"
          >
            {pillar ? (
              <>
                <span className="text-white text-2xl font-bold leading-none">{pillar.branch}</span>
                <span className="text-white/50 text-xs mt-1">{pillar.branchKo}</span>
                {pillar.animal && (
                  <span className="text-white/30 text-[10px]">{pillar.animal}</span>
                )}
              </>
            ) : (
              <span className="text-white/20 text-sm">미상</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────
export default function SajuPage() {
  const { user } = useAuth();

  // 입력 상태
  const [year, setYear]     = useState("");
  const [month, setMonth]   = useState("");
  const [day, setDay]       = useState("");
  const [hour, setHour]     = useState(-1);
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [question, setQuestion] = useState("");

  // 저장 옵션
  const [saveBirth, setSaveBirth] = useState(false);
  const [savedInfo, setSavedInfo] = useState<BirthInput | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // 결과 상태
  const [result, setResult]         = useState<SajuResult | null>(null);
  const [interpretation, setInterp] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const interpRef = useRef<HTMLDivElement>(null);

  const { fortuneStatus, refreshFortuneStatus } = useFortuneStatus("saju");

  // 저장된 출생 정보 불러오기
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/birth-info")
      .then((r) => r.json())
      .then((d) => {
        if (d.birthInfo) {
          setSavedInfo(d.birthInfo);
          setYear(String(d.birthInfo.year));
          setMonth(String(d.birthInfo.month));
          setDay(String(d.birthInfo.day));
          setHour(d.birthInfo.hour ?? -1);
          setIsLunar(d.birthInfo.isLunar ?? false);
          setGender(d.birthInfo.gender ?? "male");
        }
      })
      .catch(() => {});
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInterp("");
    setResult(null);

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (!y || !m || !d) { setError("생년월일을 입력해주세요."); return; }
    if (y < 1900 || y > 2025) { setError("1900~2025년 사이의 연도를 입력해주세요."); return; }

    const input: BirthInput = { year: y, month: m, day: d, hour, isLunar, gender };

    // 사주 계산
    let saju: SajuResult;
    try {
      saju = calculateSaju(input);
    } catch {
      setError("생년월일 계산 중 오류가 발생했습니다. 날짜를 확인해주세요.");
      return;
    }
    setResult(saju);

    // 저장 처리
    if (saveBirth && user) {
      setSaveStatus("saving");
      fetch("/api/user/birth-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
        .then(() => { setSaveStatus("saved"); setSavedInfo(input); })
        .catch(() => setSaveStatus("idle"));
    }

    // AI 해석
    setLoading(true);
    try {
      const res = await fetch("/api/fortune/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: saju.summary, question: question || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `서버 오류 (${res.status})`);
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setInterp(text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "풀이 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      refreshFortuneStatus();
    }
  }

  function handleReset() {
    if (savedInfo) {
      setYear(String(savedInfo.year));
      setMonth(String(savedInfo.month));
      setDay(String(savedInfo.day));
      setHour(savedInfo.hour);
      setIsLunar(savedInfo.isLunar);
      setGender(savedInfo.gender);
    }
    setResult(null);
    setInterp("");
    setError("");
  }

  const currentYear = new Date().getFullYear();

  // 오늘 이용 기록 있으면 결과 노출
  if (fortuneStatus?.todayReading && !result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> 홈
        </Link>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-white font-bold text-2xl">사주팔자</h1>
            <FavoriteButton menuId="saju" />
          </div>
          <p className="text-white/50 text-sm mt-2">생년월일시로 풀어보는 나의 운명</p>
        </div>
        <TodayFortuneCard
          label="오늘의 사주 결과"
          todayReading={fortuneStatus.todayReading}
          highlightColor="text-amber-300"
          exhausted={fortuneStatus.exhausted}
          onNewReading={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> 홈
      </Link>
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-white font-bold text-2xl">사주팔자</h1>
          <FavoriteButton menuId="saju" />
        </div>
        <p className="text-white/50 text-sm mt-2">생년월일시로 풀어보는 나의 운명</p>
      </div>

      {/* 저장된 정보 알림 */}
      {savedInfo && !result && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-between">
          <p className="text-amber-300 text-sm">
            저장된 생년월일 정보가 있습니다
          </p>
          <button
            onClick={() => {
              setYear(""); setMonth(""); setDay(""); setHour(-1);
              setIsLunar(false); setGender("male"); setSavedInfo(null);
              fetch("/api/user/birth-info", { method: "DELETE" }).catch(() => {});
            }}
            className="text-white/40 text-xs hover:text-white/70 transition-colors"
          >
            삭제
          </button>
        </div>
      )}

      {/* 입력 폼 */}
      {!result && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">

            {/* 양력/음력 */}
            <div className="flex gap-2">
              {(["양력", "음력"] as const).map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setIsLunar(i === 1)}
                  className={`flex-1 py-2 rounded-[5px] text-sm font-medium transition-colors ${
                    isLunar === (i === 1)
                      ? "bg-[#5046e4] text-[#f4f0ff]"
                      : "bg-white/5 text-[#a8a6b7] hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-white/60 text-xs mb-2">생년월일</label>
              <div className="grid grid-cols-3 gap-2">
                {/* 년도 */}
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">년도</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min={1900}
                    max={currentYear}
                    placeholder="1990"
                    required
                    className="w-full px-3 py-2 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm placeholder-white/20 focus:outline-none focus:border-[#9382ff]/50 transition-colors"
                  />
                </div>
                {/* 월 */}
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">월</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm focus:outline-none focus:border-[#9382ff]/50 transition-colors appearance-none"
                  >
                    <option value="" className="bg-gray-900 text-white/40">월</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m} className="bg-gray-900">{m}월</option>
                    ))}
                  </select>
                </div>
                {/* 일 */}
                <div>
                  <label className="block text-white/40 text-[10px] mb-1">일</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm focus:outline-none focus:border-[#9382ff]/50 transition-colors appearance-none"
                  >
                    <option value="" className="bg-gray-900 text-white/40">일</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d} className="bg-gray-900">{d}일</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 태어난 시간 */}
            <div>
              <label className="block text-white/60 text-xs mb-2">태어난 시간</label>
              <select
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm focus:outline-none focus:border-[#9382ff]/50 transition-colors appearance-none"
              >
                {HOUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-white/60 text-xs mb-2">성별</label>
              <div className="flex gap-2">
                {([["male", "남성"], ["female", "여성"]] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setGender(val)}
                    className={`flex-1 py-2 rounded-[5px] text-sm font-medium transition-colors ${
                      gender === val
                        ? "bg-[#5046e4] text-[#f4f0ff]"
                        : "bg-white/5 text-[#a8a6b7] hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 질문 (선택) */}
            <div>
              <label className="block text-white/60 text-xs mb-2">궁금한 점 <span className="text-white/30">(선택)</span></label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 올해 직장운이 궁금해요"
                className="w-full px-3 py-2.5 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm placeholder-white/25 focus:outline-none focus:border-[#9382ff]/50 transition-colors"
              />
            </div>

            {/* 출생 정보 저장 (로그인 시) */}
            {user && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setSaveBirth((v) => !v)}
                  className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                    saveBirth ? "bg-[#5046e4]" : "bg-white/20"
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    saveBirth ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </div>
                <div>
                  <p className="text-white/80 text-sm">출생 정보 저장</p>
                  <p className="text-white/40 text-xs">다음에 자동으로 불러옵니다</p>
                </div>
              </label>
            )}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={fortuneStatus?.exhausted === true}
            className={`w-full py-3 rounded-[5px] font-medium text-sm transition-colors ${
              fortuneStatus?.exhausted
                ? "bg-white/8 text-[#a8a6b7]/40 cursor-not-allowed"
                : "bg-[#5046e4] text-[#f4f0ff] hover:bg-[#3d36c4]"
            }`}
          >
            {fortuneStatus?.exhausted ? "오늘 사주풀이를 이미 이용했어요" : "사주 풀이 보기"}
          </button>
        </form>
      )}

      {/* 사주팔자 안내 — 폼이 없을 때만 표시 (SSR에서 항상 렌더링) */}
      {!result && (
        <div className="mt-2 border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">사주팔자(四柱八字)란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              사주팔자는 사람이 태어난 연(年)·월(月)·일(日)·시(時)의 네 기둥(四柱)에서
              각각 천간(天干)과 지지(地支) 두 글자씩, 총 여덟 글자(八字)로 운명을 분석하는 동양 명리학입니다.
              중국 당나라 때 이허중이 체계화하고 송나라 서자평이 완성했으며,
              한국에서는 고려시대부터 왕실과 사대부를 중심으로 깊이 연구되어 왔습니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">사주의 4기둥과 의미</h3>
            <div className="grid grid-cols-2 gap-2">
              {([
                { pillar: "년주(年柱)", meaning: "조상·사회·환경", desc: "타고난 사회적 환경과 조상의 기운. 첫인상과 외면을 나타냅니다.", color: "text-purple-400 border-purple-400/20 bg-purple-900/10" },
                { pillar: "월주(月柱)", meaning: "부모·형제·청소년기", desc: "성장 환경과 직업·사회생활의 특성. 내면 성격을 보여줍니다.", color: "text-blue-400 border-blue-400/20 bg-blue-900/10" },
                { pillar: "일주(日柱)", meaning: "나 자신·배우자", desc: "사주에서 가장 중요한 기둥. 자아와 배우자 인연을 나타냅니다.", color: "text-amber-400 border-amber-400/20 bg-amber-900/10" },
                { pillar: "시주(時柱)", meaning: "자녀·노년·말년운", desc: "인생 후반과 자녀 인연. 내면의 욕망과 미래 방향을 담습니다.", color: "text-green-400 border-green-400/20 bg-green-900/10" },
              ] as const).map((item) => (
                <div key={item.pillar} className={`rounded-xl border px-3 py-3 ${item.color}`}>
                  <p className="font-bold text-sm mb-0.5">{item.pillar}</p>
                  <p className="text-xs opacity-60 mb-1">{item.meaning}</p>
                  <p className="text-white/40 text-[11px] leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">오행(五行)과 천간·지지</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-3">
              사주의 여덟 글자는 목(木)·화(火)·토(土)·금(金)·수(水) 다섯 기운으로 이루어집니다.
              천간(天干)은 갑·을·병·정·무·기·경·신·임·계 10글자로 하늘의 기운을,
              지지(地支)는 자·축·인·묘·진·사·오·미·신·유·술·해 12글자로 땅의 기운을 나타냅니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              일간(日干), 즉 태어난 날의 천간이 &apos;나&apos;를 나타내며,
              나머지 일곱 글자가 나와 상생·상극하면서 성격, 건강, 직업, 연애, 재물 등 삶 전반에 영향을 미칩니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-2">AI 사주풀이 특징</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              오늘운의 AI 사주풀이는 생년월일시를 입력하면 사주 원국을 계산해 오행 균형과 일간의 특성을 분석합니다.
              궁금한 점(연애운, 직업운, 금전운 등)을 함께 입력하면 더 맞춤화된 풀이를 받을 수 있습니다.
              출생 시간이 정확할수록 시주가 포함된 더 정밀한 풀이가 가능합니다.
            </p>
          </div>
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div className="space-y-6">
          {/* 사주 원국 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4 text-center">사주 원국</h2>
            <SajuTable result={result} />
            <div className="mt-4 text-center">
              <p className="text-white/50 text-xs">
                일간 <span className="text-amber-300 font-semibold">{result.dayMaster}({result.day.stemKo})</span>
                {" "}— {result.dayMasterElement}의 기운
              </p>
            </div>
          </div>

          {/* 저장 완료 알림 */}
          {saveStatus === "saved" && (
            <div className="px-4 py-2.5 rounded-2xl bg-green-500/10 border border-green-400/20 text-center">
              <p className="text-green-400 text-sm">출생 정보가 저장되었습니다</p>
            </div>
          )}

          {/* AI 해석 */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">사주 풀이</h2>
            {loading && !interpretation && (
              <AILoadingIndicator type="saju" />
            )}
            {interpretation && (
              <div
                ref={interpRef}
                className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: boldHighlight(interpretation, "text-amber-300") }}
              />
            )}
          </div>

          {/* 광고 */}
          {!loading && interpretation && (
            <AdSlot slot="5693296487" className="rounded-xl" />
          )}

          {/* 공유 + 다시 보기 */}
          <div className="flex gap-3">
            {!loading && interpretation && (
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "사주팔자 풀이 | 오늘운", url: window.location.href })
                      .catch((e) => { if (e?.name !== "AbortError") throw e; });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("링크가 클립보드에 복사됐어요!");
                  }
                }}
                className="flex-1 py-2.5 rounded-[5px] bg-[#5046e4]/30 border border-[#9382ff]/25 text-[#9382ff] text-sm font-medium hover:bg-[#5046e4]/50 transition-colors"
              >
                📤 공유하기
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-[5px] bg-white/5 text-[#a8a6b7] text-sm font-medium hover:bg-white/10 transition-colors"
            >
              다시 입력하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
