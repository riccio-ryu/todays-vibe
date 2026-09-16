import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allDreamSymbols,
  getDreamBySlug,
  getDreamsByCategory,
} from "@/data/dream-dictionary";
import AdSlot from "@/components/common/AdSlot";
import { BASE_URL } from "@/lib/utils/site";
import BackHomePill from "@/components/common/BackHomePill";
import SignBadge from "@/components/dream/SignBadge";

export function generateStaticParams() {
  return allDreamSymbols.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dream = getDreamBySlug(slug);
  if (!dream) return {};
  const title = `${dream.title} 해몽 — ${dream.sign}? 전통 해몽과 심리학 풀이 | 오늘운`;
  const description = `${dream.title}의 의미를 정리했습니다. ${dream.summary} ${dream.keywords
    .slice(0, 3)
    .join(", ")} 등 상황별 풀이까지 확인하세요.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/dream-dictionary/${slug}` },
    openGraph: { title, description },
  };
}

export default async function DreamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dream = getDreamBySlug(slug);
  if (!dream) notFound();

  const related = getDreamsByCategory(dream.category).filter((d) => d.slug !== dream.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${dream.title} 해몽`,
    description: dream.summary,
    author: { "@type": "Organization", name: "오늘운" },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 상단 내비게이션 */}
      <div className="flex items-center justify-between mb-8">
        <BackHomePill href="/dream-dictionary" label="꿈해몽 사전" />
        <BackHomePill arrow={false} />
      </div>

      {/* 헤더 */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">{dream.emoji}</span>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-white font-bold text-2xl">{dream.title}</h1>
          <SignBadge sign={dream.sign} />
        </div>
        <p className="text-white/55 text-sm leading-relaxed max-w-lg mx-auto">{dream.summary}</p>
      </div>

      <div className="space-y-5">
        {/* 전통 해몽 */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <h2 className="text-amber-300/80 text-xs font-semibold uppercase tracking-widest mb-3">
            전통 해몽으로 보면
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">{dream.traditional}</p>
        </section>

        {/* 심리학적 해석 */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <h2 className="text-sky-300/80 text-xs font-semibold uppercase tracking-widest mb-3">
            심리학 관점으로 보면
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">{dream.psychological}</p>
        </section>

        {/* 상황별 풀이 */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <h2 className="text-purple-300/80 text-xs font-semibold uppercase tracking-widest mb-4">
            상황별 풀이
          </h2>
          <ul className="space-y-4">
            {dream.variations.map((v) => (
              <li key={v.title}>
                <p className="text-white/85 text-sm font-medium mb-1">{v.title}</p>
                <p className="text-white/60 text-sm leading-relaxed">{v.meaning}</p>
              </li>
            ))}
          </ul>
        </section>

        <AdSlot slot="5693296487" className="rounded-xl" />

        {/* AI 해몽 CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-400/20 p-5 text-center">
          <p className="text-white/85 text-sm font-medium mb-1">
            내가 꾼 {dream.title.replace(/ ?\(.*\)/, "").replace(/꿈$/, "")} 꿈은 조금 달랐다면?
          </p>
          <p className="text-white/50 text-xs mb-3">
            꿈의 내용을 그대로 적어주시면 AI가 맞춤으로 풀이해 드립니다
          </p>
          <Link
            href="/dream"
            className="inline-block px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
          >
            💭 AI 꿈해몽 하러 가기
          </Link>
        </div>

        {/* 같은 카테고리의 다른 꿈 */}
        <section>
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
            {dream.category} 관련 다른 꿈
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {related.map((d) => (
              <Link
                key={d.slug}
                href={`/dream-dictionary/${d.slug}`}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-3 hover:border-purple-400/30 transition-colors"
              >
                <span className="text-lg">{d.emoji}</span>
                <span className="text-white/70 text-xs">{d.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
