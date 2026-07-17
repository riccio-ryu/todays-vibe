import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BASE_URL } from "@/lib/utils/site";
import { PSYCH_ENABLED } from "@/lib/psych/config";
import { getVisiblePsychTests } from "@/lib/psych/settings";

export const metadata: Metadata = {
  title: "심리 테스트 — MBTI·성격·연애 무료 테스트 | 오늘운",
  description:
    "MBTI부터 성격·연애·유형 테스트까지. 로그인 없이 몇 문항으로 나를 알아보는 무료 심리 테스트.",
  alternates: { canonical: `${BASE_URL}/psych` },
};

export default async function PsychListPage() {
  if (!PSYCH_ENABLED) notFound();
  const tests = await getVisiblePsychTests();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-white font-bold text-2xl mb-2">심리 테스트</h1>
        <p className="text-white/50 text-sm">
          몇 문항으로 알아보는 나의 성향. 로그인 없이 바로 결과 확인.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {tests.map((t) => (
          <Link
            key={t.slug}
            href={`/psych/${t.slug}`}
            className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 hover:border-[#9382ff]/40 transition-colors"
          >
            <span className="text-3xl">{t.icon}</span>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm">
                {t.title}
                {t.engine === "ai" && (
                  <span className="ml-2 text-[10px] font-medium text-[#9382ff] bg-[#9382ff]/10 px-1.5 py-0.5 rounded-full align-middle">
                    ✦ AI
                  </span>
                )}
              </p>
              <p className="text-white/45 text-xs mt-0.5">{t.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
