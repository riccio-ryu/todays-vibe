"use client";

import { useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { PCFShadowMap } from "three";

// ── 상수 ─────────────────────────────────────────────────────
const STICK_COUNT = 25;
const CONTAINER_RADIUS = 0.88;
const CONTAINER_HEIGHT = 1.6;
const STICK_RADIUS = 0.038;
const STICK_HEIGHT = 3.8;

export type Phase = "idle" | "shaking" | "ready" | "drawing" | "drawn" | "ai";

export interface SangajiScene3DProps {
  phase: Phase;
  pickedIdx: number | null;
  onPick: (idx: number) => void;
  onShakeComplete: () => void;
}

// ── 25개 막대 안착 좌표 (사전 계산) ──────────────────────────
// 1 중앙 + 6 내권 + 8 중권 + 10 외권 = 25
const REST = (() => {
  const arr: { x: number; z: number; ry: number; lean: number }[] = [];
  arr.push({ x: 0, z: 0, ry: 0, lean: 0 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    arr.push({ x: Math.cos(a) * 0.18, z: Math.sin(a) * 0.18, ry: a + 0.4, lean: 0.06 });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    arr.push({ x: Math.cos(a) * 0.38, z: Math.sin(a) * 0.38, ry: a + 0.1, lean: 0.12 });
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    arr.push({ x: Math.cos(a) * 0.62, z: Math.sin(a) * 0.62, ry: a + 0.25, lean: 0.18 });
  }
  return arr;
})();

const BAMBOO_COLORS = ["#dfc87a", "#c8a840", "#e4d485", "#cdb860", "#d4c878"];

// ── 나무 통 ─────────────────────────────────────────────────
function ContainerMesh() {
  return (
    <group>
      <mesh>
        <cylinderGeometry
          args={[CONTAINER_RADIUS + 0.1, CONTAINER_RADIUS + 0.1, CONTAINER_HEIGHT, 32, 1, true]}
        />
        <meshStandardMaterial color="#5c1c08" roughness={0.87} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <cylinderGeometry
          args={[CONTAINER_RADIUS, CONTAINER_RADIUS, CONTAINER_HEIGHT, 32, 1, true]}
        />
        <meshStandardMaterial color="#1a0601" side={THREE.BackSide} roughness={0.95} />
      </mesh>
      <mesh position={[0, -CONTAINER_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[CONTAINER_RADIUS + 0.1, CONTAINER_RADIUS + 0.1, 0.14, 32]} />
        <meshStandardMaterial color="#4a1504" roughness={0.9} />
      </mesh>
      {[-0.55, 0.0, 0.55].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[CONTAINER_RADIUS + 0.12, 0.055, 8, 32]} />
          <meshStandardMaterial color="#c8a030" metalness={0.78} roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
}

// ── 씬 (스프링 애니메이션) ─────────────────────────────────
function Scene({ phase, pickedIdx, onPick, onShakeComplete }: SangajiScene3DProps) {
  // 각 막대의 현재 position/rotation (Ref — setState 없이 매 프레임 업데이트)
  const cx = useRef<Float32Array>(new Float32Array(STICK_COUNT).map((_, i) => REST[i].x));
  const cy = useRef<Float32Array>(new Float32Array(STICK_COUNT).fill(0));
  const cz = useRef<Float32Array>(new Float32Array(STICK_COUNT).map((_, i) => REST[i].z));
  const crx = useRef<Float32Array>(new Float32Array(STICK_COUNT).map((_, i) => REST[i].lean));
  const cry = useRef<Float32Array>(new Float32Array(STICK_COUNT).map((_, i) => REST[i].ry));
  const crz = useRef<Float32Array>(new Float32Array(STICK_COUNT).fill(0));
  const cemit = useRef<Float32Array>(new Float32Array(STICK_COUNT).fill(0));

  // 흔들기 랜덤 오프셋 (shake 중 목표값에 더해짐)
  const shakeOff = useRef<{ dx: number; dz: number; dry: number }[]>(
    Array.from({ length: STICK_COUNT }, () => ({ dx: 0, dz: 0, dry: 0 }))
  );

  // Three.js 오브젝트 refs
  const groupRefs = useRef<(THREE.Group | null)[]>(Array(STICK_COUNT).fill(null));
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>(Array(STICK_COUNT).fill(null));

  const phaseRef = useRef(phase);
  const pickedRef = useRef(pickedIdx);
  const hoveredRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { pickedRef.current = pickedIdx; }, [pickedIdx]);

  // 흔들기 시작 → 랜덤 오프셋 세팅 → 타이머 후 complete
  useEffect(() => {
    if (phase !== "shaking") return;
    shakeOff.current = shakeOff.current.map(() => ({
      dx: (Math.random() - 0.5) * 0.6,
      dz: (Math.random() - 0.5) * 0.6,
      dry: (Math.random() - 0.5) * 1.2,
    }));
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => {
      shakeOff.current = shakeOff.current.map(() => ({ dx: 0, dz: 0, dry: 0 }));
      onShakeComplete();
    }, 800);
    return () => { if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current); };
  }, [phase, onShakeComplete]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = phaseRef.current;
    const picked = pickedRef.current;
    const hovered = hoveredRef.current;

    for (let i = 0; i < STICK_COUNT; i++) {
      const g = groupRefs.current[i];
      const m = matRefs.current[i];
      if (!g) continue;

      const rest = REST[i];
      const off = shakeOff.current[i];
      const isPicked = picked === i;
      const isHovered = hovered === i && p === "ready";

      // 목표값
      const tx = rest.x + (p === "shaking" ? off.dx : 0);
      const tz = rest.z + (p === "shaking" ? off.dz : 0);
      const ty = isPicked ? 3.2 : 0;
      const try_ = rest.lean;
      const tryy = rest.ry + (p === "shaking" ? off.dry : 0);
      const trz = 0;

      // 스프링 스티프니스
      const k = isPicked ? 4 : p === "shaking" ? 8 : 6;

      cx.current[i] += (tx - cx.current[i]) * Math.min(1, k * dt);
      cy.current[i] += (ty - cy.current[i]) * Math.min(1, (isPicked ? 3 : k) * dt);
      cz.current[i] += (tz - cz.current[i]) * Math.min(1, k * dt);
      crx.current[i] += (try_ - crx.current[i]) * Math.min(1, k * dt);
      cry.current[i] += (tryy - cry.current[i]) * Math.min(1, k * dt);
      crz.current[i] += (trz - crz.current[i]) * Math.min(1, k * dt);

      g.position.set(cx.current[i], cy.current[i], cz.current[i]);
      g.rotation.set(crx.current[i], cry.current[i], crz.current[i]);

      // emissive
      if (m) {
        const eTarget = isPicked ? 0.9 : isHovered ? 0.55 : 0;
        cemit.current[i] += (eTarget - cemit.current[i]) * Math.min(1, 10 * dt);
        m.emissiveIntensity = cemit.current[i];
      }
    }
  });

  const handlePointerOver = useCallback((i: number) => () => {
    hoveredRef.current = i;
  }, []);
  const handlePointerOut = useCallback(() => {
    hoveredRef.current = null;
  }, []);
  const handleClick = useCallback((i: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (phaseRef.current === "ready") onPick(i);
  }, [onPick]);

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.6} color="#ffe8c0" />
      <directionalLight
        position={[5, 10, 6]}
        intensity={1.8}
        color="#ffd070"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 5, -4]} intensity={0.5} color="#a0c0ff" />
      <pointLight position={[0, 6, 0]} intensity={1.0} color="#ff8830" distance={12} decay={2} />

      {/* 바닥 */}
      <mesh position={[0, -CONTAINER_HEIGHT / 2 - 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#160701" roughness={1} />
      </mesh>

      {/* 막대 25개 */}
      {Array.from({ length: STICK_COUNT }).map((_, i) => (
        <group
          key={i}
          ref={(el) => { groupRefs.current[i] = el; }}
          position={[REST[i].x, 0, REST[i].z]}
          rotation={[REST[i].lean, REST[i].ry, 0]}
        >
          <mesh
            castShadow
            onClick={handleClick(i)}
            onPointerOver={handlePointerOver(i)}
            onPointerOut={handlePointerOut}
          >
            <cylinderGeometry args={[STICK_RADIUS, STICK_RADIUS * 0.88, STICK_HEIGHT, 7]} />
            <meshStandardMaterial
              ref={(el) => { matRefs.current[i] = el; }}
              color={BAMBOO_COLORS[i % BAMBOO_COLORS.length]}
              emissive="#f59e0b"
              emissiveIntensity={0}
              roughness={0.72}
              metalness={0.06}
            />
          </mesh>
          {[-1.3, -0.43, 0.43, 1.3].map((y, ki) => (
            <mesh key={ki} position={[0, y, 0]}>
              <torusGeometry args={[STICK_RADIUS + 0.005, 0.008, 5, 7]} />
              <meshStandardMaterial color="#907020" roughness={0.88} />
            </mesh>
          ))}
        </group>
      ))}

      <ContainerMesh />
    </>
  );
}

// ── Canvas 래퍼 ────────────────────────────────────────────
export default function SangajiScene3D(props: SangajiScene3DProps) {
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      camera={{ position: [0, 5, 6.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.2, 0);
      }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
