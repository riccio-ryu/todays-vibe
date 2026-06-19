"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import type { MenuItem } from "@/types/menu";
import type { BulkFortuneStatus } from "@/app/api/user/fortune-status-bulk/route";

const STORAGE_KEY = "todays-vibe:accordion";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  categories: Category[];
  fortunes: MenuItem[];
}

export default function FortuneGrid({ categories, fortunes }: Props) {
  const { user, loading } = useAuth();
  const [modalPath, setModalPath] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [statusMap, setStatusMap] = useState<Record<string, BulkFortuneStatus>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOpenCategories(new Set(JSON.parse(saved)));
    } catch {
      // ignore
    }
  }, []);

  const fetchBulkStatus = useCallback(() => {
    if (!user) return;
    const readyIds = fortunes.filter((f) => f.ready).map((f) => f.id);
    if (readyIds.length === 0) return;
    fetch("/api/user/fortune-status-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuIds: readyIds }),
    })
      .then((r) => r.json())
      .then((d) => setStatusMap(d))
      .catch(() => {});
  }, [user, fortunes]);

  useEffect(() => { fetchBulkStatus(); }, [fetchBulkStatus]);

  function toggleCategory(id: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function expandAll() {
    const all = new Set(categories.map((c) => c.id));
    setOpenCategories(all);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...all])); } catch { /* ignore */ }
  }

  function collapseAll() {
    setOpenCategories(new Set());
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([])); } catch { /* ignore */ }
  }

  function handleClick(fortune: MenuItem, e: React.MouseEvent) {
    if (!loading && !user && fortune.accessLevel !== "public") {
      e.preventDefault();
      setModalPath(fortune.path);
    }
  }

  return (
    <>
      <LoginRequiredModal
        isOpen={modalPath !== null}
        onClose={() => setModalPath(null)}
        redirectPath={modalPath ?? "/"}
      />

      {/* 툴바 */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-0.5">
          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-l-full text-xs text-[#a8a6b7]/70 border border-white/10 bg-white/4 hover:bg-white/8 hover:text-[#f4f0ff] transition-colors"
          >
            모두펼치기
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-r-full text-xs text-[#a8a6b7]/70 border border-white/10 border-l-0 bg-white/4 hover:bg-white/8 hover:text-[#f4f0ff] transition-colors"
          >
            모두접기
          </button>
        </div>

        {/* 준비중 토글 */}
        <button
          onClick={() => setShowComingSoon((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
            showComingSoon
              ? "bg-[#9382ff]/10 border-[#9382ff]/25 text-[#9382ff] hover:bg-[#9382ff]/20"
              : "bg-white/4 border-white/10 text-[#a8a6b7]/60 hover:bg-white/8 hover:text-[#a8a6b7]"
          }`}
        >
          {showComingSoon ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          <span>{showComingSoon ? "준비중 숨기기" : "준비중 보기"}</span>
        </button>
      </div>

      {/* 카테고리 아코디언 */}
      <div className="space-y-2">
        {categories.map((category) => {
          const categoryFortunes = fortunes
            .filter((f) => f.category === category.id)
            .filter((f) => showComingSoon || f.ready === true);
          if (categoryFortunes.length === 0) return null;

          const isOpen = openCategories.has(category.id);
          const readyCount = categoryFortunes.filter((f) => f.ready).length;

          return (
            <section key={category.id} className="rounded-2xl overflow-hidden card-glow transition-shadow duration-300">
              {/* 카테고리 헤더 */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#9382ff]/4 transition-colors text-left"
              >
                <span className="text-xl">{category.icon}</span>
                <span className="flex-1 text-[#f4f0ff]/85 text-sm font-medium">
                  {category.name}
                </span>
                <span className="text-[#a8a6b7]/50 text-xs mr-2">
                  {readyCount}종
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="text-[#a8a6b7]/40 text-xs leading-none"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              {/* 펼쳐지는 카드 목록 */}
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
                    <div className="px-3 pb-3 pt-1">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 items-stretch">
                        {categoryFortunes.map((fortune) => {
                          const isReady = fortune.ready === true;
                          const needsAuth = fortune.accessLevel !== "public";

                          const status = statusMap[fortune.id];
                          const isExhausted = !!status?.exhausted;
                          const hasLimit = status && status.limit !== null && status.limit !== -1;
                          const used = status?.used ?? 0;
                          const limit = status?.limit ?? null;

                          const card = (
                            <div
                              className={`group relative flex flex-col h-full rounded-xl p-4 transition-all duration-200
                                ${
                                  isReady
                                    ? isExhausted
                                      ? "card-mini cursor-pointer opacity-50"
                                      : "card-mini cursor-pointer hover:-translate-y-0.5 hover:bg-[#9382ff]/6 hover:shadow-[rgba(147,130,255,0.12)_0px_0px_20px_0px]"
                                    : "bg-white/2 border border-white/4 cursor-not-allowed opacity-40 grayscale"
                                }`}
                            >
                              {/* 오늘 완료 뱃지 */}
                              {isExhausted && (
                                <span className="absolute top-2 right-2 text-[10px] font-medium text-[#a8a6b7]/70 bg-white/8 px-1.5 py-0.5 rounded-full">
                                  오늘완료
                                </span>
                              )}
                              {/* Premium 뱃지 */}
                              {fortune.accessLevel === "premium" && isReady && !isExhausted && (
                                <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background: "linear-gradient(to right, #92400e, #d97706)",
                                    color: "#fef3c7",
                                  }}
                                >
                                  Premium
                                </span>
                              )}
                              {!isReady && (
                                <span className="absolute top-2 right-2 text-[10px] font-medium text-[#a8a6b7]/60 bg-white/6 px-1.5 py-0.5 rounded-full">
                                  준비중
                                </span>
                              )}
                              <div className="text-3xl mb-2">{fortune.icon}</div>
                              <h3 className="text-[#f4f0ff] font-medium text-sm mb-1 leading-tight">
                                {fortune.nameKo}
                              </h3>
                              <p className="text-[#a8a6b7] text-xs leading-snug line-clamp-2 flex-1">
                                {fortune.description}
                              </p>
                              {/* 하단 행: AI 뱃지 + 사용하기 */}
                              <div className="flex items-center justify-between mt-2.5">
                                {fortune.isAI && isReady ? (
                                  <span className="text-[10px] font-medium text-[#9382ff] bg-[#9382ff]/10 px-1.5 py-0.5 rounded-full">
                                    ✦
                                  </span>
                                ) : <span />}
                                {isReady && (
                                  <span className={`flex items-center gap-0.5 text-[10px] transition-colors ${
                                    isExhausted
                                      ? "text-[#a8a6b7]/40"
                                      : "text-[#a8a6b7]/50 group-hover:text-[#9382ff]"
                                  }`}>
                                    {hasLimit
                                      ? `${used}/${limit}회 사용하기`
                                      : "사용하기"}
                                    {!isExhausted && <ArrowRight className="w-3 h-3" />}
                                  </span>
                                )}
                              </div>
                            </div>
                          );

                          if (!isReady) return <div key={fortune.id}>{card}</div>;

                          return (
                            <Link
                              key={fortune.id}
                              href={fortune.path}
                              onClick={(e) => needsAuth ? handleClick(fortune, e) : undefined}
                            >
                              {card}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </>
  );
}
