"use server";

import type { PsychTestMeta } from "@/types/psych";
import {
  getPsychTestMetaList,
  savePsychTestDoc,
  deletePsychTestDocs,
  patchPsychTestDocs,
  batchUpdatePsychOrders,
  getPsychTestContent as getContent,
  savePsychTestContent as saveContent,
} from "@/lib/psych/tests-store";

/** 심테 목록 (최초 호출 시 코드 정의로 시드) */
export async function getPsychTests(): Promise<PsychTestMeta[]> {
  return getPsychTestMetaList();
}

/** 심테 저장 (추가/편집) */
export async function savePsychTest(meta: PsychTestMeta): Promise<void> {
  await savePsychTestDoc(meta);
}

/** 심테 삭제 */
export async function deletePsychTests(slugs: string[]): Promise<void> {
  await deletePsychTestDocs(slugs);
}

/** 일괄 부분수정 (노출 토글 등, slugs=null이면 전체) */
export async function patchPsychTests(
  slugs: string[] | null,
  data: Partial<PsychTestMeta>
): Promise<void> {
  await patchPsychTestDocs(slugs, data);
}

/** 순서 일괄 저장 */
export async function savePsychOrders(items: { slug: string; order: number }[]): Promise<void> {
  await batchUpdatePsychOrders(items);
}

/** 문항·결과(content) 조회 */
export async function getPsychTestContent(slug: string): Promise<Record<string, unknown>> {
  return getContent(slug);
}

/** 문항·결과(content) 저장 */
export async function savePsychTestContent(
  slug: string,
  content: Record<string, unknown>
): Promise<void> {
  await saveContent(slug, content);
}
