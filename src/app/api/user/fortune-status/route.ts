import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST } from "@/lib/utils/date";
import { getMenuCost, getGrants, creditDocId } from "@/lib/credits/config";
import type { AccessLevel } from "@/types/menu";

function planToRole(payload: { isAdmin: boolean; plan: string }): AccessLevel {
  if (payload.isAdmin) return "admin";
  if (payload.plan === "premium") return "premium";
  return "member";
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const session = await verifySessionToken(cookie);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const menuId = new URL(req.url).searchParams.get("menuId");
  if (!menuId) return Response.json({ error: "menuId가 필요합니다." }, { status: 400 });

  try {
    const db = getAdminFirestore();
    const today = todayKST();
    const role = planToRole(session);

    // 항목 소모 별(cost) + 전역 크레딧 잔량 기준으로 exhausted 계산
    const [menuSnap, grants, creditSnap, usageSnap] = await Promise.all([
      db.collection("menus").doc(menuId).get(),
      getGrants(db),
      db.collection("daily_credits").doc(creditDocId(session.uid)).get(),
      db.collection("daily_usage").doc(`${today}_${session.uid}_${menuId}`).get(),
    ]);

    const cost = getMenuCost(menuSnap.data());
    const grant = grants[role] ?? 0;
    const spent: number = creditSnap.exists ? (creditSnap.data()?.spent ?? 0) : 0;
    const remaining: number | null = grant === -1 ? null : Math.max(0, grant - spent);
    // 별 부족 = 무제한 아님 && 잔여 < cost (cost 0이면 항상 이용 가능)
    const exhausted = remaining !== null && cost > 0 && remaining < cost;

    // todayReading 트리거용 오늘 사용 횟수
    const used: number = usageSnap.exists ? (usageSnap.data()?.count ?? 0) : 0;

    // 오늘 기록 조회 — 사용 이력이 있으면 항상 시도
    let todayReading = null;
    if (used > 0) {
      try {
        const readingSnap = await db
          .collection("ai_readings")
          .where("userId", "==", session.uid)
          .where("type", "==", menuId)
          .where("date", "==", today)
          .limit(1)
          .get();

        if (!readingSnap.empty) {
          const d = readingSnap.docs[0].data();
          todayReading = {
            id: readingSnap.docs[0].id,
            result: d.result as string,
            createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
          };
        }
      } catch (readErr) {
        // 조회 실패해도 used/exhausted 응답은 정상 반환
        console.error("[fortune-status] todayReading fetch error:", readErr);
      }
    }

    return Response.json({ cost, exhausted, remaining, todayReading });
  } catch (err) {
    console.error("[fortune-status]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
