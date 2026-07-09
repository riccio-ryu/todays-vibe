import type { PsychQuestion } from "@/types/psych";

function sumWeights(answers: number[], questions: PsychQuestion[]) {
  const totals: Record<string, number> = {};
  answers.forEach((answerIdx, qIdx) => {
    const option = questions[qIdx]?.options[answerIdx];
    if (!option) return;
    for (const [key, val] of Object.entries(option.weights)) {
      totals[key] = (totals[key] ?? 0) + (val ?? 0);
    }
  });
  return totals;
}

export function scoreMBTI(answers: number[], questions: PsychQuestion[]): string {
  const t = sumWeights(answers, questions);
  const ei = (t.E ?? 0) >= (t.I ?? 0) ? "E" : "I";
  const sn = (t.S ?? 0) >= (t.N ?? 0) ? "S" : "N";
  const tf = (t.T ?? 0) >= (t.F ?? 0) ? "T" : "F";
  const jp = (t.J ?? 0) >= (t.P ?? 0) ? "J" : "P";
  return ei + sn + tf + jp;
}

export function getMBTIAxisScores(answers: number[], questions: PsychQuestion[]) {
  const t = sumWeights(answers, questions);
  return {
    E: t.E ?? 0, I: t.I ?? 0,
    S: t.S ?? 0, N: t.N ?? 0,
    T: t.T ?? 0, F: t.F ?? 0,
    J: t.J ?? 0, P: t.P ?? 0,
  };
}

export function axisPercent(a: number, b: number): number {
  const total = a + b;
  if (total === 0) return 50;
  return Math.round((a / total) * 100);
}
