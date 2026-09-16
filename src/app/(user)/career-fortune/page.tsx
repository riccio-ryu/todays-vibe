import { Metadata } from "next";
import GeneralFortuneForm from "@/components/fortune/GeneralFortuneForm";

export const metadata: Metadata = {
  title: "취업/시험운 | 오늘운",
  description: "생년월일로 보는 AI 맞춤 취업·시험운 풀이",
};

export default function CareerFortunePage() {
  return (
    <>
      <GeneralFortuneForm
        config={{
          type: "career-fortune",
          title: "취업/시험운",
          icon: "📋",
          questionLabel: "생년월일로 풀어보는 나의 취업·시험운",
          questionPlaceholder: "목표하는 직장이나 시험을 적어주세요",
        }}
      />
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div className="border-t border-white/10 pt-10 space-y-8">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">취업·시험운이란?</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              동양 명리학에서 직업운과 시험운은 사주 속 관성(官星)과 인성(印星)의 흐름으로 파악합니다.
              관성은 사회적 지위와 직업을, 인성은 학문·자격증·합격을 상징합니다.
              이 두 기운이 사주에서 힘을 얻는 시기에 취업이나 시험에서 좋은 결과를 내는 경향이 있습니다.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              오늘운의 AI는 생년월일 기반의 오행 분석을 통해 현재의 직업 흐름과 유리한 분야,
              시험에 집중하기 좋은 시기를 풀이합니다.
            </p>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-3">오행별 잘 맞는 직군</h3>
            <div className="grid grid-cols-1 gap-2">
              {([
                { element: "목(木)", jobs: "교육·언론·출판·기획·환경·의료", color: "text-green-400 border-green-400/20 bg-green-900/10" },
                { element: "화(火)", jobs: "예술·방송·연예·마케팅·요식업·에너지", color: "text-orange-400 border-orange-400/20 bg-orange-900/10" },
                { element: "토(土)", jobs: "부동산·건설·농업·무역·세무·행정", color: "text-yellow-400 border-yellow-400/20 bg-yellow-900/10" },
                { element: "금(金)", jobs: "금융·법률·군경·IT·기계·물류", color: "text-gray-300 border-gray-400/20 bg-gray-800/20" },
                { element: "수(水)", jobs: "연구·의학·유통·관광·철학·전략기획", color: "text-blue-400 border-blue-400/20 bg-blue-900/10" },
              ] as const).map((item) => (
                <div key={item.element} className={`rounded-xl border px-3 py-2.5 flex items-center gap-3 ${item.color}`}>
                  <span className="font-bold text-sm shrink-0 w-10">{item.element}</span>
                  <p className="text-white/50 text-xs leading-snug">{item.jobs}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white/70 font-semibold text-sm mb-2">시험·취업 준비 활용 팁</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              목표하는 직장이나 시험 종류를 구체적으로 입력할수록 더 맞춤화된 풀이를 받을 수 있습니다.
              현재 준비 상황이나 고민되는 점도 함께 적어주세요.
              AI가 지금 시기의 직업 흐름과 전략적 조언을 함께 풀이합니다.
              본 풀이는 참고용이며 최종 결정은 본인의 노력과 판단을 기반으로 하세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
