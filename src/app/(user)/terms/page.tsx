import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "이용약관 | 오늘운",
  description: "오늘운 서비스 이용약관을 안내합니다.",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> 홈
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">이용약관</h1>
      <p className="text-white/40 text-sm mb-10">시행일: 2026년 1월 1일</p>

      <div className="space-y-8 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold text-base mb-3">제1조 목적</h2>
          <p>본 약관은 오늘운(이하 "서비스")이 제공하는 AI 운세 서비스의 이용 조건 및 절차, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">제2조 서비스 내용</h2>
          <p>서비스는 인공지능(AI) 기술을 활용하여 타로, 사주, 꿈해몽, 별자리 등 운세 관련 콘텐츠를 제공합니다. 모든 해석 결과는 오락 및 참고 목적으로만 제공되며, 실제 사실이나 미래를 보장하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">제3조 회원 가입 및 이용</h2>
          <ul className="list-disc list-inside space-y-1.5 text-white/50">
            <li>서비스는 소셜 로그인(구글, 카카오, 네이버, GitHub)을 통해 회원 가입할 수 있습니다.</li>
            <li>일부 운세는 비회원도 이용 가능하나, 이용 횟수 및 기능이 제한될 수 있습니다.</li>
            <li>1인 1계정 원칙을 준수해야 합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">제4조 면책 조항</h2>
          <ul className="list-disc list-inside space-y-1.5 text-white/50">
            <li>서비스가 제공하는 운세 해석은 AI가 생성한 콘텐츠로, 사실이나 예언을 보장하지 않습니다.</li>
            <li>서비스 이용으로 인한 실제 의사결정(투자, 건강, 법률 등)의 결과에 대해 운영자는 책임을 지지 않습니다.</li>
            <li>서비스 장애, 데이터 손실 등 불가피한 사유로 인한 손해에 대해 운영자는 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">제5조 이용 제한</h2>
          <p className="mb-2">다음의 행위는 금지됩니다.</p>
          <ul className="list-disc list-inside space-y-1.5 text-white/50">
            <li>서비스를 영리 목적으로 무단 복제·배포하는 행위</li>
            <li>타인의 정보를 도용하여 이용하는 행위</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
            <li>자동화된 수단(봇 등)을 이용하여 서비스를 과도하게 이용하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">제6조 광고</h2>
          <p>서비스는 Google AdSense를 통해 광고를 게재합니다. 광고는 서비스 운영 비용을 충당하기 위해 사용됩니다.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">제7조 약관 변경</h2>
          <p>운영자는 필요 시 약관을 변경할 수 있으며, 변경 내용은 서비스 내 공지를 통해 안내합니다. 변경된 약관은 공지 후 7일이 경과하면 효력이 발생합니다.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">제8조 문의</h2>
          <p>서비스 이용 관련 문의는 <a href="mailto:ters9292@gmail.com" className="text-purple-400 hover:underline">ters9292@gmail.com</a>으로 연락해 주세요.</p>
        </section>
      </div>
    </div>
  );
}
