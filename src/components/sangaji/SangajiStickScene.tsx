"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Phase } from "./SangajiScene3D";

// ── 상수 ────────────────────────────────────────────────────────
const STICK_COUNT = 50;
const STICK_W = 12;        // 화면 표시 너비 (px)
const STICK_H = 320;       // 총 높이 — 통 안에 깊이 들어가는 길이 포함
const STICK_VISIBLE = 140; // 통 위로 튀어나오는 길이
const OPENING_W = 72;      // 통 입구 너비

// 시드 기반 난수
let _s = 9001;
const rng = () => { _s = (_s * 1664525 + 1013904223) | 0; return (_s >>> 0) / 0xffffffff; };

const STICKS = Array.from({ length: STICK_COUNT }, (_, i) => ({
  i,
  baseX: -OPENING_W / 2 + (i / (STICK_COUNT - 1)) * OPENING_W + (rng() - 0.5) * 3,
  lean: (rng() - 0.5) * 6,
}));

// ── 통 이미지 흰 배경 제거 ────────────────────────────────────
function useContainerCanvas(src: string) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const w = Math.floor(img.naturalWidth * 0.48);
      const h = img.naturalHeight;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h);
      const px = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < px.data.length; i += 4) {
        const br = (px.data[i] + px.data[i + 1] + px.data[i + 2]) / 3;
        if (br > 215) px.data[i + 3] = 0;
        else if (br > 175) px.data[i + 3] = Math.round(((215 - br) / 40) * 255);
      }
      ctx.putImageData(px, 0, 0);
      ref.current = c;
      setReady(true);
    };
  }, [src]);
  return { canvasRef: ref, ready };
}

// ── Props ───────────────────────────────────────────────────────
interface Props {
  phase: Phase;
  pickedIdx: number | null;
  onPick: (idx: number) => void;
  onShakeComplete: () => void;
}

export default function SangajiStickScene({ phase, pickedIdx, onPick, onShakeComplete }: Props) {
  const { canvasRef: containerSrc, ready: containerReady } = useContainerCanvas("/sangaji.jpeg");

  const containerRef = useRef<HTMLCanvasElement>(null);
  const stickCanvasRef = useRef<HTMLCanvasElement>(null);
  const stickImgRef = useRef<ImageBitmap | null>(null);
  const [stickImgReady, setStickImgReady] = useState(false);

  const stickStates = useRef(
    STICKS.map(s => ({ baseX: s.baseX, lean: s.lean, dx: 0, dy: 0, dLean: 0 }))
  );

  const rafRef = useRef<number>(0);
  const phaseRef = useRef(phase);
  const pickedIdxRef = useRef<number | null>(null);
  const onShakeRef = useRef(onShakeComplete);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { onShakeRef.current = onShakeComplete; }, [onShakeComplete]);

  // 통 이미지 → DOM canvas 복사
  useEffect(() => {
    if (!containerReady || !containerSrc.current || !containerRef.current) return;
    const src = containerSrc.current;
    const dom = containerRef.current;
    dom.width = src.width;
    dom.height = src.height;
    dom.getContext("2d")!.drawImage(src, 0, 0);
  }, [containerReady, containerSrc]);

  // 막대 이미지 로드 + 흰 배경 제거
  useEffect(() => {
    const img = new Image();
    img.src = "/sangaji-stick.png";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < px.data.length; i += 4) {
        const r = px.data[i], g = px.data[i + 1], b = px.data[i + 2];
        const br = (r + g + b) / 3;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        if (br > 230 && sat < 20) px.data[i + 3] = 0;
        else if (br > 210 && sat < 30) px.data[i + 3] = Math.round(((230 - br) / 20) * 255);
      }
      ctx.putImageData(px, 0, 0);
      createImageBitmap(c).then(bmp => {
        stickImgRef.current = bmp;
        setStickImgReady(true);
      });
    };
  }, []);

  // 막대 canvas 렌더 루프
  useEffect(() => {
    if (!stickImgReady) return;
    const canvas = stickCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const CW = canvas.clientWidth;
    const CH = canvas.clientHeight;
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;

    const draw = () => {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img = stickImgRef.current!;
      const p = phaseRef.current;
      const states = stickStates.current;
      const cx = canvas.width / 2;
      const bottom = canvas.height;

      for (let i = 0; i < STICK_COUNT; i++) {
        const s = states[i];
        const stickCX = cx + s.baseX * dpr + s.dx;
        const stickBottom = bottom + s.dy;
        const totalLean = (s.lean + s.dLean) * (Math.PI / 180);

        ctx.save();
        if (p === "ready") {
          ctx.shadowColor = "rgba(245,170,40,0.65)";
          ctx.shadowBlur = 7 * dpr;
        }
        ctx.translate(stickCX, stickBottom);
        ctx.rotate(totalLean);
        ctx.translate(0, -STICK_H * dpr / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(
          img,
          -STICK_H * dpr / 2, -STICK_W * dpr / 2,
          STICK_H * dpr, STICK_W * dpr
        );
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [stickImgReady]);

  // ── 흔들기 애니메이션 ──────────────────────────────────────
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];

    if (phase !== "shaking") {
      stickStates.current.forEach(s => { s.dx = 0; s.dy = 0; s.dLean = 0; });
      return;
    }

    const pulse = (delay: number, intensity: number) => {
      const t = setTimeout(() => {
        stickStates.current.forEach(s => {
          s.dx = (Math.random() - 0.5) * intensity * (window.devicePixelRatio || 1);
          s.dy = (Math.random() * 0.3 - 0.1) * intensity * (window.devicePixelRatio || 1);
          s.dLean = (Math.random() - 0.5) * intensity * 0.5;
        });
      }, delay);
      timerRefs.current.push(t);
    };

    pulse(0, 18);
    pulse(130, 22);
    pulse(260, 20);
    pulse(390, 24);
    pulse(520, 18);

    const settle = setTimeout(() => {
      stickStates.current.forEach(s => { s.dx = 0; s.dy = 0; s.dLean = 0; });
    }, 660);
    timerRefs.current.push(settle);

    const done = setTimeout(() => onShakeRef.current(), 900);
    timerRefs.current.push(done);

    return () => timerRefs.current.forEach(clearTimeout);
  }, [phase]);

  // ── 막대 클릭 ────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phaseRef.current !== "ready") return;
    const canvas = stickCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mx = (e.clientX - rect.left) * dpr;

    let closest = -1;
    let minDist = Infinity;
    const centerX = canvas.width / 2;
    stickStates.current.forEach((s, i) => {
      const stickCX = centerX + s.baseX * dpr + s.dx;
      const dist = Math.abs(mx - stickCX);
      if (dist < minDist) { minDist = dist; closest = i; }
    });

    if (closest !== -1 && minDist < STICK_W * dpr * 3) {
      pickedIdxRef.current = closest;
      onPick(closest);
    }
  }, [onPick]);

  const isReady = phase === "ready";

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* 배경 글로우 */}
      <div className="absolute pointer-events-none" style={{
        width: 340, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 55%, rgba(150,70,8,0.28) 0%, rgba(70,25,4,0.14) 48%, transparent 72%)",
      }} />

      <div className="relative" style={{ width: 230, height: 420 }}>

        {/* ── 막대기 캔버스 (z:2) — STICK_H 전체 높이로 통 안까지 내려감 ── */}
        <canvas
          ref={stickCanvasRef}
          onClick={handleCanvasClick}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 230,
            height: STICK_H,
            zIndex: 2,
            cursor: isReady ? "pointer" : "default",
          }}
        />

        {/* ready 글로우 */}
        <AnimatePresence>
          {isReady && (
            <motion.div
              key="glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="pointer-events-none"
              style={{
                position: "absolute",
                top: STICK_VISIBLE - 30,
                left: "50%",
                transform: "translateX(-50%)",
                width: 200,
                height: 80,
                background: "radial-gradient(ellipse at 50% 60%, rgba(245,158,11,0.38) 0%, transparent 70%)",
                zIndex: 3,
              }}
            />
          )}
        </AnimatePresence>

        {/* ── 산가지 통 (z:4) — 막대 기저를 덮어 통 안에 들어간 것처럼 ── */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          zIndex: 4,
        }}>
          <canvas
            ref={containerRef}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              opacity: containerReady ? 1 : 0,
              transition: "opacity 0.4s",
              filter: "drop-shadow(0 4px 22px rgba(180,90,15,0.55))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
