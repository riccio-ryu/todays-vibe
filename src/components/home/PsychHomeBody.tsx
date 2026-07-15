import Link from "next/link";
import { allPsychTests } from "@/data/psych";
import Footer from "@/components/Footer";

// 낮/해 테마 심리 테스트 홈 패널 (스와이프 캐러셀의 오른쪽 패널).
// 배경(밝은 낮 그라데이션)은 HomeSwipe의 fixed 배경 레이어가 담당하므로 여기선 투명.
export default function PsychHomeBody() {
  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-6">
        {/* 헤더 */}
        <header className="text-center mb-8 pt-2">
          <span className="text-5xl block mb-3">☀️</span>
          <h1 className="text-slate-800 font-bold text-2xl mb-2">심리 테스트</h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
            밝은 낮의 시간. 몇 문항으로 지금의 나를 알아보는 가벼운 심리 테스트예요.
            대부분 로그인 없이 바로 결과를 볼 수 있어요.
          </p>
        </header>

        {/* 테스트 카드 */}
        <div className="grid sm:grid-cols-2 gap-3">
          {allPsychTests.map((t) => (
            <Link
              key={t.slug}
              href={`/psych/${t.slug}`}
              className="group rounded-2xl bg-white/70 border border-white/80 shadow-sm p-5 hover:bg-white hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{t.icon}</span>
                <div className="min-w-0">
                  <p className="text-slate-800 font-semibold text-sm mb-0.5">
                    {t.title}
                    {t.engine === "ai" && (
                      <span className="ml-1.5 text-[10px] font-medium text-[#6d5cff] bg-[#6d5cff]/10 px-1.5 py-0.5 rounded-full align-middle">
                        ✦ AI
                      </span>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs leading-snug">{t.summary}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 소개 */}
        <section className="mt-10 rounded-2xl bg-white/60 border border-white/80 p-6">
          <h2 className="text-slate-800 font-semibold text-base mb-3">심리 테스트란?</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            몇 가지 질문에 대한 나의 선택으로 평소 의식하지 못했던 성향과 감정을 비춰보는
            자기 이해의 도구예요. 정답이 있는 시험이 아니라, 지금의 나를 가볍게 관찰하는
            과정에 가깝습니다. MBTI부터 연애·동물·직장 유형까지, 마음에 드는 테스트를 골라
            시작해 보세요.
          </p>
        </section>
      </div>

      <Footer variant="day" />
    </div>
  );
}
