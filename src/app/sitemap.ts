import type { MetadataRoute } from "next";
import { getAllCards, getCardSlug } from "@/lib/tarot/utils";
import { allDreamSymbols } from "@/data/dream-dictionary";
import { allPsychTests } from "@/data/psych";
import zodiacData from "@/data/zodiac-signs.json";
import chineseData from "@/data/chinese-zodiac.json";
import { BASE_URL } from "@/lib/utils/site";
import { PSYCH_ENABLED } from "@/lib/psych/config";

const staticRoutes = [
  { path: "/", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/zodiac", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/tarot-daily", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/dream", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/dream-dictionary", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/saju", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/tarot-3cards", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/tarot-cards", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/psych", priority: 0.7, changeFrequency: "weekly" as const },
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
  const staticEntries = staticRoutes
    .filter(({ path }) => PSYCH_ENABLED || path !== "/psych")
    .map(({ path, priority, changeFrequency }) => ({
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

  // 꿈해몽 사전 상세 페이지
  const dreamEntries = allDreamSymbols.map((dream) => ({
    url: `${BASE_URL}/dream-dictionary/${dream.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // 심리 테스트 상세 페이지 (운영 미노출 시 제외)
  const psychEntries = PSYCH_ENABLED
    ? allPsychTests.map((t) => ({
        url: `${BASE_URL}/psych/${t.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    : [];

  // 별자리 12궁 상세 페이지
  const zodiacEntries = zodiacData.zodiacSigns.map((s) => ({
    url: `${BASE_URL}/zodiac/${s.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // 띠 12지 상세 페이지
  const chineseZodiacEntries = chineseData.animals.map((a) => ({
    url: `${BASE_URL}/chinese-zodiac/${a.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...tarotCardEntries,
    ...dreamEntries,
    ...psychEntries,
    ...zodiacEntries,
    ...chineseZodiacEntries,
  ];
}
