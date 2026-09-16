import { getAdminFirestore } from "@/lib/firebase/admin";
import { allPsychTests, getPsychTestBySlug, type PsychTest } from "@/data/psych";
import {
  getPsychTestDocsMap,
  getAllPsychTestDocsOrdered,
  getPsychTestFromStore,
  docToPsychTest,
} from "./tests-store";

// 심리 테스트 노출/순서 관리 — settings/psych 문서.
// 문항·결과 본문은 코드(src/data/psych/*.ts)에 두고, 활성/순서만 admin에서 제어한다.
// 서버 컴포넌트 전용(Firestore admin 사용).

export interface PsychTestConfig {
  enabled: boolean;
  order: number;
  /** 소모 별 override (미설정 시 코드 기본 — AI 심테만 유효, 로직 심테는 API 미호출로 무료) */
  cost?: number;
  /** AI 심테 프롬프트 override (미설정 시 코드 카탈로그 값) */
  promptPersona?: string;
  promptGuide?: string;
}

export interface PsychSettings {
  /** slug → { enabled, order } */
  tests: Record<string, PsychTestConfig>;
}

export async function getPsychSettings(): Promise<PsychSettings> {
  try {
    const snap = await getAdminFirestore().collection("settings").doc("psych").get();
    const tests = (snap.data()?.tests ?? {}) as Record<string, PsychTestConfig>;
    return { tests };
  } catch {
    return { tests: {} };
  }
}

/** allPsychTests에 설정 적용: 활성만 남기고 order 순 정렬 (미설정 시 기본 활성·코드 순서) */
export function applyPsychSettings(settings: PsychSettings): PsychTest[] {
  return allPsychTests
    .map((t, i) => ({ t, cfg: settings.tests[t.slug], idx: i }))
    .filter(({ cfg }) => cfg?.enabled !== false)
    .sort((a, b) => (a.cfg?.order ?? a.idx) - (b.cfg?.order ?? b.idx))
    .map(({ t }) => t);
}

export async function getVisiblePsychTests(): Promise<PsychTest[]> {
  const docs = await getAllPsychTestDocsOrdered();
  // psych_tests가 아직 시드되지 않았으면 레거시(코드) 경로
  if (docs.length === 0) {
    return applyPsychSettings(await getPsychSettings());
  }
  // Firestore content로 완전 재구성 (편집·신규 심테 반영). ready만, order순.
  return docs.filter((d) => d.ready !== false).map(docToPsychTest);
}

/** 런타임 단건 조회 — Firestore 우선, 없으면 코드 폴백 */
export async function getRuntimePsychTest(slug: string): Promise<PsychTest | null> {
  const fromStore = await getPsychTestFromStore(slug);
  if (fromStore) return fromStore;
  return getPsychTestBySlug(slug) ?? null;
}

/** SSG 파라미터용 slug 목록 — Firestore 우선, 없으면 코드 폴백 */
export async function getPsychTestSlugs(): Promise<string[]> {
  const docs = await getAllPsychTestDocsOrdered();
  if (docs.length) return docs.map((d) => d.slug);
  return allPsychTests.map((t) => t.slug);
}

export async function isPsychTestEnabled(slug: string): Promise<boolean> {
  const map = await getPsychTestDocsMap();
  if (Object.keys(map).length === 0) {
    const settings = await getPsychSettings();
    return settings.tests[slug]?.enabled !== false;
  }
  return map[slug] ? map[slug].ready !== false : true;
}

/** AI 심테 기본 소모 별 (override 없을 때). 운세 AI와 동일하게 1. */
export const DEFAULT_PSYCH_COST = 1;

/**
 * 심테 소모 별. settings override 우선, 없으면 AI 심테 기본 1.
 * (로직 심테는 API를 안 타므로 여기 값과 무관하게 무료)
 */
export async function getPsychCost(slug: string): Promise<number> {
  const map = await getPsychTestDocsMap();
  const cost = map[slug]?.cost;
  if (typeof cost === "number") return cost;
  const settings = await getPsychSettings();
  return settings.tests[slug]?.cost ?? DEFAULT_PSYCH_COST;
}

/** AI 심테 프롬프트 override (settings 우선). 없으면 null → 호출부에서 코드 카탈로그 폴백 */
export async function getPsychPromptOverride(
  slug: string
): Promise<{ promptPersona?: string; promptGuide?: string } | null> {
  const map = await getPsychTestDocsMap();
  const d = map[slug];
  if (d && (d.promptPersona || d.promptGuide)) {
    return { promptPersona: d.promptPersona, promptGuide: d.promptGuide };
  }
  const settings = await getPsychSettings();
  const cfg = settings.tests[slug];
  if (!cfg) return null;
  if (!cfg.promptPersona && !cfg.promptGuide) return null;
  return { promptPersona: cfg.promptPersona, promptGuide: cfg.promptGuide };
}
