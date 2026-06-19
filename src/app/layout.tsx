import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Roboto } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import PWARegister from "@/components/common/PWARegister";
import IOSInstallBanner from "@/components/common/IOSInstallBanner";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  title: "오늘운 | 오늘, 우주가 당신에게 말을 걸어요",
  description:
    "사주, 타로, 꿈해몽 등 33가지 운세로 당신의 오늘을 가장 깊이 읽어드립니다.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "오늘운",
    startupImage: "/icons/icon-512x512.png",
  },
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand/favicon.png",
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
  },
  other: {
    "google-adsense-account": "ca-pub-2343737818437914",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${roboto.variable} ${notoSansKR.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PWARegister />
        <IOSInstallBanner />
        <AuthProvider>{children}</AuthProvider>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2343737818437914"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
