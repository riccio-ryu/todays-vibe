import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCards,
  getCardBySlug,
  getCardSlug,
  getCardImageUrl,
  getCardsBySuit,
  getSuitLabel,
  type TarotCardData,
} from "@/lib/tarot/utils";
import { getCardContent } from "@/data/tarot-card-content";
import AdSlot from "@/components/common/AdSlot";
import { BASE_URL } from "@/lib/utils/site";
import BackHomePill from "@/components/common/BackHomePill";

const ELEMENT_LABEL: Record<string, string> = {
  fire: "불 (열정·행동)",
  water: "물 (감정·관계)",
  air: "공기 (사고·판단)",
  earth: "흙 (물질·현실)",
};

export function generateStaticParams() {
  return getAllCards().map((card) => ({ slug: getCardSlug(card) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) return {};
  const title = `${card.nameKo} (${card.name}) 타로 카드 의미 — 정방향·역방향 해석 | 오늘운`;
  const description = `타로 ${getSuitLabel(card.suit)} ${card.nameKo} 카드의 키워드(${card.keywords
    .slice(0, 3)
    .join(", ")}), 정방향·역방향 의미, 연애·직업·금전운 해석을 확인하세요.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/tarot-cards/${slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: getCardImageUrl(card.id) }],
    },
  };
}

function orientedFortunes(card: TarotCardData, reversed: boolean) {
  const content = getCardContent(card.id);
  const base = reversed ? card.reversed : card.upright;
  const key = reversed ? "reversed" : "upright";
  return [
    { label: "연애", text: base.love ?? content?.love?.[key] },
    { label: "직업", text: base.career ?? content?.career?.[key] },
    { label: "금전", text: base.finance ?? content?.finance?.[key] },
  ].filter((f): f is { label: string; text: string } => Boolean(f.text));
}

export default async function TarotCardDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) notFound();

  const content = getCardContent(card.id);
  const suitLabel = getSuitLabel(card.suit);
  const suitCards = getCardsBySuit(card.suit);
  const allCards = getAllCards();
  const idx = allCards.findIndex((c) => c.id === card.id);
  const prevCard = idx > 0 ? allCards[idx - 1] : null;
  const nextCard = idx < allCards.length - 1 ? allCards[idx + 1] : null;
  const relatedCards = suitCards.filter((c) => c.id !== card.id).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${card.nameKo} (${card.name}) 타로 카드 의미`,
    description: card.upright.meaning,
    image: `${BASE_URL}${getCardImageUrl(card.id)}`,
    author: { "@type": "Organization", name: "오늘운" },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 상단 내비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <BackHomePill href="/tarot-cards" label="카드 사전" />
        <BackHomePill arrow={false} />
      </div>

      {/* 카드 헤더 */}
      <div className="flex flex-col items-center text-center mb-8">
        <Image
          src={getCardImageUrl(card.id)}
          alt={`${card.nameKo} (${card.name}) 타로 카드`}
          width={300}
          height={500}
          className="h-72 w-auto rounded-xl shadow-2xl mb-5"
          priority
        />
        <p className="text-purple-300/70 text-xs tracking-widest uppercase mb-1">
          {suitLabel}
          {card.suit === "major" && ` ${card.number}번`}
          {card.element && ` · ${ELEMENT_LABEL[card.element] ?? card.element}`}
        </p>
        <h1 className="text-white font-bold text-2xl">
          {card.nameKo}
          <span className="text-white/40 font-normal text-lg ml-2">{card.name}</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {card.keywords.map((kw) => (
            <span
              key={kw}
              className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/20 text-purple-200 text-xs"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {/* 카드의 상징 */}
        {(content?.symbolism || card.description) && (
          <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
              카드의 상징
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              {content?.symbolism ?? card.description}
            </p>
          </section>
        )}

        {/* 정방향 */}
        <section className="rounded-2xl bg-white/5 border border-emerald-400/15 p-5">
          <h2 className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-3">
            정방향 의미
          </h2>
          <p className="text-white/85 text-sm font-medium mb-2">{card.upright.meaning}</p>
          {content?.uprightDetail && (
            <p className="text-white/70 text-sm leading-relaxed mb-4">{content.uprightDetail}</p>
          )}
          <dl className="space-y-2">
            {orientedFortunes(card, false).map(({ label, text }) => (
              <div key={label} className="flex gap-3 text-sm">
                <dt className="shrink-0 w-10 text-emerald-300/70">{label}</dt>
                <dd className="text-white/70 leading-relaxed">{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 역방향 */}
        <section className="rounded-2xl bg-white/5 border border-rose-400/15 p-5">
          <h2 className="text-rose-300 text-xs font-semibold uppercase tracking-widest mb-3">
            역방향 의미
          </h2>
          <p className="text-white/85 text-sm font-medium mb-2">{card.reversed.meaning}</p>
          {content?.reversedDetail && (
            <p className="text-white/70 text-sm leading-relaxed mb-4">{content.reversedDetail}</p>
          )}
          <dl className="space-y-2">
            {orientedFortunes(card, true).map(({ label, text }) => (
              <div key={label} className="flex gap-3 text-sm">
                <dt className="shrink-0 w-10 text-rose-300/70">{label}</dt>
                <dd className="text-white/70 leading-relaxed">{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 조언 */}
        {content?.advice && (
          <section className="rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-400/20 p-5">
            <h2 className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-3">
              이 카드가 나왔다면
            </h2>
            <p className="text-white/85 text-sm leading-relaxed">{content.advice}</p>
          </section>
        )}

        <AdSlot slot="5693296487" className="rounded-xl" />

        {/* 이전/다음 카드 */}
        <nav className="flex gap-3">
          {prevCard && (
            <Link
              href={`/tarot-cards/${getCardSlug(prevCard)}`}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-left hover:border-white/25 transition-colors"
            >
              <p className="text-white/40 text-xs mb-0.5">← 이전 카드</p>
              <p className="text-white/80 text-sm">{prevCard.nameKo}</p>
            </Link>
          )}
          {nextCard && (
            <Link
              href={`/tarot-cards/${getCardSlug(nextCard)}`}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-right hover:border-white/25 transition-colors"
            >
              <p className="text-white/40 text-xs mb-0.5">다음 카드 →</p>
              <p className="text-white/80 text-sm">{nextCard.nameKo}</p>
            </Link>
          )}
        </nav>

        {/* 같은 수트의 다른 카드 */}
        <section>
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
            {suitLabel}의 다른 카드
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {relatedCards.map((c) => (
              <Link
                key={c.id}
                href={`/tarot-cards/${getCardSlug(c)}`}
                className="group text-center"
              >
                <Image
                  src={getCardImageUrl(c.id)}
                  alt={`${c.nameKo} 타로 카드`}
                  width={120}
                  height={200}
                  className="h-24 w-auto mx-auto rounded-md group-hover:scale-105 transition-transform"
                />
                <p className="text-white/50 group-hover:text-white/80 text-[11px] mt-1 transition-colors">
                  {c.nameKo}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/tarot-daily"
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-center text-sm font-semibold transition-colors"
          >
            오늘의 타로 뽑기
          </Link>
          <Link
            href="/tarot-3cards"
            className="flex-1 py-3 rounded-xl border border-purple-400/30 text-purple-200 hover:bg-purple-500/10 text-center text-sm font-semibold transition-colors"
          >
            타로 3장 스프레드
          </Link>
        </div>
      </div>
    </div>
  );
}
