import { Metadata } from "next";
import DreamForm from "@/components/fortune/DreamForm";

export const metadata: Metadata = {
  title: "꿈해몽 | 오늘운",
  description: "꾼 꿈을 AI가 전통 해몽과 심리학적 관점으로 풀이해 드립니다.",
};

export default function DreamPage() {
  return (
    <>
      <DreamForm />
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">꿈해몽이란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              꿈해몽(夢解夢)은 잠 중에 꾸는 꿈의 상징과 의미를 분석해 현실과의 연관성을 찾는 전통 지혜입니다.
              동아시아에서는 예로부터 꿈을 무의식의 목소리이자 앞날의 조짐으로 여겼으며,
              조선시대에는 꿈 전문가인 &apos;몽사&apos;가 왕실의 꿈을 해석했을 만큼 중요하게 다뤄졌습니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              현대 심리학에서도 꿈은 무의식에 억압된 감정과 욕구가 상징으로 나타난다고 봅니다.
              오늘운의 AI 꿈해몽은 전통 해몽 체계와 심리학적 상징 분석을 결합해
              꿈속 인물·장소·사물의 의미를 종합적으로 해석합니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">자주 꾸는 꿈과 그 의미</h3>
            <div className="grid grid-cols-1 gap-2">
              {([
                { dream: "하늘을 나는 꿈", meaning: "자유에 대한 갈망, 현실 제약에서 벗어나고 싶은 심리. 새로운 기회가 열리는 신호로도 봅니다.", color: "text-blue-400 border-blue-400/20 bg-blue-900/10" },
                { dream: "이가 빠지는 꿈", meaning: "상실에 대한 두려움, 중요한 결정 앞에서의 불안감. 건강이나 인간관계를 점검할 시기를 알립니다.", color: "text-purple-400 border-purple-400/20 bg-purple-900/10" },
                { dream: "쫓기는 꿈", meaning: "현실 스트레스나 해결하지 못한 문제에서 도망치고 싶은 심리. 직면해야 할 과제가 있다는 신호입니다.", color: "text-orange-400 border-orange-400/20 bg-orange-900/10" },
                { dream: "돼지 꿈", meaning: "전통적으로 풍요와 재물, 복이 들어오는 길몽. 특히 돼지가 집 안으로 들어오는 꿈은 큰 재물 운으로 해석합니다.", color: "text-pink-400 border-pink-400/20 bg-pink-900/10" },
                { dream: "물·바다에 관한 꿈", meaning: "감정 상태를 반영. 맑고 잔잔한 물은 안정과 행운, 거친 파도는 현실의 어려움을 상징합니다.", color: "text-cyan-400 border-cyan-400/20 bg-cyan-900/10" },
              ] as const).map((item) => (
                <div key={item.dream} className={`rounded-xl border px-3 py-2.5 ${item.color}`}>
                  <p className="font-medium text-sm mb-0.5">{item.dream}</p>
                  <p className="text-white/40 text-xs leading-snug">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-2">AI 꿈해몽 활용 팁</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              꿈의 장면을 최대한 구체적으로 입력할수록 정확한 해석이 가능합니다.
              꿈에서 느낀 감정(무섭거나, 설레거나, 슬프거나)도 반드시 선택해 주세요.
              같은 장면이라도 감정에 따라 해몽이 크게 달라질 수 있습니다.
              꿈을 꾼 직후 가능한 빨리 기억을 떠올려 입력하는 것을 추천합니다.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
