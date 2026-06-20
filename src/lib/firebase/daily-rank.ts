import { unstable_cache } from "next/cache";
import { getAdminFirestore } from "./admin";
import { todayKST } from "@/lib/utils/date";

async function fetchDailyRanking(date: string): Promise<{ menuId: string; count: number }[]> {
  const db = getAdminFirestore();
  const snap = await db.collection("daily_usage").where("date", "==", date).get();

  const rankMap: Record<string, number> = {};
  for (const doc of snap.docs) {
    const { menuId, count } = doc.data() as { menuId: string; count: number };
    if (menuId && typeof count === "number") {
      rankMap[menuId] = (rankMap[menuId] ?? 0) + count;
    }
  }

  return Object.entries(rankMap)
    .map(([menuId, count]) => ({ menuId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

const cachedFetch = unstable_cache(fetchDailyRanking, ["daily-ranking"], { revalidate: 3600 });

export function getDailyRanking() {
  return cachedFetch(todayKST());
}
