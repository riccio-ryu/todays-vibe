import { Metadata } from "next";
import CompatibilityBirthForm from "@/components/fortune/CompatibilityBirthForm";

export const metadata: Metadata = {
  title: "연애 궁합 | 오늘운",
  description: "두 사람의 생년월일로 보는 AI 연애 궁합 풀이",
};

export default function LoveCompatibilityPage() {
  return (
    <>
      <CompatibilityBirthForm
        config={{
          type: "love-compatibility",
          title: "연애 궁합",
          icon: "💑",
          gradient: "from-pink-500 to-rose-600",
          person2Label: "상대방",
        }}
      />
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">연애 궁합이란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              궁합(宮合)은 두 사람의 사주팔자를 맞대어 서로의 오행 기운이 어떻게 작용하는지 분석하는 동양 전통입니다.
              혼인을 앞두고 두 집안의 운명이 잘 맞는지 살피던 데서 유래했으며,
              현대에는 연인·부부의 성격 궁합과 관계 발전 가능성을 파악하는 데 활용됩니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              오늘운의 AI 연애 궁합은 두 사람의 생년월일에서 오행 기운을 각각 분석하고,
              서로가 상생하는지 상극하는지를 파악해 관계의 특성과 조언을 풀이합니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">오행 상생·상극으로 보는 궁합</h3>
            <div className="grid grid-cols-1 gap-2">
              {([
                { label: "상생(相生) 관계", desc: "목→화→토→금→수→목 순으로 서로를 키워주는 관계. 자연스럽게 보완이 되어 안정적이고 발전적인 궁합입니다.", color: "text-green-400 border-green-400/20 bg-green-900/10" },
                { label: "상극(相剋) 관계", desc: "목←토, 화←수, 토←목 등 한쪽이 다른 쪽을 누르는 관계. 갈등이 생기기 쉽지만 서로를 자극해 성장하게도 합니다.", color: "text-orange-400 border-orange-400/20 bg-orange-900/10" },
                { label: "같은 오행 관계", desc: "같은 에너지를 가진 두 사람. 이해도가 높고 편안하지만 자극이나 보완이 부족할 수 있습니다.", color: "text-blue-400 border-blue-400/20 bg-blue-900/10" },
              ] as const).map((item) => (
                <div key={item.label} className={`rounded-xl border px-3 py-2.5 ${item.color}`}>
                  <p className="font-medium text-sm mb-0.5">{item.label}</p>
                  <p className="text-white/40 text-xs leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-2">궁합 풀이 활용 팁</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              두 사람의 정확한 생년월일을 입력해야 신뢰도 높은 궁합 분석이 가능합니다.
              궁합은 관계의 흐름을 이해하는 참고 자료로 활용하세요.
              좋은 궁합도 노력 없이는 빛나지 않으며, 어려운 궁합도 서로의 이해로 극복할 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
