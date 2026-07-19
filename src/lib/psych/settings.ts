import { getAdminFirestore } from "@/lib/firebase/admin";
import { allPsychTests, type PsychTest } from "@/data/psych";

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
  return applyPsychSettings(await getPsychSettings());
}

export async function isPsychTestEnabled(slug: string): Promise<boolean> {
  const settings = await getPsychSettings();
  return settings.tests[slug]?.enabled !== false;
}

/** AI 심테 기본 소모 별 (override 없을 때). 운세 AI와 동일하게 1. */
export const DEFAULT_PSYCH_COST = 1;

/**
 * 심테 소모 별. settings override 우선, 없으면 AI 심테 기본 1.
 * (로직 심테는 API를 안 타므로 여기 값과 무관하게 무료)
 */
export async function getPsychCost(slug: string): Promise<number> {
  const settings = await getPsychSettings();
  return settings.tests[slug]?.cost ?? DEFAULT_PSYCH_COST;
}

/** AI 심테 프롬프트 override (settings 우선). 없으면 null → 호출부에서 코드 카탈로그 폴백 */
export async function getPsychPromptOverride(
  slug: string
): Promise<{ promptPersona?: string; promptGuide?: string } | null> {
  const settings = await getPsychSettings();
  const cfg = settings.tests[slug];
  if (!cfg) return null;
  if (!cfg.promptPersona && !cfg.promptGuide) return null;
  return { promptPersona: cfg.promptPersona, promptGuide: cfg.promptGuide };
}
