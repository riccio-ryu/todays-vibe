import Script from "next/script";
import TimeBackground from "@/components/TimeBackground";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <TimeBackground>
      <Header />
      <main className="pt-[60px]">
        {children}
      </main>
      <Footer />
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2343737818437914"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </TimeBackground>
  );
}
