"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  comingSoonPsychTests,
  PSYCH_SECTION_ORDER,
  type ComingSoonPsychTest,
} from "@/data/psych";

// 카탈로그 미구현 심테를 섹션별 아코디언(기본 접힘)으로 흐릿하게 노출.
// 운세 그리드의 "준비중" 카드와 같은 취급 — 클릭 불가, 링크 없음(크롤 대상 아님).
// variant: 홈 심테 탭은 낮(day) 테마, /psych 목록은 밤(night) 테마.

type Variant = "day" | "night";

const THEME = {
  day: {
    heading: "text-slate-700",
    caption: "text-slate-500",
    box: "border-slate-900/8",
    header: "text-slate-700 hover:bg-white/40",
    count: "text-slate-400",
    chevron: "text-slate-400",
    card: "bg-white/50 border-slate-900/5",
    title: "text-slate-800",
    summary: "text-slate-500",
    badge: "text-slate-500 bg-slate-900/6",
  },
  night: {
    heading: "text-white/60",
    caption: "text-white/30",
    box: "border-white/8",
    header: "text-white/70 hover:bg-white/3",
    count: "text-white/30",
    chevron: "text-white/30",
    card: "bg-white/2 border-white/4",
    title: "text-white",
    summary: "text-white/45",
    badge: "text-[#a8a6b7]/60 bg-white/6",
  },
} as const;

function ComingSoonCard({
  test,
  theme,
}: {
  test: ComingSoonPsychTest;
  theme: (typeof THEME)[Variant];
}) {
  return (
    <div
      aria-disabled
      className={`relative flex items-center gap-4 rounded-2xl border px-5 py-4 opacity-45 grayscale cursor-not-allowed select-none ${theme.card}`}
    >
      <span className="text-3xl">{test.icon}</span>
      <div className="min-w-0 pr-14">
        <p className={`font-semibold text-sm ${theme.title}`}>{test.title}</p>
        <p className={`text-xs mt-0.5 ${theme.summary}`}>{test.summary}</p>
      </div>
      <span
        className={`absolute top-3 right-3 text-[10px] font-medium px-1.5 py-0.5 rounded-[32px] ${theme.badge}`}
      >
        준비중
      </span>
    </div>
  );
}

export default function ComingSoonSection({
  variant = "night",
}: {
  variant?: Variant;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const theme = THEME[variant];

  const toggle = (section: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });

  const sections = PSYCH_SECTION_ORDER.map((section) => ({
    section,
    tests: comingSoonPsychTests.filter((t) => t.section === section),
  })).filter(({ tests }) => tests.length > 0);

  if (sections.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className={`text-sm font-semibold mb-1 ${theme.heading}`}>준비 중인 테스트</h2>
      <p className={`text-xs mb-4 ${theme.caption}`}>
        카탈로그에 설계된 {comingSoonPsychTests.length}종을 순차적으로 추가하고 있어요.
      </p>

      <div className="space-y-2">
        {sections.map(({ section, tests }) => {
          const isOpen = open.has(section);
          return (
            <div key={section} className={`rounded-2xl border overflow-hidden ${theme.box}`}>
              <button
                onClick={() => toggle(section)}
                aria-expanded={isOpen}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${theme.header}`}
              >
                <span className="flex-1 text-sm font-medium">{section}</span>
                <span className={`text-xs mr-1 ${theme.count}`}>{tests.length}종</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className={`leading-none ${theme.chevron}`}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-3 pb-3 pt-1">
                      {tests.map((t) => (
                        <ComingSoonCard key={t.slug} test={t} theme={theme} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
