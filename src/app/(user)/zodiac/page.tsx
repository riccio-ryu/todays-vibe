import Link from "next/link";
import zodiacData from "@/data/zodiac-signs.json";
import SpriteCard from "@/components/common/SpriteCard";

export default function ZodiacPage() {
  const signs = zodiacData.zodiacSigns;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="text-white/40 text-sm mb-2">별자리 운세</p>
          <h1 className="text-3xl font-bold text-white mb-3">오늘의 별자리</h1>
          <p className="text-white/50 text-sm">나의 별자리를 선택하세요</p>
        </div>

        {/* 12별자리 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {signs.map((sign) => (
            <Link key={sign.id} href={`/zodiac/${sign.id}`}>
              <div className="group rounded-2xl overflow-hidden border border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/40 hover:border-white/20 transition-all duration-200 cursor-pointer">
                <SpriteCard
                  type="zodiac"
                  id={sign.id}
                  className="w-full aspect-[2/3]"
                />
                <div className="bg-white/5 px-3 py-2 text-center">
                  <p className="text-white font-semibold text-sm">{sign.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{sign.dateRange}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 별자리 운세 안내 */}
        <div className="mt-12 border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">별자리 운세(점성술)란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              서양 점성술(Astrology)은 약 3,000년 전 메소포타미아 문명에서 시작되었습니다.
              지구에서 바라본 태양의 경로인 황도(Ecliptic)를 12개 구간으로 나눠
              각 구간에 별자리 이름을 붙인 것이 황도 12궁(Zodiac Belt)입니다.
              태어날 때 태양이 어느 구간에 위치했는지에 따라 태양별자리(Sun Sign)가 결정되며,
              이것이 성격·기질·대인관계·운세에 영향을 준다고 봅니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              오늘운의 별자리 운세는 일·주·월·연 단위로 제공됩니다.
              AI가 천체 흐름을 분석해 각 별자리의 에너지와 조언을 매일 새롭게 업데이트합니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">4원소와 12별자리</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { element: "불(Fire)", signs: "양자리 · 사자자리 · 사수자리", trait: "열정적이고 행동력이 강합니다", color: "text-orange-400 border-orange-400/30 bg-orange-900/10" },
                { element: "흙(Earth)", signs: "황소자리 · 처녀자리 · 염소자리", trait: "현실적이고 안정을 중시합니다", color: "text-green-400 border-green-400/30 bg-green-900/10" },
                { element: "바람(Air)", signs: "쌍둥이자리 · 천칭자리 · 물병자리", trait: "지적이고 소통을 즐깁니다", color: "text-yellow-300 border-yellow-400/30 bg-yellow-900/10" },
                { element: "물(Water)", signs: "게자리 · 전갈자리 · 물고기자리", trait: "감성적이고 직관이 뛰어납니다", color: "text-blue-400 border-blue-400/30 bg-blue-900/10" },
              ].map((el) => (
                <div key={el.element} className={`rounded-xl border p-3 ${el.color}`}>
                  <p className="font-semibold text-sm mb-1">{el.element}</p>
                  <p className="text-white/40 text-[11px] leading-snug mb-1">{el.signs}</p>
                  <p className="text-white/50 text-[11px]">{el.trait}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
