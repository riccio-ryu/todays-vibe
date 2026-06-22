import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { todayKST } from "@/lib/utils/date";

function planToRole(payload: { isAdmin: boolean; plan: string }): string {
  if (payload.isAdmin) return "admin";
  if (payload.plan === "premium") return "premium";
  return "member";
}

export interface BulkFortuneStatus {
  used: number;
  limit: number | null;
  exhausted: boolean;
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return Response.json({}, { status: 200 }); // 비로그인은 빈 객체

  const session = await verifySessionToken(cookie);
  if (!session) return Response.json({}, { status: 200 });

  const body = await req.json().catch(() => ({}));
  const menuIds: string[] = Array.isArray(body.menuIds) ? body.menuIds : [];
  if (menuIds.length === 0) return Response.json({});

  try {
    const db = getAdminFirestore();
    const today = todayKST();
    const role = planToRole(session);

    // 메뉴 제한 일괄 조회
    const menuSnaps = await Promise.all(
      menuIds.map((id) => db.collection("menus").doc(id).get())
    );
    const limitMap: Record<string, number | null> = {};
    menuSnaps.forEach((snap, i) => {
      const limits = snap.data()?.usageLimits as Record<string, number> | undefined;
      limitMap[menuIds[i]] = limits ? (limits[role] ?? -1) : null;
    });

    // 오늘 사용 횟수 일괄 조회
    const usageSnaps = await Promise.all(
      menuIds.map((id) =>
        db.collection("daily_usage").doc(`${today}_${session.uid}_${id}`).get()
      )
    );

    const result: Record<string, BulkFortuneStatus> = {};
    usageSnaps.forEach((snap, i) => {
      const id = menuIds[i];
      const used: number = snap.exists ? (snap.data()?.count ?? 0) : 0;
      const limit = limitMap[id];
      const exhausted = limit !== null && limit !== -1 && used >= limit;
      result[id] = { used, limit, exhausted };
    });

    return Response.json(result);
  } catch (err) {
    console.error("[fortune-status-bulk]", err);
    return Response.json({}, { status: 500 });
  }
}
