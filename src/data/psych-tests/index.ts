import type { PsychTest } from "./types";
import { energyTest } from "./energy";
import { emotionTest } from "./emotion";
import { decisionTest } from "./decision";
import { relationshipTest } from "./relationship";

export type { PsychTest, PsychQuestion } from "./types";

/** 노출 순서 = 배열 순서 */
export const allPsychTests: PsychTest[] = [
  energyTest,
  emotionTest,
  decisionTest,
  relationshipTest,
];

export const PSYCH_TEST_SLUGS = allPsychTests.map((t) => t.slug);

export function getPsychTestBySlug(slug: string): PsychTest | undefined {
  return allPsychTests.find((t) => t.slug === slug);
}
