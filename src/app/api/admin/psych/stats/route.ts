import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { getPsychReadings } from "@/lib/firebase/psych-readings";
import { todayKST, kstDateOffset } from "@/lib/utils/date";

import type { StatsPeriod as Period } from "@/types/admin";

function dateRangeArray(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(
    parseInt(startDate.slice(0, 4)),
    parseInt(startDate.slice(4, 6)) - 1,
    parseInt(startDate.slice(6, 8))
  );
  const end = new Date(
    parseInt(endDate.slice(0, 4)),
    parseInt(endDate.slice(4, 6)) - 1,
    parseInt(endDate.slice(6, 8))
  );
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ""));
  }
  return dates;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const period      = (req.nextUrl.searchParams.get("period") ?? "today") as Period;
    const testSlug    = req.nextUrl.searchParams.get("testSlug");
    const customStart = req.nextUrl.searchParams.get("start"); // YYYY-MM-DD
    const customEnd   = req.nextUrl.searchParams.get("end");   // YYYY-MM-DD
    const today       = todayKST();

    // 커스텀 범위 우선, 없으면 period 기반
    const startDate = customStart
      ? customStart.replace(/-/g, "")
      : period === "today" ? today
      : period === "7d"    ? kstDateOffset(6)
      : period === "30d"   ? kstDateOffset(29)
      : "20000101";
    const endDate = customEnd ? customEnd.replace(/-/g, "") : today;
    const isAll   = !customStart && period === "all";

    const all = await getPsychReadings();
    const readings = isAll
      ? all
      : all.filter((r) => r.date >= startDate && r.date <= endDate);

    // ── 심테 드릴다운 응답 ────────────────────────────────────────
    if (testSlug) {
      const filtered = readings.filter((r) => r.testSlug === testSlug);
      let totalCount = 0;
      const dailyCounts: Record<string, number> = {};
      const userSet = new Set<string>();

      for (const r of filtered) {
        totalCount += 1;
        if (r.date) dailyCounts[r.date] = (dailyCounts[r.date] ?? 0) + 1;
        if (r.userId) userSet.add(r.userId);
      }

      const allDates = isAll
        ? Object.keys(dailyCounts).sort()
        : dateRangeArray(startDate, endDate);

      return Response.json({
        totalCount,
        uniqueUsers: userSet.size,
        dailyData: allDates.map((date) => ({ date, count: dailyCounts[date] ?? 0 })),
      });
    }

    // ── 전체 집계 ─────────────────────────────────────────────────
    const testCounts: Record<string, { count: number; title: string }> = {};
    const dailyCounts: Record<string, number> = {};
    const userSet = new Set<string>();

    for (const r of readings) {
      const t = testCounts[r.testSlug] ?? { count: 0, title: r.testTitle };
      t.count += 1;
      t.title = r.testTitle || t.title;
      testCounts[r.testSlug] = t;
      if (r.date) dailyCounts[r.date] = (dailyCounts[r.date] ?? 0) + 1;
      if (r.userId) userSet.add(r.userId);
    }

    const testRanking = Object.entries(testCounts)
      .map(([slug, { count, title }]) => ({ slug, count, title }))
      .sort((a, b) => b.count - a.count);

    const allDates = isAll
      ? Object.keys(dailyCounts).sort()
      : dateRangeArray(startDate, endDate);
    const dailyData = allDates.map((date) => ({ date, count: dailyCounts[date] ?? 0 }));

    return Response.json({
      totalUsage: readings.length,
      topTest: testRanking[0] ?? null,
      uniqueUsers: userSet.size,
      testCount: testRanking.length,
      testRanking,
      dailyData,
    });
  } catch (err) {
    console.error("[admin/psych/stats]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
