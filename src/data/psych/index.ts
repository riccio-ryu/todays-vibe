import type { LogicPsychTest } from "./types";
import { mbtiTest } from "./mbti";

export type { LogicPsychTest, MbtiTest, MbtiResult, MbtiQuestion } from "./types";

/** 노출 순서 = 배열 순서. MVP 15개를 이 배열에 카탈로그 우선순위대로 채운다. */
export const allLogicPsychTests: LogicPsychTest[] = [
  mbtiTest,
];

export const LOGIC_PSYCH_SLUGS = allLogicPsychTests.map((t) => t.slug);

export function getLogicPsychTestBySlug(slug: string): LogicPsychTest | undefined {
  return allLogicPsychTests.find((t) => t.slug === slug);
}
