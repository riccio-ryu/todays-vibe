import { FieldValue } from "firebase-admin/firestore";
import type { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export interface OAuthProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: string;
}

async function upsertFirestoreUser(profile: OAuthProfile): Promise<{ plan: string; isAdmin: boolean }> {
  const db = getAdminFirestore();
  const ref = db.collection("users").doc(profile.uid);
  const snap = await ref.get();

  if (snap.exists) {
    const data = snap.data()!;
    const rawPlan: string = data.plan ?? "free";
    const expiresAt = data.planExpiresAt?.toDate() as Date | undefined;

    if (rawPlan === "premium" && expiresAt && expiresAt <= new Date()) {
      await ref.update({ plan: "free", provider: profile.provider, lastLoginAt: FieldValue.serverTimestamp() });
      return { plan: "free", isAdmin: false };
    }

    await ref.update({ provider: profile.provider, lastLoginAt: FieldValue.serverTimestamp() });
    return { plan: rawPlan, isAdmin: rawPlan === "admin" };
  }

  const nickname =
    profile.displayName?.trim() ||
    (profile.email ? profile.email.split("@")[0] : null) ||
    "사용자";

  await ref.set({
    uid: profile.uid,
    email: profile.email,
    nickname,
    photoURL: profile.photoURL ?? "",
    plan: "free",
    provider: profile.provider,
    createdAt: FieldValue.serverTimestamp(),
    lastLoginAt: FieldValue.serverTimestamp(),
  });

  return { plan: "free", isAdmin: false };
}

/**
 * Firestore user 처리 후 세션 토큰을 반환합니다.
 */
export async function createOAuthSession(profile: OAuthProfile): Promise<{
  sessionToken: string;
  isAdmin: boolean;
}> {
  let plan = "free";
  let isAdmin = false;

  try {
    const result = await upsertFirestoreUser(profile);
    plan = result.plan;
    isAdmin = result.isAdmin;
  } catch (err) {
    console.warn("[createOAuthSession] Firestore 오류:", (err as Error).message);
  }

  const sessionToken = await createSessionToken(
    profile.uid, profile.email, isAdmin, plan,
    profile.displayName, profile.photoURL,
  );
  return { sessionToken, isAdmin };
}

/**
 * NextResponse에 세션 쿠키를 설정합니다.
 * res.cookies.set()을 사용해야 res.cookies.delete()와 충돌하지 않습니다.
 */
export function applySessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 5 * 24 * 60 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}
