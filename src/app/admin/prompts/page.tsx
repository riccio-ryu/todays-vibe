import { getAllPromptStatus } from "@/lib/claude/promptStore";
import { PROMPT_META } from "@/lib/claude/promptTemplates";
import PromptsEditor from "./PromptsEditor";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage() {
  const prompts = await getAllPromptStatus();

  // variables 문서화 정보도 함께 전달
  const varDocs = Object.fromEntries(
    Object.entries(PROMPT_META).map(([type, meta]) => [type, meta.vars])
  );

  return <PromptsEditor prompts={prompts} varDocs={varDocs} />;
}
