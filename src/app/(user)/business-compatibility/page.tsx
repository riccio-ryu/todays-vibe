import { Metadata } from "next";
import CompatibilityBirthForm from "@/components/fortune/CompatibilityBirthForm";

export const metadata: Metadata = {
  title: "사업 파트너 궁합 | 오늘운",
  description: "두 사람의 생년월일로 보는 AI 사업 파트너 궁합 풀이",
};

export default function BusinessCompatibilityPage() {
  return (
    <>
      <CompatibilityBirthForm
        config={{
          type: "business-compatibility",
          title: "사업 파트너 궁합",
          icon: "🤝",
          gradient: "from-blue-500 to-indigo-600",
          person2Label: "파트너",
        }}
      />
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">사업 파트너 궁합이란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              사업 궁합은 동양 명리학에서 두 사람의 사주 오행 기운이 비즈니스 파트너로서 얼마나 잘 맞는지를 분석합니다.
              연애 궁합과 달리 사업에서는 상대의 장점이 나의 약점을 보완하는 상극 관계도
              오히려 강력한 시너지가 되는 경우가 많습니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              오늘운의 AI는 두 사람의 오행 특성을 분석해 역할 분담의 적합성, 의사결정 스타일의 호환성,
              그리고 사업에서 함께 성장할 수 있는 방향을 풀이합니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">사업 궁합 핵심 — 역할 분담</h3>
            <div className="grid grid-cols-1 gap-2">
              {([
                { element: "목(木) 파트너", role: "기획·아이디어·성장 전략", desc: "새로운 방향을 제시하고 장기적 비전을 그리는 역할에 강합니다. 화(火) 기운의 파트너와 협업 시 아이디어를 실행으로 잘 이어줍니다.", color: "text-green-400 border-green-400/20 bg-green-900/10" },
                { element: "화(火) 파트너", role: "마케팅·영업·대외 커뮤니케이션", desc: "사람을 끌어모으고 브랜드를 알리는 데 탁월. 토(土) 기운의 파트너와 실행력을 보완하면 강력한 팀이 됩니다.", color: "text-orange-400 border-orange-400/20 bg-orange-900/10" },
                { element: "토(土) 파트너", role: "운영·재무·실행 관리", desc: "안정적인 조직 운영과 현실적 실행에 강합니다. 금(金) 기운의 파트너와 함께하면 체계적인 시스템을 만들어냅니다.", color: "text-yellow-400 border-yellow-400/20 bg-yellow-900/10" },
                { element: "금(金) 파트너", role: "법무·회계·품질 관리", desc: "원칙과 기준을 세우고 리스크를 관리하는 역할에 적합. 수(水) 기운의 파트너와 전략적 판단을 나누면 시너지가 납니다.", color: "text-gray-300 border-gray-400/20 bg-gray-800/20" },
                { element: "수(水) 파트너", role: "연구·분석·전략 수립", desc: "데이터와 정보를 분석해 전략적 결정을 내리는 데 강합니다. 목(木) 기운의 파트너와 비전을 함께 구체화합니다.", color: "text-blue-400 border-blue-400/20 bg-blue-900/10" },
              ] as const).map((item) => (
                <div key={item.element} className={`rounded-xl border px-3 py-2.5 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{item.element}</span>
                    <span className="text-xs opacity-60">— {item.role}</span>
                  </div>
                  <p className="text-white/40 text-[11px] leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-2">사업 궁합 활용 팁</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              두 사람의 정확한 생년월일을 입력하세요.
              현재 함께하고 싶은 사업 분야나 파트너십의 고민을 추가로 입력하면 더 구체적인 풀이를 받을 수 있습니다.
              사업 파트너 선택은 궁합 외에도 상호 신뢰, 역량, 계약 관계 등 현실적 요소를 함께 고려하세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
