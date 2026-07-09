import { notFound } from "next/navigation";
import Link from "next/link";
import { getPsychTest } from "@/lib/psych/registry";
import { Clock, FileText, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PsychIntroPage({ params }: Props) {
  const { slug } = await params;
  const test = getPsychTest(slug);
  if (!test) notFound();

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* 카드 */}
      <div className="psych-card p-8 mb-6">
        {/* 뱃지 */}
        <div className="flex gap-2 mb-6">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: "#cce7ff", color: "#0a5a8a" }}
          >
            <FileText className="w-3 h-3" />
            {test.source}
          </span>
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: "#f1e6ff", color: "#5a0ea0" }}
          >
            <Clock className="w-3 h-3" />약 {test.estimatedMinutes}분
          </span>
        </div>

        {/* 타이틀 */}
        <h1
          className="text-2xl font-semibold mb-3 leading-tight"
          style={{ color: "#0a0d12", letterSpacing: "-0.02em" }}
        >
          {test.title}
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#535862" }}>
          {test.description}
        </p>

        {/* 질문 수 */}
        <div
          className="flex items-center gap-3 p-4 rounded-2xl mb-8"
          style={{ background: "#ebf5ff" }}
        >
          <div className="text-2xl font-bold" style={{ color: "#181d27" }}>
            {test.questions.length}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "#0a0d12" }}>
              개의 질문
            </p>
            <p className="text-xs" style={{ color: "#93979f" }}>
              선택지를 고르면 자동으로 다음 문항으로 넘어가요
            </p>
          </div>
        </div>

        {/* 시작 버튼 */}
        <Link
          href={`/psych/${slug}/quiz`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#181d27", color: "#ffffff" }}
        >
          시작하기
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 주의사항 */}
      <p className="text-xs text-center" style={{ color: "#93979f" }}>
        이 결과는 참고용이며 전문 심리 진단을 대체하지 않습니다
      </p>
    </div>
  );
}
