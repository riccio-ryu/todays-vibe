// 심리 테스트 로직 계산 엔진 — 카탈로그 "MBTI 공통 엔진" 구현.
// 선택지마다 극(pole)을 부여하고, 축별 다수결로 코드를 조립한다.
// MBTI 확장 10종(연애/직장/친구 등)이 모두 이 함수 하나를 공유한다.

import type { MbtiPole, CategoryTest, CategoryResult, ScoreTest, ScoreBand } from "@/data/psych/types";

/** 선택된 극 배열 → MBTI 코드 (예: ["E","N","F","P",...] → "ENFP") */
export function scoreMbti(poles: MbtiPole[]): string {
  const tally: Record<MbtiPole, number> = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
  };
  for (const p of poles) tally[p] += 1;

  // 동점이면 앞쪽 극(E/S/T/J)으로 확정해 항상 유효한 16코드를 보장한다.
  return (
    (tally.E >= tally.I ? "E" : "I") +
    (tally.S >= tally.N ? "S" : "N") +
    (tally.T >= tally.F ? "T" : "F") +
    (tally.J >= tally.P ? "J" : "P")
  );
}

/**
 * 카테고리 투표형 채점: 선택한 보기 인덱스 배열 → 유형별 득표 합산 → 최다 득표 결과.
 * 동점이면 results 배열 앞쪽 유형을 우선한다.
 */
export function scoreCategory(
  test: CategoryTest,
  answerIndices: number[]
): CategoryResult {
  const votes: Record<string, number> = {};
  answerIndices.forEach((optIdx, qIdx) => {
    const option = test.questions[qIdx]?.options[optIdx];
    if (!option) return;
    votes[option.type] = (votes[option.type] ?? 0) + 1;
  });

  let best = test.results[0];
  let bestVotes = -1;
  for (const result of test.results) {
    const v = votes[result.type] ?? 0;
    if (v > bestVotes) {
      bestVotes = v;
      best = result;
    }
  }
  return best;
}

export interface ScoreOutcome {
  /** 총점 */
  total: number;
  /** 가능한 최대 총점 */
  maxTotal: number;
  /** 축별 점수 (단일축이면 total 축 하나) */
  axisScores: { key: string; label: string; score: number; max: number }[];
  /** 총점이 속한 결과 구간 */
  band: ScoreBand;
}

/**
 * 점수 척도형 채점: 선택한 보기 인덱스 배열 → 총점 + 축별 점수 → 구간(band) 매핑.
 * 총점이 어느 band에도 안 들면 가장 가까운(마지막) band로 폴백.
 */
export function scoreScale(test: ScoreTest, answerIndices: number[]): ScoreOutcome {
  let total = 0;
  let maxTotal = 0;
  const axisScore: Record<string, number> = {};
  const axisMax: Record<string, number> = {};

  test.questions.forEach((q, i) => {
    const axis = q.axis ?? "total";
    const optMax = Math.max(...q.options.map((o) => o.value));
    const val = q.options[answerIndices[i]]?.value ?? 0;
    total += val;
    maxTotal += optMax;
    axisScore[axis] = (axisScore[axis] ?? 0) + val;
    axisMax[axis] = (axisMax[axis] ?? 0) + optMax;
  });

  const axisScores = (test.axes ?? []).map((a) => ({
    key: a.key,
    label: a.label,
    score: axisScore[a.key] ?? 0,
    max: axisMax[a.key] ?? 0,
  }));

  const band =
    test.bands.find((b) => total >= b.min && total <= b.max) ??
    test.bands[test.bands.length - 1];

  return { total, maxTotal, axisScores, band };
}
