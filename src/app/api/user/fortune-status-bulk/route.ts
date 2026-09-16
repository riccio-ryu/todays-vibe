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

export interface BulkFortuneStatus {
  /** 이 항목 1회 소모 별 */
  cost: number;
  /** 별 부족(전역 잔여 < cost) */
  exhausted: boolean;
  /** 오늘 이미 본 적 있음(다시보기 가능) */
  doneToday: boolean;
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

    // 전역 크레딧(권한별 지급 + 오늘 소모)은 1회만 조회
    const [grants, creditSnap, menuSnaps, usageSnaps] = await Promise.all([
      getGrants(db),
      db.collection("daily_credits").doc(creditDocId(session.uid)).get(),
      Promise.all(menuIds.map((id) => db.collection("menus").doc(id).get())),
      Promise.all(
        menuIds.map((id) =>
          db.collection("daily_usage").doc(`${today}_${session.uid}_${id}`).get()
        )
      ),
    ]);

    const grant = grants[role] ?? 0;
    const spent: number = creditSnap.exists ? (creditSnap.data()?.spent ?? 0) : 0;
    const remaining: number | null = grant === -1 ? null : Math.max(0, grant - spent);

    const result: Record<string, BulkFortuneStatus> = {};
    menuSnaps.forEach((snap, i) => {
      const id = menuIds[i];
      const cost = getMenuCost(snap.data());
      const exhausted = remaining !== null && cost > 0 && remaining < cost;
      const doneToday = (usageSnaps[i].data()?.count ?? 0) > 0;
      result[id] = { cost, exhausted, doneToday };
    });

    return Response.json(result);
  } catch (err) {
    console.error("[fortune-status-bulk]", err);
    return Response.json({}, { status: 500 });
  }
}
