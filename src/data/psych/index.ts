import type { LogicPsychTest, AiTest, PsychTest } from "./types";
import { mbtiTest } from "./mbti";
import { loveStyleTest } from "./love-style";
import { animalTest } from "./animal";
import { workVillainTest } from "./work-villain";
import { decisionTest } from "./decision";
import { relationshipTest } from "./relationship";
import { colorTest } from "./color";
import { spendingTest } from "./spending";
import { travelTest } from "./travel";
import { friendImageTest } from "./friend-image";
import { foodTest } from "./food";
import { energyTest } from "./energy";
import { emotionTest } from "./emotion";

export type {
  LogicPsychTest,
  MbtiTest,
  MbtiResult,
  MbtiQuestion,
  CategoryTest,
  CategoryResult,
  CategoryQuestion,
  AiTest,
  AiQuestion,
  PsychTest,
} from "./types";

/** 로직 계산형 (mbti + category) — 노출 순서 = 배열 순서. 카탈로그 우선순위대로 채운다. */
export const allLogicPsychTests: LogicPsychTest[] = [
  mbtiTest,
  loveStyleTest,
  animalTest,
  colorTest,
  spendingTest,
  travelTest,
  friendImageTest,
  foodTest,
  workVillainTest,
  decisionTest,
  relationshipTest,
];

/** AI 해석형 (회원 전용) */
export const allAiPsychTests: AiTest[] = [energyTest, emotionTest];

/** 전체 심리 테스트 (목록·라우트 params용) */
export const allPsychTests: PsychTest[] = [...allLogicPsychTests, ...allAiPsychTests];

export const PSYCH_SLUGS = allPsychTests.map((t) => t.slug);

export function getLogicPsychTestBySlug(slug: string): LogicPsychTest | undefined {
  return allLogicPsychTests.find((t) => t.slug === slug);
}

export function getPsychTestBySlug(slug: string): PsychTest | undefined {
  return allPsychTests.find((t) => t.slug === slug);
}
