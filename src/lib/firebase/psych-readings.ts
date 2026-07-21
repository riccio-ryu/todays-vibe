import { getAdminFirestore } from "./admin";

/** AI 심테 결과 1건 (ai_readings 中 type === "psych-test") */
export type PsychReading = {
  id: string;
  userId: string | null;
  testSlug: string;
  testTitle: string;
  date: string; // YYYYMMDD (KST)
  result: string;
  createdAt: string | null;
};

/**
 * ai_readings에서 AI 심테 기록만 조회한다.
 * - 로직 심테(mbti·category·score·ranking)는 API를 타지 않아 기록이 없다(정상).
 * - type 단일 equality 필터만 사용 → 복합 인덱스 불필요. 정렬은 메모리에서 처리.
 * - 심테는 신규 도메인이라 볼륨이 낮아 전량 조회가 안전하다.
 */
export async function getPsychReadings(): Promise<PsychReading[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("ai_readings")
    .where("type", "==", "psych-test")
    .get();

  const readings = snap.docs.map((doc) => {
    const d = doc.data();
    const input = (d.input ?? {}) as { testSlug?: string; testTitle?: string };
    return {
      id: doc.id,
      userId: (d.userId as string | null) ?? null,
      testSlug: input.testSlug ?? "unknown",
      testTitle: input.testTitle ?? input.testSlug ?? "알 수 없음",
      date: (d.date as string) ?? "",
      result: (d.result as string) ?? "",
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    };
  });

  // 최신순 (createdAt desc, null은 뒤로)
  readings.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return readings;
}
