import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 심리 테스트(낮/해 테마) 라우트 그룹 — 운세 (user) 그룹과 분리.
// 배경은 홈 스와이프의 낮 패널(HomeSwipe)과 동일한 그라데이션을 써서,
// 홈 심테 탭 → 목록 → 테스트 상세로 이동해도 같은 낮 세계관이 유지되게 한다.
export default function PsychLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#fde9c8] via-[#fbd6e6] to-[#cfe5ff]"
      />
      <Header />
      <main className="pt-20 flex-1">{children}</main>
      <Footer variant="day" />
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2343737818437914"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </div>
  );
}
