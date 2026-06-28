import { Metadata } from "next";
import GeneralFortuneForm from "@/components/fortune/GeneralFortuneForm";

export const metadata: Metadata = {
  title: "재물운 | 오늘운",
  description: "생년월일로 보는 AI 맞춤 재물운 풀이",
};

export default function WealthFortunePage() {
  return (
    <>
      <GeneralFortuneForm
        config={{
          type: "wealth-fortune",
          title: "재물운",
          icon: "💰",
          questionLabel: "생년월일로 풀어보는 나의 재물운",
          questionPlaceholder: "재정 목표나 현재 상황을 적어주세요",
        }}
      />
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">재물운이란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              동양 명리학에서 재물운은 사주 속 재성(財星)의 강약과 흐름으로 분석합니다.
              재성은 내가 극(剋)하는 오행으로, 내가 다루고 통제할 수 있는 에너지를 의미합니다.
              재성이 사주에서 힘을 얻는 시기에 금전적 기회와 이익이 찾아오는 경향이 있습니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              재물운은 단순히 돈이 들어오는 시기만을 의미하지 않습니다.
              타고난 재물 기질—축재 능력, 투자 성향, 소비 패턴—을 파악하고
              현재 시기의 금전 흐름을 이해하는 데 도움을 줍니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">오행별 재물 다루는 방식</h3>
            <div className="grid grid-cols-1 gap-2">
              {([
                { element: "목(木) 기운", style: "성장 투자형", desc: "장기적으로 쌓아가는 것을 선호. 교육·자기계발에 아끼지 않고, 인내심 있게 자산을 키워갑니다.", color: "text-green-400 border-green-400/20 bg-green-900/10" },
                { element: "화(火) 기운", style: "즉흥 소비형", desc: "순간의 열정으로 지출하는 경향. 트렌드에 민감하며 감각적 소비를 즐기지만 변동이 큽니다.", color: "text-orange-400 border-orange-400/20 bg-orange-900/10" },
                { element: "토(土) 기운", style: "안정 저축형", desc: "현실적이고 보수적인 자산 관리를 선호. 부동산이나 안정적 금융 상품에 관심이 높습니다.", color: "text-yellow-400 border-yellow-400/20 bg-yellow-900/10" },
                { element: "금(金) 기운", style: "원칙 관리형", desc: "철저한 계획과 규율로 재물을 관리. 높은 수익보다 리스크 최소화를 우선시합니다.", color: "text-gray-300 border-gray-400/20 bg-gray-800/20" },
                { element: "수(水) 기운", style: "유연 투자형", desc: "정보력과 직감으로 기회를 포착. 흐름을 잘 읽어 다양한 분야에서 재물을 만들어냅니다.", color: "text-blue-400 border-blue-400/20 bg-blue-900/10" },
              ] as const).map((item) => (
                <div key={item.element} className={`rounded-xl border px-3 py-2.5 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{item.element}</span>
                    <span className="text-xs opacity-70">— {item.style}</span>
                  </div>
                  <p className="text-white/40 text-xs leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-2">재물운 풀이 활용 팁</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              현재 재정 목표나 고민(투자 여부, 이직·사업 검토 등)을 구체적으로 입력하면
              더 맞춤화된 풀이를 받을 수 있습니다.
              오늘운의 재물운은 재미와 참고 목적으로 제공되며, 실제 금융·투자 결정에는
              전문가의 조언과 본인의 판단을 우선하세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
