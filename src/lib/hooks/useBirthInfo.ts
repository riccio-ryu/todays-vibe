"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type SavedBirthInfo = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  isLunar?: boolean;
  gender: "male" | "female";
};

export function useBirthInfo() {
  const { user } = useAuth();
  const [savedInfo, setSavedInfo] = useState<SavedBirthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch("/api/user/birth-info")
      .then((r) => r.json())
      .then((d) => setSavedInfo(d.birthInfo ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function saveBirthInfo(info: SavedBirthInfo) {
    if (!user) return;
    setSaving(true);
    try {
      await fetch("/api/user/birth-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info),
      });
      setSavedInfo(info);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  }

  return { savedInfo, loading, saving, saveStatus, saveBirthInfo };
}
