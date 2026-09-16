import Script from "next/script";
import TimeBackground from "@/components/TimeBackground";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 심리 테스트(낮/해 테마) 라우트 그룹 — 운세 (user) 그룹과 분리.
export default function PsychLayout({ children }: { children: React.ReactNode }) {
  return (
    <TimeBackground>
      <Header />
      <main className="pt-20">{children}</main>
      <Footer />
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2343737818437914"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </TimeBackground>
  );
}
