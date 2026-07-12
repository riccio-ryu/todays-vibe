import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getCardsBySuit,
  getCardSlug,
  getCardImageUrl,
  type TarotCardData,
} from "@/lib/tarot/utils";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.todays-vibe.com";

export const metadata: Metadata = {
  title: "타로 카드 78장 의미 사전 — 메이저·마이너 아르카나 총정리 | 오늘운",
  description:
    "타로 카드 78장의 의미를 한눈에. 메이저 아르카나 22장과 완드·컵·소드·펜타클 마이너 아르카나 56장의 키워드, 정방향·역방향 해석, 연애·직업·금전운을 카드별로 정리했습니다.",
  alternates: { canonical: `${BASE_URL}/tarot-cards` },
};

const SUIT_SECTIONS: { suit: string; title: string; description: string }[] = [
  {
    suit: "major",
    title: "메이저 아르카나 (22장)",
    description:
      "광대(0번)에서 세계(21번)까지, 인생의 큰 흐름과 운명적 전환점을 상징하는 카드들입니다. 리딩에서 메이저 카드가 나오면 그 주제가 삶에서 중요한 국면에 있다는 신호로 읽습니다.",
  },
  {
    suit: "wands",
    title: "완드 (14장) — 불의 원소",
    description:
      "열정, 창조, 도전, 행동력을 다루는 수트입니다. 일에 대한 의욕, 새로운 시작, 경쟁과 성취처럼 '움직이는 에너지'와 관련된 질문에서 자주 등장합니다.",
  },
  {
    suit: "cups",
    title: "컵 (14장) — 물의 원소",
    description:
      "감정, 사랑, 관계, 직관을 다루는 수트입니다. 연애운은 물론 우정과 가족, 마음의 상태를 묻는 질문에서 핵심 메시지를 전하는 카드들입니다.",
  },
  {
    suit: "swords",
    title: "소드 (14장) — 공기의 원소",
    description:
      "생각, 판단, 진실, 갈등을 다루는 수트입니다. 머릿속 고민과 결정, 소통의 문제, 시련을 통과하는 지혜에 관한 질문에서 날카로운 통찰을 줍니다.",
  },
  {
    suit: "pentacles",
    title: "펜타클 (14장) — 흙의 원소",
    description:
      "돈, 일, 건강, 현실적 안정을 다루는 수트입니다. 금전운과 직업운, 꾸준한 노력과 결실처럼 손에 잡히는 현실의 문제를 비춰주는 카드들입니다.",
  },
];

function CardGrid({ cards }: { cards: TarotCardData[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
      {cards.map((card) => (
        <Link key={card.id} href={`/tarot-cards/${getCardSlug(card)}`} className="group text-center">
          <Image
            src={getCardImageUrl(card.id)}
            alt={`${card.nameKo} (${card.name}) 타로 카드`}
            width={120}
            height={200}
            className="h-28 w-auto mx-auto rounded-md shadow-lg group-hover:scale-105 group-hover:shadow-purple-900/40 transition-all"
          />
          <p className="text-white/60 group-hover:text-white text-[11px] mt-1.5 leading-tight transition-colors">
            {card.nameKo}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default function TarotCardsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <h1 className="text-white font-bold text-2xl mb-3">타로 카드 78장 의미 사전</h1>
        <p className="text-white/60 text-sm leading-relaxed max-w-2xl mx-auto">
          타로(Tarot)는 15세기 유럽에서 시작되어 오늘날 직관과 성찰의 도구로 널리 쓰이는 78장의
          카드 덱입니다. 인생의 큰 주제를 다루는 메이저 아르카나 22장과, 일상의 구체적인 장면을
          비추는 마이너 아르카나 56장으로 이루어져 있습니다. 카드를 눌러 각 카드의 상징과
          정방향·역방향 의미, 연애·직업·금전운 해석을 확인해 보세요.
        </p>
      </div>

      {/* 정방향/역방향 안내 */}
      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        <div className="rounded-2xl bg-white/5 border border-emerald-400/15 p-4">
          <p className="text-emerald-300 text-xs font-semibold mb-1.5">정방향 (Upright)</p>
          <p className="text-white/65 text-sm leading-relaxed">
            카드가 바로 선 상태로 나온 경우입니다. 카드가 지닌 에너지가 원활하게 밖으로 흐르는
            상태로, 그 카드의 본래 의미가 온전히 발현되는 것으로 읽습니다.
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 border border-rose-400/15 p-4">
          <p className="text-rose-300 text-xs font-semibold mb-1.5">역방향 (Reversed)</p>
          <p className="text-white/65 text-sm leading-relaxed">
            카드가 뒤집혀 나온 경우입니다. 에너지가 막히거나 지연되거나 안으로 향하는 상태로,
            같은 주제라도 과잉·결핍·내면화된 형태로 나타나는 것으로 해석합니다.
          </p>
        </div>
      </div>

      {/* 수트별 섹션 */}
      <div className="space-y-12">
        {SUIT_SECTIONS.map(({ suit, title, description }) => (
          <section key={suit}>
            <h2 className="text-white font-semibold text-lg mb-2">{title}</h2>
            <p className="text-white/55 text-sm leading-relaxed mb-5">{description}</p>
            <CardGrid cards={getCardsBySuit(suit)} />
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-400/20 p-6 text-center">
        <p className="text-white font-semibold mb-1.5">카드 의미를 알았다면, 직접 뽑아보세요</p>
        <p className="text-white/55 text-sm mb-4">
          오늘 하루의 메시지를 담은 원카드부터 과거·현재·미래를 읽는 3장 스프레드까지
        </p>
        <div className="flex gap-3 max-w-md mx-auto">
          <Link
            href="/tarot-daily"
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
          >
            타로 원카드
          </Link>
          <Link
            href="/tarot-3cards"
            className="flex-1 py-3 rounded-xl border border-purple-400/30 text-purple-200 hover:bg-purple-500/10 text-sm font-semibold transition-colors"
          >
            타로 3장 스프레드
          </Link>
        </div>
      </div>
    </div>
  );
}
