import type { Metadata } from "next";
import Link from "next/link";
import { allPsychTests } from "@/data/psych-tests";
import { BASE_URL } from "@/lib/utils/site";

export const metadata: Metadata = {
  title: "심리 테스트 — 4지선다로 알아보는 나의 심리 | 오늘운",
  description:
    "오늘의 에너지, 숨겨진 감정, 결정 스타일, 관계 유형까지. 짧은 4지선다 문항에 답하면 AI가 지금 나의 심리 상태를 맞춤 해석해 드립니다. 회원이면 누구나 무료로 즐겨보세요.",
  alternates: { canonical: `${BASE_URL}/psych-test` },
};

export default function PsychTestListPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <span className="text-5xl block mb-3">🧠</span>
        <h1 className="text-white font-bold text-2xl mb-3">심리 테스트</h1>
        <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto">
          운세보다 조금 더 가볍게, 지금 내 마음을 들여다보는 시간. 짧은 4지선다 문항에 답하면
          AI가 지금 당신의 심리 상태를 읽고 맞춤 해석과 조언을 건네드립니다. 마음에 드는 테스트를
          골라 시작해 보세요.
        </p>
      </div>

      {/* 테스트 카드 그리드 */}
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {allPsychTests.map((test) => (
          <Link
            key={test.slug}
            href={`/psych-test/${test.slug}`}
            className="group rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-[#9382ff]/6 hover:border-[#9382ff]/30 transition-colors"
          >
            <div className="text-3xl mb-3">{test.icon}</div>
            <h2 className="text-[#f4f0ff] font-semibold text-base mb-1.5 group-hover:text-white transition-colors">
              {test.title}
            </h2>
            <p className="text-white/55 text-sm leading-snug">{test.summary}</p>
            <p className="text-[#9382ff] text-xs mt-3">{test.questions.length}문항 · AI 해석 →</p>
          </Link>
        ))}
      </div>

      {/* SEO/소개 콘텐츠 */}
      <div className="border-t border-white/10 pt-10 space-y-8">
        <div>
          <h2 className="text-white font-bold text-lg mb-3">심리 테스트란?</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            심리 테스트는 몇 가지 질문에 대한 나의 선택을 통해 평소 의식하지 못했던 성향과 감정,
            사고방식을 비춰보는 자기 이해의 도구입니다. 정답이 정해져 있는 시험이 아니라, 지금 이
            순간의 나를 있는 그대로 관찰하는 과정에 가깝습니다. 오늘운의 심리 테스트는 짧은
            4지선다 문항으로 부담 없이 참여할 수 있으며, 응답을 바탕으로 AI가 매번 새로운 맞춤
            해석을 들려드립니다.
          </p>
        </div>

        <div>
          <h3 className="text-white/70 font-semibold text-sm mb-3">이럴 때 해보면 좋아요</h3>
          <ul className="space-y-2 text-white/50 text-sm leading-relaxed">
            <li>· 오늘 하루 내 컨디션과 마음 상태가 궁금할 때</li>
            <li>· 겉으로 드러난 기분 아래 진짜 감정이 무엇인지 알고 싶을 때</li>
            <li>· 중요한 선택을 앞두고 나의 결정 방식을 돌아보고 싶을 때</li>
            <li>· 사람들과의 관계에서 나의 자리를 이해하고 싶을 때</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white/70 font-semibold text-sm mb-2">참고해 주세요</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            오늘운의 심리 테스트는 재미와 자기 이해를 돕기 위한 콘텐츠이며, 전문적인 심리 상담이나
            의학적 진단을 대신하지 않습니다. 결과는 지금의 나를 비추는 하나의 참고점으로 가볍게
            받아들여 주세요. 마음의 어려움이 오래 이어진다면 전문가의 도움을 받아보시길 권합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
