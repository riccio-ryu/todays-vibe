"use server";

import { saveTemplate, resetTemplate, seedAllTemplates } from "@/lib/claude/promptStore";
import { PROMPT_META } from "@/lib/claude/promptTemplates";
import { revalidatePath } from "next/cache";

export async function savePromptAction(type: string, template: string) {
  if (!PROMPT_META[type]) throw new Error("알 수 없는 운세 타입입니다.");
  if (!template.trim()) throw new Error("프롬프트가 비어 있습니다.");

  await saveTemplate(type, template.trim());
  revalidatePath("/admin/prompts");
}

export async function resetPromptAction(type: string) {
  if (!PROMPT_META[type]) throw new Error("알 수 없는 운세 타입입니다.");

  await resetTemplate(type);
  revalidatePath("/admin/prompts");
}

export async function seedAllPromptsAction() {
  await seedAllTemplates();
  revalidatePath("/admin/prompts");
}
