import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPsychTests, getPsychTestBySlug } from "@/data/psych";
import QuizLayout from "@/components/psych/QuizLayout";
import AiQuizLayout from "@/components/psych/AiQuizLayout";
import { BASE_URL } from "@/lib/utils/site";
import { PSYCH_ENABLED } from "@/lib/psych/config";
import { isPsychTestEnabled, getVisiblePsychTests } from "@/lib/psych/settings";

export function generateStaticParams() {
  if (!PSYCH_ENABLED) return [];
  return allPsychTests.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = getPsychTestBySlug(slug);
  if (!test) return {};
  const title = `${test.title} — ${test.questions.length}문항 무료 심리 테스트 | 오늘운`;
  return {
    title,
    description: test.summary,
    alternates: { canonical: `${BASE_URL}/psych/${slug}` },
    openGraph: { title, description: test.summary },
  };
}

export default async function PsychTestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!PSYCH_ENABLED) notFound();
  const { slug } = await params;
  const test = getPsychTestBySlug(slug);
  if (!test) notFound();
  if (!(await isPsychTestEnabled(slug))) notFound(); // admin 비활성 시 숨김

  const others = (await getVisiblePsychTests()).filter((t) => t.slug !== test.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: test.title,
    description: test.summary,
    educationalAlignment: {
      "@type": "AlignmentObject",
      alignmentType: "assesses",
      targetName: "성격 유형",
    },
    author: { "@type": "Organization", name: "오늘운" },
  };

  return (
    <div className="max-w-2xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {test.engine === "ai" ? (
        <AiQuizLayout test={test} />
      ) : (
        <QuizLayout test={test} />
      )}

      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-10 space-y-8">
          {test.seoContent.map((block) => (
            <div key={block.heading}>
              <h2 className="text-white font-bold text-lg mb-3">{block.heading}</h2>
              <p className="text-white/50 text-sm leading-relaxed">{block.body}</p>
            </div>
          ))}

          {others.length > 0 && (
            <div>
              <h3 className="text-white/70 font-semibold text-sm mb-3">다른 심리 테스트</h3>
              <div className="grid grid-cols-1 gap-2">
                {others.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/psych/${t.slug}`}
                    className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:border-white/25 transition-colors"
                  >
                    <span className="text-xl">{t.icon}</span>
                    <div className="min-w-0">
                      <p className="text-white/80 text-sm">{t.title}</p>
                      <p className="text-white/40 text-xs truncate">{t.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
