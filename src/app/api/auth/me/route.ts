import { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// 인증 상태 API — 절대 캐시 금지 (캐시되면 로그인 상태가 어긋나 로그아웃처럼 보임)
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return Response.json({ isAdmin: false, plan: "free", loggedIn: false }, { headers: NO_STORE });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return Response.json({ isAdmin: false, plan: "free", loggedIn: false }, { headers: NO_STORE });
  }

  return Response.json(
    {
      loggedIn: true,
      uid: payload.uid,
      email: payload.email,
      isAdmin: payload.isAdmin,
      plan: payload.isAdmin ? "admin" : payload.plan,
      displayName: payload.displayName ?? null,
      photoURL: payload.photoURL ?? null,
    },
    { headers: NO_STORE }
  );
}
