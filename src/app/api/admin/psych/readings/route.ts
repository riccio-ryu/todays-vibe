import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { getPsychReadings } from "@/lib/firebase/psych-readings";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slugFilter = searchParams.get("slug") ?? "";
    const userFilter = searchParams.get("userId") ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

    let readings = await getPsychReadings();

    // 심테별 카운트 (필터 적용 전 전체 기준)
    const slugCounts = readings.reduce<Record<string, number>>((acc, r) => {
      acc[r.testSlug] = (acc[r.testSlug] ?? 0) + 1;
      return acc;
    }, {});

    if (slugFilter) {
      readings = readings.filter((r) => r.testSlug === slugFilter);
    }
    if (userFilter) {
      readings = readings.filter((r) => r.userId?.includes(userFilter));
    }

    const total = readings.length;
    readings = readings.slice(0, limit);

    return Response.json({ readings, total, slugCounts });
  } catch (err) {
    console.error("[admin/psych/readings]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
