import type { PsychTestData } from "@/types/psych";
import mbti from "@/data/psych-tests/mbti.json";

const REGISTRY: Record<string, PsychTestData> = {
  mbti: mbti as PsychTestData,
};

export function getPsychTest(slug: string): PsychTestData | null {
  return REGISTRY[slug] ?? null;
}
