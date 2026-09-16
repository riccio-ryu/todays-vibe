import { getAdminFirestore } from "@/lib/firebase/admin";
import { allPsychTests, type PsychTest } from "@/data/psych";
import type { PsychTestMeta, PsychEngine } from "@/types/psych";
import type { AccessLevel } from "@/types/menu";
import type { PsychTestConfig } from "./settings";

// 심리 테스트 정의 Firestore 컬렉션. 운세 `menus`와 동형으로 admin에서 완전 CRUD.
// 문항·결과 원본은 content 필드에 보존(Phase 2 빌더에서 편집), 관리 메타는 top-level.
export const PSYCH_COL = "psych_tests";

/** Firestore 저장 문서 (메타 + 엔진별 콘텐츠 원본) */
export interface PsychTestDoc extends PsychTestMeta {
  /** 엔진별 문항·결과·SEO 등 원본 (Phase 2에서 편집) */
  content?: Record<string, unknown>;
}

const META_KEYS: (keyof PsychTestMeta)[] = [
  "slug", "icon", "title", "summary", "engine", "category",
  "ready", "accessLevel", "cost", "order", "aiMode", "promptPersona", "promptGuide",
];

/** 문서에서 메타만 추출 (content 제외) */
function toMeta(data: Record<string, unknown>): PsychTestMeta {
  const engine = (data.engine as PsychEngine) ?? "category";
  return {
    slug: data.slug as string,
    icon: (data.icon as string) ?? "🧠",
    title: (data.title as string) ?? "",
    summary: (data.summary as string) ?? "",
    engine,
    category: (data.category as string) ?? engine,
    ready: data.ready !== false,
    accessLevel: (data.accessLevel as AccessLevel) ?? (engine === "ai" ? "member" : "public"),
    ...(typeof data.cost === "number" ? { cost: data.cost as number } : {}),
    order: (data.order as number) ?? 0,
    ...(data.aiMode ? { aiMode: data.aiMode as "quiz" | "text" } : {}),
    ...(data.promptPersona ? { promptPersona: data.promptPersona as string } : {}),
    ...(data.promptGuide ? { promptGuide: data.promptGuide as string } : {}),
  };
}

/** 코드 정의(PsychTest) → Firestore 시드 문서. 레거시 settings/psych 값 이월 */
function buildSeedDoc(t: PsychTest, i: number, cfg?: PsychTestConfig): PsychTestDoc {
  const raw = t as unknown as Record<string, unknown>;
  const engine = t.engine as PsychEngine;
  const isAI = engine === "ai";

  // content = 원본에서 top-level 관리·표시 필드를 뺀 나머지 (문항·결과·intro·seoContent 등)
  const content: Record<string, unknown> = { ...raw };
  ["slug", "icon", "title", "summary", "engine", "promptPersona", "promptGuide"].forEach(
    (k) => delete content[k]
  );

  const doc: PsychTestDoc = {
    slug: t.slug,
    icon: t.icon,
    title: t.title,
    summary: (raw.summary as string) ?? "",
    engine,
    category: engine,
    ready: cfg?.enabled !== false,
    accessLevel: isAI ? "member" : "public",
    order: cfg?.order ?? i,
    content,
  };

  if (isAI) {
    // quiz(4지선다) vs text(자유입력) — questions 유무로 판별
    doc.aiMode = raw.questions ? "quiz" : "text";
    const persona = cfg?.promptPersona ?? (raw.promptPersona as string | undefined);
    const guide = cfg?.promptGuide ?? (raw.promptGuide as string | undefined);
    if (persona) doc.promptPersona = persona;
    if (guide) doc.promptGuide = guide;
    if (cfg?.cost !== undefined) doc.cost = cfg.cost;
  }

  return doc;
}

/** psych_tests가 비어있으면 코드 정의로 최초 시드 (레거시 settings/psych 이월) */
export async function seedPsychTestsIfEmpty(): Promise<void> {
  const db = getAdminFirestore();
  const snap = await db.collection(PSYCH_COL).limit(1).get();
  if (!snap.empty) return;

  // 레거시 노출/순서/cost/프롬프트 이월
  let legacy: Record<string, PsychTestConfig> = {};
  try {
    const legacySnap = await db.collection("settings").doc("psych").get();
    legacy = (legacySnap.data()?.tests ?? {}) as Record<string, PsychTestConfig>;
  } catch {
    legacy = {};
  }

  const batch = db.batch();
  allPsychTests.forEach((t, i) => {
    const doc = buildSeedDoc(t, i, legacy[t.slug]);
    batch.set(db.collection(PSYCH_COL).doc(t.slug), { ...doc, updatedAt: new Date() });
  });
  await batch.commit();
}

/** Firestore 문서(메타+content) → 완전한 PsychTest 재구성 (런타임 렌더용) */
export function docToPsychTest(doc: PsychTestDoc): PsychTest {
  const content = doc.content ?? {};
  const base: Record<string, unknown> = {
    engine: doc.engine,
    slug: doc.slug,
    icon: doc.icon,
    title: doc.title,
    summary: doc.summary,
    ...content,
  };
  if (doc.engine === "ai") {
    base.promptPersona = doc.promptPersona ?? base.promptPersona ?? "";
    base.promptGuide = doc.promptGuide ?? base.promptGuide ?? "";
  }
  return base as unknown as PsychTest;
}

/** 단건 조회 → 완전한 PsychTest (없으면 null) */
export async function getPsychTestFromStore(slug: string): Promise<PsychTest | null> {
  try {
    const snap = await getAdminFirestore().collection(PSYCH_COL).doc(slug).get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    return docToPsychTest({ ...toMeta(data), content: data.content as Record<string, unknown> });
  } catch {
    return null;
  }
}

/** order 순 전체 문서 (런타임 목록·파라미터 생성용) */
export async function getAllPsychTestDocsOrdered(): Promise<PsychTestDoc[]> {
  try {
    const snap = await getAdminFirestore().collection(PSYCH_COL).orderBy("order").get();
    return snap.docs.map((d) => {
      const data = d.data();
      return { ...toMeta(data), content: data.content as Record<string, unknown> };
    });
  } catch {
    return [];
  }
}

/** 전체 문서 맵 (slug → 문서). 런타임 getter(비용·프롬프트·노출)에서 사용 */
export async function getPsychTestDocsMap(): Promise<Record<string, PsychTestDoc>> {
  try {
    const snap = await getAdminFirestore().collection(PSYCH_COL).get();
    const map: Record<string, PsychTestDoc> = {};
    snap.docs.forEach((d) => {
      const data = d.data();
      map[d.id] = { ...toMeta(data), content: data.content as Record<string, unknown> };
    });
    return map;
  } catch {
    return {};
  }
}

/** admin 관리 테이블용 메타 목록 (필요 시 시드 후 order 순 반환) */
export async function getPsychTestMetaList(): Promise<PsychTestMeta[]> {
  await seedPsychTestsIfEmpty();
  const snap = await getAdminFirestore().collection(PSYCH_COL).orderBy("order").get();
  return snap.docs.map((d) => toMeta(d.data()));
}

/** 메타 저장 (upsert, merge → content 보존) */
export async function savePsychTestDoc(meta: PsychTestMeta): Promise<void> {
  const db = getAdminFirestore();
  const clean: Record<string, unknown> = {};
  META_KEYS.forEach((k) => {
    const v = meta[k];
    if (v !== undefined) clean[k] = v;
  });
  await db.collection(PSYCH_COL).doc(meta.slug).set({ ...clean, updatedAt: new Date() }, { merge: true });
}

/** 삭제 */
export async function deletePsychTestDocs(slugs: string[]): Promise<void> {
  const db = getAdminFirestore();
  const batch = db.batch();
  slugs.forEach((slug) => batch.delete(db.collection(PSYCH_COL).doc(slug)));
  await batch.commit();
}

/** 부분 수정 (일괄 — slugs=null이면 전체) */
export async function patchPsychTestDocs(
  slugs: string[] | null,
  data: Partial<PsychTestMeta>
): Promise<void> {
  const db = getAdminFirestore();
  const col = db.collection(PSYCH_COL);
  const refs = slugs ? slugs.map((s) => col.doc(s)) : (await col.get()).docs.map((d) => d.ref);
  const batch = db.batch();
  refs.forEach((ref) => batch.set(ref, { ...data, updatedAt: new Date() }, { merge: true }));
  await batch.commit();
}

/** 문항·결과 원본(content) 조회 (Phase 2 빌더) */
export async function getPsychTestContent(slug: string): Promise<Record<string, unknown>> {
  const snap = await getAdminFirestore().collection(PSYCH_COL).doc(slug).get();
  return (snap.data()?.content as Record<string, unknown>) ?? {};
}

/** 문항·결과 원본(content) 저장 (Phase 2 빌더) */
export async function savePsychTestContent(
  slug: string,
  content: Record<string, unknown>
): Promise<void> {
  await getAdminFirestore()
    .collection(PSYCH_COL)
    .doc(slug)
    .set({ content, updatedAt: new Date() }, { merge: true });
}

/** 순서 일괄 갱신 */
export async function batchUpdatePsychOrders(items: { slug: string; order: number }[]): Promise<void> {
  const db = getAdminFirestore();
  const batch = db.batch();
  items.forEach(({ slug, order }) =>
    batch.set(db.collection(PSYCH_COL).doc(slug), { order, updatedAt: new Date() }, { merge: true })
  );
  await batch.commit();
}
