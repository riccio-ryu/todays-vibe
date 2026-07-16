"use server";

import { getAdminFirestore } from "@/lib/firebase/admin";
import type { PsychTestConfig } from "@/lib/psych/settings";

export async function getPsychConfig(): Promise<Record<string, PsychTestConfig>> {
  try {
    const snap = await getAdminFirestore().collection("settings").doc("psych").get();
    return (snap.data()?.tests ?? {}) as Record<string, PsychTestConfig>;
  } catch {
    return {};
  }
}

export async function savePsychConfig(
  tests: Record<string, PsychTestConfig>
): Promise<void> {
  await getAdminFirestore()
    .collection("settings")
    .doc("psych")
    .set({ tests, updatedAt: new Date() }, { merge: true });
}
