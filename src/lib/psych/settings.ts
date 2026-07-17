import { getAdminFirestore } from "@/lib/firebase/admin";
import { allPsychTests, type PsychTest } from "@/data/psych";

// 심리 테스트 노출/순서 관리 — settings/psych 문서.
// 문항·결과 본문은 코드(src/data/psych/*.ts)에 두고, 활성/순서만 admin에서 제어한다.
// 서버 컴포넌트 전용(Firestore admin 사용).

export interface PsychTestConfig {
  enabled: boolean;
  order: number;
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
