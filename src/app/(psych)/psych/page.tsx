import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BASE_URL } from "@/lib/utils/site";
import { PSYCH_ENABLED } from "@/lib/psych/config";
import { getVisiblePsychTests } from "@/lib/psych/settings";
import ComingSoonSection from "@/components/psych/ComingSoonSection";

export const metadata: Metadata = {
  title: "심리 테스트 — MBTI·성격·연애 무료 테스트 | 오늘운",
  description:
    "MBTI부터 성격·연애·유형 테스트까지. 로그인 없이 몇 문항으로 나를 알아보는 무료 심리 테스트.",
  alternates: { canonical: `${BASE_URL}/psych` },
};

// admin 노출·순서·신규 심테가 재배포 없이 반영되도록 ISR (60초)
export const revalidate = 60;

export default async function PsychListPage() {
  if (!PSYCH_ENABLED) notFound();
  const tests = await getVisiblePsychTests();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-slate-800 font-bold text-2xl mb-2">심리 테스트</h1>
        <p className="text-slate-500 text-sm">
          몇 문항으로 알아보는 나의 성향. 로그인 없이 바로 결과 확인.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {tests.map((t) => (
          <Link
            key={t.slug}
            href={`/psych/${t.slug}`}
            className="flex items-center gap-4 rounded-2xl bg-white/60 border border-slate-900/8 px-5 py-4 hover:border-[#9382ff]/40 transition-colors"
          >
            <span className="text-3xl">{t.icon}</span>
            <div className="min-w-0">
              <p className="text-slate-800 font-semibold text-sm">
                {t.title}
                {t.engine === "ai" && (
                  <span className="ml-2 text-[10px] font-medium text-[#5046e4] bg-[#9382ff]/10 px-1.5 py-0.5 rounded-full align-middle">
                    ✦ AI
                  </span>
                )}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{t.summary}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 카탈로그 미구현분 — 흐릿하게, 클릭 불가 */}
      <ComingSoonSection variant="day" />
    </div>
  );
}
