"use server";

import { getAdminFirestore } from "@/lib/firebase/admin";
import type { MenuItem, Category, AccessLevel } from "@/types/menu";
import { DEFAULT_HERO_SETTINGS, type HeroCardSettings } from "@/types/hero";
import { DEFAULT_GRANTS } from "@/lib/credits/config";

const COL = "menus";
const CAT_COL = "categories";

function db() {
  return getAdminFirestore();
}

export async function getMenus(): Promise<MenuItem[]> {
  try {
    const snap = await db().collection(COL).orderBy("order").get();
    return snap.docs.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...data } = d.data();
      return { id: d.id, ...data } as MenuItem;
    });
  } catch {
    return [];
  }
}

export async function saveMenu(item: MenuItem): Promise<void> {
  const { id, ...data } = item;
  await db()
    .collection(COL)
    .doc(id)
    .set({ ...data, updatedAt: new Date() }, { merge: true });
}

export async function deleteMenusByIds(ids: string[]): Promise<void> {
  const firestore = db();
  const batch = firestore.batch();
  ids.forEach((id) => batch.delete(firestore.collection(COL).doc(id)));
  await batch.commit();
}

// ─── Category actions ─────────────────────────────────────────────────────────

export async function getExtraCategories(): Promise<Category[]> {
  try {
    const snap = await db().collection(CAT_COL).orderBy("order").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  } catch {
    return [];
  }
}

export async function saveCategory(cat: Category): Promise<void> {
  const { id, ...data } = cat;
  await db().collection(CAT_COL).doc(id).set(data, { merge: true });
}

export async function deleteCategoryById(id: string): Promise<void> {
  await db().collection(CAT_COL).doc(id).delete();
}

// ─── Quick Menu settings ─────────────────────────────────────────────────────

export async function getQuickMenu(): Promise<string[]> {
  const snap = await db().collection("settings").doc("quickMenu").get();
  return (snap.data()?.menuIds as string[]) ?? [];
}

export async function saveQuickMenu(menuIds: string[]): Promise<void> {
  await db().collection("settings").doc("quickMenu").set({ menuIds, updatedAt: new Date() });
}

// ─── Hero Card settings ───────────────────────────────────────────────────────

export async function getHeroCardSettings(): Promise<HeroCardSettings> {
  try {
    const snap = await db().collection("settings").doc("heroCard").get();
    return { ...DEFAULT_HERO_SETTINGS, ...(snap.data() ?? {}) };
  } catch {
    return DEFAULT_HERO_SETTINGS;
  }
}

export async function saveHeroCardSettings(settings: HeroCardSettings): Promise<void> {
  await db().collection("settings").doc("heroCard").set({ ...settings, updatedAt: new Date() });
}

// ─── Credit grants (별 지급량) ─────────────────────────────────────────────────

export async function getCreditGrants(): Promise<Record<AccessLevel, number>> {
  try {
    const snap = await db().collection("settings").doc("credits").get();
    const grants = snap.data()?.grants as Partial<Record<AccessLevel, number>> | undefined;
    return { ...DEFAULT_GRANTS, ...(grants ?? {}) };
  } catch {
    return DEFAULT_GRANTS;
  }
}

export async function saveCreditGrants(grants: Record<AccessLevel, number>): Promise<void> {
  await db()
    .collection("settings")
    .doc("credits")
    .set({ grants, updatedAt: new Date() }, { merge: true });
}

// ─── Batch order update ───────────────────────────────────────────────────────

export async function batchUpdateOrders(
  menus: { id: string; order: number }[],
  cats: { id: string; order: number }[]
): Promise<void> {
  const firestore = db();
  const batch = firestore.batch();
  menus.forEach(({ id, order }) =>
    batch.update(firestore.collection(COL).doc(id), { order, updatedAt: new Date() })
  );
  cats.forEach(({ id, order }) =>
    batch.set(firestore.collection(CAT_COL).doc(id), { order }, { merge: true })
  );
  await batch.commit();
}

// ─── Menu actions ─────────────────────────────────────────────────────────────

export async function patchMenusByIds(
  ids: string[] | null,
  data: Partial<Omit<MenuItem, "id">>
): Promise<void> {
  const firestore = db();
  const col = firestore.collection(COL);

  const refs = ids
    ? ids.map((id) => col.doc(id))
    : (await col.get()).docs.map((d) => d.ref);

  const batch = firestore.batch();
  refs.forEach((ref) => batch.update(ref, { ...data, updatedAt: new Date() }));
  await batch.commit();
}
