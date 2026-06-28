import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 오늘운",
  description: "오늘운 서비스의 개인정보 수집·이용·보관 방침을 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> 홈
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">개인정보처리방침</h1>
      <p className="text-white/40 text-sm mb-10">시행일: 2026년 1월 1일</p>

      <div className="space-y-8 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold text-base mb-3">1. 수집하는 개인정보</h2>
          <p className="mb-2">오늘운(이하 "서비스")은 다음의 개인정보를 수집합니다.</p>
          <ul className="list-disc list-inside space-y-1.5 text-white/50">
            <li>소셜 로그인(구글, 카카오, 네이버, GitHub) 시: 이름, 이메일 주소, 프로필 사진</li>
            <li>서비스 이용 시: 생년월일(사주팔자 이용 시), 꿈 내용, 질문 텍스트</li>
            <li>자동 수집: 접속 일시, 서비스 이용 기록, 기기 및 브라우저 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">2. 수집 및 이용 목적</h2>
          <ul className="list-disc list-inside space-y-1.5 text-white/50">
            <li>AI 운세 해석 서비스 제공</li>
            <li>회원 식별 및 인증</li>
            <li>이용 내역 저장 및 조회 기능 제공</li>
            <li>서비스 개선 및 품질 관리</li>
            <li>고객 문의 대응</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">3. 보관 기간</h2>
          <p>회원 탈퇴 시 지체 없이 삭제합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관 후 삭제합니다.</p>
          <ul className="list-disc list-inside space-y-1.5 text-white/50 mt-2">
            <li>전자상거래 등에서의 소비자보호에 관한 법률: 계약·청약철회 기록 5년</li>
            <li>통신비밀보호법: 서비스 접속 기록 3개월</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">4. 제3자 제공</h2>
          <p>수집한 개인정보는 원칙적으로 제3자에게 제공하지 않습니다. 단, AI 운세 해석을 위해 아래 서비스에 입력 내용이 전송됩니다.</p>
          <ul className="list-disc list-inside space-y-1.5 text-white/50 mt-2">
            <li>Google Gemini API (AI 풀이 생성)</li>
            <li>Firebase (인증 및 데이터 저장)</li>
          </ul>
          <p className="mt-2">각 서비스의 개인정보처리방침을 확인하시기 바랍니다.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">5. 광고</h2>
          <p>본 서비스는 Google AdSense를 통해 광고를 제공합니다. Google은 쿠키를 사용하여 사용자의 이전 방문 기록을 기반으로 광고를 게재할 수 있습니다. 광고 쿠키 사용을 거부하려면 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google 광고 설정</a>에서 설정하실 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 자신의 개인정보를 조회·수정·삭제할 권리가 있습니다. 마이페이지에서 직접 삭제하거나, 아래 이메일로 요청하실 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-3">7. 문의</h2>
          <p>개인정보 관련 문의는 <a href="mailto:ters9292@gmail.com" className="text-purple-400 hover:underline">ters9292@gmail.com</a>으로 연락해 주세요.</p>
        </section>
      </div>
    </div>
  );
}
