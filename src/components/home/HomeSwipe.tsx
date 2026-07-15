"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";

interface Props {
  fortunePanel: React.ReactNode; // 밤/운세
  psychPanel: React.ReactNode; // 낮/심테
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 34 };

/**
 * 메인 낮/밤 스와이프 캐러셀.
 * 왼쪽 = 운세(밤), 오른쪽 = 심테(낮). 좌우 드래그·도트·라벨로 전환한다.
 *
 * 배경은 콘텐츠 트랙과 분리된 별도의 fixed 레이어에서 같은 x로 가로 이동한다.
 * (transform 걸린 트랙 안에서는 position:fixed가 뷰포트 기준으로 동작하지 않으므로 분리 필수)
 * 왼쪽 배경 = 투명(레이아웃의 야간 TimeBackground 노출), 오른쪽 = 불투명 낮 그라데이션.
 * 심테에 안착하면 낮 배경이 뷰포트를 완전히 덮어, 세로 스크롤에도 야간 배경이 새지 않는다.
 */
export default function HomeSwipe({ fortunePanel, psychPanel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fortuneRef = useRef<HTMLDivElement>(null);
  const psychRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<[number, number]>([0, 0]);
  const [index, setIndex] = useState(0); // 0 = 운세, 1 = 심테
  const x = useMotionValue(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 각 패널의 자연 높이 측정 → 활성 패널 높이로 컨테이너 높이 지정 (콘텐츠에 맞춤)
  useEffect(() => {
    const els = [fortuneRef.current, psychRef.current];
    const observers: ResizeObserver[] = [];
    els.forEach((el, i) => {
      if (!el) return;
      const ro = new ResizeObserver(() => {
        setHeights((prev) => {
          if (prev[i] === el.offsetHeight) return prev;
          const next = [...prev] as [number, number];
          next[i] = el.offsetHeight;
          return next;
        });
      });
      ro.observe(el);
      observers.push(ro);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const controls = animate(x, -index * width, SPRING);
    return controls.stop;
  }, [index, width, x]);

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(1, next)));
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    const threshold = width * 0.22;
    if (info.offset.x < -threshold || info.velocity.x < -450) goTo(1);
    else if (info.offset.x > threshold || info.velocity.x > 450) goTo(0);
    else animate(x, -index * width, SPRING);
  }

  return (
    <div className="relative">
      {/* 배경 레이어 (뷰포트 고정, 콘텐츠 트랙과 같은 x로 가로 이동) */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden
      >
        <motion.div className="flex h-full" style={{ x }}>
          {/* 밤: 투명 → 레이아웃 야간 배경(별·달) 노출 */}
          <div className="w-full h-full shrink-0" />
          {/* 낮: 불투명 그라데이션 → 야간 배경 완전 차단 */}
          <div className="w-full h-full shrink-0 bg-gradient-to-b from-[#fde9c8] via-[#fbd6e6] to-[#cfe5ff]" />
        </motion.div>
      </div>

      {/* 상단 토글 */}
      <div className="sticky top-20 z-20 flex justify-center pt-2 pb-3 pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-black/25 backdrop-blur-sm border border-white/15 p-1">
          <button
            onClick={() => goTo(0)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              index === 0 ? "bg-white/20 text-white" : "text-white/55 hover:text-white/80"
            }`}
          >
            🌙 운세
          </button>
          <button
            onClick={() => goTo(1)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              index === 1 ? "bg-white/85 text-slate-800" : "text-white/55 hover:text-white/80"
            }`}
          >
            ☀️ 심테
          </button>
        </div>
      </div>

      {/* 드래그 트랙 (콘텐츠) — 높이는 활성 패널 콘텐츠에 맞춤 */}
      <div
        ref={containerRef}
        className="relative z-10 overflow-hidden -mt-16 transition-[height] duration-300 ease-out"
        style={{ height: heights[index] || undefined }}
      >
        <motion.div
          className="flex items-start"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -width, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
        >
          <div ref={fortuneRef} className="w-full shrink-0">{fortunePanel}</div>
          <div ref={psychRef} className="w-full shrink-0">{psychPanel}</div>
        </motion.div>
      </div>
    </div>
  );
}
