import type { MetadataRoute } from "next";
import { getAllCards, getCardSlug } from "@/lib/tarot/utils";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.todays-vibe.com";

const staticRoutes = [
  { path: "/", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/zodiac", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/tarot-daily", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/dream", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/saju", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/tarot-3cards", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/tarot-cards", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/love-fortune", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/career-fortune", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/health-fortune", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/wealth-fortune", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/love-compatibility", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/business-compatibility", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/name-fortune", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/numerology", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/rune", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/iching", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/oracle", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/moving-fortune", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/life-fortune", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/chinese-zodiac", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/tojeong", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // 타로 카드 사전 78장 상세 페이지
  const tarotCardEntries = getAllCards().map((card) => ({
    url: `${BASE_URL}/tarot-cards/${getCardSlug(card)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...tarotCardEntries];
}
