import { Metadata } from "next";
import GeneralFortuneForm from "@/components/fortune/GeneralFortuneForm";

export const metadata: Metadata = {
  title: "건강운 | 오늘운",
  description: "생년월일로 보는 AI 맞춤 건강운 풀이",
};

export default function HealthFortunePage() {
  return (
    <>
      <GeneralFortuneForm
        config={{
          type: "health-fortune",
          title: "건강운",
          icon: "🌿",
          questionLabel: "생년월일로 풀어보는 나의 건강운",
          questionPlaceholder: "현재 건강 상태나 걱정되는 부분을 적어주세요",
        }}
      />
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">건강운이란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              동양 명리학과 한의학에서는 사람이 태어난 시간의 오행 기운이 타고난 체질과 건강 경향을 결정한다고 봅니다.
              사주 속 오행(목·화·토·금·수)의 균형과 과부족에 따라 어느 장기가 튼튼하고 어디가 약한지를 파악할 수 있습니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              오늘운의 AI 건강운 풀이는 생년월일에서 오행 균형을 분석해 타고난 체질적 특징과
              현재 시기에 주의해야 할 건강 영역을 안내합니다.
              의학적 진단이 아닌 참고 자료로 활용해 주세요.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">오행과 신체 부위의 관계</h3>
            <div className="grid grid-cols-1 gap-2">
              {([
                { element: "목(木)", organ: "간·담낭·눈·근육·신경계", trait: "스트레스와 분노 감정이 간에 영향을 줍니다. 목 기운이 약하면 눈·근육 피로가 생기기 쉽습니다.", color: "text-green-400 border-green-400/20 bg-green-900/10" },
                { element: "화(火)", organ: "심장·소장·혀·혈액순환", trait: "흥분과 불안이 심장에 영향을 미칩니다. 화 기운이 과하면 불면증, 부족하면 순환 문제가 나타날 수 있습니다.", color: "text-red-400 border-red-400/20 bg-red-900/10" },
                { element: "토(土)", organ: "비장·위장·입·소화기", trait: "과식과 걱정이 소화기를 약하게 합니다. 토 기운이 약하면 위염·식욕 변화가 잦아질 수 있습니다.", color: "text-yellow-400 border-yellow-400/20 bg-yellow-900/10" },
                { element: "금(金)", organ: "폐·대장·코·피부·호흡기", trait: "슬픔과 건조한 환경이 폐에 영향을 줍니다. 금 기운이 약하면 호흡기·피부 트러블이 생기기 쉽습니다.", color: "text-gray-300 border-gray-400/20 bg-gray-800/20" },
                { element: "수(水)", organ: "신장·방광·귀·뼈·생식기", trait: "과로와 공포가 신장에 영향을 줍니다. 수 기운이 약하면 허리·관절 문제와 만성 피로가 나타날 수 있습니다.", color: "text-blue-400 border-blue-400/20 bg-blue-900/10" },
              ] as const).map((item) => (
                <div key={item.element} className={`rounded-xl border px-3 py-2.5 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{item.element}</span>
                    <span className="text-white/40 text-xs">— {item.organ}</span>
                  </div>
                  <p className="text-white/40 text-xs leading-snug">{item.trait}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-2">건강운 풀이 활용 팁</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              현재 건강 고민이나 증상을 구체적으로 입력하면 더 맞춤화된 분석을 받을 수 있습니다.
              오늘운의 건강운은 전통 명리학 기반의 참고 자료로, 의료적 진단이나 치료를 대체하지 않습니다.
              건강 이상이 있다면 반드시 의료 전문가와 상담하세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
