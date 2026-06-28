import { Metadata } from "next";
import GeneralFortuneForm from "@/components/fortune/GeneralFortuneForm";

export const metadata: Metadata = {
  title: "연애운 | 오늘운",
  description: "생년월일로 보는 AI 맞춤 연애운 풀이",
};

export default function LoveFortunePage() {
  return (
    <>
      <GeneralFortuneForm
        config={{
          type: "love-fortune",
          title: "연애운",
          icon: "💕",
          questionLabel: "생년월일로 풀어보는 나의 연애운",
          questionPlaceholder: "현재 연애 상황이나 궁금한 점을 적어주세요",
        }}
      />
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">연애운이란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              연애운은 동양 명리학(命理學)에서 태어난 날의 천간·지지 조합으로 사람의 감정 성향과 이성과의 인연을 분석하는 분야입니다.
              일간(日干), 즉 태어난 날의 천간이 나 자신을 의미하며, 사주 속 재성(財星)·관성(官星)이 이성과 연애를 상징합니다.
              이 별들의 강약과 흐름에 따라 연애 패턴, 이상형, 인연이 맺어지기 좋은 시기 등을 파악할 수 있습니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              오늘운의 AI는 생년월일에서 오행 기운을 분석해 현재 연애 흐름, 이성 인연의 시기,
              그리고 연애에서 조심해야 할 부분을 구체적으로 풀이합니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">오행으로 보는 연애 성향</h3>
            <div className="grid grid-cols-1 gap-2">
              {([
                { element: "목(木) 기운이 강한 사람", trait: "주도적이고 성장 지향적. 상대를 이끌어가는 연애를 즐기며 발전하는 관계를 선호합니다.", color: "text-green-400 border-green-400/20 bg-green-900/10" },
                { element: "화(火) 기운이 강한 사람", trait: "열정적이고 감정 표현이 풍부. 빠르게 불타오르지만 변화를 원하는 경향이 있습니다.", color: "text-orange-400 border-orange-400/20 bg-orange-900/10" },
                { element: "토(土) 기운이 강한 사람", trait: "안정적이고 신의를 중시. 장기적인 관계를 선호하며 현실적인 연애를 합니다.", color: "text-yellow-400 border-yellow-400/20 bg-yellow-900/10" },
                { element: "금(金) 기운이 강한 사람", trait: "원칙적이고 완벽주의. 높은 기준을 갖고 있지만 한번 마음을 열면 헌신적입니다.", color: "text-gray-300 border-gray-400/20 bg-gray-800/20" },
                { element: "수(水) 기운이 강한 사람", trait: "지적이고 감성적. 마음속 깊이 감정을 품으며 교감이 깊은 연애를 추구합니다.", color: "text-blue-400 border-blue-400/20 bg-blue-900/10" },
              ] as const).map((item) => (
                <div key={item.element} className={`rounded-xl border px-3 py-2.5 ${item.color}`}>
                  <p className="font-medium text-sm mb-0.5">{item.element}</p>
                  <p className="text-white/40 text-xs leading-snug">{item.trait}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-2">AI 연애운 풀이 활용법</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              현재 연애 상황이나 고민을 구체적으로 적을수록 맞춤화된 풀이를 받을 수 있습니다.
              짝사랑 중인지, 연애 중인지, 새로운 인연을 기다리는지 알려주세요.
              오늘운의 AI 연애운은 재미와 참고 목적으로 제공되며, 중요한 감정적 결정에는 본인의 판단을 우선으로 하세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
