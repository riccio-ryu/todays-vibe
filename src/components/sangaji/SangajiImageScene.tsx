"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { Phase } from "./SangajiScene3D";

// 통 이미지 왼쪽 절반 크롭 + 흰 배경 투명화
function useContainerCanvas(src: string) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const w = Math.floor(img.naturalWidth * 0.48); // 왼쪽 48% (통 부분)
      const h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h);

      const data = ctx.getImageData(0, 0, w, h);
      const d = data.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // 흰색 ~ 밝은 회색 → 투명
        const brightness = (r + g + b) / 3;
        if (brightness > 210) {
          d[i + 3] = 0;
        } else if (brightness > 170) {
          d[i + 3] = Math.round(((210 - brightness) / 40) * 255);
        }
      }
      ctx.putImageData(data, 0, 0);
      canvasRef.current = canvas;
      setReady(true);
    };
  }, [src]);

  return { canvasRef, ready };
}

interface Props {
  phase: Phase;
  pickedIdx: number | null;
  onPick: (idx: number) => void;
  onShakeComplete: () => void;
}

// 막대기 25개 — 원통 개구부에서 나오는 것처럼 밑도 퍼짐
const STICKS = Array.from({ length: 25 }, (_, i) => {
  const t = i / 24;
  const spread = 18; // 각도 퍼짐(deg)
  const angle = -spread + t * spread * 2;
  // 밑단 x offset: 통 개구부 반지름(50px) 내에서 분산
  const baseX = -52 + t * 104;
  const h = 120 + Math.sin(t * Math.PI) * 40;
  const colors = [
    ["#e2d070", "#b89030", "#d4ac48", "#c89828"],
    ["#dcc868", "#c09030", "#ccaa40", "#b88820"],
    ["#e8d878", "#c8a038", "#dcc058", "#c0a028"],
  ];
  const c = colors[i % colors.length];
  return { angle, baseX, h, c };
});

export default function SangajiImageScene({ phase, pickedIdx, onPick, onShakeComplete }: Props) {
  const controls = useAnimation();
  const shakeCalledRef = useRef(false);
  const { canvasRef, ready } = useContainerCanvas("/sangaji.jpeg");
  const domCanvasRef = useRef<HTMLCanvasElement>(null);

  // offscreen canvas → DOM canvas로 복사
  useEffect(() => {
    if (!ready || !canvasRef.current || !domCanvasRef.current) return;
    const dom = domCanvasRef.current;
    const src = canvasRef.current;
    dom.width = src.width;
    dom.height = src.height;
    dom.getContext("2d")!.drawImage(src, 0, 0);
  }, [ready, canvasRef]);

  useEffect(() => {
    if (phase === "shaking") {
      shakeCalledRef.current = false;
      controls
        .start({
          rotate: [0, -15, 14, -11, 10, -7, 7, -4, 4, -2, 2, 0],
          y: [0, -7, 6, -5, 4, -3, 3, -2, 2, -1, 1, 0],
          transition: { duration: 0.95, ease: "easeInOut" },
        })
        .then(() => {
          if (!shakeCalledRef.current) {
            shakeCalledRef.current = true;
            onShakeComplete();
          }
        });
    } else {
      controls.start({ rotate: 0, y: 0, transition: { duration: 0.25 } });
    }
  }, [phase, controls, onShakeComplete]);

  const handleClick = useCallback(() => {
    if (phase === "ready") {
      onPick(Math.floor(Math.random() * 25));
    }
  }, [phase, onPick]);

  const isReady = phase === "ready";
  const isDrawing = phase === "drawing";

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* 배경 글로우 */}
      <div
        className="absolute"
        style={{
          width: 360,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(160,80,10,0.35) 0%, rgba(80,30,5,0.2) 45%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        animate={controls}
        onClick={handleClick}
        style={{
          transformOrigin: "center bottom",
          cursor: isReady ? "pointer" : "default",
          position: "relative",
          zIndex: 1,
        }}
        className="flex flex-col items-center"
      >
        {/* ── 막대기 다발 (통 위로 삐죽) ── */}
        <div
          style={{
            position: "relative",
            height: 160,
            width: 230,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {STICKS.map(({ angle, baseX, h, c }, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                bottom: 0,
                left: `calc(50% + ${baseX}px)`,
                width: 10,
                height: h,
                marginLeft: -5,
                background: `linear-gradient(to right, ${c[0]} 0%, ${c[1]} 25%, ${c[2]} 55%, ${c[3]} 80%, ${c[0]} 100%)`,
                borderRadius: "4px 4px 1px 1px",
                transform: `rotate(${angle}deg)`,
                transformOrigin: "bottom center",
                boxShadow: isReady
                  ? "0 0 7px 1.5px rgba(245,158,11,0.5), inset 0 0 2px rgba(255,220,80,0.3)"
                  : "1px 0 3px rgba(0,0,0,0.5)",
                transition: "box-shadow 0.35s",
              }}
            />
          ))}

          {/* ready 상태 글로우 */}
          <AnimatePresence>
            {isReady && (
              <motion.div
                key="glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.25) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── 산가지 통 (흰 배경 제거된 canvas) ── */}
        <div
          style={{
            width: 220,
            position: "relative",
            zIndex: 3,
            marginTop: -75,
          }}
        >
          <canvas
            ref={domCanvasRef}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              opacity: ready ? 1 : 0,
              transition: "opacity 0.3s",
              filter: "drop-shadow(0 4px 24px rgba(180,100,20,0.5))",
            }}
          />
          {/* 위쪽 페이드 — 막대기 하단이 통 안으로 들어가는 느낌 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 70,
              background:
                "linear-gradient(to bottom, #1c0803 0%, rgba(28,8,3,0.75) 40%, rgba(28,8,3,0.2) 75%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </motion.div>

      {/* ── 뽑히는 막대 애니메이션 ── */}
      <AnimatePresence>
        {isDrawing && (
          <motion.img
            key="drawn-stick"
            src="/sangaji-stick.png"
            alt="뽑힌 산가지"
            initial={{ y: 30, x: 0, rotate: 0, opacity: 0, scale: 0.75 }}
            animate={{ y: -170, x: 55, rotate: 28, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 1.05, ease: [0.15, 0.85, 0.3, 1] }}
            style={{
              position: "absolute",
              width: 230,
              filter:
                "drop-shadow(0 6px 18px rgba(0,0,0,0.75)) brightness(1.05) contrast(1.05)",
              zIndex: 20,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
