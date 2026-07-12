import type { Metadata } from "next";
import zodiacData from "@/data/zodiac-signs.json";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.todays-vibe.com";

export function generateStaticParams() {
  return zodiacData.zodiacSigns.map((s) => ({ sign: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign } = await params;
  const signInfo = zodiacData.zodiacSigns.find((s) => s.id === sign);
  if (!signInfo) return {};
  const title = `${signInfo.name} 오늘의 운세 — 성격, 연애, 궁합 (${signInfo.dateRange}) | 오늘운`;
  const description = `${signInfo.name}(${signInfo.nameEn}, ${signInfo.dateRange})의 오늘·주간·월간·연간 운세와 성격, 연애 스타일, 직업 적성, 궁합이 좋은 별자리까지 한 페이지에서 확인하세요.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/zodiac/${sign}` },
    openGraph: { title, description },
  };
}

export default function ZodiacSignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
