import { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const MAX_FAVORITES = 8;

async function getSession(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  return verifySessionToken(cookie);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    const db = getAdminFirestore();
    const doc = await db.collection("users").doc(session.uid).get();
    const favorites: string[] = doc.data()?.favorites ?? [];
    return Response.json({ favorites });
  } catch {
    return Response.json({ favorites: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { menuId } = await req.json();
  if (!menuId) return Response.json({ error: "menuId가 필요합니다." }, { status: 400 });

  try {
    const db = getAdminFirestore();
    const ref = db.collection("users").doc(session.uid);
    const doc = await ref.get();
    const current: string[] = doc.data()?.favorites ?? [];

    if (current.includes(menuId)) return Response.json({ favorites: current });
    if (current.length >= MAX_FAVORITES) {
      return Response.json({ error: `즐겨찾기는 최대 ${MAX_FAVORITES}개까지 가능합니다.` }, { status: 400 });
    }

    await ref.set({ favorites: FieldValue.arrayUnion(menuId) }, { merge: true });
    return Response.json({ favorites: [...current, menuId] });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { menuId } = await req.json();
  if (!menuId) return Response.json({ error: "menuId가 필요합니다." }, { status: 400 });

  try {
    const db = getAdminFirestore();
    await db.collection("users").doc(session.uid).set(
      { favorites: FieldValue.arrayRemove(menuId) },
      { merge: true }
    );
    return Response.json({ status: "ok" });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
