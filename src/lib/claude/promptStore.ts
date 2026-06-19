import { getAdminFirestore } from "@/lib/firebase/admin";
import { PROMPT_META, interpolate, prepareVars } from "./promptTemplates";
import { buildPrompt } from "./prompts";
import type { FortuneType, FortuneInput } from "@/types/fortune";

const COLLECTION = "ai_prompts";

// ─── 인메모리 캐시 (재배포 전까지 유효) ──────────────────────────────────────

const cache = new Map<string, { template: string; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

function isCacheValid(type: string): boolean {
  const entry = cache.get(type);
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

// ─── Firestore 읽기 ───────────────────────────────────────────────────────────

export async function getStoredTemplate(type: string): Promise<string | null> {
  if (isCacheValid(type)) {
    return cache.get(type)!.template;
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection(COLLECTION).doc(type).get();
    if (!snap.exists) return null;

    const data = snap.data();
    const template = data?.template as string | undefined;
    if (!template) return null;

    cache.set(type, { template, fetchedAt: Date.now() });
    return template;
  } catch {
    return null;
  }
}

// ─── Firestore 저장 ───────────────────────────────────────────────────────────

export async function saveTemplate(type: string, template: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(type).set({
    template,
    updatedAt: new Date(),
  });
  cache.set(type, { template, fetchedAt: Date.now() });
}

// ─── Firestore 초기화 (기본값 복원) ──────────────────────────────────────────

export async function resetTemplate(type: string): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(COLLECTION).doc(type).delete();
  cache.delete(type);
}

// ─── 전체 시드 ────────────────────────────────────────────────────────────────

export async function seedAllTemplates(): Promise<void> {
  const db = getAdminFirestore();
  const batch = db.batch();
  for (const [type, meta] of Object.entries(PROMPT_META)) {
    const ref = db.collection(COLLECTION).doc(type);
    batch.set(ref, { template: meta.defaultTemplate, updatedAt: new Date() });
  }
  await batch.commit();
  cache.clear();
}

// ─── 프롬프트 빌드 (DB 우선, 폴백은 기존 코드) ───────────────────────────────

export async function buildPromptFromDB(type: FortuneType, input: FortuneInput): Promise<string> {
  const stored = await getStoredTemplate(type);
  if (stored) {
    const vars = prepareVars(type, input);
    return interpolate(stored, vars);
  }
  // Firestore에 없으면 기존 하드코드 함수 사용
  return buildPrompt(type, input);
}

// ─── 관리자 페이지용: 현재 유효 템플릿 조회 ──────────────────────────────────

export async function getAllPromptStatus(): Promise<
  Array<{ type: string; labelKo: string; emoji: string; template: string; isCustom: boolean; charCount: number }>
> {
  const db = getAdminFirestore();
  const snap = await db.collection(COLLECTION).get();
  const stored = new Map<string, string>();
  snap.docs.forEach(d => {
    const t = d.data()?.template;
    if (t) stored.set(d.id, t);
  });

  return Object.entries(PROMPT_META).map(([type, meta]) => {
    const custom = stored.get(type);
    const template = custom ?? meta.defaultTemplate;
    return {
      type, labelKo: meta.labelKo, emoji: meta.emoji,
      template, isCustom: !!custom, charCount: template.length,
    };
  });
}
