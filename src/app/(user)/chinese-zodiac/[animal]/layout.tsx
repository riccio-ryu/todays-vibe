import type { Metadata } from "next";
import chineseData from "@/data/chinese-zodiac.json";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.todays-vibe.com";

export function generateStaticParams() {
  return chineseData.animals.map((a) => ({ animal: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ animal: string }>;
}): Promise<Metadata> {
  const { animal } = await params;
  const animalInfo = chineseData.animals.find((a) => a.id === animal);
  if (!animalInfo) return {};
  const years = [...animalInfo.years].sort((a, b) => b - a).slice(0, 4).join("·");
  const title = `${animalInfo.name}띠 오늘의 운세 — 성격, 연애, 띠 궁합 (${years}년생) | 오늘운`;
  const description = `${animalInfo.name}띠(${years}년생 등)의 오늘·주간·월간·연간 운세와 성격, 연애 스타일, 직업 적성, 삼합·상충 띠 궁합까지 한 페이지에서 확인하세요.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/chinese-zodiac/${animal}` },
    openGraph: { title, description },
  };
}

export default function ChineseZodiacLayout({ children }: { children: React.ReactNode }) {
  return children;
}
