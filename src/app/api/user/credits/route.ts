import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getGrants, creditDocId } from "@/lib/credits/config";
import type { AccessLevel } from "@/types/menu";

function planToRole(payload: { isAdmin: boolean; plan: string }): AccessLevel {
  if (payload.isAdmin) return "admin";
  if (payload.plan === "premium") return "premium";
  return "member";
}

export interface CreditsStatus {
  role: AccessLevel;
  grant: number; // 하루 지급 별 (-1 = 무제한)
  spent: number;
  remaining: number | null; // null = 무제한
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const session = await verifySessionToken(cookie);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    const db = getAdminFirestore();
    const role = planToRole(session);
    const grants = await getGrants(db);
    const grant = grants[role] ?? 0;

    if (grant === -1) {
      return Response.json({ role, grant: -1, spent: 0, remaining: null } satisfies CreditsStatus);
    }

    const snap = await db.collection("daily_credits").doc(creditDocId(session.uid)).get();
    const spent: number = snap.exists ? (snap.data()?.spent ?? 0) : 0;
    const remaining = Math.max(0, grant - spent);

    return Response.json({ role, grant, spent, remaining } satisfies CreditsStatus);
  } catch (err) {
    console.error("[credits]", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
