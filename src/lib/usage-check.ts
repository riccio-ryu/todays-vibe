import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { AccessLevel } from "@/types/menu";
import type { NextRequest } from "next/server";
import { todayKST } from "@/lib/utils/date";
import { getMenuCost, getGrants, creditDocId } from "@/lib/credits/config";

const ROLE_RANK: Record<AccessLevel, number> = {
  public: 0,
  member: 1,
  premium: 2,
  admin: 3,
};

function planToRole(payload: { isAdmin: boolean; plan: string } | null): AccessLevel {
  if (!payload) return "public";
  if (payload.isAdmin) return "admin";
  if (payload.plan === "premium") return "premium";
  return "member";
}

type DenyReason =
  | "unauthenticated"
  | "insufficient_plan"
  | "usage_limit_exceeded";

type CheckResult =
  | { allowed: true; remaining: number | null; userId: string | null; role: AccessLevel; rollback: (() => Promise<void>) | null }
  | { allowed: false; reason: DenyReason };

// daily_usage 카운트(인기 순위·admin 통계용) — 크레딧과 별개로 항상 유지
function usageDocRef(userId: string, menuId: string) {
  const db = getAdminFirestore();
  return db.collection("daily_usage").doc(`${todayKST()}_${userId}_${menuId}`);
}

async function bumpDailyUsage(userId: string | null, menuId: string) {
  if (!userId) return;
  await usageDocRef(userId, menuId).set(
    { userId, menuId, date: todayKST(), count: FieldValue.increment(1), updatedAt: new Date() },
    { merge: true }
  );
}

/**
 * 1) 세션으로 역할 확인
 * 2) 메뉴 accessLevel 확인 (접근 권한)
 * 3) 별(⭐) 크레딧 확인 후 허용 시 cost만큼 원자적 차감
 *    - daily_credits/{date}_{uid}.spent 로 하루치 소모 관리 (권한별 grant 대비)
 *    - daily_usage 카운트는 항상 +1 (순위·통계 보존)
 */
export async function checkUsage(
  request: NextRequest,
  menuId: string
): Promise<CheckResult> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  const role = planToRole(payload);
  const userId = payload?.uid ?? null;

  const db = getAdminFirestore();
  const menuSnap = await db.collection("menus").doc(menuId).get();
  const menu = menuSnap.data();

  // accessLevel 체크
  const requiredLevel: AccessLevel = (menu?.accessLevel as AccessLevel) ?? "public";
  if (ROLE_RANK[role] < ROLE_RANK[requiredLevel]) {
    return {
      allowed: false,
      reason: role === "public" ? "unauthenticated" : "insufficient_plan",
    };
  }

  const cost = getMenuCost(menu);
  const grants = await getGrants(db);
  const grant = grants[role] ?? 0;

  // admin/무제한 → 소모 없이 허용 (카운트만)
  if (grant === -1) {
    await bumpDailyUsage(userId, menuId);
    return { allowed: true, remaining: null, userId, role, rollback: null };
  }

  // 무료 항목(cost 0) → 별 소모 없음 (카운트만)
  if (cost === 0) {
    await bumpDailyUsage(userId, menuId);
    return { allowed: true, remaining: null, userId, role, rollback: null };
  }

  // 별 지급 0(비회원) 또는 미로그인 → 차단
  if (grant === 0 || !userId) {
    return {
      allowed: false,
      reason: role === "public" ? "unauthenticated" : "insufficient_plan",
    };
  }

  // 별 크레딧 트랜잭션 (spent += cost, daily_usage += 1)
  const creditRef = db.collection("daily_credits").doc(creditDocId(userId));
  const usageRef = usageDocRef(userId, menuId);

  let txAllowed = false;
  let txRemaining = 0;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(creditRef);
    const spent: number = snap.exists ? (snap.data()?.spent ?? 0) : 0;

    if (spent + cost > grant) return; // 별 부족

    tx.set(
      creditRef,
      { userId, date: todayKST(), spent: FieldValue.increment(cost), updatedAt: new Date() },
      { merge: true }
    );
    tx.set(
      usageRef,
      { userId, menuId, date: todayKST(), count: FieldValue.increment(1), updatedAt: new Date() },
      { merge: true }
    );
    txAllowed = true;
    txRemaining = grant - spent - cost;
  });

  if (!txAllowed) return { allowed: false, reason: "usage_limit_exceeded" };

  const rollback = async () => {
    await Promise.all([
      db.collection("daily_credits").doc(creditDocId(userId)).update({
        spent: FieldValue.increment(-cost),
      }),
      usageRef.update({ count: FieldValue.increment(-1) }),
    ]);
  };

  return { allowed: true, remaining: txRemaining, userId, role, rollback };
}

const DENY_MESSAGES: Record<DenyReason, string> = {
  unauthenticated: "로그인이 필요합니다.",
  insufficient_plan: "이용 등급이 부족합니다. 플랜을 업그레이드해 주세요.",
  usage_limit_exceeded: "오늘의 별을 모두 소진했어요. 내일 자정에 충전돼요.",
};

const DENY_STATUS: Record<DenyReason, number> = {
  unauthenticated: 401,
  insufficient_plan: 403,
  usage_limit_exceeded: 429,
};

export function denyResponse(reason: DenyReason): Response {
  return Response.json(
    { error: DENY_MESSAGES[reason] },
    { status: DENY_STATUS[reason] }
  );
}
