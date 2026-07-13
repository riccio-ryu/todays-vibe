import type { Metadata } from "next";
import Link from "next/link";
import { DREAM_CATEGORIES, getDreamsByCategory } from "@/data/dream-dictionary";
import { BASE_URL } from "@/lib/utils/site";
import SignBadge from "@/components/dream/SignBadge";

export const metadata: Metadata = {
  title: "꿈해몽 사전 — 뱀꿈, 돼지꿈, 이빨 빠지는 꿈 의미 총정리 | 오늘운",
  description:
    "자주 꾸는 꿈 50가지의 의미를 전통 해몽과 심리학 관점으로 정리했습니다. 뱀꿈, 돼지꿈, 이빨 빠지는 꿈, 쫓기는 꿈, 물꿈 등 꿈별 길흉과 상황별 풀이를 확인하세요.",
  alternates: { canonical: `${BASE_URL}/dream-dictionary` },
};

export default function DreamDictionaryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-white font-bold text-2xl mb-3">꿈해몽 사전</h1>
        <p className="text-white/60 text-sm leading-relaxed max-w-xl mx-auto">
          꿈은 무의식이 보내는 편지입니다. 동아시아 전통 해몽에서는 꿈을 앞날의 조짐으로
          읽어왔고, 현대 심리학은 꿈을 낮 동안의 감정과 기억이 정리되는 과정으로 봅니다.
          오늘운의 꿈해몽 사전은 두 관점을 함께 담아, 자주 꾸는 꿈 50가지의 의미와
          상황별 풀이를 정리했습니다.
        </p>
      </div>

      {/* 카테고리별 목록 */}
      <div className="space-y-10">
        {DREAM_CATEGORIES.map((category) => (
          <section key={category}>
            <h2 className="text-white font-semibold text-lg mb-4">{category} 꿈</h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {getDreamsByCategory(category).map((dream) => (
                <Link
                  key={dream.slug}
                  href={`/dream-dictionary/${dream.slug}`}
                  className="group flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3.5 hover:border-purple-400/30 hover:bg-white/[0.08] transition-all"
                >
                  <span className="text-2xl shrink-0">{dream.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white/85 group-hover:text-white text-sm font-medium transition-colors">
                        {dream.title}
                      </p>
                      <SignBadge sign={dream.sign} size="sm" className="shrink-0" />
                    </div>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{dream.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-400/20 p-6 text-center">
        <p className="text-white font-semibold mb-1.5">찾는 꿈이 없거나 더 자세한 풀이가 필요하다면</p>
        <p className="text-white/55 text-sm mb-4">
          꾼 꿈을 그대로 적어주시면 AI가 전통 해몽과 심리학 관점으로 맞춤 풀이해 드립니다
        </p>
        <Link
          href="/dream"
          className="inline-block px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
        >
          💭 AI 꿈해몽 하러 가기
        </Link>
      </div>
    </div>
  );
}
